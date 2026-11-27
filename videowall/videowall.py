#!/usr/bin/env python3
"""
videowall - play an MP4 (or any video) as a live desktop wallpaper on Windows.

How it avoids lag / quality loss:
  * The file is NEVER re-encoded. It is decoded as-is by mpv.
  * mpv uses the GPU's hardware decoder (D3D11VA/NVDEC/etc.) and renders
    straight into a window parented to the desktop (behind the icons).
  * Playback pauses automatically while a fullscreen/maximized app covers the
    monitor, so it costs ~0% GPU/CPU when you can't see it.

Requires: Windows 10/11, Python 3.8+, and mpv.exe (https://mpv.io/installation/
-> "Windows builds"). Put mpv.exe next to this file, in .\\mpv\\, or on PATH.

Usage:
  python videowall.py clip.mp4
  python videowall.py D:\\Wallpapers            (folder = playlist)
  python videowall.py clip.mp4 --volume 20 --fit fill --pause-on maximized
Stop with Ctrl+C (or close the console); the normal wallpaper is restored.
"""
import argparse
import ctypes
import json
import os
import random
import shutil
import subprocess
import sys
import time
from ctypes import wintypes

VIDEO_EXT = {".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v", ".wmv", ".gif"}


# --------------------------------------------------------------------------- #
# Win32 helpers
# --------------------------------------------------------------------------- #
def win32():
    if os.name != "nt":
        sys.exit("videowall only runs on Windows (it embeds into the desktop "
                 "window). Run it on your Windows PC.")
    u = ctypes.WinDLL("user32", use_last_error=True)
    W = wintypes
    u.FindWindowW.restype = W.HWND
    u.FindWindowW.argtypes = [W.LPCWSTR, W.LPCWSTR]
    u.FindWindowExW.restype = W.HWND
    u.FindWindowExW.argtypes = [W.HWND, W.HWND, W.LPCWSTR, W.LPCWSTR]
    u.SendMessageTimeoutW.restype = ctypes.c_void_p
    u.SendMessageTimeoutW.argtypes = [W.HWND, W.UINT, W.WPARAM, W.LPARAM,
                                      W.UINT, W.UINT, ctypes.c_void_p]
    u.CreateWindowExW.restype = W.HWND
    u.CreateWindowExW.argtypes = [W.DWORD, W.LPCWSTR, W.LPCWSTR, W.DWORD,
                                  ctypes.c_int, ctypes.c_int, ctypes.c_int,
                                  ctypes.c_int, W.HWND, W.HMENU, W.HINSTANCE,
                                  W.LPVOID]
    u.DestroyWindow.argtypes = [W.HWND]
    u.MapWindowPoints.argtypes = [W.HWND, W.HWND, ctypes.c_void_p, W.UINT]
    u.GetForegroundWindow.restype = W.HWND
    u.GetWindowRect.argtypes = [W.HWND, ctypes.POINTER(W.RECT)]
    u.GetClassNameW.argtypes = [W.HWND, W.LPWSTR, ctypes.c_int]
    u.IsZoomed.argtypes = [W.HWND]
    u.IsWindowVisible.argtypes = [W.HWND]
    u.MonitorFromWindow.restype = W.HANDLE
    u.MonitorFromWindow.argtypes = [W.HWND, W.DWORD]
    u.SystemParametersInfoW.argtypes = [W.UINT, W.UINT, ctypes.c_void_p, W.UINT]
    u.EnumWindows.argtypes = [ctypes.c_void_p, W.LPARAM]
    u.EnumDisplayMonitors.argtypes = [W.HDC, ctypes.c_void_p,
                                      ctypes.c_void_p, W.LPARAM]
    # Make coordinates real pixels on high-DPI screens.
    try:
        ctypes.WinDLL("shcore").SetProcessDpiAwareness(2)
    except Exception:
        u.SetProcessDPIAware()
    return u


class Monitor:
    def __init__(self, handle, rect, primary):
        self.handle, self.rect, self.primary = handle, rect, primary


def list_monitors(u):
    class MONITORINFO(ctypes.Structure):
        _fields_ = [("cbSize", wintypes.DWORD), ("rcMonitor", wintypes.RECT),
                    ("rcWork", wintypes.RECT), ("dwFlags", wintypes.DWORD)]
    out = []
    CB = ctypes.WINFUNCTYPE(ctypes.c_int, wintypes.HANDLE, wintypes.HDC,
                            ctypes.POINTER(wintypes.RECT), wintypes.LPARAM)

    def cb(hmon, hdc, rc, lp):
        mi = MONITORINFO()
        mi.cbSize = ctypes.sizeof(mi)
        ctypes.WinDLL("user32").GetMonitorInfoW(hmon, ctypes.byref(mi))
        r = mi.rcMonitor
        out.append(Monitor(hmon, (r.left, r.top, r.right, r.bottom),
                           bool(mi.dwFlags & 1)))
        return 1
    u.EnumDisplayMonitors(None, None, ctypes.cast(CB(cb), ctypes.c_void_p), 0)
    out.sort(key=lambda m: (not m.primary, m.rect[0], m.rect[1]))
    return out


def find_workerw(u):
    """Return the desktop window that sits behind the icons."""
    progman = u.FindWindowW("Progman", None)
    # Ask Explorer to spawn the WorkerW layer behind the icons.
    u.SendMessageTimeoutW(progman, 0x052C, 0xD, 0x1, 0, 1000, None)
    u.SendMessageTimeoutW(progman, 0x052C, 0, 0, 0, 1000, None)

    # Windows 11 24H2+: WorkerW is a child of Progman.
    w = u.FindWindowExW(progman, None, "WorkerW", None)
    if w:
        return w

    # Windows 10 / older 11: WorkerW is a top-level sibling after the window
    # that hosts SHELLDLL_DefView (the icons).
    found = []
    CB = ctypes.WINFUNCTYPE(ctypes.c_int, wintypes.HWND, wintypes.LPARAM)

    def cb(hwnd, lp):
        if u.FindWindowExW(hwnd, None, "SHELLDLL_DefView", None):
            found.append(u.FindWindowExW(None, hwnd, "WorkerW", None))
        return 1
    u.EnumWindows(ctypes.cast(CB(cb), ctypes.c_void_p), 0)
    for w in found:
        if w:
            return w
    return progman  # last resort


def make_child(u, parent, rect):
    """Create a child window of `parent` covering screen rect `rect`."""
    l, t, r, b = rect
    pt = (wintypes.POINT * 1)()
    pt[0].x, pt[0].y = l, t
    u.MapWindowPoints(None, parent, ctypes.byref(pt), 1)  # screen -> parent
    WS_CHILD, WS_VISIBLE, WS_CLIPSIBLINGS = 0x40000000, 0x10000000, 0x04000000
    hwnd = u.CreateWindowExW(0, "Static", "videowall",
                             WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS,
                             pt[0].x, pt[0].y, r - l, b - t, parent,
                             None, None, None)
    if not hwnd:
        raise ctypes.WinError(ctypes.get_last_error())
    return hwnd


def covered(u, mon, mode):
    """Is `mon` hidden behind a fullscreen / maximized app?"""
    if mode == "never":
        return False
    fg = u.GetForegroundWindow()
    if not fg or not u.IsWindowVisible(fg):
        return False
    buf = ctypes.create_unicode_buffer(64)
    u.GetClassNameW(fg, buf, 64)
    if buf.value in ("Progman", "WorkerW", "Shell_TrayWnd", "SysListView32"):
        return False
    if u.MonitorFromWindow(fg, 2) != mon.handle:  # MONITOR_DEFAULTTONEAREST
        return False
    if mode == "maximized" and u.IsZoomed(fg):
        return True
    rc = wintypes.RECT()
    u.GetWindowRect(fg, ctypes.byref(rc))
    l, t, r, b = mon.rect
    return rc.left <= l and rc.top <= t and rc.right >= r and rc.bottom >= b


# --------------------------------------------------------------------------- #
# mpv
# --------------------------------------------------------------------------- #
def find_mpv(explicit):
    here = os.path.dirname(os.path.abspath(__file__))
    for c in (explicit, os.path.join(here, "mpv.exe"),
              os.path.join(here, "mpv", "mpv.exe"), shutil.which("mpv")):
        if c and os.path.isfile(c):
            return c
    sys.exit("mpv.exe not found. Download it from https://mpv.io/installation/ "
             "and put it next to videowall.py (or pass --mpv PATH).")


def collect(path):
    if os.path.isdir(path):
        files = sorted(os.path.join(path, f) for f in os.listdir(path)
                       if os.path.splitext(f)[1].lower() in VIDEO_EXT)
        if not files:
            sys.exit(f"No video files in {path}")
        return files
    if not os.path.isfile(path):
        sys.exit(f"Not found: {path}")
    return [path]


class Player:
    def __init__(self, mpv, hwnd, files, a, idx):
        self.pipe = rf"\\.\pipe\videowall-{os.getpid()}-{idx}"
        cmd = [mpv, f"--wid={int(hwnd)}", f"--input-ipc-server={self.pipe}",
               "--no-config", "--idle=no", "--force-window=yes",
               # smooth + cheap: GPU decode straight to the GPU renderer
               "--hwdec=auto-safe", "--vo=gpu", "--gpu-api=d3d11",
               "--video-sync=display-resample", "--interpolation=no",
               "--scale=bilinear", "--cscale=bilinear", "--dscale=bilinear",
               "--cache=yes", "--demuxer-readahead-secs=10",
               "--vd-lavc-threads=0", "--framedrop=vo",
               # behave like a wallpaper, not a player
               "--no-osc", "--no-osd-bar", "--no-input-default-bindings",
               "--no-input-cursor", "--cursor-autohide=no", "--no-terminal",
               "--keepaspect=yes", "--panscan=" + ("1.0" if a.fit == "fill" else "0.0"),
               "--background=#000000", f"--volume={a.volume}",
               "--loop-file=inf" if len(files) == 1 else "--loop-playlist=inf"]
        if a.volume == 0:
            cmd.append("--no-audio")
        cmd += files
        self.proc = subprocess.Popen(cmd, creationflags=0x08000000)  # no console
        self.paused = False

    def alive(self):
        return self.proc.poll() is None

    def set_pause(self, paused):
        if paused == self.paused:
            return
        try:
            with open(self.pipe, "wb", buffering=0) as f:
                f.write((json.dumps({"command": ["set_property", "pause", paused]})
                         + "\n").encode())
            self.paused = paused
        except OSError:
            pass  # pipe not ready yet; retry next tick

    def stop(self):
        if self.alive():
            self.proc.terminate()
            try:
                self.proc.wait(3)
            except subprocess.TimeoutExpired:
                self.proc.kill()


# --------------------------------------------------------------------------- #
def main():
    p = argparse.ArgumentParser(description="Video wallpaper for Windows.")
    p.add_argument("path", help="video file, or a folder of videos")
    p.add_argument("--volume", type=int, default=0, help="0-100 (default 0 = muted)")
    p.add_argument("--fit", choices=["fit", "fill"], default="fill",
                   help="fill = crop to cover screen (default), fit = letterbox")
    p.add_argument("--pause-on", choices=["fullscreen", "maximized", "never"],
                   default="fullscreen", help="pause when a window covers the monitor")
    p.add_argument("--monitors", default="all",
                   help="'all', 'primary', or comma list of indexes e.g. 0,2")
    p.add_argument("--shuffle", action="store_true")
    p.add_argument("--mpv", help="path to mpv.exe")
    a = p.parse_args()

    u = win32()
    mpv = find_mpv(a.mpv)
    files = collect(os.path.abspath(a.path))
    if a.shuffle:
        random.shuffle(files)

    mons = list_monitors(u)
    if a.monitors == "primary":
        mons = mons[:1]
    elif a.monitors != "all":
        mons = [mons[int(i)] for i in a.monitors.split(",")]

    parent = find_workerw(u)
    players, windows = [], []
    try:
        for i, m in enumerate(mons):
            hwnd = make_child(u, parent, m.rect)
            windows.append(hwnd)
            players.append((m, Player(mpv, hwnd, files, a, i)))
        print(f"Playing {len(files)} file(s) on {len(mons)} monitor(s). Ctrl+C to stop.")
        while True:
            time.sleep(0.5)
            for m, pl in players:
                if not pl.alive():
                    return print("mpv exited.")
                pl.set_pause(covered(u, m, a.pause_on))
    except KeyboardInterrupt:
        pass
    finally:
        for _, pl in players:
            pl.stop()
        for h in windows:
            u.DestroyWindow(h)
        # force Explorer to repaint the real wallpaper
        u.SystemParametersInfoW(0x14, 0, None, 3)


if __name__ == "__main__":
    main()

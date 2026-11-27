# videowall

Play an MP4 as your Windows desktop wallpaper — no re-encoding, GPU-decoded, auto-pauses when hidden.

## Setup
1. Install Python 3.8+ (no pip packages needed).
2. Download an mpv Windows build from https://mpv.io/installation/ and put `mpv.exe` next to `videowall.py` (or in `mpv\`, or on PATH).

## Run
```
python videowall.py C:\Videos\loop.mp4
python videowall.py C:\Videos\Wallpapers --shuffle          # folder = playlist
python videowall.py loop.mp4 --volume 15 --fit fit --pause-on maximized
python videowall.py loop.mp4 --monitors primary
```
Ctrl+C stops it and restores your normal wallpaper. Use `pythonw` (or a Startup-folder shortcut) to run without a console.

## Why it's smooth
- The file is decoded as-is (never transcoded or compressed).
- Hardware decode (`--hwdec=auto-safe`) + D3D11 renderer, display-synced frames.
- Pauses per-monitor while a fullscreen/maximized app covers it (`--pause-on`).

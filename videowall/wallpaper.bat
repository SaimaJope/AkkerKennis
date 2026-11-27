@echo off
rem Drag a video (or folder) onto this file to make it your wallpaper.
cd /d "%~dp0"
if "%~1"=="" (echo Drag a video file onto wallpaper.bat & pause & exit /b)

where python >nul 2>&1 || (echo Installing Python... & winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements & echo Done. Close this window and drag the video again. & pause & exit /b)
where mpv >nul 2>&1 || if not exist mpv.exe (echo Installing mpv... & winget install -e --id shinchiro.mpv --silent --accept-package-agreements --accept-source-agreements & echo Done. Close this window and drag the video again. & pause & exit /b)

python videowall.py "%~1" %2 %3 %4 %5 %6
pause

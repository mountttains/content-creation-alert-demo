@echo off
cd /d "%~dp0"
py -3 -m http.server 8766
if errorlevel 1 python -m http.server 8766
pause

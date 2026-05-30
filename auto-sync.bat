@echo off
cd /d "%~dp0"

:loop
git add .
git commit -m "Auto Sync" 2>nul
git push origin main

timeout /t 300
goto loop
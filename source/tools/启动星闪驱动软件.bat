@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
start "" ".\node_modules\electron\dist\electron.exe" ".\electron\main.js"
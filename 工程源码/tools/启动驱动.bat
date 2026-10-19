@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
start http://localhost:5173
call npm run dev
pause
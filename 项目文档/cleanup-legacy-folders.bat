@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "DIRS=dist-release release release-v2 release-v3 release-v4 releases reference_docs"

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo ============================================================
  echo  Need administrator rights to release the locked files.
  echo  A UAC prompt will appear - please click "Yes".
  echo ============================================================
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo ============================================================
echo  Cleaning legacy build folders under:
echo    %ROOT%
echo ============================================================
echo.

echo [1/3] First attempt ...
for %%D in (%DIRS%) do (
  if exist "%ROOT%%%D" (
    rd /s /q "%ROOT%%%D" >nul 2>&1
  )
)

echo [2/3] Second attempt with Windows Search service paused ...
net stop WSearch >nul 2>&1
timeout /t 2 /nobreak >nul
for %%D in (%DIRS%) do (
  if exist "%ROOT%%%D" (
    rd /s /q "%ROOT%%%D" >nul 2>&1
  )
)
net start WSearch >nul 2>&1

echo [3/3] Result :
for %%D in (%DIRS%) do (
  if exist "%ROOT%%%D" (
    echo    [STILL LOCKED] %%D
  ) else (
    echo    [OK deleted  ] %%D
  )
)

echo.
echo ------------------------------------------------------------
echo  If any item is still listed as STILL LOCKED:
echo    1. Close all peripheral driver apps (MCHOSE HUB / EWEADN HUB).
echo    2. Reboot the computer.
echo    3. Run this script again.
echo ------------------------------------------------------------
echo.
pause
endlocal

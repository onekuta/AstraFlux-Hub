@echo off
chcp 65001 >nul
title 星闪悦动 HUB - 清理残留构建目录
echo ============================================
echo   星闪悦动 HUB · 残留构建目录清理
echo ============================================
echo.
echo 本脚本将删除以下残留目录（旧版打包产物）：
echo   - release
echo   - release-v2
echo   - release-v3
echo   - release-v4
echo   - dist-release
echo.
echo 这些目录只剩 app.asar 文件（被系统索引器锁定）。
echo 请以【管理员身份】运行本脚本。
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 当前不是管理员权限！
    echo 请右键本脚本 - 以管理员身份运行。
    pause
    exit /b 1
)

echo [进行中] 正在停止 Windows Search 索引服务...
net stop WSearch >nul 2>&1

echo [进行中] 正在删除残留目录...
cd /d "%~dp0"
for %%D in (release release-v2 release-v3 release-v4 dist-release) do (
    if exist "%%D" (
        rd /s /q "%%D" 2>nul
        if exist "%%D" (
            echo   [失败] %%D 仍被占用
        ) else (
            echo   [成功] 已删除 %%D
        )
    )
)

echo [进行中] 正在重启 Windows Search 索引服务...
net start WSearch >nul 2>&1

echo.
echo ============================================
echo   清理完成！
echo ============================================
pause

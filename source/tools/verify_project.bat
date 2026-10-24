@echo off
chcp 65001 >nul
set PATH=C:\Program Files\nodejs;%PATH%
echo [星闪悦动 HUB] 正在运行工程规范自检与引导程序...
node spec_guide.cjs
pause

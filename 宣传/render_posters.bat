@echo off
chcp 65001 >nul
echo ========================================================
echo   AstraFlux-HUB 宣传海报与视频封面代码渲染工具
echo   (采用 Chrome Headless 纯代码原生光栅化渲染，零 AI 生图)
echo ========================================================
echo.

set CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_BIN% (
    set CHROME_BIN="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

echo [1/7] 正在渲染 视频封面 01 - 极客旗舰版 (1920x1080)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="%~dp0视频封面-01-极客旗舰版-最舒服的星闪驱动.png" "%~dp0cover-v1-performance.html"

echo [2/7] 正在渲染 视频封面 02 - 痛点吐槽版 (1920x1080)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="%~dp0视频封面-02-痛点吐槽版-别再忍受原厂答辩.png" "%~dp0cover-v2-contrast.html"

echo [3/7] 正在渲染 视频封面 03 - 电竞急停版 (1920x1080)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="%~dp0视频封面-03-电竞急停版-急停拉枪快人一步.png" "%~dp0cover-v3-esports.html"

echo [4/7] 正在渲染 视频封面 04 - 生态体验版 (1920x1080)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="%~dp0视频封面-04-生态体验版-这才是国产外设该有的生态.png" "%~dp0cover-v4-ecosystem.html"

echo [5/7] 正在渲染 宣传海报 16:9 (1920x1080)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot="%~dp0海报-16x9-B站与横屏视频封面.png" "%~dp0poster-16x9.html"

echo [6/7] 正在渲染 宣传海报 4:3 (1600x1200)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1600,1200 --screenshot="%~dp0海报-4x3-社区与动态卡片.png" "%~dp0poster-4x3.html"

echo [7/7] 正在渲染 宣传海报 3:4 (1200x1600)...
%CHROME_BIN% --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,1600 --screenshot="%~dp0海报-3x4-小红书与竖屏推荐.png" "%~dp0poster-3x4.html"

echo.
echo ========================================================
echo   全部 7 款宣传物料与封面已渲染完成！
echo ========================================================
pause

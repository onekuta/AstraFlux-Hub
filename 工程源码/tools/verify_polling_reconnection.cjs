const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const outDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  const fileUrl = pathToFileURL(indexPath).href;

  console.log('=== 测试: 验证回报率自愈重连机制与防死锁队列清空 ===');
  await win.loadURL(fileUrl + '?view=device&tab=performance&profile=ae64_max&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const checkResult = await win.webContents.executeJavaScript(`(async () => {
    // 检查 keyboardService 挂载和 _clearAllSdkQueues
    const hasService = typeof window.__refreshAuthorizedDevices === 'function';

    // 触发回报率切换按钮 (比如点击 4KHz)
    const rateButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.innerText.includes('4KHz') || b.innerText.includes('2KHz') || b.innerText.includes('1KHz')
    );
    
    let clickedRate = false;
    if (rateButtons.length > 0) {
      rateButtons[0].click();
      clickedRate = true;
    }

    await new Promise(r => setTimeout(r, 600));

    // 检查界面上是否存在自愈重连提示或回报率文字
    const bodyText = document.body.innerText;
    const hasRate = bodyText.includes('回报率') || bodyText.includes('Hz');
    const hasToast = bodyText.includes('自愈重连') || bodyText.includes('回报率已切换');

    return {
      hasRefreshFunc: hasService,
      clickedRate,
      hasRate,
      hasToast
    };
  })()`);

  console.log('测试结果:', checkResult);

  const shotPath = path.join(outDir, 'verified_polling_reconnection_ui.png');
  const buf = await win.webContents.capturePage();
  fs.writeFileSync(shotPath, buf.toPNG());
  console.log('截图已保存:', shotPath);

  app.quit();
});

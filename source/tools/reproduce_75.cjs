const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  // 1. 75% 配列 + 死区模式 (复现用户图一)
  const url75 = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&profile=sparklink_75&theme=light';
  await win.loadURL(url75);
  await new Promise(r => setTimeout(r, 1800));

  // 点击“死区”预览按钮
  await win.webContents.executeJavaScript(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const deadzoneBtn = buttons.find(b => b.textContent.trim() === '死区');
      if (deadzoneBtn) deadzoneBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgDeadzone75 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'reproduce_user_75_deadzone.png'), imgDeadzone75.toPNG());
  console.log('Saved reproduce_user_75_deadzone.png');

  app.quit();
});

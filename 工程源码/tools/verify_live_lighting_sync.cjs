const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&lightMode=3&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2500);

  // 点击【实时读取物理灯效】切换按钮
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('实时'));
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.textContent.trim() };
      }
      return { clicked: false };
    })()
  `);
  console.log('Click result:', clickRes);
  await sleep(1000);

  // 截取开启后的状态 (按钮高亮变为绿色激活态，提示语变为物理直读待命)
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_live_sync_toggled.png'), img2.toPNG());
  console.log('Saved verified_live_sync_toggled.png');

  const afterState = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('实时'));
      return {
        btnText: btn ? btn.textContent.trim() : null,
        btnClass: btn ? btn.className : null,
        storage: localStorage.getItem('sparklink_live_hw_lighting_sync')
      };
    })()
  `);
  console.log('After state:', afterState);

  app.quit();
});

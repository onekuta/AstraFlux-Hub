const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('console-message', (event, level, message) => {
    console.log('[BROWSER CONSOLE]', message);
  });

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  // 检查并点击 SOCD 卡片
  const res = await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.panel-operation .group'));
      const socdCard = cards.find(c => c.textContent && c.textContent.includes('SOCD'));
      if (!socdCard) return 'SOCD_CARD_NOT_FOUND, total groups: ' + cards.length;
      socdCard.click();
      return 'SOCD_CLICKED';
    })()
  `);
  console.log('ExecuteJS result:', res);
  await new Promise(r => setTimeout(r, 1500));

  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_fixed_socd_clean.png', img.toPNG());
  console.log('Saved SOCD clean shot');

  win.destroy();
  app.quit();
});

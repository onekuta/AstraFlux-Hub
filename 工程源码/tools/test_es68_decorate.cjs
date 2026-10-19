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
      preload: path.join(__dirname, '../electron/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  const fileUrl = pathToFileURL(indexPath).href;

  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1400));

  await win.webContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '装饰灯1');
    if (btn) btn.click();
  })()`);

  for (let i = 0; i < 6; i++) {
    await win.webContents.executeJavaScript(`new Promise(r => requestAnimationFrame(r))`);
    await win.webContents.capturePage();
    await new Promise(r => setTimeout(r, 120));
  }

  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_decorate_es68_dark.png'), img.toPNG());
  console.log('Saved verified_decorate_es68_dark.png');

  app.quit();
});

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

  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=ae64_max&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  // Click 装饰灯1
  await win.webContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '装饰灯1');
    if (btn) btn.click();
  })()`);

  // Drain compositor pipeline
  for (let i = 0; i < 5; i++) {
    await win.webContents.executeJavaScript(`new Promise(r => requestAnimationFrame(r))`);
    await win.webContents.capturePage();
    await new Promise(r => setTimeout(r, 100));
  }

  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'test_ae64_after_click_drained.png'), img.toPNG());
  console.log('Saved test_ae64_after_click_drained.png');

  app.quit();
});

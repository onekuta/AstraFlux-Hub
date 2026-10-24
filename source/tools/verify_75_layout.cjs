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

  const url75 = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&profile=sparklink_75&theme=light';
  await win.loadURL(url75);
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await win.webContents.executeJavaScript(`
    (() => {
      const kbBox = document.querySelector('.relative.select-none.mx-auto');
      const escBtn = kbBox ? kbBox.querySelector('[data-key-id="Escape"]') : null;
      const spaceBtn = kbBox ? kbBox.querySelector('[data-key-id="Space"]') : null;
      const getB = (el) => el ? { w: el.clientWidth, h: el.clientHeight, rect: el.getBoundingClientRect() } : null;
      return {
        kbBox: getB(kbBox),
        escBtn: getB(escBtn),
        spaceBtn: getB(spaceBtn),
        kbUnit: window.__debug_kbUnit
      };
    })()
  `);
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));

  const img75 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_75_layout.png'), img75.toPNG());
  console.log('Saved debug_75_layout.png');

  app.quit();
});

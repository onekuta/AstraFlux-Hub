const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

const BASE_WIDTH = 1380;
const BASE_HEIGHT = 880;

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: BASE_WIDTH, 
    height: BASE_HEIGHT,
    frame: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=trigger&profile=ae64&theme=light`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  // 1. 默认窗口 1380 x 880 (zoom = 1.0)
  win.setSize(1380, 880);
  win.webContents.setZoomFactor(1.0);
  await new Promise(r => setTimeout(r, 800));
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_default_1380.png'), img1.toPNG());
  console.log('Saved test_default_1380.png');

  // 2. 最大化窗口 1920 x 1080
  // scale = Math.max(1.0, Math.min(1920/1380, 1080/880)) = 1.227
  win.setSize(1920, 1080);
  win.webContents.setZoomFactor(1.227);
  await new Promise(r => setTimeout(r, 800));
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_maximized_1920_scaled.png'), img2.toPNG());
  console.log('Saved test_maximized_1920_scaled.png');

  app.quit();
});

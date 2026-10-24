const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  // 1. 无缩放 (重现用户截图 1920x1080 铺满时 UI 偏小)
  const win1 = new BrowserWindow({ 
    show: false, 
    width: 1920, 
    height: 1080,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=trigger&profile=ae64&theme=light`;
  await win1.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const imgUnscaled = await win1.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_1920_unscaled.png'), imgUnscaled.toPNG());
  console.log('Saved test_1920_unscaled.png');

  // 2. 使用 setZoomFactor 等比放大
  // base = 1380 x 880
  // window = 1920 x 1080
  // scaleX = 1920 / 1380 = 1.391
  // scaleY = 1080 / 880 = 1.227
  // scale = Math.max(1.0, Math.min(scaleX, scaleY)) = 1.227
  const scale = Math.max(1.0, Math.min(1920 / 1380, 1080 / 880));
  console.log('Calculated scale factor:', scale);
  win1.webContents.setZoomFactor(scale);
  await new Promise(r => setTimeout(r, 1000));
  const imgZoomFactor = await win1.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_1920_zoomfactor.png'), imgZoomFactor.toPNG());
  console.log('Saved test_1920_zoomfactor.png');

  // 3. 测试 2560 x 1440 (2K 屏满屏)
  const win2K = new BrowserWindow({
    show: false,
    width: 2560,
    height: 1440,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  await win2K.loadURL(url);
  const scale2K = Math.max(1.0, Math.min(2560 / 1380, 1440 / 880));
  console.log('2K scale factor:', scale2K);
  win2K.webContents.setZoomFactor(scale2K);
  await new Promise(r => setTimeout(r, 1500));
  const img2K = await win2K.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_2k_zoomfactor.png'), img2K.toPNG());
  console.log('Saved test_2k_zoomfactor.png');

  app.quit();
});

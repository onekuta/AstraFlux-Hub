const { app, BrowserWindow, ipcMain } = require('electron');
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
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const updateZoom = () => {
    const [w, h] = win.getContentSize();
    // 放大按比例放大，缩小最低保持 1.0 (默认窗口尺寸的比例)
    const scale = Math.max(1.0, Math.min(w / BASE_WIDTH, h / BASE_HEIGHT));
    win.webContents.setZoomFactor(scale);
    return { w, h, scale };
  };

  win.on('resize', updateZoom);

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=trigger&profile=ae64&theme=light`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));

  // 1. 默认窗口 1380 x 880
  const state1 = updateZoom();
  console.log('State at 1380x880:', state1);
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_scale_default_1380.png'), img1.toPNG());

  // 2. 缩小窗口 1260 x 800 -> 保持 scale = 1.0
  win.setContentSize(1260, 800);
  await new Promise(r => setTimeout(r, 800));
  const state2 = updateZoom();
  console.log('State at 1260x800:', state2);
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_scale_shrunk_1260.png'), img2.toPNG());

  // 3. 最大化到 1920 x 1080 -> scale 自动变为 ~1.22
  win.setContentSize(1920, 1080);
  await new Promise(r => setTimeout(r, 800));
  const state3 = updateZoom();
  console.log('State at 1920x1080:', state3);
  const img3 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_scale_maximized_1920.png'), img3.toPNG());

  // 4. 2K 屏 2560 x 1440 -> scale 自动变为 ~1.63
  win.setContentSize(2560, 1440);
  await new Promise(r => setTimeout(r, 800));
  const state4 = updateZoom();
  console.log('State at 2560x1440:', state4);
  const img4 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_scale_2k_2560.png'), img4.toPNG());

  app.quit();
});

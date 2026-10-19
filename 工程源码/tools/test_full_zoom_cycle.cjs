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

  const applyZoom = () => {
    const [w, h] = win.getContentSize();
    const scale = Math.max(1.0, Math.min(w / BASE_WIDTH, h / BASE_HEIGHT));
    win.webContents.setZoomFactor(scale);
    return { w, h, scale };
  };

  win.on('resize', applyZoom);

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=trigger&profile=ae64&theme=light`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));

  // 1. 默认窗口尺寸 1380 x 880
  const z1 = applyZoom();
  console.log('1. Default window 1380x880:', z1);
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_zoom_default_1380.png'), img1.toPNG());

  // 2. 缩小窗口 1260 x 800 (测试“缩小就只能保持默认窗口的那个大小为最小的缩放比例”)
  win.setContentSize(1260, 800);
  await new Promise(r => setTimeout(r, 600));
  const z2 = applyZoom();
  console.log('2. Shrunk window 1260x800:', z2);
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_zoom_shrunk_1260.png'), img2.toPNG());

  // 3. 放大到 1600 x 960 (中等放大)
  win.setContentSize(1600, 960);
  await new Promise(r => setTimeout(r, 600));
  const z3 = applyZoom();
  console.log('3. Enlarged window 1600x960:', z3);
  const img3 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_zoom_enlarged_1600.png'), img3.toPNG());

  // 4. 最大化 1920 x 1080 (1080p 全屏)
  win.setContentSize(1920, 1080);
  await new Promise(r => setTimeout(r, 600));
  const z4 = applyZoom();
  console.log('4. Maximized window 1920x1080:', z4);
  const img4 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_zoom_maximized_1920.png'), img4.toPNG());

  // 5. 还原回默认 1380 x 880
  win.setContentSize(1380, 880);
  await new Promise(r => setTimeout(r, 600));
  const z5 = applyZoom();
  console.log('5. Restored window 1380x880:', z5);
  const img5 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_zoom_restored_1380.png'), img5.toPNG());

  app.quit();
});

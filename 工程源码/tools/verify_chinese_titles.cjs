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
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  // 1. 验证首页设备卡片（对应用户上传图中的江湾 AE64-MAX）
  const homeURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home&theme=light';
  await win.loadURL(homeURL);
  await new Promise(r => setTimeout(r, 1500));
  const homeImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_chinese_titles_home_light.png'), homeImg.toPNG());

  // 2. 验证暗色模式下的首页设备卡片
  const homeDarkURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home&theme=dark';
  await win.loadURL(homeDarkURL);
  await new Promise(r => setTimeout(r, 1500));
  const homeDarkImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_chinese_titles_home_dark.png'), homeDarkImg.toPNG());

  // 3. 验证设备详情页标题栏、左侧状态卡、键盘区标题
  const devURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&profile=ae64&theme=dark';
  await win.loadURL(devURL);
  await new Promise(r => setTimeout(r, 1500));
  const devImg = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_chinese_titles_device_page.png'), devImg.toPNG());

  console.log('All Chinese title verification screenshots successfully captured!');
  app.quit();
});

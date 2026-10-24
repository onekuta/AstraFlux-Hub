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
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false,
    }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS&theme=light&profile=es68';
  console.log('Loading DKS URL:', url);
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));

  // 截图 1: DKS 主配置界面
  const imgMain = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_verified_main_fixed.png'), imgMain.toPNG());
  console.log('Saved dks_verified_main_fixed.png');

  // 加载弹窗模式 (Light)
  const modalUrl = url + '&dks_modal=true';
  console.log('Loading DKS Modal URL:', modalUrl);
  await win.loadURL(modalUrl);
  await new Promise(r => setTimeout(r, 1500));

  // 截图 2: DKS 设置行程弹窗界面 (Light)
  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_verified_modal_fixed.png'), imgModal.toPNG());
  console.log('Saved dks_verified_modal_fixed.png');

  // 暗色主题测试
  const darkUrl = url.replace('theme=light', 'theme=dark');
  await win.loadURL(darkUrl);
  await new Promise(r => setTimeout(r, 1500));
  const imgDarkMain = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_verified_main_dark.png'), imgDarkMain.toPNG());

  await win.loadURL(darkUrl + '&dks_modal=true');
  await new Promise(r => setTimeout(r, 1500));
  const imgDarkModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dks_verified_modal_dark.png'), imgDarkModal.toPNG());
  console.log('Saved dark mode screenshots');

  app.quit();
});

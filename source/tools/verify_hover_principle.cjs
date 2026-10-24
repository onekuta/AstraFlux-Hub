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

  const baseUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + 
    '?view=device&tab=advanced&theme=light&profile=es68';

  // 1. 验证 Overview 界面（独立功能原理按钮已移除，底栏显示悬浮引导）
  console.log('Loading Overview URL:', baseUrl);
  await win.loadURL(baseUrl);
  await new Promise(r => setTimeout(r, 1200));

  const imgOverview = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_advanced_overview_clean.png'), imgOverview.toPNG());
  console.log('Saved verified_advanced_overview_clean.png');

  // 2. 验证 SOCD 悬浮原理浮窗 (Light)
  const hoverUrlLight = baseUrl + '&test_hover=SOCD';
  await win.loadURL(hoverUrlLight);
  await new Promise(r => setTimeout(r, 1200));

  const imgHoverLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_hover_popover_light.png'), imgHoverLight.toPNG());
  console.log('Saved verified_hover_popover_light.png');

  // 3. 验证 SOCD 悬浮原理浮窗 (Dark)
  const hoverUrlDark = baseUrl.replace('theme=light', 'theme=dark') + '&test_hover=SOCD';
  await win.loadURL(hoverUrlDark);
  await new Promise(r => setTimeout(r, 1200));

  const imgHoverDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_hover_popover_dark.png'), imgHoverDark.toPNG());
  console.log('Saved verified_hover_popover_dark.png');

  // 4. 验证 DKS 悬浮原理浮窗
  const hoverUrlDks = baseUrl + '&test_hover=DKS';
  await win.loadURL(hoverUrlDks);
  await new Promise(r => setTimeout(r, 1200));

  const imgHoverDks = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_hover_popover_dks.png'), imgHoverDks.toPNG());
  console.log('Saved verified_hover_popover_dks.png');

  app.quit();
});

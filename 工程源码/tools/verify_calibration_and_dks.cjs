const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && (d.productId === 0x300d || d.productId === 12301));
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 打开校准弹窗并截图
  console.log('[Step 1] 加载校准弹窗并截图...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger&modal=calibration');
  await new Promise(r => setTimeout(r, 3000));

  const calShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_calibration_modal_skyline.png'), calShot.toPNG());
  console.log('已保存校准弹窗截图: verify_calibration_modal_skyline.png');

  // 2. 加载高级按键 DKS 编辑器页面并截图
  console.log('[Step 2] 进入高级按键 DKS 编辑器页面...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS');
  await new Promise(r => setTimeout(r, 2500));

  const dksShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_dks_four_values.png'), dksShot.toPNG());
  console.log('已保存 DKS 页面截图: verify_dks_four_values.png');

  // 3. 点击 DKS 行程设置弹出弹窗并截图
  console.log('[Step 3] 打开 DKS 行程设置弹窗并截图...');
  await win.webContents.executeJavaScript(`
    (() => {
      const travelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('设置行程'));
      if (travelBtn) travelBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const dksModalShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_dks_travel_modal.png'), dksModalShot.toPNG());
  console.log('已保存 DKS 行程弹窗截图: verify_dks_travel_modal.png');

  app.quit();
});

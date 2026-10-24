const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 820,
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

  // 1. 校准弹窗截图 (大尺寸、天际线轴 3.55mm、轴体下拉)
  console.log('[1/4] 验证校准弹窗...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=trigger&modal=calibration');
  await new Promise(r => setTimeout(r, 2500));
  const calShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'final_verify_calibration_modal.png'), calShot.toPNG());
  console.log('✅ 已保存: final_verify_calibration_modal.png');

  // 2. DKS 页面截图 (4 数值、4 动作行、紧凑无滚动条)
  console.log('[2/4] 验证 DKS 页面...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS');
  await new Promise(r => setTimeout(r, 2000));
  const dksShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'final_verify_dks.png'), dksShot.toPNG());
  console.log('✅ 已保存: final_verify_dks.png');

  // 3. RS 迅洁页面截图 (防重叠、间距紧凑)
  console.log('[3/4] 验证 RS 迅洁页面...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=advanced&advanced_view=editor&advanced_tab=RS');
  await new Promise(r => setTimeout(r, 2000));
  const rsShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'final_verify_rs.png'), rsShot.toPNG());
  console.log('✅ 已保存: final_verify_rs.png');

  // 4. 灯效页面截图 (5 列 19 颗矢量官方卡片、上下灯联动按钮、双层涂色动效)
  console.log('[4/4] 验证灯效页面...');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting');
  await new Promise(r => setTimeout(r, 2000));
  const lightShot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'final_verify_lighting.png'), lightShot.toPNG());
  console.log('✅ 已保存: final_verify_lighting.png');

  console.log('🎉 全部截图验证完成！');
  app.quit();
});

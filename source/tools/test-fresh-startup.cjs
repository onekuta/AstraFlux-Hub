const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    console.log('[MAIN select-hid-device] devices count:', details.deviceList.length);
    const vendorDevice = details.deviceList.find(d =>
      d.collections && d.collections.some(c => c.usagePage === 0xffb0 || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff))
    );
    if (vendorDevice) {
      console.log('[MAIN] Selected vendorDevice:', vendorDevice.name);
      callback(vendorDevice.deviceId);
      return;
    }
    const sparklinkDevice = details.deviceList.find(d => [0x1ca6, 7334].includes(d.vendorId));
    if (sparklinkDevice) {
      console.log('[MAIN] Selected sparklinkDevice:', sparklinkDevice.name);
      callback(sparklinkDevice.deviceId);
      return;
    }
    callback(details.deviceList[0]?.deviceId || '');
  });

  win.webContents.on('console-message', (event, level, message) => {
    console.log(`[RENDERER] ${message}`);
  });

  // 加载没有任何参数的主页（模拟用户双击桌面图标启动）
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
  await win.loadURL(url);

  // 等待 2.5 秒
  await new Promise(r => setTimeout(r, 2500));

  const state1 = await win.webContents.executeJavaScript(`({
    currentView: document.querySelector('.app-body') ? 'device' : 'home',
    hasCards: !!document.querySelector('.group'),
    cardText: document.querySelector('.group')?.innerText || 'NO_CARD'
  })`);
  console.log('State at startup:', JSON.stringify(state1, null, 2));

  const shot1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_actual_home_startup.png'), shot1.toPNG());

  // 模拟点击卡片或“立即连接”按钮
  console.log('Simulating click on connect button / card...');
  await win.webContents.executeJavaScript(`
    const card = document.querySelector('.group.relative') || document.querySelector('.group');
    if (card) {
      card.click();
    }
  `);

  await new Promise(r => setTimeout(r, 2000));

  const state2 = await win.webContents.executeJavaScript(`({
    currentView: document.querySelector('.app-body') ? 'device' : 'home',
    title: document.querySelector('.font-title')?.innerText || 'NO_TITLE',
    deviceName: document.querySelector('.device-card span')?.innerText || 'NO_DEV'
  })`);
  console.log('State after click:', JSON.stringify(state2, null, 2));

  const shot2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_actual_home_after_click.png'), shot2.toPNG());

  app.quit();
});

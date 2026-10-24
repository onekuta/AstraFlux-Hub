// 临时：读取已授权 HID 设备信息（开发探测用）
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(ROOT, 'electron', 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  await win.loadFile(path.join(ROOT, 'dist', 'index.html'));
  await new Promise((r) => setTimeout(r, 1500));

  const res = await win.webContents.executeJavaScript(`
    (async () => {
      if (!navigator.hid) return 'NO_HID_API';
      const out = {};
      try {
        const devs = await navigator.hid.getDevices();
        out.granted = devs.map(d => ({
          name: d.productName,
          vid: '0x' + d.vendorId.toString(16),
          pid: '0x' + d.productId.toString(16),
          vidDec: d.vendorId,
          pidDec: d.productId,
          collections: (d.collections || []).length,
          opened: d.opened
        }));
      } catch (e) { out.grantedErr = String(e); }
      return JSON.stringify(out);
    })()
  `);
  console.log('PROBE_RESULT ' + res);
  app.quit();
});

app.on('window-all-closed', () => app.quit());

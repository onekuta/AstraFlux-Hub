const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  let scanned = [];
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    console.log('--- ALL CONNECTED USB HID DEVICES ON USER PC ---');
    details.deviceList.forEach((d, i) => {
      console.log(`[${i}] Name: "${d.name}", VID: 0x${d.vendorId.toString(16)} (${d.vendorId}), PID: 0x${d.productId.toString(16)} (${d.productId}), deviceId: ${d.deviceId}`);
      d.collections.forEach((c, ci) => {
        console.log(`    Col[${ci}]: usagePage=0x${c.usagePage.toString(16)} (${c.usagePage}), usage=0x${c.usage.toString(16)} (${c.usage})`);
      });
    });
    if (details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  const { pathToFileURL } = require('url');
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href);

  await win.webContents.executeJavaScript(`
    const b = document.createElement('button');
    b.id = 'probe-btn';
    b.innerText = 'Probe';
    b.style.position = 'fixed';
    b.style.top = '0';
    b.style.left = '0';
    b.style.width = '100px';
    b.style.height = '100px';
    b.style.zIndex = '999999';
    b.onclick = async () => {
      try {
        const devs = await navigator.hid.requestDevice({ filters: [] });
        window.__probeResult = { success: true, count: devs.length, granted: devs.map(d => ({
          name: d.productName,
          vid: '0x' + d.vendorId.toString(16),
          pid: '0x' + d.productId.toString(16),
          opened: d.opened,
          collections: d.collections
        })) };
      } catch (e) {
        window.__probeResult = { success: false, error: e.message };
      }
    };
    document.body.appendChild(b);
  `);

  win.webContents.sendInputEvent({ type: 'mouseDown', x: 50, y: 50, button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: 50, y: 50, button: 'left', clickCount: 1 });

  await new Promise(r => setTimeout(r, 1500));

  const res = await win.webContents.executeJavaScript(`window.__probeResult`);
  console.log('REQUEST_DEVICE_RESULT:', JSON.stringify(res, null, 2));
  app.quit();
});

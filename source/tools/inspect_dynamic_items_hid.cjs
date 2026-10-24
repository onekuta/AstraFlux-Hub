const { app, BrowserWindow } = require('electron');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && d.productId === 0x300d);
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  await win.loadURL('https://v2-dev.xsyd.top/lighting');
  await new Promise(r => setTimeout(r, 4000));

  const items = await win.webContents.executeJavaScript(`
    (() => {
      const els = document.querySelectorAll('.dynamic-item');
      return Array.from(els).map((el, i) => ({
        index: i,
        text: el.innerText.trim(),
        html: el.outerHTML
      }));
    })()
  `);
  console.log('Dynamic items count:', items.length);
  items.forEach(it => console.log(it.index, it.text));
  app.quit();
});

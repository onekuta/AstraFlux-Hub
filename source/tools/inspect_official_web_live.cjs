const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    console.log('select-hid-device called, count:', details.deviceList.length);
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && d.productId === 0x300d);
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  console.log('Loading https://v2-dev.xsyd.top/lighting ...');
  await win.loadURL('https://v2-dev.xsyd.top/lighting');
  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot of official page loaded
  const shot = await win.capturePage();
  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
  fs.writeFileSync(path.join(artifactDir, 'official_web_lighting_live.png'), shot.toPNG());
  console.log('Saved official_web_lighting_live.png');

  // Inspect DOM of official page
  const pageInfo = await win.webContents.executeJavaScript(`
    (() => {
      const dynamicItems = Array.from(document.querySelectorAll('.dynamic-item')).map((el, idx) => ({
        idx,
        text: el.innerText.trim(),
        className: el.className,
        imgSrc: el.querySelector('img')?.src || ''
      }));
      return {
        title: document.title,
        url: location.href,
        dynamicCount: dynamicItems.length,
        dynamicItems: dynamicItems.slice(0, 20)
      };
    })()
  `);
  console.log('Official Page Info:', JSON.stringify(pageInfo, null, 2));

  app.quit();
});

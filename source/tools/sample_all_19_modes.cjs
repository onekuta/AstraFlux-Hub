const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

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

  const allModeData = {};

  for (let m = 0; m < 19; m++) {
    const label = `L${m + 1}`;
    await win.webContents.executeJavaScript(`
      (() => {
        const els = document.querySelectorAll('.dynamic-item');
        if (els[${m}]) {
          els[${m}].click();
        }
      })()
    `);

    // Let it settle
    await new Promise(r => setTimeout(r, 400));

    // Sample 2 snapshots separated by 500ms
    const frames = [];
    for (let f = 0; f < 2; f++) {
      await new Promise(r => setTimeout(r, 500));
      const frameData = await win.webContents.executeJavaScript(`
        (() => {
          const matrix = [];
          for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 15; c++) {
              const el = document.querySelector(\`.key[data-row="\${r}"][data-col="\${c}"]\`);
              if (el) {
                const comp = window.getComputedStyle(el);
                row.push(comp.getPropertyValue('--key-color').trim() || comp.backgroundColor);
              } else {
                row.push(null);
              }
            }
            matrix.push(row);
          }
          return matrix;
        })()
      `);
      frames.push(frameData);
    }

    allModeData[label] = { mode: m, frames };
    console.log(`Sampled ${label} (mode ${m})`);
  }

  fs.writeFileSync('scratch/all_19_modes_sampled.json', JSON.stringify(allModeData, null, 2));
  console.log('Saved scratch/all_19_modes_sampled.json');
  app.quit();
});

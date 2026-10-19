const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);
  win.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const spark = details.deviceList.find(d => (d.vendorId === 0x1ca6 || d.vendorId === 7334) && d.productId === 0x300d);
    callback(spark ? spark.deviceId : (details.deviceList[0]?.deviceId || ''));
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting');
  await new Promise(r => setTimeout(r, 2000));

  const report = await win.webContents.executeJavaScript(`
    (async () => {
      const ks = window.__KEYBOARD_SERVICE__ || window.keyboardService;
      if (!ks || !ks.connected || !ks.sdk) {
        return { error: 'Keyboard not connected' };
      }

      const results = [];
      // Test modes 0 to 18 (L1 to L19)
      for (let mode = 0; mode <= 18; mode++) {
        // Set mode to keyboard
        try {
          await ks.sdk.setLightingBase({
            area: 'Keyboard',
            config: 'Base',
            lamp: 'SingleLighting',
            data: {
              open: 'Open',
              mode: mode,
              luminance: 100,
              speed: 75,
              direction: 'Forward',
              selectStaticColor: 0 // Rainbow
            }
          });
        } catch (e) {
          results.push({ mode, error: 'setLightingBase failed: ' + e.message });
          continue;
        }

        // Wait a little bit for hardware to run animation
        await new Promise(r => setTimeout(r, 150));

        // Sample 3 frames 250ms apart to see how colors move
        const frames = [];
        for (let f = 0; f < 3; f++) {
          try {
            const raw = await ks.sdk.getLightingCustom({ area: 'Keyboard', rows: 6, cols: 21 });
            if (raw && Array.isArray(raw)) {
              // Extract summary: Esc(0,0), Space(4,6 or 5,6), Enter(2,13), Center(2,7)
              const sample = {
                r0_c0: raw[0]?.[0] ? { R: raw[0][0].R, G: raw[0][0].G, B: raw[0][0].B } : null,
                r0_c10: raw[0]?.[10] ? { R: raw[0][10].R, G: raw[0][10].G, B: raw[0][10].B } : null,
                r2_c7: raw[2]?.[7] ? { R: raw[2][7].R, G: raw[2][7].G, B: raw[2][7].B } : null,
                r4_c6: raw[4]?.[6] ? { R: raw[4][6].R, G: raw[4][6].G, B: raw[4][6].B } : null,
                r2_c13: raw[2]?.[13] ? { R: raw[2][13].R, G: raw[2][13].G, B: raw[2][13].B } : null,
              };
              frames.push(sample);
            }
          } catch (e) {
            frames.push({ err: e.message });
          }
          await new Promise(r => setTimeout(r, 200));
        }

        results.push({ mode, frames });
      }

      return results;
    })()
  `);

  console.log('Sampled all 19 modes from connected keyboard:');
  fs.writeFileSync('hardware_19_modes_sampled.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('Saved to hardware_19_modes_sampled.json');

  app.quit();
});

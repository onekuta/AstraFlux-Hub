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

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  const modesToTest = [
    { label: 'L3', index: 2 },
    { label: 'L6', index: 5 },
    { label: 'L7', index: 6 },
  ];

  for (const m of modesToTest) {
    console.log(`\n=== Testing Mode ${m.label} (index ${m.index}) ===`);
    // Click the card matching text
    await win.webContents.executeJavaScript(`
      (() => {
        const els = document.querySelectorAll('.dynamic-item');
        for (const el of els) {
          if (el.innerText.trim() === '${m.label}') {
            el.click();
            break;
          }
        }
      })()
    `);

    // Sample across 3 time frames
    for (let f = 1; f <= 3; f++) {
      await new Promise(r => setTimeout(r, 800));
      const shot = await win.capturePage();
      const filename = `official_calibrated_${m.label}_frame${f}.png`;
      fs.writeFileSync(path.join(artifactDir, filename), shot.toPNG());
      console.log(`Saved screenshot: ${filename}`);

      // Extract colors from styles or computed styles of row 0 and row 2
      const keyColors = await win.webContents.executeJavaScript(`
        (() => {
          const styleEl = document.getElementById('keyboard-lighting-styles');
          const styleText = styleEl ? styleEl.textContent : '';
          
          // Sample keys: row 0 (Esc, 1, 2, 3...), row 1, row 2...
          const samples = [];
          for (let r = 0; r < 5; r++) {
            const rowSamples = [];
            for (let c = 0; c < 15; c++) {
              const keyEl = document.querySelector(\`.key[data-row="\${r}"][data-col="\${c}"]\`);
              if (keyEl) {
                const comp = window.getComputedStyle(keyEl);
                rowSamples.push({ col: c, color: comp.getPropertyValue('--key-color').trim() || comp.backgroundColor });
              }
            }
            if (rowSamples.length) samples.push({ row: r, keys: rowSamples });
          }
          return { styleLen: styleText.length, samples };
        })()
      `);
      console.log(`Frame ${f} sample colors:`);
      keyColors.samples.forEach(s => {
        const summary = s.keys.slice(0, 8).map(k => `[C${k.col}:${k.color}]`).join(' ');
        console.log(`  Row ${s.row}: ${summary}`);
      });
    }
  }

  app.quit();
});

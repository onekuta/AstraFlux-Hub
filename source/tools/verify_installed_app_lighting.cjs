const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 850,
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

  // Load from local dist/index.html
  await win.loadFile(path.resolve(__dirname, '../dist/index.html'));
  await new Promise(r => setTimeout(r, 2500));

  // Navigate to Lighting tab (RGB灯光设置)
  await win.webContents.executeJavaScript(`
    (() => {
      const tabs = document.querySelectorAll('button, div');
      for (const t of tabs) {
        if (t.innerText && (t.innerText.includes('RGB灯光') || t.innerText.includes('灯光设置'))) {
          t.click();
          break;
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // Test L3, L6, L7 specifically
  const testModes = [
    { label: 'L3', index: 2 },
    { label: 'L6', index: 5 },
    { label: 'L7', index: 6 },
  ];

  for (const tm of testModes) {
    console.log(`\n=== Testing local app Mode ${tm.label} ===`);
    const clickOk = await win.webContents.executeJavaScript(`
      (() => {
        // Find buttons with L1..L19
        const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === '${tm.label}');
        if (btns.length > 0) {
          btns[0].click();
          return { clicked: true, text: btns[0].innerText.trim() };
        }
        return { clicked: false };
      })()
    `);
    console.log('Click result:', clickOk);

    await new Promise(r => setTimeout(r, 800));

    // Capture screenshot
    const shot = await win.capturePage();
    const filename = `verified_local_${tm.label}.png`;
    fs.writeFileSync(path.join(artifactDir, filename), shot.toPNG());
    console.log(`Saved screenshot: ${filename}`);

    // Read colors of sample keys
    const colors = await win.webContents.executeJavaScript(`
      (() => {
        const rows = [];
        for (let r = 0; r < 5; r++) {
          const rowKeys = [];
          for (let c = 0; c < 15; c++) {
            const btn = document.querySelector(\`button[data-key-row="\${r}"][data-key-col="\${c}"]\`)
                     || document.querySelector(\`[data-row="\${r}"][data-col="\${c}"]\`);
            if (btn) {
              rowKeys.push({ col: c, bg: btn.style.backgroundColor || window.getComputedStyle(btn).backgroundColor });
            }
          }
          if (rowKeys.length) rows.push({ row: r, keys: rowKeys });
        }
        return rows;
      })()
    `);

    console.log(`Mode ${tm.label} key colors:`);
    colors.forEach(rk => {
      const summary = rk.keys.slice(0, 6).map(k => `[c${k.col}:${k.bg}]`).join(' ');
      console.log(`  Row ${rk.row}: ${summary}`);
    });
  }

  // Also take a screenshot of L1
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'L1');
      if (btns.length > 0) btns[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));
  const shotL1 = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_local_L1.png'), shotL1.toPNG());
  console.log('Saved verified_local_L1.png');

  app.quit();
});

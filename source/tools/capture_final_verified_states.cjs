const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2000);

  // Helper to ensure GPU / Chromium Compositor flushes frame
  const flushFrame = async () => {
    await win.webContents.executeJavaScript(`
      new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      })
    `);
    await sleep(300);
  };

  const takeFreshScreenshot = async (name) => {
    await flushFrame();
    await win.capturePage(); // discard stale buffer
    await flushFrame();
    const shot = await win.capturePage();
    fs.writeFileSync(path.join(artifactDir, name), shot.toPNG());
    console.log(`[Captured]: ${name}`);
  };

  const clickMode = async (label) => {
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
        if (btn) btn.click();
      })()
    `);
    await flushFrame();
  };

  const clickSwatch = async (idx) => {
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-swatch-index="${idx}"]\`);
        if (btn) btn.click();
      })()
    `);
    await flushFrame();
  };

  // Reset records
  await win.webContents.executeJavaScript(`
    localStorage.removeItem('sparklink_lighting_mode_color_records');
    localStorage.removeItem('sparklink_strip_mode_color_records');
  `);
  await sleep(300);

  // 1. L1 Default Rainbow (no record)
  console.log('Action 1: Click L1');
  await clickMode('L1');
  await takeFreshScreenshot('verified_l1_default_rainbow.png');

  // 2. L1 Yellow (user sets yellow on L1)
  console.log('Action 2: Click Yellow (swatch 2) on L1');
  await clickSwatch(2);
  await takeFreshScreenshot('verified_l1_custom_yellow.png');

  // 3. Switch to L2 (no record -> default rainbow)
  console.log('Action 3: Switch to L2');
  await clickMode('L2');
  await takeFreshScreenshot('verified_l2_default_rainbow.png');

  // 4. Switch back to L1 (has yellow record -> restored yellow)
  console.log('Action 4: Switch back to L1');
  await clickMode('L1');
  await takeFreshScreenshot('verified_l1_restored_yellow.png');

  // 5. In L1, select Rainbow (swatch 0)
  console.log('Action 5: Select Rainbow swatch on L1');
  await clickSwatch(0);
  await takeFreshScreenshot('verified_l1_rainbow_swatch.png');

  // 6. Switch to L3 (no record -> default rainbow)
  console.log('Action 6: Switch to L3');
  await clickMode('L3');
  await takeFreshScreenshot('verified_l3_default_rainbow.png');

  // 7. Switch back to L1 (has rainbow record -> restored rainbow)
  console.log('Action 7: Switch back to L1');
  await clickMode('L1');
  await takeFreshScreenshot('verified_l1_restored_rainbow.png');

  console.log('All fresh screenshots captured!');
  app.quit();
});

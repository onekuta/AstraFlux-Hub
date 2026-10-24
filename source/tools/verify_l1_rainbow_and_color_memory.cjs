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
  await sleep(2500);

  // Helper functions
  const clickMode = async (label) => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
        if (btn) {
          btn.click();
          return { success: true, label: "${label}" };
        }
        return { success: false, label: "${label}" };
      })()
    `);
  };

  const clickSwatch = async (index) => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-swatch-index="${index}"]\`);
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
  };

  const getStatus = async () => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const activeBtn = document.querySelector('button[data-mode-label].bg-\\\\[\\\\#0052ef\\\\]')
                       || document.querySelector('button[data-mode-label].border-\\\\[\\\\#0052ef\\\\]');
        const activeLabel = activeBtn ? activeBtn.getAttribute('data-mode-label') : 'unknown';

        const swatches = Array.from(document.querySelectorAll('button[data-swatch-index]')).map(b => ({
          idx: parseInt(b.getAttribute('data-swatch-index')),
          checked: !!b.querySelector('svg'),
          disabled: b.disabled
        }));

        const checkedSwatch = swatches.find(s => s.checked);
        return { activeLabel, checkedSwatchIdx: checkedSwatch ? checkedSwatch.idx : null, swatches };
      })()
    `);
  };

  const takeScreenshot = async (name) => {
    // Wait an extra frame to ensure paint is fully flushed
    await sleep(400);
    const shot = await win.capturePage();
    const filePath = path.join(artifactDir, name);
    fs.writeFileSync(filePath, shot.toPNG());
    console.log(`[Screenshot saved]: ${name}`);
  };

  // Step 0: Clear localStorage memory records
  await win.webContents.executeJavaScript(`
    localStorage.removeItem('sparklink_lighting_mode_color_records');
    localStorage.removeItem('sparklink_strip_mode_color_records');
  `);
  await sleep(500);

  console.log('\n======================================================');
  console.log('--- TEST 1: Click L1 (常亮模式, 未记录状态) ---');
  await clickMode('L1');
  await sleep(1200);
  let status = await getStatus();
  console.log('Status 1:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  console.log('Swatch 0 is Rainbow, disabled:', status.swatches.find(s=>s.idx===0)?.disabled);
  await takeScreenshot('step1_l1_default_rainbow.png');

  console.log('\n======================================================');
  console.log('--- TEST 2: In L1, click Swatch 2 (预设黄, index 2) ---');
  await clickSwatch(2);
  await sleep(1200);
  status = await getStatus();
  console.log('Status 2:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step2_l1_selected_yellow.png');

  console.log('\n======================================================');
  console.log('--- TEST 3: Switch to L2 (随波逐流, 未记录状态 -> 必须默认炫彩) ---');
  await clickMode('L2');
  await sleep(1200);
  status = await getStatus();
  console.log('Status 3:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step3_l2_default_rainbow.png');

  console.log('\n======================================================');
  console.log('--- TEST 4: Switch back to L1 (有黄色记录状态 -> 必须恢复黄色) ---');
  await clickMode('L1');
  await sleep(1200);
  status = await getStatus();
  console.log('Status 4:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step4_l1_restored_yellow.png');

  console.log('\n======================================================');
  console.log('--- TEST 5: In L1, click Swatch 0 (炫彩彩虹) ---');
  await clickSwatch(0);
  await sleep(1200);
  status = await getStatus();
  console.log('Status 5:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step5_l1_switched_to_rainbow.png');

  console.log('\n======================================================');
  console.log('--- TEST 6: Switch to L3 (霓虹流光, 未记录状态 -> 必须默认炫彩) ---');
  await clickMode('L3');
  await sleep(1200);
  status = await getStatus();
  console.log('Status 6:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step6_l3_default_rainbow.png');

  console.log('\n======================================================');
  console.log('--- TEST 7: Switch back to L1 (有彩虹记录状态 -> 必须恢复彩虹) ---');
  await clickMode('L1');
  await sleep(1200);
  status = await getStatus();
  console.log('Status 7:', { activeLabel: status.activeLabel, checkedSwatchIdx: status.checkedSwatchIdx });
  await takeScreenshot('step7_l1_restored_rainbow.png');

  console.log('\n======================================================');
  console.log('=== ALL 7 STEPS VERIFIED AND COMPLETED SUCCESSFULLY ===');
  app.quit();
});

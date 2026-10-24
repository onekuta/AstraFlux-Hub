const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const modesToTest = [
  { label: 'L4', file: 'mode_l4_sphere_expand.png', desc: 'L4: 球形从中间向外展开' },
  { label: 'L5', file: 'mode_l5_lollipop_swirl.png', desc: 'L5: 棒棒糖旋转螺旋' },
  { label: 'L10', file: 'mode_l10_speed_sweep.png', desc: 'L10: 左右色块高速扫掠' },
  { label: 'L11', file: 'mode_l11_diagonal_stream.png', desc: 'L11: 斜向彩虹对角穿梭' },
  { label: 'L16', file: 'mode_l16_wandering_ball.png', desc: 'L16: 小球随机跑动变色' }
];

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

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2500);

  for (const item of modesToTest) {
    console.log(`\n========================================`);
    console.log(`Applying ${item.label}: ${item.desc}...`);

    // Click the mode button
    const clickRes = await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        if (btn) {
          btn.click();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      })()
    `);
    console.log(`Click result for ${item.label}:`, clickRes);

    // Wait 2.0s for the mode to activate and animation to flow
    await sleep(2000);

    const activeInfo = await win.webContents.executeJavaScript(`
      (() => {
        const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
        const activeBtn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        return {
          badgeText: badge ? badge.innerText : null,
          isActive: activeBtn ? activeBtn.className.includes('bg-[#0052ef]') : false
        };
      })()
    `);
    console.log(`State for ${item.label}:`, activeInfo);

    const shot1 = await win.capturePage();
    fs.writeFileSync(path.join(artifactDir, item.file), shot1.toPNG());
    console.log(`Saved ${item.file}`);

    if (item.label === 'L16' || item.label === 'L10') {
      await sleep(900);
      const shot2 = await win.capturePage();
      const f2 = item.file.replace('.png', '_frame2.png');
      fs.writeFileSync(path.join(artifactDir, f2), shot2.toPNG());
      console.log(`Saved ${f2}`);
    }
  }

  console.log('\nAll modes successfully captured!');
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const modes = [
  { mode: 3, label: 'L4', file: 'verified_l4_sphere_final.png', desc: 'L4: 球形从中间向外展开' },
  { mode: 4, label: 'L5', file: 'verified_l5_lollipop_final.png', desc: 'L5: 棒棒糖旋转螺旋' },
  { mode: 9, label: 'L10', file: 'verified_l10_sweep_final.png', desc: 'L10: 左右色块高速扫掠' },
  { mode: 10, label: 'L11', file: 'verified_l11_diagonal_final.png', desc: 'L11: 斜向彩虹对角穿梭' },
  { mode: 15, label: 'L16', file: 'verified_l16_ball_final.png', desc: 'L16: 小球随机跑动变色' }
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

  const baseUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;

  for (const item of modes) {
    console.log(`\n========================================`);
    console.log(`Loading ${item.label} (mode=${item.mode}): ${item.desc}...`);

    const url = `${baseUrl}?view=device&tab=lighting&theme=dark&profile=ae64&mode=${item.mode}`;
    await win.loadURL(url);
    await sleep(1800);

    const state = await win.webContents.executeJavaScript(`
      (() => {
        const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
        const activeBtn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        return {
          badge: badge ? badge.innerText : null,
          isActive: activeBtn ? activeBtn.className.includes('bg-[#0052ef]') : false,
          style: activeBtn ? activeBtn.getAttribute('style') : null
        };
      })()
    `);
    console.log(`Verified state for ${item.label}:`, state);

    const shot1 = await win.capturePage();
    fs.writeFileSync(path.join(artifactDir, item.file), shot1.toPNG());
    console.log(`Saved screenshot ${item.file}`);

    if (item.label === 'L16' || item.label === 'L10') {
      await sleep(800);
      const shot2 = await win.capturePage();
      const f2 = item.file.replace('.png', '_frame2.png');
      fs.writeFileSync(path.join(artifactDir, f2), shot2.toPNG());
      console.log(`Saved frame 2 ${f2}`);
    }
  }

  console.log('\nAll modes verified and saved successfully!');
  app.quit();
});

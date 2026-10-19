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

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2000);

  const testList = [
    { label: 'L4', name: 'verified_l4_sphere_expand.png', desc: 'L4: 球形从中间向外展开动画' },
    { label: 'L5', name: 'verified_l5_lollipop_spin.png', desc: 'L5: 棒棒糖旋转螺旋动画' },
    { label: 'L10', name: 'verified_l10_fast_sweep.png', desc: 'L10: 左右移动到尽头切换色块(速度对齐)' },
    { label: 'L11', name: 'verified_l11_diagonal_stream.png', desc: 'L11: 斜向彩虹对角穿梭动画' },
    { label: 'L16', name: 'verified_l16_wandering_ball.png', desc: 'L16: 小球随机跑动然后变色动画' }
  ];

  for (const item of testList) {
    console.log(`\n========================================`);
    console.log(`Testing and capturing ${item.label} (${item.desc})...`);

    // 触发模式切换
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `);

    // 等待动画帧更新
    await sleep(1200);

    const info = await win.webContents.executeJavaScript(`
      (() => {
        const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
        const activeBtn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        return {
          badge: badge ? badge.innerText : null,
          btnStyle: activeBtn ? activeBtn.getAttribute('style') : null
        };
      })()
    `);
    console.log(`Current state for ${item.label}:`, info);

    const shot = await win.capturePage();
    const outPath = path.join(artifactDir, item.name);
    fs.writeFileSync(outPath, shot.toPNG());
    console.log(`Saved screenshot to ${outPath}`);

    // 对 L16 和 L10 额外抓取一帧以展示连续运动/跑动
    if (item.label === 'L16' || item.label === 'L10') {
      await sleep(700);
      const shot2 = await win.capturePage();
      const frame2Name = item.name.replace('.png', '_frame2.png');
      fs.writeFileSync(path.join(artifactDir, frame2Name), shot2.toPNG());
      console.log(`Saved frame 2 to ${frame2Name}`);
    }
  }

  console.log('\nAll captures completed successfully!');
  app.quit();
});

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
  await sleep(2500);

  const testList = [
    { label: 'L4', name: 'precise_l4_sphere_expand.png', desc: 'L4: 球形从中间向外展开' },
    { label: 'L5', name: 'precise_l5_lollipop_swirl.png', desc: 'L5: 棒棒糖旋转螺旋' },
    { label: 'L10', name: 'precise_l10_speed_sweep.png', desc: 'L10: 左右色块高速扫掠' },
    { label: 'L11', name: 'precise_l11_diagonal_stream.png', desc: 'L11: 斜向彩虹对角穿梭' },
    { label: 'L16', name: 'precise_l16_wandering_ball.png', desc: 'L16: 小球随机跑动变色' }
  ];

  for (const item of testList) {
    console.log(`\n========================================`);
    console.log(`Applying and verifying ${item.label} (${item.desc})...`);

    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        if (btn) btn.click();
      })()
    `);

    // 严密门禁：必须等待 Badge 文本和激活样式彻底更新为当前目标模式！
    await win.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const check = () => {
          const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
          const btn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
          const isActive = btn && btn.className.includes('bg-[#0052ef]');
          if (badge && badge.innerText.includes('${item.label}') && isActive) {
            resolve();
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      })
    `);

    // 给动画持续运行 600ms 以便形成鲜活的动效帧
    await sleep(600);

    const shot1 = await win.capturePage();
    fs.writeFileSync(path.join(artifactDir, item.name), shot1.toPNG());
    console.log(`Captured frame 1 for ${item.label}: ${item.name}`);

    // 再等 700ms 抓取 frame 2
    await sleep(700);
    const shot2 = await win.capturePage();
    const frame2Name = item.name.replace('.png', '_frame2.png');
    fs.writeFileSync(path.join(artifactDir, frame2Name), shot2.toPNG());
    console.log(`Captured frame 2 for ${item.label}: ${frame2Name}`);
  }

  console.log('\nAll precise captures completed successfully!');
  app.quit();
});

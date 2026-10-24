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

  const switchToMode = async (label) => {
    // 触发点击
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
        if (btn) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
      })()
    `);

    // 循环等待直到 badge 明确显示该模式
    for (let i = 0; i < 30; i++) {
      const isReady = await win.webContents.executeJavaScript(`
        (() => {
          const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
          return badge && badge.innerText.includes("${label}");
        })()
      `);
      if (isReady) break;
      await sleep(100);
    }
    // 留出充分的渲染与动画合成时间
    await sleep(1200);
  };

  const capture = async (filename) => {
    const shot = await win.capturePage();
    const filePath = path.join(artifactDir, filename);
    fs.writeFileSync(filePath, shot.toPNG());
    console.log(`[Captured]: ${filename}`);
  };

  // 1. 验证 L3 (往下渐变流动的动画)
  console.log('\n--- Switching to L3 (往下渐变流动的动画) ---');
  await switchToMode('L3');
  await capture('final_l3_downward_gradient.png');

  // 2. 验证 L6 (炫彩旋转风车动画)
  console.log('\n--- Switching to L6 (炫彩旋转风车动画) ---');
  await switchToMode('L6');
  await capture('final_l6_rainbow_spin.png');

  // 3. 验证 L7 (从键盘边缘的中间向外扩展动画)
  console.log('\n--- Switching to L7 (从键盘边缘的中间向外扩展动画) ---');
  await switchToMode('L7');
  await capture('final_l7_center_outward.png');

  // 4. 验证 L10 (左右移动然后到尽头切换色块动画)
  console.log('\n--- Switching to L10 (左右移动然后到尽头切换色块动画) ---');
  await switchToMode('L10');
  await capture('final_l10_block_sweep_frame1.png');
  await sleep(1400); // 等待扫描线移动
  await capture('final_l10_block_sweep_frame2.png');

  console.log('\nAll 4 modes verified and captured!');
  app.quit();
});

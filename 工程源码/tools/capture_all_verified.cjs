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
    { label: 'L3', name: 'verified_final_l3.png', desc: 'L3: 往下渐变流动动画' },
    { label: 'L6', name: 'verified_final_l6.png', desc: 'L6: 炫彩旋转风车动画' },
    { label: 'L7', name: 'verified_final_l7.png', desc: 'L7: 从键盘边缘的中间向外扩展动画' },
    { label: 'L10', name: 'verified_final_l10.png', desc: 'L10: 左右移动然后到尽头切换色块动画' }
  ];

  for (const item of testList) {
    console.log(`\n========================================`);
    console.log(`Testing and capturing ${item.label} (${item.desc})...`);

    // 触发点击
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${item.label}"]\`);
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `);

    // 等待模式切换生效
    await sleep(1500);

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
    const filePath = path.join(artifactDir, item.name);
    fs.writeFileSync(filePath, shot.toPNG());
    console.log(`Saved screenshot: ${item.name}`);
  }

  // 针对 L10 额外多采样一帧展示左右扫块进度
  console.log('\nWaiting for L10 boundary sweep progression...');
  await sleep(1500);
  const shotL10_2 = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_final_l10_progress.png'), shotL10_2.toPNG());
  console.log('Saved screenshot: verified_final_l10_progress.png');

  console.log('\nAll 4 modes captured with final verified states!');
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function testSingleMode(label, outName) {
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

  // 点击目标模式
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
      if (btn) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return { ok: true, label: "${label}" };
      }
      return { ok: false };
    })()
  `);
  console.log(`[${label}] Click result:`, clickRes);

  // 等待 2.5 秒，让渲染与动画完全生效
  await sleep(2500);

  const status = await win.webContents.executeJavaScript(`
    (() => {
      const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
      const activeBtn = document.querySelector(\`button[data-mode-label="${label}"]\`);
      return {
        badgeText: badge ? badge.innerText : '',
        btnClass: activeBtn ? activeBtn.className : '',
        btnStyle: activeBtn ? activeBtn.getAttribute('style') : ''
      };
    })()
  `);
  console.log(`[${label}] Status after wait:`, status);

  const shot = await win.capturePage();
  const filePath = path.join(artifactDir, outName);
  fs.writeFileSync(filePath, shot.toPNG());
  console.log(`[${label}] Screenshot saved: ${outName}`);

  win.close();
}

app.whenReady().then(async () => {
  console.log('Testing L3 (往下渐变流动的动画)...');
  await testSingleMode('L3', 'single_test_l3.png');

  console.log('\nTesting L6 (炫彩旋转风车动画)...');
  await testSingleMode('L6', 'single_test_l6.png');

  console.log('\nTesting L7 (从键盘边缘的中间向外扩展动画)...');
  await testSingleMode('L7', 'single_test_l7.png');

  console.log('\nTesting L10 (左右移动然后到尽头切换色块动画)...');
  await testSingleMode('L10', 'single_test_l10.png');

  console.log('\nAll isolated tests finished!');
  app.quit();
});

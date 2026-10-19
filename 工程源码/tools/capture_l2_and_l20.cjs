const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await sleep(1500);

  // 1. 默认 L2 随波逐流动态演示截图
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'step1_mode_l2_wave.png'), img.toPNG());
  console.log('1. Saved step1_mode_l2_wave.png');

  // 2. 切换到 L20 自定义涂色，并涂色 WASD
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l20 = btns.find(b => b.textContent.includes('L20') && b.textContent.includes('自定义'));
      if (l20) l20.click();
    })()
  `);
  await sleep(500);

  // 涂色 W, A, S, D
  await win.webContents.executeJavaScript(`
    (() => {
      const keys = Array.from(document.querySelectorAll('button')).filter(b => b.title && b.title.includes('物理灯珠'));
      ['W', 'A', 'S', 'D'].forEach(letter => {
        const k = keys.find(b => b.textContent.trim().toUpperCase() === letter);
        if (k) {
          k.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
        }
      });
    })()
  `);
  await sleep(500);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'step2_mode_l20_wasd_custom.png'), img.toPNG());
  console.log('2. Saved step2_mode_l20_wasd_custom.png');

  // 3. 点击 L3 呼吸模式，验证动态演示动效完全不受自定义涂色阻塞
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l3 = btns.find(b => b.textContent.includes('L3') && b.textContent.includes('呼吸'));
      if (l3) l3.click();
    })()
  `);
  await sleep(500);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'step3_mode_l3_breathing.png'), img.toPNG());
  console.log('3. Saved step3_mode_l3_breathing.png');

  // 4. 切回 L20 自定义涂色，验证 WASD 涂色完好保存无损恢复
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l20 = btns.find(b => b.textContent.includes('L20') && b.textContent.includes('自定义'));
      if (l20) l20.click();
    })()
  `);
  await sleep(500);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'step4_mode_l20_restored.png'), img.toPNG());
  console.log('4. Saved step4_mode_l20_restored.png');

  app.quit();
});

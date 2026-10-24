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
  await sleep(1200);

  // 1. 抓取随波逐流动态帧
  let img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dynamic_mode_l2.png'), img.toPNG());
  console.log('1. Saved verify_dynamic_mode_l2.png');

  // 2. 点击 L20 自定义涂色
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l20 = btns.find(b => b.textContent.includes('L20') && b.textContent.includes('自定义涂色'));
      if (l20) l20.click();
    })()
  `);
  await sleep(400);

  // 3. 在键盘上点击几个按键进行自定义涂色 (如 W, A, S, D)
  await win.webContents.executeJavaScript(`
    (() => {
      const keys = Array.from(document.querySelectorAll('button')).filter(b => b.title && b.title.includes('物理灯珠'));
      // 点击前 4 个按键
      for (let i = 0; i < 4 && i < keys.length; i++) {
        keys[i].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
      }
    })()
  `);
  await sleep(400);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_custom_painted_l20.png'), img.toPNG());
  console.log('2. Saved verify_custom_painted_l20.png');

  // 4. 再次点击 L3 呼吸模式，验证动态演示动效完全不受自定义涂色阻塞
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const l3 = btns.find(b => b.textContent.includes('L3') && b.textContent.includes('呼吸模式'));
      if (l3) l3.click();
    })()
  `);
  await sleep(500);

  img = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_dynamic_mode_l3_breathing.png'), img.toPNG());
  console.log('3. Saved verify_dynamic_mode_l3_breathing.png');

  app.quit();
});

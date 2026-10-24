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

  // 加载灯光页
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await sleep(1000);

  // 抓取第 1 帧
  let img1 = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_anim_frame1.png'), img1.toPNG());
  console.log('Saved frame 1');

  // 等待 500ms
  await sleep(500);

  // 抓取第 2 帧 (随波逐流彩虹流动)
  let img2 = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_anim_frame2.png'), img2.toPNG());
  console.log('Saved frame 2');

  // 在页面内点击 L20 自定义涂色，并测试涂色
  await win.webContents.executeJavaScript(`
    const btns = Array.from(document.querySelectorAll('button'));
    const l20Btn = btns.find(b => b.textContent.includes('L20') || b.textContent.includes('自定义涂色'));
    if (l20Btn) l20Btn.click();
  `);
  await sleep(600);

  let img3 = await win.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_l20_custom.png'), img3.toPNG());
  console.log('Saved L20 custom view');

  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const urlAdvanced = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(urlAdvanced);
  await new Promise(r => setTimeout(r, 1500));

  // 1. 点击 SOCD 卡片
  console.log('Step 1: Clicking SOCD card...');
  const cardRect = await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="SOCD"]');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  if (!cardRect) {
    console.error('SOCD card not found!');
    process.exit(1);
  }
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });

  // 等待 SOCD 编辑器渲染完成
  while (true) {
    const ok = await win.webContents.executeJavaScript('!!document.querySelector(\'[data-slot-id="socd_bind1"]\')');
    if (ok) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 600));

  // 截图 1: SOCD 1:1 主页面排布 (对标用户图 media_1792237335658_f7de341d.png)
  const imgPage = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_socd_editor_clean.png'), imgPage.toPNG());
  console.log('Saved verify_socd_editor_clean.png');

  // 2. 点击 0ms 虚线下划线按钮打开延迟时间弹窗
  console.log('Step 2: Clicking 0ms delay button in SOCD...');
  const btnPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('0ms'));
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  if (!btnPos) {
    console.error('0ms delay button not found in SOCD!');
    process.exit(1);
  }
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 800));

  // 截图 2: SOCD 延迟时间弹窗 (对标用户图 media_1792237337826_fb4d49ef.png)
  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_socd_modal_clean.png'), imgModal.toPNG());
  console.log('Saved verify_socd_modal_clean.png');

  win.close();
  app.quit();
});

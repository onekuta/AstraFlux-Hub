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

  // 1. 点击 RS 卡片
  console.log('Step 1: Clicking RS card...');
  const cardRect = await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="RS"]');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  if (!cardRect) {
    console.error('RS card not found!');
    process.exit(1);
  }
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });

  // 等待 RS 编辑器渲染完成
  while (true) {
    const ok = await win.webContents.executeJavaScript('!!document.querySelector(\'[data-slot-id="rs_bind1"]\')');
    if (ok) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 600));

  // 截图 1: RS 1:1 主页面排布 (对标用户图 media_1792219667737_7548ef07.png)
  const imgPage = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_rs_editor_clean.png'), imgPage.toPNG());
  console.log('Saved verify_rs_editor_clean.png');

  // 2. 点击 0ms 虚线下划线按钮打开延迟时间弹窗
  console.log('Step 2: Clicking 0ms delay button...');
  const btnPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('0ms'));
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  if (!btnPos) {
    console.error('0ms delay button not found!');
    process.exit(1);
  }
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 800));

  // 截图 2: 延迟时间弹窗 (对标用户图 media_1792219673281_d1a82cb7.png)
  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_rs_modal_clean.png'), imgModal.toPNG());
  console.log('Saved verify_rs_modal_clean.png');

  // 3. 在数字框中键入 80 并确认
  console.log('Step 3: Setting delay to 80ms and confirming...');
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('input[type="number"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '80');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `);
  await new Promise(r => setTimeout(r, 400));

  const confirmBtnPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '确认');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(confirmBtnPos.x), y: Math.round(confirmBtnPos.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(confirmBtnPos.x), y: Math.round(confirmBtnPos.y), button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 800));

  // 截图 3: 延迟时间已成功更新为 80ms
  const imgUpdated = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_rs_after_confirm.png'), imgUpdated.toPNG());
  console.log('Saved verify_rs_after_confirm.png');

  // 4. 切换为暗色主题
  console.log('Step 4: Switching to dark theme...');
  const themeBtnPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = document.querySelector('button[title="切换深浅色主题"]');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  if (themeBtnPos) {
    win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(themeBtnPos.x), y: Math.round(themeBtnPos.y), button: 'left', clickCount: 1 });
    win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(themeBtnPos.x), y: Math.round(themeBtnPos.y), button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 600));
  }

  // 截图 4: 暗色主题下的 RS 界面
  const imgDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_rs_dark_theme.png'), imgDark.toPNG());
  console.log('Saved verify_rs_dark_theme.png');

  win.close();
  app.quit();
});

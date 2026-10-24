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

  // 1. 点击 MT 卡片
  console.log('Step 1: Clicking MT card...');
  const cardRect = await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="MT"]');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(cardRect.x), y: Math.round(cardRect.y), button: 'left', clickCount: 1 });

  // 等待 MT 编辑器渲染完成
  while (true) {
    const ok = await win.webContents.executeJavaScript('!!document.querySelector(\'[data-slot-id="mt_bind"]\')');
    if (ok) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 600));

  // 截图 1: MT 独立 1:1 页面排布
  const imgPage = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_1to1_page.png'), imgPage.toPNG());
  console.log('Saved verify_mt_1to1_page.png');

  // 2. 点击 200ms 虚线下划线按钮
  console.log('Step 2: Clicking 200ms button...');
  const btnPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('200ms'));
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(btnPos.x), y: Math.round(btnPos.y), button: 'left', clickCount: 1 });

  // 等待触发时间 Modal 弹窗渲染完成
  while (true) {
    const ok = await win.webContents.executeJavaScript('!!document.querySelector(\'input[type="number"]\')');
    if (ok) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 600));

  // 截图 2: 触发时间弹窗
  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_1to1_modal.png'), imgModal.toPNG());
  console.log('Saved verify_mt_1to1_modal.png');

  // 3. 在数字框中键入 350 并点击确认
  console.log('Step 3: Typing 350 and confirming...');
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('input[type="number"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '350');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `);
  await new Promise(r => setTimeout(r, 300));

  const confirmPos = await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '确认');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);
  win.webContents.sendInputEvent({ type: 'mouseDown', x: Math.round(confirmPos.x), y: Math.round(confirmPos.y), button: 'left', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: Math.round(confirmPos.x), y: Math.round(confirmPos.y), button: 'left', clickCount: 1 });

  // 等待 Modal 关闭
  while (true) {
    const gone = await win.webContents.executeJavaScript('!document.querySelector(\'input[type="number"]\')');
    if (gone) break;
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 600));

  // 截图 3: 数值已更新为 350ms
  const imgUpdated = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_1to1_updated.png'), imgUpdated.toPNG());
  console.log('Saved verify_mt_1to1_updated.png');

  app.quit();
});

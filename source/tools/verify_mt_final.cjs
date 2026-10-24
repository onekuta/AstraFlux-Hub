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

  // 1. 进入 MT 编辑模式
  console.log('Entering MT editor...');
  await win.webContents.executeJavaScript(`
    const card = document.querySelector('[data-mode-id="MT"]');
    if (card) {
      const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
      if (propKey && card[propKey].onClick) {
        card[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      }
    }
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 截图 1: MT 1:1 主页面排布
  const imgPage = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_editor_clean.png'), imgPage.toPNG());
  console.log('Saved verify_mt_editor_clean.png');

  // 2. 点击 200ms 按钮打开弹窗
  console.log('Opening time modal...');
  await win.webContents.executeJavaScript(`
    const timeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('200ms'));
    if (timeBtn) {
      const propKey = Object.keys(timeBtn).find(k => k.startsWith('__reactProps'));
      if (propKey && timeBtn[propKey].onClick) {
        timeBtn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      } else {
        timeBtn.click();
      }
    }
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截图 2: 触发时间弹窗 (对标 Image 2)
  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_modal_clean.png'), imgModal.toPNG());
  console.log('Saved verify_mt_modal_clean.png');

  // 3. 在输入框键入 350 并确认
  console.log('Setting time to 350ms and confirming...');
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('input[type="number"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '350');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `);
  await new Promise(r => setTimeout(r, 400));

  await win.webContents.executeJavaScript(`
    const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '确认');
    if (confirmBtn) {
      const propKey = Object.keys(confirmBtn).find(k => k.startsWith('__reactProps'));
      if (propKey && confirmBtn[propKey].onClick) {
        confirmBtn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      } else {
        confirmBtn.click();
      }
    }
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截图 3: 触发时间已成功更新为 350ms
  const imgUpdated = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_after_confirm.png'), imgUpdated.toPNG());
  console.log('Saved verify_mt_after_confirm.png');

  // 4. 切换为暗色主题
  await win.webContents.executeJavaScript(`
    const themeBtn = document.querySelector('button[title="切换深浅色主题"]');
    if (themeBtn) {
      const propKey = Object.keys(themeBtn).find(k => k.startsWith('__reactProps'));
      if (propKey && themeBtn[propKey].onClick) {
        themeBtn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      } else {
        themeBtn.click();
      }
    }
  `);
  await new Promise(r => setTimeout(r, 600));

  const imgDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_dark_theme.png'), imgDark.toPNG());
  console.log('Saved verify_mt_dark_theme.png');

  app.quit();
});

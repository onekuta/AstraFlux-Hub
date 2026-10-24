const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = `file://${path.resolve(__dirname, 'dist/index.html')}?view=device&tab=trigger&profile=es68`;
  await win.loadURL(url);
  await new Promise((r) => setTimeout(r, 1500));

  // 设置滑块数值为 2.00mm
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('.vtravel-bubble input');
    const bubble = document.querySelector('.vtravel-bubble');
    // 如果还没进入输入，先点铅笔进入输入模式，输入 2.00
    const pencil = document.querySelector('.vtravel-pencil-btn');
    if (pencil) pencil.click();
  `);
  await new Promise((r) => setTimeout(r, 400));
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('.vtravel-bubble input');
    if (input) {
      input.value = '2.00';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  `);
  await new Promise((r) => setTimeout(r, 600));

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/31aaf3cf-ac99-4434-84bd-f0b85977629a';
  
  // 1. 截取 2.00mm 滑块状态
  const imageInitial = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_slider_2mm.png'), imageInitial.toPNG());
  console.log('Saved verify_slider_2mm.png');

  // 2. 模拟再次点击铅笔图标进入编辑模式
  await win.webContents.executeJavaScript(`
    const pencil = document.querySelector('.vtravel-pencil-btn');
    if (pencil) pencil.click();
  `);
  await new Promise((r) => setTimeout(r, 600));

  const imageEditing = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_slider_editing.png'), imageEditing.toPNG());
  console.log('Saved verify_slider_editing.png');

  // 3. 模拟输入 1.80 并按 Enter
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('.vtravel-bubble input');
    if (input) {
      input.value = '1.80';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  `);
  await new Promise((r) => setTimeout(r, 600));

  const imageChanged = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_slider_changed.png'), imageChanged.toPNG());
  console.log('Saved verify_slider_changed.png');

  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: false }
  });

  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=advanced&profile=ae64'
  });
  await new Promise(r => setTimeout(r, 2000));

  const brainDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 点击【功能原理图解】打开弹窗 (亮色主题)
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('功能原理'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  let img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(brainDir, 'verify_modal_light_socd.png'), img.toPNG());
  console.log('Saved verify_modal_light_socd.png');

  // 2. 点击右上角主题切换按钮，切换为暗色模式
  await win.webContents.executeJavaScript(`
    (() => {
      // 触发主题切换
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('eweadn-theme', 'dark');
    })()
  `);
  await new Promise(r => setTimeout(r, 500));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(brainDir, 'verify_modal_dark_socd.png'), img.toPNG());
  console.log('Saved verify_modal_dark_socd.png');

  // 3. 关闭当前弹窗，进入松开触发 (END)
  await win.webContents.executeJavaScript(`
    (() => {
      const okBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('我明白了'));
      if (okBtn) okBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 500));

  // 在概览列表中找到 END 卡片并点击进入编辑
  await win.webContents.executeJavaScript(`
    (() => {
      const els = Array.from(document.querySelectorAll('div, button'));
      const endItem = els.find(el => el.textContent && el.textContent.includes('松开触发 (END)') && el.className && el.className.includes('cursor-pointer'));
      if (endItem) endItem.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  // 点击【功能原理】打开 END 弹窗 (此时在暗色模式)
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('功能原理'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(brainDir, 'verify_modal_end_dark.png'), img.toPNG());
  console.log('Saved verify_modal_end_dark.png');

  app.quit();
});

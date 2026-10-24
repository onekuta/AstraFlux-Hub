const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 900 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  
  // 点击添加设备
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const addCard = document.querySelector('div[title*="点击打开添加与识别设备弹窗"]');
      if (addCard) {
        const propKey = Object.keys(addCard).find(k => k.startsWith('__reactProps'));
        if (propKey && addCard[propKey].onClick) {
          addCard[propKey].onClick({ stopPropagation: () => {} });
          return 'CLICKED_VIA_REACT';
        }
      }
      return 'CARD_NOT_FOUND';
    })()
  `);
  console.log('Click result:', clickRes);
  await new Promise(r => setTimeout(r, 1500));

  const modalHtml = await win.webContents.executeJavaScript(`
    (() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.outerHTML.slice(0, 300) : 'NO_MODAL';
    })()
  `);
  console.log('Modal HTML:', modalHtml);

  const buf = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_modal_capture.png', buf.toPNG());
  win.close();
  app.quit();
});

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
  await win.webContents.executeJavaScript(`
    (() => {
      const addCard = document.querySelector('div[title*="点击打开添加与识别设备弹窗"]');
      if (addCard) {
        const propKey = Object.keys(addCard).find(k => k.startsWith('__reactProps'));
        if (propKey && addCard[propKey].onClick) {
          addCard[propKey].onClick({ stopPropagation: () => {} });
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const styles = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('.fixed.inset-0');
      if (!el) return 'NOT_FOUND';
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const parentCs = window.getComputedStyle(el.parentElement);
      return {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        position: cs.position,
        parent: {
          tagName: el.parentElement.tagName,
          className: el.parentElement.className,
          display: parentCs.display,
          position: parentCs.position,
          overflow: parentCs.overflow,
          height: parentCs.height
        }
      };
    })()
  `);
  console.log('Styles:', JSON.stringify(styles, null, 2));

  win.close();
  app.quit();
});

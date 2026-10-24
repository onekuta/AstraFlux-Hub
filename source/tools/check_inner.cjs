const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 900 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home&modal=add';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));

  const childInfo = await win.webContents.executeJavaScript(`
    (() => {
      const modal = document.querySelector('.fixed.inset-0');
      const inner = modal ? modal.firstElementChild : null;
      if (!inner) return 'NO_INNER';
      const cs = window.getComputedStyle(inner);
      const rect = inner.getBoundingClientRect();
      return {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        bg: cs.backgroundColor,
        opacity: cs.opacity,
        display: cs.display,
        childrenCount: inner.children.length
      };
    })()
  `);
  console.log('Child info:', childInfo);

  const buf = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_inner_capture.png', buf.toPNG());

  win.close();
  app.quit();
});

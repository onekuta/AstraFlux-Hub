const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&theme=light&profile=es68';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  const rect = await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="SOCD"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()
  `);
  console.log('SOCD Center coords:', rect);

  if (rect) {
    win.webContents.sendInputEvent({ type: 'mouseMove', x: rect.x, y: rect.y });
    await new Promise(r => setTimeout(r, 600));

    const popoverInfo = await win.webContents.executeJavaScript(`
      (() => {
        const p = document.querySelector('#dksPrinciplePopover');
        if (!p) return null;
        const r = p.getBoundingClientRect();
        const style = window.getComputedStyle(p);
        return { 
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          zIndex: style.zIndex,
          opacity: style.opacity,
          display: style.display,
          parent: p.parentElement.tagName + '.' + p.parentElement.className.slice(0, 50)
        };
      })()
    `);
    console.log('Real hover result:', popoverInfo);

    // 等待 Chromium 渲染合成帧 (Compositor Paint)
    await new Promise(r => setTimeout(r, 400));

    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_real_mouse_hover.png'), img.toPNG());
    console.log('Saved verified_real_mouse_hover.png');
  }

  app.quit();
});

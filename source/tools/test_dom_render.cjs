const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&theme=light&profile=es68';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  // 1. Hover on SOCD card using real mouse input
  const rect = await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="SOCD"]');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()
  `);
  console.log('SOCD Center:', rect);

  win.webContents.sendInputEvent({ type: 'mouseMove', x: rect.x, y: rect.y });
  await new Promise(r => setTimeout(r, 700));

  const check = await win.webContents.executeJavaScript(`
    (() => {
      const p = document.querySelector('#dksPrinciplePopover');
      if (!p) return { found: false };
      const r = p.getBoundingClientRect();
      const style = window.getComputedStyle(p);
      return {
        found: true,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        zIndex: style.zIndex,
        opacity: style.opacity,
        display: style.display,
        visibility: style.visibility,
        parentElement: p.parentElement.tagName,
        innerHTML: p.innerHTML.slice(0, 100)
      };
    })()
  `);
  console.log('Check popover after hover:', check);

  // 等待 Tailwind CSS 150ms 入场淡入动画 (fade-in) 彻底完成
  await new Promise(r => setTimeout(r, 300));

  // Capture page
  const fullImg = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_full.png', fullImg.toPNG());

  if (check.found) {
    const crop = await win.webContents.capturePage({
      x: Math.round(check.rect.left),
      y: Math.round(check.rect.top),
      width: Math.round(check.rect.width),
      height: Math.round(check.rect.height)
    });
    fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_crop.png', crop.toPNG());
    console.log('Saved test_crop.png');
  }

  app.quit();
});

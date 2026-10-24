const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=performance&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  const rect = await win.webContents.executeJavaScript(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn16k = buttons.find(b => b.textContent.includes('16KHz'));
      if (btn16k) {
        const parent = btn16k.closest('.relative') || btn16k.parentElement;
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const r = btn16k.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      return null;
    })()
  `);
  console.log('16KHz button pos:', rect);
  if (rect) {
    win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(rect.x), y: Math.round(rect.y) });
  }
  await new Promise(r => setTimeout(r, 600));

  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_perf_tooltip_light.png', img.toPNG());
  console.log('Saved test_perf_tooltip_light.png');

  const clickResult = await win.webContents.executeJavaScript(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn16k = buttons.find(b => b.textContent.includes('16KHz'));
      if (btn16k) {
        btn16k.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Clicked 16KHz button:', clickResult);
  await new Promise(r => setTimeout(r, 800));

  const imgModal = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_perf_modal_light.png', imgModal.toPNG());
  console.log('Saved test_perf_modal_light.png');

  // Also test dark mode
  await win.webContents.executeJavaScript(`
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  `);
  await new Promise(r => setTimeout(r, 600));

  const imgModalDark = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_perf_modal_dark.png', imgModalDark.toPNG());
  console.log('Saved test_perf_modal_dark.png');

  win.destroy();
  app.quit();
});

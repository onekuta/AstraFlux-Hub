const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger');
  await new Promise(r => setTimeout(r, 1200));
  const res = await win.webContents.executeJavaScript(`
    (async () => {
      const q = document.querySelector('[data-anti-ghosting-info="true"]');
      if (!q) return 'NOT FOUND';
      q.click();
      await new Promise(r => setTimeout(r, 200));
      const el = document.querySelector('[data-anti-ghosting-tooltip="true"]');
      const cs = el ? window.getComputedStyle(el) : null;
      const r = el ? el.getBoundingClientRect() : null;
      return {
        clicked: true,
        rect: r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null,
        cs: cs ? { opacity: cs.opacity, visibility: cs.visibility, display: cs.display } : null
      };
    })()
  `);
  console.log('RESULT:', JSON.stringify(res, null, 2));
  await new Promise(r => setTimeout(r, 600));
  const fs = require('fs');
  const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_dom_screenshot.png'), img.toPNG());
  console.log('Saved test_dom_screenshot.png');
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

async function clickAt(win, selector) {
  const coords = await win.webContents.executeJavaScript(`
    (() => {
      const sel = ${JSON.stringify(selector)};
      let el = document.querySelector(sel);
      if (!el) {
        const all = Array.from(document.querySelectorAll('button, div, span'));
        el = all.find(e => e.textContent && e.textContent.trim().startsWith(sel));
      }
      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }
      return null;
    })()
  `);
  if (!coords) {
    console.log('clickAt: element not found for', selector);
    return false;
  }
  console.log('clickAt:', selector, 'at', coords);
  win.webContents.sendInputEvent({ type: 'mouseMove', x: coords.x, y: coords.y });
  await new Promise(r => setTimeout(r, 80));
  win.webContents.sendInputEvent({ type: 'mouseDown', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 80));
  win.webContents.sendInputEvent({ type: 'mouseUp', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
  return true;
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const fullUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=ae64&theme=light';
  await win.loadURL(fullUrl);
  await new Promise(r => setTimeout(r, 2000));

  // 1. Enter DKS editor mode
  await clickAt(win, '[data-mode-id="DKS"]');
  // Wait until DKS editor header appears
  await win.webContents.executeJavaScript(`
    new Promise(resolve => {
      const start = Date.now();
      const check = () => {
        if (document.body.innerText.includes('触发按键配置') || Date.now() - start > 4000) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })
  `);
  await new Promise(r => setTimeout(r, 800));

  // Capture 1: "基本字符" expanded (matches 图二)
  const img1 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_basic.png', img1.toPNG());
  console.log('Saved verify_dks_basic.png');

  // 2. Click "扩展字符" to expand it (matches 图三)
  await clickAt(win, '扩展字符');
  await new Promise(r => setTimeout(r, 800));

  // Capture 2: "扩展字符" expanded (matches 图三)
  const img2 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_extended.png', img2.toPNG());
  console.log('Saved verify_dks_extended.png');

  // 3. Click "扩展字符" header again to collapse all (matches 图四)
  await clickAt(win, '扩展字符');
  await new Promise(r => setTimeout(r, 800));

  // Capture 3: All 3 collapsed pills (matches 图四)
  const img3 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_all_collapsed.png', img3.toPNG());
  console.log('Saved verify_dks_all_collapsed.png');

  // 4. Click "鼠标控制" to expand it
  await clickAt(win, '鼠标控制');
  await new Promise(r => setTimeout(r, 800));

  // Capture 4: "鼠标控制" expanded
  const img4 = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_mouse.png', img4.toPNG());
  console.log('Saved verify_dks_mouse.png');

  win.destroy();
  app.quit();
});

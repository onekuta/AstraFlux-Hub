const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 900 });
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1500));

  const result = await win.webContents.executeJavaScript(`
    (() => {
      const card = document.querySelector('[data-mode-id="DKS"]');
      if (!card) return 'no card found';
      const propKey = Object.keys(card).find(k => k.startsWith('__reactProps'));
      if (propKey && card[propKey].onClick) {
        card[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        return 'invoked react onClick on DKS';
      }
      return 'propKey: ' + propKey;
    })()
  `);
  console.log('Result:', result);
  await new Promise(r => setTimeout(r, 1200));

  const measure = await win.webContents.executeJavaScript(`
    (() => {
      const topEl = document.querySelector('.keyboard-section-top');
      const bottomEl = document.querySelector('.panel-operation-bottom');
      return {
        top: topEl ? topEl.offsetHeight : 0,
        bottom: bottomEl ? bottomEl.offsetHeight : 0,
        hasEditor: !!document.querySelector('.h-full') || document.body.innerText.includes('动态行程')
      };
    })()
  `);
  console.log('Measure:', measure);

  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_editor_fixed.png', img.toPNG());
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=performance&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('16KHz'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 200));

  const exists = await win.webContents.executeJavaScript(`
    (() => {
      const dlg = document.querySelector('[role="dialog"]');
      return {
        exists: !!dlg,
        html: dlg ? dlg.outerHTML : null
      };
    })()
  `);
  console.log('Dialog status:', exists.exists);

  const img = await win.webContents.capturePage();
  const fs = require('fs');
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/real_modal_shot.png', img.toPNG());
  console.log('Saved real_modal_shot.png');

  win.destroy();
  app.quit();
});

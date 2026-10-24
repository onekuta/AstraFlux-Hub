const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });

  const testPages = [
    { name: 'trigger_deadzone', url: '?view=device&tab=trigger&sub=deadzone&profile=ae64&theme=light' },
    { name: 'trigger_switch', url: '?view=device&tab=trigger&sub=switch&profile=ae64&theme=light' },
    { name: 'lighting', url: '?view=device&tab=lighting&profile=ae64&theme=light' },
    { name: 'keybinds', url: '?view=device&tab=keybinds&profile=ae64&theme=light' },
    { name: 'advanced', url: '?view=device&tab=advanced&profile=ae64&theme=light' },
  ];

  for (const page of testPages) {
    const fullUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + page.url;
    await win.loadURL(fullUrl);
    await new Promise(r => setTimeout(r, 1200));

    // If subtab needs clicking
    if (page.name === 'trigger_deadzone') {
      await win.webContents.executeJavaScript(`
        const btn = document.querySelector('[data-subtab="deadzone"]');
        if (btn) btn.click();
      `);
      await new Promise(r => setTimeout(r, 600));
    } else if (page.name === 'trigger_switch') {
      await win.webContents.executeJavaScript(`
        const btn = document.querySelector('[data-subtab="switch"]');
        if (btn) btn.click();
      `);
      await new Promise(r => setTimeout(r, 600));
    }

    const img = await win.webContents.capturePage();
    fs.writeFileSync(`C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_${page.name}.png`, img.toPNG());
    console.log(`Saved verify_${page.name}.png`);
  }

  win.destroy();
  app.quit();
});

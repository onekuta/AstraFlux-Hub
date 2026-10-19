const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: false }
  });

  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=advanced&profile=ae64'
  });
  await new Promise(r => setTimeout(r, 2000));

  const modes = [
    { code: 'socd', name: '设定优先' },
    { code: 'dks', name: '动态键程' },
    { code: 'mpt', name: '多段触发' },
    { code: 'mt', name: '双效点击' },
    { code: 'tgl', name: '火力开关' }
  ];

  for (const m of modes) {
    console.log('Clicking tab:', m.name);
    await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('.pill-tab'));
        const target = btns.find(b => b.textContent.includes('${m.name}'));
        if (target) target.click();
      })()
    `);

    // Wait 1.5 seconds for React to finish rendering and browser paint
    await new Promise(r => setTimeout(r, 1500));

    // Force paint check
    await win.webContents.executeJavaScript(`new Promise(requestAnimationFrame)`);
    await new Promise(r => setTimeout(r, 300));

    const out = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', `verify_advanced_${m.code}_final.png`);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(out, img.toPNG());
    console.log('Saved final capture:', out);
  }

  win.destroy();
  app.quit();
});

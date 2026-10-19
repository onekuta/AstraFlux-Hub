const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
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
    { code: 'tgl', name: '火力开关' },
    { code: 'end', name: '松开触发' },
    { code: 'rs', name: '迅洁' }
  ];

  for (const m of modes) {
    // 1. Switch tab
    await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('.pill-tab'));
        const target = btns.find(b => b.textContent.includes('${m.name}'));
        if (target) target.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    // 2. Open modal
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('功能原理'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    // 3. Screenshot modal
    const out = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', `verify_official_modal_${m.code}.png`);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(out, img.toPNG());
    console.log(`Saved official modal: ${m.code} -> ${out}`);

    // 4. Close modal
    await win.webContents.executeJavaScript(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('我明白了'));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 400));
  }

  win.destroy();
  app.quit();
});

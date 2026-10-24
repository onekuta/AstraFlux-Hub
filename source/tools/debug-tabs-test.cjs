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
    await win.webContents.executeJavaScript(`
      (() => {
        const btns = Array.from(document.querySelectorAll('.pill-tab'));
        const target = btns.find(b => b.textContent.includes('${m.name}'));
        if (target) target.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 800));

    const state = await win.webContents.executeJavaScript(`
      (() => {
        const activeBtn = document.querySelector('.pill-tab.active');
        const h3 = document.querySelector('.panel-operation h3');
        return {
          activeBtnText: activeBtn ? activeBtn.textContent.trim() : null,
          headingText: h3 ? h3.textContent.trim() : null
        };
      })()
    `);
    console.log(`MODE [${m.code}]:`, JSON.stringify(state));

    const out = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', `verified_7_${m.code}.png`);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(out, img.toPNG());
    console.log(`Saved screenshot -> ${out}`);
  }

  // Open explanation modal
  console.log('Opening explanation modal...');
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('功能原理'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));
  const modalOut = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verified_explanation_modal.png');
  const modalImg = await win.webContents.capturePage();
  fs.writeFileSync(modalOut, modalImg.toPNG());
  console.log(`Saved modal screenshot -> ${modalOut}`);

  win.destroy();
  app.quit();
});

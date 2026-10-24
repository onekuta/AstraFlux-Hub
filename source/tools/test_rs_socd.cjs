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

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=ae64-max&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  // Click RS card in overview
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('[data-mode-id="RS"]'));
      if (cards.length > 0) cards[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot RS page
  let img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'test_rs_page.png'), img.toPNG());

  // Click 0ms in RS
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const delayBtn = btns.find(b => b.textContent && b.textContent.includes('0ms'));
      if (delayBtn) delayBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'test_rs_delay_modal.png'), img.toPNG());

  // Now switch to SOCD
  await win.webContents.executeJavaScript(`
    (() => {
      const returnBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('返回列表'));
      if (returnBtn) returnBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('[data-mode-id="SOCD"]'));
      if (cards.length > 0) cards[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'test_socd_page.png'), img.toPNG());

  // Click 0ms in SOCD
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const delayBtn = btns.find(b => b.textContent && b.textContent.includes('0ms'));
      if (delayBtn) delayBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  img = await win.capturePage();
  fs.writeFileSync(path.join(__dirname, 'test_socd_delay_modal.png'), img.toPNG());

  console.log('Finished capturing RS & SOCD screenshots');
  app.quit();
});

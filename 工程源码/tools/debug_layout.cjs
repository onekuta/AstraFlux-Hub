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
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  const distUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(distUrl);
  await new Promise(r => setTimeout(r, 2000));

  // 1. 进入 DKS 工作台
  await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="DKS"]');
      if (el) el.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const dksStyles = await win.webContents.executeJavaScript(`
    (() => {
      const panelOp = document.querySelector('.panel-operation');
      const whiteCard = panelOp ? panelOp.querySelector('.rounded-\\\\[14px\\\\]') : null;
      if (!whiteCard) return { error: 'no whiteCard' };
      const titleBar = whiteCard.children[0];
      const scrollArea = whiteCard.children[1];
      const bottomBar = whiteCard.children[2];

      const dump = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom },
          display: cs.display,
          position: cs.position,
          flexDirection: cs.flexDirection,
          justifyContent: cs.justifyContent,
          alignItems: cs.alignItems,
          overflow: cs.overflow,
          overflowY: cs.overflowY,
          marginTop: cs.marginTop,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          zIndex: cs.zIndex,
        };
      };

      // Also dump DKS top travel header and first row
      const dksTravelHeader = scrollArea ? scrollArea.querySelector('.grid-cols-\\\\[70px_1fr\\\\]') : null;
      const dksFirstRow = scrollArea ? scrollArea.querySelectorAll('.space-y-2\\\\.5 > div')[0] : null;

      return {
        whiteCard: dump(whiteCard),
        titleBar: dump(titleBar),
        scrollArea: dump(scrollArea),
        bottomBar: dump(bottomBar),
        dksTravelHeader: dump(dksTravelHeader),
        dksFirstRow: dump(dksFirstRow),
      };
    })()
  `);

  console.log('DKS COMPUTED STYLES:', JSON.stringify(dksStyles, null, 2));

  // 2. 截取当前 DKS 界面
  let imgDks = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/actual_dks_editor.png', imgDks.toPNG());

  // 3. 点击取消返回概览，再点击 SOCD
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cancelBtn = btns.find(b => b.textContent && b.textContent.includes('取消'));
      if (cancelBtn) cancelBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  await win.webContents.executeJavaScript(`
    (() => {
      const el = document.querySelector('[data-mode-id="SOCD"]');
      if (el) el.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const socdStyles = await win.webContents.executeJavaScript(`
    (() => {
      const panelOp = document.querySelector('.panel-operation');
      const whiteCard = panelOp ? panelOp.querySelector('.rounded-\\\\[14px\\\\]') : null;
      if (!whiteCard) return { error: 'no whiteCard' };
      const titleBar = whiteCard.children[0];
      const scrollArea = whiteCard.children[1];
      const bottomBar = whiteCard.children[2];
      const socdLeftCard = scrollArea ? scrollArea.querySelector('.grid-cols-1 > div, .grid-cols-2 > div') : null;

      const dump = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          rect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom }
        };
      };

      return {
        whiteCard: dump(whiteCard),
        titleBar: dump(titleBar),
        scrollArea: dump(scrollArea),
        bottomBar: dump(bottomBar),
        socdLeftCard: dump(socdLeftCard),
      };
    })()
  `);
  console.log('SOCD COMPUTED STYLES:', JSON.stringify(socdStyles, null, 2));

  let imgSocd = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/actual_socd_editor.png', imgSocd.toPNG());

  win.destroy();
  app.quit();
});

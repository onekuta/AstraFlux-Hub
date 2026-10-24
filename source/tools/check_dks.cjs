const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=advanced&advanced_view=editor&advanced_tab=DKS');
  await new Promise(r => setTimeout(r, 2000));

  const info = await win.webContents.executeJavaScript(`
    (() => {
      const rows = document.querySelectorAll('[data-dks-row]');
      const card = document.querySelector('[data-dks-row]')?.closest('.overflow-hidden');
      const footer = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('确定') && d.textContent.includes('取消'));
      return {
        rowCount: rows.length,
        rows: Array.from(rows).map(r => ({
          top: r.offsetTop,
          h: r.offsetHeight,
          visible: r.getBoundingClientRect().bottom <= window.innerHeight
        })),
        cardHeight: card?.offsetHeight,
        cardScrollHeight: card?.scrollHeight,
        footerRect: footer?.getBoundingClientRect()
      };
    })()
  `);

  console.log('DKS INSPECTION:', JSON.stringify(info, null, 2));
  app.quit();
});

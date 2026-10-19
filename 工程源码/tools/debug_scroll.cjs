const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1400, height: 900 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  const debug = await win.webContents.executeJavaScript(`(() => {
    const mains = Array.from(document.querySelectorAll('main'));
    const modalMain = mains.find(m => m.classList.contains('custom-scrollbar'));
    if (!modalMain) return { error: 'no modal main' };
    
    const before = modalMain.scrollTop;
    modalMain.scrollTop = 300;
    const after = modalMain.scrollTop;

    return {
      clientHeight: modalMain.clientHeight,
      scrollHeight: modalMain.scrollHeight,
      before,
      after,
      overflow: window.getComputedStyle(modalMain).overflowY
    };
  })()`);

  console.log('DEBUG:', JSON.stringify(debug, null, 2));
  app.quit();
});

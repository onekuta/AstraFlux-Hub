const { app, BrowserWindow } = require('electron');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  await win.loadURL('https://v2-dev.xsyd.top/lighting');
  await new Promise(r => setTimeout(r, 4000));

  const items = await win.webContents.executeJavaScript(`
    (() => {
      const els = document.querySelectorAll('.dynamic-item');
      return Array.from(els).map((el, i) => ({
        index: i,
        text: el.innerText.trim(),
        html: el.outerHTML.slice(0, 150)
      }));
    })()
  `);
  console.log('Dynamic items count:', items.length);
  console.log(items);
  app.quit();
});

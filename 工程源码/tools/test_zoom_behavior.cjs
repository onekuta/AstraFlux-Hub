const { app, BrowserWindow, webFrame } = require('electron');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1920, 
    height: 1080,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  await win.loadURL('about:blank');

  const res1 = await win.webContents.executeJavaScript(`
    (() => {
      const before = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      };
      document.documentElement.style.zoom = '1.39';
      const afterCssZoom = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      };
      return { before, afterCssZoom };
    })()
  `);
  console.log('CSS zoom test:', JSON.stringify(res1, null, 2));

  win.webContents.setZoomFactor(1.39);
  const res2 = await win.webContents.executeJavaScript(`
    (() => {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      };
    })()
  `);
  console.log('WebContents setZoomFactor test:', JSON.stringify(res2, null, 2));

  app.quit();
});

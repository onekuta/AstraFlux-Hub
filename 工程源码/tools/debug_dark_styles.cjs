const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=lighting&profile=es68&theme=dark`;
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  const styles = await win.webContents.executeJavaScript(`
    (() => {
      const activeNav = document.querySelector('.nav-item.active');
      const sideBar = document.querySelector('.sidebar') || document.querySelector('.sidebar-scroll');
      const docEl = document.documentElement;
      const htmlTheme = docEl.getAttribute('data-theme');
      const htmlClasses = docEl.className;
      const cssVars = {
        bgPrimary: getComputedStyle(docEl).getPropertyValue('--bg-primary').trim(),
        bgSecondary: getComputedStyle(docEl).getPropertyValue('--bg-secondary').trim(),
        textPrimary: getComputedStyle(docEl).getPropertyValue('--text-primary').trim(),
      };
      const activeNavComputed = activeNav ? {
        bg: getComputedStyle(activeNav).backgroundColor,
        color: getComputedStyle(activeNav).color,
      } : null;
      return { htmlTheme, htmlClasses, cssVars, activeNavComputed };
    })()
  `);
  console.log('COMPUTED_STYLES:', JSON.stringify(styles, null, 2));
  app.quit();
});

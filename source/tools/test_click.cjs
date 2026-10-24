const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  win.webContents.on('console-message', (e, level, msg) => console.log('[Console]', msg));

  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const modeBadgeBefore = await win.webContents.executeJavaScript(`
    document.querySelector('.grid button.bg-\\\\[var\\\\(--primary-color\\\\)\\\\] span')?.textContent
  `);
  console.log('Mode badge before:', modeBadgeBefore);

  const clicked = await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('L20') && b.textContent.includes('自定义'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()
  `);
  console.log('Clicked L20 button:', clicked);

  await new Promise(r => setTimeout(r, 500));

  const modeBadgeAfter = await win.webContents.executeJavaScript(`
    document.querySelector('.grid button.bg-\\\\[var\\\\(--primary-color\\\\)\\\\] span')?.textContent
  `);
  console.log('Mode badge after:', modeBadgeAfter);

  app.quit();
});

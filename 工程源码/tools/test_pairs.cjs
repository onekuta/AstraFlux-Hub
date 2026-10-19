const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 2000));
  const res = await win.webContents.executeJavaScript(`(() => {
    const el = document.querySelector('[data-slot="Config1"]');
    const classes = [
      'p-4', 'rounded-2xl', 'border', 'transition-all', 'relative',
      'cursor-pointer', 'select-none', 'border-[var(--primary-color)]',
      'shadow-md', 'ring-1', 'ring-[var(--primary-color)]/30'
    ];
    const results = {};
    for (let c of classes) {
      el.className = 'bg-[var(--surface-solid-secondary)] ' + c;
      results[c] = getComputedStyle(el).backgroundColor;
    }
    return results;
  })()`);
  console.log('CLASS COMBINATION RESULTS:', JSON.stringify(res, null, 2));
  app.quit();
});

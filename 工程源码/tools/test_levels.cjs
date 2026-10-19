const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const res = await win.webContents.executeJavaScript(`(() => {
    let curr = document.querySelector('[data-slot="Config1"]');
    const results = [];
    while (curr) {
      const test = document.createElement('div');
      test.className = 'bg-[var(--surface-solid-secondary)]';
      curr.appendChild(test);
      const bg = getComputedStyle(test).backgroundColor;
      test.remove();
      results.push({
        tag: curr.tagName,
        class: curr.className.slice(0, 30),
        testBg: bg
      });
      curr = curr.parentElement;
    }
    return results;
  })()`);
  console.log('TEST AT EACH LEVEL:', JSON.stringify(res, null, 2));
  app.quit();
});

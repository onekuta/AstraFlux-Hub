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
    const el = document.elementFromPoint(500, 300);
    const test = document.createElement('div');
    test.className = 'bg-[var(--surface-solid-secondary)]';
    document.body.appendChild(test);
    const testBg = getComputedStyle(test).backgroundColor;
    test.remove();

    const test2 = document.createElement('div');
    test2.className = 'bg-[var(--bg-secondary)]';
    document.body.appendChild(test2);
    const test2Bg = getComputedStyle(test2).backgroundColor;
    test2.remove();

    return {
      elClasses: el.className,
      testBg,
      test2Bg,
      elComputedBg: getComputedStyle(el).backgroundColor
    };
  })()`);
  console.log('TEST RESULT:', res);
  app.quit();
});

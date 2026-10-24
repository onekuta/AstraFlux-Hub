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
    const classes = el.className.split(/\\s+/).filter(Boolean);
    
    // Add one by one to an empty class list
    el.className = '';
    const stepResults = [];
    for (let c of classes) {
      el.classList.add(c);
      stepResults.push({
        added: c,
        bg: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color
      });
    }
    return stepResults;
  })()`);
  console.log('STEP RESULTS:', JSON.stringify(res, null, 2));
  app.quit();
});

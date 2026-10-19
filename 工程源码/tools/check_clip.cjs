const { app, BrowserWindow } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&theme=light&profile=es68&test_hover=SOCD';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1000));

  const result = await win.webContents.executeJavaScript(`
    (() => {
      const p = document.querySelector('#dksPrinciplePopover');
      if (!p) return 'NO POPOVER';
      let curr = p.parentElement;
      const chain = [];
      while (curr && curr !== document.body) {
        const style = window.getComputedStyle(curr);
        if (style.overflow !== 'visible' || style.transform !== 'none' || style.filter !== 'none') {
          chain.push({
            tag: curr.tagName,
            class: curr.className,
            overflow: style.overflow,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
            transform: style.transform,
            filter: style.filter
          });
        }
        curr = curr.parentElement;
      }
      return chain;
    })()
  `);
  console.log('CLIPPING CHAIN:', JSON.stringify(result, null, 2));
  app.quit();
});

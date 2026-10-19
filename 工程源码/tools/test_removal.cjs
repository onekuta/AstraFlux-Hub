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
    const classes = el.className.split(' ');
    const results = [];
    
    // Test removing each class
    for (let c of classes) {
      el.classList.remove(c);
      results.push({
        removedClass: c,
        currentBg: getComputedStyle(el).backgroundColor,
        currentColor: getComputedStyle(el).color
      });
      el.classList.add(c);
    }
    
    // Test clearing all classes
    const originalClass = el.className;
    el.className = '';
    const clearedBg = getComputedStyle(el).backgroundColor;
    const clearedColor = getComputedStyle(el).color;
    el.className = originalClass;

    // Test removing all attributes except style
    const originalAttrs = Array.from(el.attributes).map(a => ({ name: a.name, value: a.value }));
    for (let a of originalAttrs) {
      if (a.name !== 'style') el.removeAttribute(a.name);
    }
    const noAttrBg = getComputedStyle(el).backgroundColor;
    const noAttrColor = getComputedStyle(el).color;
    for (let a of originalAttrs) {
      el.setAttribute(a.name, a.value);
    }

    return {
      results,
      clearedBg,
      clearedColor,
      noAttrBg,
      noAttrColor
    };
  })()`);
  console.log('REMOVAL TEST:', JSON.stringify(res, null, 2));
  app.quit();
});

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
    const el = document.querySelector('[data-slot="Config1"]');
    
    // 1. Remove data-slot
    el.removeAttribute('data-slot');
    const noSlot = getComputedStyle(el).backgroundColor;

    // 2. Remove all children
    const clone = el.cloneNode(false);
    el.parentElement.appendChild(clone);
    const cloneNoChildren = getComputedStyle(clone).backgroundColor;

    // 3. Clone outerHTML
    const div = document.createElement('div');
    div.innerHTML = el.outerHTML;
    el.parentElement.appendChild(div.firstElementChild);
    const divBg = getComputedStyle(div.firstElementChild).backgroundColor;

    return {
      noSlot,
      cloneNoChildren,
      divBg,
      attributes: Array.from(el.attributes).map(a => a.name + '=' + a.value)
    };
  })()`);
  console.log('DIFF TEST:', JSON.stringify(res, null, 2));
  app.quit();
});

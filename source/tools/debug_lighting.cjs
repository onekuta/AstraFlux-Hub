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

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadURL(pathToFileURL(distHtml).href + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1500));

  const result = await win.webContents.executeJavaScript(`
    const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().replace(/\\s+/g, ' '));
    btns;
  `);
  console.log('Buttons found:', result.filter(t => t.includes('L20') || t.includes('L2') || t.includes('自定义')));

  // Check animTick
  const tick1 = await win.webContents.executeJavaScript(`
    const key = document.querySelector('button[title*="物理灯珠"], button[title*="灯珠"]');
    key ? key.style.backgroundColor : 'none';
  `);
  console.log('Color at t=0:', tick1);

  await new Promise(r => setTimeout(r, 500));

  const tick2 = await win.webContents.executeJavaScript(`
    const key = document.querySelector('button[title*="物理灯珠"], button[title*="灯珠"]');
    key ? key.style.backgroundColor : 'none';
  `);
  console.log('Color at t=500ms:', tick2);

  app.quit();
});

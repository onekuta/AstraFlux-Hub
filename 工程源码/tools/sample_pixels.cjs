const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=profiles&profile=es68&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));
  const img = await win.webContents.capturePage();
  const bmp = img.toBitmap(); // BGRA
  const size = img.getSize();
  console.log('Image dimensions:', size.width, 'x', size.height);
  // Sample a few pixels:
  // Titlebar at (20, 20)
  // App-shell at (100, 100)
  // Main area at (500, 300)
  function getPixel(x, y) {
    const idx = (y * size.width + x) * 4;
    return { b: bmp[idx], g: bmp[idx+1], r: bmp[idx+2], a: bmp[idx+3] };
  }
  console.log('Pixel (20, 20):', getPixel(20, 20));
  console.log('Pixel (100, 100):', getPixel(100, 100));
  console.log('Pixel (500, 300):', getPixel(500, 300));
  app.quit();
});

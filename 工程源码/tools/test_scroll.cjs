const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1400, height: 900 });
  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1000));

  await win.webContents.executeJavaScript(`(() => {
    const modalMain = document.querySelector('.custom-scrollbar');
    if (modalMain) {
      modalMain.scrollTop = 200;
    }
  })()`);
  
  // Force frame repaint by slightly resizing or requesting paint
  win.setSize(1401, 900);
  await new Promise(r => setTimeout(r, 800));

  const shot = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verified_about_page_dark_scrolled.png', shot.toPNG());
  console.log('Done forced paint scroll test');
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 800, height: 600 });
  const fontBase64 = fs.readFileSync(path.join(__dirname, '../src/assets/fonts/PangMenZhengDao.woff2')).toString('base64');
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        @font-face {
          font-family: 'PangMenZhengDao';
          src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
        }
        body { font-family: 'PangMenZhengDao', sans-serif; font-size: 40px; }
      </style>
    </head>
    <body>
      <div id='test'>我的设备 SparkLink 8000Hz</div>
      <script>
        document.fonts.ready.then(() => {
          const loaded = Array.from(document.fonts).map(f => ({ family: f.family, status: f.status }));
          console.log('FONTS STATUS:', JSON.stringify(loaded));
        });
      </script>
    </body>
    </html>
  `;
  win.webContents.on('console-message', (e, level, msg) => console.log('LOG:', msg));
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise(r => setTimeout(r, 1500));
  const img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_base64_pangmen.png', img.toPNG());
  console.log('Saved test_base64_pangmen.png');
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 900, useContentSize: true, show: false });
  const { pathToFileURL } = require('url');
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on SOCD to enter editor mode step 1
  await win.webContents.executeJavaScript(`
    const card = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('设定优先 (SOCD)'));
    if (card) card.click();
  `);
  await new Promise(r => setTimeout(r, 1000));
  let img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_adv_editor_step1.png', img.toPNG());
  
  // Click next step to enter step 2
  await win.webContents.executeJavaScript(`
    const nextBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('下一步'));
    if (nextBtn) nextBtn.click();
  `);
  await new Promise(r => setTimeout(r, 1000));
  img = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/test_adv_editor_step2.png', img.toPNG());
  
  console.log('Saved step 1 and step 2 screenshots');
  win.destroy();
  app.quit();
});

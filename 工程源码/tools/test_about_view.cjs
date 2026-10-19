const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const outDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1400, 
    height: 900, 
    webPreferences: { preload: path.join(__dirname, '../electron/preload.cjs') } 
  });
  await win.loadURL(pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=dark');
  await new Promise(r => setTimeout(r, 1500));
  
  // 1. Initial top
  const imgTop = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_dark.png'), imgTop.toPNG());
  console.log('Saved top');

  // Helper to scroll and ensure painted
  async function scrollToAndCapture(scrollTop, outFilename) {
    await win.webContents.executeJavaScript(`(() => {
      const m = document.querySelector(".fixed main");
      m.style.scrollBehavior = 'auto';
      m.scrollTop = ${scrollTop};
    })()`);
    
    // Drain compositor pipeline
    for (let i = 0; i < 3; i++) {
      await win.webContents.executeJavaScript(`new Promise(r => requestAnimationFrame(r))`);
      await win.webContents.capturePage();
      await new Promise(r => setTimeout(r, 100));
    }
    
    const finalImg = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outDir, outFilename), finalImg.toPNG());
    console.log('Saved', outFilename);
  }

  // 2. Scrolled middle (Sponsors & Contacts): scrollTop = 480
  await scrollToAndCapture(480, 'verified_about_page_dark_scrolled.png');

  // 3. Scrolled bottom (FAQ & Open Source): scrollTop = 1200
  await scrollToAndCapture(1200, 'verified_about_page_dark_bottom.png');

  // 4. Light theme captures
  const lightUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?settings=true&section=about&theme=light';
  await win.loadURL(lightUrl);
  await new Promise(r => setTimeout(r, 1500));

  const imgLightTop = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_light.png'), imgLightTop.toPNG());
  console.log('Saved verified_about_page_light.png');

  await scrollToAndCapture(480, 'verified_about_page_light_scrolled.png');
  await scrollToAndCapture(1200, 'verified_about_page_light_bottom.png');

  app.quit();
});

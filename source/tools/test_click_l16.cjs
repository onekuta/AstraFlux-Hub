const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1380, height: 880 });
  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2500);

  const res = await win.webContents.executeJavaScript(`
    (() => {
      const allBtns = Array.from(document.querySelectorAll('button[data-mode-label]')).map(b => b.getAttribute('data-mode-label'));
      const btn16 = document.querySelector('button[data-mode-label="L16"]');
      if (btn16) {
        btn16.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      return { allBtns, found16: !!btn16 };
    })()
  `);
  console.log('Result before sleep:', res);

  // Wait 1.5s for L16 animation to kick in
  await sleep(1500);

  const status = await win.webContents.executeJavaScript(`
    (() => {
      const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
      const activeBtn = document.querySelector('button[data-mode-label="L16"]');
      return {
        badge: badge ? badge.innerText : null,
        btnStyle: activeBtn ? activeBtn.getAttribute('style') : null
      };
    })()
  `);
  console.log('Status after click:', status);

  const shot = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_l16_wandering_ball.png'), shot.toPNG());
  console.log('Saved verified_l16_wandering_ball.png');

  await sleep(800);
  const shot2 = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verified_l16_wandering_ball_frame2.png'), shot2.toPNG());
  console.log('Saved verified_l16_wandering_ball_frame2.png');

  app.quit();
});

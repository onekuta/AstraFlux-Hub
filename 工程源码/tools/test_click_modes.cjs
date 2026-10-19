const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2000);

  const testModes = ['L3', 'L6', 'L7', 'L10'];

  for (const label of testModes) {
    console.log(`\n----------------- Testing ${label} -----------------`);
    const clickResult = await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
        if (!btn) return { found: false };
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return { found: true, title: btn.title };
      })()
    `);
    console.log(`Click ${label} result:`, clickResult);
    await sleep(800);

    const activeInfo = await win.webContents.executeJavaScript(`
      (() => {
        const badge = document.querySelector('span.text-\\\\[12px\\\\].font-mono.font-bold');
        const activeBtn = document.querySelector('button[data-mode-label].bg-\\\\[\\\\#0052ef\\\\]');
        return {
          badgeText: badge ? badge.innerText : 'none',
          activeBtnLabel: activeBtn ? activeBtn.getAttribute('data-mode-label') : 'none'
        };
      })()
    `);
    console.log(`Active state for ${label}:`, activeInfo);

    // 截图保存
    const shot = await win.capturePage();
    const filePath = path.join(artifactDir, `real_${label.toLowerCase()}_verified.png`);
    fs.writeFileSync(filePath, shot.toPNG());
    console.log(`Saved screenshot: real_${label.toLowerCase()}_verified.png`);
  }

  app.quit();
});

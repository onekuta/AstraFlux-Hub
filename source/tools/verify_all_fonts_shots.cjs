const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

async function captureTab(win, tabName, outFilename, subTab = null) {
  let url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=device&tab=${tabName}&profile=es68&theme=light`;
  if (subTab) {
    url += `&subtab=${subTab}`;
  }
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1500));

  if (tabName === 'trigger' && subTab === 'deadzone') {
    await win.webContents.executeJavaScript(`
      const btn = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent.includes('死区设置') && el.querySelector('button, svg'));
      if (btn) btn.click();
    `).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
  }

  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, outFilename), img.toPNG());
  console.log('Saved ' + outFilename);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 1. Settings (其他设置 - 用户截图同款)
  await captureTab(win, 'settings', 'verify_font_settings.png');

  // 2. Trigger (触发设置)
  await captureTab(win, 'trigger', 'verify_font_trigger.png');

  // 3. Switches (轴体设置)
  await captureTab(win, 'switches', 'verify_font_switches.png');

  // 4. Advanced (高级键设置)
  await captureTab(win, 'advanced', 'verify_font_advanced.png');

  // 5. Performance (性能设置)
  await captureTab(win, 'performance', 'verify_font_performance.png');

  win.destroy();
  app.quit();
});

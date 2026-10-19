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
    width: 1380,
    height: 880,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../electron/preload.cjs')
    }
  });

  const url = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?theme=dark';
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 1200));

  // Trigger opening GlobalSettingsModal at 'about' section
  const openRes = await win.webContents.executeJavaScript(`(() => {
    // Check if about button in sidebar exists, or dispatch settings click
    const btns = Array.from(document.querySelectorAll('button'));
    const aboutBtn = btns.find(b => b.textContent && b.textContent.includes('关于软件'));
    if (aboutBtn) {
      aboutBtn.click();
      return { success: true, method: 'sidebar_button' };
    }
    const settingsBtn = document.querySelector('button[title*="常规设置"]');
    if (settingsBtn) {
      settingsBtn.click();
      return { success: true, method: 'header_settings' };
    }
    return { success: false };
  })()`);

  console.log('Open modal result:', openRes);
  await new Promise(r => setTimeout(r, 800));

  // Switch to about tab if not already on about
  await win.webContents.executeJavaScript(`(() => {
    const tabs = Array.from(document.querySelectorAll('aside button'));
    const aboutTab = tabs.find(t => t.textContent && t.textContent.includes('关于'));
    if (aboutTab) aboutTab.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // Capture dark theme screenshot
  const imageDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_dark.png'), imageDark.toPNG());
  console.log('Saved dark about screenshot');

  // Switch to light theme
  await win.webContents.executeJavaScript(`(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // Capture light theme screenshot
  const imageLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_about_page_light.png'), imageLight.toPNG());
  console.log('Saved light about screenshot');

  // Verify DOM content
  const domCheck = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    return {
      hasKutaze: text.includes('Kutaze'),
      hasLeHeZe: text.includes('乐禾泽'),
      hasEmail: text.includes('time3207486260@outlook.com'),
      hasSponsors: text.includes('麦克阿兰'),
      hasMit: text.includes('MIT License'),
      hasFirmware: text.includes('0.0.3.5')
    };
  })()`);
  console.log('DOM verification:', JSON.stringify(domCheck, null, 2));

  app.quit();
});

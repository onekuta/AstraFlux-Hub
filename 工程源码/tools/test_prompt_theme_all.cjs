const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  const fileUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=performance&profile=es68';
  await win.loadURL(fileUrl);
  await new Promise(r => setTimeout(r, 2000));

  // --- Dark Mode ---
  await win.webContents.executeJavaScript(`
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  `);
  await new Promise(r => setTimeout(r, 300));

  // Click 16KHz to trigger modal
  await win.webContents.executeJavaScript(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('16KHz'));
    if (btn) btn.click();
  `);
  await new Promise(r => setTimeout(r, 600));

  await win.webContents.executeJavaScript(`
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  `);
  await new Promise(r => setTimeout(r, 200));

  const darkStyles = await win.webContents.executeJavaScript(`
    (() => {
      const dlg = document.querySelector('[role="dialog"]');
      const toast = document.querySelector('.fixed.top-14');
      return {
        dlgExists: !!dlg,
        dlgBg: dlg ? window.getComputedStyle(dlg).backgroundColor : null,
        dlgColor: dlg ? window.getComputedStyle(dlg).color : null,
        dlgBorder: dlg ? window.getComputedStyle(dlg).borderColor : null,
        hasToast: !!toast
      };
    })()
  `);
  console.log('[dark] Modal styles:', darkStyles);

  const imgDarkModal = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/prompt_modal_dark.png', imgDarkModal.toPNG());
  console.log('Saved prompt_modal_dark.png');

  // Close modal
  await win.webContents.executeJavaScript(`
    const closeBtn = document.querySelector('[role="dialog"] button[title="关闭"]');
    if (closeBtn) closeBtn.click();
  `);
  await new Promise(r => setTimeout(r, 500));

  // Hover over 16KHz in dark mode
  await win.webContents.executeJavaScript(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('16KHz'));
    if (btn) {
      const parent = btn.closest('.relative');
      if (parent) parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  `);
  await new Promise(r => setTimeout(r, 500));

  await win.webContents.executeJavaScript(`
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  `);
  await new Promise(r => setTimeout(r, 200));

  const imgDarkTooltip = await win.webContents.capturePage();
  fs.writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/prompt_tooltip_dark.png', imgDarkTooltip.toPNG());
  console.log('Saved prompt_tooltip_dark.png');

  win.destroy();
  app.quit();
});

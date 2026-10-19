const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: false }
  });

  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  await new Promise(r => setTimeout(r, 2000));

  // 打开全局设置弹窗
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const settingsBtn = btns.find(b => (b.title && b.title.includes('设置')) || b.querySelector('svg.lucide-settings') || b.querySelector('svg.lucide-settings2'));
      if (settingsBtn) settingsBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截取常规设置（确认按键测试工具）
  const outGeneral = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verify_settings_general_pure_kb.png');
  let img = await win.webContents.capturePage();
  fs.writeFileSync(outGeneral, img.toPNG());
  console.log('Saved general settings:', outGeneral);

  // 切换到消息通知页签
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const notifBtn = btns.find(b => b.textContent && b.textContent.includes('消息通知'));
      if (notifBtn) notifBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截取消息通知（确认完全无鼠标残留）
  const outNotif = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verify_settings_notif_pure_kb.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outNotif, img.toPNG());
  console.log('Saved notification settings:', outNotif);

  win.close();
  app.quit();
});

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

  // 直接加载进入设备工作台的“高级按键”页面
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=advanced&profile=ae64'
  });
  await new Promise(r => setTimeout(r, 2000));

  // 1. 截取【高级按键】默认主界面（图三 1:1 还原：选择高级功能配置 + 已配置高级键 0/20 + 按键测试）
  const outOverview = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verify_advanced_overview_fig3.png');
  let img = await win.webContents.capturePage();
  fs.writeFileSync(outOverview, img.toPNG());
  console.log('Saved overview screenshot:', outOverview);

  // 2. 点击【设定优先 (SOCD)】卡片，进入子配置界面（图一/图二）
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const socdCard = cards.find(el => el.textContent && el.textContent.includes('设定优先 (SOCD)') && el.className && el.className.includes('cursor-pointer'));
      if (socdCard) socdCard.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 截取【高级按键】子配置界面（图一/图二）
  const outEditor = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verify_advanced_editor_fig1.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outEditor, img.toPNG());
  console.log('Saved editor screenshot:', outEditor);

  // 3. 在子配置界面点击【确定】，保存并返回概览，已配置变为 1/20
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = btns.find(b => b.textContent && b.textContent.trim() === '确定');
      if (confirmBtn) confirmBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 截取保存后返回概览的界面（显示已配置高级键 1/20 与 SOCD 卡片）
  const outConfigured = path.join('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335', 'verify_advanced_configured_list.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outConfigured, img.toPNG());
  console.log('Saved configured list screenshot:', outConfigured);

  win.close();
  app.quit();
});

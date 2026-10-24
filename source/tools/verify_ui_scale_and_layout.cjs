const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1260,
    height: 800,
    show: true,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: false }
  });

  // 1. 最小窗口尺寸 1260x800 - 触发配置页面
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=trigger&profile=ae64max'
  });
  await new Promise((r) => setTimeout(r, 2000));

  let img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_1260x800_trigger.png'), img.toPNG());
  console.log('Saved verify_1260x800_trigger.png');

  // 2. 最小窗口尺寸 1260x800 - 切换到高级按键子页面 (点击顶部导航“高级按键”，再点击 SOCD)
  await win.webContents.executeJavaScript(`
    (() => {
      const navBtns = Array.from(document.querySelectorAll('button, div'));
      const advNav = navBtns.find(el => el.textContent && el.textContent.trim() === '高级按键');
      if (advNav) advNav.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 1200));

  // 点击 SOCD 进入子配置工作台
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const socd = cards.find(el => el.textContent && el.textContent.includes('设定优先 (SOCD)') && el.className && el.className.includes('cursor-pointer'));
      if (socd) socd.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 1200));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_1260x800_advanced_editor.png'), img.toPNG());
  console.log('Saved verify_1260x800_advanced_editor.png');

  // 3. 放大窗口尺寸到 1600x950 - 高级按键页面
  win.setBounds({ width: 1600, height: 950 });
  await new Promise((r) => setTimeout(r, 1500));

  // 点击左侧 DKS 胶囊切换到 DKS 配置
  await win.webContents.executeJavaScript(`
    (() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const dks = items.find(el => el.textContent && el.textContent.includes('动态键程 (DKS)'));
      if (dks) dks.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 1000));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_1600x950_advanced_dks.png'), img.toPNG());
  console.log('Saved verify_1600x950_advanced_dks.png');

  // 4. 放大窗口尺寸到 1600x950 - 切回触发配置页面
  await win.webContents.executeJavaScript(`
    (() => {
      const navBtns = Array.from(document.querySelectorAll('button, div'));
      const trigNav = navBtns.find(el => el.textContent && el.textContent.trim() === '触发配置');
      if (trigNav) trigNav.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 1500));

  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_1600x950_trigger.png'), img.toPNG());
  console.log('Saved verify_1600x950_trigger.png');

  win.close();
  app.quit();
});

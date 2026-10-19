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

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 测试 AE64-MAX 浅色主题下的底灯仿真卡片（高对比度 + 一体全息管）
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=lighting&profile=ae64_max'
  });
  await new Promise(r => setTimeout(r, 2000));

  // 切换到装饰灯1
  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.setAttribute('data-theme', 'light');
      const btns = Array.from(document.querySelectorAll('button'));
      const decorBtn = btns.find(b => b.textContent.includes('装饰灯1'));
      if (decorBtn) decorBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const shotAe64Unified = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ae64_simulation_unified.png'), shotAe64Unified.toPNG());
  console.log('Saved verify_ae64_simulation_unified.png');

  // 切换为双翼分路模式
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const splitBtn = btns.find(b => b.textContent.includes('双翼分路'));
      if (splitBtn) splitBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const shotAe64Split = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ae64_simulation_split.png'), shotAe64Split.toPNG());
  console.log('Saved verify_ae64_simulation_split.png');

  // 2. 测试 ES68 浅色主题与深色主题下的高对比度导光管
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=lighting&profile=es68'
  });
  await new Promise(r => setTimeout(r, 2000));

  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.setAttribute('data-theme', 'light');
      const btns = Array.from(document.querySelectorAll('button'));
      const decorBtn = btns.find(b => b.textContent.includes('装饰灯1'));
      if (decorBtn) decorBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const shotEs68Light = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_es68_simulation_light.png'), shotEs68Light.toPNG());
  console.log('Saved verify_es68_simulation_light.png');

  // 切换到深色主题
  await win.webContents.executeJavaScript(`
    (() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const shotEs68Dark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_es68_simulation_dark.png'), shotEs68Dark.toPNG());
  console.log('Saved verify_es68_simulation_dark.png');

  win.close();
  app.quit();
});

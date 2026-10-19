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

  // 1. 打开灯光配置并切换到 装饰灯1
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=lighting&profile=ae64'
  });
  await new Promise(r => setTimeout(r, 2000));

  // 点击“装饰灯1”胶囊按钮
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const decorBtn = btns.find(b => b.textContent.includes('装饰灯1'));
      if (decorBtn) decorBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 涂色测试最后几颗灯珠 (验证 #32, #33, #34 完全可控)
  await win.webContents.executeJavaScript(`
    (() => {
      const ledButtons = Array.from(document.querySelectorAll('button[title*="底灯 LED"]'));
      console.log('Total strip LED buttons found:', ledButtons.length);
      // 点击最后三颗灯珠
      if (ledButtons.length >= 34) {
        ledButtons[ledButtons.length - 1].click();
        ledButtons[ledButtons.length - 2].click();
        ledButtons[ledButtons.length - 3].click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截图 1: 34颗底灯全量可控视图
  const shot1 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_strip_34_leds.png'), shot1.toPNG());
  console.log('Saved verify_strip_34_leds.png');

  // 2. 验证打开“轴体校准”弹窗
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const calBtn = btns.find(b => b.textContent.includes('轴体校准') || b.textContent.includes('全键校准'));
      if (calBtn) calBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 截图 2: 校准界面视图 (验证所有键位映射与霍尔读数初始状态)
  const shot2 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_calibration_modal.png'), shot2.toPNG());
  console.log('Saved verify_calibration_modal.png');

  app.quit();
});

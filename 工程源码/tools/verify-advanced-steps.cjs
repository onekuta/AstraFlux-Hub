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

  const brainDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 点击【设定优先 (SOCD)】卡片，进入第 1 步 (图一)
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const socdCard = cards.find(el => el.textContent && el.textContent.includes('设定优先 (SOCD)') && el.className && el.className.includes('cursor-pointer'));
      if (socdCard) socdCard.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 截取第 1 步（图一）：选取2个按键绑定瞬时释放(SOCD)
  const outStep1 = path.join(brainDir, 'verify_advanced_step1_fig1.png');
  let img = await win.webContents.capturePage();
  fs.writeFileSync(outStep1, img.toPNG());
  console.log('Saved step 1 screenshot:', outStep1);

  // 2. 在上方键盘中点击按键 A 和 D，或者点击下一步进入第 2 步（图三）
  await win.webContents.executeJavaScript(`
    (() => {
      // 模拟点击上方键盘的 A 键和 D 键
      const keys = Array.from(document.querySelectorAll('button[data-key-id]'));
      const keyA = keys.find(b => b.getAttribute('data-key-id') === 'KeyA');
      const keyD = keys.find(b => b.getAttribute('data-key-id') === 'KeyD');
      if (keyA) keyA.click();
      setTimeout(() => {
        if (keyD) keyD.click();
      }, 300);
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 确保进入第 2 步
  await win.webContents.executeJavaScript(`
    (() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('下一步'));
      if (nextBtn) nextBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截取第 2 步（图三）：规则与字符库设置 (基本字符 9 列矩阵 + 4 个规则胶囊)
  const outStep2 = path.join(brainDir, 'verify_advanced_step2_fig3.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outStep2, img.toPNG());
  console.log('Saved step 2 screenshot:', outStep2);

  // 3. 展开“扩展字符”手风琴
  await win.webContents.executeJavaScript(`
    (() => {
      const headers = Array.from(document.querySelectorAll('div')).filter(el => el.textContent && el.textContent.trim().startsWith('扩展字符') && el.className && el.className.includes('cursor-pointer'));
      if (headers.length > 0) headers[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截取扩展字符 9 列矩阵截图
  const outExtended = path.join(brainDir, 'verify_advanced_step2_extended.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outExtended, img.toPNG());
  console.log('Saved extended characters screenshot:', outExtended);

  win.close();
  app.quit();
});

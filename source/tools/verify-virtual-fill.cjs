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
    search: 'view=device&tab=advanced&profile=dv63'
  });
  await new Promise(r => setTimeout(r, 2000));

  const brainDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 验证高级按键页面中右侧侧边栏已彻底隐藏 (不能存在 "全选按键" 或 "WASD急停")
  const sidebarCheck = await win.webContents.executeJavaScript(`
    (() => {
      const allText = document.body.innerText;
      const hasSelectAll = allText.includes('全选按键');
      const hasWasd = allText.includes('WASD急停');
      const hasClear = allText.includes('取消选中');
      return { hasSelectAll, hasWasd, hasClear };
    })()
  `);
  console.log('Sidebar check (all should be false):', sidebarCheck);

  // 2. 验证鼠标悬浮不会触发 tooltip
  await win.webContents.executeJavaScript(`
    (() => {
      const keyW = document.querySelector('button[data-key-id="KeyW"]');
      if (keyW) {
        const ev = new MouseEvent('mouseenter', { bubbles: true, cancelable: true });
        keyW.dispatchEvent(ev);
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 300));

  const tooltipCheck = await win.webContents.executeJavaScript(`
    (() => {
      const tooltip = document.querySelector('.animate-in.zoom-in-95');
      return { tooltipVisible: !!tooltip };
    })()
  `);
  console.log('Tooltip check (should be false):', tooltipCheck);

  // 截图 1: 高级按键概览页（验证右侧栏已隐藏，键盘全宽居中）
  const outOverview = path.join(brainDir, 'verify_advanced_no_sidebar_overview.png');
  let img = await win.webContents.capturePage();
  fs.writeFileSync(outOverview, img.toPNG());
  console.log('Saved overview screenshot:', outOverview);

  // 3. 点击进入编辑模式第 1 步 (点击设定优先 SOCD 卡片)
  await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const socdCard = cards.find(el => el.textContent && el.textContent.includes('设定优先 (SOCD)') && el.className && el.className.includes('cursor-pointer'));
      if (socdCard) socdCard.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 截图 2: Step 1 初始状态（等待点选）
  const outStep1Init = path.join(brainDir, 'verify_advanced_step1_ready.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outStep1Init, img.toPNG());
  console.log('Saved Step 1 ready screenshot:', outStep1Init);

  // 4. 点按上方虚拟键盘的 W 键 -> 应当直接填入“按键1”
  await win.webContents.executeJavaScript(`
    (() => {
      const keyW = document.querySelector('button[data-key-id="KeyW"]');
      if (keyW) keyW.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截图 3: W 键已成功填入按键1，激活槽位自动跳至按键2
  const outStep1W = path.join(brainDir, 'verify_advanced_step1_w_filled.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outStep1W, img.toPNG());
  console.log('Saved Step 1 with W filled screenshot:', outStep1W);

  // 5. 点按上方虚拟键盘的 S 键 -> 应当填入“按键2”并自动进入 Step 2
  await win.webContents.executeJavaScript(`
    (() => {
      const keyS = document.querySelector('button[data-key-id="KeyS"]');
      if (keyS) keyS.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 截图 4: 自动进入 Step 2，按键 A 显示为 W，按键 B 显示为 S
  const outStep2WS = path.join(brainDir, 'verify_advanced_step2_ws_filled.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outStep2WS, img.toPNG());
  console.log('Saved Step 2 with W & S screenshot:', outStep2WS);

  // 6. 在 Step 2 中激活按键 B，然后点击上方键盘的 D 键
  await win.webContents.executeJavaScript(`
    (() => {
      // 激活按键 B
      const keyBCard = Array.from(document.querySelectorAll('div')).find(el => el.textContent && el.textContent.trim() === '按键B' && el.parentElement);
      if (keyBCard && keyBCard.parentElement) {
        const clickTarget = keyBCard.parentElement.querySelector('div[class*="cursor-pointer"]');
        if (clickTarget) clickTarget.click();
      }
      setTimeout(() => {
        // 点击上方键盘 D
        const keyD = document.querySelector('button[data-key-id="KeyD"]');
        if (keyD) keyD.click();
      }, 300);
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // 截图 5: 按键 B 已更新为 D
  const outStep2WD = path.join(brainDir, 'verify_advanced_step2_wd_updated.png');
  img = await win.webContents.capturePage();
  fs.writeFileSync(outStep2WD, img.toPNG());
  console.log('Saved Step 2 with D updated screenshot:', outStep2WD);

  win.close();
  app.quit();
});

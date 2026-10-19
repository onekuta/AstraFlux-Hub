const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const ROOT = path.join(__dirname, '..');
const ARTIFACT_DIR = path.resolve('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    show: false,
    useContentSize: true,
    backgroundColor: '#18181b',
    webPreferences: {
      preload: path.join(ROOT, 'electron', 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  await win.loadFile(path.join(ROOT, 'dist', 'index.html'), {
    search: 'view=device&tab=lighting&profile=dv63',
  });

  // 等待页面初始挂载
  await new Promise((r) => setTimeout(r, 2000));

  console.log('--- 开始测试键盘常亮模式与单色切换 ---');

  const kbResult = await win.webContents.executeJavaScript(`
    (async () => {
      const log = {};

      // 1. 查找并点击 L1 常亮模式按钮
      const l1Btn = document.querySelector('button[title*="L1: 常亮模式"]');
      if (l1Btn) {
        l1Btn.click();
        log.l1Clicked = true;
      } else {
        log.l1Clicked = false;
      }
      await new Promise(r => setTimeout(r, 400));

      // 查找按键元素 (以第一排第一个键为检测标的)
      const firstKey = document.querySelector('button[title*="物理灯珠"]') || document.querySelector('button[title*="单键上下双灯珠"]');
      log.initialKeyBg = firstKey ? (firstKey.style.background || firstKey.style.backgroundColor) : 'none';

      // 2. 点击预设 #2 (橙色)
      const swatch2 = document.querySelector('button[title*="预设 #2"]') || document.querySelector('button[title*="#2"]');
      if (swatch2) {
        swatch2.click();
        await new Promise(r => setTimeout(r, 300));
        log.swatch2KeyBg = firstKey ? (firstKey.style.background || firstKey.style.backgroundColor) : 'none';
        log.swatch2HexInput = document.querySelector('input[type="text"][maxlength="6"]')?.value;
      }

      // 3. 点击预设 #5 (青色)
      const swatch5 = document.querySelector('button[title*="预设 #5"]') || document.querySelector('button[title*="#5"]');
      if (swatch5) {
        swatch5.click();
        await new Promise(r => setTimeout(r, 300));
        log.swatch5KeyBg = firstKey ? (firstKey.style.background || firstKey.style.backgroundColor) : 'none';
        log.swatch5HexInput = document.querySelector('input[type="text"][maxlength="6"]')?.value;
      }

      // 4. 在调色板中微调颜色为纯黄色 00FF88
      const hexInput = document.querySelector('input[type="text"][maxlength="6"]');
      if (hexInput) {
        // 使用原生 setter 触发 React 的 onChange / onInput
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(hexInput, '00FF88');
        hexInput.dispatchEvent(new Event('input', { bubbles: true }));
        hexInput.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 400));
        log.customHexKeyBg = firstKey ? (firstKey.style.background || firstKey.style.backgroundColor) : 'none';
        log.customHexVal = hexInput.value;
      }

      return log;
    })()
  `);

  console.log('键盘测试日志:', kbResult);

  // 截图键盘常亮单色效果
  const img1 = await win.webContents.capturePage();
  const shot1Path = path.join(ARTIFACT_DIR, 'verify_keyboard_static_mode_colors.png');
  fs.writeFileSync(shot1Path, img1.toPNG());
  console.log('已更新键盘验证截图:', shot1Path);

  console.log('--- 开始测试底灯常亮模式与单色切换 ---');

  const stripResult = await win.webContents.executeJavaScript(`
    (async () => {
      const log = {};

      // 1. 切换到 底灯 / 氛围灯带
      const stripAreaBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.trim() === '底灯 / 氛围灯带' || b.textContent.includes('底灯') || b.textContent.includes('氛围灯带')
      );
      if (stripAreaBtn) {
        stripAreaBtn.click();
        log.switchedToStrip = true;
      }
      await new Promise(r => setTimeout(r, 500));

      // 2. 点击底灯常亮单色模式 (L1)
      const stripL1 = document.querySelector('button[title*="L1: 常亮模式"]') || document.querySelector('button[title*="L1: 常亮"]');
      if (stripL1) {
        stripL1.click();
        log.stripL1Clicked = true;
      }
      await new Promise(r => setTimeout(r, 400));

      // 获取底灯导光条
      const stripBar = document.querySelector('div[style*="linear-gradient"]');
      log.initialStripBg = stripBar ? stripBar.style.background : 'none';

      // 3. 点击底灯单色预设 #3 (黄色)
      const swatch3 = document.querySelector('button[title*="预设 #3"]') || document.querySelector('button[title*="#3"]');
      if (swatch3) {
        swatch3.click();
        await new Promise(r => setTimeout(r, 400));
        log.swatch3StripBg = stripBar ? stripBar.style.background : 'none';
        log.swatch3Hex = document.querySelector('input[type="text"][maxlength="6"]')?.value;
      }

      // 4. 点击底灯单色预设 #6 (粉紫)
      const swatch6 = document.querySelector('button[title*="预设 #6"]') || document.querySelector('button[title*="#6"]');
      if (swatch6) {
        swatch6.click();
        await new Promise(r => setTimeout(r, 400));
        log.swatch6StripBg = stripBar ? stripBar.style.background : 'none';
        log.swatch6Hex = document.querySelector('input[type="text"][maxlength="6"]')?.value;
      }

      // 5. 底灯微调颜色为纯红洋红 FF0055
      const hexInput = document.querySelector('input[type="text"][maxlength="6"]');
      if (hexInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(hexInput, 'FF0055');
        hexInput.dispatchEvent(new Event('input', { bubbles: true }));
        hexInput.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 400));
        log.customStripBg = stripBar ? stripBar.style.background : 'none';
        log.customStripHex = hexInput.value;
      }

      return log;
    })()
  `);

  console.log('底灯测试日志:', stripResult);

  // 截图底灯常亮单色效果
  const img2 = await win.webContents.capturePage();
  const shot2Path = path.join(ARTIFACT_DIR, 'verify_strip_static_mode_colors.png');
  fs.writeFileSync(shot2Path, img2.toPNG());
  console.log('已更新底灯验证截图:', shot2Path);

  app.quit();
});

app.on('window-all-closed', () => app.quit());

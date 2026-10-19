const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true,
    backgroundColor: '#EBEDF0',
    webPreferences: { contextIsolation: false, nodeIntegration: true }
  });

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

  // 1. 测试触发设置页面代表键盘尺寸
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
    search: 'view=device&tab=trigger&profile=ae64'
  });
  await new Promise(r => setTimeout(r, 1500));

  const triggerKbRect = await win.webContents.executeJavaScript(`
    (() => {
      const kb = document.querySelector('[data-testid="interactive-keyboard-panel"]') || document.querySelector('.bg-\\\\[var\\\\(--bg-secondary\\\\)\\\\].rounded-\\\\[10px\\\\]') || document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (kb) {
        const rect = kb.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
      return null;
    })()
  `);
  console.log('Trigger Tab Keyboard Rect:', triggerKbRect);

  const shotTrigger = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_trigger_tab.png'), shotTrigger.toPNG());

  // 2. 测试死区设置页面代表键盘尺寸
  await win.webContents.executeJavaScript(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const deadzoneBtn = tabBtns.find(b => b.textContent.includes('死区设置'));
      if (deadzoneBtn) deadzoneBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const deadzoneKbRect = await win.webContents.executeJavaScript(`
    (() => {
      const kb = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (kb) {
        const rect = kb.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
      return null;
    })()
  `);
  console.log('Deadzone Tab Keyboard Rect:', deadzoneKbRect);

  const shotDeadzone = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_deadzone_tab.png'), shotDeadzone.toPNG());

  // 3. 测试改键配置页面代表键盘尺寸与下方 104 字符完整展现
  await win.webContents.executeJavaScript(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const keybindsBtn = tabBtns.find(b => b.textContent.includes('按键设置') || b.textContent.includes('改键'));
      if (keybindsBtn) keybindsBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const keybindsKbRect = await win.webContents.executeJavaScript(`
    (() => {
      const kb = document.querySelector('.shrink-0.h-\\\\[264px\\\\]');
      if (kb) {
        const rect = kb.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
      return null;
    })()
  `);
  console.log('Keybinds Tab Keyboard Rect:', keybindsKbRect);

  const shotKeybinds = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_keybinds_full_104.png'), shotKeybinds.toPNG());

  // 4. 测试高级按键页面 UI 布局
  await win.webContents.executeJavaScript(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const advBtn = tabBtns.find(b => b.textContent.includes('高级按键'));
      if (advBtn) advBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const shotAdv = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_advanced_fixed.png'), shotAdv.toPNG());

  // 5. 测试快捷指令 (宏录制) 页面工具栏
  await win.webContents.executeJavaScript(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const macroBtn = tabBtns.find(b => b.textContent.includes('快捷指令') || b.textContent.includes('宏'));
      if (macroBtn) macroBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const shotMacro = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_macro_toolbar.png'), shotMacro.toPNG());

  // 6. 测试轴体校准弹窗 (曲线在 0mm，混轴行程显示)
  await win.webContents.executeJavaScript(`
    (() => {
      const tabBtns = Array.from(document.querySelectorAll('button'));
      const switchBtn = tabBtns.find(b => b.textContent.includes('轴体设置'));
      if (switchBtn) switchBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const calBtn = btns.find(b => b.textContent.includes('轴体校准') || b.textContent.includes('全键校准'));
      if (calBtn) calBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const calData = await win.webContents.executeJavaScript(`
    (() => {
      const travelEl = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('mm') && el.textContent.length < 15);
      return {
        hasModal: !!document.querySelector('.fixed.inset-0'),
        travelText: travelEl ? travelEl.textContent : 'none'
      };
    })()
  `);
  console.log('Calibration Modal State:', calData);

  const shotCal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_ui_calibration_zero_baseline.png'), shotCal.toPNG());

  console.log('All verification screenshots captured successfully!');
  app.quit();
});

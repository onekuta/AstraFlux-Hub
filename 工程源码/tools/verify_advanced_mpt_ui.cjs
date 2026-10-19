const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[BROWSER CONSOLE ${level}] ${message} (${sourceId}:${line})`);
  });

  // 1. 打开高级键页面
  const urlAdvanced = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=es68&theme=light';
  await win.loadURL(urlAdvanced);
  await new Promise(r => setTimeout(r, 1500));

  // 2. 点击 MPT 卡片进入 MPT 编辑工作台
  await win.webContents.executeJavaScript(`
    const mptCard = document.querySelector('[data-mode-id="MPT"]');
    if (mptCard) {
      mptCard.click();
    }
  `);
  await new Promise(r => setTimeout(r, 800));

  // 绑定一个按键，如 'B'，给 stage 分配按键，如 'K', ',<', '.>' (与用户图一 media_1792219353703_67e28a8b.png 完全一致)
  await win.webContents.executeJavaScript(`
    // 模拟分配绑定键 B
    const bindSlot = document.querySelector('[data-slot-id="mpt_bind"]');
    if (bindSlot) bindSlot.click();
    const btnB = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'B');
    if (btnB) btnB.click();

    // 阶段 1 分配 K
    const stage0 = document.querySelector('[data-slot-id="stage_0"]');
    if (stage0) stage0.click();
    const btnK = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'K');
    if (btnK) btnK.click();

    // 阶段 2 分配 ,<
    const stage1 = document.querySelector('[data-slot-id="stage_1"]');
    if (stage1) stage1.click();
    const btnComma = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === ',<');
    if (btnComma) btnComma.click();

    // 阶段 3 分配 .>
    const stage2 = document.querySelector('[data-slot-id="stage_2"]');
    if (stage2) stage2.click();
    const btnDot = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '.>');
    if (btnDot) btnDot.click();
  `);
  await new Promise(r => setTimeout(r, 800));

  const imgMpt = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mpt_subinterface.png'), imgMpt.toPNG());
  console.log('Saved verify_mpt_subinterface.png');

  // 3. 测试通过键盘直接输入精确数值到微调框
  await win.webContents.executeJavaScript(`
    // 找到阶段 1 的数值输入框
    const inputs = document.querySelectorAll('input[type="text"][title*="键盘输入"]');
    if (inputs.length > 0) {
      const firstInput = inputs[0];
      firstInput.focus();
      firstInput.value = '0.8';
      firstInput.dispatchEvent(new Event('input', { bubbles: true }));
      firstInput.dispatchEvent(new Event('change', { bubbles: true }));
      firstInput.blur();
    }
  `);
  await new Promise(r => setTimeout(r, 600));

  const imgTyped = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mpt_typed_stepper.png'), imgTyped.toPNG());
  console.log('Saved verify_mpt_typed_stepper.png');

  // 4. 测试 MT 双效点击子界面
  await win.webContents.executeJavaScript(`
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('返回列表'));
    if (backBtn) backBtn.click();
  `);
  await new Promise(r => setTimeout(r, 400));
  await win.webContents.executeJavaScript(`
    const mtCard = document.querySelector('[data-mode-id="MT"]');
    if (mtCard) mtCard.click();
  `);
  await new Promise(r => setTimeout(r, 600));

  const imgMt = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mt_subinterface.png'), imgMt.toPNG());
  console.log('Saved verify_mt_subinterface.png');

  // 5. 测试暗色主题下的子界面显示
  await win.webContents.executeJavaScript(`
    document.documentElement.classList.add('dark');
  `);
  await new Promise(r => setTimeout(r, 400));
  const imgDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_mpt_dark.png'), imgDark.toPNG());
  console.log('Saved verify_mpt_dark.png');

  app.quit();
});

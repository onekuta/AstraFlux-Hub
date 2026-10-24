const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/31aaf3cf-ac99-4434-84bd-f0b85977629a';

  // ── 测试 1：驱动详情页滑块与铅笔编辑输入 (AP = 1.75mm) ──
  const driverUrl = `file://${path.resolve(__dirname, 'dist/index.html')}?view=device&tab=trigger&profile=es68`;
  await win.loadURL(driverUrl);
  await new Promise((r) => setTimeout(r, 1200));

  // 设置 AP 为 1.75mm (与用户截图 media_1791914955949_0b746091.png 一致)
  await win.webContents.executeJavaScript(`
    const pencil = document.querySelector('.vtravel-pencil-btn');
    if (pencil) pencil.click();
  `);
  await new Promise((r) => setTimeout(r, 400));
  await win.webContents.executeJavaScript(`
    const input = document.querySelector('.vtravel-bubble input');
    if (input) {
      input.value = '1.75';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
  `);
  await new Promise((r) => setTimeout(r, 600));

  // 截取 1.75mm 滑块渲染（检查右边距与完整性）
  const imgSliderNormal = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_slider_1_75mm_fixed.png'), imgSliderNormal.toPNG());
  console.log('Saved verify_slider_1_75mm_fixed.png');

  // 点击铅笔图标进入输入状态
  await win.webContents.executeJavaScript(`
    const pencil = document.querySelector('.vtravel-pencil-btn');
    if (pencil) pencil.click();
  `);
  await new Promise((r) => setTimeout(r, 500));
  const imgSliderEditing = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_slider_editing_fixed.png'), imgSliderEditing.toPNG());
  console.log('Saved verify_slider_editing_fixed.png');

  // ── 测试 2：首页点击「添加设备」卡片，拉起 AddDeviceModal ──
  const homeUrl = `file://${path.resolve(__dirname, 'dist/index.html')}?view=home`;
  await win.loadURL(homeUrl);
  await new Promise((r) => setTimeout(r, 1000));

  // 模拟点击「添加设备」卡片
  await win.webContents.executeJavaScript(`
    const addCards = Array.from(document.querySelectorAll('.group'));
    const target = addCards.find(el => el.textContent.includes('添加设备'));
    if (target) target.click();
  `);
  await new Promise((r) => setTimeout(r, 800));

  const imgAddDeviceModal = await win.capturePage();
  fs.writeFileSync(path.join(artifactDir, 'verify_add_device_modal.png'), imgAddDeviceModal.toPNG());
  console.log('Saved verify_add_device_modal.png');

  app.quit();
});

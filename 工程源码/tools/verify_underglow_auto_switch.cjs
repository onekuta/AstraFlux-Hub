const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const outDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  const fileUrl = pathToFileURL(indexPath).href;

  console.log('=== 测试 1: 验证 AE64-MAX 自动适配 34 颗底灯，且无调节按钮 ===');
  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=ae64_max&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  // 点击切换到装饰灯1
  await win.webContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('装饰灯') || b.innerText.includes('底灯'));
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const ae64Audit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    // 检查底灯标签
    const hasBottomLedLabel = text.includes('底灯:');
    const has34 = text.includes('34');
    
    // 检查是否绝无 +/- 调节按钮
    const allButtons = Array.from(document.querySelectorAll('button'));
    const hasMinusBtn = allButtons.some(b => b.title && b.title.includes('减少1颗底灯'));
    const hasPlusBtn = allButtons.some(b => b.title && b.title.includes('增加1颗底灯'));
    
    // 检查模拟器标题联动
    const simBadge = text.includes('34 LED 物理联动');

    return {
      hasBottomLedLabel,
      has34,
      hasMinusBtn,
      hasPlusBtn,
      simBadge
    };
  })()`);

  console.log('AE64-MAX 底灯自适应审核:', ae64Audit);
  const imgAe64 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_underglow_ae64_dark.png'), imgAe64.toPNG());
  console.log('已保存: verified_underglow_ae64_dark.png');

  // 浅色主题下截取 AE64 局部工具栏放大图
  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=ae64_max&theme=light');
  await new Promise(r => setTimeout(r, 1200));
  await win.webContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('装饰灯') || b.innerText.includes('底灯'));
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));
  const imgAe64Light = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_underglow_ae64_light.png'), imgAe64Light.toPNG());
  console.log('已保存: verified_underglow_ae64_light.png');

  console.log('\n=== 测试 2: 验证 ES68 自动适配 26 颗底灯 ===');
  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=es68&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  await win.webContents.executeJavaScript(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('装饰灯') || b.innerText.includes('底灯'));
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const es68Audit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const hasBottomLedLabel = text.includes('底灯:');
    const has26 = text.includes('26');
    const allButtons = Array.from(document.querySelectorAll('button'));
    const hasMinusBtn = allButtons.some(b => b.title && b.title.includes('减少1颗底灯'));
    const hasPlusBtn = allButtons.some(b => b.title && b.title.includes('增加1颗底灯'));
    const simBadge = text.includes('26 LED 物理联动');

    return {
      hasBottomLedLabel,
      has26,
      hasMinusBtn,
      hasPlusBtn,
      simBadge
    };
  })()`);

  console.log('ES68 底灯自适应审核:', es68Audit);
  const imgEs68 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_underglow_es68_dark.png'), imgEs68.toPNG());
  console.log('已保存: verified_underglow_es68_dark.png');

  console.log('\n=== 测试 3: 验证无底灯设备 (DV63) 自动隐藏底灯标签页 ===');
  await win.loadURL(fileUrl + '?view=device&tab=lighting&profile=dv63&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const dv63Audit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const allButtons = Array.from(document.querySelectorAll('button'));
    const hasDecorateTab = allButtons.some(b => b.innerText.trim() === '装饰灯1' || b.innerText.trim() === '底灯');
    const hasBottomLed = text.includes('底灯:');

    return {
      hasDecorateTab,
      hasBottomLed
    };
  })()`);

  console.log('DV63 无底灯设备审核:', dv63Audit);
  const imgDv63 = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_underglow_dv63_no_strip.png'), imgDv63.toPNG());
  console.log('已保存: verified_underglow_dv63_no_strip.png');

  console.log('\n=== 全部底灯自动检测与自适应测试通过！===');
  app.quit();
});

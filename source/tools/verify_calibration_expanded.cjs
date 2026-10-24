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

  console.log('=== 测试 1: 深色主题 - 展开说明 ===');
  await win.loadURL(fileUrl + '?view=device&tab=keys&profile=ae64_max&theme=dark&modal=calibration&calInstruct=true');
  await new Promise(r => setTimeout(r, 1400));
  const imgDarkExpanded = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_calibration_expanded_dark.png'), imgDarkExpanded.toPNG());
  console.log('已保存: verified_calibration_expanded_dark.png');

  console.log('=== 测试 2: 深色主题 - 收起说明 (验证下半部分自适应扩展填满) ===');
  await win.loadURL(fileUrl + '?view=device&tab=keys&profile=ae64_max&theme=dark&modal=calibration&calInstruct=false');
  await new Promise(r => setTimeout(r, 1400));
  const darkCollapsedMetrics = await win.webContents.executeJavaScript(`(() => {
    const modal = document.querySelector('.modal-title')?.closest('.max-h-\\\\[834px\\\\]') || document.querySelector('.modal-title')?.closest('div[class*="max-h"]');
    const waveTitle = Array.from(document.querySelectorAll('span, h4, div')).find(el => el.innerText && el.innerText.trim() === '实时行程深度波形监控');
    const waveCard = waveTitle?.closest('div[class*="rounded-[10px]"]');
    const monitorTitle = Array.from(document.querySelectorAll('span, h4, div')).find(el => el.innerText && el.innerText.trim() === '按键实时校准监控');
    const bottomSplit = monitorTitle?.closest('.grid-cols-12');

    const modalRect = modal?.getBoundingClientRect();
    const waveRect = waveCard?.getBoundingClientRect();
    const bottomRect = bottomSplit?.getBoundingClientRect();
    const bottomGap = modalRect && bottomRect ? (modalRect.bottom - bottomRect.bottom) : null;

    return {
      waveCardHeight: waveRect?.height,
      bottomSplitHeight: bottomRect?.height,
      bottomGap
    };
  })()`);
  console.log('深色模式 (收起说明) 布局度量:', darkCollapsedMetrics);
  const imgDarkCollapsed = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_calibration_collapsed_dark.png'), imgDarkCollapsed.toPNG());
  console.log('已保存: verified_calibration_collapsed_dark.png');

  console.log('=== 测试 3: 浅色主题 - 展开说明 ===');
  await win.loadURL(fileUrl + '?view=device&tab=keys&profile=ae64_max&theme=light&modal=calibration&calInstruct=true');
  await new Promise(r => setTimeout(r, 1400));
  const imgLightExpanded = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_calibration_expanded_light.png'), imgLightExpanded.toPNG());
  console.log('已保存: verified_calibration_expanded_light.png');

  console.log('=== 测试 4: 浅色主题 - 收起说明 ===');
  await win.loadURL(fileUrl + '?view=device&tab=keys&profile=ae64_max&theme=light&modal=calibration&calInstruct=false');
  await new Promise(r => setTimeout(r, 1400));
  const imgLightCollapsed = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_calibration_collapsed_light.png'), imgLightCollapsed.toPNG());
  console.log('已保存: verified_calibration_collapsed_light.png');

  console.log('=== 全部验证截图已成功生成！===');
  app.quit();
});

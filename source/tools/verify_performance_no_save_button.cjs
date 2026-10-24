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

  console.log('=== 测试 1: 验证性能设置页 (Dark 模式) ===');
  await win.loadURL(fileUrl + '?view=device&tab=performance&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const darkAudit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const allButtons = Array.from(document.querySelectorAll('button'));
    
    // 检查是否存在任何手动保存按钮
    const hasSaveBtn = allButtons.some(b => b.innerText.includes('保存'));
    
    // 检查是否显示自动同步状态指示徽标
    const hasAutoSyncBadge = text.includes('配置实时自动同步生效中') || text.includes('实时自动同步');
    
    // 检查设备信息与回报率底栏信息
    const hasRateInfo = text.includes('当前回报率:') || text.includes('当前回报率');
    
    return {
      hasSaveBtn,
      hasAutoSyncBadge,
      hasRateInfo,
      buttonTexts: allButtons.map(b => b.innerText.trim()).filter(Boolean)
    };
  })()`);

  console.log('Dark 模式审核结果:', darkAudit);

  const darkShot = path.join(outDir, 'verified_performance_tab_dark.png');
  const darkBuf = await win.webContents.capturePage();
  fs.writeFileSync(darkShot, darkBuf.toPNG());
  console.log('Dark 截图已保存:', darkShot);

  console.log('=== 测试 2: 验证性能设置页 (Light 模式) ===');
  await win.loadURL(fileUrl + '?view=device&tab=performance&theme=light');
  await new Promise(r => setTimeout(r, 1200));

  const lightAudit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const allButtons = Array.from(document.querySelectorAll('button'));
    const hasSaveBtn = allButtons.some(b => b.innerText.includes('保存'));
    const hasAutoSyncBadge = text.includes('配置实时自动同步生效中') || text.includes('实时自动同步');
    return {
      hasSaveBtn,
      hasAutoSyncBadge
    };
  })()`);

  console.log('Light 模式审核结果:', lightAudit);

  const lightShot = path.join(outDir, 'verified_performance_tab_light.png');
  const lightBuf = await win.webContents.capturePage();
  fs.writeFileSync(lightShot, lightBuf.toPNG());
  console.log('Light 截图已保存:', lightShot);

  app.quit();
});

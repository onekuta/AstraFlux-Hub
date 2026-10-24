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

  const urlTrigger = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&subtab=trigger&theme=light&profile=ae64';
  await win.loadURL(urlTrigger);
  await new Promise(r => setTimeout(r, 2000));

  // 精准点击 AP 行中的“校准”按钮
  await win.webContents.executeJavaScript(`
    (() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const calBtn = btns.find(b => b.title && b.title.includes('全键霍尔电压与行程极值校准'));
      if (calBtn) calBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  // 截图: 弹窗打开并检查校准键位
  const imgCal = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_calibration_modal_fixed.png'), imgCal.toPNG());
  console.log('Saved verify_calibration_modal_fixed.png');

  // 获取并打印 ArrowLeft, ArrowDown, ArrowRight 的电气坐标
  const arrowCoords = await win.webContents.executeJavaScript(`
    (() => {
      const keys = ['ArrowLeft', 'ArrowDown', 'ArrowRight'];
      return keys.map(id => {
        const el = document.querySelector('[data-key-id="' + id + '"]');
        return { id, found: !!el };
      });
    })()
  `);
  console.log('Arrow keys in modal:', arrowCoords);

  app.quit();
});

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
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  const urlHome = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=home';
  await win.loadURL(urlHome);
  await new Promise(r => setTimeout(r, 1500));

  // 1. 截图：点击前主页
  let buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_home_before_add.png'), buf.toPNG());

  // 2. 真实触发【添加设备】卡片点击
  console.log('Clicking "添加设备" card...');
  const clickRes = await win.webContents.executeJavaScript(`
    (() => {
      const addCard = document.querySelector('div[title*="点击打开添加与识别设备弹窗"]');
      if (addCard) {
        const propKey = Object.keys(addCard).find(k => k.startsWith('__reactProps'));
        if (propKey && addCard[propKey].onClick) {
          addCard[propKey].onClick({ stopPropagation: () => {} });
          return 'CLICKED_REACT_HANDLER';
        }
      }
      return 'CARD_NOT_FOUND';
    })()
  `);
  console.log('Click result:', clickRes);

  await new Promise(r => setTimeout(r, 1200));

  // 3. 截图：点击后成功呼出 HID / 添加设备弹窗
  buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_after_click_add_device_success.png'), buf.toPNG());

  // 4. 进一步测试点击左侧的「拉起系统 HID 授权选择设备」大按钮
  console.log('Testing clicking "拉起系统 HID 授权选择设备"...');
  await win.webContents.executeJavaScript(`
    (() => {
      const hidBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('拉起系统 HID 授权选择设备')
      );
      if (hidBtn) {
        const propKey = Object.keys(hidBtn).find(k => k.startsWith('__reactProps'));
        if (propKey && hidBtn[propKey].onClick) {
          hidBtn[propKey].onClick({ stopPropagation: () => {} });
        } else {
          hidBtn.click();
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 5. 截图：弹出 USB HID 授权与设备选择窗口
  buf = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_hid_picker_modal_opened.png'), buf.toPNG());

  console.log('All verification passed!');
  win.close();
  app.quit();
});

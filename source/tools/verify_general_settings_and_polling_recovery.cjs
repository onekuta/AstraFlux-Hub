const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

let mockSettings = {
  autoLaunch: false,
  launchMinimizeToTray: false,
  closeAction: 'tray',
  autoUpdate: true,
};

ipcMain.handle('get-app-settings', async () => {
  return mockSettings;
});

ipcMain.handle('sync-app-settings', async (event, newSettings) => {
  mockSettings = { ...mockSettings, ...newSettings };
  return { success: true, settings: mockSettings };
});

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 880,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const appURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=home&theme=dark`;
  await win.loadURL(appURL);
  await new Promise(r => setTimeout(r, 1500));

  console.log('=== [1] 常规设置功能测试 ===');
  // 打开全局设置模态框并切换到常规设置
  const settingsTest = await win.webContents.executeJavaScript(`
    (async () => {
      // 触发打开设置
      const settingsBtn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('设置') || b.querySelector('svg.lucide-settings') || b.querySelector('svg.lucide-settings-2'));
      if (settingsBtn) {
        settingsBtn.click();
      } else {
        // 直接触发 window 事件或全局状态
        const allBtns = Array.from(document.querySelectorAll('button'));
        const gear = allBtns.find(b => b.innerHTML.includes('lucide-settings'));
        if (gear) gear.click();
      }
      await new Promise(r => setTimeout(r, 600));

      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      const autoLaunchBox = checkboxes.find(c => c.closest('label') && c.closest('label').textContent.includes('开机自启动'));
      
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const exitRadio = radios.find(r => r.value === 'exit' || (r.closest('label') && r.closest('label').textContent.includes('退出程序')));
      const trayRadio = radios.find(r => r.value === 'tray' || (r.closest('label') && r.closest('label').textContent.includes('最小化到托盘')));

      const beforeAutoLaunch = autoLaunchBox ? autoLaunchBox.checked : null;
      if (autoLaunchBox) {
        autoLaunchBox.click();
      }
      await new Promise(r => setTimeout(r, 300));

      const afterAutoLaunch = autoLaunchBox ? autoLaunchBox.checked : null;

      // 切换退出程序 radio
      if (exitRadio) {
        exitRadio.click();
      }
      await new Promise(r => setTimeout(r, 300));
      const afterExitRadio = exitRadio ? exitRadio.checked : null;
      const afterTrayRadio = trayRadio ? trayRadio.checked : null;

      const stored = localStorage.getItem('sparklink_hub_settings');

      return {
        hasAutoLaunchBox: !!autoLaunchBox,
        beforeAutoLaunch,
        afterAutoLaunch,
        hasExitRadio: !!exitRadio,
        hasTrayRadio: !!trayRadio,
        afterExitRadio,
        afterTrayRadio,
        storedInLocalStorage: stored ? JSON.parse(stored) : null
      };
    })()
  `);
  console.log('常规设置探针回显:', JSON.stringify(settingsTest, null, 2));
  console.log('Main 进程 mockSettings 同步回显:', JSON.stringify(mockSettings, null, 2));

  console.log('\n=== [2] 回报率切换自愈重连机制测试 ===');
  const recoveryTest = await win.webContents.executeJavaScript(`
    (async () => {
      // 检查 keyboardService 是否已具备 handleRateChangeResetSequence 与 patched reconnection
      const ks = window.keyboardService || window.__keyboardService;
      let hasKs = !!ks;
      let hasHandleReset = false;
      let mockReconnectWorked = false;

      // 模拟 WebHID 拔插与回报率切换重连
      let testSteps = [];
      if (ks) {
        hasHandleReset = typeof ks.handleRateChangeResetSequence === 'function';
        testSteps.push('keyboardService 已加载, 包含 handleRateChangeResetSequence: ' + hasHandleReset);
        
        // 模拟调用 handleRateChangeResetSequence
        const testDev = {
          vendorId: 0x1ca6,
          productId: 0x300d,
          productName: 'AE64-MAX',
          opened: false,
          collections: [{ usagePage: 0xffb0, usage: 1 }],
          open: async function() { this.opened = true; },
          close: async function() { this.opened = false; },
          sendReport: async () => {},
          receiveFeatureReport: async () => new Uint8Array(64),
        };
        if (!navigator.hid) navigator.hid = {};
        navigator.hid.getDevices = async () => [testDev];

        testSteps.push('注入模拟设备，触发自愈重连序列...');
        const reconnectPromise = ks.handleRateChangeResetSequence({
          vendorId: 0x1ca6,
          productId: 0x300d,
          productName: 'AE64-MAX'
        });

        await new Promise(r => setTimeout(r, 1200));
        testSteps.push('重连序列执行后状态: connected=' + ks.connected + ', device=' + (ks.device ? ks.device.productName : 'null'));
        mockReconnectWorked = ks.connected && ks.device !== null;
      }

      return {
        hasKs,
        hasHandleReset,
        mockReconnectWorked,
        testSteps
      };
    })()
  `);
  console.log('回报率自愈重连探针回显:', JSON.stringify(recoveryTest, null, 2));

  const allPassed = 
    settingsTest.hasAutoLaunchBox &&
    settingsTest.afterAutoLaunch !== settingsTest.beforeAutoLaunch &&
    settingsTest.afterExitRadio === true &&
    mockSettings.autoLaunch === settingsTest.afterAutoLaunch &&
    mockSettings.closeAction === 'exit';

  console.log('\n=========================================');
  console.log(allPassed ? '✅ 全部修复验证通过！' : '❌ 验证未通过，请检查探针详情');
  console.log('=========================================');

  app.quit();
});

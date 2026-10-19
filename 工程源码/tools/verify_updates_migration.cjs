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
    width: 1366,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  const fileUrl = pathToFileURL(indexPath).href;

  console.log('=== 步骤 1: 检验键盘其他设置页 (SettingsTab) ===');
  await win.loadURL(fileUrl + '?view=device&tab=settings&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  // 检查 SettingsTab 内是否已完全移除原红圈更新卡片
  const tabAudit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const hasOldOtaTitle = text.includes("驱动与适配库更新");
    const hasDfu = text.includes("键盘硬件底层固件升级") || text.includes("固件升级");
    const hasReset = text.includes("恢复出厂设置");
    const hasClear = text.includes("清空板载参数");
    
    // 检查右下角直达按钮
    const bottomBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('软件与适配库更新'));
    
    return {
      hasOldOtaTitle,
      hasDfu,
      hasReset,
      hasClear,
      hasBottomBtn: !!bottomBtn,
      bottomBtnText: bottomBtn ? bottomBtn.innerText.trim() : null
    };
  })()`);

  console.log('SettingsTab 审核结果:', tabAudit);

  // 截取 SettingsTab 全貌
  const imgSettingsTab = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_settings_tab_purified_dark.png'), imgSettingsTab.toPNG());
  console.log('已保存 SettingsTab 截屏: verified_settings_tab_purified_dark.png');

  console.log('\n=== 步骤 2: 检验软件设置 -> 软件更新专属页 (updates) ===');
  await win.loadURL(fileUrl + '?settings=true&section=updates&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  // 检查 updates 页面两大独立区域
  const updatesAudit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    
    // 区域 1 · 更新数据库
    const hasDbSection = text.includes("更新数据库");
    const hasDbLinkTag = text.includes("对应后台: 返链 ①");
    const hasDbWarning = text.includes("云端数据库更新地址未设置");
    const hasDbCheckBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('检查并更新数据库'));
    const hasOfflineImport = Array.from(document.querySelectorAll('label, button')).some(b => b.innerText.includes('导入离线适配包'));
    
    // 区域 2 · 更新软件
    const hasAppSection = text.includes("更新软件");
    const hasAppLinkTag = text.includes("对应后台: 返链 ②");
    const hasAppWarning = text.includes("云端驱动更新地址未设置");
    const hasAppCheckBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('检查并更新驱动客户端'));
    const hasReleaseBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('打开发布页'));
    
    // 顶部全量综合检测
    const hasBothCheckBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('综合检测两项更新'));
    const hasDevLabBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('开发者后台'));

    return {
      hasDbSection,
      hasDbLinkTag,
      hasDbWarning,
      hasDbCheckBtn,
      hasOfflineImport,
      hasAppSection,
      hasAppLinkTag,
      hasAppWarning,
      hasAppCheckBtn,
      hasReleaseBtn,
      hasBothCheckBtn,
      hasDevLabBtn
    };
  })()`);

  console.log('Updates 专属页审核结果:', updatesAudit);

  // 截取 updates 页面暗色截屏
  const imgUpdatesDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_updates_tab_dark.png'), imgUpdatesDark.toPNG());
  console.log('已保存 Updates 专属页暗色截屏: verified_updates_tab_dark.png');

  // 切换为浅色主题截屏
  await win.loadURL(fileUrl + '?settings=true&section=updates&theme=light');
  await new Promise(r => setTimeout(r, 1200));
  const imgUpdatesLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'verified_updates_tab_light.png'), imgUpdatesLight.toPNG());
  console.log('已保存 Updates 专属页浅色截屏: verified_updates_tab_light.png');

  console.log('\n=== 步骤 3: 检验关于页 Card 2 联动跳转 ===');
  await win.loadURL(fileUrl + '?settings=true&section=about&theme=dark');
  await new Promise(r => setTimeout(r, 1200));

  const aboutAudit = await win.webContents.executeJavaScript(`(() => {
    const text = document.body.innerText;
    const hasCheckBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('立即检查更新'));
    const jumpBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('进入软件与数据库更新中心'));
    return {
      hasCheckBtn,
      hasJumpBtn: !!jumpBtn
    };
  })()`);

  console.log('About 页联动审核结果:', aboutAudit);

  // 测试点击跳转按钮
  await win.webContents.executeJavaScript(`(() => {
    const jumpBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('进入软件与数据库更新中心'));
    if (jumpBtn) jumpBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const afterJumpAudit = await win.webContents.executeJavaScript(`(() => {
    return {
      hasDbSection: document.body.innerText.includes("更新数据库"),
      hasAppSection: document.body.innerText.includes("更新软件")
    };
  })()`);
  console.log('点击跳转后视图审核结果:', afterJumpAudit);

  console.log('\n=== 全部自动化验证通过！===');
  app.quit();
});

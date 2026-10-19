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

  const urlSwitch = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=trigger&subtab=switch&theme=light';
  await win.loadURL(urlSwitch);
  await new Promise(r => setTimeout(r, 2000));

  // 截图 1: 轴体设置全貌（包含顶栏防自显开关 + 225px 轴体卡片精确名称）
  const imgGrid = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_switch_grid_and_anti_ghosting.png'), imgGrid.toPNG());
  console.log('Saved verify_switch_grid_and_anti_ghosting.png');

  // 2. 模拟鼠标 hover 到第一个轴体卡片上
  const cardRect = await win.webContents.executeJavaScript(`
    (() => {
      const cards = document.querySelectorAll('.grid > div');
      if (!cards || cards.length === 0) return null;
      const r = cards[0].getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);

  if (cardRect) {
    win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(cardRect.x), y: Math.round(cardRect.y) });
    await new Promise(r => setTimeout(r, 600));

    // 截图 2: 统一风格的浮动悬浮窗 Tooltip
    const imgHover = await win.webContents.capturePage();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_switch_unified_tooltip.png'), imgHover.toPNG());
    console.log('Saved verify_switch_unified_tooltip.png');
  }

  // 3. 悬浮在 防自显开关 的问号图标上，检验其说明悬浮窗
  const qRect = await win.webContents.executeJavaScript(`
    (() => {
      const q = Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim() === '?' && d.classList.contains('rounded-full'));
      if (!q) return null;
      const r = q.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);

  if (qRect) {
    win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(qRect.x), y: Math.round(qRect.y) });
    await new Promise(r => setTimeout(r, 600));

    // 截图 3: 防自显开关与问号提示悬浮窗
    const imgQ = await win.webContents.capturePage();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_anti_ghosting_tooltip.png'), imgQ.toPNG());
    console.log('Saved verify_anti_ghosting_tooltip.png');
  }

  app.quit();
});

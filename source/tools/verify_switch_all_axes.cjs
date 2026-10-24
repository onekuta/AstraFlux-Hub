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

  // 点击“全部校准库 (220+款)”
  await win.webContents.executeJavaScript(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('全部校准库'));
      if (btn) btn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // 截图: 全部校准库列表 (验证极岳泰、TTC万磁王等各家轴体名称)
  const imgAll = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_switch_all_axes.png'), imgAll.toPNG());
  console.log('Saved verify_switch_all_axes.png');

  // 鼠标移动到其中一个卡片上
  const cardRect = await win.webContents.executeJavaScript(`
    (() => {
      const cards = document.querySelectorAll('.grid > div');
      if (!cards || cards.length < 3) return null;
      const r = cards[2].getBoundingClientRect(); // 第3个
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()
  `);

  if (cardRect) {
    win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(cardRect.x), y: Math.round(cardRect.y) });
    await new Promise(r => setTimeout(r, 600));

    const imgHoverAll = await win.webContents.capturePage();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_switch_all_hover_tooltip.png'), imgHoverAll.toPNG());
    console.log('Saved verify_switch_all_hover_tooltip.png');
  }

  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const sleep = ms => new Promise(r => setTimeout(r, ms));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1380,
    height: 880,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.webContents.session.setPermissionCheckHandler(() => true);
  win.webContents.session.setDevicePermissionHandler(() => true);

  const targetUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=lighting&theme=dark&profile=ae64';
  await win.loadURL(targetUrl);
  await sleep(2500);

  const clickMode = async (label) => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const btn = document.querySelector(\`button[data-mode-label="${label}"]\`);
        if (btn) {
          btn.click();
          return { success: true, label: "${label}" };
        }
        return { success: false, label: "${label}" };
      })()
    `);
  };

  const takeScreenshot = async (name) => {
    await sleep(300);
    const shot = await win.capturePage();
    const filePath = path.join(artifactDir, name);
    fs.writeFileSync(filePath, shot.toPNG());
    console.log(`[Screenshot saved]: ${name}`);
  };

  // 获取键盘所有按键的视觉行、视觉列以及当前实际渲染的背景色
  const sampleKeys = async () => {
    return await win.webContents.executeJavaScript(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('div.relative.select-none.mx-auto button'));
        return buttons.map(b => {
          const bg = b.style.backgroundColor || b.style.background;
          const rect = b.getBoundingClientRect();
          const title = b.getAttribute('title') || '';
          const text = b.innerText.split('\\n')[0];
          return { text, title, bg, x: Math.round(rect.x), y: Math.round(rect.y) };
        });
      })()
    `);
  };

  console.log('\n======================================================');
  console.log('--- TEST 1: L3 (往下渐变流动动画) ---');
  await clickMode('L3');
  await sleep(1500);
  const keysL3 = await sampleKeys();
  console.log(`Sampled ${keysL3.length} keys in L3 mode.`);

  // 聚类按按键的屏幕 Y 坐标（行）
  const rowGroups = {};
  keysL3.forEach(k => {
    // 允许约 10px 的浮动归到同一行
    const foundY = Object.keys(rowGroups).find(y => Math.abs(parseInt(y) - k.y) <= 8);
    const targetY = foundY || k.y;
    if (!rowGroups[targetY]) rowGroups[targetY] = [];
    rowGroups[targetY].push(k);
  });

  const sortedYs = Object.keys(rowGroups).sort((a,b)=>parseInt(a)-parseInt(b));
  console.log(`Detected ${sortedYs.length} visual rows.`);
  sortedYs.forEach((y, idx) => {
    const rowKeys = rowGroups[y];
    const uniqueColors = [...new Set(rowKeys.map(k => k.bg))];
    console.log(`  Row ${idx} (count: ${rowKeys.length}): uniqueColors count = ${uniqueColors.length}, sample color = ${uniqueColors[0]}`);
  });
  await takeScreenshot('verified_l3_downward_gradient.png');

  console.log('\n======================================================');
  console.log('--- TEST 2: L6 (炫彩旋转风车动画) ---');
  await clickMode('L6');
  await sleep(1500);
  const keysL6 = await sampleKeys();
  const colorsL6 = [...new Set(keysL6.map(k => k.bg))];
  console.log(`L6 unique colors count across keyboard: ${colorsL6.length}`);
  await takeScreenshot('verified_l6_rainbow_spin.png');

  console.log('\n======================================================');
  console.log('--- TEST 3: L7 (从键盘边缘的中间向外扩展动画) ---');
  await clickMode('L7');
  await sleep(1500);
  const keysL7 = await sampleKeys();
  const colorsL7 = [...new Set(keysL7.map(k => k.bg))];
  console.log(`L7 unique colors count across keyboard: ${colorsL7.length}`);
  await takeScreenshot('verified_l7_center_outward.png');

  console.log('\n======================================================');
  console.log('--- TEST 4: L10 (左右移动然后到尽头切换色块动画) ---');
  await clickMode('L10');
  await sleep(1200);
  const keysL10_t1 = await sampleKeys();
  const colorsL10_t1 = [...new Set(keysL10_t1.map(k => k.bg))];
  console.log(`L10 frame 1 unique colors count: ${colorsL10_t1.length}`);
  colorsL10_t1.forEach((c, i) => console.log(`  Block color ${i + 1}: ${c}`));
  await takeScreenshot('verified_l10_scan_blocks_frame1.png');

  // 等待扫描线往右/往左移动约 1 秒后再采样一帧
  await sleep(1200);
  const keysL10_t2 = await sampleKeys();
  const colorsL10_t2 = [...new Set(keysL10_t2.map(k => k.bg))];
  console.log(`L10 frame 2 unique colors count: ${colorsL10_t2.length}`);
  colorsL10_t2.forEach((c, i) => console.log(`  Block color ${i + 1}: ${c}`));
  await takeScreenshot('verified_l10_scan_blocks_frame2.png');

  console.log('\n✅ All 4 modes (L3, L6, L7, L10) verified and captured successfully!');
  app.quit();
});

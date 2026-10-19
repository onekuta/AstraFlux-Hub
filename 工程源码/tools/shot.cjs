// 界面截图回归工具（开发用）
// 用法：npx electron tools/shot.cjs --tab=lighting
//      可用 tab: trigger | lighting | keybinds | advanced | performance | settings
// 产物默认输出到 ../../项目文档/界面预览/<tab>.png
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const ROOT = path.join(__dirname, '..');

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith('--' + k + '='));
  return hit ? hit.split('=').slice(1).join('=') : d;
};

const view = arg('view', 'device');
const tab = arg('tab', 'trigger');
const profile = arg('profile', 'dv63');
const theme = arg('theme', 'light');
const out = arg('out', path.join(ROOT, '..', '项目文档', '界面预览', `${profile}-${tab}.png`));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
    useContentSize: true,
    backgroundColor: '#EBEDF0',
    webPreferences: {
      preload: path.join(ROOT, 'electron', 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  win.webContents.on('console-message', (e, level, message) => {
    console.log('[BROWSER CONSOLE]', message);
  });

  await win.loadFile(path.join(ROOT, 'dist', 'index.html'), {
    search: view === 'home' ? 'view=home' : `view=device&tab=${tab}&profile=${profile}`,
  });
  if (theme === 'dark') {
    await win.webContents.executeJavaScript(
      `try { localStorage.setItem('eweadn-theme','dark'); document.documentElement.setAttribute('data-theme','dark'); } catch(e){}`
    );
  } else {
    await win.webContents.executeJavaScript(
      `try { localStorage.setItem('eweadn-theme','light'); document.documentElement.setAttribute('data-theme','light'); } catch(e){}`
    );
  }
  await new Promise((r) => setTimeout(r, 2600));

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const img = await win.webContents.capturePage();
  fs.writeFileSync(out, img.toPNG());
  console.log('SAVED ' + out + ' bytes=' + fs.statSync(out).size);
  app.quit();
});

app.on('window-all-closed', () => app.quit());

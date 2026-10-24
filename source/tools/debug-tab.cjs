// 页面调试工具：加载指定 tab，回显 console 与未捕获异常
// 用法：electron tools/debug-tab.cjs --tab=settings --profile=es68
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ROOT = path.join(__dirname, '..');
const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith('--' + k + '='));
  return hit ? hit.split('=').slice(1).join('=') : d;
};
const tab = arg('tab', 'settings');
const profile = arg('profile', 'es68');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440, height: 900, show: false, useContentSize: true,
    webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: false, nodeIntegration: false },
  });
  win.webContents.on('console-message', (e, level, message, line, source) => {
    console.log(`[console:${level}] ${message}  (${source}:${line})`);
  });
  win.webContents.on('render-process-gone', (e, d) => console.log('[render-gone] ' + JSON.stringify(d)));
  try {
    await win.loadFile(path.join(ROOT, 'dist', 'index.html'), {
      search: `view=device&tab=${tab}&profile=${profile}`,
    });
  } catch (err) {
    console.log('[load-error] ' + err.message);
  }
  await new Promise((r) => setTimeout(r, 3000));
  const state = await win.webContents.executeJavaScript(
    `JSON.stringify({
       rootHtmlLen: (document.getElementById('root')||{}).innerHTML ? document.getElementById('root').innerHTML.length : -1,
       bodyText: document.body.innerText.replace(/\\s+/g,' ').slice(0,200)
     })`
  ).catch((e) => 'EVAL_ERR ' + e.message);
  console.log('STATE ' + state);
  app.quit();
});
app.on('window-all-closed', () => app.quit());

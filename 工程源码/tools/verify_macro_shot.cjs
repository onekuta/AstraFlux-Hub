const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9334'], { stdio: 'ignore' });
  appProc.unref();
  await sleep(1800);

  const res = await fetch('http://127.0.0.1:9334/json');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let curId = 0;
  const handlers = {};
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.id && handlers[data.id]) {
      handlers[data.id](data);
      delete handlers[data.id];
    }
  };

  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++curId;
    handlers[id] = resolve;
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Navigate to macro tab with dark theme
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=macro&profile=es68&theme=dark';
      location.href = url;
    })()`
  });
  await sleep(2000);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_macro_official_style_dark.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_macro_official_style_dark.png');

  // Also click on M5 to verify selection indicator
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const m5 = btns.find(b => b.textContent.trim() === 'M5');
      if (m5) m5.click();
    })()`
  });
  await sleep(800);

  let shotM5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_macro_m5_selected.png'), Buffer.from(shotM5.result.data, 'base64'));
  console.log('Saved verify_macro_m5_selected.png');

  // Close browser / kill proc
  await send('Browser.close').catch(() => {});
  try {
    process.kill(appProc.pid);
  } catch (e) {}
  process.exit(0);
})();

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9335'], { stdio: 'ignore' });
  appProc.unref();
  await sleep(1800);

  const res = await fetch('http://127.0.0.1:9335/json');
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

  // 1. Light theme performance tab (matches user screenshot media_1792264761001_c060dfee.png)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=performance&profile=ae64&theme=light';
      location.href = url;
    })()`
  });
  await sleep(2000);

  let shotLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_rt_ticks_light.png'), Buffer.from(shotLight.result.data, 'base64'));
  console.log('Saved verify_rt_ticks_light.png');

  // 2. Dark theme
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=performance&profile=ae64&theme=dark';
      location.href = url;
    })()`
  });
  await sleep(1500);

  let shotDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_rt_ticks_dark.png'), Buffer.from(shotDark.result.data, 'base64'));
  console.log('Saved verify_rt_ticks_dark.png');

  // Close browser / kill proc
  await send('Browser.close').catch(() => {});
  try {
    process.kill(appProc.pid);
  } catch (e) {}
  process.exit(0);
})();

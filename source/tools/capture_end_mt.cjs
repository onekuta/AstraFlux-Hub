const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9340'], { stdio: 'ignore' });
  appProc.unref();
  await new Promise(r => setTimeout(r, 2000));

  const res = await fetch('http://127.0.0.1:9340/json');
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

  await send('Runtime.evaluate', {
    expression: `(() => {
      location.href = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64&theme=light';
    })()`
  });
  await new Promise(r => setTimeout(r, 2200));

  // Open END editor
  await send('Runtime.evaluate', {
    expression: `(() => {
      const leftEnd = document.querySelector('button[data-mode-id="END"]');
      if (leftEnd) leftEnd.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const shotEnd = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_end_current.png'), Buffer.from(shotEnd.result.data, 'base64'));

  // Cancel and open MT
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '取消');
      if (cancelBtn) cancelBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const leftMt = document.querySelector('button[data-mode-id="MT"]');
      if (leftMt) leftMt.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const shotMt = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_mt_current.png'), Buffer.from(shotMt.result.data, 'base64'));

  // Open MPT
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '取消');
      if (cancelBtn) cancelBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const leftMpt = document.querySelector('button[data-mode-id="MPT"]');
      if (leftMpt) leftMpt.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const shotMpt = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_mpt_current.png'), Buffer.from(shotMpt.result.data, 'base64'));

  console.log('Done capturing current END, MT, MPT screens');

  await send('Browser.close').catch(() => {});
  try { process.kill(appProc.pid); } catch(e) {}
  process.exit(0);
})();

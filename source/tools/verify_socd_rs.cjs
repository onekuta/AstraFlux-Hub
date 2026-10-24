const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9336'], { stdio: 'ignore' });
  appProc.unref();
  await sleep(1800);

  const res = await fetch('http://127.0.0.1:9336/json');
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

  // Load advanced tab in light theme
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64&theme=light';
      location.href = url;
    })()`
  });
  await sleep(2000);

  // Set SOCD with A and D, and RS with W and S
  await send('Runtime.evaluate', {
    expression: `(() => {
      const advancedData = [
        { 
          id: 'socd-A-D', 
          type: 'SOCD', 
          name: '设定优先 (SOCD: A / D)', 
          keys: ['A', 'D'], 
          desc: '最后输入优先级 · 0ms延迟',
          data: { bind1: 'A', bind2: 'D', mode: 0, delay: 0 }
        },
        { 
          id: 'rs-W-S', 
          type: 'RS', 
          name: '迅洁 (RS: W / S)', 
          keys: ['W', 'S'], 
          desc: '相对运动急停 · 0ms延迟',
          data: { bind1: 'W', bind2: 'S', mode: 0, delay: 0 }
        }
      ];
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('sparklink_configured_higher_keys_')) {
          localStorage.setItem(k, JSON.stringify(advancedData));
        }
      });
      localStorage.setItem('sparklink_configured_higher_keys_profile_ae64', JSON.stringify(advancedData));
      localStorage.setItem('sparklink_configured_higher_keys_profile_ae64_max', JSON.stringify(advancedData));
    })()`
  });
  await sleep(300);
  await send('Page.reload');
  await sleep(2200);

  // 1. Take screenshot showing BOTH A and D have [SOCD], and BOTH W and S have [RS]
  let shotOverview = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_socd_rs_mutual_badges.png'), Buffer.from(shotOverview.result.data, 'base64'));
  console.log('Saved verify_socd_rs_mutual_badges.png');

  // 2. Click on SOCD to open editor mode
  await send('Runtime.evaluate', {
    expression: `(() => {
      const socdCard = Array.from(document.querySelectorAll('div, button')).find(el => el.textContent && el.textContent.includes('设定优先 (SOCD: A / D)'));
      if (socdCard) socdCard.click();
    })()`
  });
  await sleep(1000);

  let shotSocdEditor = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_socd_editor_2keys.png'), Buffer.from(shotSocdEditor.result.data, 'base64'));
  console.log('Saved verify_socd_editor_2keys.png');

  // 3. Go back to overview, then click RS to open RS editor
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === '取消');
      if (cancelBtn) cancelBtn.click();
    })()`
  });
  await sleep(800);

  await send('Runtime.evaluate', {
    expression: `(() => {
      const rsCard = Array.from(document.querySelectorAll('div, button')).find(el => el.textContent && el.textContent.includes('迅洁 (RS: W / S)'));
      if (rsCard) rsCard.click();
    })()`
  });
  await sleep(1000);

  let shotRsEditor = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_rs_editor_2keys.png'), Buffer.from(shotRsEditor.result.data, 'base64'));
  console.log('Saved verify_rs_editor_2keys.png');

  // Close browser / kill proc
  await send('Browser.close').catch(() => {});
  try {
    process.kill(appProc.pid);
  } catch (e) {}
  process.exit(0);
})();

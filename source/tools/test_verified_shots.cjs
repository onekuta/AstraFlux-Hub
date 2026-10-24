const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';
  const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
  appProc.unref();
  await sleep(1500);

  const res = await fetch('http://127.0.0.1:9333/json');
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

  // Find scopeKey and set higher keys
  const resScope = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all localStorage keys starting with sparklink_configured_higher_keys
      const keys = Object.keys(localStorage);
      const advancedData = [
        { id: 'item_1', type: 'SOCD', keys: ['A', 'D'], name: '对冲覆盖 (A / D)' },
        { id: 'item_2', type: 'DKS', keys: ['S'], name: '动态键程 (S)' },
        { id: 'item_3', type: 'MPT', keys: ['B'], name: '多段触发 (B)' },
      ];
      // Set to all possible profiles
      localStorage.setItem('sparklink_configured_higher_keys_profile_ae64_max', JSON.stringify(advancedData));
      localStorage.setItem('sparklink_configured_higher_keys_profile_ae64', JSON.stringify(advancedData));
      keys.forEach(k => {
        if (k.startsWith('sparklink_configured_higher_keys_')) {
          localStorage.setItem(k, JSON.stringify(advancedData));
        }
      });
      return { keys };
    })()`,
    returnByValue: true
  });
  console.log('Storage keys:', resScope.result.value);

  // Reload page
  await send('Page.reload');
  await sleep(2500);

  // 1. In trigger settings, take shot
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=trigger&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(1500);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_trigger_nobadge_verified.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_trigger_nobadge_verified.png');

  // Hover over key A to show tooltip
  const keyAPos = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[data-key-id="KeyA"]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      return null;
    })()`,
    returnByValue: true
  });

  if (keyAPos && keyAPos.result.value) {
    const { x, y } = keyAPos.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await sleep(800);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verify_trigger_tooltip_verified.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved verify_trigger_tooltip_verified.png');
  }

  // 2. Go to advanced tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64';
      location.href = url;
    })()`
  });
  await sleep(1500);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'verify_advanced_tab_badges_verified.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved verify_advanced_tab_badges_verified.png');

  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});

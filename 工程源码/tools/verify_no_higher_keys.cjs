const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function connectCDP() {
  let targets = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9333/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch (e) {}
    await sleep(500);
  }
  if (!targets) throw new Error('Cannot connect to CDP at 9333');

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

  return { ws, send };
}

(async () => {
  try {
    const appProc = spawn(exePath, ['--remote-debugging-port=9333'], { stdio: 'ignore' });
    appProc.unref();
    await sleep(2000);

    const { ws, send } = await connectCDP();

    await send('Page.enable');
    await send('Runtime.enable');

    // 1. Clear any configured higher keys and stale socd in localStorage, and set dark mode and device view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.includes('configured_higher_keys') || k.includes('socd_keys')) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem('sparklink_configured_higher_keys_profile_ae64_max', JSON.stringify([]));
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
        const url = location.href.split('?')[0] + '?view=device&tab=advanced&profile=ae64';
        location.href = url;
      })()`
    });

    await sleep(2500);

    // Ensure dark mode class is applied
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      })()`
    });
    await sleep(500);

    // 3. Inspect keys for any badge or rogue styles
    const checkResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button[data-key-id]'));
        const keysWithBadges = [];
        buttons.forEach(btn => {
          const keyId = btn.getAttribute('data-key-id');
          const badges = Array.from(btn.querySelectorAll('span')).filter(s => {
            const t = s.innerText.trim();
            return ['SOCD', 'DKS', 'RS', 'MPT', 'MT', 'TGL', 'END'].includes(t);
          });
          if (badges.length > 0) {
            keysWithBadges.push({ keyId, badges: badges.map(b => b.innerText.trim()) });
          }
        });
        const configuredCountText = document.body.innerText.match(/已配置高级键\\s*\\d+\\/\\d+/)?.[0] || 'not found';
        return {
          totalKeyButtons: buttons.length,
          keysWithBadges,
          configuredCountText
        };
      })()`,
      returnByValue: true
    });

    console.log('Inspection Result:', JSON.stringify(checkResult.result?.result?.value || checkResult.result, null, 2));

    // Capture screenshot: verify_no_higher_keys_overview.png
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.result.data, 'base64');
    const outPath = path.join(artifactDir, 'verify_no_higher_keys_overview.png');
    fs.writeFileSync(outPath, buffer);
    console.log('Saved screenshot to:', outPath);

    // Now click 'KeyA' on the keyboard to select it, and verify it still has NO badge
    await send('Runtime.evaluate', {
      expression: `(() => {
        const keyA = document.querySelector('button[data-key-id="KeyA"]');
        if (keyA) keyA.click();
      })()`
    });

    await sleep(500);

    const checkResultAfterClickA = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button[data-key-id]'));
        const keysWithBadges = [];
        buttons.forEach(btn => {
          const keyId = btn.getAttribute('data-key-id');
          const badges = Array.from(btn.querySelectorAll('span')).filter(s => {
            const t = s.innerText.trim();
            return ['SOCD', 'DKS', 'RS', 'MPT', 'MT', 'TGL', 'END'].includes(t);
          });
          if (badges.length > 0) {
            keysWithBadges.push({ keyId, badges: badges.map(b => b.innerText.trim()) });
          }
        });
        const keyA = document.querySelector('button[data-key-id="KeyA"]');
        return {
          keyA_className: keyA ? keyA.className : null,
          keysWithBadges
        };
      })()`,
      returnByValue: true
    });

    console.log('Result After Click A:', JSON.stringify(checkResultAfterClickA.result?.result?.value || checkResultAfterClickA.result, null, 2));

    // Capture screenshot after clicking A: verify_after_click_a.png
    const shotA = await send('Page.captureScreenshot', { format: 'png' });
    const bufferA = Buffer.from(shotA.result.data, 'base64');
    const outPathA = path.join(artifactDir, 'verify_after_click_a.png');
    fs.writeFileSync(outPathA, bufferA);
    console.log('Saved screenshot to:', outPathA);

    ws.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
})();

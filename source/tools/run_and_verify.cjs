const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';
const exePath = 'D:\\desk\\星闪悦动驱动\\软件本体\\星闪悦动HUB.exe';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(d));
    }).on('error', rej);
  });
}

async function waitPort(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await get(base + '/json');
      if (data) return JSON.parse(data);
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error('Port 9333 did not open in time');
}

(async () => {
  try {
    let list;
    try {
      list = JSON.parse(await get(base + '/json'));
    } catch {
      console.log('[Runner] Launching exe with --remote-debugging-port=9333...');
      const child = spawn(exePath, ['--remote-debugging-port=9333'], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      list = await waitPort();
    }

    const page = list.find((t) => t.type === 'page') || list[0];
    if (!page) throw new Error('No page found in target list');

    console.log('[Runner] Connecting to page via WebSocket:', page.webSocketDebuggerUrl);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0;
    const pending = {};
    const send = (method, params = {}) =>
      new Promise((r) => {
        const i = ++id;
        pending[i] = r;
        ws.send(JSON.stringify({ id: i, method, params }));
      });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending[m.id]) pending[m.id](m);
    };
    await new Promise((r) => { ws.onopen = r; });

    await send('Page.enable');
    await send('Runtime.enable');

    const evalJs = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return r.result && r.result.result ? r.result.result.value : null;
    };

    console.log('[Runner] Connected successfully! Navigating to lighting tab...');

    // 如果弹窗存在，关掉
    await evalJs(`(() => {
      const closeBtn = document.querySelector('button[title="关闭弹窗"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // 点击进入驱动
    await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enter = btns.find(b => (b.innerText || '').includes('进入驱动'));
      if (enter) enter.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // 点击灯光配置
    const switched = await evalJs(`(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const lightTab = tabs.find(b => (b.innerText || '').includes('灯光配置'));
      if (lightTab) {
        lightTab.click();
        return true;
      }
      return false;
    })()`);
    console.log('[Runner] Switched to lighting tab:', switched);
    await new Promise(r => setTimeout(r, 1200));

    // 检查方向控件
    const dirStatus = await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fwd = btns.find(b => (b.innerText || '').includes('正向流动'));
      const bwd = btns.find(b => (b.innerText || '').includes('反向流动'));
      return {
        forwardVisible: !!fwd,
        backwardVisible: !!bwd,
        forwardActive: fwd ? fwd.className.includes('bg-[var(--primary-color)]') : false
      };
    })()`);
    console.log('[Runner] Direction button status:', dirStatus);

    // 截取默认 Mode 1 (随波逐流 - 正向流动)
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_wave_forward.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('[Runner] Saved verify_lighting_wave_forward.png');

    // 点击反向流动
    await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bwd = btns.find(b => (b.innerText || '').includes('反向流动'));
      if (bwd) bwd.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // 截取 Mode 1 (随波逐流 - 反向流动)
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_wave_backward.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('[Runner] Saved verify_lighting_wave_backward.png');

    // 切换为百花争艳 (Mode 13)
    await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bloom = btns.find(b => (b.innerText || '').includes('百花争艳'));
      if (bloom) bloom.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // 截取百花争艳
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_bloom_fixed.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('[Runner] Saved verify_lighting_bloom_fixed.png');

    console.log('[Runner] All verification screenshots captured successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Runner] Error:', err);
    process.exit(1);
  }
})();

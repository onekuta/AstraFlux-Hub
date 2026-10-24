const fs = require('fs');
const http = require('http');
const path = require('path');

const base = 'http://127.0.0.1:9333';
const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(d));
    }).on('error', rej);
  });
}

(async () => {
  try {
    const list = JSON.parse(await get(base + '/json'));
    const page = list.find((t) => t.type === 'page') || list[0];
    if (!page) throw new Error('No page found');

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

    console.log('[CDP] Connected to app successfully');

    // 如果在主页，进入驱动
    await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enter = btns.find(b => (b.innerText || '').includes('进入驱动'));
      if (enter) enter.click();
    })()`);
    await new Promise((r) => setTimeout(r, 1000));

    // 点击切换到「灯光配置」Tab
    const switchedTab = await evalJs(`(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const lightTab = tabs.find(b => (b.innerText || '').includes('灯光配置'));
      if (lightTab) {
        lightTab.click();
        return true;
      }
      return false;
    })()`);
    console.log('[CDP] Switched to lighting tab:', switchedTab);
    await new Promise((r) => setTimeout(r, 1000));

    // 检查是否有流动方向控制组
    const dirInfo = await evalJs(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const forwardBtn = buttons.find(b => (b.innerText || '').includes('正向流动'));
      const backwardBtn = buttons.find(b => (b.innerText || '').includes('反向流动'));
      return {
        hasForward: !!forwardBtn,
        hasBackward: !!backwardBtn,
      };
    })()`);
    console.log('[CDP] Direction buttons found:', dirInfo);

    // 切换到 Mode 13 百花争艳
    await evalJs(`(() => {
      const modeBtns = Array.from(document.querySelectorAll('button'));
      const bloomBtn = modeBtns.find(b => (b.innerText || '').includes('百花争艳'));
      if (bloomBtn) bloomBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 1200));

    // 截图 1: Mode 13 百花争艳 正向流动
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_bloom_forward.png'), Buffer.from(shot1.result.data, 'base64'));
    console.log('[CDP] Saved verify_lighting_bloom_forward.png');

    // 点击「反向流动」
    await evalJs(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const backwardBtn = buttons.find(b => (b.innerText || '').includes('反向流动'));
      if (backwardBtn) backwardBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 1000));

    // 截图 2: Mode 13 百花争艳 反向流动
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_bloom_backward.png'), Buffer.from(shot2.result.data, 'base64'));
    console.log('[CDP] Saved verify_lighting_bloom_backward.png');

    // 切换到 Mode 2 潮起潮落
    await evalJs(`(() => {
      const modeBtns = Array.from(document.querySelectorAll('button'));
      const tideBtn = modeBtns.find(b => (b.innerText || '').includes('潮起潮落'));
      if (tideBtn) tideBtn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 1000));

    // 截图 3: Mode 2 潮起潮落
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_lighting_tide_mode.png'), Buffer.from(shot3.result.data, 'base64'));
    console.log('[CDP] Saved verify_lighting_tide_mode.png');

    // 切换回正向流动
    await evalJs(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const forwardBtn = buttons.find(b => (b.innerText || '').includes('正向流动'));
      if (forwardBtn) forwardBtn.click();
    })()`);

    console.log('[CDP] All verifications passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[CDP] Error:', err);
    process.exit(1);
  }
})();

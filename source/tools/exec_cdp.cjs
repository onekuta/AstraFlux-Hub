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
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
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
  await send('DOM.enable');

  // 1. 关闭任何打开的 modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('button[title=\"关闭弹窗\"]');
      if (closeBtn) closeBtn.click();
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);
    })()`
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. 点击【进入驱动】按钮进入 ES68 详情
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enter = btns.find(b => (b.innerText || '').includes('进入驱动'));
      if (enter) enter.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 800));

  // 3. 点击【性能配置】Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const perfBtn = document.querySelector('button[data-tab=\"performance\"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '性能配置');
      if (perfBtn) perfBtn.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 800));

  // 4. 截图 1：回报率卡片全景
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const out1 = path.join(ARTIFACT_DIR, 'verify_32k_rates_rendered_locked.png');
  fs.writeFileSync(out1, Buffer.from(shot1.result.data, 'base64'));
  console.log('Shot 1 saved:', out1);

  // 5. 定位 32KHz 按钮并 hover
  const pos32k = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b32k = btns.find(b => (b.innerText || b.textContent || '').includes('32KHz'));
      if (!b32k) return null;
      const r = b32k.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`,
    returnByValue: true
  });
  console.log('32K button position:', pos32k?.result?.result?.value);

  if (pos32k?.result?.result?.value) {
    const { x, y } = pos32k.result.result.value;

    // 触发 hover
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await new Promise((r) => setTimeout(r, 800));

    // 截图 2：完美的悬浮提示气泡
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const out2 = path.join(ARTIFACT_DIR, 'verify_32k_hover_tooltip_prompt.png');
    fs.writeFileSync(out2, Buffer.from(shot2.result.data, 'base64'));
    console.log('Shot 2 saved (Hover tooltip):', out2);

    // 触发点击 32KHz 置灰按钮
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise((r) => setTimeout(r, 800));

    // 截图 3：官方 USB 3.0 驱动提示模态弹窗
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const out3 = path.join(ARTIFACT_DIR, 'verify_32k_click_usb3_driver_modal.png');
    fs.writeFileSync(out3, Buffer.from(shot3.result.data, 'base64'));
    console.log('Shot 3 saved (Driver prompt modal):', out3);
  }

  ws.close();
  process.exit(0);
})();

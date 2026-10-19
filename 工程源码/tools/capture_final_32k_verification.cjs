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
  console.log('Connecting to CDP on 9333...');
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

  // 1. 点击“直接连接并添加到主页”或绿色按钮绑定 ES68 32K 方案
  console.log('Binding ES68 32K...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      const bindBtn = btns.find(b => (b.innerText || '').includes('直接连接并添加到主页') || (b.innerText || '').includes('已自动匹配【前行者 ES68'));
      if (bindBtn) bindBtn.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 2. 如果还在弹窗，点击关闭弹窗
  await send('Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.querySelector('button[title=\"关闭\"]') || 
                       Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg line'));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 800));

  // 3. 点击【进入驱动】按钮进入 ES68 详情页
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtns = Array.from(document.querySelectorAll('button')).filter(b => (b.innerText || '').includes('进入驱动'));
      if (enterBtns.length > 0) enterBtns[0].click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 4. 切换到【性能配置】Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const perfBtn = document.querySelector('button[data-tab="performance"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '性能配置');
      if (perfBtn) perfBtn.click();
    })()`
  });
  await new Promise((r) => setTimeout(r, 800));

  // 5. 截图 1：回报率卡片全貌 (32K/16K 置灰锁标需驱动，8K 免驱最高)
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const out1 = path.join(ARTIFACT_DIR, 'verify_32k_rates_rendered_locked.png');
  fs.writeFileSync(out1, Buffer.from(shot1.result.data, 'base64'));
  console.log('Saved shot 1 (Locked 32k/16k rates):', out1);

  // 6. 获取 32KHz 按钮精确坐标
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
    console.log('Saved shot 2 (Hover tooltip):', out2);

    // 触发点击 32KHz 置灰按钮
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise((r) => setTimeout(r, 800));

    // 截图 3：官方 USB 3.0 驱动提示模态弹窗
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const out3 = path.join(ARTIFACT_DIR, 'verify_32k_click_usb3_driver_modal.png');
    fs.writeFileSync(out3, Buffer.from(shot3.result.data, 'base64'));
    console.log('Saved shot 3 (Driver prompt modal):', out3);
  }

  ws.close();
  console.log('All 3 verification shots captured successfully!');
  process.exit(0);
})().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

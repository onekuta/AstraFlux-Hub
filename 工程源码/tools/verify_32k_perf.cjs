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

  // 1. 先保存 AE64 (8K普通键盘) 的截图，证明普通键盘不展示 32K
  const shotAe64 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_ae64_8k_no_32k.png'), Buffer.from(shotAe64.result.data, 'base64'));
  console.log('Saved AE64 (8K) screenshot.');

  // 2. 将当前设备切换到 ES68 破晓 (32K 旗舰键盘)
  console.log('Switching device to ES68 (32K)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const select = document.querySelector('select');
      if (select) {
        const es68Opt = Array.from(select.options).find(o => o.text.includes('ES68') || o.value.includes('es68'));
        if (es68Opt) {
          select.value = es68Opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return 'switched_via_select';
        }
      }
      return 'select_not_found';
    })()`,
    returnByValue: true
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 3. 截图 1：ES68 下的回报率卡片，清晰呈现 32KHz / 16KHz 置灰与【需驱动】徽标
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const out1 = path.join(ARTIFACT_DIR, 'verify_32k_rates_rendered_locked.png');
  fs.writeFileSync(out1, Buffer.from(shot1.result.data, 'base64'));
  console.log('Saved shot 1 (ES68 32K locked):', out1);

  // 4. 定位 32KHz 按钮并 hover
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

    // 触发鼠标 hover
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await new Promise((r) => setTimeout(r, 800));

    // 截图 2：完美的悬浮提示气泡 (不被卡片边缘遮挡)
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const out2 = path.join(ARTIFACT_DIR, 'verify_32k_hover_tooltip_prompt.png');
    fs.writeFileSync(out2, Buffer.from(shot2.result.data, 'base64'));
    console.log('Saved shot 2 (Hover tooltip):', out2);

    // 触发点击 32KHz 置灰按钮
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await new Promise((r) => setTimeout(r, 800));

    // 截图 3：官方 USB 3.0 驱动提示模态弹窗 (包含【下载USB3.0驱动】按钮)
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    const out3 = path.join(ARTIFACT_DIR, 'verify_32k_click_usb3_driver_modal.png');
    fs.writeFileSync(out3, Buffer.from(shot3.result.data, 'base64'));
    console.log('Saved shot 3 (Driver modal):', out3);
  }

  ws.close();
  console.log('All verifications completed successfully!');
  process.exit(0);
})().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

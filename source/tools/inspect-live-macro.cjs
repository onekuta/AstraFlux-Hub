const http = require('http');

http.get('http://127.0.0.1:9333/json', async (r) => {
  let d = ''; r.on('data', c => d += c);
  r.on('end', async () => {
    const list = JSON.parse(d);
    const page = list.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);
    let id = 0;
    const send = (m, p = {}) => new Promise((res) => {
      const i = ++id;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === i) { ws.removeEventListener('message', handler); res(msg.result); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
    await send('Runtime.enable');

    const evalJs = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        return { error: res.exceptionDetails.text, desc: res.exceptionDetails.exception?.description };
      }
      return res.result ? res.result.value : null;
    };

    const res = await evalJs(`(async () => {
      // 1. Select M0 tab on the left
      const m0Btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('M0'));
      if (m0Btn) m0Btn.click();
      await new Promise(r => setTimeout(r, 200));

      // 2. Click "开始录制" (exact match)
      const recBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '开始录制');
      if (!recBtn) return { error: 'Start record button not found' };
      recBtn.click();
      await new Promise(r => setTimeout(r, 200));

      // 3. Dispatch events
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'A', bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', key: 'A', bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'D', bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'D', bubbles: true }));
      await new Promise(r => setTimeout(r, 200));

      // 4. Click "停止录制"
      const stopBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '停止录制');
      if (stopBtn) stopBtn.click();
      await new Promise(r => setTimeout(r, 200));

      // 5. Click "保存至键盘"
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '保存至键盘');
      if (saveBtn) saveBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      // 6. Verify hardware state
      const ks = window.__keyboardService;
      const m0Mode = await ks.sdk.getMacroMode({ macroId: 0 });
      const m0Data = await ks.sdk.getMacroData({ macroId: 0, offset: 0 });

      return {
        m0Mode,
        m0ValidActions: m0Data?.macros?.filter(a => !(a.keyCode === 0 && a.delay === 0 && a.status === 0))
      };
    })()`);

    console.log('EXACT_RECORD_AND_SAVE_TEST:', JSON.stringify(res, null, 2));

    ws.close();
    process.exit(0);
  });
});

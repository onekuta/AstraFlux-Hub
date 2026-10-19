async function main() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const cbs = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m.result); cbs.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  // 切换到改键配置
  await send('Runtime.evaluate', {
    expression: `(() => {
      const kbBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.innerText && el.innerText.trim() === '改键配置');
      if (kbBtn) kbBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const appContent = document.querySelector('.app-content');
      const topSection = appContent ? appContent.children[0] : null;
      const bottomPanel = document.querySelector('.panel-operation-keybinds');
      const keyA = document.querySelector('[data-key-id="KeyA"]');
      const kb = keyA ? keyA.parentElement : null;
      const kbWrap = kb ? kb.parentElement : null;

      return {
        windowH: window.innerHeight,
        windowW: window.innerWidth,
        appContentH: appContent ? appContent.clientHeight : null,
        topSectionH: topSection ? topSection.clientHeight : null,
        topSectionW: topSection ? topSection.clientWidth : null,
        bottomPanelH: bottomPanel ? bottomPanel.clientHeight : null,
        kbWrapW: kbWrap ? kbWrap.clientWidth : null,
        kbWrapH: kbWrap ? kbWrap.clientHeight : null,
        kbW: kb ? kb.clientWidth : null,
        kbH: kb ? kb.clientHeight : null,
      };
    })()`,
    returnByValue: true
  });
  console.log('改键配置尺寸测量 result:', JSON.stringify(info, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// 键盘「晚挂载」复现探针（纯数据，不出截图）
// ------------------------------------------------------------------
// 为什么必须有这个脚本：
//   键盘卡片只在 activeTab ∉ {performance, settings} 时渲染。App 启动在首页时
//   它根本不在 DOM 里。所以「直接用 URL 导航到 ?tab=trigger」测不出任何问题 ——
//   键盘在首次 commit 时就在，自适应观察器一次就挂上了。
//   而用户的真实路径是「首页 → 点设备 → 进驱动页 → 切到触发配置」，键盘是**晚挂载**的。
//   旧实现用 useRef + useEffect(..., [ACTIVE_LAYOUT])，首屏元素为 null 直接 return，
//   ResizeObserver 永远没接上 → 键盘停在初始 1u=52px（1100 宽下左右各戳出 58px，
//   压住左侧栏与右侧快捷栏）。
// 所以本脚本刻意走「先 tab=performance（该页无键盘）→ 再点侧栏『触发配置』」，
// 在 1100 / 1200 / 1380 三个宽度下量键盘底板是否溢出。
// 判定：OVERFLOW <= 0 且 leftGap / rightGap 均 >= 0 才算通过。
// 用法: node tools/dump-late-mount.cjs [cdpBaseUrl]
// ------------------------------------------------------------------
const http = require('http');
const get = (p) => new Promise((res, rej) => http.get(p, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(d)); }).on('error', rej));
const GEO = `(() => {
  const card = document.querySelector('.app-content .flex-1.min-w-0');
  if (!card) return { err: 'no .app-content .flex-1.min-w-0', hasAppContent: !!document.querySelector('.app-content'), vw: innerWidth };
  const wrap = card.querySelector(':scope > div.p-4');
  if (!wrap) return { err: 'no wrap', cardW: Math.round(card.getBoundingClientRect().width) };
  const plate = wrap.querySelector('.flex.flex-col.w-fit');
  const wr = wrap.getBoundingClientRect(), pr = plate.getBoundingClientRect();
  const fk = plate.children[0].children[0];
  return {
    vw: innerWidth,
    cardW: Math.round(card.getBoundingClientRect().width),
    wrapInner: Math.round(wrap.clientWidth - 32),
    plateW: Math.round(pr.width),
    leftGap: Math.round(wr.left + 16 - pr.left),
    rightGap: Math.round((wr.right - 16) - pr.right),
    unit: Math.round((fk.getBoundingClientRect().width + 6) * 10) / 10,
    OVERFLOW: Math.round(pr.width - (wrap.clientWidth - 32)),
  };
})()`;
const BASE = process.argv[2] || 'http://127.0.0.1:9333';

(async () => {
  const list = JSON.parse(await get(BASE + '/json'));
  const page = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, {res,rej}); ws.send(JSON.stringify({id:i, method:m, params:p})); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const {res,rej}=pending.get(m.id); pending.delete(m.id); m.error?rej(new Error(JSON.stringify(m.error))):res(m.result); } };
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable'); await send('Page.enable');
  const ev = async (js) => { const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true }); return r.exceptionDetails ? { EXC: r.exceptionDetails.exception && r.exceptionDetails.exception.description } : r.result.value; };
  const base = page.url.split('?')[0];

  for (const W of [1100, 1200, 1380]) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: 780, deviceScaleFactor: 1, mobile: false });
    // A. 先进入「性能配置」（该页不渲染键盘卡片）
    await send('Page.navigate', { url: base + '?view=device&tab=performance&profile=es68&r=' + Math.random() });
    await new Promise(r => setTimeout(r, 3000));
    const before = await ev(GEO);
    // B. 点侧栏「触发配置」→ 键盘卡片此时才挂载
    const clicked = await ev(`(() => {
      const b = [...document.querySelectorAll('button')].find(x => (x.innerText||'').replace(/\\s+/g,'') === '触发配置');
      if (!b) return 'no-btn';
      b.click(); return 'ok';
    })()`);
    await new Promise(r => setTimeout(r, 1200));
    const after = await ev(GEO);
    console.log(`【宽 ${W}】点击=${clicked}`);
    console.log(`   性能页(无键盘): ${JSON.stringify(before)}`);
    console.log(`   切到触发页后  : ${JSON.stringify(after)}`);
    console.log('');
  }
  await send('Emulation.clearDeviceMetricsOverride', {});
  ws.close(); process.exit(0);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });

/**
 * dump-misalign —— 「界面显示错位」专项探针（纯数据，不出截图）
 *
 * 为什么必须有这个脚本：
 *   用户报「UI 显示错位」时，肉眼看缩略截图只能得到「好像压住了 / 好像被切了」这种模糊结论，
 *   而且分不清是「元素真的重叠」还是「滚动容器在正常裁剪」—— 这两者修法完全相反：
 *     · 真的重叠 → 去调 flex / 高度约束
 *     · 正常裁剪 → 什么都不用改（滚一下就能看到）
 *   所以本探针把「可见盒」和「原始盒」都量出来对照，并直接做算术判定。
 *
 * 覆盖：
 *   ① 侧栏：滚动容器 clientH/scrollH、每项是否被裁、底部按钮是否压住列表项
 *   ② 键盘卡片：末行键帽到卡片下边界的留白；**逐行量键帽 top，揪出同一行内垂直错位**
 *   ③ 主操作区：识别 .panel-operation（标准页）或裸 grid（非标准页，本身即隐患）
 *   ④ 子标签栏 与 右侧「当前模式」提示 的垂直对齐
 *
 * 用法: node tools/dump-misalign.cjs [cdpBase] [WxH] [subTab]
 *   WxH    不传 = 用真实窗口；传 1440x960 = 用 Emulation 模拟
 *   subTab deadzone(默认) | trigger | switch
 */
const http = require('http');

const BASE = process.argv[2] || 'http://127.0.0.1:9333';
const VIEW = process.argv[3] || '';
const SUB = process.argv[4] || 'deadzone';
const SUB_LABEL = { deadzone: '死区设置', trigger: '触发设置', switch: '轴体设置' }[SUB] || SUB;

const get = (p) => new Promise((res, rej) => {
  http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
});

const HELPERS = `
function visBox(el) {
  let r = el.getBoundingClientRect();
  const b = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  let p = el.parentElement;
  while (p) {
    const cs = getComputedStyle(p);
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const pr = p.getBoundingClientRect();
      b.left = Math.max(b.left, pr.left); b.top = Math.max(b.top, pr.top);
      b.right = Math.min(b.right, pr.right); b.bottom = Math.min(b.bottom, pr.bottom);
    }
    p = p.parentElement;
  }
  b.w = Math.max(0, b.right - b.left); b.h = Math.max(0, b.bottom - b.top);
  return b;
}
const R = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
function box(el) { return el ? R(el.getBoundingClientRect()) : null; }
const txt = (el) => (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30);
`;

const SIDEBAR = `(() => {
  ${HELPERS}
  const sb = document.querySelector('.sidebar'); if (!sb) return { err: 'no .sidebar' };
  const sc = sb.querySelector('.sidebar-scroll');
  const ft = sb.querySelector('.sidebar-footer');
  const items = [...sb.querySelectorAll('.nav-item')];
  const cs = sc && getComputedStyle(sc);
  const scr = sc && sc.getBoundingClientRect();
  const clipped = [];
  items.forEach((it) => {
    if (!scr) return;
    const r = it.getBoundingClientRect();
    const cutTop = Math.max(0, scr.top - r.top), cutBottom = Math.max(0, r.bottom - scr.bottom);
    if (cutTop > 0.5 || cutBottom > 0.5) clipped.push({ text: txt(it), cutTop: Math.round(cutTop), cutBottom: Math.round(cutBottom) });
  });
  let hit = null;
  if (ft && items.length) {
    const a = ft.getBoundingClientRect();
    items.forEach((it) => {
      const b = it.getBoundingClientRect();
      const ow = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oh = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ow > 1 && oh > 1) hit = { text: txt(it), w: Math.round(ow), h: Math.round(oh) };
    });
  }
  return {
    viewport: innerWidth + 'x' + innerHeight,
    sidebar: box(sb), deviceCard: box(sb.querySelector('.device-card')),
    scroll: sc ? { box: box(sc), clientH: sc.clientHeight, scrollH: sc.scrollHeight, scrollTop: Math.round(sc.scrollTop),
      overflowY: cs.overflowY, canScroll: sc.scrollHeight > sc.clientHeight && cs.overflowY !== 'visible',
      hiddenPx: Math.max(0, sc.scrollHeight - sc.clientHeight) } : null,
    footer: box(ft), navCount: items.length,
    navItems: items.map((it) => ({ text: txt(it), ...box(it) })),
    navClipped: clipped, footerHit: hit,
  };
})()`;

const KEYGRID = `(() => {
  ${HELPERS}
  const card = document.querySelector('.app-content .flex-1.min-w-0'); if (!card) return { err: 'no keyboard card' };
  const cb = card.getBoundingClientRect();
  const caps = [...card.querySelectorAll('[class*="keycap"]')].filter((c) => !c.closest('button[disabled]'));
  // 以「键帽本体」为准：取每个 keycap 元素自身的 rect
  const rows = new Map();
  caps.forEach((c) => {
    const r = c.getBoundingClientRect();
    if (r.height < 6 || r.width < 6) return;
    const key = Math.round(r.top / 4) * 4;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ label: txt(c).slice(0, 6), ...R(r) });
  });
  const sorted = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([k, arr]) => {
    arr.sort((a, b) => a.x - b.x);
    const tops = arr.map((a) => a.y);
    const hs = arr.map((a) => a.h);
    const medTop = tops.slice().sort((a, b) => a - b)[Math.floor(tops.length / 2)];
    const medH = hs.slice().sort((a, b) => a - b)[Math.floor(hs.length / 2)];
    const offTop = arr.filter((a) => Math.abs(a.y - medTop) > 2).map((a) => ({ label: a.label, y: a.y, dx: a.y - medTop }));
    const offH = arr.filter((a) => Math.abs(a.h - medH) > 2).map((a) => ({ label: a.label, h: a.h, dh: a.h - medH }));
    return { rowTop: k, n: arr.length, medTop, medH, offTop, offH, keys: arr };
  });
  let lastBottom = -Infinity;
  caps.forEach((c) => { const r = c.getBoundingClientRect(); if (r.bottom > lastBottom) lastBottom = r.bottom; });
  return {
    card: box(card), keycapCount: caps.length,
    padBottomPx: Math.round(cb.bottom - lastBottom),
    rows: sorted.map((r) => ({ rowTop: r.rowTop, n: r.n, medTop: r.medTop, medH: r.medH, offTop: r.offTop, offH: r.offH })),
    rowCount: sorted.length,
  };
})()`;

// 操作区：优先 .panel-operation（标准），否则退化为「app-content 里最外层的卡片网格」
const OPS = `(() => {
  ${HELPERS}
  const panel = document.querySelector('.panel-operation');
  const ac = document.querySelector('.app-content');
  const target = panel || ac;
  if (!target) return { err: 'no .app-content' };
  const isStd = !!panel;
  const cards = isStd
    ? [...target.querySelectorAll('.operation-columns > .col')]
    : [...target.querySelectorAll(':scope > div > div[class*="col-span"], :scope > div[class*="col-span"]')];
  const cs = getComputedStyle(target);
  return {
    standard: isStd,
    hint: isStd ? '.panel-operation（标准操作区）' : '⚠️ 页面内没有 .panel-operation，用的是裸 grid',
    panel: box(target), padding: cs.padding, gap: cs.gap,
    cardCount: cards.length,
    cards: cards.map((c) => {
      const r = c.getBoundingClientRect();
      let cb = r.top, ct = r.bottom;
      [...c.querySelectorAll('*')].forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.height === 0 || b.width === 0) return;
        if (b.bottom > cb) cb = b.bottom;
        if (b.top < ct) ct = b.top;
      });
      return { box: R(r), pad: getComputedStyle(c).padding, slackBottom: Math.round(r.bottom - cb), title: txt(c.querySelector('h3') || c) };
    }),
  };
})()`;

const SUBBAR = `(() => {
  ${HELPERS}
  const tabs = [...document.querySelectorAll('button')].filter((b) => ['触发设置','死区设置','轴体设置','校准设置'].includes((b.innerText||'').trim()));
  const mode = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && (e.textContent||'').includes('当前模式'));
  return {
    tabCount: tabs.length,
    tabs: tabs.map((t) => ({ label: (t.innerText||'').trim(), ...box(t) })),
    mode: mode ? { text: (mode.textContent||'').trim().slice(0,30), ...box(mode) } : null,
  };
})()`;

(async () => {
  const list = JSON.parse(await get(BASE + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable'); await send('Page.enable');

  if (VIEW) {
    const m = VIEW.match(/^(\d+)x(\d+)$/);
    if (m) await send('Emulation.setDeviceMetricsOverride', { width: +m[1], height: +m[2], deviceScaleFactor: 1, mobile: false });
  } else {
    try { await send('Emulation.clearDeviceMetricsOverride'); } catch { /* 忽略 */ }
  }

  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  await send('Page.navigate', { url: cur.result.value.split('?')[0] + '?view=device&tab=trigger&profile=es68' });
  await new Promise((r) => setTimeout(r, 3500));

  const ev = async (js) => {
    const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('页面异常: ' + JSON.stringify(r.exceptionDetails.exception));
    return r.result.value;
  };

  const clicked = await ev(`(() => {
    const t = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').trim() === ${JSON.stringify(SUB_LABEL)});
    if (!t) return false; t.click(); return true;
  })()`);
  await new Promise((r) => setTimeout(r, 900));

  console.log(`########## 错位专项 · ${VIEW || '真实窗口'} · 子页 ${SUB_LABEL}（点击=${clicked}） ##########`);

  const sb = await ev(SIDEBAR);
  console.log('\n===== ① 侧栏 =====');
  if (sb.err) console.log('  ' + sb.err);
  else {
    console.log(`  视口 ${sb.viewport}  .sidebar ${JSON.stringify(sb.sidebar)}`);
    console.log(`  .device-card ${JSON.stringify(sb.deviceCard)}`);
    console.log(`  .sidebar-scroll ${JSON.stringify(sb.scroll)}`);
    console.log(`  .sidebar-footer ${JSON.stringify(sb.footer)}`);
    sb.navItems.forEach((n) => console.log(`    y=${String(n.y).padStart(4)} h=${String(n.h).padStart(3)}  ${n.text}`));
    console.log(`  被滚动容器裁掉：${sb.navClipped.length ? sb.navClipped.map((c) => `「${c.text}」下裁${c.cutBottom}`).join(' / ') : '无 ✅'}`);
    console.log(`  底部按钮压住列表项：${sb.footerHit ? `⚠️ 「${sb.footerHit.text}」${sb.footerHit.w}x${sb.footerHit.h}px` : '无 ✅'}`);
  }

  const kg = await ev(KEYGRID);
  console.log('\n===== ② 键盘栅格 =====');
  if (kg.err) console.log('  ' + kg.err);
  else {
    console.log(`  卡片 ${JSON.stringify(kg.card)} 键帽 ${kg.keycapCount} 个 / ${kg.rowCount} 行`);
    console.log(`  末行键帽到卡片下边界留白 ${kg.padBottomPx}px ${kg.padBottomPx < 10 ? '⚠️ 偏小' : '✅'}`);
    kg.rows.forEach((r, i) => {
      const flagT = r.offTop.length ? `⚠️ 同行 top 偏移 ${r.offTop.map((o) => o.label + (o.dx > 0 ? '+' : '') + o.dx).join(',')}` : '✅';
      const flagH = r.offH.length ? `⚠️ 同行高度不一 ${r.offH.map((o) => o.label + (o.dh > 0 ? '+' : '') + o.dh).join(',')}` : '';
      console.log(`   行${i} y=${String(r.medTop).padStart(4)} h=${r.medH} n=${String(r.n).padStart(2)}  ${flagT} ${flagH}`);
    });
  }

  const ops = await ev(OPS);
  console.log('\n===== ③ 操作区 =====');
  if (ops.err) console.log('  ' + ops.err);
  else {
    console.log(`  标准结构：${ops.standard ? '✅ 是' : '❌ 否'}  ${ops.hint}`);
    console.log(`  容器 ${JSON.stringify(ops.panel)} padding=${ops.padding} gap=${ops.gap}`);
    ops.cards.forEach((c, i) => console.log(`  卡片${i} ${JSON.stringify(c.box)} padding=${c.pad} 底部余白 ${String(c.slackBottom).padStart(4)}px  「${c.title}」`));
    const hs = ops.cards.map((c) => c.box.h);
    const xs = [...new Set(ops.cards.map((c) => c.box.x))];
    const ys = [...new Set(ops.cards.map((c) => c.box.y))];
    console.log(`  高度 ${hs.join('/')} → ${new Set(hs).size === 1 ? '等高 ✅' : '⚠️ 不等高'}`);
    console.log(`  上边对齐 ${ys.length === 1 ? `✅ y=${ys[0]}` : `⚠️ y 各不相同 ${ys.join(',')}`}`);
    const gaps = [];
    for (let i = 1; i < ops.cards.length; i += 1) gaps.push(ops.cards[i].box.x - (ops.cards[i - 1].box.x + ops.cards[i - 1].box.w));
    if (gaps.length) console.log(`  水平间距 ${gaps.join('/')} → ${new Set(gaps).size === 1 ? '均匀 ✅' : '⚠️ 不均匀'}`);
  }

  const sbar = await ev(SUBBAR);
  console.log('\n===== ④ 子标签栏 =====');
  console.log(`  标签 ${sbar.tabCount} 个：${sbar.tabs.map((t) => t.label).join(' / ')}`);
  sbar.tabs.forEach((t) => console.log(`    ${t.label} ${JSON.stringify(t)}`));
  console.log(`  当前模式提示 ${JSON.stringify(sbar.mode)}`);
  if (sbar.tabs.length && sbar.mode) {
    const t = sbar.tabs[0];
    const dy = Math.abs((t.y + t.h / 2) - (sbar.mode.y + sbar.mode.h / 2));
    console.log(`  标签与「当前模式」垂直居中对齐偏差 ${dy.toFixed(0)}px ${dy <= 3 ? '✅' : '⚠️'}`);
  }

  ws.close();
  process.exit(0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

// 「连续快速触发」机型门控探针（纯数据，不出截图）
// ------------------------------------------------------------------
// 规则来源：江湾官方 2026-10-13 群公告 —— AE64-MAX 0.04 版固件起新增
//   「连续快速触发」开关（打开后 RT 行程中也支持连续快速触发）。
// 本项目落法：只有 profile.features.continuousRt === true 的机型在触发页渲染这一行。
//
// 判定：AE64_MAX → 必须有这一行 + 开关 + 「固件 ≥ 0.04」徽章；
//       ES68 / DV63 → **必须完全不存在**（不得漏放）。
// 用法: node tools/dump-continuous.cjs [cdpBase]
// ------------------------------------------------------------------
const http = require('http');
const BASE = process.argv[2] || 'http://127.0.0.1:9333';
const get = (p) => new Promise((res, rej) => http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej));

const CASES = [
  ['AE64_MAX', true],
  ['ES68', false],
  ['DV63', false],
];

const PROBE = `(() => {
  const boxes = [...document.querySelectorAll('.panel-operation .col')].flatMap((col) =>
    [...col.querySelectorAll('div')].filter((d) => {
      const t = d.querySelector(':scope > div > div > span');
      return t && t.textContent.trim() === '连续快速触发';
    }));
  const box = boxes[0] || null;
  const cb = box ? box.querySelector('input[type=checkbox]') : null;
  const badge = box ? box.querySelector('span[title]') : null;
  const desc = box ? [...box.children[0].children].find((c) => c.tagName === 'SPAN') : null;
  const footer = [...document.querySelectorAll('.panel-operation .col span')]
    .map((s) => s.textContent.trim())
    .filter((t) => t.startsWith('连续快速触发 '))[0] || null;
  const rtTitle = [...document.querySelectorAll('.panel-operation h3')]
    .map((h) => h.textContent.trim()).find((t) => t.includes('快速触发')) || null;
  return {
    rtColumnTitle: rtTitle,
    rowPresent: !!box,
    rowCount: boxes.length,
    hasToggle: !!cb,
    toggleChecked: cb ? cb.checked : null,
    toggleAriaLabel: cb ? (cb.getAttribute('aria-label') || null) : null,
    badgeText: badge ? badge.textContent.trim() : null,
    descText: desc ? desc.textContent.trim() : null,
    footerText: footer,
  };
})()`;

(async () => {
  const list = JSON.parse(await get(BASE + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable'); await send('Page.enable');

  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  const root = cur.result.value.split('?')[0];

  console.log('##### 「连续快速触发」机型门控实测 #####');
  console.log('规则：只在 AE64-MAX 显示（features.continuousRt），ES68 / DV63 必须不存在\n');

  let pass = true;
  for (const [profile, shouldExist] of CASES) {
    await send('Page.navigate', { url: `${root}?view=device&tab=trigger&profile=${profile.toLowerCase()}` });
    await new Promise((r) => setTimeout(r, 4200));
    const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const v = r.result.value;
    const ok = v.rowPresent === shouldExist;
    if (!ok) pass = false;
    console.log(`【${profile}】期望 ${shouldExist ? '有' : '无'} → 实测 ${v.rowPresent ? '有' : '无'}  ${ok ? '✅' : '❌'}`);
    console.log(`   RT 列标题     : ${v.rtColumnTitle}`);
    console.log(`   命中行数量    : ${v.rowCount}${v.rowCount > 1 ? '  ❌ 重复渲染' : ''}`);
    if (v.rowPresent) {
      console.log(`   开关          : ${v.hasToggle ? '有' : '无'} · checked=${v.toggleChecked} · aria-label=${v.toggleAriaLabel}`);
      console.log(`   固件徽章      : ${v.badgeText}`);
      console.log(`   说明文字      : ${v.descText}`);
    }
    console.log(`   底部状态文案  : ${v.footerText || '(无)'}`);
    console.log('');
    if (v.rowCount > 1) pass = false;
  }
  console.log(pass ? '✅ 全部通过：门控规则与预期一致' : '❌ 存在不符合预期的机型');
  ws.close(); process.exit(pass ? 0 : 1);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

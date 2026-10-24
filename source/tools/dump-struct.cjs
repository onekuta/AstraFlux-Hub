// 全站「操作区结构统一性」探针（纯数据，不出截图）
// ------------------------------------------------------------------
// 为什么必须有这个脚本：
//   「UI 显示错位」的真因往往不是像素偏移，而是**结构不统一** ——
//   同一个子标签排下，有的页用标准操作区（`.panel-operation > .operation-columns > .col`，
//   白面板 + 1px 竖分隔线），有的页用裸 grid + 每张卡自带 bg/border/rounded/shadow。
//   切标签时「白面板 / 卡片边框 / 内边距 24↔16 / 卡片高度 288↔408」全跳变，观感就是错位。
//   本脚本把这条规约变成可回归的数字。
//
// 判定：8 个页面必须全部 `.panel-operation` ✅；
//       各列右边缘不得越过「面板内边距」边界（越界 = 被 overflow:hidden 裁掉）；
//       各列自身不得出现 scrollWidth > clientWidth（内容横向溢出）。
// 用法: node tools/dump-struct.cjs [cdpBase] [WxH]
// ------------------------------------------------------------------
const http = require('http');
const BASE = process.argv[2] || 'http://127.0.0.1:9333';
const get = (p) => new Promise((res, rej) => http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej));

const TRIG = 'view=device&tab=trigger&profile=es68';
const PAGES = [
  ['灯光配置', 'view=device&tab=lighting&profile=es68', ''],
  ['触发设置', TRIG, ''],
  ['死区设置', TRIG, '死区设置'],
  ['轴体设置', TRIG, '轴体设置'],
  ['改键配置', 'view=device&tab=keybinds&profile=es68', ''],
  ['高级按键', 'view=device&tab=advanced&profile=es68', ''],
  ['性能配置', 'view=device&tab=performance&profile=es68', ''],
  ['其他设置', 'view=device&tab=settings&profile=es68', ''],
];

const PROBE = `(() => {
  const panel = document.querySelector('.panel-operation');
  const cols = panel ? [...panel.querySelectorAll(':scope > .operation-columns > .col')] : [];
  const grid = document.querySelector('.grid.grid-cols-4');
  const gcards = grid ? [...grid.children] : [];
  const pr = panel ? panel.getBoundingClientRect() : null;
  return {
    hasPanel: !!panel,
    colCount: cols.length,
    colW: cols.map((c) => Math.round(c.getBoundingClientRect().width)),
    colH: cols.map((c) => Math.round(c.getBoundingClientRect().height)),
    colTop: cols.map((c) => Math.round(c.getBoundingClientRect().top)),
    colOv: cols.map((c) => (c.scrollHeight - c.clientHeight) - (c.firstElementChild ? c.firstElementChild.scrollHeight - c.firstElementChild.clientHeight : 0)),
    colPad: cols.map((c) => getComputedStyle(c).padding),
    colRight: cols.map((c) => Math.round(c.getBoundingClientRect().right)),
    colOverflow: cols.map((c) => c.scrollWidth - c.clientWidth),
    panel: pr ? { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height), pad: getComputedStyle(panel).paddingLeft } : null,
    axisCardW: gcards.length ? Math.round(gcards[0].getBoundingClientRect().width) : null,
    axisCardCount: gcards.length,
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
  const vp = process.argv[3] || '1380x880';
  const mm = vp.match(/^(\d+)x(\d+)$/);
  if (mm) await send('Emulation.setDeviceMetricsOverride', { width: +mm[1], height: +mm[2], deviceScaleFactor: 1, mobile: false });

  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  const root = cur.result.value.split('?')[0];

  console.log(`########## 页面结构统一性 · ${vp} ##########`);
  console.log('页面'.padEnd(12) + '| 面板 | .col 宽 / 高 / top        | 轴体卡');
  console.log('-'.repeat(96));
  for (const [label, q, click] of PAGES) {
    await send('Page.navigate', { url: root + '?' + q });
    await new Promise((r) => setTimeout(r, 2600));
    if (click) {
      await send('Runtime.evaluate', { expression: `(() => { const t=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').trim()===${JSON.stringify(click)}); if(t){t.click();return true;} return false; })()`, returnByValue: true });
      await new Promise((r) => setTimeout(r, 900));
    }
    const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const v = r.result.value;
    const geo = v.colW.map((w, i) => `${w}/${v.colH[i]}`).join('  ');
    const innerRight = v.panel ? v.panel.x + v.panel.w - parseFloat(v.panel.pad || 0) : 0;
    const lastRight = v.colRight.length ? v.colRight[v.colRight.length - 1] : 0;
    const spill = Math.round(lastRight - innerRight);
    const ovf = v.colOverflow.some((x) => x > 1);
    console.log(
      String(label).padEnd(10) + ' | ' + (v.hasPanel ? '✅' : '❌') + '   | ' +
      (geo || '—').padEnd(24) + '| ' +
      (v.axisCardW ? `${v.axisCardW}px×${v.axisCardCount}` : '—').padEnd(10) +
      `| 越界 ${spill > 1 ? '❌ +' + spill : '✅ ' + spill}  内容溢出 ${ovf ? '❌' : '✅'}`,
    );
  }
  ws.close(); process.exit(0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

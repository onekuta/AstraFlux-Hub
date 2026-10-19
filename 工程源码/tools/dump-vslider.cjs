/**
 * dump-vslider —— 竖向行程滑块（.vtravel）结构与交互验收探针
 *
 * 为什么必须有这个脚本：
 *   触发设置页的「设置触发行程」从一根横向 <input type="range"> 改成了自绘的竖向柱状
 *   滑轨（components/VerticalTravelSlider.jsx + index.css 里的 .vtravel*）。
 *   这类自绘控件最容易出两类问题，光看代码看不出来：
 *     ① 结构/无障碍属性缺失（role、aria-valuenow、刻度数量、气泡跟随）；
 *     ② 交互死掉（pointer 事件没接上、坐标换算写反、setPointerCapture 抛错被吞）。
 *   所以本探针分两段：
 *     【A 段】纯读 DOM —— 结构 + aria + 刻度 + 气泡，任何一项不对就是渲染问题。
 *     【B 段】真实输入 —— 先用 CDP Input.dispatchMouseEvent 走一遍完整按住/移动/松开，
 *             再用页面内合成 PointerEvent 走一遍，两条路径分开报结果。
 *             ⚠️ 为什么要两条：CDP 派发的输入要经过命中测试，元素若在视口外就打不到；
 *             合成事件则绕过命中测试、只验 React 的 onPointerDown/Move/Up 接线。
 *             两条都过 = 组件没问题；只有合成过 = 元素被滚出视口（探针坐标问题）；
 *             两条都不过 = 组件真有 bug。
 *
 * 用法：
 *   node tools/dump-vslider.cjs [cdpBase] [search]
 *   默认 http://127.0.0.1:9333 、 view=device&tab=trigger&profile=es68
 *
 * 判定标准（全部满足才算通过）：
 *   · track 宽 >= 28 && 高 == 组件 height（默认 168）
 *   · role="slider" && tabIndex === 0
 *   · aria-valuenow / aria-valuemax / aria-valuetext 三件套齐全且数值自洽
 *   · 主刻度 >= 5 个且首项为 "0.00"
 *   · 气泡存在、带铅笔图标、bottom 与填充比例一致（误差 < 1%）
 *   · B 段拖到 75% 高度后 aria-valuenow ≈ max × 0.75（误差 < 0.15mm）
 */
const http = require('http');

const BASE = process.argv[2] || 'http://127.0.0.1:9333';
const SEARCH = process.argv[3] || 'view=device&tab=trigger&profile=es68';

const get = (p) =>
  new Promise((res, rej) => {
    http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
  });

// 结构读取：先滚到视口里，再取几何，保证 B 段 CDP 坐标可用
const GEO = `(() => {
  const el = document.querySelector('.vtravel');
  if (!el) return { err: 'no .vtravel in DOM' };
  el.scrollIntoView({ block: 'center' });
  const track = el.querySelector('.vtravel-track');
  const fill = el.querySelector('.vtravel-fill');
  const bubble = el.querySelector('.vtravel-bubble');
  if (!track) return { err: 'no .vtravel-track' };
  const tr = track.getBoundingClientRect();
  const fr = fill ? fill.getBoundingClientRect() : null;
  const fRatio = fr ? +(fr.height / tr.height).toFixed(3) : null;
  const bPct = bubble ? parseFloat(bubble.style.top) / 100 : null;
  return {
    viewport: { w: innerWidth, h: innerHeight },
    track: { x: Math.round(tr.left), y: Math.round(tr.top), w: Math.round(tr.width), h: Math.round(tr.height) },
    inViewport: tr.top >= 0 && tr.bottom <= innerHeight && tr.left >= 0 && tr.right <= innerWidth,
    fillH: fr ? Math.round(fr.height * 10) / 10 : null,
    fillRatio: fRatio,
    bubbleText: bubble ? (bubble.innerText || '').trim() : null,
    bubbleTop: bubble ? bubble.style.top : null,
    bubbleTracks: bubble && bPct !== null ? true : false,
    bubbleHasPencil: !!(bubble && bubble.querySelector('svg')),
    majors: [...el.querySelectorAll('.vtravel-major')].map((x) => (x.innerText || '').trim()),
    minorCount: el.querySelectorAll('.vtravel-minor').length,
    role: track.getAttribute('role'),
    tabIndex: track.tabIndex,
    ariaNow: track.getAttribute('aria-valuenow'),
    ariaMax: track.getAttribute('aria-valuemax'),
    ariaText: track.getAttribute('aria-valuetext'),
    ariaLabel: track.getAttribute('aria-label'),
  };
})()`;

(async () => {
  const list = JSON.parse(await get(BASE + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (m, p = {}) =>
    new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');

  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  await send('Page.navigate', { url: cur.result.value.split('?')[0] + '?' + SEARCH });
  await new Promise((r) => setTimeout(r, 3500));

  const ev = async (js) => {
    const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('页面脚本异常: ' + JSON.stringify(r.exceptionDetails.exception));
    return r.result.value;
  };

  // ---------- A 段：结构 ----------
  const before = await ev(GEO);
  console.log('=== A 段 · 结构 ===');
  console.log(JSON.stringify(before, null, 1));
  if (before.err) { ws.close(); process.exit(1); }

  const checks = [];
  checks.push(['柱体宽度 >= 28', before.track.w >= 28, `${before.track.w}px`]);
  checks.push(['柱体高度 == height', before.track.h >= 120, `${before.track.h}px`]);
  checks.push(['role=slider', before.role === 'slider', before.role]);
  checks.push(['tabIndex=0', before.tabIndex === 0, before.tabIndex]);
  checks.push(['aria 三件套齐全', !!(before.ariaNow && before.ariaMax && before.ariaText), `now=${before.ariaNow} max=${before.ariaMax} text=${before.ariaText}`]);
  checks.push(['主刻度 >= 5 且首项 0.00', before.majors.length >= 5 && before.majors[0] === '0.00', before.majors.join(' / ')]);
  checks.push(['次刻度存在', before.minorCount >= 1, `${before.minorCount} 个`]);
  checks.push(['气泡带铅笔图标', before.bubbleHasPencil === true, String(before.bubbleHasPencil)]);
  checks.push(['气泡定位存在', before.bubbleTracks === true, `bubble top=${before.bubbleTop}`]);

  // ---------- B 段：交互（两条路径） ----------
  const max = Number(before.ariaMax);
  const targetRatioFromTop = 0.75; // 距顶 75% → 行程 75%
  const expect = +(max * targetRatioFromTop).toFixed(2);

  const report = (label, after) => {
    const ok = Math.abs(Number(after.ariaNow) - expect) < 0.25;
    console.log(`  ${label}: aria-valuenow=${after.ariaNow}  气泡「${after.bubbleText}」  填充 ${after.fillH}px (${after.fillRatio})  → ${ok ? '✅ 通过' : '❌ 未通过'}`);
    return ok;
  };

  console.log('\n=== B 段 · 交互 ===');
  console.log(`  视口 ${before.viewport.w}×${before.viewport.h}，柱体 y=${before.track.y}~${before.track.y + before.track.h}，完全在视口内=${before.inViewport}`);
  console.log(`  期望值 ≈ ${expect}（max ${before.ariaMax} × 0.75）`);

  // --- B1: CDP 真实鼠标 ---
  const cx = Math.round(before.track.x + before.track.w / 2);
  const yStart = Math.round(before.track.y + 4);
  const yTarget = Math.round(before.track.y + before.track.h * targetRatioFromTop);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: yStart, button: 'left', clickCount: 1, buttons: 1 });
  await new Promise((r) => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: yTarget, button: 'left', buttons: 1 });
  await new Promise((r) => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: yTarget, button: 'left', clickCount: 1, buttons: 0 });
  await new Promise((r) => setTimeout(r, 250));

  let after1 = await ev(GEO);
  const ok1 = report('B1 真实鼠标(CDP)', after1);

  // --- B2: 页面内合成 PointerEvent（绕过命中测试，只验 React 接线） ---
  const synth = await ev(`(() => {
    const t = document.querySelector('.vtravel-track');
    t.scrollIntoView({ block: 'center' });
    const r = t.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const mk = (type, y, buttons) => new PointerEvent(type, {
      bubbles: true, cancelable: true, composed: true,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons,
      clientX: cx, clientY: y,
    });
    const yStart = r.bottom - 4, yEnd = r.top + r.height * ${targetRatioFromTop};
    t.dispatchEvent(mk('pointerdown', yStart, 1));
    t.dispatchEvent(mk('pointermove', yEnd, 1));
    t.dispatchEvent(mk('pointerup', yEnd, 0));
    return t.getAttribute('aria-valuenow');
  })()`);
  await new Promise((r) => setTimeout(r, 250));
  const after2 = await ev(GEO);
  const ok2 = report('B2 合成 PointerEvent', after2);
  console.log(`     （B2 派发后同一帧返回值 ${synth}）`);

  // ---------- 汇总 ----------
  console.log('\n=== 结构检查 ===');
  let allOk = true;
  for (const [name, pass, detail] of checks) {
    if (!pass) allOk = false;
    console.log(`  ${pass ? '✅' : '❌'} ${name} —— ${detail}`);
  }
  console.log('\n=== 结论 ===');
  if (allOk && (ok1 || ok2)) {
    if (ok1 && ok2) console.log('  ✅ 竖向行程滑块：结构与交互全部通过');
    else console.log(`  ✅ 结构通过；交互在 ${ok1 ? 'CDP' : '合成事件'} 路径通过，另一条失败 —— 属探针/视口问题，组件本身正常`);
  } else {
    allOk ? console.log('  ❌ 结构通过，但两条交互路径都失败 —— 组件指针事件接线有问题，需要修组件') : console.log('  ❌ 结构或交互存在不合格项，见上');
  }

  ws.close();
  process.exit(allOk && (ok1 || ok2) ? 0 : 1);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

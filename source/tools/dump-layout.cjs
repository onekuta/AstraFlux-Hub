// 界面布局探针（纯数据，不出截图）
// 用途：检测窗口内元素的包围盒越界、横向溢出、同级重叠
// 用法: node tools/dump-layout.cjs [cdpBaseUrl] [queryString]
const http = require('http');

const get = (p) =>
  new Promise((res, rej) => {
    http
      .get(p, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(d));
      })
      .on('error', rej);
  });

const JS = `(() => {
  const r2 = (n) => Math.round(n * 10) / 10;
  const rectOf = (e) => { const r = e.getBoundingClientRect(); return {
    x: r2(r.left), y: r2(r.top), w: r2(r.width), h: r2(r.height), r: r2(r.right), b: r2(r.bottom) }; };
  const path = (e) => {
    let s = e.tagName.toLowerCase();
    if (typeof e.className === 'string' && e.className.trim()) {
      s += '.' + e.className.trim().split(/\\s+/).slice(0, 4).join('.');
    }
    const t = (e.innerText || '').replace(/\\s+/g, ' ').trim();
    if (t) s += ' ["' + t.slice(0, 34) + '"]';
    return s;
  };
  const visible = (e) => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // 把元素矩形与所有「会裁剪的祖先」（overflow !== visible）求交，
  // 得到它在屏幕上真正可见的盒子。
  // 必要性：滚动容器里被滚出可视区的内容，getBoundingClientRect 仍返回原始布局位置，
  // 直接拿它做重叠判定会大量误报（实测改键页 32 处、高级页 2 处全是这种假阳性）。
  const visibleBox = (e) => {
    const b = e.getBoundingClientRect();
    const box = { l: b.left, t: b.top, r: b.right, b: b.bottom };
    let n = e.parentElement;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const r = n.getBoundingClientRect();
        box.l = Math.max(box.l, r.left);
        box.t = Math.max(box.t, r.top);
        box.r = Math.min(box.r, r.right);
        box.b = Math.min(box.b, r.bottom);
      }
      n = n.parentElement;
    }
    return box;
  };
  // 可见面积占自身面积的比例（<5% 视为完全被裁掉）
  const visibleRatio = (e) => {
    const r = e.getBoundingClientRect();
    const v = visibleBox(e);
    const area = r.width * r.height;
    if (area <= 0) return 0;
    const w = Math.max(0, v.r - v.l);
    const h = Math.max(0, v.b - v.t);
    return (w * h) / area;
  };

  const content = document.querySelector('.app-content');
  const contentRect = content ? rectOf(content) : null;

  // ---------- 1. 关键容器包围盒 ----------
  const named = {};
  const put = (label, sel) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (e) named[label] = rectOf(e);
  };
  put('viewport', document.documentElement);
  put('titlebar', '.app-titlebar');
  put('app-body', '.app-body');
  put('sidebar', '.sidebar');
  put('app-content', '.app-content');
  const contentKids = content ? [...content.children].filter(visible) : [];
  contentKids.forEach((el, i) => { named['app-content>[' + i + '] ' + path(el).slice(0, 60)] = rectOf(el); });
  put('keyboard-card', '.app-content .flex-1.min-w-0');
  put('quick-bar', '.app-content .w-32');
  put('operation-columns', '.operation-columns');
  const cols = [...document.querySelectorAll('.operation-columns > .col')];
  cols.forEach((c, i) => { named['col[' + i + ']'] = rectOf(c); });

  // ---------- 1b. 主要容器的滚动状态（判断「内容超出」是被裁掉还是可滚动） ----------
  const scrollBoxes = [];
  ['.app-content', '.panel-operation', '.operation-columns', ...cols].forEach((sel) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!e) return;
    const cs = getComputedStyle(e);
    scrollBoxes.push({
      el: typeof sel === 'string' ? sel : 'col',
      clientH: Math.round(e.clientHeight),
      scrollH: Math.round(e.scrollHeight),
      over: Math.round(e.scrollHeight - e.clientHeight),
      overflowY: cs.overflowY,
      scrollable: e.scrollHeight - e.clientHeight > 2 && cs.overflowY === 'auto',
    });
  });

  // ---------- 2. 越界：超出 .app-content 可视区 ----------
  const bleeds = [];
  if (content) {
    const all = [...content.querySelectorAll('*')].filter(visible);
    all.forEach((e) => {
      // 被滚动容器裁掉的内容不算「越界」，见 visibleBox 注释
      if (visibleRatio(e) < 0.05) return;
      const v = visibleBox(e);
      const overR = v.r - contentRect.r;
      const overB = v.b - contentRect.b;
      const overL = contentRect.x - v.l;
      if (overR > 2 || overB > 2 || overL > 2) {
        bleeds.push({
          el: path(e),
          overRight: r2(overR),
          overBottom: r2(overB),
          overLeft: r2(overL),
          visible: Math.round(visibleRatio(e) * 100) + '%',
          box: rectOf(e),
        });
      }
    });
  }

  // ---------- 3. 横向溢出（内容被裁剪 / 挤在一堆） ----------
  const overflow = [];
  const scan = content || document.body;
  [...scan.querySelectorAll('*')].forEach((e) => {
    if (!visible(e)) return;
    const ox = e.scrollWidth - e.clientWidth;
    const oy = e.scrollHeight - e.clientHeight;
    const cs = getComputedStyle(e);
    const clipsX = cs.overflowX === 'hidden' ? ox > 2 : ox > 2;
    // 文字被截断：元素自身有文本且 scrollWidth 明显大于 clientWidth
    const hasOwnText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if ((ox > 2 && (clipsX || hasOwnText)) || oy > 2) {
      overflow.push({ el: path(e), overflowX: ox, overflowY: oy, clientW: e.clientWidth, scrollW: e.scrollWidth, clipped: cs.overflowX === 'hidden' || cs.overflowY === 'hidden' });
    }
  });

  // ---------- 4. 同级「实心块」重叠检测 ----------
  const isSolidBlock = (e) => {
    const cs = getComputedStyle(e);
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;
    if (cs.pointerEvents === 'none') return false;
    const bg = cs.backgroundColor;
    const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    const hasBorder = parseFloat(cs.borderTopWidth) > 0;
    return hasBg || hasBorder;
  };
  const overlaps = [];
  // 祖先链诊断：定位「高度约束链条」在哪里断掉（overflowY / flex / minHeight）
  const chain = (e) => {
    const out = [];
    let n = e;
    for (let k = 0; k < 6 && n && n !== document.body; k++) {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      out.push({
        p: path(n).slice(0, 58),
        h: Math.round(r.height),
        oy: cs.overflowY,
        fx: cs.flex,
        minH: cs.minHeight,
        sc: Math.round(n.scrollHeight - n.clientHeight),
      });
      n = n.parentElement;
    }
    return out;
  };
  if (content) {
    const blocks = [...content.querySelectorAll('*')].filter((e) => visible(e) && isSolidBlock(e));
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i], b = blocks[j];
        if (a.contains(b) || b.contains(a)) continue;
        // 跳过共享同一个直接父节点的兄弟（flex 正常排布，往往只是紧贴）
        // 用「可见盒」而非原始矩形判定，避免滚动容器内的假阳性
        const va = visibleBox(a), vb = visibleBox(b);
        const ix = Math.min(va.r, vb.r) - Math.max(va.l, vb.l);
        const iy = Math.min(va.b, vb.b) - Math.max(va.t, vb.t);
        if (ix > 3 && iy > 3) {
          overlaps.push({ a: path(a).slice(0, 70), b: path(b).slice(0, 70), ix: r2(ix), iy: r2(iy), area: Math.round(ix * iy), _a: a, _b: b });
        }
      }
    }
    overlaps.sort((x, y) => y.area - x.area);
    // 只给前 3 处重叠附带祖先链，避免输出爆炸
    overlaps.slice(0, 3).forEach((o) => {
      o.chainA = chain(o._a);
      o.chainB = chain(o._b);
    });
    overlaps.forEach((o) => {
      delete o._a;
      delete o._b;
    });
  }

  // ---------- 5. 键帽内部是否挤压（三行内容塞进 46px 高） ----------
  const keycapSqueeze = [];
  document.querySelectorAll('.keycap-lite, .keycap-light, .keycap-lite-selected, .keycap-light-selected').forEach((e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    const kids = [...e.children];
    const contentH = kids.reduce((s, c) => s + c.getBoundingClientRect().height, 0);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const need = Math.round((contentH + pad) * 10) / 10;
    const over = Math.round((need - r.height) * 10) / 10;
    if (over > 0) {
      keycapSqueeze.push({ key: (e.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 18), boxH: Math.round(r.height), needH: need, over });
    }
  });

  // ---------- 6. 键盘底板整行宽度是否超出容器 ----------
  const plate = document.querySelector('.keyboard-plate');
  const plateRows = [];
  if (plate) {
    const pr = plate.getBoundingClientRect();
    [...plate.children].forEach((row, i) => {
      const rr = row.getBoundingClientRect();
      plateRows.push({ row: i, rowW: Math.round(rr.width), plateInnerW: Math.round(pr.width - parseFloat(getComputedStyle(plate).paddingLeft) * 2), over: Math.round((rr.width - pr.width) * 10) / 10 });
    });
  }

  // ---------- 7. 键盘自适应诊断 ----------
  // 卡片的层级：.app-content > div.flex.gap-3 > div.flex-1.min-w-0(白卡) > div.p-4(ref=kbWrapRef) > div.flex.flex-col.w-fit(plate)
  const kbDiag = (() => {
    const card = document.querySelector('.app-content .flex-1.min-w-0');
    const wrap = card && card.querySelector(':scope > div.p-4');
    if (!card || !wrap) return { found: false };
    const plate = wrap.querySelector('.flex.flex-col.w-fit');
    const cs = getComputedStyle(wrap);
    const row0 = plate ? plate.children[0] : null;
    const firstKey = row0 ? row0.children[0] : null;
    const fkRect = firstKey ? firstKey.getBoundingClientRect() : null;
    const fkInline = firstKey ? firstKey.style.width : null;
    // 由第一个键帽反推 1u：keyWidth = round(k.width * kbUnit - 6)
    const kbUnit = fkRect ? Math.round((fkRect.width + 6) * 10) / 10 : null;
    const wrapRect = wrap.getBoundingClientRect();
    const plateRect = plate ? plate.getBoundingClientRect() : null;
    return {
      found: true,
      card: { w: Math.round(card.getBoundingClientRect().width), x: Math.round(card.getBoundingClientRect().left) },
      wrap: {
        w: Math.round(wrapRect.width),
        x: Math.round(wrapRect.left),
        r: Math.round(wrapRect.right),
        clientW: wrap.clientWidth,
        scrollW: wrap.scrollWidth,
        over: wrap.scrollWidth - wrap.clientWidth,
        padL: cs.paddingLeft,
        padR: cs.paddingRight,
        inner: wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        overflowX: cs.overflowX,
      },
      plate: plateRect
        ? { w: Math.round(plateRect.width), x: Math.round(plateRect.left), r: Math.round(plateRect.right) }
        : null,
      // 底板相对 卡片可视区 的溢出（正数=真的戳出去了）
      plateOverflow: plateRect
        ? {
            left: Math.round(wrapRect.left - plateRect.left + parseFloat(cs.paddingLeft)),
            right: Math.round(plateRect.right - (wrapRect.right - parseFloat(cs.paddingRight))),
          }
        : null,
      firstKey: fkRect ? { inlineW: fkInline, realW: Math.round(fkRect.width * 10) / 10, h: Math.round(fkRect.height) } : null,
      derivedUnit: kbUnit,
      rows: plate
        ? [...plate.children].slice(0, 6).map((r, i) => ({
            i,
            w: Math.round(r.getBoundingClientRect().width),
            units: Math.round([...r.children].reduce((s, c) => s + c.getBoundingClientRect().width + 6, 0)),
          }))
        : [],
    };
  })();

  // ---------- 8. 用「原始矩形」再算一遍重叠（不裁剪），用于交叉验证 ----------
  const rawOverlaps = [];
  if (content) {
    const blocks = [...content.querySelectorAll('*')].filter((e) => visible(e) && isSolidBlock(e));
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i], b = blocks[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ix > 3 && iy > 3) {
          rawOverlaps.push({ a: path(a).slice(0, 62), b: path(b).slice(0, 62), ix: r2(ix), iy: r2(iy), area: Math.round(ix * iy) });
        }
      }
    }
    rawOverlaps.sort((x, y) => y.area - x.area);
  }

  return JSON.stringify({
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    containers: named,
    scrollBoxes,
    kbDiag,
    rawOverlapCount: rawOverlaps.length,
    rawOverlaps: rawOverlaps.slice(0, 8),
    bleeds: bleeds.slice(0, 14),
    overflow: overflow.slice(0, 14),
    topOverlaps: overlaps.slice(0, 14),
    overlapCount: overlaps.length,
    keycapSqueeze: keycapSqueeze.slice(0, 10),
    keycapSqueezeCount: keycapSqueeze.length,
    plateRows: plateRows.slice(0, 6),
    bodyText: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 300),
  }, null, 1);
})()`;

// 核心：跑一次布局探针，返回 { emulate, text }
// 抽成函数是为了能被 scan-layout.cjs 直接 require 调用
// （沙箱里 node.exe 不能 spawn 自己，EBUSY）
async function dumpLayout(opts = {}) {
  const base = opts.base || 'http://127.0.0.1:9333';
  const search = opts.search || 'view=device&tab=trigger&profile=es68';
  const viewportArg = opts.viewport || '';
  const [vw, vh] = viewportArg.split('x').map((n) => parseInt(n, 10));

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
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) {
      return 'JS_ERROR ' + JSON.stringify(r.result.exceptionDetails);
    }
    return r.result && r.result.result && r.result.result.value;
  };
  await new Promise((r) => { ws.onopen = r; });
  await send('Runtime.enable');
  await send('Page.enable');

  let emulate = '';
  if (vw && vh) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vw,
      height: vh,
      deviceScaleFactor: 1,
      mobile: false,
    });
    emulate = `EMULATE ${vw}x${vh}`;
  } else {
    // 不传视口参数时清掉上一次的模拟，避免被前一次调用污染
    await send('Emulation.clearDeviceMetricsOverride', {});
  }

  const target = page.url.split('?')[0] + '?' + search;
  await send('Page.navigate', { url: target });
  await new Promise((r) => setTimeout(r, 4500));

  const text = await evalJs(JS);
  ws.close();
  return { emulate, text };
}

module.exports = { dumpLayout };

if (require.main === module) {
  dumpLayout({
    base: process.argv[2] || 'http://127.0.0.1:9333',
    search: process.argv[3] || 'view=device&tab=trigger&profile=es68',
    viewport: process.argv[4] || '',
  })
    .then(({ emulate, text }) => {
      if (emulate) console.log(emulate);
      console.log('=== LAYOUT_DUMP_START ===');
      console.log(text);
      console.log('=== LAYOUT_DUMP_END ===');
      process.exit(0);
    })
    .catch((e) => {
      console.error('LAYOUT PROBE FAILED:', e.message);
      process.exit(1);
    });
}

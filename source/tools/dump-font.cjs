// 字体探针（纯数据，不出截图）
// 用途：确认「思源黑体 Noto Sans SC / 得意黑 Smiley Sans」是否真的加载并命中元素
// 用法: node tools/dump-font.cjs [cdpBaseUrl] [queryString]
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const search = process.argv[3] || 'view=device&tab=trigger&profile=es68';

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
  const out = {};

  // ---------- 1. FontFaceSet 里注册了哪些字体 ----------
  const faces = [];
  document.fonts.forEach((f) => {
    faces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status });
  });
  out.fontFaces = faces;
  out.fontFaceCount = faces.length;
  out.familiesRegistered = [...new Set(faces.map((f) => f.family))];
  out.notLoaded = faces.filter((f) => f.status !== 'loaded').map((f) => f.family + ' ' + f.weight);

  // ---------- 2. 能否用该字体渲染 ----------
  out.check = {
    notoSansSC_14: document.fonts.check('14px "Noto Sans SC"'),
    notoSansSC_700: document.fonts.check('700 14px "Noto Sans SC"'),
    smileySans_16: document.fonts.check('16px "Smiley Sans"'),
    smileySans_700: document.fonts.check('700 16px "Smiley Sans"'),
    pmzd_20: document.fonts.check('20px "PangMenZhengDao"', '星闪悦动ES68'),
    pmzd_700: document.fonts.check('700 20px "PangMenZhengDao"', '星闪悦动ES68'),
  };

  // ---------- 2b. 实测渲染宽度：字体到底有没有真的生效 ----------
  // computed font-family 只说明「栈里写了谁」，不代表字形真的来自它。
  // 用 canvas measureText 分别量同名文本在「目标字体」与「系统兜底」下的宽度，
  // 两者不等才说明目标字体确实命中。
  const probe = (family, text, size) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = size + 'px ' + family;
    return Math.round(ctx.measureText(text).width * 100) / 100;
  };
  out.measure = {
    cn40_pmzd: probe('"PangMenZhengDao"', '星闪悦动', 40),
    cn40_fallback: probe('sans-serif', '星闪悦动', 40),
    cn40_noto: probe('"Noto Sans SC"', '星闪悦动', 40),
    en40_pmzd: probe('"PangMenZhengDao"', 'ES68', 40),
    en40_fallback: probe('sans-serif', 'ES68', 40),
  };

  // ---------- 3. CSS 变量实际值 ----------
  const cs = getComputedStyle(document.documentElement);
  out.cssVars = {
    fontSans: cs.getPropertyValue('--font-sans').trim(),
    fontDisplay: cs.getPropertyValue('--font-display').trim(),
    fontTitle: cs.getPropertyValue('--font-title').trim(),
    fontMono: cs.getPropertyValue('--font-mono').trim(),
  };

  // ---------- 4. 关键元素的 computed font-family ----------
  const norm = (v) => v.replace(/\\s+/g, ' ');
  out.elements = [];
  const push = (label, sel) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!e) { out.elements.push({ label, missing: true }); return; }
    const s = getComputedStyle(e);
    out.elements.push({
      label,
      sel: typeof sel === 'string' ? sel : '',
      text: (e.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 28),
      family: norm(s.fontFamily).slice(0, 90),
      size: s.fontSize,
      weight: s.fontWeight,
      isTitleHit: norm(s.fontFamily).includes('PangMenZhengDao'),
      isDisplayHit: norm(s.fontFamily).includes('Smiley Sans'),
      isSansHit: norm(s.fontFamily).includes('Noto Sans SC'),
    });
  };
  push('body', 'body');
  push('h1', 'h1');
  push('h2', 'h2');
  push('h3', 'h3');
  push('品牌名 .text-brand-gradient', '.text-brand-gradient');
  push('设备卡型号 .device-card-name', '.device-card-name');
  push('面板小标题 .section-title', '.section-title');
  push('页面大标题 .page-title', '.page-title');
  push('侧栏分组标题 .nav-group-title', '.nav-group-title');
  push('模态标题 .modal-title', '.modal-title');
  push('按钮 button', 'button');
  push('输入框 input', 'input');

  // ---------- 5. 全页扫描：有多少元素命中了新字体栈 ----------
  const all = [...document.querySelectorAll('*')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && (e.innerText || '').trim();
  });
  let hitSans = 0, hitTitle = 0, hitDisplay = 0, hitMono = 0, other = 0;
  const otherSamples = [];
  all.forEach((e) => {
    const f = norm(getComputedStyle(e).fontFamily);
    if (f.includes('PangMenZhengDao')) hitTitle++;
    else if (f.includes('Smiley Sans')) hitDisplay++;
    else if (f.includes('Noto Sans SC')) hitSans++;
    else if (/mono|Menlo|Consolas|monospace/.test(f)) hitMono++;
    else {
      other++;
      if (otherSamples.length < 6) {
        otherSamples.push({ tag: e.tagName.toLowerCase(), text: (e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22), family: f.slice(0, 70) });
      }
    }
  });
  out.scan = { total: all.length, hitSans, hitTitle, hitDisplay, hitMono, other, otherSamples };

  // ---------- 6. 已加载字体资源（performance entries） ----------
  out.fontResources = performance
    .getEntriesByType('resource')
    .filter((r) => r.name.includes('.woff2'))
    .map((r) => ({ name: r.name.split('/').pop(), size: r.transferSize || r.decodedBodySize }));

  // ---------- 7. 文档标识 ----------
  const s = [...document.querySelectorAll('script[src]')].map((x) => x.getAttribute('src'));
  const l = [...document.querySelectorAll('link[rel=stylesheet]')].map((x) => x.getAttribute('href'));
  out.bundle = { scripts: s, styles: l, title: document.title };

  return out;
})()`;

(async () => {
  const list = JSON.parse(await get(`${base}/json/list`));
  const page = list.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');
  const ws = page.webSocketDebuggerUrl;

  // 复用 Node 内建 WebSocket（Node >= 22），无需额外依赖
  const sock = new globalThis.WebSocket(ws);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const mid = ++id;
      pending.set(mid, { res, rej });
      sock.send(JSON.stringify({ id: mid, method, params }));
    });

  sock.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };

  await new Promise((res) => (sock.onopen = res));
  await send('Page.enable');
  await send('Runtime.enable');

  // 用应用自身已打开的页面，直接重载到目标 query
  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  const targetUrl = cur.result.value.split('?')[0] + '?' + search;
  await send('Page.navigate', { url: targetUrl });
  await new Promise((r) => setTimeout(r, 3500));

  const r = await send('Runtime.evaluate', { expression: JS, returnByValue: true, awaitPromise: true });
  const v = r.result.value;

  console.log('=== 字体探针 ===');
  console.log('bundle:', JSON.stringify(v.bundle));
  console.log('\n--- FontFaceSet 已注册 (' + v.fontFaceCount + ') ---');
  v.familiesRegistered.forEach((f) => {
    const n = v.fontFaces.filter((x) => x.family === f).length;
    console.log(`  ${f}  ×${n}`);
  });
  if (v.notLoaded.length) console.log('  ⚠ NOT loaded:', v.notLoaded.join(' | '));
  else console.log('  ✅ 全部 loaded');

  console.log('\n--- document.fonts.check ---');
  Object.entries(v.check).forEach(([k, ok]) => console.log(`  ${ok ? '✅' : '❌'} ${k}`));

  console.log('\n--- CSS 变量 ---');
  console.log('  --font-sans   :', v.cssVars.fontSans);
  console.log('  --font-title  :', v.cssVars.fontTitle);
  console.log('  --font-display:', v.cssVars.fontDisplay);
  console.log('  --font-mono   :', v.cssVars.fontMono);

  console.log('\n--- 实测渲染宽度（40px）---');
  const mm = v.measure;
  const dCN = Math.round((mm.cn40_pmzd - mm.cn40_fallback) * 100) / 100;
  const dEN = Math.round((mm.en40_pmzd - mm.en40_fallback) * 100) / 100;
  console.log(`  「星闪悦动」庞门正道 ${mm.cn40_pmzd} | 思源 ${mm.cn40_noto} | 系统兜底 ${mm.cn40_fallback}  → 差 ${dCN}px`);
  console.log(`  「ES68」   庞门正道 ${mm.en40_pmzd} | 系统兜底 ${mm.en40_fallback}  → 差 ${dEN}px`);
  console.log(`  ${dCN !== 0 ? '✅ 庞门正道字形确实命中（宽度与系统兜底不同）' : '❌ 庞门正道未生效，宽度与系统兜底一致'}`);

  console.log('\n--- 关键元素 computed font-family ---');
  v.elements.forEach((e) => {
    if (e.missing) return console.log(`  ? ${e.label}  (未找到)`);
    const tag = e.isTitleHit ? '庞门正道标题体' : e.isDisplayHit ? '得意黑' : e.isSansHit ? '思源黑体' : '其它';
    console.log(`  [${tag}] ${e.label}  ${e.size}/${e.weight}  "${e.text}"`);
    console.log(`        ${e.family}`);
  });

  console.log('\n--- 全页扫描 ---');
  const s = v.scan;
  console.log(`  可见有文本元素 ${s.total} 个`);
  console.log(`  思源黑体 ${s.hitSans} | 庞门正道标题体 ${s.hitTitle} | 得意黑 ${s.hitDisplay} | 等宽 ${s.hitMono} | 其它 ${s.other}`);
  if (s.otherSamples.length) {
    console.log('  其它样例:');
    s.otherSamples.forEach((o) => console.log(`    ${o.tag} "${o.text}" → ${o.family}`));
  }

  console.log('\n--- 字体资源请求 ---');
  v.fontResources.forEach((r) => console.log(`  ${r.name}  ${(r.size / 1024).toFixed(1)} KB`));
  console.log(`  共 ${v.fontResources.length} 个 woff2`);

  sock.close();
})().catch((e) => {
  console.error('FONT PROBE FAILED:', e.message);
  process.exit(1);
});

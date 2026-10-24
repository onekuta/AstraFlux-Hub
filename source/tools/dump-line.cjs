// 竖分隔线「到底看不看得见」的像素实测（纯数据，不出截图到项目目录）
// ------------------------------------------------------------------
// 为什么必须有这个脚本：
//   视觉模型对 1px 细线的判断**极不可靠** —— 它多次报「三列之间看不到竖分隔线」，
//   而几何探针只认 border-left 是否存在，两者都答不了「人眼到底看不看得出来」。
//   本脚本走第三条路：CDP 按 clip 抓分隔线那一窄条（22×30），**自己解 PNG 像素**，
//   算出「分隔线相对面板底色」的真实对比度，用 WCAG 非文本元素门槛 1.5:1 仲裁。
//   实测：原 9% 不透明度 → 1.19:1（确实看不见，模型这次是对的）；
//         改 22% 后 → 1.56:1（达标，模型仍报"看不见"= 它的输入分辨率问题）。
//
// 用法: node tools/dump-line.cjs [cdpBase] [viewQuery]
// ------------------------------------------------------------------
const http = require('http');
const zlib = require('zlib');

const BASE = process.argv[2] || 'http://127.0.0.1:9333';
const VIEW = process.argv[3] || 'view=device&tab=advanced&profile=es68';
const get = (p) => new Promise((res, rej) => http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej));

// ---- 极简 PNG 解码（只支持 8bit RGB/RGBA 非隔行）----
function decodePNG(buf) {
  let off = 8; const idat = [];
  let w = 0, h = 0, bpp = 0, colorType = 0;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      const bitDepth = data[8]; colorType = data[9]; const interlace = data[12];
      if (bitDepth !== 8 || interlace !== 0) throw new Error(`不支持的 PNG: bitDepth=${bitDepth} interlace=${interlace}`);
      bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
      if (!bpp) throw new Error('不支持的 colorType=' + colorType);
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let p = 0;
  for (let y = 0; y < h; y += 1) {
    const f = raw[p++];
    const line = raw.slice(p, p + stride); p += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, bpp, px: out };
}
const lum = (r, g, b) => 0.2126 * (r / 255) ** 2.2 + 0.7152 * (g / 255) ** 2.2 + 0.0722 * (b / 255) ** 2.2;
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

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
  await send('Page.navigate', { url: cur.result.value.split('?')[0] + '?' + VIEW });
  await new Promise((r) => setTimeout(r, 2800));

  // 找第 2 列的 border-left 位置（就是分隔线），并取面板竖直中点
  const g = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.panel-operation');
      if (!panel) return null;
      const cols = [...panel.querySelectorAll(':scope > .operation-columns > .col')];
      if (cols.length < 2) return null;
      const r = cols[1].getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      return { lineX: r.left, y: Math.round(pr.top + pr.height / 2), panelBg: getComputedStyle(panel).backgroundColor };
    })()`, returnByValue: true,
  });
  const G = g.result.value;
  if (!G) { console.error('FAIL 找不到 .operation-columns 分隔线'); process.exit(1); }

  const X0 = Math.round(G.lineX) - 10;
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: X0, y: G.y - 15, width: 22, height: 30, scale: 1 },
  });
  const img = decodePNG(Buffer.from(shot.data, 'base64'));
  console.log(`##### 分隔线像素实测 · ${VIEW} #####`);
  console.log(`面板底色 ${G.panelBg}   分隔线 x=${Math.round(G.lineX)}（截图从 x=${X0} 起，宽 ${img.w}px，高 ${img.h}px）\n`);
  console.log('截图列 ┐  平均RGB        亮度L    相对面板底色的对比度');
  const col = [];
  for (let x = 0; x < img.w; x += 1) {
    let r = 0, gg = 0, b = 0;
    for (let y = 0; y < img.h; y += 1) { const o = y * img.w * img.bpp + x * img.bpp; r += img.px[o]; gg += img.px[o + 1]; b += img.px[o + 2]; }
    const n = img.h;
    col.push({ x, r: r / n, g: gg / n, b: b / n, L: lum(r / n, gg / n, b / n) });
  }
  const bg = col[0].L;
  col.forEach((c) => {
    const isLine = Math.abs(c.x + X0 - Math.round(G.lineX)) < 1;
    console.log(
      `  x=${String(c.x + X0).padStart(4)} ${isLine ? '◀ 分隔线' : '        '}  ` +
      `rgb(${c.r.toFixed(0)},${c.g.toFixed(0)},${c.b.toFixed(0)})`.padEnd(18) +
      `${c.L.toFixed(4)}   ${ratio(c.L, bg).toFixed(3)}:1`,
    );
  });
  const line = col.find((c) => Math.abs(c.x + X0 - Math.round(G.lineX)) < 1) || col[Math.floor(col.length / 2)];
  const dark = col.reduce((a, b) => (b.L < a.L ? b : a));
  console.log(`\n结论：面板底色 L=${bg.toFixed(4)}；最深一列 x=${dark.x + X0} L=${dark.L.toFixed(4)}`);
  console.log(`      分隔线相对底色对比度 = ${ratio(line.L, bg).toFixed(3)}:1  →  ${ratio(line.L, bg) >= 1.5 ? '✅ 达到 WCAG 非文本元素 1.5:1 门槛，肉眼可辨' : '❌ 低于 1.5:1，肉眼几乎不可见'}`);
  ws.close(); process.exit(0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

#!/usr/bin/env node
/**
 * vision-app —— 「让第二双眼睛看当前界面」：抓当前 App 画面 → 交给 Antigravity 的视觉模型 → 删掉临时图
 *
 * 为什么要有它：
 *   改完 UI 后，探针能证明「几何上没有重叠」（可信但只认数字），
 *   却证明不了「看起来是否整齐」。让 Gemini / Claude 的视觉复核一遍，
 *   和探针的结论互补 —— 本次就是这样抓出了「侧栏最后一项被切成半截」。
 *
 * ⚠️ 本项目铁律：不产出界面截图。所以临时 PNG **只写系统临时目录**，
 *   而且默认在调用结束后立刻删除；`--keep` 才会留下（排障用，用完记得自己删）。
 *   项目目录里永远不会出现任何 png。
 *
 * 用法:
 *   node tools/vision-app.cjs "<问题>" [选项]
 *
 * 选项:
 *   --view <query>   驱动页查询串，默认 view=device&tab=trigger&profile=es68
 *   --vp <WxH>       用 Emulation 模拟视口，如 1380x880；不传 = 真实窗口
 *   --click <文字>   导航后点一个按钮（按可见文字精确匹配），用于切子标签
 *   --model <id>     传给 vision.cjs 的模型
 *   --timeout <秒>   传给 vision.cjs
 *   --keep           保留临时 PNG（默认删除）
 *
 * 🚨 子进程必须用异步 spawn —— 本沙箱里 spawnSync/execSync 一律 EBUSY（详见 SOP 第十章）。
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const argv = process.argv.slice(2);
const opts = { view: 'view=device&tab=trigger&profile=es68', vp: '', click: '', model: '', timeout: '', keep: false };
let question = '';
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--view') { opts.view = argv[++i]; continue; }
  if (a === '--vp') { opts.vp = argv[++i]; continue; }
  if (a === '--click') { opts.click = argv[++i]; continue; }
  if (a === '--model') { opts.model = argv[++i]; continue; }
  if (a === '--timeout') { opts.timeout = argv[++i]; continue; }
  if (a === '--keep') { opts.keep = true; continue; }
  if (a.startsWith('--')) { console.error(`未知选项 ${a}`); process.exit(1); }
  question = question ? `${question} ${a}` : a;
}
if (!question) {
  console.error('用法: node tools/vision-app.cjs "<问题>" [--view q] [--vp 1380x880] [--click 死区设置] [--model id] [--keep]');
  process.exit(1);
}

const BASE = process.env.CDP_BASE || 'http://127.0.0.1:9333';
const get = (p) => new Promise((res, rej) => {
  http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
});

/** 异步 spawn 包 Promise（同步版在沙箱里会 EBUSY） */
function run(bin, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(bin, args, { windowsHide: true });
    let out = ''; let err = ''; let done = false;
    const t = setTimeout(() => {
      if (done) return; done = true;
      try { child.kill(); } catch { /* 忽略 */ }
      resolve({ code: -1, out, err, timedOut: true });
    }, timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { if (done) return; done = true; clearTimeout(t); resolve({ code: -2, out, err: String(e.message) }); });
    child.on('close', (c) => { if (done) return; done = true; clearTimeout(t); resolve({ code: c, out, err }); });
  });
}

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

  if (opts.vp) {
    const m = opts.vp.match(/^(\d+)x(\d+)$/);
    if (m) await send('Emulation.setDeviceMetricsOverride', { width: +m[1], height: +m[2], deviceScaleFactor: 1, mobile: false });
  } else {
    try { await send('Emulation.clearDeviceMetricsOverride'); } catch { /* 忽略 */ }
  }

  const cur = await send('Runtime.evaluate', { expression: 'location.href', returnByValue: true });
  await send('Page.navigate', { url: cur.result.value.split('?')[0] + '?' + opts.view });
  await new Promise((r) => setTimeout(r, 3600));

  if (opts.click) {
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const t = [...document.querySelectorAll('button')].find((b) => (b.innerText||'').trim() === ${JSON.stringify(opts.click)});
        if (!t) return false; t.click(); return true;
      })()`,
      returnByValue: true,
    });
    console.log(`[capture] 点击「${opts.click}」= ${r.result.value}`);
    await new Promise((r2) => setTimeout(r2, 1000));
  }

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const tmp = path.join(os.tmpdir(), `sparklink-vision-${Date.now()}.png`);
  fs.writeFileSync(tmp, Buffer.from(shot.data, 'base64'));
  const kb = Math.round(fs.statSync(tmp).size / 1024);
  console.log(`[capture] 临时图 ${tmp}（${kb} KB）—— 项目目录不会产生任何 png`);

  const vArgs = [path.join(__dirname, 'vision.cjs'), tmp, question];
  if (opts.model) vArgs.push('--model', opts.model);
  if (opts.timeout) vArgs.push('--timeout', opts.timeout);

  const r = await run(process.execPath, vArgs, ((Number(opts.timeout) || 300) + 90) * 1000);
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);

  if (!opts.keep) {
    try { fs.unlinkSync(tmp); console.log('[capture] 临时图已删除'); }
    catch (e) { console.error('[capture] 删除失败，请手动清理：' + tmp); }
  }
  ws.close();
  process.exit(r.code === 0 ? 0 : 2);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });

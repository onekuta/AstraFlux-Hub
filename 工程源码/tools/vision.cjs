#!/usr/bin/env node
/**
 * vision.cjs —— 「视觉外援」：把图片交给 Antigravity CLI（agy）读，拿回文字结论
 *
 * 为什么需要它：
 *   普通截图自己就能读，但遇到「高 DPI 密集小字 / 照着官方截图 1:1 复刻 /
 *   需要像素级比对」这类活，换一双眼睛（Gemini 3.8 / Claude Opus 4.6 的视觉）
 *   交叉验证一遍，能挡掉不少误判。
 *   agy 直接跑也行，但它的参数在中文路径 + 引号的 Bash 里极容易翻车，
 *   所以固定成一个脚本：路径在这里统一 resolve，参数用数组传，不经过 shell。
 *
 * 前置：
 *   1. Antigravity CLI 已安装并登录（`agy models` 能列出模型即已登录）。
 *      安装：winget install --id Google.AntigravityCLI --exact
 *      登录：在终端跑一次 `agy` 走完 OAuth（会写入 ~/.gemini/antigravity-cli/）。
 *   2. agy 继承现有的 Google 登录态，**不需要额外 API key**。
 *
 * 用法：
 *   node tools/vision.cjs <图片路径> "<问题>" [选项]
 *   node tools/vision.cjs a.png b.png "<问题>"          # 多图一起问
 *
 * 选项：
 *   --model <id>    指定模型，默认 gemini-3.8-flash-high。`agy models` 可列出全部：
 *                   gemini-3.8-flash-high / -medium / -low
 *                   claude-sonnet-4-6 / claude-opus-4-6-thinking / gpt-oss-120b-medium
 *   --effort <lvl>  推理力度 low|medium|high|xhigh|max
 *   --timeout <秒>  超时，默认 300
 *   --raw           直接打印 agy 的原始输出（排障用）
 *   --json          以 JSON 打印 {ok, model, seconds, response, denied_actions, usage}
 *
 * ⚠️ 权限：agy 无头模式无法弹权限确认框，读文件这一步会被自动拒绝。
 *   所以脚本固定带 --dangerously-skip-permissions；但保留 agy 默认的 sandbox
 *   （能读任意路径、写入仅限 /tmp），并且**只把图片所在目录**通过 --add-dir 加进 workspace。
 *
 * 🚨 沙箱铁律：本文件**必须用异步 `spawn`，不能用 `spawnSync` / `execSync`**。
 *   这个沙箱里凡是同步形式的子进程创建一律 `EBUSY`（连 `where.exe`、连 node 自己都起不来），
 *   只有异步 `spawn` 能正常拉起进程。改成同步调用会直接静默返回空输出，极难排查。
 *
 * 退出码：0 成功；1 参数/前置错误；2 agy 调用失败或被拒。
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------- 参数解析 ----------
const argv = process.argv.slice(2);
const images = [];
const opts = { model: 'gemini-3.8-flash-high', effort: '', timeout: 300, raw: false, json: false };
let question = '';

for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--model') { opts.model = argv[++i]; continue; }
  if (a === '--effort') { opts.effort = argv[++i]; continue; }
  if (a === '--timeout') { opts.timeout = Number(argv[++i]) || 300; continue; }
  if (a === '--raw') { opts.raw = true; continue; }
  if (a === '--json') { opts.json = true; continue; }
  if (a.startsWith('--')) { console.error(`未知选项 ${a}`); process.exit(1); }
  // 第一段非选项参数里，存在的文件算图片，其余算问题
  if (!question && fs.existsSync(a)) { images.push(a); continue; }
  question = question ? `${question} ${a}` : a;
}

if (!images.length) {
  console.error('用法: node tools/vision.cjs <图片路径> "<问题>" [--model id] [--effort lvl] [--timeout 秒] [--raw|--json]');
  process.exit(1);
}
if (!question) {
  console.error('缺少问题描述。例：node tools/vision.cjs shot.png "读出所有按钮上的文字"');
  process.exit(1);
}

// ---------- 定位 agy ----------
/** 只做文件存在性判断，不调用 where/which（同步子进程会被沙箱拦） */
function findAgy() {
  const cands = [
    process.env.AGY_CLI_PATH,
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'agy.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'agy', 'bin', 'agy.exe'),
    path.join(os.homedir(), '.local', 'bin', 'agy'),
  ].filter(Boolean);
  for (const c of cands) {
    if (!fs.existsSync(c)) continue;
    // WinGet\Links 下是符号链接，真身更稳（历史上有过 EBUSY，虽然主因是同步 spawn）
    try { return fs.realpathSync(c); } catch { return c; }
  }
  return null;
}

const AGY = findAgy();
if (!AGY) {
  console.error('找不到 agy。先安装 Antigravity CLI：');
  console.error('  winget install --id Google.AntigravityCLI --exact');
  process.exit(1);
}

// ---------- 组装输入 ----------
const absImages = images.map((p) => path.resolve(p));
for (const p of absImages) {
  if (!fs.statSync(p).isFile()) { console.error(`不是文件：${p}`); process.exit(1); }
}
// 把每个图片所在目录都加进 workspace
const dirs = [...new Set(absImages.map((p) => path.dirname(p)))];

const names = absImages.map((p) => path.basename(p));
const prompt = [
  question,
  '',
  '---',
  `（待读图片：${names.join('、')}，就在当前 workspace 里。请用工具读图后再回答，不要凭文件名猜测。）`,
].join('\n');

const args = [
  '-p', prompt,
  '--output-format', 'json',
  '--dangerously-skip-permissions',
  '--disable-slash-commands',
];
for (const d of dirs) args.push('--add-dir', d);
if (opts.model) args.push('--model', opts.model);
if (opts.effort) args.push('--effort', opts.effort);
if (opts.timeout) args.push('--print-timeout', `${opts.timeout}s`);

// ---------- 调用（异步 spawn，见文件头沙箱铁律） ----------
function runAgy(bin, argvList, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(bin, argvList, { cwd: os.tmpdir(), windowsHide: true });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const killTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { child.kill(); } catch { /* 忽略 */ }
      resolve({ code: -1, stdout, stderr, timedOut: true });
    }, timeoutMs);

    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(killTimer);
      resolve({ code: -2, stdout, stderr: stderr + String(e && e.message), spawnError: String(e && e.message) });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(killTimer);
      resolve({ code, stdout, stderr, timedOut: false });
    });
  });
}

(async () => {
  const started = Date.now();
  const r = await runAgy(AGY, args, (opts.timeout + 60) * 1000);

  if (opts.raw) {
    process.stdout.write(r.stdout || '');
    process.stderr.write(r.stderr || '');
    process.exit(r.spawnError ? 2 : 0);
  }

  if (r.spawnError) {
    console.error(`无法启动 agy：${r.spawnError}`);
    console.error(`（二进制：${AGY}）`);
    process.exit(2);
  }

  // agy 会在 stdout 前面吐一些非 JSON 的提示行（如 "jetski: ..."），
  // 从后往前找第一条能解析成对象的行。
  let payload = null;
  for (const line of (r.stdout || '').split(/\r?\n/).reverse()) {
    const t = line.trim();
    if (!t.startsWith('{')) continue;
    try { payload = JSON.parse(t); break; } catch { /* 继续往前找 */ }
  }

  if (!payload) {
    console.error(r.timedOut ? `agy 超时（>${opts.timeout}s）。` : 'agy 没有返回可解析的 JSON。');
    if (r.stdout) { console.error('--- stdout ---'); console.error(r.stdout.slice(0, 2000)); }
    if (r.stderr) { console.error('--- stderr ---'); console.error(r.stderr.slice(0, 2000)); }
    process.exit(2);
  }

  const ok = payload.status === 'SUCCESS' && !!(payload.response || '').trim();
  const seconds = payload.duration_seconds ?? (Date.now() - started) / 1000;

  if (opts.json) {
    console.log(JSON.stringify({
      ok,
      model: opts.model,
      seconds: Math.round(seconds * 10) / 10,
      response: (payload.response || '').trim(),
      denied_actions: payload.denied_actions || [],
      usage: payload.usage || null,
    }, null, 2));
  } else if (ok) {
    console.log((payload.response || '').trim());
  } else {
    console.error(`agy 调用未成功（status=${payload.status}）`);
    if (payload.denied_actions && payload.denied_actions.length) {
      console.error('被拒的动作：' + payload.denied_actions.map((d) => d.display_name || d.action).join(', '));
    }
  }

  if (!ok) process.exit(2);
  process.stderr.write(`[vision] ${opts.model} · ${seconds.toFixed(1)}s · ${payload.usage ? payload.usage.total_tokens : '?'} tokens\n`);
  process.exit(0);
})();

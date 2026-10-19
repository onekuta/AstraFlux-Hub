// 校准弹窗 / 触发子页 探针（纯数据，不出截图）
// 用途：验证「删除重复的『校准设置』子页、保留轴体设置里的 CalibrationModal 弹窗」这一改动
// 用法: node tools/dump-calibrate.cjs [cdpBaseUrl] [profile]
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const profile = process.argv[3] || 'es68';

const get = (p) =>
  new Promise((res, rej) => {
    http.get(p, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => res(d));
    }).on('error', rej);
  });

(async () => {
  const list = JSON.parse(await get(base + '/json'));
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      pending.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');

  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: JSON.stringify(r.exceptionDetails) };
    return r.result.value;
  };

  // ---- 0. 先回首页点选目标机型，确保弹窗用的是该机型的配列 ----
  const model = (process.argv[4] || '').toUpperCase(); // 例：ES68 / AE64-MAX
  if (model) {
    await send('Page.navigate', { url: page.url.split('?')[0] + '?view=home' });
    await new Promise((r) => setTimeout(r, 3500));
    const picked = await evalJs(`(() => {
      const cards = [...document.querySelectorAll('div,button')]
        .filter((e) => (e.innerText || '').trim().toUpperCase().startsWith(${JSON.stringify(model)}));
      // 取最内层的可点击卡片
      const target = cards[cards.length - 1];
      if (!target) return { ok: false, seen: [...document.querySelectorAll('.device-card-name')].map((e) => e.innerText.trim()) };
      target.click();
      const inner = target.querySelector('button') || target;
      inner.click();
      return { ok: true, text: (target.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 40) };
    })()`);
    console.log(`--- 首页点选机型 ${model} ---`);
    console.log('  ', picked.ok ? `✅ 已点击卡片: "${picked.text}"` : `⛔ 未找到卡片，当前可见: ${JSON.stringify(picked.seen)}`);
    await new Promise((r) => setTimeout(r, 1200));
  }

  const url = page.url.split('?')[0] + `?view=device&tab=trigger&profile=${profile}`;
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 4000));

  // ---- 1. 触发配置下的子标签应恰好 3 个，且不含「校准设置」 ----
  const subTabs = await evalJs(`(() => {
    const bar = document.querySelector('.app-content > div:nth-child(2)') || document;
    const btns = [...document.querySelectorAll('button')]
      .filter((b) => /触发设置|死区设置|轴体设置|校准设置/.test(b.innerText || ''))
      .map((b) => (b.innerText || '').replace(/\\s+/g, ' ').trim());
    const bodyHasCalibPage = /3D 机械轴体校准指派|校准设置/.test(document.body.innerText || '');
    return { subTabButtons: [...new Set(btns)], bodyHasCalibPage };
  })()`);
  console.log('--- 触发配置子标签 ---');
  console.log('  子标签按钮:', JSON.stringify(subTabs.subTabButtons));
  console.log('  页面残留「校准设置 / 3D 机械轴体校准指派」文案:', subTabs.bodyHasCalibPage ? '⛔ 仍存在' : '✅ 已清除');

  // ---- 2. 点「校准」按钮打开弹窗 ----
  const opened = await evalJs(`(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').replace(/\\s+/g,'') === '校准');
    if (!btn) return { ok: false, reason: '未找到「校准」按钮' };
    btn.click();
    return { ok: true };
  })()`);
  await new Promise((r) => setTimeout(r, 900));

  const modal = await evalJs(`(() => {
    const h2 = [...document.querySelectorAll('h2')].find((e) => /校准/.test(e.innerText || ''));
    if (!h2) return { open: false };
    const cs = getComputedStyle(h2);
    const rootBox = document.querySelector('.modal-title, h2');
    const progress = [...document.querySelectorAll('span')]
      .map((s) => (s.innerText || '').replace(/\\s+/g, ' ').trim())
      .filter((t) => /^进度:/.test(t));
    // 弹窗自己的键帽：div 且内联 width+height 都有（弹窗里 keycap 没有 keycap-* 类名）
    const modalKeycaps = [...document.querySelectorAll('div')]
      .filter((e) => e.style && e.style.width && e.style.height === '40px').length;
    // 背景键盘页的键帽（带 keycap-* 类名）
    const bgKeycaps = document.querySelectorAll(
      '.keycap-lite, .keycap-light, .keycap-lite-selected, .keycap-light-selected'
    ).length;
    // 侧栏设备卡文案（用于判断当前生效的是哪台设备）
    const deviceCard = (document.querySelector('.device-card-name') || {}).innerText || '';
    const allText = document.body.innerText || '';
    return {
      open: true,
      title: (h2.innerText || '').trim(),
      titleFamily: cs.fontFamily.slice(0, 40),
      titleIsDisplayFont: cs.fontFamily.includes('Smiley Sans'),
      progressText: progress[0] || '(未找到进度文案)',
      modalKeycaps,
      bgKeycaps,
      deviceCard: deviceCard.replace(/\\s+/g, ' ').trim(),
      hasCalibSteps: /校准注意事项|校准步骤/.test(allText),
    };
  })()`);

  console.log('');
  console.log('--- 点击「校准」按钮后 ---');
  if (!opened.ok) {
    console.log('  ⛔', opened.reason);
  } else if (!modal.open) {
    console.log('  ⛔ 弹窗未打开');
  } else {
    console.log('  ✅ 弹窗已打开');
    console.log(`  标题: "${modal.title}"   命中标题体(得意黑): ${modal.titleIsDisplayFont ? '✅' : '⛔'}`);
    console.log(`  标题 font-family: ${modal.titleFamily}`);
    console.log(`  进度文案: "${modal.progressText}"`);
    console.log(`  弹窗内键帽数: ${modal.modalKeycaps}`);
    console.log(`  背景页键帽数(带 keycap-* 类): ${modal.bgKeycaps}`);
    console.log(`  侧栏设备卡: "${modal.deviceCard}"`);
    console.log(`  校准说明区块: ${modal.hasCalibSteps ? '✅ 存在' : '⛔ 缺失'}`);
    console.log('');
    const denom = (modal.progressText.match(/\/\s*(\d+)/) || [])[1];
    console.log(
      `  判定: 进度分母 ${denom} 键  ${
        String(denom) === String(modal.modalKeycaps)
          ? '与弹窗实际渲染键帽数一致 ✅'
          : '⛔ 与实际渲染键帽数不一致'
      }`
    );
  }

  ws.close();
  process.exit(0);
})().catch((e) => {
  console.error('CALIBRATE PROBE FAILED:', e.message);
  process.exit(1);
});

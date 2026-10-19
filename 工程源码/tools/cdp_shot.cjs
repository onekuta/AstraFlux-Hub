// 打包版应用验收工具：通过 CDP 连接已启动的 星闪悦动HUB.exe，抓取探针信息与截图
// 用法：node cdp_shot.cjs <debugUrl> <outPng>
const fs = require('fs');
const http = require('http');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const out = process.argv[3] || 'D:/desk/星闪悦动驱动/项目文档/界面预览/packaged-home.png';

function get(p) {
  return new Promise((res, rej) => {
    http.get(p, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d)); }).on('error', rej);
  });
}

(async () => {
  let list;
  try {
    list = JSON.parse(await get(base + '/json'));
  } catch (e) {
    console.log('CDP_UNREACHABLE ' + e.message);
    process.exit(1);
  }
  const page = list.find((t) => t.type === 'page') || list[0];
  if (!page || !page.webSocketDebuggerUrl) {
    console.log('NO_PAGE ' + JSON.stringify(list).slice(0, 400));
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m); };
  await new Promise((r) => { ws.onopen = r; });

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise((r) => setTimeout(r, 2500));

  const probe = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      title: document.title,
      navItems: document.querySelectorAll('.nav-item').length,
      hasSidebar: !!document.querySelector('.sidebar'),
      keySizeVar: getComputedStyle(document.documentElement).getPropertyValue('--key-size').trim(),
      theme: document.documentElement.getAttribute('data-theme'),
      textHead: document.body.innerText.replace(/\\s+/g,' ').slice(0, 260)
    })`,
    returnByValue: true,
  });
  console.log('PROBES ' + (probe.result && probe.result.result && probe.result.result.value));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('SAVED ' + out + ' bytes=' + fs.statSync(out).size);
  ws.close();
  process.exit(0);
})();

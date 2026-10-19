async function crop() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id).resolve(msg.result);
      callbacks.delete(msg.id);
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    callbacks.set(curId, { resolve });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await new Promise(r => { ws.onopen = r; });
  const clip = await send('Runtime.evaluate', {
    expression: `(() => {
      const col = document.querySelector('.col.flex.flex-col');
      const r = col.getBoundingClientRect();
      return { x: r.left - 10, y: r.top - 10, width: r.width + 20, height: r.height + 20, scale: 1 };
    })()`,
    returnByValue: true
  });
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: clip.result.value });
  require('fs').writeFileSync('C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_ap_card_zoomed.png', Buffer.from(shot.data, 'base64'));
  console.log('Cropped AP card saved!');
  ws.close();
}
crop().catch(console.error);

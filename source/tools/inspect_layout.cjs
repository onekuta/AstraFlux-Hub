async function main() {
  const targetsRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(msg.error);
      else cb.resolve(msg.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    callbacks.set(curId, { resolve, reject });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => { ws.onopen = r; });

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const track = document.querySelector('.vtravel-track');
      const card = track.closest('.bg-\\\\[var\\\\(--bg-tertiary\\\\)\\\\]') || track.parentElement.parentElement.parentElement;
      const scale35 = Array.from(document.querySelectorAll('.vtravel-major')).find(e => e.innerText.includes('3.50'));
      const bottomRow = document.querySelector('.col.flex.flex-col > div.mt-2') || document.querySelector('.col > div:last-child');
      const bottomText = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('未选按键'));
      return {
        card: card ? { top: card.getBoundingClientRect().top, bottom: card.getBoundingClientRect().bottom, height: card.getBoundingClientRect().height } : null,
        track: track ? { top: track.getBoundingClientRect().top, bottom: track.getBoundingClientRect().bottom, height: track.getBoundingClientRect().height } : null,
        scale35: scale35 ? { top: scale35.getBoundingClientRect().top, bottom: scale35.getBoundingClientRect().bottom } : null,
        bottomRow: bottomRow ? { top: bottomRow.getBoundingClientRect().top, bottom: bottomRow.getBoundingClientRect().bottom } : null,
        bottomText: bottomText ? { top: bottomText.getBoundingClientRect().top, bottom: bottomText.getBoundingClientRect().bottom } : null,
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
}

main().catch(console.error);

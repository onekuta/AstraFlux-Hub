async function testCalibratePress() {
  const wsUrlRes = await fetch('http://127.0.0.1:9333/json');
  const targets = await wsUrlRes.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  console.log('Connected to CDP');

  // 下发 calibrationStart 并检查回包
  const startRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const sdk = window.__keyboardService?.sdk;
      const start = await sdk.calibrationStart();
      return { start };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('calibrationStart:', startRes.result.value);

  await new Promise(r => setTimeout(r, 100));

  // 连续采样 3 次 Row 3 (A/S/D 所在行) 的 ADC 和 Route
  for (let i = 0; i < 3; i++) {
    const pollRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const sdk = window.__keyboardService?.sdk;
        const adc = await sdk.performanceController.getADC({ row: 3 });
        const route = await sdk.performanceController.getRoute({ row: 3 });
        const cal = await sdk.performanceController.getCalibrationStatus({ row: 3 });
        return {
          adc: adc?.data?.slice(0, 8),
          route: route?.data?.slice(0, 8),
          cal: cal?.data?.slice(0, 8)
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log(`Sample ${i}:`, pollRes.result.value);
    await new Promise(r => setTimeout(r, 50));
  }

  // 恢复退出校准
  await send('Runtime.evaluate', {
    expression: 'window.__keyboardService?.sdk?.calibrationEnd()'
  });

  ws.close();
}

testCalibratePress().catch(console.error);

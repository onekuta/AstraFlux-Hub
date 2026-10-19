async function testRealAdcRoute() {
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

  // 测试从单片机读取 row 1 到 row 5 的 ADC 和 Route
  const res = await send('Runtime.evaluate', {
    expression: `(async () => {
      const sdk = window.__keyboardService?.sdk;
      if (!sdk) return { error: 'No SDK' };
      
      const rows = [1, 2, 3, 4, 5];
      const out = {};
      for (const r of rows) {
        try {
          const adc = await sdk.performanceController.getADC({ row: r });
          const route = await sdk.performanceController.getRoute({ row: r });
          const cal = await sdk.performanceController.getCalibrationStatus({ row: r });
          out['row_' + r] = {
            adcData: adc?.data?.slice(0, 10),
            routeData: route?.data?.slice(0, 10),
            calData: cal?.data?.slice(0, 10)
          };
          await new Promise(res => setTimeout(res, 20));
        } catch (e) {
          out['row_' + r] = { error: e.message };
        }
      }
      return out;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Real hardware ADC & Route result:');
  console.log(JSON.stringify(res.result.value, null, 2));

  ws.close();
}

testRealAdcRoute().catch(console.error);

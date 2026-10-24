async function extractRouteComponent() {
  const cUrl = 'https://www.xsyd.top/v2-app/js/index-DZtPZg-9.js';
  const cRes = await fetch(cUrl);
  const text = await cRes.text();
  console.log('index-DZtPZg-9.js length:', text.length);

  // 1. 提取 __name:"Route"
  let rIdx = text.indexOf('__name:"Route"');
  console.log('Route component at:', rIdx);
  console.log('=== Route component ===');
  console.log(text.substring(rIdx - 50, rIdx + 4000));

  // 2. 提取 calibrationSetting 相关的组件逻辑
  let cIdx = text.indexOf('keyboardCalibrateTip');
  console.log('keyboardCalibrateTip at:', cIdx);
  if (cIdx !== -1) {
    console.log('=== keyboardCalibrateTip ===');
    console.log(text.substring(cIdx - 100, cIdx + 2000));
  }
}
extractRouteComponent().catch(console.error);

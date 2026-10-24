async function printCalibrationLogic() {
  const cUrl = 'https://www.xsyd.top/v2-app/js/index-DZtPZg-9.js';
  const cRes = await fetch(cUrl);
  const text = await cRes.text();

  console.log('=== Official Calibration and Travel Algorithms ===');
  console.log(text.substring(12800, 16000));
}
printCalibrationLogic().catch(console.error);

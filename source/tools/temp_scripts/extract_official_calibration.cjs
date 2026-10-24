const fs = require('fs');

const content = fs.readFileSync('d:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js', 'utf8');

console.log('=== 1. getADC / getRoute / Calibrate protocol ===');
console.log(content.substring(291400, 292500));

console.log('=== 2. SDK getADC / getRoute methods ===');
console.log(content.substring(452000, 452600));

console.log('=== 3. 搜索 calibration 页面组件 ===');
let cIdx = 0;
while ((cIdx = content.indexOf('GFSCalibration', cIdx)) !== -1) {
  console.log('GFSCalibration at', cIdx, ':', content.substring(Math.max(0, cIdx - 80), Math.min(content.length, cIdx + 150)).replace(/\n/g, ' '));
  cIdx += 14;
}

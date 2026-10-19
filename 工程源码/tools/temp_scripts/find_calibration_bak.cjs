const fs = require('fs');

const f = 'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js';
const content = fs.readFileSync(f, 'utf8');

const keywords = ['calibrationStart', 'getRoute', 'getCalibrationStatus', '4 mm', '3.5 mm', 'travelTest'];
for (const kw of keywords) {
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(kw, idx)) !== -1 && count < 5) {
    console.log(`[${kw}] at ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 350)).replace(/\n/g, ' '));
    console.log('-------------------------------------------');
    idx += kw.length;
    count++;
  }
}

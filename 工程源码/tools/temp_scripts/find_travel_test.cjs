const fs = require('fs');

const f = 'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js';
const content = fs.readFileSync(f, 'utf8');

let idx = 0;
while ((idx = content.indexOf('travelTest', idx)) !== -1) {
  console.log('travelTest at', idx, ':');
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 400)).replace(/\n/g, ' '));
  console.log('-------------------------------------------');
  idx += 10;
}

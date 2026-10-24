const fs = require('fs');

const f = 'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js';
const content = fs.readFileSync(f, 'utf8');

// 找原版中包含 getADC 或 getRoute 的调用位置（在 UI 组件里的调用）
let idx = 0;
while ((idx = content.indexOf('.getADC(', idx)) !== -1) {
  console.log('Call .getADC at', idx, ':');
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 300)).replace(/\n/g, ' '));
  console.log('-------------------------------------------');
  idx += 8;
}

idx = 0;
while ((idx = content.indexOf('.getRoute(', idx)) !== -1) {
  console.log('Call .getRoute at', idx, ':');
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 300)).replace(/\n/g, ' '));
  console.log('-------------------------------------------');
  idx += 10;
}

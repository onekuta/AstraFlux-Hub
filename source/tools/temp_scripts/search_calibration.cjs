const fs = require('fs');

const files = [
  'd:/desk/星闪悦动驱动/index-DZtPZg-9.js',
  'd:/desk/星闪悦动驱动/index-D-Vi6Arc.js',
  'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log(`=== File: ${f} size: ${content.length} ===`);
  
  const keywords = ['getADC', 'GFSCalibration', 'travelTest', 'calibrationSetting', 'Route', 'adcData'];
  for (const kw of keywords) {
    let idx = 0;
    let count = 0;
    while ((idx = content.indexOf(kw, idx)) !== -1 && count < 5) {
      console.log(`  [${kw}] at ${idx}: ${content.substring(Math.max(0, idx - 50), Math.min(content.length, idx + 120)).replace(/\n/g, ' ')}`);
      idx += kw.length;
      count++;
    }
  }
}

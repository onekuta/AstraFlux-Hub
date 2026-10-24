const fs = require('fs');

const files = [
  'd:/desk/星闪悦动驱动/index-DZtPZg-9.js',
  'd:/desk/星闪悦动驱动/index-D-Vi6Arc.js',
  'd:/desk/星闪悦动驱动/xsyd_web_index.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  
  const keywords = ['请打开键盘校准按钮', 'calibrationSetting', 'calibrationStart', 'getRoute', 'getCalibrationStatus'];
  for (const kw of keywords) {
    let idx = 0;
    while ((idx = content.indexOf(kw, idx)) !== -1) {
      console.log(`File ${f} - [${kw}] at ${idx}:`);
      console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 400)).replace(/\n/g, ' '));
      console.log('-------------------------------------------');
      idx += kw.length;
    }
  }
}

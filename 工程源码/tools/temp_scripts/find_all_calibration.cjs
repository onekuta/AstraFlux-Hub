const fs = require('fs');

const files = [
  'd:/desk/星闪悦动驱动/index-D-Vi6Arc.js',
  'd:/desk/星闪悦动驱动/index-DZtPZg-9.js',
  'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  console.log('Searching in:', f);
  const terms = ['行程测试', '校准设置', 'keyboardAdjusting', 'calibrationSetting', 'getRoute'];
  for (const t of terms) {
    let idx = 0;
    while ((idx = content.indexOf(t, idx)) !== -1) {
      console.log(`  Found "${t}" at ${idx} in ${f}`);
      console.log('  ' + content.substring(Math.max(0, idx - 60), Math.min(content.length, idx + 200)).replace(/\n/g, ' '));
      idx += t.length;
    }
  }
}

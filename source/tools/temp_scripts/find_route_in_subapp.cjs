const fs = require('fs');

const f = 'd:/desk/星闪悦动驱动/index-DZtPZg-9.js';
const content = fs.readFileSync(f, 'utf8');

console.log('Searching in', f, 'size:', content.length);

const terms = ['getADC', 'getRoute', 'calibrationStart', 'calibrationEnd', 'calibrate', '4 mm', 'travel'];
for (const t of terms) {
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(t, idx)) !== -1 && count < 5) {
    console.log(`[${t}] at ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 80), Math.min(content.length, idx + 250)).replace(/\n/g, ' '));
    console.log('------------------------------------------------');
    idx += t.length;
    count++;
  }
}

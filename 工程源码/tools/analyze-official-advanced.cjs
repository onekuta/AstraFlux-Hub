const fs = require('fs');
const s = fs.readFileSync('tools/v2-views.js', 'utf8');

// Find all occurrences of highKeyConfirm
let idx = 0;
while ((idx = s.indexOf('highKeyConfirm', idx)) !== -1) {
  console.log('=== highKeyConfirm at', idx, '===');
  console.log(s.slice(Math.max(0, idx - 500), idx + 1500));
  idx += 14;
}

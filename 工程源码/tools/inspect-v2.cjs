const fs = require('fs');
const s = fs.readFileSync('tools/v2-index.js', 'utf8');

// Find occurrences of setHigherKey before line 300000
let idx = 0;
while ((idx = s.indexOf('setHigherKey', idx)) !== -1) {
  if (idx < 300000) {
    console.log('=== Call before 300k at', idx, '===');
    console.log(s.slice(Math.max(0, idx - 200), idx + 800));
  }
  idx += 12;
}

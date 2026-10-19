const fs = require('fs');

const code = fs.readFileSync('tools/index-D-Vi6Arc.js', 'utf8');

const regex = /([a-zA-Z0-9_$.]+\.setHigherKey[A-Za-z0-9_]*\s*\([^)]*\))/g;
let m;
let count = 0;
while ((m = regex.exec(code)) !== null && count < 5) {
  count++;
  console.log(`\n=== Match #${count} at ${m.index} ===`);
  const start = Math.max(0, m.index - 200);
  const end = Math.min(code.length, m.index + 300);
  console.log(code.substring(start, end));
}
console.log('Total matches:', count);

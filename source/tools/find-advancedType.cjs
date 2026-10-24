const fs = require('fs');

const code = fs.readFileSync('tools/index-D-Vi6Arc.js', 'utf8');

let pos = 0;
while (true) {
  const idx = code.indexOf('advancedType', pos);
  if (idx === -1) break;
  console.log(`\n--- Match at ${idx}:`);
  const start = Math.max(0, idx - 200);
  const end = Math.min(code.length, idx + 400);
  console.log(code.substring(start, end));
  pos = idx + 12;
}

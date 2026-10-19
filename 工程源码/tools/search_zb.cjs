const fs = require('fs');

const content = fs.readFileSync('tools/official_index.js', 'utf8');
let idx = 0;
while ((idx = content.indexOf('ZB', idx)) !== -1) {
  console.log(`Found ZB at ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 300)));
  console.log('---');
  idx += 2;
}

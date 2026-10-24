const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const match = content.match(/Ol/g);
console.log(`Ol matches: ${match ? match.length : 0}`);
let idx = 0;
while ((idx = content.indexOf('Ol', idx)) !== -1) {
  console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 100)));
  console.log('---');
  idx += 2;
}

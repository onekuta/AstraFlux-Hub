const fs = require('fs');
const s = fs.readFileSync('tools/v2-index.js', 'utf8');
const r = /['"]([^'"]+\.js)['"]/g;
let m;
const set = new Set();
while ((m = r.exec(s)) !== null) {
  set.add(m[1]);
}
console.log([...set].filter(x => x.includes('/') || x.includes('.js')));

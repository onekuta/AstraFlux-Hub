const fs = require('fs');

const bundle = fs.readFileSync('tools/official_bundle.js', 'utf8');
const regex = /["']([A-Za-z0-9_\-\.\/]+\.js)["']/g;
const files = new Set();
let m;
while ((m = regex.exec(bundle)) !== null) {
  files.add(m[1]);
}
console.log('JS files mentioned:', Array.from(files));

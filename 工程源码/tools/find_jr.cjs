const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('ec=Y(Jr');
console.log(content.slice(Math.max(0, idx - 3000), idx));

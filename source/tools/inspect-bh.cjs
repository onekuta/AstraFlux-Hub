const fs = require('fs');
const s = fs.readFileSync('tools/v2-views.js', 'utf8');

console.log(s.slice(14000, 15500));

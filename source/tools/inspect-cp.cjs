const fs = require('fs');
const s = fs.readFileSync('tools/v2-views.js', 'utf8');

const target = 'class:"btn sure-btn has-data"';
const idx = s.indexOf(target);
console.log('Target found at:', idx);
console.log(s.slice(idx - 6000, idx));

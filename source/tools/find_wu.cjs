const fs = require('fs');

const content = fs.readFileSync('tools/v2-views.js', 'utf8');
const idx = content.indexOf('lighting:wu');
console.log('lighting:wu index:', idx);

// Find where wu is defined before this
const wuDef = content.lastIndexOf('wu=', idx);
console.log('wu= index:', wuDef);
console.log(content.slice(wuDef, Math.min(content.length, wuDef + 3000)));

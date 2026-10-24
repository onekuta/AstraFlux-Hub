const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');

// Find where zy is exported or defined
const endExport = text.substring(text.length - 500);
console.log('End export:', endExport);

// Look for 'zy={' or 'const zy='
let idx = 0;
while ((idx = text.indexOf('zy=', idx)) !== -1) {
  console.log('zy= at', idx, ':', text.substring(idx, idx + 200));
  idx += 3;
}

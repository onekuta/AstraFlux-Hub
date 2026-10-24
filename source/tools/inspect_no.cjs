const fs = require('fs');

const content = fs.readFileSync('tools/official_index.js', 'utf8');

// Find nO or light icons
const idx = content.indexOf('nO={');
if (idx !== -1) {
  console.log('nO found at:', idx);
  console.log(content.slice(idx, idx + 2000));
}

// Search for where ZB is referenced or mapped
let zIdx = content.indexOf('ZB');
while (zIdx !== -1) {
  console.log('ZB at:', zIdx, content.slice(Math.max(0, zIdx - 50), Math.min(content.length, zIdx + 150)));
  zIdx = content.indexOf('ZB', zIdx + 2);
}

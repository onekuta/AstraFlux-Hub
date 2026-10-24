const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

console.log(text.substring(56000, 58200));

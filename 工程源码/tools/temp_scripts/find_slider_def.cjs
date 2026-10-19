const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

const jsIdx = text.indexOf('name:"Slider"');
if (jsIdx !== -1) {
  console.log('--- Slider component ---');
  console.log(text.substring(Math.max(0, jsIdx - 100), Math.min(text.length, jsIdx + 800)));
} else {
  // 找 const js = 或者 function js
  let pos = text.indexOf('max:100,label');
  console.log(text.substring(pos - 100, pos + 200));
}

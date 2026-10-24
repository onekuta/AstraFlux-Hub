const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

const fuIdx = text.indexOf('modelValue:i(s).luminance');
console.log('--- Luminance and Speed Sliders in Template ---');
console.log(text.substring(fuIdx, fuIdx + 1500));

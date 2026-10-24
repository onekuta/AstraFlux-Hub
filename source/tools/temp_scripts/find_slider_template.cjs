const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

const fuIdx = text.indexOf('name:"DeviceConfigLightingForm"');
console.log('--- Template around DeviceConfigLightingForm ---');
console.log(text.substring(fuIdx + 1000, fuIdx + 3000));

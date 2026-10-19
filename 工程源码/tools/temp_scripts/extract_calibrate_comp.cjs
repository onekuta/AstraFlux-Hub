const fs = require('fs');

const f = 'd:/desk/星闪悦动驱动/工程源码/scratch/bak-asar/dist/assets/index-BSkSpTFX.js';
const content = fs.readFileSync(f, 'utf8');

console.log(content.substring(715000, 725000));

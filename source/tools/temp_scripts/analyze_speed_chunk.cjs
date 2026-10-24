const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

const idx = text.indexOf('handleSpeedChange');
console.log('--- handleSpeedChange definition ---');
console.log(text.substring(idx - 200, idx + 100));

// 搜索 handleSpeedChange 调用的地方
let pos = 0;
while (true) {
  const nextIdx = text.indexOf('handleSpeedChange', pos);
  if (nextIdx === -1) break;
  console.log(`--- handleSpeedChange at ${nextIdx} ---`);
  console.log(text.substring(Math.max(0, nextIdx - 150), Math.min(text.length, nextIdx + 250)));
  pos = nextIdx + 1;
}

// 搜索 updateSpeed
pos = 0;
while (true) {
  const nextIdx = text.indexOf('updateSpeed', pos);
  if (nextIdx === -1) break;
  console.log(`--- updateSpeed at ${nextIdx} ---`);
  console.log(text.substring(Math.max(0, nextIdx - 100), Math.min(text.length, nextIdx + 200)));
  pos = nextIdx + 1;
}

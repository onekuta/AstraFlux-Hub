const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

// 找 Gc 的定义，或者在 updateSpeed: b => { xo.value = Gc(b) } 附近的定义
const idx = text.indexOf('updateSpeed:b=>{xo.value=Gc(b)}');
console.log('--- around updateSpeed ---');
console.log(text.substring(idx - 300, idx + 200));

// 搜索 function Gc 或 const Gc = 或 Gc=
let pos = 0;
while (true) {
  const match = text.indexOf('Gc=', pos);
  if (match === -1) break;
  console.log(`--- Gc= at ${match} ---`);
  console.log(text.substring(Math.max(0, match - 50), Math.min(text.length, match + 200)));
  pos = match + 1;
}

// 搜索 lightingRaf
const rafIdx = text.indexOf('lightingRaf');
if (rafIdx !== -1) {
  console.log('--- lightingRaf at ' + rafIdx + ' ---');
  console.log(text.substring(Math.max(0, rafIdx - 200), Math.min(text.length, rafIdx + 500)));
}

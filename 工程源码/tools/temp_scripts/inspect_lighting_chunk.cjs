async function inspectChunk() {
  const fs = require('fs');
  const url = 'https://www.xsyd.top/v2-app/js/index-DZtPZg-9.js';
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync('tools/temp_scripts/official_lighting_chunk.js', text);
  console.log('Saved chunk, length:', text.length);

  // 找 handleSpeedChange 附近 500 个字符
  const speedIdx = text.indexOf('handleSpeedChange');
  if (speedIdx !== -1) {
    console.log('--- handleSpeedChange context ---');
    console.log(text.substring(Math.max(0, speedIdx - 300), Math.min(text.length, speedIdx + 500)));
  }

  // 找 speed 相关的 Slider 定义或 min / max
  const matches = Array.from(text.matchAll(/speed[^,;}{()]{0,100}/g)).map(m => m[0]);
  console.log('--- Speed mentions ---');
  console.log(matches.slice(0, 15));
}
inspectChunk().catch(console.error);

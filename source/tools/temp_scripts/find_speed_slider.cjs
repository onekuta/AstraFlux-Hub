const fs = require('fs');
const text = fs.readFileSync('tools/temp_scripts/official_lighting_chunk.js', 'utf8');

// 找包含 handleSpeedChange 的组件渲染部分
let pos = text.indexOf('handleSpeedChange');
while (pos !== -1) {
  const segment = text.substring(Math.max(0, pos - 500), Math.min(text.length, pos + 1000));
  console.log('=== MATCH AT ' + pos + ' ===');
  console.log(segment);
  pos = text.indexOf('handleSpeedChange', pos + 1);
}

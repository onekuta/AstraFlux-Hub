const fs = require('fs');

const bundle = fs.readFileSync('tools/official_bundle.js', 'utf8');

// 查找保存高级键的函数，搜索包含 'advancedKeysSdkMap' 或 'setHigherKey' 的前端组件逻辑
const terms = ['advancedKeysSdkMap', 'setHigherKey', 'saveHigherKey'];

for (const t of terms) {
  let pos = 0;
  console.log(`\n=================== SEARCH: ${t} ===================`);
  while (true) {
    const idx = bundle.indexOf(t, pos);
    if (idx === -1) break;
    console.log(`\n--- Match at ${idx}:`);
    const start = Math.max(0, idx - 400);
    const end = Math.min(bundle.length, idx + 600);
    console.log(bundle.substring(start, end));
    pos = idx + t.length;
  }
}

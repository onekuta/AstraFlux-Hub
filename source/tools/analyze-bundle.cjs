const fs = require('fs');

const bundle = fs.readFileSync('tools/official_bundle.js', 'utf8');

// 查找所有包含 setHigherKey 的函数或调用
const keywords = ['setHigherKeyDKS', 'setHigherKeyMPT', 'setHigherKeyMT', 'setHigherKeyTGL', 'setHigherKeyEND', 'setHigherKeyRS', 'setHigherKeySOCD'];

for (const kw of keywords) {
  let pos = 0;
  console.log(`\n=================== KEYWORD: ${kw} ===================`);
  while (true) {
    const idx = bundle.indexOf(kw, pos);
    if (idx === -1) break;
    console.log(`\n--- At offset ${idx}:`);
    const start = Math.max(0, idx - 300);
    const end = Math.min(bundle.length, idx + 400);
    console.log(bundle.substring(start, end));
    pos = idx + kw.length;
  }
}

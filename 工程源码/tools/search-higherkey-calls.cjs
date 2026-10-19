const fs = require('fs');

const code = fs.readFileSync('tools/v2_index-D-Vi6Arc.js', 'utf8');

// 搜索高级键类型定义，比如：DKS, MPT, MT, TGL, END, SOCD, RS
const terms = ['setHigherKeyDKS', 'setHigherKeyMPT', 'setHigherKeyMT', 'setHigherKeyTGL', 'setHigherKeyEND', 'setHigherKeyRS', 'setHigherKeySOCD'];

for (const t of terms) {
  let pos = 0;
  console.log(`\n=================== SEARCH: ${t} ===================`);
  while (true) {
    const idx = code.indexOf(t, pos);
    if (idx === -1) break;
    console.log(`--- Match at ${idx}:`);
    const start = Math.max(0, idx - 400);
    const end = Math.min(code.length, idx + 600);
    console.log(code.substring(start, end));
    pos = idx + t.length;
  }
}

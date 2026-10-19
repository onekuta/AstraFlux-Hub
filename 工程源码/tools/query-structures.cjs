const fs = require('fs');

const code = fs.readFileSync('tools/index-D-Vi6Arc.js', 'utf8');

// 查找 "socd", "dks", "mpt", "mt", "tgl", "end", "rs" 在 store / component 中的定义
const queries = [
  'socd:',
  'dks:',
  'mpt:',
  'mt:',
  'tgl:',
  'end:',
  'rs:'
];

for (const q of queries) {
  let pos = 0;
  console.log(`\n=================== QUERY: ${q} ===================`);
  let found = 0;
  while (found < 5) {
    const idx = code.indexOf(q, pos);
    if (idx === -1) break;
    // 过滤掉 css 或其它杂质
    const snippet = code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 350));
    console.log(`[Pos ${idx}]:`, snippet);
    pos = idx + q.length;
    found++;
  }
}

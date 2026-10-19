const fs = require('fs');
const text = fs.readFileSync('d:/desk/星闪悦动驱动/index-D-Vi6Arc.js', 'utf8');

console.log('Index file size:', text.length);

// 1. 查找包含 macro 的定义，特别是 pinia store 或者 state
const terms = ['setMacro', 'getMacro', 'useMacro', 'macroList', 'macroStore', 'macroData', 'macroMode'];
for (const term of terms) {
  let idx = 0;
  const matches = [];
  while ((idx = text.indexOf(term, idx)) !== -1) {
    matches.push(idx);
    idx += term.length;
  }
  console.log(`=== Term: "${term}" (${matches.length} occurrences) ===`);
  for (const pos of matches.slice(0, 8)) {
    console.log(`  at ${pos}:`, text.substring(Math.max(0, pos - 80), Math.min(text.length, pos + 120)).replace(/\n/g, ' '));
  }
}

const fs = require('fs');

const code = fs.readFileSync('tools/v2_index-D-Vi6Arc.js', 'utf8');

console.log('File size:', code.length);

const keywords = [
  'setHigherKey',
  'highKeyConfirm',
  'socd',
  'dks',
  'mpt',
  'tgl',
  'rs'
];

// 查找保存按钮、确认方法
const matchFunc = code.matchAll(/(setHigherKey[A-Za-z0-9_]+|onConfirm|handleConfirm|saveHigherKey|submit|confirm)[A-Za-z0-9_$\s:=,({]+/g);
const foundSet = new Set();
for (const m of matchFunc) {
  foundSet.add(m[0].slice(0, 50));
}
console.log('Matched patterns:', Array.from(foundSet).slice(0, 30));

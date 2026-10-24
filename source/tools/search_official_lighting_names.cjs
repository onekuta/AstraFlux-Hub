const fs = require('fs');

const text = fs.readFileSync('official_index_v2_dev.js', 'utf8');

// Check locales or messages
for (const kw of ['messages.lighting', '随波逐流', '呼吸', '涟漪', '常亮', '漩涡', '彩虹', '九宫格', '川流不息', '正弦', '百花', '繁星', '踏雪', '激光', '水波']) {
  let idx = 0;
  let count = 0;
  while ((idx = text.indexOf(kw, idx)) !== -1) {
    count++;
    if (count <= 3) {
      console.log(`Matched "${kw}" at ${idx}:`);
      console.log(text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 100)).replace(/\n/g, ' '));
    }
    idx += kw.length;
  }
}

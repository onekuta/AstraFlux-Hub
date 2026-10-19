const fs = require('fs');
const path = require('path');

const dir = 'tools';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

for (const f of files) {
  const full = path.join(dir, f);
  const content = fs.readFileSync(full, 'utf8');
  
  // Search for phrases
  const targets = ['清除自定义灯效', '主键盘', '装饰灯', '随波逐流', '彩虹', 'L18', 'L19'];
  for (const t of targets) {
    let idx = 0;
    while ((idx = content.indexOf(t, idx)) !== -1) {
      console.log(`[${f}] Found "${t}" at ${idx}:`);
      console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
      console.log('---');
      idx += t.length + 500; // skip ahead
    }
  }
}

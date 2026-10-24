const fs = require('fs');
const path = require('path');

const chunks = [
  'index-zF5RXdlA.js',
  'index-R0TJ5JmU.js',
  'index-CkWe4Mh7.js',
  'index-DChfwETo.js',
  'index-CioAS8JA.js',
  'index-DgDelmX2.js',
  'index-BHKKnEmz.js',
  'index-BxXeN3zP.js',
  'index-BarmaJRh.js',
  'index-C_55ydrG.js',
  'index-CfSeWtk3.js',
  'index-BUbtQxk0.js'
];

async function main() {
  const dir = path.join(__dirname, 'official_chunks');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  for (const c of chunks) {
    const url = 'https://v2-dev.xsyd.top/js/' + c;
    const savePath = path.join(dir, c);
    let text = '';
    if (fs.existsSync(savePath)) {
      text = fs.readFileSync(savePath, 'utf8');
    } else {
      console.log('Downloading', c, '...');
      const res = await fetch(url);
      text = await res.text();
      fs.writeFileSync(savePath, text, 'utf8');
    }

    // Check for lighting keywords
    for (const kw of ['lighting', 'RGB灯光设置', 'L1', 'L3', 'L6', 'L7', 'L19', '灯效模式', '上位灯光开关', '下位灯光开关']) {
      const idx = text.indexOf(kw);
      if (idx !== -1) {
        console.log(`[${c}] Matched "${kw}" at index ${idx}`);
        console.log('  snippet:', text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 120)).replace(/\n/g, ' '));
      }
    }
  }
}

main().catch(console.error);

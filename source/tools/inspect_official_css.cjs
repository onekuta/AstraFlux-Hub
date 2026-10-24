const fs = require('fs');

async function main() {
  const url = 'https://v2-dev.xsyd.top/css/index-DciySOM5.css';
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync('official_css.css', text, 'utf8');
  console.log('Downloaded official CSS, length:', text.length);

  // Search for dynamic-item
  let idx = 0;
  while ((idx = text.indexOf('dynamic-item', idx)) !== -1) {
    console.log(text.substring(Math.max(0, idx - 20), Math.min(text.length, idx + 300)));
    idx += 12;
  }
}

main().catch(console.error);

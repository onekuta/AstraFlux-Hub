const fs = require('fs');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const bundle = fs.readFileSync('tools/official_bundle.js', 'utf8');
  // 查找所有形如 /assets/*.js 的文件名
  const matches = bundle.matchAll(/\/assets\/[A-Za-z0-9_-]+\.js/g);
  const found = new Set();
  for (const m of matches) found.add(m[0]);
  console.log('Found chunks in bundle:', Array.from(found));

  for (const f of found) {
    const url = 'https://www.xsyd.top' + f;
    console.log('Fetching chunk:', url);
    try {
      const code = await get(url);
      console.log(`Downloaded ${f}: ${code.length} bytes`);
      fs.writeFileSync(`tools/${f.replace('/assets/', '')}`, code);
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
  }
}

main();

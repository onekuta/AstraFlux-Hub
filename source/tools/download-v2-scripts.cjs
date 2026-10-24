const https = require('https');
const fs = require('fs');

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
  const scripts = [
    'device-D9TWy1nQ.js',
    'index-D-Vi6Arc.js'
  ];

  for (const s of scripts) {
    const url = 'https://www.xsyd.top/v2-app/js/' + s;
    console.log('Downloading:', url);
    const content = await get(url);
    console.log(`Saved ${s}, size: ${content.length}`);
    fs.writeFileSync(`tools/v2_${s}`, content);
  }
}

main();

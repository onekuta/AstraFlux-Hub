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
  const html = fs.readFileSync('tools/v2_subapp.html', 'utf8');
  console.log(html);

  // 找所有 /v2-app/js/*.js
  const matches = html.matchAll(/\/v2-app\/js\/[A-Za-z0-9_-]+\.js/g);
  for (const m of matches) {
    const url = 'https://www.xsyd.top' + m[0];
    console.log('Downloading:', url);
    const c = await get(url);
    const fname = m[0].split('/').pop();
    fs.writeFileSync('tools/' + fname, c);
    console.log('Saved', fname, c.length);
  }
}

main();

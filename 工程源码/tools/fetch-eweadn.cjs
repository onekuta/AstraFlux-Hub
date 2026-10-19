const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  const html = await fetchUrl('https://new-hub.eweadn.cn/');
  const scripts = Array.from(html.matchAll(/<script[^>]*src="([^"]+)"/g)).map(m => m[1]);
  console.log('Scripts:', scripts);
  for (const s of scripts) {
    const fullUrl = s.startsWith('http') ? s : 'https://new-hub.eweadn.cn' + s;
    console.log('Downloading', fullUrl, '...');
    const content = await fetchUrl(fullUrl);
    fs.writeFileSync('scratch/' + s.split('/').pop(), content, 'utf8');
    console.log('Saved', s.split('/').pop(), content.length, 'bytes');
  }
})();

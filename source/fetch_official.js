const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchFile(urlPath) {
  return new Promise((resolve, reject) => {
    const url = 'https://hub.xsyd.top/' + urlPath.replace(/^\//, '');
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${res.statusCode} for ${url}`));
      }
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(buf);
      });
    }).on('error', reject);
  });
}

async function main() {
  const outDir = path.join(__dirname, 'scratch_official');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const downloaded = new Set();
  const queue = ['assets/ConnectPage-i9LJT2ta.js', 'assets/mouse-host-BQPRjkym.js'];

  while (queue.length > 0) {
    const item = queue.shift();
    if (downloaded.has(item)) continue;
    downloaded.add(item);
    console.log('Fetching', item);
    try {
      const data = await fetchFile(item);
      const filePath = path.join(outDir, path.basename(item));
      fs.writeFileSync(filePath, data);
      const text = data.toString('utf8');
      
      // Look for more assets
      const re = /assets\/[a-zA-Z0-9_\-\.]+\.js/g;
      let match;
      while ((match = re.exec(text)) !== null) {
        if (!downloaded.has(match[0])) {
          queue.push(match[0]);
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('Done downloading. Total files:', downloaded.size);
}

main();

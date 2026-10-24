const https = require('https');
const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('scratch/index-C51E5yMc.js', 'utf8');
const regex = /([a-zA-Z0-9_\-]+\.js)/g;
let m;
const files = new Set();
while ((m = regex.exec(code)) !== null) {
  const name = m[1];
  if (name.includes('-') || name.startsWith('vue') || name.startsWith('device') || name.startsWith('tdesign')) {
    files.add(name);
  }
}
console.log('Total files mentioned:', files.size, [...files]);

const outDir = path.join(__dirname, 'scratch_v2');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

async function download(f) {
  const p = path.join(outDir, f);
  if (fs.existsSync(p)) return;
  return new Promise((resolve) => {
    https.get('https://v2-dev.xsyd.top/js/' + f, res => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(p);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          console.log('Downloaded', f);
          resolve();
        });
      } else {
        console.log('HTTP', res.statusCode, f);
        resolve();
      }
    }).on('error', err => {
      console.log(err.message, f);
      resolve();
    });
  });
}

async function main() {
  for (const f of files) {
    await download(f);
  }
  console.log('Done downloading all v2 chunks');
}

main();

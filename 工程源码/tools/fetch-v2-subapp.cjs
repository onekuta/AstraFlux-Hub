const https = require('https');
const fs = require('fs');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ data, status: res.statusCode, headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  const targets = [
    'https://www.xsyd.top/v2-app/',
    'https://www.xsyd.top/v2-app/device',
    'https://www.xsyd.top/v2-app/connect',
    'https://www.xsyd.top/v2-app/index.html'
  ];

  for (const url of targets) {
    console.log('Fetching:', url);
    try {
      const res = await get(url);
      console.log(`Status: ${res.status}, Length: ${res.data.length}`);
      if (res.data.length > 0 && res.status === 200) {
        fs.writeFileSync('tools/v2_subapp.html', res.data);
        console.log('Saved to tools/v2_subapp.html');
        // Extract script tags
        const scriptMatches = res.data.matchAll(/src=["']([^"']+\.js)["']/g);
        for (const sm of scriptMatches) {
          console.log('Found script in v2-app:', sm[1]);
        }
        break;
      }
    } catch (e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

main();

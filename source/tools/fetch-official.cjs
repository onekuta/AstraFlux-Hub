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
  try {
    const html = await get('https://www.xsyd.top/connect');
    console.log('HTML fetched, length:', html.length);
    const scriptMatches = html.matchAll(/src=["'](\/[^"']+\.js|https?:\/\/[^"']+\.js)["']/g);
    const scripts = [];
    for (const m of scriptMatches) {
      let src = m[1];
      if (src.startsWith('/')) src = 'https://www.xsyd.top' + src;
      scripts.push(src);
    }
    console.log('Found scripts:', scripts);

    for (const s of scripts) {
      console.log('Fetching:', s);
      const content = await get(s);
      if (content.includes('setHigherKey') || content.includes('SOCD') || content.includes('DKS') || content.includes('higherKey')) {
        console.log(`>>> MATCH in ${s}, size: ${content.length}`);
        fs.writeFileSync('tools/official_bundle.js', content);
        break;
      }
    }
  } catch (e) {
    console.error('Failed:', e);
  }
}

main();

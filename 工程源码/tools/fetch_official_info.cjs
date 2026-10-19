const fs = require('fs');

async function main() {
  try {
    const res = await fetch('https://www.xsyd.top/v2-app');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('HTML len:', text.length);
    const scripts = text.match(/src="[^"]*"/g);
    console.log('scripts:', scripts);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

main();

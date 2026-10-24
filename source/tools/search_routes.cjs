const fs = require('fs');

async function test() {
  const url = 'https://v2-dev.xsyd.top/js/index-C51E5yMc.js';
  const res = await fetch(url);
  const text = await res.text();
  const re = /path:"([^"]*)"/g;
  let m;
  const paths = [];
  while ((m = re.exec(text)) !== null) {
    paths.push(m[1]);
  }
  console.log('Routes in v2-dev:', paths);
}
test().catch(e => console.error(e));

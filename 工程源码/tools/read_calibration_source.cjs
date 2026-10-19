const fs = require('fs');

async function main() {
  const code = await (await fetch('https://v2-dev.xsyd.top/js/index-CkWe4Mh7.js')).text();
  let idx = code.indexOf('name:"DeviceAxisMode"');
  if (idx === -1) idx = code.indexOf('V2=O(S2');
  console.log('Location:', idx);
  console.log(code.substring(idx - 1500, idx + 500));
}

main();

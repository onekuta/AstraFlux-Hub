const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = path.join(__dirname);

// Delete any garbled files
for (const f of fs.readdirSync(dir)) {
  if (f.startsWith('娴')) {
    fs.unlinkSync(path.join(dir, f));
    console.log('Removed garbled file:', f);
  }
}

const chrome = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const tasks = [
  { html: 'poster-16x9.html', out: '海报-16x9-B站与横屏视频封面.png', w: 1920, h: 1080 },
  { html: 'poster-4x3.html', out: '海报-4x3-社区与动态卡片.png', w: 1600, h: 1200 },
  { html: 'poster-3x4.html', out: '海报-3x4-小红书与竖屏推荐.png', w: 1200, h: 1600 },
  { html: 'cover-v1-performance.html', out: '视频封面-01-极客旗舰版-最舒服的星闪驱动.png', w: 1920, h: 1080 },
  { html: 'cover-v2-contrast.html', out: '视频封面-02-痛点吐槽版-别再忍受原厂答辩.png', w: 1920, h: 1080 },
  { html: 'cover-v3-esports.html', out: '视频封面-03-电竞急停版-急停拉枪快人一步.png', w: 1920, h: 1080 },
  { html: 'cover-v4-ecosystem.html', out: '视频封面-04-生态体验版-这才是国产外设该有的生态.png', w: 1920, h: 1080 },
];

for (const t of tasks) {
  const htmlPath = path.join(dir, t.html);
  const outPath = path.join(dir, t.out);
  console.log(`Rendering ${t.html} -> ${t.out} (${t.w}x${t.h})...`);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=2000',
    `--window-size=${t.w},${t.h}`,
    `--screenshot=${outPath}`,
    htmlPath
  ]);
}
console.log('All 7 images rendered successfully!');

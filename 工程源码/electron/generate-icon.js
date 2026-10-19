const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    transparent: true,
    frame: false,
    webPreferences: {
      offscreen: true
    }
  });

  const svgContent = `
<svg viewBox="0 0 188.3 132.9" width="380" height="268" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g1" gradientUnits="userSpaceOnUse" x1="219.9431" y1="92.1001" x2="236.4257" y2="28.6419" gradientTransform="matrix(0.9972 -7.421222e-02 7.421222e-02 0.9972 -58.0911 24.6046)">
      <stop offset="0" stop-color="#00003d"></stop>
      <stop offset="6.782772e-02" stop-color="#4ce2f2"></stop>
      <stop offset="0.1806" stop-color="#4bc8f0"></stop>
      <stop offset="0.3244" stop-color="#499fed"></stop>
      <stop offset="0.4832" stop-color="#4769e9"></stop>
      <stop offset="1" stop-color="#871df5"></stop>
    </linearGradient>
    <linearGradient id="g2" gradientUnits="userSpaceOnUse" x1="63.485" y1="117.631" x2="126.6685" y2="-13.6808" gradientTransform="matrix(0.9972 -7.421222e-02 7.421222e-02 0.9972 -58.0911 24.6046)">
      <stop offset="0" stop-color="#00003d"></stop>
      <stop offset="6.782772e-02" stop-color="#4ce2f2"></stop>
      <stop offset="0.1806" stop-color="#4bc8f0"></stop>
      <stop offset="0.3244" stop-color="#499fed"></stop>
      <stop offset="0.4832" stop-color="#4769e9"></stop>
      <stop offset="1" stop-color="#871df5"></stop>
    </linearGradient>
    <linearGradient id="g3" gradientUnits="userSpaceOnUse" x1="74.1674" y1="103.6784" x2="204.214" y2="13.9912" gradientTransform="matrix(0.9972 -7.421222e-02 7.421222e-02 0.9972 -58.0911 24.6046)">
      <stop offset="0" stop-color="#efb0ff"></stop>
      <stop offset="0.4749" stop-color="#f50ff5"></stop>
      <stop offset="0.5377" stop-color="#f518f6"></stop>
      <stop offset="0.6422" stop-color="#f432f7"></stop>
      <stop offset="0.7755" stop-color="#f25bfa"></stop>
      <stop offset="0.9308" stop-color="#f094fd"></stop>
      <stop offset="1" stop-color="#efb0ff"></stop>
    </linearGradient>
    <linearGradient id="g17" gradientUnits="userSpaceOnUse" x1="80.7515" y1="10.1445" x2="149.9086" y2="83.3054">
      <stop offset="0" stop-color="#00003d"></stop>
      <stop offset="6.782772e-02" stop-color="#4ce2f2"></stop>
      <stop offset="0.1806" stop-color="#4bc8f0"></stop>
      <stop offset="0.3244" stop-color="#499fed"></stop>
      <stop offset="0.4832" stop-color="#4769e9"></stop>
      <stop offset="1" stop-color="#871df5"></stop>
    </linearGradient>
    <linearGradient id="g25" gradientUnits="userSpaceOnUse" x1="90.3317" y1="12.3712" x2="162.3335" y2="88.5415">
      <stop offset="0" stop-color="#00003d"></stop>
      <stop offset="6.782772e-02" stop-color="#4ce2f2"></stop>
      <stop offset="0.1806" stop-color="#4bc8f0"></stop>
      <stop offset="0.3244" stop-color="#499fed"></stop>
      <stop offset="0.4832" stop-color="#4769e9"></stop>
      <stop offset="1" stop-color="#871df5"></stop>
    </linearGradient>
  </defs>
  <g>
    <path d="M177.3,68.6l0.1,0l-0.8,2.7c0,0,0,0.1,0,0.1c-0.4,1.3-0.8,2.6-1.3,3.8c-0.2,0.4-0.4,0.8-0.6,1.2c-0.4,0.8-0.8,1.7-1.2,2.5c-0.2,0.5-0.5,0.9-0.8,1.4c-0.4,0.7-0.9,1.5-1.4,2.2c-0.3,0.5-0.6,0.9-1,1.4c-0.5,0.7-1,1.3-1.6,2c-0.4,0.4-0.7,0.9-1.1,1.3c-0.6,0.6-1.2,1.3-1.8,1.9c-0.4,0.4-0.8,0.8-1.2,1.2c-0.7,0.7-1.5,1.3-2.2,1.9c-0.4,0.3-0.8,0.6-1.2,0.9c-1.1,0.9-2.3,1.7-3.6,2.5c-0.1,0-0.1,0.1-0.2,0.1c2.4,0.3,4.8,0.4,7.3,0.3c15.8-1.2,23.2-15.2,23.4-27.8c0.1-5-1.9-12.2-5.1-18.8c-2.4-4.9-7.8-14.2-17.1-20c1.5,1.6,2.9,3.4,4.2,5.3l0.6,0.7l-0.1-0.1C176.6,44.2,179.9,56.4,177.3,68.6z" fill="url(#g1)"></path>
    <path d="M64.2,19.4l4-2.8c1.2-0.7,2.4-1.4,3.6-2c0.4-0.2,0.7-0.3,1.1-0.5c0.9-0.4,1.7-0.8,2.6-1.1c0.4-0.2,0.8-0.3,1.2-0.4c0.9-0.3,1.7-0.5,2.6-0.8c0.4-0.1,0.8-0.2,1.2-0.3c1-0.2,2-0.4,3-0.5c0.3,0,0.5-0.1,0.8-0.1c1.3-0.1,2.6-0.2,3.9-0.2c0.2,0,0.4,0,0.6,0c1.1,0,2.2,0.1,3.3,0.2c0.4,0,0.9,0.1,1.3,0.2c0.5,0.1,1.1,0.1,1.6,0.2C87.3,3.5,80.7,0,73.9,0c-0.5,0-1,0-1.5,0.1C36.5,2.7-1.3,73.9,0,110.3c0.3,8.5,2.6,14.7,6.8,18.5c3.5,3.1,8.4,4.5,14.5,4c3-0.2,6-1,9.2-2.4c-0.4-0.2-0.8-0.4-1.2-0.7c0,0-0.1,0-0.1-0.1c-0.5-0.3-0.9-0.6-1.3-1c0,0-0.1-0.1-0.1-0.1c0,0-0.1-0.1-0.1-0.1c-0.2-0.2-0.4-0.5-0.6-0.7c-0.2-0.3-0.5-0.5-0.7-0.8c-0.2-0.3-0.5-0.7-0.7-1c-0.2-0.3-0.4-0.6-0.6-1c-0.2-0.4-0.4-0.8-0.6-1.2c-0.2-0.4-0.4-0.8-0.5-1.2c-0.2-0.4-0.3-0.9-0.4-1.3c-0.1-0.5-0.3-0.9-0.4-1.4c-0.1-0.5-0.2-1-0.3-1.4c-0.1-0.5-0.2-1-0.3-1.5c-0.1-0.5-0.2-1.1-0.2-1.7c-0.1-0.5-0.2-1-0.2-1.5c-0.1-0.7-0.1-1.5-0.1-2.2c0-0.4-0.1-0.9-0.1-1.3c0-1.2,0-2.5,0-3.8c0,0,0,0,0,0c0,0,0,0,0,0l0-1l0,0c0.9-19,9.9-48.8,32.7-76.5C57.7,25.2,60.9,22,64.2,19.4z" fill="url(#g2)"></path>
    <path d="M116.2,34.5c-4.6,2.7-9.4,5.8-14.7,9.6c-12.7,9.3-25.1,20.7-37.1,31.6c-13.9,12.7-27.1,24.7-38.9,31.8c0,0.4,0,0.9,0,1.3c0,0.5,0,1,0,1.5c0,0.5,0.1,1.1,0.1,1.6c0,0.5,0.1,1,0.1,1.5c0,0.5,0.1,0.9,0.2,1.4c0.1,0.5,0.1,1,0.2,1.4c0.1,0.4,0.2,0.8,0.2,1.2c0.1,0.5,0.2,0.9,0.3,1.4c0.1,0.4,0.2,0.7,0.3,1c0.2,0.7,0.4,1.3,0.7,1.9c0.2,0.4,0.4,0.9,0.6,1.3c0.1,0.2,0.3,0.4,0.4,0.6c0.2,0.4,0.4,0.7,0.6,1c0.1,0.2,0.3,0.4,0.5,0.5c0.2,0.3,0.5,0.6,0.7,0.8c0.2,0.1,0.3,0.3,0.5,0.4c0.2,0.2,0.5,0.4,0.7,0.5c0.2,0.1,0.3,0.2,0.5,0.3c0.3,0.1,0.5,0.3,0.8,0.4c0.2,0.1,0.4,0.1,0.6,0.1c0.3,0.1,0.6,0.1,0.9,0.1c0.2,0,0.5,0,0.7,0c0.3,0,0.6,0,0.9,0c15.2-9.1,31.5-28.9,47.3-48.2c7.6-9.3,15.4-18.8,23.1-27.2c2.3-2.5,4.6-4.9,6.8-7c2.3-2.3,4.6-4.4,6.8-6.3c9.3-8.2,19.7-13.1,29.2-13.8c1.4-0.1,2.7-0.1,4,0c-1.2-0.4-2.4-0.7-3.5-0.8c-1.3-0.1-2.7,0-4,0.1C136.5,25,126.9,28.3,116.2,34.5z" fill="url(#g3)"></path>
    <path d="M97,34.9c4.1-2.9,7.9-5.4,11.6-7.6c-3-3.9-6-7.6-8.9-11c-1.2-0.4-2.3-0.7-3.5-1c-0.2,0-0.4-0.1-0.6-0.1c-1-0.2-2-0.4-3.1-0.5c-0.4-0.1-0.8-0.1-1.2-0.1c-0.8-0.1-1.6-0.1-2.4-0.2c-0.4,0-0.9,0-1.3,0c-0.8,0-1.5,0.1-2.3,0.1c-0.4,0-0.8,0.1-1.2,0.1c-0.8,0.1-1.7,0.3-2.5,0.4c-0.3,0.1-0.6,0.1-0.9,0.2c-1.1,0.3-2.3,0.6-3.4,1c-0.2,0.1-0.5,0.2-0.7,0.3c-0.7,0.3-1.4,0.6-2.1,0.9C84.2,20.2,91.4,27.8,97,34.9z" fill="url(#g17)"></path>
    <path d="M125.9,48.6c-1.1,1-2.1,2-3.2,3.1c-2.1,2.1-4.3,4.4-6.7,6.9c-0.5,0.6-1.1,1.2-1.6,1.8c10,15,21.2,29.7,37.7,34.2c0.9-0.5,1.8-1,2.7-1.5c0.3-0.2,0.6-0.3,0.8-0.5c1.2-0.8,2.4-1.6,3.5-2.4c0.3-0.2,0.5-0.5,0.8-0.7c0.8-0.6,1.6-1.3,2.3-2c0.4-0.3,0.7-0.7,1.1-1.1c0.6-0.6,1.2-1.2,1.7-1.8c0.4-0.4,0.7-0.8,1.1-1.3c0.5-0.6,1-1.2,1.4-1.8c0.3-0.5,0.6-0.9,0.9-1.4c0.4-0.6,0.8-1.2,1.2-1.9c0.3-0.5,0.5-1,0.8-1.5c0.3-0.6,0.6-1.3,0.9-2c0.2-0.5,0.4-1,0.6-1.5c0.1-0.2,0.2-0.5,0.2-0.7C151.4,73.4,136.6,60.5,125.9,48.6z" fill="url(#g25)"></path>
  </g>
</svg>
`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      width: 512px;
      height: 512px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .squircle-card {
      width: 512px;
      height: 512px;
      /* 圆角曲率 120px，完美圆角质感，对齐 macOS / Win11 原生应用卡片 */
      border-radius: 120px;
      background: #0b0f19;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.05);
    }
    .emblem {
      display: flex;
      align-items: center;
      justify-content: center;
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="squircle-card">
    <div class="emblem">
      ${svgContent}
    </div>
  </div>
</body>
</html>`;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  
  setTimeout(async () => {
    const image = await win.webContents.capturePage();
    const pngBuffer = image.toPNG();
    
    fs.writeFileSync(path.join(__dirname, 'icon.png'), pngBuffer);
    fs.writeFileSync(path.join(__dirname, '../public/icon.png'), pngBuffer);
    console.log('Successfully generated rounded squircle icon.png (512x512)!');
    app.quit();
  }, 500);
});

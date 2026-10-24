const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const ARTIFACT_DIR = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335';

app.whenReady().then(async () => {
  const win = new BrowserWindow({ 
    show: false, 
    width: 1380, 
    height: 880,
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false,
    }
  });

  const homeLightURL = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + `?view=home&theme=light`;
  await win.loadURL(homeLightURL);
  await new Promise(r => setTimeout(r, 1200));

  // 注入模拟江湾 AE64-MAX 设备并点击检索
  await win.webContents.executeJavaScript(`
    (() => {
      const dev = {
        vendorId: 0x1ca6,
        productId: 0x300d,
        productName: 'AE64-MAX',
        opened: true,
        collections: [{ usagePage: 0xff00, usage: 1 }],
        open: async () => {},
        close: async () => {},
        sendReport: async () => {},
        receiveFeatureReport: async () => new Uint8Array(64),
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      if (!navigator.hid) navigator.hid = {};
      navigator.hid.getDevices = async () => [dev];
      
      const refreshBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('检索连接设备'));
      if (refreshBtn) refreshBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  // 字体数据探针
  const fontProbeResults = await win.webContents.executeJavaScript(`
    (() => {
      const probe = (family, text, size) => {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = size + 'px ' + family;
        return Math.round(ctx.measureText(text).width * 100) / 100;
      };

      const cs = getComputedStyle(document.documentElement);
      const fontTitleVar = cs.getPropertyValue('--font-title').trim();

      const h1El = document.querySelector('h1');
      const h1Family = h1El ? getComputedStyle(h1El).fontFamily : 'null';
      const h1Text = h1El ? h1El.innerText.replace(/\\s+/g, ' ').trim() : '';

      const cardModelEl = document.querySelector('.device-card-name') || document.querySelector('h3');
      const cardModelFamily = cardModelEl ? getComputedStyle(cardModelEl).fontFamily : 'null';
      const cardModelText = cardModelEl ? cardModelEl.innerText.replace(/\\s+/g, ' ').trim() : '';

      const titlebarBrandEl = document.querySelector('.text-brand-gradient');
      const titlebarBrandFamily = titlebarBrandEl ? getComputedStyle(titlebarBrandEl).fontFamily : 'null';

      return {
        fontTitleVar,
        measurements: {
          pmzd_width: probe('"PangMenZhengDao"', '星闪悦动', 40),
          sans_width: probe('sans-serif', '星闪悦动', 40),
          noto_width: probe('"Noto Sans SC"', '星闪悦动', 40),
          ae64_pmzd_width: probe('"PangMenZhengDao"', 'AE64-MAX', 20),
          ae64_fallback_width: probe('sans-serif', 'AE64-MAX', 20),
        },
        elements: {
          h1: { text: h1Text, family: h1Family, isPangMen: h1Family.includes('PangMenZhengDao') },
          cardModel: { text: cardModelText, family: cardModelFamily, isPangMen: cardModelFamily.includes('PangMenZhengDao') },
          brand: { family: titlebarBrandFamily, isPangMen: titlebarBrandFamily.includes('PangMenZhengDao') }
        }
      };
    })()
  `);

  console.log('=== 首页带卡片字体探针数据 ===');
  console.log(JSON.stringify(fontProbeResults, null, 2));

  // 截取与用户参考图 1:1 对比的首页截图
  const imgHomeWithCardLight = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_home_ae64_card_light.png'), imgHomeWithCardLight.toPNG());
  console.log('Saved verified_home_ae64_card_light.png');

  // 深色模式下也截一张
  await win.webContents.executeJavaScript(`
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  `);
  await new Promise(r => setTimeout(r, 600));

  const imgHomeWithCardDark = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_home_ae64_card_dark.png'), imgHomeWithCardDark.toPNG());
  console.log('Saved verified_home_ae64_card_dark.png');

  // 点击进入驱动查看驱动界面内部的标题与侧栏
  await win.webContents.executeJavaScript(`
    (() => {
      const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('进入驱动'));
      if (enterBtn) enterBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const imgDeviceInside = await win.webContents.capturePage();
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_device_inside_dark.png'), imgDeviceInside.toPNG());
  console.log('Saved verified_device_inside_dark.png');

  app.quit();
});

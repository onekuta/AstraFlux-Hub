const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = path.join(process.env.TEMP, 'app_asar_unpack_' + Date.now());
const targetAsar = path.resolve('d:/desk/星闪悦动驱动/软件本体/resources/app.asar');
const srcDist = path.resolve(__dirname, 'dist');
const srcElectron = path.resolve(__dirname, 'electron');

try {
  console.log('正在解包:', targetAsar);
  execSync(`npx asar extract "${targetAsar}" "${tempDir}"`, { stdio: 'inherit' });

  console.log('正在清理旧 dist 并复制最新 dist...');
  if (fs.existsSync(path.join(tempDir, 'dist'))) {
    fs.rmSync(path.join(tempDir, 'dist'), { recursive: true, force: true });
  }
  fs.cpSync(srcDist, path.join(tempDir, 'dist'), { recursive: true });

  console.log('正在复制最新 electron/main.js 与 preload.js...');
  fs.cpSync(srcElectron, path.join(tempDir, 'electron'), { recursive: true });

  console.log('正在打包回 asar...');
  execSync(`npx asar pack "${tempDir}" "${targetAsar}"`, { stdio: 'inherit' });

  console.log('app.asar 成功更新完成！');
} catch (err) {
  console.error('更新 asar 失败:', err);
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}
}

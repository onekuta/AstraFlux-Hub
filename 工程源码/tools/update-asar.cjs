const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

const targetAsar = path.resolve(__dirname, '../../软件本体/resources/app.asar');
const distDir = path.resolve(__dirname, '../dist');

console.log('[1/4] 检查文件...');
if (!fs.existsSync(targetAsar)) {
  console.error('目标 app.asar 不存在:', targetAsar);
  process.exit(1);
}
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist 目录不存在或缺少 index.html，请先运行 npm run build');
  process.exit(1);
}

const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'sparklink-asar-'));
const extractedDir = path.join(tmpBase, 'extracted');
const newAsar = path.join(tmpBase, 'app.asar');

try {
  console.log('[2/4] 解包现有 app.asar 到临时目录...');
  execSync(`npx asar extract "${targetAsar}" "${extractedDir}"`, { stdio: 'inherit' });

  console.log('[3/4] 同步最新 dist 产物与 electron 脚本到解包目录...');
  const targetDist = path.join(extractedDir, 'dist');
  fs.rmSync(targetDist, { recursive: true, force: true });
  fs.cpSync(distDir, targetDist, { recursive: true });

  const electronSrc = path.resolve(__dirname, '../electron');
  const targetElectron = path.join(extractedDir, 'electron');
  if (fs.existsSync(electronSrc)) {
    fs.cpSync(electronSrc, targetElectron, { recursive: true, force: true });
  }

  console.log('重新打包为新 app.asar...');
  execSync(`npx asar pack "${extractedDir}" "${newAsar}"`, { stdio: 'inherit' });

  console.log('[4/4] 原地更新目标 app.asar (r+ 句柄流写入)...');
  const newBuf = fs.readFileSync(newAsar);
  const fd = fs.openSync(targetAsar, 'r+');
  fs.writeSync(fd, newBuf, 0, newBuf.length, 0);
  fs.ftruncateSync(fd, newBuf.length);
  fs.closeSync(fd);

  const hash = crypto.createHash('md5').update(newBuf).digest('hex');
  console.log(`✅ 成功更新 app.asar!`);
  console.log(`文件大小: ${newBuf.length} 字节`);
  console.log(`MD5: ${hash}`);
} finally {
  try {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  } catch (e) {
    // ignore tmp cleanup error
  }
}

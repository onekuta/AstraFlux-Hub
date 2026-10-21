/**
 * AstraFlux-HUB - 版本发布打包工具 (Setup 安装包与绿色便携版一键生成)
 * 
 * 规范：
 * 1. 自动从 package.json 获取当前版本号 (如 1.1.0)；
 * 2. 在根目录创建独立版本目录：安装包_V<Version>/ (如 安装包_V1.1.0/)；
 * 3. 规避 Electron 运行时文件锁占用，安全收集 软件本体/ 全量运行时；
 * 4. 生成 AstraFlux-HUB_v<Version>_Portable.zip 便携绿色包；
 * 5. 调用原生 csc.exe 编译生成独立 GUI 安装器 AstraFlux-HUB_Setup_v<Version>.exe；
 * 6. 生成 SHA256SUMS.txt 完整性校验文件；
 * 7. 严守用户确认门禁：打包后提示开发者验收，确认无误后方可推送远端！
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const JSZip = require('jszip');

const ROOT_DIR = path.resolve(__dirname, '../..');
const PKG_PATH = path.resolve(__dirname, '../package.json');
const APP_DIR = path.resolve(ROOT_DIR, '软件本体');
const ICON_PATH = path.resolve(__dirname, '../electron/icon.ico');
const CSC_PATH = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';

async function main() {
  console.log('========================================================');
  console.log('        AstraFlux-HUB 官方版本发布与安装包构建流水线       ');
  console.log('========================================================\n');

  // 1. 读取版本号
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf-8'));
  const version = pkg.version || '1.1.0';
  console.log(`[1/5] 当前发布目标版本号: V${version}`);

  const releaseDirName = `安装包_V${version}`;
  const releaseDirPath = path.join(ROOT_DIR, releaseDirName);
  if (!fs.existsSync(releaseDirPath)) {
    fs.mkdirSync(releaseDirPath, { recursive: true });
    console.log(`      ✓ 已在根目录下创建新发布文件夹: ${releaseDirName}`);
  } else {
    console.log(`      ✓ 目标发布文件夹已存在: ${releaseDirName}`);
  }

  // 2. 收集 软件本体 目录文件到临时目录 (防止正在运行的程序排他锁)
  const tempStageDir = path.join(process.env.TEMP, `astraflux_pack_${Date.now()}`);
  fs.mkdirSync(tempStageDir, { recursive: true });

  console.log(`[2/5] 正在规避文件锁安全镜像「软件本体/」运行时文件...`);
  
  function copyDirSafe(src, dst) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);
      if (entry.isDirectory()) {
        copyDirSafe(srcPath, dstPath);
      } else {
        try {
          fs.copyFileSync(srcPath, dstPath);
        } catch (e) {
          // 如果某文件复制失败，尝试只读流复制
          try {
            const buf = fs.readFileSync(srcPath);
            fs.writeFileSync(dstPath, buf);
          } catch (err2) {
            console.warn(`      ⚠️ 警告: 读取文件 ${entry.name} 受限: ${err2.message}`);
          }
        }
      }
    }
  }

  copyDirSafe(APP_DIR, tempStageDir);
  console.log(`      ✓ 文件镜像准备完毕`);

  // 3. 构建 Portable Zip 包
  console.log(`[3/5] 正在打包 AstraFlux-HUB_v${version}_Portable.zip ...`);
  const zip = new JSZip();

  function addDirToZip(zipObj, dirPath, rootPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        addDirToZip(zipObj, fullPath, rootPath);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zipObj.file(relPath, fileData, { compression: 'DEFLATE', compressionOptions: { level: 6 } });
      }
    }
  }

  addDirToZip(zip, tempStageDir, tempStageDir);
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  const portableZipPath = path.join(releaseDirPath, `AstraFlux-HUB_v${version}_Portable.zip`);
  fs.writeFileSync(portableZipPath, zipBuffer);
  const portableSizeMb = (zipBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`      ✓ 便携绿色包已生成: ${path.basename(portableZipPath)} (${portableSizeMb} MB)`);

  // 4. 编译独立图形安装器 Setup.exe
  console.log(`[4/5] 正在通过 .NET 原生编译器生成独立安装向导 Setup.exe ...`);
  const setupExePath = path.join(releaseDirPath, `AstraFlux-HUB_Setup_v${version}.exe`);
  const templateSource = path.join(__dirname, 'InstallerTemplate.cs');
  
  // 将 zip 文件暂存作为内嵌资源
  const tempPayloadZip = path.join(tempStageDir, 'payload.zip');
  fs.writeFileSync(tempPayloadZip, zipBuffer);

  // 动态替换安装器版本号
  let csCode = fs.readFileSync(templateSource, 'utf-8');
  csCode = csCode.replace(/V1\.1\.0/g, `V${version}`).replace(/"1\.1\.0"/g, `"${version}"`);
  const tempCsPath = path.join(tempStageDir, 'Installer.cs');
  fs.writeFileSync(tempCsPath, csCode, 'utf-8');

  let cscCmd = `"${CSC_PATH}" /nologo /target:winexe /optimize+ /platform:anycpu ` +
    `/reference:System.dll,System.Core.dll,System.Drawing.dll,System.Windows.Forms.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll,Microsoft.CSharp.dll ` +
    `/resource:"${tempPayloadZip}",payload.zip ` +
    `/out:"${setupExePath}" "${tempCsPath}"`;

  if (fs.existsSync(ICON_PATH)) {
    cscCmd += ` /win32icon:"${ICON_PATH}"`;
  }

  try {
    execSync(cscCmd, { stdio: 'pipe' });
    const setupSizeMb = (fs.statSync(setupExePath).size / (1024 * 1024)).toFixed(2);
    console.log(`      ✓ 独立安装程序已生成: ${path.basename(setupExePath)} (${setupSizeMb} MB)`);
  } catch (cscErr) {
    console.error('      ❌ 编译安装向导失败:', cscErr.stdout?.toString() || cscErr.message);
  }

  // 5. 生成 SHA256SUMS.txt
  console.log(`[5/5] 正在计算发布文件 SHA-256 哈希值...`);
  const filesToHash = [portableZipPath, setupExePath].filter(p => fs.existsSync(p));
  let hashLines = [];
  for (const f of filesToHash) {
    const buf = fs.readFileSync(f);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    hashLines.push(`${hash} *${path.basename(f)}`);
  }
  const sumsPath = path.join(releaseDirPath, 'SHA256SUMS.txt');
  fs.writeFileSync(sumsPath, hashLines.join('\n') + '\n', 'utf-8');
  console.log(`      ✓ 校验清单已生成: SHA256SUMS.txt\n`);

  // 清理临时文件
  try {
    fs.rmSync(tempStageDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('========================================================');
  console.log(`🎉 V${version} 版本发布包已全部封装至:`);
  console.log(`👉 ${releaseDirPath}`);
  console.log('========================================================\n');
  console.log('⚠️ 【用户确认门禁】：');
  console.log('请开发者在本地双击测试安装包并核验功能。');
  console.log('在开发者确认没问题之前，严禁直接执行 git push 或推送远端更新！\n');
}

main().catch(err => {
  console.error('[打包流程致命错误]', err);
  process.exit(1);
});

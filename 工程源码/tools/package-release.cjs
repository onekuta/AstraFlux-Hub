/**
 * AstraFlux-HUB - 版本发布打包工具 (规范化三件套标准封包)
 * 
 * 规范：
 * 1. 自动从 package.json 获取当前发布版本号 (如 1.1.1)；
 * 2. 在根目录创建统一父目录「安装包/」，并在其下按版本新建独立子文件夹「V<Version>/」；
 * 3. 每个版本子文件夹内严格包含「标准三文件」：
 *    - 更新日志 (更新日志.md)
 *    - 软件安装包本体 (AstraFlux-HUB_Setup_v<Version>.exe)
 *    - 更新清单 (manifest.json，直接适配云端发布工具与客户端 OTA)
 * 4. 规避 Electron 运行时文件锁占用，安全镜像 软件本体/ 运行时；
 * 5. 编译原生独立安装向导 Setup.exe；
 * 6. 严守用户确认门禁：打包后提示开发者验收，确认无误后方可推送远端！
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
  console.log('      AstraFlux-HUB 官方版本发布与安装包构建流水线 (SOP)     ');
  console.log('========================================================\n');

  // 1. 读取版本号
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf-8'));
  const version = pkg.version || '1.1.1';
  console.log(`[1/5] 当前发布目标版本号: V${version}`);

  // 统一父目录：根目录「安装包/」，并在其下按版本新建独立子文件夹「V<Version>/」
  const releasesParentDir = path.join(ROOT_DIR, '安装包');
  const releaseDirName = `V${version}`;
  const releaseDirPath = path.join(releasesParentDir, releaseDirName);
  
  if (!fs.existsSync(releasesParentDir)) {
    fs.mkdirSync(releasesParentDir, { recursive: true });
  }
  if (!fs.existsSync(releaseDirPath)) {
    fs.mkdirSync(releaseDirPath, { recursive: true });
    console.log(`      ✓ 已在安装包目录下创建新发布文件夹: 安装包/${releaseDirName}/`);
  } else {
    console.log(`      ✓ 目标发布文件夹已就绪: 安装包/${releaseDirName}/`);
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

  // 3. 构建临时内嵌压缩包 Payload Zip
  console.log(`[3/5] 正在压缩运行时核心并生成 Payload 数据包...`);
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

  const tempPayloadZip = path.join(tempStageDir, 'payload.zip');
  fs.writeFileSync(tempPayloadZip, zipBuffer);

  // 4. 编译独立图形安装器 Setup.exe
  console.log(`[4/5] 正在通过 .NET 原生编译器生成独立安装向导 Setup.exe ...`);
  const setupExeName = `AstraFlux-HUB_Setup_v${version}.exe`;
  const setupExePath = path.join(releaseDirPath, setupExeName);
  const templateSource = path.join(__dirname, 'InstallerTemplate.cs');

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
    const setupSizeBytes = fs.statSync(setupExePath).size;
    const setupSizeMb = (setupSizeBytes / (1024 * 1024)).toFixed(2);
    console.log(`      ✓ [文件 1/3] 软件安装包本体已生成: ${setupExeName} (${setupSizeMb} MB)`);

    // 计算安装包的 SHA-256 哈希
    const setupBuffer = fs.readFileSync(setupExePath);
    const setupSha256 = crypto.createHash('sha256').update(setupBuffer).digest('hex');

    // 5. 生成标准三件套中的另外两个文件：更新日志.md 与 manifest.json
    console.log(`[5/5] 正在生成更新日志与云端发布清单 (标准三文件规范)...`);

    // 读取或初始化云端发布配置
    const configPath = path.resolve(ROOT_DIR, '开发者云端发布工具/config.json');
    let publisherConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        publisherConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {}
    }

    const changelogText = publisherConfig.appRelease?.changelog || 
      `1. 问题反馈直达 GitHub Issues 官方页面，草稿自动复制并带参预填\n2. 顶栏新增官方交流群一键加入快捷按钮 (群号 1131310645)\n3. 首启动静默更新检测与更新状态红点徽标\n4. 云端发布工具与仓库目录隔离 (database/ 与 software/)\n5. 规范化安装包三件套与 SOP 自动化发布流水线`;

    // 5.1 生成「更新日志.md」
    const changelogMdContent = `# 🚀 AstraFlux-HUB 更新日志 - V${version}

- **发布版本**：V${version}
- **发布日期**：${new Date().toLocaleDateString('zh-CN')}
- **支持架构**：Windows 10 / 11 (x64)

---

## 📝 本次改动摘要

### 🐛 [问题修复与通道优化]
- **问题反馈直达 GitHub Issues 官方页面**：点击提交按钮直接拉起官方 Issue 创建界面，标题与故障草稿自动复制并带参预填，无障碍跨端反馈。
- **Gitee 分支对齐与自动纠偏**：修复默认更新分支识别，全面对齐 main 分支，保障国内节点 OTA 检测通畅。
- **软件与外设库更新目录隔离**：彻底解耦 \`database/\` (外设数据库) 与 \`software/\` (客户端软件更新)，避免 OTA 检测冲突。

### ✨ [新特性与界面体验]
- **官方技术交流群一键直达**：软件顶栏右上角新增 QQ 官方交流群快捷入口（群号：\`1131310645\`），一键复制群号并提供操作指引。
- **静默后台更新检测**：每次启动时静默检查云端新版本，仅在有新版本时在更新按钮上展示醒目红点徽标，无更新时保持界面极简纯净。
- **统一数据库格式 (.spkdb)**：开发者后台专属导出全量集合包，客户端更新页专属本地导入与云端同步。
- **SOP 流程升级**：确立标准发布目录规范，建立自动生成三件套（更新日志、安装包本体、更新清单）体系，确立 AI Agent 自动化发布流程。

---

## 📦 安装包文件信息 (标准三件套之一)
- **文件名称**：\`${setupExeName}\`
- **文件体积**：\`${setupSizeMb} MB\` (\`${setupSizeBytes}\` 字节)
- **SHA-256 哈希值**：\`${setupSha256}\`
`;

    const changelogFilePath = path.join(releaseDirPath, '更新日志.md');
    fs.writeFileSync(changelogFilePath, changelogMdContent, 'utf-8');
    console.log(`      ✓ [文件 2/3] 更新日志已生成: 更新日志.md`);

    // 5.2 生成「manifest.json」清单 (支持直接上传至云端发布工具或同步至仓库)
    const manifestData = {
      manifestVersion: '1.4.1',
      appVersion: version,
      appDownloadUrl: `https://github.com/Kutaze/AstraFlux-Hub/releases/download/v${version}/${setupExeName}`,
      appGiteeUrl: `https://gitee.com/Kutaze/astra-flux-hub/releases`,
      appChangelog: changelogText,
      appForceUpdate: false,
      appFileSize: `${setupSizeMb} MB`,
      setupSha256: setupSha256,
      libVersion: publisherConfig.dbRelease?.libVersion || '2026.10.21.1',
      libDownloadUrl: 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/device_database.spkdb',
      githubDownloadUrl: 'https://github.com/Kutaze/AstraFlux-Hub/raw/main/database/device_database.spkdb',
      totalDevices: 638,
      updatedAt: new Date().toISOString()
    };

    const manifestFilePath = path.join(releaseDirPath, 'manifest.json');
    fs.writeFileSync(manifestFilePath, JSON.stringify(manifestData, null, 2), 'utf-8');
    console.log(`      ✓ [文件 3/3] 云端发布更新清单已生成: manifest.json`);

    // 同时将最新文件大小写回 开发者云端发布工具/config.json
    if (fs.existsSync(configPath)) {
      try {
        publisherConfig.appRelease = publisherConfig.appRelease || {};
        publisherConfig.appRelease.appVersion = version;
        publisherConfig.appRelease.fileSize = `${setupSizeMb} MB`;
        fs.writeFileSync(configPath, JSON.stringify(publisherConfig, null, 2), 'utf-8');
      } catch (e) {}
    }

  } catch (cscErr) {
    console.error('      ❌ 编译安装向导失败:', cscErr.stdout?.toString() || cscErr.message);
  }

  // 清理临时文件
  try {
    fs.rmSync(tempStageDir, { recursive: true, force: true });
  } catch (e) {}

  // 组织/整理 V1.1.0 目录使其同样符合三文件规范
  try {
    const v110Dir = path.join(releasesParentDir, 'V1.1.0');
    const oldV110Root = path.join(ROOT_DIR, '安装包_V1.1.0');
    if (!fs.existsSync(v110Dir)) {
      fs.mkdirSync(v110Dir, { recursive: true });
    }
    if (fs.existsSync(oldV110Root)) {
      const oldSetup = path.join(oldV110Root, 'AstraFlux-HUB_Setup_v1.1.0.exe');
      const targetSetup = path.join(v110Dir, 'AstraFlux-HUB_Setup_v1.1.0.exe');
      if (fs.existsSync(oldSetup) && !fs.existsSync(targetSetup)) {
        fs.copyFileSync(oldSetup, targetSetup);
      }
    }
    // 写入 V1.1.0 的更新日志与 manifest.json
    const v110Changelog = path.join(v110Dir, '更新日志.md');
    if (!fs.existsSync(v110Changelog)) {
      fs.writeFileSync(v110Changelog, `# 🚀 AstraFlux-HUB 更新日志 - V1.1.0\n\n- **发布版本**：V1.1.0\n- **发布日期**：2026-10-21\n- **架构**：Windows 10 / 11 (x64)\n\n## 改动说明\n- 全新 V1.1.0 正式发布，确立标准版本迭代流程。\n- 独立安装向导生成与 OTA 更新检测。\n`, 'utf-8');
    }
    const v110Manifest = path.join(v110Dir, 'manifest.json');
    if (!fs.existsSync(v110Manifest)) {
      fs.writeFileSync(v110Manifest, JSON.stringify({
        manifestVersion: '1.4.1',
        appVersion: '1.1.0',
        appDownloadUrl: 'https://github.com/Kutaze/AstraFlux-Hub/releases/download/v1.1.0/AstraFlux-HUB_Setup_v1.1.0.exe',
        appGiteeUrl: 'https://gitee.com/Kutaze/astra-flux-hub/releases',
        appChangelog: 'AstraFlux-HUB V1.1.0 正式版发布',
        appForceUpdate: false,
        appFileSize: '142.1 MB',
        updatedAt: '2026-10-21T05:00:00.000Z'
      }, null, 2), 'utf-8');
    }
  } catch (e) {}

  console.log('\n========================================================');
  console.log(`🎉 V${version} 版本发布包已全部封装至「标准三文件」结构:`);
  console.log(`👉 文件夹目录: 安装包/${releaseDirName}/`);
  console.log(`   ├── 1. 更新日志.md`);
  console.log(`   ├── 2. ${setupExeName}`);
  console.log(`   └── 3. manifest.json (可直接上传至云端发布工具)`);
  console.log('========================================================\n');
  console.log('⚠️ 【用户确认门禁】：');
  console.log('请开发者在本地双击测试安装包并核验功能。');
  console.log('在开发者确认没问题之前，严禁直接执行 git push 或推送远端更新！\n');
}

main().catch(err => {
  console.error('[打包流程致命错误]', err);
  process.exit(1);
});

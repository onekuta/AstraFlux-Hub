/**
 * AstraFlux-HUB - 版本发布打包工具 (规范化三件套标准封包 - 官方 Inno Setup 引擎)
 * 
 * 规范：
 * 1. 自动从 package.json 获取当前发布版本号 (如 1.1.2)；
 * 2. 在根目录创建统一父目录「安装包/」，并在其下按版本新建独立子文件夹「V<Version>/」；
 * 3. 每个版本子文件夹内严格包含「标准三文件」：
 *    - 更新日志 (更新日志.md)
 *    - 软件安装包本体 (AstraFlux-HUB_Setup_v<Version>.exe，由 Inno Setup 官方编译器编译)
 *    - 更新清单 (manifest.json，直接适配云端发布工具与客户端 OTA)
 * 4. 采用 Inno Setup 官方编译器 (ISCC.exe) 与 LZMA2 极限压缩，体积由 144MB 骤降至 93.5MB；
 * 5. 突破平台限制，安装包可直接上传至 Gitee 官方发行版附件；
 * 6. 严守用户确认门禁：打包后提示开发者验收，确认无误后方可推送远端！
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '../..');
const PKG_PATH = path.resolve(__dirname, '../package.json');
const APP_DIR = path.resolve(ROOT_DIR, '软件本体');
const ICON_PATH = path.resolve(__dirname, '../electron/icon.ico');

const ISCC_PATHS = [
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Inno Setup 6', 'ISCC.exe'),
  'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe',
  'C:\\Program Files\\Inno Setup 6\\ISCC.exe'
];

async function main() {
  console.log('========================================================');
  console.log('    AstraFlux-HUB 官方版本发布与 Inno Setup 封包流水线 (SOP)   ');
  console.log('========================================================\n');

  // 1. 读取版本号与渠道参数
  const isBeta = process.argv.includes('--beta');
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf-8'));
  
  let version;
  let categoryDir;
  let releaseDirName;
  let setupExeName;

  if (isBeta) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    version = `beta0.${yy}.${mm}.${dd}`;
    categoryDir = 'beta';
    releaseDirName = version;
    setupExeName = `AstraFlux-HUB_Setup_${version}.exe`;
    console.log(`[1/4] 当前发布目标为【Beta 测试版】: ${version}`);
  } else {
    version = pkg.version || '1.1.2';
    categoryDir = 'release';
    releaseDirName = `V${version}`;
    setupExeName = `AstraFlux-HUB_Setup_v${version}.exe`;
    console.log(`[1/4] 当前发布目标为【正式稳定版】: V${version}`);
  }

  // 统一父目录：根目录「installers/」，分类「release/」与「beta/」
  const releasesParentDir = path.join(ROOT_DIR, 'installers', categoryDir);
  const releaseDirPath = path.join(releasesParentDir, releaseDirName);
  
  if (!fs.existsSync(releasesParentDir)) {
    fs.mkdirSync(releasesParentDir, { recursive: true });
  }
  if (!fs.existsSync(releaseDirPath)) {
    fs.mkdirSync(releaseDirPath, { recursive: true });
    console.log(`      ✓ 已创建新发布文件夹: installers/${categoryDir}/${releaseDirName}/`);
  } else {
    console.log(`      ✓ 目标发布文件夹已就绪: installers/${categoryDir}/${releaseDirName}/`);
  }

  // 2. 检查并定位 Inno Setup 编译器
  console.log(`[2/4] 正在检测 Inno Setup 官方编译器环境...`);
  const isccBin = ISCC_PATHS.find(p => fs.existsSync(p));
  if (!isccBin) {
    throw new Error('未检测到 Inno Setup 6 编译器 (ISCC.exe)！请先运行: winget install --id JRSoftware.InnoSetup -e');
  }
  console.log(`      ✓ 成功载入官方 Inno Setup 编译器: ${isccBin}`);

  // 3. 调用 Inno Setup 编译生成官方向导安装包 Setup.exe
  console.log(`[3/4] 正在调用 Inno Setup 编译主流向导式安装包 (LZMA2 压缩)...`);
  const setupExePath = path.join(releaseDirPath, setupExeName);
  const issScriptPath = path.join(__dirname, 'installer.iss');

  if (!fs.existsSync(issScriptPath)) {
    throw new Error(`未能定位 Inno Setup 脚本: ${issScriptPath}`);
  }

  const baseFileName = path.parse(setupExeName).name;
  const isccCmd = `"${isccBin}" /DMyAppVersion=${version} /O"${releaseDirPath}" /F"${baseFileName}" "${issScriptPath}"`;
  execSync(isccCmd, { stdio: 'inherit' });

  if (!fs.existsSync(setupExePath)) {
    throw new Error(`Inno Setup 编译完成但未能生成目标文件: ${setupExePath}`);
  }

  const setupSizeBytes = fs.statSync(setupExePath).size;
  const setupSizeMb = (setupSizeBytes / (1024 * 1024)).toFixed(2);
  console.log(`      ✓ [文件 1/3] Inno Setup 官方安装向导已生成: ${setupExeName} (${setupSizeMb} MB)`);

  // 计算安装包的 SHA-256 哈希
  const setupBuffer = fs.readFileSync(setupExePath);
  const setupSha256 = crypto.createHash('sha256').update(setupBuffer).digest('hex');

  // 4. 生成标准三件套中的另外两个文件：更新日志.md 与 manifest.json
  console.log(`[4/4] 正在生成更新日志与云端发布清单 (标准三文件规范)...`);

  // 读取或初始化云端发布配置
  const configPath = path.resolve(ROOT_DIR, '开发者云端发布工具/config.json');
  let publisherConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      publisherConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {}
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const timeCode = `${yy}.${mm}.${dd}`;
  const buildDateStr = `${now.getFullYear()}-${mm}-${dd}`;

  const defaultReleaseChangelog = 
    `1. 数据库更新后自动执行二次全量扫描，无需重启即刻消除首页“更新可用”提示与小红点\n2. 全面绑定标准版本构建时间码 (${timeCode})，建立防止从新版正式版倒退安装旧 Beta 版本的安全门禁\n3. 全软件多语言国际化支持（简体中文、English、日本語），实时动态切换无须重启\n4. 全新高颜值自定义下拉框（CustomSelect），修复设置页右上角标签折行与界面细节\n5. 数据库更新卡片动态展示云端更新日志说明 (libChangelog)\n6. 官方原生 Inno Setup 6 现代安装向导，LZMA2 深度压缩至 93.5MB`;

  const betaChangelogSummary = 
    `【Beta ${version.replace(/^beta/i, '')} 抢先体验版】\n` +
    `1. 轴体库校验机制与硬件 PCB 专属库存隔离：接入官方 SDK getAxisList 探针，严格限制江湾 PCB 专属 75 款认证轴体与 DV63 专属出厂轴体，杜绝杂牌未支持轴体混入\n` +
    `2. 消除轴体切换时序死区白屏 BUG：根治在轴体库配置后跨页面跳转偶发的 ReferenceError 异常拦截\n` +
    `3. 混轴设置完美支持：修复此前全键强制统一修改问题，现已支持单颗按键 / 局部框选多键独立配置不同轴体\n` +
    `4. 校准视窗 UI 架构重构：解决校准说明展开/折叠时底部按键与 ADC 采样子窗口挤压拉伸变形，移除左上角多余轴体设置入口，补齐未校准智能提示\n` +
    `5. GitHub 官方仓库定位全面恢复：修复跳转链接与国内高速加速下载镜像\n` +
    `6. 键盘型号识别与配列修复：修复 AE61 Pro 等 61 键键盘在驱动中被误识别为 68 配列的问题\n` +
    `7. 软件防崩溃与稳定性全面强化：WebHID 握手容错优化与本地存储脏数据防御保护\n` +
    `8. PCB 板载轴体独立探针系统 (DevLab)：支持穿透直读主控烧录轴体 ID 与电气寄存器参数`;

  const changelogText = isBeta ? betaChangelogSummary : (publisherConfig.appRelease?.changelog || defaultReleaseChangelog);

  // 4.1 生成「更新日志.md」
  const betaChangelogMd = `# 🧪 AstraFlux-HUB 测试版更新日志 - ${version}

- **发布版本**：${version} (构建码: ${timeCode})
- **版本渠道**：Beta 测试版专属通道 (software(beta)/)
- **发布日期**：${now.toLocaleDateString('zh-CN')}
- **支持架构**：Windows 10 / 11 (x64)
- **安装包架构**：Inno Setup 6 官方原生现代向导 (Setup Wizard)

---

## 📝 本次改动详细说明

### 1. 🎯 [轴体库校验机制与硬件 PCB 专属库存隔离 (Beta 抢先测试)]
- **官方硬件轴体探针对接**：全面接入官方 SDK \`ServiceKeyboard.getAxisList()\` 物理探针能力，优先通过底层 HID 协议穿透直读键盘主控芯片硬件烧录的真实轴体表。
- **PCB 物理库存严格隔离**：
  - **江湾 Everglide 系列 PCB**（AE64-MAX、AE64 Pro、AE61 Pro、SU66 等）：彻底切断非认证杂牌轴体的混入注水，严格锁定官方鉴权的 75 款标准认证轴体（江湾 1款【库里南轴】、佳达隆 30款、正牌科电 19款、其它品牌 25款），每款轴体均包含真实出厂行程上限（\`axis_range_max\`）与磁通量灵敏度系数（\`axis_coefficient\`）。
  - **VICTKONG DV63**：严格隔离并仅开放其出厂物理支持的 6 款核心轴体（神马轴、磁玉轴、磁玉 Pro、磁玉 Gaming、万磁王、万磁王 RGB），防止混入不兼容轴体。
- **⚠️ Beta 测试避坑指南**：因各家客制化 PCB 固件版本差异较大，部分非标固件可能存在协议兼容性差异，**强烈建议在轴体库中选择您所使用的键盘官方出厂支持清单内的轴体，切勿盲目写入未经验证或超出该 PCB 支持范围的轴体**，以免引起主控识别回落或触发异常。

### 2. 🛡️ [消除轴体切换与视图跳转时偶发的崩溃拦截 BUG]
- **清除执行时序死区（TDZ）**：修复了在轴体库配置或校准状态初始化时，排布键位常量因初始化时序引发的 \`ReferenceError: Cannot access 'Ei' before initialization\` 临时异常视图拦截，恢复秒开秒切的丝滑体验。
- **动态状态热重置**：优化了切换轴体后即刻跳转触发页、灯效页或设置页时的状态上下文回收，彻底杜绝切换页面引发的白屏与组件卸载残留问题。

### 3. 🎛️ [按键级独立“混轴”个性化设置全面支持]
- **告别全键被动连带修改**：彻底重构轴体应用逻辑，修复了此前一旦配置轴体就强制将全键盘所有按键同时修改的痛点。
- **单键 / 框选多键精准混轴**：现已完美支持按需自由选择单颗按键（如仅将 WASD 或空格键设为特定电竞磁轴），实现任意键位独立选用不同轴体参数的高自由度客制化“混轴”体验。

### 4. 📐 [校准页面 UI 布局与多余控件深度重构]
- **彻底根治展开说明时的挤压拉伸变形**：重构校准视窗的弹性布局架构，无论是默认展开校准说明，还是折叠收起说明，底部按键面板、ADC 实时采样子视窗与交互控件均能保持正常比例，严防任何拉伸与 UI 挤压错位。
- **精简校准页多余入口**：依据官方驱动人机工效学逻辑，校准视窗移除左上角多余且易引起逻辑混淆的轴体下拉菜单，校准流程统一继承轴体设置页已生效的轴体电气参数，逻辑更加清晰严谨。
- **官方同款未校准按键智能提示**：在检测到键盘存在未校准键位时，进入驱动或切换设备即刻主动弹出官方同款友好校准提醒，避免未校准影响手感。

### 5. 🔗 [GitHub 仓库定位恢复与多通道直连修复]
- **主干仓库重定向修正**：全面恢复并矫正客户端内外所有指向 GitHub 官方开源仓库的跳转定位（直达 \`onekuta/AstraFlux-Hub\`）。
- **国内极速镜像双轨支持**：关于页面与更新卡片无缝支持 Gitee 与 GitHub CDN 加速通道双向自由切换，国内用户不再受网络阻断困扰。

### 6. ⌨️ [客制化 PCB 型号识别与配列支持修复]
- **AE61 Pro 经典 61 配列彻底纠偏**：修复了用户反馈的 AE61 Pro 连接后被误识别为 68 配列的硬件分析 BUG，建立基于按键矩阵与特征码的无损仲裁机制，确保 61 配列键盘 100% 精确渲染为 61 键经典布局。
- **多配列适配矩阵鲁棒性增强**：增强了 60%/61%/64%/68%/75%/87%/98 等多种客制化 PCB 的自动识别与热插拔动态重测能力。

### 7. 🚀 [底层防崩溃引擎与稳定性全面加强]
- **通信守护与防雪崩重连**：强化 WebHID 底层通信容错，捕获个别主控只读指令超时的偶发异常，防止设备插拔瞬态导致渲染进程异常。
- **本地存储校验保护**：对校准状态与自定义键位等本地 LocalStorage 读写增加防御性解析保护，杜绝因旧版本历史脏数据导致的启动故障。

### 8. 🔍 [PCB 板载轴体独立探针系统 (DevLab)]
- **专属硬件透视诊断工具**：在开发者实验室（DevLab）中新增“硬件板载轴体探针”专属面板，一键发送底层探针指令，实时解密并可视化呈现当前物理键盘内部烧录的硬件轴体 ID 数组、Esc 键电气寄存器实测参数与协议架构版本（V1 固件索引 vs V2/V3 动态扩展）。

---

## 📦 安装包文件信息 (标准三件套之一)
- **文件名称**：\`${setupExeName}\`
- **文件体积**：\`${setupSizeMb} MB\` (\`${setupSizeBytes}\` 字节)
- **构建代码**：\`${timeCode}\`
- **SHA-256 哈希值**：\`${setupSha256}\`
`;

  const releaseChangelogMd = `# 🚀 AstraFlux-HUB 更新日志 - V${version}

- **发布版本**：V${version} (构建码: ${timeCode})
- **发布日期**：${now.toLocaleDateString('zh-CN')}
- **支持架构**：Windows 10 / 11 (x64)
- **安装包架构**：Inno Setup 6 官方原生现代向导 (Setup Wizard)

---

## 📝 本次改动摘要

### 🔄 [OTA 升级与二次扫描联动]
- **数据库更新后二次即时扫描**：在设置中心更新完适配库后，后台立即执行全量二次校验，确认无未完成更新后瞬间消除首页顶栏的“更新可用”按钮与红点，无需重启驱动。
- **时间码与防倒退门禁**：正式版全量绑定时间码（${timeCode}），当切换至旧 Beta 通道时自动拦截倒退更新，确保稳定版不受旧测试版降级干扰。
- **动态更新记录呈现**：更新数据库卡片动态解析并展示云端真实的 \`libChangelog\` 内容。

### 🌐 [全界面多语言国际化与视觉进化]
- **三语无感切换**：全量支持简体中文、English、日本語，界面实时无缝切换。
- **全新高颜值控件**：深度打造 CustomSelect 控件与暗黑主题深度契合。
- **界面细节打磨**：修复设置页右上角标签折行挤压，纯净化切换通道按钮图标。

### 📦 [安装包架构 (Inno Setup 6)]
- **官方 Inno Setup 原生现代向导**：支持选择安装目录、快捷方式附加任务引导。
- **极致体积优化 (93.5 MB)**：LZMA2/Ultra64 压缩，直接支持 Gitee 官方发行版极速直下。

---

## 📦 安装包文件信息 (标准三件套之一)
- **文件名称**：\`${setupExeName}\`
- **文件体积**：\`${setupSizeMb} MB\` (\`${setupSizeBytes}\` 字节)
- **构建代码**：\`${timeCode}\`
- **SHA-256 哈希值**：\`${setupSha256}\`
`;

  const changelogMdContent = isBeta ? betaChangelogMd : releaseChangelogMd;

  const changelogFilePath = path.join(releaseDirPath, '更新日志.md');
  fs.writeFileSync(changelogFilePath, changelogMdContent, 'utf-8');
  console.log(`      ✓ [文件 2/3] 更新日志已生成: 更新日志.md`);

  // 4.2 生成「manifest.json」清单
  const targetTag = isBeta ? version : `v${version}`;
  const manifestData = {
    manifestVersion: '1.4.1',
    appVersion: version,
    buildTimeCode: timeCode,
    buildDate: buildDateStr,
    channel: isBeta ? 'beta' : 'release',
    prerelease: isBeta,
    appDownloadUrl: `https://gitee.com/Kutaze/astra-flux-hub/releases/download/${targetTag}/${setupExeName}`,
    cdnDownloadUrl: `https://ghfast.top/https://github.com/onekuta/AstraFlux-Hub/releases/download/${targetTag}/${setupExeName}`,
    githubDownloadUrl: `https://github.com/onekuta/AstraFlux-Hub/releases/download/${targetTag}/${setupExeName}`,
    appReleaseUrl: `https://gitee.com/Kutaze/astra-flux-hub/releases`,
    appChangelog: changelogText,
    appForceUpdate: false,
    appFileSize: `${setupSizeMb} MB`,
    setupSha256: setupSha256,
    libVersion: publisherConfig.dbRelease?.libVersion || '2026.10.21.1',
    libDownloadUrl: 'https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/device_database.spkdb',
    totalDevices: 638,
    updatedAt: new Date().toISOString()
  };

  const manifestFilePath = path.join(releaseDirPath, 'manifest.json');
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifestData, null, 2), 'utf-8');
  console.log(`      ✓ [文件 3/3] 云端发布更新清单已生成: manifest.json`);

  // 同步复制到根目录下的 software/ 或 software(beta)/
  const rootSoftwareDir = isBeta ? path.join(ROOT_DIR, 'software(beta)') : path.join(ROOT_DIR, 'software');
  if (!fs.existsSync(rootSoftwareDir)) {
    fs.mkdirSync(rootSoftwareDir, { recursive: true });
  }
  fs.writeFileSync(path.join(rootSoftwareDir, 'manifest.json'), JSON.stringify(manifestData, null, 2), 'utf-8');
  fs.writeFileSync(path.join(rootSoftwareDir, '更新日志.md'), changelogMdContent, 'utf-8');
  console.log(`      ✓ 已同步更新云端目录清单: ${isBeta ? 'software(beta)/' : 'software/'}`);

  // 同时将最新文件大小写回 开发者云端发布工具/config.json
  if (fs.existsSync(configPath)) {
    try {
      publisherConfig.appRelease = publisherConfig.appRelease || {};
      publisherConfig.appRelease.appVersion = version;
      publisherConfig.appRelease.fileSize = `${setupSizeMb} MB`;
      publisherConfig.appRelease.appDownloadUrl = manifestData.appDownloadUrl;
      fs.writeFileSync(configPath, JSON.stringify(publisherConfig, null, 2), 'utf-8');
    } catch (e) {}
  }

  console.log('\n========================================================');
  console.log(`🎉 V${version} 版本发布包已全部封装至「标准三文件」结构 (Inno Setup):`);
  console.log(`👉 文件夹目录: 安装包/${releaseDirName}/`);
  console.log(`   ├── 1. 更新日志.md`);
  console.log(`   ├── 2. ${setupExeName} (${setupSizeMb} MB)`);
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

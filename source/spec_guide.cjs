#!/usr/bin/env node
/**
 * 星闪悦动 HUB - 规范自检与 AI 生产引导脚本 (Specification Guide & Environment Inspector)
 * 供任何后续接手的 AI Agent 或开发者快速了解项目全貌、校验硬件约束与驱动包完整性。
 *
 * 运行方式:
 *   node spec_guide.cjs
 *   node spec_guide.cjs --check
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

// 1. 颜色与输出格式化工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function banner() {
  console.log(`\n${colors.cyan}${colors.bright}====================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}   ⚡ 星闪悦动 HUB (SparkLink PlayJoy Hub) - AI 规范与工程引导中心 ⚡  ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}====================================================================${colors.reset}\n`);
}

// 2. 权威参考网站与核心资料库
const REFERENCE_LINKS = [
  {
    name: '双子星 (SparkLink Web 官方新驱动)',
    url: 'https://v2-dev.xsyd.top/',
    desc: '官方在线驱动首页，支持 NearLink WebHID 握手',
  },
  {
    name: '双子星 · 高级按键专属开发参考',
    url: 'https://v2-dev.xsyd.top/advancedKey',
    desc: 'RS/LT/SOCD/DKS/MPT 等高级按键交互与卡槽配置规范',
  },
  {
    name: '双子星 · 设备硬件描述符库源文件',
    url: 'https://v2-dev.xsyd.top/js/device.js',
    desc: '官方全部 33+ 款星闪键鼠外设 VID (0x1CA6/0x38A6/0x31E3) 列表',
  },
  {
    name: '双子星 · PWA WebManifest',
    url: 'https://v2-dev.xsyd.top/manifest.webmanifest',
    desc: '官方应用图标与主题元数据',
  },
  {
    name: '星闪悦动云端轴体 API',
    url: 'https://api.sparklinkplayjoy.com/api/v1/getAxisListV3',
    desc: '云端动态拉取磁轴行程、阻尼曲线与参数',
  },
  {
    name: '本地官方 SDK 技术文档库',
    path: 'reference_docs/sparklink_sdk_docs/',
    desc: '包含 keyboardv2 完整 API (higherKey, performance, lighting, macro, custom)',
  },
  {
    name: '本地迈从 (MCHOSE HUB) 解包架构参考',
    path: 'reference_docs/mchose_extracted/',
    desc: '参考现代电竞驱动的浅色极简 UI、双列性能卡片排布与通用 HUB 模型',
  },
];

// 3. 硬件铁律与核心设计准则
const CORE_RULES = [
  '【铁律 1】DV63 是纯 USB 极速有线键盘，严禁出现无线图标、电量百分比或 94%/95% 假状态。',
  '【铁律 2】DV63 键盘回报率上限为 8KHz (0.125ms)，绝不支持 16KHz，严禁显示 16k 档位。',
  '【铁律 3】DV63 默认标配轴体为「马轴」（青龙磁轴），行程 3.4mm，推荐 AP 触发点 0.40mm。',
  '【铁律 4】高级按键允许全部删除至 0/40 组，严禁添加“至少保留一组”的拦截弹窗。',
  '【铁律 5】全软件统一人机交互，严禁原生 alert()/confirm()，一律使用 ToastProvider 顶部气泡。',
  '【铁律 6】灯光设置专享深邃黑底发光 RGB 键盘渲染，与触发/改键的白色电竞键帽完全解耦。',
];

// 4. 执行工程自检与验证
function runSelfCheck() {
  console.log(`${colors.bright}${colors.yellow}🔍 正在执行工程完整度与规范自检...${colors.reset}\n`);
  let hasErrors = false;

  // 检查 package.json 与 SDK 依赖
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    const sdkVersion = pkg.dependencies['@sparklinkplayjoy/sdk-keyboard-v2'];
    if (sdkVersion) {
      console.log(`  ${colors.green}✔${colors.reset} 官方驱动包 @sparklinkplayjoy/sdk-keyboard-v2: ${colors.cyan}${sdkVersion}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✘ 缺失 @sparklinkplayjoy/sdk-keyboard-v2 驱动包！${colors.reset}`);
      hasErrors = true;
    }
  } catch (err) {
    console.log(`  ${colors.red}✘ 读取 package.json 失败: ${err.message}${colors.reset}`);
    hasErrors = true;
  }

  // 检查本地参考文档目录
  const sdkDocDir = path.join(ROOT_DIR, 'reference_docs', 'sparklink_sdk_docs');
  if (fs.existsSync(sdkDocDir)) {
    console.log(`  ${colors.green}✔${colors.reset} 本地星闪官方 SDK 文档归档库就绪: ${colors.dim}reference_docs/sparklink_sdk_docs${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✘ 未找到 reference_docs/sparklink_sdk_docs${colors.reset}`);
  }

  // 检查硬件能力分析文件与 DV63 8KHz / 有线约束
  try {
    const profilesPath = path.join(ROOT_DIR, 'src', 'constants', 'deviceProfiles.js');
    const profileContent = fs.readFileSync(profilesPath, 'utf8');
    const hasWired = profileContent.includes("connectionType: 'wired'");
    const has8k = profileContent.includes('maxPollingRate: 8000');
    if (hasWired && has8k) {
      console.log(`  ${colors.green}✔${colors.reset} DV63 硬件规格严格对齐: ${colors.cyan}纯 USB 有线 + 8KHz (0.125ms) 物理封顶${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✘ deviceProfiles.js 中硬件规格不符合铁律 (必须为 wired 且 max 8000Hz)${colors.reset}`);
      hasErrors = true;
    }
  } catch (err) {
    console.log(`  ${colors.red}✘ 检查 deviceProfiles.js 失败: ${err.message}${colors.reset}`);
  }

  // 检查全工程是否存在原生 alert/confirm 违规调用
  let alertCount = 0;
  function scanDir(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const text = fs.readFileSync(full, 'utf8');
        if (text.includes('alert(') || text.includes('confirm(')) {
          alertCount++;
        }
      }
    });
  }
  scanDir(path.join(ROOT_DIR, 'src'));
  if (alertCount === 0) {
    console.log(`  ${colors.green}✔${colors.reset} 全工程原生阻塞式弹窗排查: ${colors.green}0 处 (全部遵从 ToastProvider 气泡规范)${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✘ 在 src 源码中检测到 ${alertCount} 处原生 alert/confirm 调用，严禁使用！${colors.reset}`);
    hasErrors = true;
  }

  // 检查 PROJECT_AI_SPEC.md 规范大典是否存在
  if (fs.existsSync(path.join(ROOT_DIR, 'PROJECT_AI_SPEC.md'))) {
    console.log(`  ${colors.green}✔${colors.reset} 规范大典文档就绪: ${colors.cyan}PROJECT_AI_SPEC.md${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✘ 缺失 PROJECT_AI_SPEC.md！${colors.reset}`);
    hasErrors = true;
  }

  console.log('\n' + (hasErrors ? `${colors.red}⚠️  部分检查未通过，请根据提示修正！${colors.reset}` : `${colors.green}✨ 所有核心规范与环境检查全部通过！${colors.reset}`));
}

// 5. 打印规范指南与操作说明
function printGuide() {
  console.log(`${colors.bright}${colors.cyan}🌐 一、官方核心参考站点与资源${colors.reset}`);
  REFERENCE_LINKS.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${colors.bright}${item.name}${colors.reset}`);
    if (item.url) console.log(`     🔗 链接: ${colors.cyan}${item.url}${colors.reset}`);
    if (item.path) console.log(`     📁 路径: ${colors.dim}${item.path}${colors.reset}`);
    console.log(`     📝 说明: ${item.desc}`);
  });

  console.log(`\n${colors.bright}${colors.yellow}🛡️ 二、必须遵守的六大硬件铁律${colors.reset}`);
  CORE_RULES.forEach((rule) => {
    console.log(`  • ${rule}`);
  });

  console.log(`\n${colors.bright}${colors.magenta}🚀 三、标准开发与生产操作命令 (Windows 环境)${colors.reset}`);
  console.log(`  1. 编译构建: ${colors.cyan}cmd.exe /c "set PATH=C:\\Program Files\\nodejs;%PATH% && npm run build"${colors.reset}`);
  console.log(`  2. 启动桌面端: ${colors.cyan}cmd.exe /c "set PATH=C:\\Program Files\\nodejs;%PATH% && npx electron electron/main.js"${colors.reset}`);
  console.log(`  3. 启动 Vite 开发服务: ${colors.cyan}cmd.exe /c "set PATH=C:\\Program Files\\nodejs;%PATH% && npm run dev"${colors.reset}`);
  console.log(`\n  👉 详细技术手册请参阅根目录: ${colors.bright}${colors.green}PROJECT_AI_SPEC.md${colors.reset}\n`);
}

// 主流程执行
banner();
runSelfCheck();
console.log('--------------------------------------------------------------------');
printGuide();

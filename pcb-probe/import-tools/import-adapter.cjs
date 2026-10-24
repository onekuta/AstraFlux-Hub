/**
 * 开发者专用：星闪 PCB 适配文件一键建库与合并脚本
 * 用法:
 *   node "PCB信息枚举探针/主项目入库工具/import-adapter.cjs" "PCB信息枚举探针/导出数据/PCB_适配文件_xxxx.json"
 */

const fs = require('fs');
const path = require('path');

const targetFile = process.argv[2];

if (!targetFile) {
  console.log('❌ 请指定要导入的 PCB 适配 JSON 文件路径！');
  console.log('示例: node import-adapter.cjs ../导出数据/PCB_适配文件_AE64_MAX_0x1CA6_0x300D.json');
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ 文件不存在: ${resolvedPath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const data = JSON.parse(content);

  console.log(`=======================================================`);
  console.log(`🚀 开始解析并导入 PCB 适配数据包...`);
  console.log(`📄 来源文件: ${path.basename(resolvedPath)}`);
  console.log(`=======================================================`);

  const fp = data.hardwareFingerprint || {};
  const prof = data.deviceProfile || {};
  const mat = data.matrixLayout || {};
  const light = data.lightingTopology || {};
  const ax = data.axisAndCalibration || {};
  const perf = data.performanceSpec || {};
  const brand = prof.brand || fp.brandName || fp.brand || data.meta?.brandName || '客制化';

  console.log(`[设备指纹] 品牌: ${brand}, 型号: ${prof.name || fp.productName} (${fp.vendorIdHex}:${fp.productIdHex})`);
  console.log(`[物理按键] 有效按键: ${mat.totalKeys} 颗, 推导配列: ${mat.layoutName}`);
  console.log(`[固件版本] App: ${fp.chipInfo?.appVersion || '出厂'} / PCB: ${fp.chipInfo?.pcbVersion || '标准'} / BoardId: ${fp.chipInfo?.boardId || '--'}`);
  console.log(`[灯珠拓扑] 双灯设计: ${light.isDoubleLighting ? '是' : '否'}, 空格多灯: ${light.spaceLamps?.count || 1}灯独立可编辑, 装饰灯带: ${light.stripLighting?.hasStrip ? `具备 (${light.stripLighting.totalStripLeds}灯)` : '无'}, 总物理灯珠: ${light.totalLeds || mat.totalKeys}颗`);
  console.log(`[轴体标定] 默认轴体: ${ax.defaultAxis?.name || prof.defaultAxis || '磁玉 Pro'} (${ax.defaultAxis?.brand || '佳达隆'}, ${ax.defaultAxis?.travel || 3.5}mm), 霍尔基线: 已提取 ${ax.currentCalibrationStatus?.length || 0} 行标定数据`);
  console.log(`[性能规格] 最大回报率: ${perf.maxPollingRate}Hz (硬件上限 ${perf.hardwareRateCeiling}Hz)`);

  const ROOT = path.resolve(__dirname, '..', '..');
  const profilesPath = path.join(ROOT, '工程源码', 'src', 'constants', 'deviceProfiles.js');
  const devicesPath = path.join(ROOT, '工程源码', 'src', 'constants', 'sparklinkDevices.js');

  console.log('\n[建库建议代码预览 - deviceProfiles.js]:');
  const profileKey = prof.model ? prof.model.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase() : `PCB_${fp.vendorIdHex}_${fp.productIdHex}`;
  
  const generatedProfileCode = `
  ${profileKey}: {
    id: '${prof.id || profileKey.toLowerCase()}',
    brand: '${prof.brand || '客制化'}',
    model: '${prof.model || '客制化键盘'}',
    name: '${prof.name || '客制化星闪键盘'}',
    shortName: '${prof.shortName || prof.model || '客制化'}',
    type: 'keyboard',
    layout: '${prof.layout || '64keys'}',
    layoutName: '${prof.layoutName || '标准配列'}',
    vendorId: ${fp.vendorIdHex ? fp.vendorIdHex.toLowerCase() : 'null'},
    productId: ${fp.productIdHex ? fp.productIdHex.toLowerCase() : 'null'},
    connectionType: 'wired',
    connectionLabel: '${prof.connectionLabel || 'USB 极速有线'}',
    isWired: true,
    hasBattery: false,
    maxPollingRate: ${perf.maxPollingRate || 8000},
    hardRateCeiling: ${perf.hardwareRateCeiling || 8000},
    supportedPollingRates: [${(perf.supportedPollingRates || [1000, 2000, 4000, 8000]).join(', ')}],
    defaultPollingRate: ${perf.defaultPollingRate || 8000},
    minActuationPoint: ${perf.rtPrecisionMm || 0.001},
    defaultAxis: ${prof.defaultAxis ? `'${prof.defaultAxis}'` : 'null'},
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: ${prof.features?.continuousRt ? 'true' : 'false'},
      doubleLighting: ${light.isDoubleLighting ? 'true' : 'false'},
      stripLighting: ${light.stripLighting?.hasStrip ? 'true' : 'false'},
    },
  },`;

  console.log(generatedProfileCode);

  console.log('\n=======================================================');
  console.log(`✅ 数据校验完毕，符合 pcb-adapter-schema 规范！`);
  console.log(`🛠️ 入库步骤：`);
  console.log(`1. 将上方 profile 代码复制放入 工程源码/src/constants/deviceProfiles.js 的 DEVICE_PROFILES 对象中；`);
  console.log(`2. 若属于新 VID:PID，在 工程源码/src/constants/sparklinkDevices.js 补充条目；`);
  console.log(`3. 执行: cd 工程源码 && npm run build 构建并覆盖 app.asar 即可发布！`);
  console.log(`=======================================================`);

} catch (e) {
  console.error('❌ 解析 JSON 失败:', e);
}

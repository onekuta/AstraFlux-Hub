// 星闪外设设备能力与规格分析中心
// 支持通用性星闪键盘驱动 HUB 架构：动态分析不同键盘型号的最大回报率与硬件特性

export const RATE_HZ_TO_SDK = {
  32000: 'R32KHz',
  16000: 'R16KHz',
  8000: 'R8KHz',
  4000: 'R4KHz',
  2000: 'R2KHz',
  1000: 'R1KHz',
  500: 'R500Hz',
  250: 'R250Hz',
  125: 'R125Hz',
};

export const RATE_SDK_TO_HZ = {
  R32KHz: 32000,
  R16KHz: 16000,
  R8KHz: 8000,
  R4KHz: 4000,
  R2KHz: 2000,
  R1KHz: 1000,
  R500Hz: 500,
  R250Hz: 250,
  R125Hz: 125,
};

// 全档位回报率元数据定义 (与官方 Web 端及驱动端 8 档对齐)
// 32KHz 与 16KHz 需要 USB 3.0 连接与专用 EnhanceHidUSB 驱动
export const ALL_POLLING_RATE_METADATA = [
  { val: 32000, label: '32KHz', sdkKey: 'R32KHz', desc: '0.031ms · 旗舰极速', timeMs: '0.031ms', requiresUsb3: true },
  { val: 16000, label: '16KHz', sdkKey: 'R16KHz', desc: '0.063ms · 超高回报', timeMs: '0.063ms', requiresUsb3: true },
  { val: 8000, label: '8KHz', sdkKey: 'R8KHz', desc: '0.125ms · 极限响应', timeMs: '0.125ms' },
  { val: 4000, label: '4KHz', sdkKey: 'R4KHz', desc: '0.25ms · 星闪推荐', timeMs: '0.250ms' },
  { val: 2000, label: '2KHz', sdkKey: 'R2KHz', desc: '0.50ms · 高速低抖', timeMs: '0.500ms' },
  { val: 1000, label: '1KHz', sdkKey: 'R1KHz', desc: '1.0ms · 标准电竞', timeMs: '1.000ms' },
  { val: 500, label: '500Hz', sdkKey: 'R500Hz', desc: '2.0ms · 稳定节能', timeMs: '2.000ms' },
  { val: 250, label: '250Hz', sdkKey: 'R250Hz', desc: '4.0ms · 基础节能', timeMs: '4.000ms' },
];

// 官方全量设备库 (www.xsyd.top/v2-app 与 v2-dev.xsyd.top 双站点合并 + hub.xsyd.top v1.3.0)
// 覆盖 20 个 VID / 637 个 VID:PID，支持键盘 V2、键盘 V3 与星闪电竞鼠标
import {
  SPARKLINK_DEVICE_LIST,
  SPARKLINK_DEVICE_KEYS,
  SPARKLINK_DEVICE_MAP,
  SPARKLINK_VID_SET,
  SPARKLINK_VIDS,
  VENDOR_BRANDS,
  getSparklinkDeviceMeta,
  getDriverRoute,
} from './sparklinkDevices.js';

export {
  SPARKLINK_DEVICE_LIST,
  SPARKLINK_DEVICE_KEYS,
  SPARKLINK_DEVICE_MAP,
  SPARKLINK_VID_SET,
  SPARKLINK_VIDS,
  VENDOR_BRANDS,
  getSparklinkDeviceMeta,
  getDriverRoute,
};

export const SPARKLINK_USAGE_PAGE = 0xffb0;
export const SPARKLINK_USAGE = 0x01;

// WebHID requestDevice 过滤器：放行全部官方星闪方案设备（按 VID、UsagePage 混合匹配，彻底杜绝漏扫）
export const SPARKLINK_HID_FILTERS = [
  ...SPARKLINK_VIDS.map((vendorId) => ({ vendorId })),
  ...SPARKLINK_VIDS.map((vendorId) => ({
    vendorId,
    usagePage: SPARKLINK_USAGE_PAGE,
    usage: SPARKLINK_USAGE,
  })),
  { usagePage: SPARKLINK_USAGE_PAGE },
  { usagePage: 0xff00 },
  { usagePage: 0xffa0 },
  { usagePage: 1, usage: 6 },
];

// 精确匹配官方设备库 (VID:PID)
export function isOfficialSparklinkDevice(vendorId, productId) {
  return SPARKLINK_DEVICE_KEYS.has(vendorId * 65536 + productId);
}

// 星闪方案主 VID（0x1CA6 = 7334，前行者/双子星自家体系）
// 官网设备库只收录了部分型号，AE64-MAX (0x300D)、DV63 (0x7A02) 等新机型尚未入库，
// 但它们同属 0x1CA6 主体系，仍需在首页可见，故单独放行。
export const SPARKLINK_PRIMARY_VIDS = [0x1ca6];

/**
 * 首页 / 驱动页可见性判定（比 isOfficialSparklinkDevice 更严，比 SPARKLINK_VIDS 更准）
 * ① 精确命中官方设备库         → 可见（如 ES68 Dawn 0x1CA6:0x1C24）
 * ② 属于主 VID 0x1CA6 体系     → 可见（覆盖 AE64-MAX / DV63 / AE61 等未入库在售型号）
 * ③ 其它 VID 且未入库           → 不可见
 *    （例：Dragonfly 0x391D:0x1A36、iKF / MCHOSE 0x38xx 等历史授权残留，避免首页杂乱）
 */
import { customDeviceRegistry } from '../services/customDeviceRegistry.js';

export function isSupportedSparklinkDevice(vendorId, productId) {
  if (vendorId == null || productId == null) return false;
  // 0. 优先放行动态热更新/开发者扩展库中的设备
  if (customDeviceRegistry && customDeviceRegistry.getProfile(vendorId, productId)) return true;
  if (isOfficialSparklinkDevice(vendorId, productId)) return true;
  if (SPARKLINK_PRIMARY_VIDS.includes(vendorId)) return true;
  return false;
}

// DV63 官方出厂硬件严格支持轴体清单 (严禁混入其它不支持轴体，防止写入后映射错乱)
export const DV63_SUPPORTED_SWITCHES = [
  '神马轴',
  '磁玉轴',
  '磁玉 Pro',
  '磁玉 Gaming',
  '万磁王',
  '万磁王 RGB',
];

// 江湾 Everglide 硬件 PCB (AE64-MAX, AE64 Pro, AE61 Pro, SU66等) 官方全量 75 款认证轴体库 (对齐官网最新实测)
export const JIANGWAN_OFFICIAL_SWITCHES = [
  // 江湾原厂自研 (唯一原厂旗舰)
  '库里南轴',
  // 佳达隆 (Gateron 30款)
  '磁玉轴', '磁白轴', '磁玉Gaming', '磁玉Pro', '玉子轴', '琉璃轴', '阿波罗轴', '磁玉Max', '花火轴', '磁玉Pom', '龙发轴',
  '佳达隆双轨磁白轴', '磁青轴', '金珀轴', '婷婷魔王/轴', '铜锣烧', '可拉轴', '灰木磁Pro', '双轨磁青轴', '双轨磁红轴', '双轨磁黄轴', '磁黄轴',
  '枫糖轴', '甜甜圈', '抹茶轴', '惰野轴', '甜珠玉轴Pro', '糯玉轴', '翠玉轴', '玉刃轴',
  // 正牌科电 (TTC 19款)
  '万磁王', '万磁王RGB', '烈焰红', '神马轴', '炽热金', '爱心万磁王', '寂心万磁王', '圣心万磁王', '太阳神轴', '天王轴', '天王轴电竞',
  '天王SE', '炎王轴', '炎王轴Pro', '凌云轴', '分神轴', '暗黑王轴', '太阳炎轴', '科索轴',
  // 其它品牌 (25款)
  '冰皇轴', '001', '琉璃Pro', '冰极万磁轴', '国度轴', '悟空轴', '悟空轴(3.45mm)', '孤傲轴', '天际线轴', '磁神轴', '天方轴Pro',
  '双星轴', '赤乌轴', '磁神轴Pro+', '磁神轴Pro', '磁神轴RGB', '磁神Pro半轴', '磁神·三元素', '翡翠·魔王轴', '灵双轴', '天际线轴(3.5mm)',
  '冰雪轴', '苍雪轴', '白色悟空轴', '极光轴'
];

// 已知星闪设备配置库
export const DEVICE_PROFILES = {
  DV63: {
    id: 'dv63',
    brand: 'VICTKONG',
    model: 'DV63',
    name: 'VICTKONG DV63 磁轴键盘',
    shortName: 'DV63',
    type: 'keyboard',
    layout: '64keys',
    layoutName: '左移64配列',
    vendorId: 0x1ca6,
    productId: 0x7a02,
    // VICTKONG DV63 是纯 USB 极速有线电竞磁轴键盘，无内置电池，硬件物理支持 8000Hz (0.125ms)
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.01,
    defaultAxis: '神马轴',
    supportedSwitches: DV63_SUPPORTED_SWITCHES,
    isolateSwitches: true,
    isFinishedKeyboard: true,
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      // 连续快速触发：官方目前只对 AE64-MAX 开放（见 CONTINUOUS_RT_MIN_FIRMWARE）
      continuousRt: false,
    },
  },
  AE64_MAX: {
    id: 'ae64_max',
    brand: '江湾 Everglide',
    model: 'AE64-MAX',
    name: '江湾 AE64-MAX 磁轴键盘',
    shortName: 'AE64-MAX',
    type: 'keyboard',
    layout: '64keys',
    layoutName: '左移64配列',
    // AE64-MAX 走双子星官方驱动体系，实际 VID/PID 以硬件上报为准（productName 含 AE64 即匹配）
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '天际线轴', // 官网 V3 轴体映射实测（0x1CA6:0x300D 硬件板载 axisV2Id: 12608 对应天际线轴 3.55mm）
    supportedSwitches: JIANGWAN_OFFICIAL_SWITCHES,
    isolateSwitches: true,
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      doubleLight: true, // 上下双灯位（上位灯珠与下位灯珠独立控制）
      decorateLighting: true, // 底部31颗环形氛围灯
      hallCalibration: true,
      // ★ 连续快速触发：AE64-MAX 专属，需固件 ≥ 0.04
      //   （江湾官方 2026-10-13 群公告：打开后 RT 行程中也支持连续快速触发）
      continuousRt: true,
    },
    // AE64-MAX 物理底灯规格：标准 34 颗 LED，第 1 行 17 颗，第 2 行 17 颗 (解决 31 颗漏掉 3 颗导致控制不上的问题)
    decorateLighting: {
      count: 34,
      rows: 2,
      cols: 17,
      rowLayout: [17, 17],
      name: '装饰灯1',
      isStripTube: true,
    },
  },
  AE61_PRO: {
    id: 'ae61_pro',
    brand: '江湾 Everglide',
    model: 'AE61 Pro',
    name: '江湾 AE61 Pro 磁轴键盘',
    shortName: 'AE61 Pro',
    type: 'keyboard',
    layout: '60keys',
    layoutCategory: '61keys',
    layoutName: '60%经典配列 (61键)',
    totalKeys: 61,
    totalKeyCount: 61,
    vendorId: 0x1ca6,
    productId: 0x300b,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [250, 500, 1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: JIANGWAN_OFFICIAL_SWITCHES,
    isolateSwitches: true,
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      dksSupport: true,
      mptSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
      doubleLighting: true,
      stripLighting: true,
    },
  },
  AE64_PRO: {
    id: 'ae64_pro',
    brand: '江湾 Everglide',
    model: 'AE64 Pro',
    name: '江湾 AE64 Pro 磁轴键盘',
    shortName: 'AE64 Pro',
    type: 'keyboard',
    layout: '64keys',
    layoutName: '左移64配列',
    totalKeys: 64,
    vendorId: 0x1ca6,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '天际线轴',
    supportedSwitches: JIANGWAN_OFFICIAL_SWITCHES,
    isolateSwitches: true,
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  SU66: {
    id: 'su66',
    brand: '江湾 Everglide',
    model: 'SU66',
    name: '江湾 SU66 磁轴键盘',
    shortName: 'SU66',
    type: 'keyboard',
    layout: '66keys',
    layoutName: '66配列',
    totalKeys: 66,
    vendorId: 0x1ca6,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '库里南轴',
    supportedSwitches: JIANGWAN_OFFICIAL_SWITCHES,
    isolateSwitches: true,
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
    },
  },
  ES68: {
    id: 'es68',
    model: 'ES68',
    name: '前行者 ES68 破晓 磁轴键盘',
    shortName: 'ES68',
    type: 'keyboard',
    layout: '68keys',
    layoutName: '紧凑68配列',
    // 官网设备库: {vendorId:7334(0x1CA6), productId:7204(0x1C24), productName:"EWEADN ES68 Dawn"}
    vendorId: 0x1ca6,
    productId: 0x1c24,
    // ES68 破晓为纯有线磁轴键盘（双 USB-C 5Gbps 接口，无电池）
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线 · 双 Type-C',
    isWired: true,
    hasBattery: false,
    // 星闪 SDK 当前仅开放至 8K 档位；硬件侧为 32K 方案，故单列 hardRateCeiling 供后续 SDK 升级放开
    maxPollingRate: 8000,
    hardwareMaxPollingRate: 32000,
    hardRateCeiling: 32000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      // 贯穿式 ARGB 漫反射灯带 (官网 XINGSHAN_ES68_STRIP_COLS = 26 列)
      stripLighting: true,
      decorateLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
    // 底部灯带规格：26 颗 (2 行 x 13 列)
    decorateLighting: {
      count: 26,
      rows: 2,
      cols: 13,
      rowLayout: [13, 13],
      name: '装饰灯1',
      isStripTube: true,
    },
    stripLighting: { cols: 26, ledHeight: 10 },
    spec: {
      scanRate: 256000,
      rapidTriggerPrecision: 0.001,
      latencyMs: 0.03,
      case: '全铝 CNC 机身',
      advancedKeys: ['RS', 'SOCD', 'DKS', 'MT', 'TGL', 'MPT', 'END'],
      acousticLayers: 5,
    },
  },
  SPARKLINK_75: {
    id: 'sparklink_75',
    model: 'NearLink 75',
    name: '星闪 75% 竞技磁轴键盘',
    shortName: '星闪 75',
    type: 'keyboard',
    layout: '75keys',
    layoutName: '75%电竞配列',
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  SPARKLINK_87: {
    id: 'sparklink_87',
    model: 'NearLink 87',
    name: '星闪 87 键 TKL 磁轴键盘',
    shortName: '星闪 87',
    type: 'keyboard',
    layout: '87keys',
    layoutName: '87键TKL配列',
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  SPARKLINK_98: {
    id: 'sparklink_98',
    model: 'NearLink 98',
    name: '星闪 98 键紧凑磁轴键盘',
    shortName: '星闪 98',
    type: 'keyboard',
    layout: '98keys',
    layoutName: '98紧凑小键盘',
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.01,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  SPARKLINK_104: {
    id: 'sparklink_104',
    model: 'NearLink 104',
    name: '星闪 104 键全尺寸磁轴键盘',
    shortName: '星闪 104',
    type: 'keyboard',
    layout: '104keys',
    layoutName: '104全尺寸配列',
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.01,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  SPARKLINK_60: {
    id: 'sparklink_60',
    model: 'NearLink 60',
    name: '星闪 60% 经典磁轴键盘',
    shortName: '星闪 60',
    type: 'keyboard',
    layout: '60keys',
    layoutName: '60%经典配列',
    vendorId: null,
    productId: null,
    connectionType: 'wired',
    connectionLabel: 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.01,
    defaultAxis: '磁玉 Pro',
    supportedSwitches: [
      '磁玉 Pro 超竞版',
      '磁玉 Pro',
      '磁玉轴',
      '佳达隆双轨磁白轴',
      '万磁王',
      '天王轴',
    ],
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
  GENERIC_KEYBOARD: {
    id: 'generic_sparklink_kb',
    model: 'SparkLink_KB',
    name: '星闪通用磁轴键盘',
    shortName: '星闪键盘',
    type: 'keyboard',
    layout: 'standard',
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 4000,
    minActuationPoint: 0.01,
    defaultAxis: '天际线轴',
    features: {
      magneticAxis: true,
      rtSupport: true,
      rgbLighting: true,
      continuousRt: false,
    },
  },
  GENERIC_MOUSE: {
    id: 'generic_sparklink_mouse',
    model: 'SparkLink_Mouse',
    name: '星闪电竞无线鼠标',
    shortName: '星闪鼠标',
    type: 'mouse',
    layout: 'mouse',
    maxPollingRate: 8000,
    supportedPollingRates: [125, 250, 500, 1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    features: {
      dpiSetting: true,
      rgbLighting: true,
      batteryReport: true,
      nearlinkGaming: true,
    },
  },
  GENERIC_KEYBOARD_V3: {
    id: 'generic_sparklink_kb_v3',
    model: 'SparkLink_KB_V3',
    name: '星闪 V3 架构磁轴键盘',
    shortName: '星闪 V3',
    type: 'keyboard',
    protocol: 'v3',
    layout: 'standard',
    maxPollingRate: 8000,
    supportedPollingRates: [1000, 2000, 4000, 8000],
    defaultPollingRate: 8000,
    minActuationPoint: 0.001,
    defaultAxis: '天际线轴',
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: false,
    },
  },
};

/**
 * 「连续快速触发」的固件门槛
 *
 * 来源：江湾官方（深圳江湾数码）2026-10-13 群公告
 *   「AE64 max 增加了一个新的功能：增加了一个连续快速触发的开关。
 *     打开后，就开始支持在 RT 行程中也连续快速触发。
 *     在 0.04 版本的固件开始支持的，请 AE64 max 用户更新固件到 0.04」
 *
 * 显示范围由各 profile 的 `features.continuousRt` 决定 —— 当前**只有 AE64-MAX 为 true**。
 * 以后官方若放开到其它机型，把对应 profile 的该位改成 true 即可，界面会自动出现这一行。
 */
export const CONTINUOUS_RT_MIN_FIRMWARE = '0.04';

/** 该机型是否支持「连续快速触发」（AE64-MAX 专属，需固件 ≥ 0.04） */
export function supportsContinuousRt(profile) {
  return !!profile?.features?.continuousRt;
}

/**
 * 获取设备 SKU 所支持的最低首次触发行程 (AP)
 * 对应官方规格：
 * - 旗舰电竞磁轴 SKU (如 ES68 破晓 / AE64-MAX) 默认原生支持 0.001mm (对齐官网);
 * - 其余磁轴 SKU (如 DV63 / 通用客制化) 默认支持 0.01mm;
 * - 一旦开启狂暴模式 2.0，所有磁轴键盘均解锁最高 0.001mm 极限微触发行程！
 */
export function getMinActuationPoint(profile, furyMode = false) {
  if (furyMode) return 0.001;
  if (profile?.minActuationPoint != null) return profile.minActuationPoint;
  const pId = (profile?.id || '').toLowerCase();
  const mName = (profile?.model || profile?.name || '').toLowerCase();
  if (pId.includes('es68') || pId.includes('ae64') || mName.includes('es68') || mName.includes('ae64')) {
    return 0.001;
  }
  return 0.01;
}

/**
 * 根据设备描述符与硬件回报列表动态分析设备能力
 * @param {object} descriptor { vendorId, productId, productName, sdkRates, keyCount }
 * @returns {object} 设备分析档案与最高回报率档位
 */
export function analyzeDeviceCapabilities(descriptor = {}) {
  const { vendorId, productId, productName = '', sdkRates = null, keyCount = null } = descriptor;
  
  // 1. 查找已知模型模板（按型号名与 VID/PID 精确匹配，未知设备回落通用档案而非 DV63）
  const name = productName.toUpperCase();
  let baseProfile = DEVICE_PROFILES.GENERIC_KEYBOARD;

  // 0. 优先命中动态热更新/开发者扩展库中的设备！
  const customMatch = (vendorId && productId) ? customDeviceRegistry?.getProfile(vendorId, productId) : null;
  const catalogMeta = (vendorId && productId) ? getSparklinkDeviceMeta(vendorId, productId) : null;

  if (customMatch) {
    baseProfile = {
      ...customMatch,
      name: productName || customMatch.name,
      shortName: productName ? productName.split(' ')[0] : customMatch.shortName,
    };
  } else if (catalogMeta && (catalogMeta.driver === 'mouse' || catalogMeta.targetId !== null)) {
    const brandName = catalogMeta.brand || '星闪无线 NearLink';
    baseProfile = {
      ...DEVICE_PROFILES.GENERIC_MOUSE,
      brand: brandName,
      name: productName || `${brandName} 电竞鼠标 (${catalogMeta.chip || 'NearLink'})`,
      shortName: productName ? productName.split(' ')[0] : `${brandName} 鼠标`,
      vendorId,
      productId,
      chip: catalogMeta.chip,
      targetId: catalogMeta.targetId,
    };
  } else if (catalogMeta && (catalogMeta.protocol === 'v3' || catalogMeta.driver === 'keyboardv3')) {
    const brandName = catalogMeta.brand || '星闪微码';
    baseProfile = {
      ...DEVICE_PROFILES.GENERIC_KEYBOARD_V3,
      brand: brandName,
      name: productName || `${brandName} 星闪 V3 键盘`,
      shortName: productName ? productName.split(' ')[0] : `${brandName} V3`,
      vendorId,
      productId,
    };
  } else if (
    name.includes('SU66') || name.includes('SU-66')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SU66,
      name: productName || DEVICE_PROFILES.SU66.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SU66.shortName,
      vendorId: vendorId || 0x1ca6,
      productId: productId || 0x300e,
    };
  } else if (
    (vendorId === 0x1ca6 && (productId === 0x300b || productId === 12299)) ||
    (vendorId === 7334 && (productId === 12299 || productId === 0x300b)) ||
    name.includes('AE61') || name.includes('AE61PRO') || name.includes('AE61-PRO')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.AE61_PRO,
      name: productName || DEVICE_PROFILES.AE61_PRO.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.AE61_PRO.shortName,
      vendorId: vendorId || 0x1ca6,
      productId: productId || 0x300b,
    };
  } else if (
    name.includes('AE64 PRO') || name.includes('AE64PRO') || name.includes('AE64-PRO')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.AE64_PRO,
      name: productName || DEVICE_PROFILES.AE64_PRO.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.AE64_PRO.shortName,
      vendorId: vendorId || 0x1ca6,
      productId: productId || 0x300c,
    };
  } else if (
    (vendorId === 0x1ca6 && (productId === 0x300d || productId === 12301)) ||
    (vendorId === 7334 && (productId === 12301 || productId === 0x300d)) ||
    name.includes('AE64') || name.includes('AE64MAX') || name.includes('AE64-MAX')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.AE64_MAX,
      name: productName || DEVICE_PROFILES.AE64_MAX.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.AE64_MAX.shortName,
      vendorId: vendorId || 0x1ca6,
      productId: productId || 0x300d,
    };
  } else if (
    (vendorId === 0x1ca6 && productId === 0x7a02) ||
    name.includes('DV63') ||
    name.includes('BOX63') ||
    name.includes('BOX-63') ||
    name.includes('ND63') ||
    name.includes('V64') ||
    name.includes('XS64')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.DV63,
      name: productName || DEVICE_PROFILES.DV63.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.DV63.shortName,
    };
  } else if (
    // ES68 家族及全部 68 配列磁轴 (ND68, F68, Mer68, DK68, DEEP68, Blue67)
    (vendorId === 0x1ca6 && productId === 0x1c24) ||
    (vendorId === 0x1a86 && productId === 0xfe81) ||
    name.includes('ES68') ||
    name.includes('ND68') ||
    name.includes('F68') ||
    name.includes('MER68') ||
    name.includes('MARS68') ||
    name.includes('DK68') ||
    name.includes('DEEP68') ||
    name.includes('BLUE67') ||
    /\bES68\s*DAWN\b/.test(name) ||
    /68\b/.test(name)
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.ES68,
      name: productName || DEVICE_PROFILES.ES68.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.ES68.shortName,
    };
  } else if (
    // 75 配列 (EG75, MARS75, MG75, DK75, RK75, 81/82/84键等)
    name.includes('75') || name.includes('81') || name.includes('82') || name.includes('84') ||
    name.includes('EG75') || name.includes('MARS75') || name.includes('MG75') || name.includes('DK75')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SPARKLINK_75,
      name: productName || DEVICE_PROFILES.SPARKLINK_75.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SPARKLINK_75.shortName,
    };
  } else if (
    // 87 配列 / TKL (ES87, X87, DK80, DEEP80, 87, 80, TKL 等)
    name.includes('87') || name.includes('80') || name.includes('TKL') ||
    name.includes('ES87') || name.includes('X87') || name.includes('DK80') || name.includes('DEEP80')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SPARKLINK_87,
      name: productName || DEVICE_PROFILES.SPARKLINK_87.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SPARKLINK_87.shortName,
    };
  } else if (
    // 98 配列 / 1800 紧凑 (98, 980, 100 等)
    name.includes('98') || name.includes('980') || name.includes('100')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SPARKLINK_98,
      name: productName || DEVICE_PROFILES.SPARKLINK_98.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SPARKLINK_98.shortName,
    };
  } else if (
    // 104 / 108 全尺寸
    name.includes('104') || name.includes('108')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SPARKLINK_104,
      name: productName || DEVICE_PROFILES.SPARKLINK_104.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SPARKLINK_104.shortName,
    };
  } else if (
    // 60 / 61 配列 (60, 61, META60, XS60, FLUX60, V60, Chase 61 等)
    name.includes('60') || name.includes('61') || name.includes('META60') || name.includes('FLUX60') || name.includes('CHASE 61')
  ) {
    baseProfile = {
      ...DEVICE_PROFILES.SPARKLINK_60,
      layout: '60keys',
      layoutCategory: '61keys',
      layoutName: '60%经典配列 (61键)',
      totalKeys: 61,
      totalKeyCount: 61,
      name: productName || DEVICE_PROFILES.SPARKLINK_60.name,
      shortName: productName ? productName.split(' ')[0] : DEVICE_PROFILES.SPARKLINK_60.shortName,
    };
  } else if (productName || typeof keyCount === 'number') {
    // 根据硬件按键数量做二次推断
    let fallbackLayout = '64keys';
    let fallbackLayoutName = '左移64配列';
    if (typeof keyCount === 'number') {
      if (keyCount <= 61) { fallbackLayout = '60keys'; fallbackLayoutName = '60%经典配列 (61键)'; }
      else if (keyCount <= 64) { fallbackLayout = '64keys'; fallbackLayoutName = '左移64配列'; }
      else if (keyCount <= 70) { fallbackLayout = '68keys'; fallbackLayoutName = '紧凑68配列'; }
      else if (keyCount <= 84) { fallbackLayout = '75keys'; fallbackLayoutName = '75%电竞配列'; }
      else if (keyCount <= 89) { fallbackLayout = '87keys'; fallbackLayoutName = '87键TKL配列'; }
      else if (keyCount <= 100) { fallbackLayout = '98keys'; fallbackLayoutName = '98紧凑小键盘'; }
      else { fallbackLayout = '104keys'; fallbackLayoutName = '104全尺寸配列'; }
    }
    const brand = catalogMeta ? catalogMeta.brand : null;
    const is61 = (keyCount && keyCount <= 61) || fallbackLayout === '60keys';
    baseProfile = {
      ...DEVICE_PROFILES.GENERIC_KEYBOARD,
      brand: brand || baseProfile.brand,
      name: productName || (brand ? `${brand} 客制化磁轴键盘` : (keyCount ? `${fallbackLayoutName} 磁轴键盘` : '星闪客制化磁轴键盘')),
      shortName: productName ? (productName.split(' ')[0] || productName) : (brand || '客制化键盘'),
      layout: fallbackLayout,
      layoutCategory: is61 ? '61keys' : undefined,
      layoutName: fallbackLayoutName,
      totalKeys: is61 ? 61 : (keyCount || undefined),
      totalKeyCount: is61 ? 61 : (keyCount || undefined),
      keyCount: keyCount || (is61 ? 61 : undefined),
      vendorId,
      productId,
    };
  } else if (catalogMeta) {
    const is61or60 = (catalogMeta.layout && (catalogMeta.layout.includes('60') || catalogMeta.layout.includes('61'))) ||
      (catalogMeta.layoutCategory && (catalogMeta.layoutCategory.includes('60') || catalogMeta.layoutCategory.includes('61'))) ||
      catalogMeta.totalKeyCount === 61 || catalogMeta.totalKeyCount === 60 ||
      (catalogMeta.productName && (catalogMeta.productName.includes('61') || catalogMeta.productName.includes('60')));
    const metaLayout = is61or60 ? '60keys' : (catalogMeta.layout || 'standard');
    const metaLayoutName = is61or60 ? '60%经典配列 (61键)' : (catalogMeta.layoutName || '标准配列');
    baseProfile = {
      ...DEVICE_PROFILES.GENERIC_KEYBOARD,
      brand: catalogMeta.brand || baseProfile.brand,
      name: catalogMeta.productName || (catalogMeta.brand ? `${catalogMeta.brand} 极速星闪键盘` : '星闪客制化磁轴键盘'),
      shortName: catalogMeta.brand || '星闪键盘',
      layout: metaLayout,
      layoutCategory: is61or60 ? '61keys' : undefined,
      layoutName: metaLayoutName,
      totalKeys: is61or60 ? 61 : (catalogMeta.totalKeyCount || undefined),
      totalKeyCount: is61or60 ? 61 : (catalogMeta.totalKeyCount || undefined),
      vendorId,
      productId,
    };
  }

  // 2. 如果硬件底层 SDK 上报了真实的 RateOfReturnList，动态对齐硬件支持档位
  let effectiveSupportedRates = [...(Array.isArray(baseProfile?.supportedPollingRates) ? baseProfile.supportedPollingRates : [1000, 2000, 4000, 8000])];
  let effectiveMaxRate = typeof baseProfile?.maxPollingRate === 'number' ? baseProfile.maxPollingRate : 8000;

  if (Array.isArray(sdkRates) && sdkRates.length > 0) {
    const parsedHzList = sdkRates
      .map((k) => (typeof k === 'number' ? k : RATE_SDK_TO_HZ[k]))
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (parsedHzList.length > 0) {
      effectiveSupportedRates = parsedHzList;
      effectiveMaxRate = Math.max(...parsedHzList);
    }
  }

  // 严格安全边界：键盘主控绝不超过其已知的硬件安全上限
  // 默认 8000Hz（星闪 SDK 当前开放上限）；ES68 等 32K 方案通过 hardRateCeiling 单独放开
  const hardCeiling = baseProfile.hardRateCeiling || 8000;
  if (baseProfile.type === 'keyboard' && effectiveMaxRate > hardCeiling) {
    effectiveMaxRate = hardCeiling;
    effectiveSupportedRates = effectiveSupportedRates.filter((r) => r <= hardCeiling);
  }

  // 3. 构建适合前端展示的可用回报率选项
  const availableRateOptions = ALL_POLLING_RATE_METADATA
    .filter((item) => effectiveSupportedRates.includes(item.val) && item.val <= effectiveMaxRate)
    .map((item) => ({
      ...item,
      isMaxTier: item.val === effectiveMaxRate,
      labelFormatted: item.val >= 1000 ? `${item.val / 1000}k` : `${item.val}Hz`,
    }));

  // 严格库存隔离：若设备为江湾系列 PCB 或 DV63 等成品键盘，保障其专属轴体库挂载
  if ((name.includes('江湾') || name.includes('EVERGLIDE')) && !baseProfile.supportedSwitches) {
    baseProfile.supportedSwitches = JIANGWAN_OFFICIAL_SWITCHES;
    baseProfile.isolateSwitches = true;
  }

  return {
    ...baseProfile,
    maxPollingRate: effectiveMaxRate,
    supportedPollingRates: effectiveSupportedRates,
    availableRateOptions,
  };
}

/**
 * 动态获取当前键盘底灯/装饰灯规格 (支持不同机型不同底灯数量自动检测与切换)
 * 优先级:
 * 1. 硬件底层 SDK 真实上报的 lightingArea (count, rows, cols)
 * 2. profile 明确配置的 decorateLighting 或 stripLighting (如 AE64-MAX 34颗 [17, 17], ES68 26颗 [13, 13])
 * 3. customDeviceRegistry 或官方预设库中收录的对应型号拓扑
 * 4. 型号名称特征匹配 (AE64 -> 34颗, ES68 -> 26颗)
 * 5. 若设备不支持底灯，返回 count: 0 (自动隐藏底灯调节/预览)
 */
export function getDecorateLightingConfig(profile, lightingArea) {
  // 1. 如果硬件底层 SDK 明确上报了装饰灯区参数且有真实数量，以硬件真实上报为主
  if (lightingArea && typeof lightingArea.count === 'number' && lightingArea.count > 0) {
    const count = lightingArea.count;
    const rows = lightingArea.rows || (count > 16 ? 2 : 1);
    const cols = lightingArea.cols || Math.ceil(count / rows);
    let rowLayout;
    if (rows === 1) {
      rowLayout = [count];
    } else {
      const r1 = Math.min(cols, Math.ceil(count / 2));
      const r2 = count - r1;
      rowLayout = [r1, r2];
    }
    return {
      count,
      rows,
      cols: Math.max(rowLayout[0], cols),
      rowLayout,
      name: lightingArea.name || '装饰灯1',
      isStripTube: true,
      source: 'hardware_probe',
    };
  }

  // 2. 根据 profile 档案中显式定义的 decorateLighting
  if (profile?.decorateLighting && typeof profile.decorateLighting === 'object' && profile.decorateLighting.count > 0) {
    const count = profile.decorateLighting.count;
    const rows = profile.decorateLighting.rows || (count > 16 ? 2 : 1);
    const cols = profile.decorateLighting.cols || Math.ceil(count / rows);
    const rowLayout = profile.decorateLighting.rowLayout || (rows === 1 ? [count] : [Math.ceil(count / 2), count - Math.ceil(count / 2)]);
    return {
      ...profile.decorateLighting,
      count,
      rows,
      cols,
      rowLayout,
      name: profile.decorateLighting.name || '装饰灯1',
      isStripTube: true,
      source: 'profile_config',
    };
  }

  // 3. 根据 profile 档案中显式定义的 stripLighting
  if (profile?.stripLighting && typeof profile.stripLighting === 'object' && profile.stripLighting.count > 0) {
    const count = profile.stripLighting.count;
    const rows = profile.stripLighting.rows || (count > 16 ? 2 : 1);
    const cols = profile.stripLighting.cols || Math.ceil(count / rows);
    const rowLayout = rows === 1 ? [count] : [Math.ceil(count / 2), count - Math.ceil(count / 2)];
    return {
      count,
      rows,
      cols,
      rowLayout,
      name: '装饰灯1',
      isStripTube: true,
      source: 'profile_strip',
    };
  }

  // 4. 从 customDeviceRegistry 查询该设备档案
  if (customDeviceRegistry && (profile?.vendorId || profile?.productId)) {
    const regProfile = customDeviceRegistry.getProfile(profile.vendorId, profile.productId);
    if (regProfile) {
      if (regProfile.decorateLighting && regProfile.decorateLighting.count > 0) {
        const count = regProfile.decorateLighting.count;
        const rows = regProfile.decorateLighting.rows || (count > 16 ? 2 : 1);
        const cols = regProfile.decorateLighting.cols || Math.ceil(count / rows);
        return {
          ...regProfile.decorateLighting,
          count,
          rows,
          cols,
          rowLayout: regProfile.decorateLighting.rowLayout || (rows === 1 ? [count] : [Math.ceil(count / 2), count - Math.ceil(count / 2)]),
          name: regProfile.decorateLighting.name || '装饰灯1',
          isStripTube: true,
          source: 'registry_profile',
        };
      }
      if (regProfile.stripLighting && regProfile.stripLighting.count > 0) {
        const count = regProfile.stripLighting.count;
        const rows = regProfile.stripLighting.rows || (count > 16 ? 2 : 1);
        const cols = regProfile.stripLighting.cols || Math.ceil(count / rows);
        return {
          count,
          rows,
          cols,
          rowLayout: rows === 1 ? [count] : [Math.ceil(count / 2), count - Math.ceil(count / 2)],
          name: '装饰灯1',
          isStripTube: true,
          source: 'registry_strip',
        };
      }
    }
  }

  // 5. 型号名称特征精准匹配
  const modelName = (profile?.model || profile?.name || profile?.shortName || profile?.id || '').toUpperCase();
  
  // AE64 系列 (如 AE64-MAX): 物理底壳环形灯带标准为 34 颗 LED (首行 17 颗 + 次行 17 颗)
  if (modelName.includes('AE64')) {
    return {
      count: 34,
      rows: 2,
      cols: 17,
      rowLayout: [17, 17],
      name: '装饰灯1',
      isStripTube: true,
      source: 'sku_ae64',
    };
  }

  // ES68 系列 (如 前行者 ES68 破晓): 贯穿式 ARGB 漫反射灯带标准为 26 颗 LED (2 行 x 13 列)
  if (modelName.includes('ES68')) {
    return {
      count: 26,
      rows: 2,
      cols: 13,
      rowLayout: [13, 13],
      name: '装饰灯1',
      isStripTube: true,
      source: 'sku_es68',
    };
  }

  // 6. 若设备明确不支持底灯，返回 count: 0 (自动不开放底灯调节)
  const hasDecoFeature = !!profile?.features?.decorateLighting || !!profile?.features?.stripLighting;
  if (!hasDecoFeature) {
    return {
      count: 0,
      rows: 0,
      cols: 0,
      rowLayout: [],
      name: '无底灯',
      isStripTube: false,
      source: 'none',
    };
  }

  // 7. 通用兜底 (34 颗 [17, 17])
  return {
    count: 34,
    rows: 2,
    cols: 17,
    rowLayout: [17, 17],
    name: '装饰灯1',
    isStripTube: true,
    source: 'fallback',
  };
}


import KeyboardSDK from '@sparklinkplayjoy/sdk-keyboard-v2';
import {
  SPARKLINK_DEVICE_LIST,
  SPARKLINK_DEVICE_KEYS,
  SPARKLINK_VID_SET,
} from './constants/sparklinkDevices';
import {
  SPARKLINK_PRIMARY_VIDS,
  SPARKLINK_USAGE_PAGE,
  SPARKLINK_USAGE,
  SPARKLINK_HID_FILTERS,
  isOfficialSparklinkDevice,
  isSupportedSparklinkDevice,
  RATE_HZ_TO_SDK,
  RATE_SDK_TO_HZ,
} from './constants/deviceProfiles';
import cachedAxes from './constants/officialAxisCache.json';
import { PRIMARY_AXES } from './services/axisService';

// 官方标准 19 种硬件预设灯效模式 + L20 自定义涂色 (精准对齐官方逆向 Gi 协议)
export const PRESET_LIGHTING_EFFECTS = [
  { id: 1, mode: 0, label: 'L1', name: '常亮模式', desc: '全键纯色恒亮', supportRainbow: false },
  { id: 2, mode: 1, label: 'L2', name: '随波逐流', desc: '七彩波浪横向涌动', supportRainbow: true },
  { id: 3, mode: 2, label: 'L3', name: '潮起潮落', desc: '色彩平缓起伏呼吸', supportRainbow: true },
  { id: 4, mode: 3, label: 'L4', name: '涟漪清漾', desc: '按压以同心圆向外扩散', supportRainbow: true },
  { id: 5, mode: 4, label: 'L5', name: '旋转风暴', desc: '光影如风暴般回旋', supportRainbow: true },
  { id: 6, mode: 5, label: 'L6', name: '幸运彩虹', desc: '经典全彩横向流动', supportRainbow: true },
  { id: 7, mode: 6, label: 'L7', name: '彩色漩涡', desc: '光环如漩涡流转', supportRainbow: true },
  { id: 8, mode: 7, label: 'L8', name: '闪耀彩虹', desc: '晶莹闪烁耀眼光斑', supportRainbow: true },
  { id: 9, mode: 8, label: 'L9', name: '暗香浮动', desc: '柔和幽光若隐若现', supportRainbow: true },
  { id: 10, mode: 9, label: 'L10', name: '九宫格', desc: '方块矩阵交替变幻', supportRainbow: true },
  { id: 11, mode: 10, label: 'L11', name: '川流不息', desc: '光彩如溪流奔涌不息', supportRainbow: true },
  { id: 12, mode: 11, label: 'L12', name: '正弦曲线', desc: '平滑曲线波动起伏', supportRainbow: true },
  { id: 13, mode: 12, label: 'L13', name: '霓虹诗篇', desc: '错落有致的多彩光带', supportRainbow: true },
  { id: 14, mode: 13, label: 'L14', name: '百花争艳', desc: '按键如繁花绽放盛开', supportRainbow: true },
  { id: 15, mode: 14, label: 'L15', name: '繁星点点', desc: '数码雨滴与随机星芒', supportRainbow: true },
  { id: 16, mode: 15, label: 'L16', name: '幻彩流光', desc: '柔和多色渐变过渡', supportRainbow: true },
  { id: 17, mode: 17, label: 'L17', name: '踏雪寻梅', desc: '点按即亮唤醒光点', supportRainbow: true },
  { id: 18, mode: 18, label: 'L18', name: '峰回路转', desc: '双向激光光波激荡', supportRainbow: true },
  { id: 19, mode: 19, label: 'L19', name: '水波荡漾', desc: '轻触泛起层层水花', supportRainbow: true },
  { id: 20, mode: 20, label: 'L20', name: '自定义涂色', desc: '全键单键自定义独立涂色', supportRainbow: false },
];

// 官方灯带/底灯 4 种专属硬件灯效模式
export const STRIP_LIGHTING_EFFECTS = [
  { id: 1, mode: 0, label: 'L1', name: '常亮模式', desc: '全灯带纯色恒亮', supportRainbow: false },
  { id: 2, mode: 1, label: 'L2', name: '随波逐流', desc: '七彩波浪横向涌动', supportRainbow: true },
  { id: 3, mode: 7, label: 'L3', name: '闪耀彩虹', desc: '晶莹闪烁耀眼光斑', supportRainbow: true },
  { id: 4, mode: 15, label: 'L4', name: '流光漫延', desc: '柔和多色渐变过渡', supportRainbow: true },
];

export {
  KeyboardSDK,
  SPARKLINK_DEVICE_LIST,
  SPARKLINK_DEVICE_KEYS,
  SPARKLINK_VID_SET,
  SPARKLINK_PRIMARY_VIDS,
  SPARKLINK_USAGE_PAGE,
  SPARKLINK_USAGE,
  SPARKLINK_HID_FILTERS,
  isOfficialSparklinkDevice,
  isSupportedSparklinkDevice,
  RATE_HZ_TO_SDK,
  RATE_SDK_TO_HZ,
  cachedAxes,
  PRIMARY_AXES,
};

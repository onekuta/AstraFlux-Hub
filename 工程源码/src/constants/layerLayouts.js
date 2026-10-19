// 键盘 4 层配置体系 (对齐前行者 EWEADN / 星闪官方协议)
// Layer 0: Win Base (win_default)
// Layer 1: Win Fn (win_fn) - 对齐截图 media_1791893825095_8fbe1eb7.png
// Layer 2: Mac Base (mac_default) - 对齐截图 media_1791893815976_3b3cf5d9.png
// Layer 3: Mac Fn (mac_fn)

export const LAYER_DEFINITIONS = [
  { id: 'win_default', label: 'Win Base', layerIndex: 0, desc: 'Windows 基础按键层' },
  { id: 'win_fn', label: 'Win Fn', layerIndex: 1, desc: 'Windows Fn 扩展组合层' },
  { id: 'mac_default', label: 'Mac Base', layerIndex: 2, desc: 'macOS 基础按键层 (Option ⌥ / Command ⌘)' },
  { id: 'mac_fn', label: 'Mac Fn', layerIndex: 3, desc: 'macOS Fn 多媒体扩展层' },
];

// Mac Base 层默认修饰键映射 (与 Win Base 的差异，对齐截屏 media_1791893815976_3b3cf5d9.png)
export const MAC_BASE_DEFAULTS = {
  ControlLeft: { label: 'L-Ctrl', isSwapped: true },
  MetaLeft: { label: 'L-Alt', isSwapped: true }, // Option ⌥ (粉橙色换位按键)
  AltLeft: { label: 'Win', isSwapped: false },    // Command ⌘
  AltRight: { label: 'R-Win', isSwapped: false },  // Command ⌘
  ContextMenu: { label: 'R-Ctrl', isSwapped: false },
};

// Win Fn 层出厂默认映射 (完全还原截屏 media_1791893825095_8fbe1eb7.png)
export const WIN_FN_DEFAULTS = {
  // 数字行 -> F1 ~ F12, 灯效, PrtScr
  Backquote: { label: '` ~' },
  Digit1: { label: 'F1', id: 'F1' },
  Digit2: { label: 'F2', id: 'F2' },
  Digit3: { label: 'F3', id: 'F3' },
  Digit4: { label: 'F4', id: 'F4' },
  Digit5: { label: 'F5', id: 'F5' },
  Digit6: { label: 'F6', id: 'F6' },
  Digit7: { label: 'F7', id: 'F7' },
  Digit8: { label: 'F8', id: 'F8' },
  Digit9: { label: 'F9', id: 'F9' },
  Digit0: { label: 'F10', id: 'F10' },
  Minus: { label: 'F11', id: 'F11' },
  Equal: { label: 'F12', id: 'F12' },
  Backspace: { label: '灯效开关', id: 'LightToggle', icon: 'LightToggle' },
  Delete: { label: 'PrtScr', id: 'PrintScreen' },
  Home: { label: 'PrtScr', id: 'PrintScreen' },

  // QWERTY 行
  Tab: { label: 'Tab' },
  KeyQ: { label: '▵', isPassThrough: true },
  KeyW: { label: '▵', isPassThrough: true },
  KeyE: { label: '▵', isPassThrough: true },
  KeyR: { label: '▵', isPassThrough: true },
  KeyT: { label: '▵', isPassThrough: true },
  KeyY: { label: '▵', isPassThrough: true },
  KeyU: { label: '▵', isPassThrough: true },
  KeyI: { label: '▵', isPassThrough: true },
  KeyO: { label: '▵', isPassThrough: true },
  KeyP: { label: '背光亮度-', id: 'LightBrightDown', icon: 'LightBrightDown' },
  BracketLeft: { label: '速度-', id: 'LightSpeedDown', icon: 'LightSpeedDown' },
  BracketRight: { label: '速度+', id: 'LightSpeedUp', icon: 'LightSpeedUp' },
  Backslash: { label: '模式顺切', id: 'LightModeNext', icon: 'LightModeNext' },
  End: { label: 'Insert', id: 'Insert' },

  // ASDF 行
  CapsLock: { label: 'Caps' },
  KeyA: { label: '我的电脑', id: 'MyComputer', icon: 'MyComputer' },
  KeyS: { label: 'Win模式', id: 'SystemWin', icon: 'SystemWin' },
  KeyD: { label: 'Mac模式', id: 'SystemMac', icon: 'SystemMac' },
  KeyF: { label: '▵', isPassThrough: true },
  KeyG: { label: '▵', isPassThrough: true },
  KeyH: { label: '▵', isPassThrough: true },
  KeyJ: { label: '▵', isPassThrough: true },
  KeyK: { label: '▵', isPassThrough: true },
  KeyL: { label: '▵', isPassThrough: true },
  Semicolon: { label: '▵', isPassThrough: true },
  Quote: { label: '▵', isPassThrough: true },
  Enter: { label: 'Enter' },
  PageUp: { label: 'ScrLk', id: 'ScrollLock' },

  // ZXCV 行
  ShiftLeft: { label: 'Shift' },
  KeyZ: { label: '▵', isPassThrough: true },
  KeyX: { label: '▵', isPassThrough: true },
  KeyC: { label: '▵', isPassThrough: true },
  KeyV: { label: '▵', isPassThrough: true },
  KeyB: { label: '▵', isPassThrough: true },
  KeyN: { label: '▵', isPassThrough: true },
  KeyM: { label: '▵', isPassThrough: true },
  Comma: { label: '▵', isPassThrough: true },
  Period: { label: '▵', isPassThrough: true },
  Slash: { label: '▵', isPassThrough: true },
  ShiftRight: { label: 'Shift' },
  ArrowUp: { label: '背光亮度+', id: 'LightBrightUp', icon: 'LightBrightUp' },
  PageDown: { label: 'Pause', id: 'Pause' },

  // 底行 (无特殊Fn绑定的键显示 ▵ 透传)
  ControlLeft: { label: '▵', isPassThrough: true },
  MetaLeft: { label: 'WinLock', id: 'WinLock' },
  AltLeft: { label: '▵', isPassThrough: true },
  Space: { label: '▵', isPassThrough: true },
  AltRight: { label: '▵', isPassThrough: true },
  Fn: { label: '▵', isPassThrough: true },
  ControlRight: { label: '▵', isPassThrough: true },
  ArrowLeft: { label: '色彩切换', id: 'LightColorCycle', icon: 'LightColorCycle' },
  ArrowDown: { label: '背光亮度-', id: 'LightBrightDown', icon: 'LightBrightDown' },
  ArrowRight: { label: '流动速度+', id: 'LightSpeedUp', icon: 'LightSpeedUp' },
};

// Mac Fn 层出厂默认映射 (对齐 Mac 原生多媒体系统键)
export const MAC_FN_DEFAULTS = {
  Backquote: { label: '` ~' },
  Digit1: { label: '亮度 -', id: 'BrightnessDown' },
  Digit2: { label: '亮度 +', id: 'BrightnessUp' },
  Digit3: { label: '任务控制', id: 'TaskView' },
  Digit4: { label: '启动台', id: 'Calculator' },
  Digit5: { label: 'F5', id: 'F5' },
  Digit6: { label: 'F6', id: 'F6' },
  Digit7: { label: '上一曲', id: 'MediaPrev' },
  Digit8: { label: '播/暂', id: 'MediaPlayPause' },
  Digit9: { label: '下一曲', id: 'MediaNext' },
  Digit0: { label: '静音', id: 'VolumeMute' },
  Minus: { label: '音量 -', id: 'VolumeDown' },
  Equal: { label: '音量 +', id: 'VolumeUp' },
  Backspace: { label: '灯效开关', id: 'LightToggle' },
  Delete: { label: 'PrtScr', id: 'PrintScreen' },
  Home: { label: 'PrtScr', id: 'PrintScreen' },

  Tab: { label: 'Tab' },
  KeyQ: { label: '▵', isPassThrough: true },
  KeyW: { label: '▵', isPassThrough: true },
  KeyE: { label: '▵', isPassThrough: true },
  KeyR: { label: '▵', isPassThrough: true },
  KeyT: { label: '▵', isPassThrough: true },
  KeyY: { label: '▵', isPassThrough: true },
  KeyU: { label: '▵', isPassThrough: true },
  KeyI: { label: '▵', isPassThrough: true },
  KeyO: { label: '▵', isPassThrough: true },
  KeyP: { label: '背光亮度-', id: 'LightBrightDown' },
  BracketLeft: { label: '速度-', id: 'LightSpeedDown' },
  BracketRight: { label: '速度+', id: 'LightSpeedUp' },
  Backslash: { label: '模式顺切', id: 'LightModeNext' },
  End: { label: 'Insert', id: 'Insert' },

  CapsLock: { label: 'Caps' },
  KeyA: { label: '我的电脑', id: 'MyComputer' },
  KeyS: { label: 'Win模式', id: 'SystemWin' },
  KeyD: { label: 'Mac模式', id: 'SystemMac' },
  KeyF: { label: '▵', isPassThrough: true },
  KeyG: { label: '▵', isPassThrough: true },
  KeyH: { label: '▵', isPassThrough: true },
  KeyJ: { label: '▵', isPassThrough: true },
  KeyK: { label: '▵', isPassThrough: true },
  KeyL: { label: '▵', isPassThrough: true },
  Semicolon: { label: '▵', isPassThrough: true },
  Quote: { label: '▵', isPassThrough: true },
  Enter: { label: 'Enter' },
  PageUp: { label: 'ScrLk', id: 'ScrollLock' },

  ShiftLeft: { label: 'Shift' },
  KeyZ: { label: '▵', isPassThrough: true },
  KeyX: { label: '▵', isPassThrough: true },
  KeyC: { label: '▵', isPassThrough: true },
  KeyV: { label: '▵', isPassThrough: true },
  KeyB: { label: '▵', isPassThrough: true },
  KeyN: { label: '▵', isPassThrough: true },
  KeyM: { label: '▵', isPassThrough: true },
  Comma: { label: '▵', isPassThrough: true },
  Period: { label: '▵', isPassThrough: true },
  Slash: { label: '▵', isPassThrough: true },
  ShiftRight: { label: 'Shift' },
  ArrowUp: { label: '背光亮度+', id: 'LightBrightUp' },
  PageDown: { label: 'Pause', id: 'Pause' },

  ControlLeft: { label: '▵', isPassThrough: true },
  MetaLeft: { label: 'WinLock', id: 'WinLock' },
  AltLeft: { label: '▵', isPassThrough: true },
  Space: { label: '▵', isPassThrough: true },
  AltRight: { label: '▵', isPassThrough: true },
  Fn: { label: '▵', isPassThrough: true },
  ControlRight: { label: '▵', isPassThrough: true },
  ArrowLeft: { label: '色彩切换', id: 'LightColorCycle' },
  ArrowDown: { label: '背光亮度-', id: 'LightBrightDown' },
  ArrowRight: { label: '流动速度+', id: 'LightSpeedUp' },
};

export const LAYER_DEFAULT_MAPPINGS = {
  win_default: {}, // 基础层使用物理键自身 label
  win_fn: WIN_FN_DEFAULTS,
  mac_default: MAC_BASE_DEFAULTS,
  mac_fn: MAC_FN_DEFAULTS,
};

/**
 * 获取指定层中特定按键的生效配置 (自定义改键 > 该层出厂预设 > 物理基础键)
 */
export function resolveKeyForLayer(activeLayer, keyObj, customKeyMappings = {}) {
  const userMapped = customKeyMappings[activeLayer]?.[keyObj.id];
  if (userMapped) {
    return {
      label: userMapped.label,
      isReplaced: true,
      isSwapped: false,
      isPassThrough: false,
      rawItem: userMapped,
    };
  }

  const layerDefaults = LAYER_DEFAULT_MAPPINGS[activeLayer] || {};
  const defaultEntry = layerDefaults[keyObj.id];

  if (defaultEntry) {
    return {
      label: defaultEntry.label,
      isReplaced: false,
      isSwapped: !!defaultEntry.isSwapped,
      isPassThrough: !!defaultEntry.isPassThrough,
      rawItem: defaultEntry,
    };
  }

  // 基础兜底 (Win Base 或 未特别定义的物理键)
  return {
    label: keyObj.label,
    isReplaced: false,
    isSwapped: false,
    isPassThrough: false,
    rawItem: keyObj,
  };
}

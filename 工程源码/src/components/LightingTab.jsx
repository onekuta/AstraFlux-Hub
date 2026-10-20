import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sun, 
  Palette, 
  Sparkles, 
  Sliders, 
  Play, 
  RotateCcw, 
  Check, 
  CheckCircle2,
  Layers,
  Link2,
  Unlink2,
} from 'lucide-react';
import { keyboardService } from '../services/keyboardService';
import { useToast } from './ToastProvider';
import { OFFICIAL_LIGHTING_ICONS } from '../constants/officialLightingIcons';

// 官方标准 19 种硬件预设灯效模式 (精准对齐官方逆向 Gi 协议: mode 0 ~ 18，L1 ~ L19)
export const SPARK_LIGHT_MODES = [
  { id: 1, mode: 0, label: 'L1', name: '常亮模式', desc: '全键纯色恒亮/全彩光谱', supportRainbow: true },
  { id: 2, mode: 1, label: 'L2', name: '随波逐流', desc: '七彩波浪横向涌动', supportRainbow: true },
  { id: 3, mode: 2, label: 'L3', name: '往下渐变', desc: '整行同色自上向下平滑渐变流淌', supportRainbow: true },
  { id: 4, mode: 3, label: 'L4', name: '球形展开', desc: '球形光波自中间向外扩散展开', supportRainbow: true },
  { id: 5, mode: 4, label: 'L5', name: '棒棒糖旋转', desc: '螺旋弧线如波板糖旋转回旋', supportRainbow: true },
  { id: 6, mode: 5, label: 'L6', name: '炫彩旋转', desc: '全彩光谱围绕键盘中心绚丽旋转', supportRainbow: true },
  { id: 7, mode: 6, label: 'L7', name: '中间扩展', desc: '从键盘边缘中间对称向外扩展推移', supportRainbow: true },
  { id: 8, mode: 7, label: 'L8', name: '繁星点点', desc: '多角星芒独立闪烁', supportRainbow: true },
  { id: 9, mode: 8, label: 'L9', name: '雨滴滑落', desc: '数码雨滴错落流星飘落', supportRainbow: true },
  { id: 10, mode: 9, label: 'L10', name: '左右色块', desc: '左右往复移动到尽头切换色块', supportRainbow: true },
  { id: 11, mode: 10, label: 'L11', name: '对角穿梭', desc: '斜向色块交错奔流', supportRainbow: true },
  { id: 12, mode: 11, label: 'L12', name: '光之靶心', desc: '同心圆同轴向外扩散', supportRainbow: true },
  { id: 13, mode: 12, label: 'L13', name: '旋涡星系', desc: '气旋漩涡高速打转流转', supportRainbow: true },
  { id: 14, mode: 13, label: 'L14', name: '交叉射线', desc: '十字星芒脉冲绽放', supportRainbow: true },
  { id: 15, mode: 14, label: 'L15', name: '朝阳初升', desc: '穹顶光弧自底向上流转', supportRainbow: true },
  { id: 16, mode: 15, label: 'L16', name: '灵动小球', desc: '小球随机跑动穿梭变换色彩', supportRainbow: true },
  { id: 17, mode: 16, label: 'L17', name: '水波涟漪', desc: '按压同心圆水波波及扩散', supportRainbow: true },
  { id: 18, mode: 17, label: 'L18', name: '激光横扫', desc: '按压向左右两侧横向极光扩展', supportRainbow: true },
  { id: 19, mode: 18, label: 'L19', name: '踏雪无痕', desc: '全亮触发单点熄灭渐隐恢复', supportRainbow: true },
];

// 官方灯带/底灯 专属硬件灯效模式 (精准对齐官方驱动 & 星闪底层协议：mode 0, 1, 2, 3)
export const DECORATE_LIGHT_MODES = [
  { id: 1, mode: 0, label: 'L1', name: '常亮模式', desc: '全灯纯色恒亮/全彩光谱', supportRainbow: true },
  { id: 2, mode: 1, label: 'L2', name: '随波逐流', desc: '七彩波浪横向涌动', supportRainbow: true },
  { id: 3, mode: 2, label: 'L3', name: '呼吸模式', desc: '全灯带柔和呼吸起伏', supportRainbow: true },
  { id: 4, mode: 3, label: 'L4', name: '流光漫延', desc: '柔和多色渐变过渡', supportRainbow: true },
];

// 官方 8 颗标准快捷光效调色板 (0=彩虹不可更改, 1~7=常驻预设颜色可随时由左侧调色板微调定制)
export const DEFAULT_PRESET_COLOR_SWATCHES = [
  { index: 0, name: '炫彩彩虹', color: 'linear-gradient(135deg, #f43f5e, #fbbf24, #10b981, #06b6d4, #8b5cf6)', hex: '', isRainbow: true },
  { index: 1, name: '预设红', color: '#FF3D3D', hex: '#FF3D3D' },
  { index: 2, name: '预设黄', color: '#FFD42B', hex: '#FFD42B' },
  { index: 3, name: '预设绿', color: '#2EE944', hex: '#2EE944' },
  { index: 4, name: '预设青', color: '#00D8E8', hex: '#00D8E8' },
  { index: 5, name: '预设蓝', color: '#2558FF', hex: '#2558FF' },
  { index: 6, name: '预设紫', color: '#E83FD7', hex: '#E83FD7' },
  { index: 7, name: '预设白', color: '#E8E8E8', hex: '#E8E8E8' },
];
export const PRESET_COLOR_SWATCHES = DEFAULT_PRESET_COLOR_SWATCHES;


// 色彩空间转换算法：HSV -> RGB
function hsvToRgb(h, s, v) {
  let r, g, b;
  const i = Math.floor((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// 色彩空间转换算法：RGB -> HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, v };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToHsv(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 1, v: 1 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export default function LightingTab({ 
  currentMode: propMode,
  onModeChange,
  selectStaticColor: propSelectStaticColor = 0,
  onSelectStaticColorChange,
  brightness: propBrightness,
  onBrightnessChange,
  speed: propSpeed,
  onSpeedChange,
  lightEnabled: propLightEnabled,
  onLightEnabledChange,
  onCustomColorChange, 
  customKeyColors = {},
  onClearCustomKeyColors,
  lightingAreas = [],
  isDoubleLight = false,
  topLightEnabled = true,
  onTopLightEnabledChange,
  bottomLightEnabled = true,
  onBottomLightEnabledChange,
  lightingLinked = true,
  onLightingLinkedChange,
  decorateColors = [],
  onDecorateColorsChange,
  onSyncDecorate,
  spaceMultiLampEnabled = true,
  onToggleSpaceMultiLamp,
  onSetSpaceLampColor,
  onClearSpaceLamp,
  onSetAllSpaceLamps,
  onRainbowSpaceLamps,
  onClearAllSpaceLamps,
  activeLightingArea = 'keyboard',
  onActiveLightingAreaChange,
  stripMode = 1,
  onStripModeChange,
  stripBrightness = 100,
  onStripBrightnessChange,
  stripSpeed = 50,
  onStripSpeedChange,
  stripDirection = 0,
  onStripDirectionChange,
  lightingDirection = 0,
  onLightingDirectionChange,
  stripLightEnabled = true,
  onStripLightEnabledChange,
  stripStaticColor = 0,
  onStripStaticColorChange,
  onSetAllStrip,
  onRainbowStrip,
  onClearAllStrip,
  decorateConfig = null,
  hasDecorateLighting = true,
  onApplyAllKeyColor,
  bottomLedCount = 34,
  isLiveHwLightingSync = false,
  onToggleLiveHwLightingSync,
  isConnected = false,
}) {
  const { addToast } = useToast();
  const [activeArea, setActiveArea] = useState('Keyboard'); // 'Keyboard' | 'Decorate'
  const isDecorateArea = (activeLightingArea && activeLightingArea !== 'keyboard') || activeArea === 'Decorate';
  const currentStripModeItem = DECORATE_LIGHT_MODES.find(m => m.mode === stripMode) || DECORATE_LIGHT_MODES[1];

  const [localLightEnabled, setLocalLightEnabled] = useState(true);
  const [localMode, setLocalMode] = useState(1); // 默认 mode: 1 (随波逐流)
  const [optimisticMode, setOptimisticMode] = useState(null);
  const [localSelectStaticColor, setLocalSelectStaticColor] = useState(0); // 默认 0 (炫彩彩虹)
  const [localBrightness, setLocalBrightness] = useState(75);
  const [localSpeed, setLocalSpeed] = useState(50);
  const [localDirection, setLocalDirection] = useState(0);

  useEffect(() => {
    setOptimisticMode(null);
  }, [propMode]);

  const currentMode = optimisticMode !== null ? optimisticMode : (propMode !== undefined ? propMode : localMode);
  const selectStaticColor = propSelectStaticColor !== undefined ? propSelectStaticColor : localSelectStaticColor;
  const brightness = propBrightness !== undefined ? propBrightness : localBrightness;
  const speed = propSpeed !== undefined ? propSpeed : localSpeed;
  const currentDirection = lightingDirection !== undefined ? lightingDirection : localDirection;
  const lightEnabled = propLightEnabled !== undefined ? propLightEnabled : localLightEnabled;

  // 找到当前模式的元数据
  const currentModeItem = SPARK_LIGHT_MODES.find(m => m.mode === currentMode) || SPARK_LIGHT_MODES[1];

  // HSV / RGB / HEX 颜色状态联动
  const [hsv, setHsv] = useState({ h: 0, s: 0.85, v: 0.95 });
  const [rgb, setRgb] = useState({ r: 255, g: 61, b: 61 });
  const [hexColor, setHexColor] = useState('#FF3D3D');

  const paletteRef = useRef(null);
  const hueBarRef = useRef(null);
  const isDraggingPalette = useRef(false);
  const isDraggingHue = useRef(false);

  // 初始化通知
  useEffect(() => {
    if (onCustomColorChange) {
      onCustomColorChange(hexColor);
    }
  }, []);

  // 8 颗标准快捷调色板 (1~7 纯色支持左侧调色板微调定制与持久化)
  const [presetSwatches, setPresetSwatches] = useState(() => {
    try {
      const saved = localStorage.getItem('sparklink_custom_preset_swatches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_PRESET_COLOR_SWATCHES;
  });

  const lamp = isDoubleLight ? 'DoubleLighting' : 'SingleLighting';

  // 模式色彩记忆机制：记录用户为每个模式单独选择的色彩偏好。未记录的模式一律默认进入炫彩模式 (0)
  const [modeColorRecords, setModeColorRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('sparklink_lighting_mode_color_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  const [stripModeColorRecords, setStripModeColorRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('sparklink_strip_mode_color_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  const saveModeRecord = useCallback((mode, colorIdx, hex) => {
    setModeColorRecords((prev) => {
      const next = { ...prev, [mode]: { colorIdx, hex } };
      try {
        localStorage.setItem('sparklink_lighting_mode_color_records', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const saveStripModeRecord = useCallback((mode, colorIdx, hex) => {
    setStripModeColorRecords((prev) => {
      const next = { ...prev, [mode]: { colorIdx, hex } };
      try {
        localStorage.setItem('sparklink_strip_mode_color_records', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 当用户在左侧调色板微调颜色时，若当前选中的是 1~7 纯色预设，实时更新该预设圆圈的颜色并下发硬件
  const syncColorToActivePreset = useCallback((newHex, newRgb) => {
    const activeIdx = isDecorateArea ? stripStaticColor : selectStaticColor;

    if (activeIdx >= 1 && activeIdx <= 7) {
      const nextSwatches = presetSwatches.map(s => s.index === activeIdx ? { ...s, color: newHex, hex: newHex } : s);
      setPresetSwatches(nextSwatches);
      try {
        localStorage.setItem('sparklink_custom_preset_swatches', JSON.stringify(nextSwatches));
      } catch {}

      if (isDecorateArea) {
        saveStripModeRecord(stripMode, activeIdx, newHex);
      } else {
        saveModeRecord(currentMode, activeIdx, newHex);
      }

      if (keyboardService.connected) {
        const area = isDecorateArea 
          ? (activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1') 
          : (activeArea === 'Keyboard' ? 'Keyboard' : 'Decorate1');
        const mode = isDecorateArea ? stripMode : currentMode;
        const bri = isDecorateArea ? stripBrightness : brightness;
        const spd = isDecorateArea ? stripSpeed : speed;

        // 构造全量 8 颗调色板色值：确保 index 0 与 index 1~7 全部填充有效 HEX
        const full8List = nextSwatches.map((s, i) => (i === 0 ? newHex : s.hex || '#FF3D3D'));

        // 核心硬件控制时序：先更新板载 Palette 调色板内存，再下发 Base 触发硬件重新渲染
        keyboardService.setLightingPalette(area, full8List).then(() => {
          keyboardService.setLightingBase(area, mode, bri, spd, lamp, {
            open: isDecorateArea ? (stripLightEnabled ? 'Open' : 'Close') : (lightEnabled ? 'Open' : 'Close'),
            direction: stripDirection === 0 ? 'Forward' : 'Backward',
            selectStaticColor: activeIdx,
            primaryColor: newRgb || hexToRgb(newHex),
          });
        });
      }
    }
  }, [isDecorateArea, stripStaticColor, selectStaticColor, activeLightingArea, activeArea, stripMode, currentMode, stripBrightness, brightness, stripSpeed, speed, stripLightEnabled, lightEnabled, stripDirection, lamp, presetSwatches, saveStripModeRecord, saveModeRecord]);

  // 更新 HSV 并同步派生 RGB 与 HEX (同时按需更新右侧激活的预设色轮)
  const updateFromHsv = useCallback((newHsv, syncPreset = true) => {
    setHsv(newHsv);
    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexColor(newHex);
    if (onCustomColorChange) {
      onCustomColorChange(newHex);
    }
    if (syncPreset) {
      syncColorToActivePreset(newHex, newRgb);
    }
  }, [onCustomColorChange, syncColorToActivePreset]);

  // 从 2D 调色盘位置计算 Saturation 和 Value
  const handlePaletteMove = useCallback((e) => {
    if (!paletteRef.current) return;
    const rect = paletteRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const s = x;
    const v = 1 - y;
    updateFromHsv({ ...hsv, s, v });
  }, [hsv, updateFromHsv]);

  // 从水平彩虹色相条计算 Hue (0 ~ 360)
  const handleHueMove = useCallback((e) => {
    if (!hueBarRef.current) return;
    const rect = hueBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const h = Math.round(x * 360);
    updateFromHsv({ ...hsv, h });
  }, [hsv, updateFromHsv]);

  // 监听全局鼠标拖拽释放
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingPalette.current) {
        handlePaletteMove(e);
      } else if (isDraggingHue.current) {
        handleHueMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingPalette.current || isDraggingHue.current) {
        isDraggingPalette.current = false;
        isDraggingHue.current = false;
        if (keyboardService.connected) {
          const area = isDecorateArea 
            ? (activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1') 
            : (activeArea === 'Keyboard' ? 'Keyboard' : 'Decorate1');
          const staticHexList = presetSwatches.slice(1).map(s => s.hex);
          keyboardService.setLightingPalette(area, staticHexList);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handlePaletteMove, handleHueMove, isDecorateArea, activeLightingArea, activeArea, presetSwatches]);

  // 鼠标在 2D 调色盘按下
  const handlePaletteMouseDown = (e) => {
    isDraggingPalette.current = true;
    handlePaletteMove(e);
  };

  // 鼠标在色相滑块按下
  const handleHueMouseDown = (e) => {
    isDraggingHue.current = true;
    handleHueMove(e);
  };

  // 用户手动输入 HEX 文本 (实时同步预设)
  const handleHexChange = (e) => {
    let val = e.target.value;
    setHexColor(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const parsedRgb = hexToRgb(val);
      if (parsedRgb) {
        setRgb(parsedRgb);
        const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
        setHsv(parsedHsv);
        const upperHex = val.toUpperCase();
        if (onCustomColorChange) onCustomColorChange(upperHex);
        syncColorToActivePreset(upperHex, parsedRgb);
      }
    }
  };

  // 用户微调 RGB 单通道数字 (实时同步预设)
  const handleRgbChange = (channel, val) => {
    const num = Math.max(0, Math.min(255, parseInt(val) || 0));
    const nextRgb = { ...rgb, [channel]: num };
    setRgb(nextRgb);
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setHexColor(nextHex);
    const nextHsv = rgbToHsv(nextRgb.r, nextRgb.g, nextRgb.b);
    setHsv(nextHsv);
    if (onCustomColorChange) onCustomColorChange(nextHex);
    syncColorToActivePreset(nextHex, nextRgb);
  };

  // 点击快捷 8 颗调色板 (0=彩虹, 1~7=单色)
  const handleSelectStaticColor = async (swatch) => {
    const lamp = isDoubleLight ? 'DoubleLighting' : 'SingleLighting';
    const area = activeArea === 'Keyboard' ? 'Keyboard' : 'Decorate1';

    // 记录用户在当前灯效模式下的色彩选择
    saveModeRecord(currentMode, swatch.index, swatch.hex || '');

    // 如果选彩虹
    if (swatch.isRainbow) {
      if (onSelectStaticColorChange) onSelectStaticColorChange(0, '');
      else setLocalSelectStaticColor(0);

      if (keyboardService.connected) {
        await keyboardService.setLightingBase(area, currentMode, brightness, speed, lamp, {
          open: lightEnabled ? 'Open' : 'Close',
          selectStaticColor: 0,
          direction: currentDirection === 0 ? 'Forward' : 'Backward',
        });
      }
      addToast({ 
        message: currentMode === 0 ? '常亮模式已切换为【全彩光谱】！' : '已切换为【炫彩彩虹动态】！', 
        type: 'success' 
      });
      return;
    }

    // 如果选 1~7 单色
    if (onSelectStaticColorChange) onSelectStaticColorChange(swatch.index, swatch.hex);
    else setLocalSelectStaticColor(swatch.index);

    // 选中对应单色并联动 2D 调色盘
    const parsedRgb = hexToRgb(swatch.hex);
    if (parsedRgb) {
      setHexColor(swatch.hex);
      setRgb(parsedRgb);
      const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setHsv(parsedHsv);
      if (onCustomColorChange) onCustomColorChange(swatch.hex);
    }

    if (keyboardService.connected) {
      const full8List = presetSwatches.map((s, i) => (i === 0 ? swatch.hex : (s.index === swatch.index ? swatch.hex : s.hex || '#FF3D3D')));
      await keyboardService.setLightingPalette(area, full8List);
      await keyboardService.setLightingBase(area, currentMode, brightness, speed, lamp, {
        open: lightEnabled ? 'Open' : 'Close',
        selectStaticColor: swatch.index,
        direction: currentDirection === 0 ? 'Forward' : 'Backward',
        primaryColor: parsedRgb ? { R: parsedRgb.r, G: parsedRgb.g, B: parsedRgb.b } : undefined,
      });
    }
    addToast({ message: `已载入【预设 #${swatch.index}】(${swatch.hex})！可在左侧调色板实时微调。`, type: 'success' });
  };

  // 装饰灯带/底灯 快捷色彩选择 (0=彩虹, 1~7=单色可定制)
  const handleSelectStripStaticColor = async (swatch) => {
    const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';

    // 记录用户在底灯当前模式下的色彩选择
    saveStripModeRecord(stripMode, swatch.index, swatch.hex || '');

    if (swatch.isRainbow) {
      if (onStripStaticColorChange) onStripStaticColorChange(0, '');
      if (keyboardService.connected) {
        await keyboardService.setLightingBase(area, stripMode, stripBrightness, stripSpeed, 'SingleLighting', {
          open: stripLightEnabled ? 'Open' : 'Close',
          direction: stripDirection === 0 ? 'Forward' : 'Backward',
          selectStaticColor: 0,
          primaryColor: { R: rgb.r, G: rgb.g, B: rgb.b },
        });
      }
      addToast({ 
        message: stripMode === 0 ? '底灯已切换为【全彩光谱常亮】！' : '底灯已切换为【炫彩彩虹动态】！', 
        type: 'success' 
      });
      return;
    }

    if (onStripStaticColorChange) onStripStaticColorChange(swatch.index, swatch.hex);

    const parsedRgb = hexToRgb(swatch.hex);
    if (parsedRgb) {
      setHexColor(swatch.hex);
      setRgb(parsedRgb);
      const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setHsv(parsedHsv);
      if (onCustomColorChange) onCustomColorChange(swatch.hex);
    }

    if (keyboardService.connected) {
      const full8List = presetSwatches.map((s, i) => (i === 0 ? swatch.hex : (s.index === swatch.index ? swatch.hex : s.hex || '#FF3D3D')));
      await keyboardService.setLightingPalette(area, full8List);
      await keyboardService.setLightingBase(area, stripMode, stripBrightness, stripSpeed, 'SingleLighting', {
        open: stripLightEnabled ? 'Open' : 'Close',
        direction: stripDirection === 0 ? 'Forward' : 'Backward',
        selectStaticColor: swatch.index,
        primaryColor: parsedRgb ? { R: parsedRgb.r, G: parsedRgb.g, B: parsedRgb.b } : undefined,
      });
    }
    addToast({ message: `底灯已载入【预设 #${swatch.index}】(${swatch.hex})！可在左侧调色板实时微调。`, type: 'success' });
  };

  // 恢复默认预设调色板
  const handleResetPresets = async () => {
    setPresetSwatches(DEFAULT_PRESET_COLOR_SWATCHES);
    try {
      localStorage.removeItem('sparklink_custom_preset_swatches');
    } catch {}
    if (keyboardService.connected) {
      const area = isDecorateArea 
        ? (activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1') 
        : (activeArea === 'Keyboard' ? 'Keyboard' : 'Decorate1');
      const staticHexList = DEFAULT_PRESET_COLOR_SWATCHES.map(s => s.hex || '#FF3D3D');
      await keyboardService.setLightingPalette(area, staticHexList);
    }
    addToast({ message: '已恢复预设颜色为默认色盘！', type: 'info' });
  };

  // 切换官方 L1 ~ L20 模式 (精确下发真实硬件 mode 0~19 或 20)
  const handleApplyMode = async (modeItem) => {
    // 零延迟即时高亮与模式预切换
    setOptimisticMode(modeItem.mode);
    if (onClearCustomKeyColors) {
      onClearCustomKeyColors();
    }

    // 模式色彩策略：
    // 若该模式有显式记录，则恢复该记录；若无记录，默认必须为炫彩彩虹 (selectStaticColor = 0)
    const userRecord = modeColorRecords[modeItem.mode];
    let nextStaticColor = 0;
    let targetHex = '';
    let targetRgb = null;

    if (userRecord && typeof userRecord.colorIdx === 'number') {
      nextStaticColor = userRecord.colorIdx;
      if (nextStaticColor >= 1 && nextStaticColor <= 7) {
        targetHex = userRecord.hex || presetSwatches[nextStaticColor]?.hex || '#FF3D3D';
        targetRgb = hexToRgb(targetHex);
        if (targetRgb) {
          setHexColor(targetHex);
          setRgb(targetRgb);
          setHsv(rgbToHsv(targetRgb.r, targetRgb.g, targetRgb.b));
          if (onCustomColorChange) onCustomColorChange(targetHex);
        }
      }
    } else {
      nextStaticColor = 0; // 无记录，默认炫彩模式
    }

    if (onSelectStaticColorChange) onSelectStaticColorChange(nextStaticColor, targetHex);
    else setLocalSelectStaticColor(nextStaticColor);

    if (onModeChange) onModeChange(modeItem.mode);
    else setLocalMode(modeItem.mode);

    if (keyboardService.connected) {
      const area = activeArea === 'Keyboard' ? 'Keyboard' : 'Decorate1';
      const full8List = presetSwatches.map(s => s.hex || '#FF3D3D');
      await keyboardService.setLightingPalette(area, full8List);
      await keyboardService.setLightingBase(area, modeItem.mode, brightness, speed, lamp, {
        open: lightEnabled ? 'Open' : 'Close',
        selectStaticColor: nextStaticColor,
        direction: currentDirection === 0 ? 'Forward' : 'Backward',
        primaryColor: targetRgb || { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  // ── 装饰灯带/底灯 硬件指令下发 ──
  const handleApplyStripMode = async (m) => {
    // 检查底灯该模式是否有用户设置的记录
    const userRecord = stripModeColorRecords[m.mode];
    let nextStaticColor = 0;
    let targetHex = '';
    let targetRgb = null;

    if (userRecord && typeof userRecord.colorIdx === 'number') {
      nextStaticColor = userRecord.colorIdx;
      if (nextStaticColor >= 1 && nextStaticColor <= 7) {
        targetHex = userRecord.hex || presetSwatches[nextStaticColor]?.hex || '#FF3D3D';
        targetRgb = hexToRgb(targetHex);
        if (targetRgb) {
          setHexColor(targetHex);
          setRgb(targetRgb);
          setHsv(rgbToHsv(targetRgb.r, targetRgb.g, targetRgb.b));
          if (onCustomColorChange) onCustomColorChange(targetHex);
        }
      }
    } else {
      nextStaticColor = 0; // 无记录，默认炫彩模式
    }

    if (onStripStaticColorChange) onStripStaticColorChange(nextStaticColor, targetHex);
    if (onStripModeChange) onStripModeChange(m.mode);

    if (keyboardService.connected) {
      const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';
      const full8List = presetSwatches.map(s => s.hex || '#FF3D3D');
      await keyboardService.setLightingPalette(area, full8List);
      await keyboardService.setLightingBase(area, m.mode, stripBrightness, stripSpeed, 'SingleLighting', {
        open: stripLightEnabled ? 'Open' : 'Close',
        direction: stripDirection === 0 ? 'Forward' : 'Backward',
        selectStaticColor: nextStaticColor,
        primaryColor: targetRgb || { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  const handleStripDirection = async (dir) => {
    if (onStripDirectionChange) onStripDirectionChange(dir);
    if (keyboardService.connected) {
      const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';
      await keyboardService.setLightingBase(area, stripMode, stripBrightness, stripSpeed, 'SingleLighting', {
        open: stripLightEnabled ? 'Open' : 'Close',
        direction: dir === 0 ? 'Forward' : 'Backward',
        selectStaticColor: stripStaticColor,
        primaryColor: { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  const handleStripBrightness = async (val) => {
    if (onStripBrightnessChange) onStripBrightnessChange(val);
    if (keyboardService.connected) {
      const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';
      await keyboardService.setLightingBase(area, stripMode, val, stripSpeed, 'SingleLighting', {
        open: stripLightEnabled ? 'Open' : 'Close',
        direction: stripDirection === 0 ? 'Forward' : 'Backward',
        selectStaticColor: stripStaticColor,
        primaryColor: { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  const handleStripSpeed = async (val) => {
    if (onStripSpeedChange) onStripSpeedChange(val);
    if (keyboardService.connected) {
      const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';
      await keyboardService.setLightingBase(area, stripMode, stripBrightness, val, 'SingleLighting', {
        open: stripLightEnabled ? 'Open' : 'Close',
        direction: stripDirection === 0 ? 'Forward' : 'Backward',
        selectStaticColor: stripStaticColor,
        primaryColor: { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  const handleStripSwitch = async (checked) => {
    if (onStripLightEnabledChange) onStripLightEnabledChange(checked);
    if (keyboardService.connected) {
      const area = activeLightingArea === 'decorate2' ? 'Decorate2' : 'Decorate1';
      await keyboardService.setLightingBase(area, stripMode, stripBrightness, stripSpeed, 'SingleLighting', {
        open: checked ? 'Open' : 'Close',
        direction: stripDirection === 0 ? 'Forward' : 'Backward',
        selectStaticColor: stripStaticColor,
        primaryColor: { R: rgb.r, G: rgb.g, B: rgb.b },
      });
    }
  };

  // 清除自定义灯效 (保留当前选中的动态灯效，无缝恢复背景流光)
  const handleClearCustom = () => {
    if (isDecorateArea) {
      if (onDecorateColorsChange) onDecorateColorsChange([]);
      if (onClearAllStrip) onClearAllStrip();
      addToast({ message: '已清空底灯自定义涂色，恢复动态灯效！', type: 'success' });
    } else {
      if (onClearCustomKeyColors) {
        onClearCustomKeyColors();
      }
      addToast({ message: '已清除按键自定义单键涂色，恢复当前动态动效！', type: 'success' });
    }
  };

  return (
    <div className="panel-operation-lighting flex flex-col gap-2 flex-1 select-none h-full min-h-0 overflow-hidden">
      {/* 顶部操作与区域选择栏 */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setActiveArea('Keyboard');
              if (onActiveLightingAreaChange) onActiveLightingAreaChange('keyboard');
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
              !isDecorateArea
                ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-[var(--shadow-color)] ring-2 ring-[var(--info-color)]/30'
                : 'bg-[var(--bg-secondary)] text-[var(--text-disabled)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
            }`}
          >
            主键盘
          </button>
          {hasDecorateLighting && (
            <button
              type="button"
              onClick={() => {
                setActiveArea('Decorate');
                if (onActiveLightingAreaChange) onActiveLightingAreaChange('decorate1');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isDecorateArea
                  ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-[var(--shadow-color)] ring-2 ring-[var(--info-color)]/30'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-disabled)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
              }`}
            >
              {decorateConfig?.name || '装饰灯1'}
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isDecorateArea ? (
            <>

              {/* 空格5灯独立切换 */}
              <button
                type="button"
                onClick={onToggleSpaceMultiLamp}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  spaceMultiLampEnabled
                    ? 'bg-[var(--info-color)]/10 text-[var(--info-color)] border-[var(--info-color)]/30'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--info-color)]'
                }`}
                title={spaceMultiLampEnabled ? '当前为独立5灯设置，点击切换为整键联动' : '当前为整键联动，点击展开空格5颗独立灯珠'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{spaceMultiLampEnabled ? '空格5灯独立' : '空格整体'}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${spaceMultiLampEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </button>

              {/* 全键涂色 */}
              <button
                type="button"
                onClick={() => onApplyAllKeyColor && onApplyAllKeyColor(hexColor)}
                className="px-3 py-1 rounded-lg bg-[var(--primary-04)] hover:bg-[var(--primary-09)] text-[var(--info-color)] border border-[var(--primary-15)] text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="将当前调色板颜色应用至全键盘"
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: hexColor }} />
                <span>全键涂色</span>
              </button>

              {/* 清空涂色 */}
              <button
                type="button"
                onClick={onClearCustomKeyColors}
                className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-rose-50 text-[var(--text-secondary)] hover:text-rose-600 border border-[var(--border-color)] text-xs font-bold transition cursor-pointer"
                title="清空当前所有按键的自定义涂色"
              >
                清空涂色
              </button>
            </>
          ) : (
            <>
              {/* 底灯配置自动识别展示 (不开放用户手动调节，跟随键盘硬件配置自动切换) */}
              {bottomLedCount > 0 && (
                <div 
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xs"
                  title="底灯数量根据当前键盘硬件配置信息自动识别并适配，无需手动调节"
                >
                  <span className="text-[11px] font-medium text-[var(--text-tertiary)]">底灯:</span>
                  <span className="font-mono font-bold text-xs text-[var(--info-color)]">
                    {bottomLedCount}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">颗</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSetAllStrip && onSetAllStrip(hexColor)}
                className="px-3 py-1 rounded-lg bg-[var(--primary-04)] hover:bg-[var(--primary-09)] text-[var(--info-color)] border border-[var(--primary-15)] text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: hexColor }} />
                <span>整条同色</span>
              </button>
              <button
                type="button"
                onClick={() => onClearAllStrip && onClearAllStrip()}
                className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-rose-50 text-[var(--text-secondary)] hover:text-rose-600 border border-[var(--border-color)] text-xs font-bold transition cursor-pointer"
              >
                清空灯带
              </button>
            </>
          )}
        </div>
      </div>

      {/* 主体三列工作面板 */}
      <div className="panel-operation flex-1 min-h-0 overflow-hidden flex flex-col justify-between !h-full !max-h-none !p-3">
        <div className="operation-columns">
        
        {/* 左列：自定义颜色与 2D 调色盘 */}
        <div className="col flex flex-col justify-between overflow-y-auto pr-1">
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center mb-1.5">
              <Palette className="w-4 h-4 mr-1.5 text-[var(--info-color)]" />
              单色 / 涂色微调
            </h3>

            {/* 2D 色域渐变调色板 */}
            <div 
              ref={paletteRef}
              onMouseDown={handlePaletteMouseDown}
              className="relative w-full h-18 rounded-lg overflow-hidden border border-[var(--border-color)] cursor-crosshair shadow-inner select-none"
              style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                backgroundImage: `
                  linear-gradient(to right, #FFFFFF, transparent),
                  linear-gradient(to top, #000000, transparent)
                `
              }}
            >
              {/* 2D 拾色指示圆环 */}
              <div 
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-1 ring-black/30"
                style={{ 
                  left: `${hsv.s * 100}%`, 
                  top: `${(1 - hsv.v) * 100}%`, 
                  backgroundColor: hexColor 
                }}
              />
            </div>

            {/* 彩虹色相滑轨条 (Hue Slider) */}
            <div 
              ref={hueBarRef}
              onMouseDown={handleHueMouseDown}
              className="relative w-full h-3 rounded-full cursor-pointer border border-[var(--border-color)] select-none my-1.5 shadow-inner"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            >
              {/* 色相滑块指示器 */}
              <div 
                className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-1 ring-black/30"
                style={{ 
                  left: `${(hsv.h / 360) * 100}%`,
                  backgroundColor: `hsl(${hsv.h}, 100%, 50%)`
                }}
              />
            </div>

            {/* RGB / HEX 数值精细调节 */}
            <div className="space-y-1.5 bg-[var(--bg-tertiary)]/90 p-2 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-bold text-[var(--text-disabled)] w-8">RGB</span>
                <div className="grid grid-cols-3 gap-1.5 flex-1 font-mono text-xs">
                  <div className="flex items-center bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                    <span className="text-[11px] text-rose-500 font-bold mr-1">R</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={rgb.r} 
                      onChange={(e) => handleRgbChange('r', e.target.value)}
                      className="w-full text-center focus:outline-none bg-transparent font-bold"
                    />
                  </div>
                  <div className="flex items-center bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                    <span className="text-[11px] text-emerald-500 font-bold mr-1">G</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={rgb.g} 
                      onChange={(e) => handleRgbChange('g', e.target.value)}
                      className="w-full text-center focus:outline-none bg-transparent font-bold"
                    />
                  </div>
                  <div className="flex items-center bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                    <span className="text-[11px] text-[var(--info-color)] font-bold mr-1">B</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="255" 
                      value={rgb.b} 
                      onChange={(e) => handleRgbChange('b', e.target.value)}
                      className="w-full text-center focus:outline-none bg-transparent font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[12px] font-bold text-[var(--text-disabled)] w-8">HEX</span>
                <div className="flex-1 flex items-center bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                  <span 
                    className="w-3.5 h-3.5 rounded mr-2 border border-[var(--primary-25)] shrink-0 shadow-xs" 
                    style={{ backgroundColor: hexColor }}
                  />
                  <input 
                    type="text" 
                    value={hexColor} 
                    onChange={handleHexChange}
                    className="w-full font-mono text-xs font-bold text-[var(--text-primary)] focus:outline-none uppercase bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 仅在装饰灯带/底灯页面时显示快捷批量涂色卡片；主键盘空格多灯设置按用户要求已移至右上角切换开关 */}
            {isDecorateArea && (
              <div className="mt-2.5 p-2 rounded-xl bg-[var(--bg-tertiary)]/90 border border-[var(--border-color)]">
                <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                  灯带/底灯 快捷批量涂色
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => onSetAllStrip && onSetAllStrip(hexColor)}
                    className="py-1.5 px-1 rounded-lg bg-[var(--primary-04)] hover:bg-[var(--primary-09)] text-[var(--info-color)] border border-[var(--primary-15)] transition text-center truncate cursor-pointer"
                    title="将当前选中的颜色应用到全部灯带 LED"
                  >
                    整条同色
                  </button>
                  <button
                    type="button"
                    onClick={() => onRainbowStrip && onRainbowStrip()}
                    className="py-1.5 px-1 rounded-lg bg-gradient-to-r from-red-500/10 via-emerald-500/10 to-blue-500/10 hover:from-red-500/20 hover:to-blue-500/20 text-[var(--text-primary)] border border-[var(--border-color)] transition text-center truncate cursor-pointer"
                    title="为整条灯带一键配置绚丽彩虹流光渐变"
                  >
                    彩虹渐变
                  </button>
                  <button
                    type="button"
                    onClick={() => onClearAllStrip && onClearAllStrip()}
                    className="py-1.5 px-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-rose-50 text-[var(--text-disabled)] hover:text-rose-600 border border-[var(--border-color)] transition text-center truncate cursor-pointer"
                    title="清空灯带自定义涂色，恢复模式动效"
                  >
                    清空灯带
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearCustom}
            className="w-full mt-1.5 py-1 rounded-lg bg-[var(--primary-04)] hover:bg-[var(--primary-09)] text-[var(--info-color)] text-xs font-bold flex items-center justify-center space-x-1.5 border border-[var(--primary-15)] transition shadow-xs cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isDecorateArea ? '清空底灯自定义涂色' : '清除自定义灯效'}</span>
          </button>
        </div>

        {/* 中列：灯效模式 (主键盘 20 种 vs 灯带 4 种，对齐图 1 & 图 3) */}
        <div className="col flex flex-col justify-between">
          <div>
            {isDecorateArea ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5 text-[var(--info-color)]" />
                    灯光效果 (仅 4 种专用灯效)
                  </h3>
                  <span className="text-[12px] font-mono font-bold text-[var(--info-color)] bg-[var(--primary-04)] px-2 py-0.5 rounded border border-[var(--primary-15)]">
                    {currentStripModeItem.name} ({currentStripModeItem.label})
                  </span>
                </div>

                {/* 2 x 2 模式大卡片 (对齐图 1、图 3) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {DECORATE_LIGHT_MODES.map((m) => {
                    const isActive = stripMode === m.mode;
                    return (
                      <button
                        key={m.id}
                        data-mode-label={m.label}
                        type="button"
                        onClick={() => handleApplyStripMode(m)}
                        className={`h-16 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                          isActive
                            ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] border-[var(--primary-color)] shadow-md font-bold ring-2 ring-[var(--info-color)]/30'
                            : 'bg-[var(--bg-tertiary)]/80 hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border-[var(--border-color)] hover:border-[var(--primary-25)]'
                        }`}
                        title={`${m.name} (${m.desc})`}
                      >
                        <span className="text-[13px] font-extrabold leading-none">{m.name}</span>
                        <span className={`text-[10px] mt-1 font-mono leading-none ${isActive ? 'text-[var(--text-inverse-85)]' : 'text-[var(--text-disabled)]'}`}>
                          {m.label} · {m.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center">
                    <Sparkles className="w-4 h-4 mr-1.5 text-[var(--info-color)]" />
                    灯效模式
                  </h3>
                  <span className="text-[12px] font-mono font-bold text-[var(--info-color)] bg-[var(--primary-04)] px-2 py-0.5 rounded border border-[var(--primary-15)]">
                    {currentModeItem.label}: {currentModeItem.name}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {SPARK_LIGHT_MODES.slice(0, 19).map((m) => {
                    const isActive = currentMode === m.mode;
                    const iconObj = OFFICIAL_LIGHTING_ICONS[m.mode];
                    const svgHtml = iconObj ? (isActive ? iconObj.activeSvg : iconObj.inactiveSvg.replace(/fill=['"]#1A1A1A['"]/gi, 'fill="currentColor"')) : null;
                    return (
                      <button
                        key={m.id}
                        data-mode-label={m.label}
                        type="button"
                        onClick={() => handleApplyMode(m)}
                        style={isActive ? { backgroundColor: '#0052ef', borderColor: '#0052ef', color: '#ffffff' } : undefined}
                        className={`aspect-square rounded-xl border transition-all flex flex-col items-center justify-center p-1 relative cursor-pointer ${
                          isActive
                            ? 'bg-[#0052ef] text-white border-[#0052ef] shadow-sm font-bold ring-2 ring-[#0052ef]/30'
                            : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/90 dark:border-zinc-700/80 hover:border-[#0052ef]/40'
                        }`}
                        title={`${m.label}: ${m.name} (${m.desc})`}
                      >
                        {svgHtml ? (
                          <div 
                            className="w-5 h-5 flex items-center justify-center pointer-events-none"
                            dangerouslySetInnerHTML={{ __html: svgHtml }}
                          />
                        ) : (
                          <Sparkles className="w-4 h-4 pointer-events-none" />
                        )}
                        <span className={`text-[10px] font-mono font-bold leading-none mt-1 pointer-events-none ${
                          isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[var(--text-tertiary)] pt-1.5 border-t border-[var(--border-color)] flex justify-between items-center">
            <span>{isDecorateArea ? '贯穿式 ARGB 漫反射硬件控制协议' : '星闪双模高速 RGB 渲染引擎'}</span>
            <span className="font-mono text-[var(--info-color)] font-semibold">
              {isDecorateArea
                ? (stripStaticColor === 0 ? (stripMode === 0 ? '全彩光谱常亮' : '炫彩全彩流动') : (stripMode === 0 ? '单色常亮' : '纯色动态流光'))
                : (selectStaticColor === 0 ? (currentMode === 0 ? '全彩光谱常亮' : '炫彩流光模式') : (currentMode === 0 ? '单色常亮' : '单色动态模式'))}
            </span>
          </div>
        </div>

        {/* 右列：全局开关、亮度、速度与预设色彩环 (支持灯带方向调节，对齐图 1！) */}
        <div className="col flex flex-col justify-between overflow-y-auto pr-1">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center">
                <Sliders className="w-4 h-4 mr-1.5 text-[var(--info-color)]" />
                {isDecorateArea ? '速度和亮度' : '灯效模式'}
              </h3>

              {/* 单灯开关（非双灯模式或灯带模式） */}
              {(!isDoubleLight || isDecorateArea) && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[12px] text-[var(--text-disabled)] font-medium">开关:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isDecorateArea ? stripLightEnabled : lightEnabled} 
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (isDecorateArea) {
                          handleStripSwitch(checked);
                        } else {
                          if (onLightEnabledChange) onLightEnabledChange(checked);
                          else setLocalLightEnabled(checked);
                          if (keyboardService.connected) {
                            keyboardService.setLightingBase(
                              'Keyboard',
                              currentMode,
                              brightness,
                              speed,
                              lamp,
                              { open: checked ? 'Open' : 'Close', selectStaticColor }
                            );
                          }
                        }
                      }} 
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                  </label>
                </div>
              )}

              {/* 双灯键盘：标题右侧直接并排提供「上位灯光开关」与「下位灯光开关」及中间「🔗」联动按钮 (1:1 官网) */}
              {isDoubleLight && !isDecorateArea && (
                <div className="flex items-center space-x-2">
                  {/* 上位灯开关 */}
                  <div className="flex items-center space-x-1.5" title="上位灯光开关 (控制按键上半部发光)">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)]">上位灯:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={topLightEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (onTopLightEnabledChange) onTopLightEnabledChange(checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>

                  {/* 联动按钮 (对齐官网 1:1) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onLightingLinkedChange) onLightingLinkedChange(!lightingLinked);
                    }}
                    className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                      lightingLinked
                        ? 'text-[#0052ef] bg-blue-50 dark:bg-blue-950/40 border border-[#0052ef]/30'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-transparent border border-transparent hover:border-zinc-300'
                    }`}
                    title={lightingLinked ? '上下灯位联动开启中（操作任一开关同步控制上下灯，点击取消联动）' : '上下灯位已断开联动（独立控制，点击开启联动）'}
                  >
                    {lightingLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* 下位灯开关 */}
                  <div className="flex items-center space-x-1.5" title="下位灯光开关 (控制按键下半部发光)">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)]">下位灯:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bottomLightEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (onBottomLightEnabledChange) onBottomLightEnabledChange(checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 mb-2">
              {/* 亮度调节 */}
              <div className="p-1.5 px-2 bg-[var(--bg-tertiary)]/90 rounded-xl border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] flex items-center">
                    <Sun className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {isDecorateArea ? '灯光亮度' : '亮度'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--info-color)]">
                    {isDecorateArea ? stripBrightness : brightness} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isDecorateArea ? stripBrightness : brightness}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isDecorateArea) {
                      handleStripBrightness(val);
                    } else {
                      if (onBrightnessChange) onBrightnessChange(val);
                      else setLocalBrightness(val);
                      if (keyboardService.connected) {
                        keyboardService.setLightingBase('Keyboard', currentMode, val, speed, lamp, {
                          open: lightEnabled ? 'Open' : 'Close',
                          selectStaticColor,
                          direction: currentDirection === 0 ? 'Forward' : 'Backward',
                        });
                      }
                    }
                  }}
                  className="w-full accent-[var(--info-color)] cursor-pointer h-1.5 bg-[var(--primary-15)] rounded-lg"
                />
              </div>

              {/* 速度调节 */}
              <div className="p-1.5 px-2 bg-[var(--bg-tertiary)]/90 rounded-xl border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] flex items-center">
                    <Play className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    {isDecorateArea ? '灯光速率' : '速度'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {isDecorateArea ? stripSpeed : speed} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isDecorateArea ? stripSpeed : speed}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isDecorateArea) {
                      handleStripSpeed(val);
                    } else {
                      if (onSpeedChange) onSpeedChange(val);
                      else setLocalSpeed(val);
                      if (keyboardService.connected) {
                        keyboardService.setLightingBase('Keyboard', currentMode, brightness, val, lamp, {
                          open: lightEnabled ? 'Open' : 'Close',
                          selectStaticColor,
                          direction: currentDirection === 0 ? 'Forward' : 'Backward',
                        });
                      }
                    }
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[var(--primary-15)] rounded-lg"
                />
              </div>

              {/* 方向选择 (底灯支持顺逆时针；主键盘动态模式支持正反向流动) */}
              {isDecorateArea ? (
                <div className="p-1.5 px-2 bg-[var(--bg-tertiary)]/90 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block mb-1">
                    旋转方向
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStripDirection(0)}
                      className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer border ${
                        stripDirection === 0
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
                      }`}
                    >
                      <span>顺时针旋转</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStripDirection(1)}
                      className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer border ${
                        stripDirection === 1
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
                      }`}
                    >
                      <span>逆时针旋转</span>
                    </button>
                  </div>
                </div>
              ) : (currentMode !== 0 && currentMode !== 20) && (
                <div className="p-1.5 px-2 bg-[var(--bg-tertiary)]/90 rounded-xl border border-[var(--border-color)]">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block mb-1">
                    流动方向
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onLightingDirectionChange) onLightingDirectionChange(0);
                        else setLocalDirection(0);
                        if (keyboardService.connected) {
                          keyboardService.setLightingBase('Keyboard', currentMode, brightness, speed, lamp, {
                            open: lightEnabled ? 'Open' : 'Close',
                            selectStaticColor,
                            direction: 'Forward',
                          });
                        }
                      }}
                      className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer border ${
                        currentDirection === 0
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
                      }`}
                    >
                      <span>正向流动</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onLightingDirectionChange) onLightingDirectionChange(1);
                        else setLocalDirection(1);
                        if (keyboardService.connected) {
                          keyboardService.setLightingBase('Keyboard', currentMode, brightness, speed, lamp, {
                            open: lightEnabled ? 'Open' : 'Close',
                            selectStaticColor,
                            direction: 'Backward',
                          });
                        }
                      }}
                      className={`py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer border ${
                        currentDirection === 1
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-25)]'
                      }`}
                    >
                      <span>反向流动</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 8 颗官方标准光效色彩选择 (0=彩虹, 1~7=单色可自由定制) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-disabled)] block">
                    {isDecorateArea 
                      ? `底灯色彩 (${stripStaticColor === 0 ? (stripMode === 0 ? '全彩光谱' : '炫彩彩虹') : (presetSwatches[stripStaticColor]?.name || '单色')})` 
                      : `灯效色彩 (${selectStaticColor === 0 ? (currentMode === 0 ? '全彩光谱' : '炫彩彩虹') : (presetSwatches[selectStaticColor]?.name || '单色')})`}：
                  </span>
                  {(isDecorateArea ? stripStaticColor : selectStaticColor) > 0 && (
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded font-medium">
                      左侧微调中
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleResetPresets}
                    className="text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-primary)] underline transition cursor-pointer"
                    title="恢复默认 7 色预设"
                  >
                    重置预设
                  </button>
                  <span className="text-[10px] font-bold text-[var(--info-color)] bg-[var(--primary-04)] px-1.5 py-0.5 rounded">
                    {(isDecorateArea ? stripStaticColor : selectStaticColor) === 0 
                      ? ((isDecorateArea ? stripMode === 0 : currentMode === 0) ? '全彩光谱' : '全彩流动') 
                      : ((isDecorateArea ? stripMode === 0 : currentMode === 0) ? '单色常亮' : '纯色动态')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {presetSwatches.map((swatch) => {
                  const currentSelected = isDecorateArea ? stripStaticColor : selectStaticColor;
                  const isSelected = currentSelected === swatch.index;
                  const isDisabled = false;

                  return (
                    <button
                      key={swatch.index}
                      data-swatch-index={swatch.index}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isDecorateArea) {
                          handleSelectStripStaticColor(swatch);
                        } else {
                          handleSelectStaticColor(swatch);
                        }
                      }}
                      style={{ background: swatch.color }}
                      className={`h-6 w-6 mx-auto rounded-full border border-[var(--primary-25)] shadow-xs hover:scale-110 transition-transform flex items-center justify-center cursor-pointer relative ${
                        isSelected ? 'ring-2 ring-[var(--info-color)] ring-offset-2 scale-105' : ''
                      }`}
                      title={`${swatch.name || `预设 #${swatch.index}`} (${swatch.hex || '彩虹'})`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow font-extrabold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full mt-1.5 py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isDecorateArea ? '底灯/灯带参数已实时同步生效' : '灯效参数已实时同步生效'}</span>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

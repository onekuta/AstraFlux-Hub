import React, { useState, useRef, useEffect } from 'react';
import { 
  Keyboard, 
  Mouse, 
  Music, 
  Lightbulb, 
  Zap, 
  Sparkles, 
  Search, 
  RotateCcw,
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Copy,
  Scissors,
  Monitor,
  Laptop,
  Sun,
  SunDim,
  SunMedium,
  SkipForward,
  SkipBack,
  Play,
  Pause,
  VolumeX,
  Volume1,
  Volume2,
  Mail,
  Calculator,
  Globe,
  Palette,
  RefreshCw,
  Gauge,
  Timer,
  Moon,
  Pipette,
  Activity,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Power
} from 'lucide-react';
import { useToast } from './ToastProvider';

// 标准 104 键全配列绝对网格坐标字典 (总宽 23.0u，每排按键与小键盘/方向键严格物理对齐)
export const FULL_104_COORDINATES = [
  // ── Row 0: F-Row (y: 0, 16 键) ──
  { id: 'Escape', label: 'Esc', x: 0, w: 1, row: 0 },
  { id: 'F1', label: 'F1', x: 2, w: 1, row: 0 },
  { id: 'F2', label: 'F2', x: 3, w: 1, row: 0 },
  { id: 'F3', label: 'F3', x: 4, w: 1, row: 0 },
  { id: 'F4', label: 'F4', x: 5, w: 1, row: 0 },
  { id: 'F5', label: 'F5', x: 6.5, w: 1, row: 0 },
  { id: 'F6', label: 'F6', x: 7.5, w: 1, row: 0 },
  { id: 'F7', label: 'F7', x: 8.5, w: 1, row: 0 },
  { id: 'F8', label: 'F8', x: 9.5, w: 1, row: 0 },
  { id: 'F9', label: 'F9', x: 11, w: 1, row: 0 },
  { id: 'F10', label: 'F10', x: 12, w: 1, row: 0 },
  { id: 'F11', label: 'F11', x: 13, w: 1, row: 0 },
  { id: 'F12', label: 'F12', x: 14, w: 1, row: 0 },
  { id: 'PrintScreen', label: 'PrSc', x: 15.5, w: 1, row: 0 },
  { id: 'ScrollLock', label: 'ScLk', x: 16.5, w: 1, row: 0 },
  { id: 'Pause', label: 'Paus', x: 17.5, w: 1, row: 0 },

  // ── Row 1: Number Row (y: 1, 21 键) ──
  { id: 'Backquote', label: '` ~', x: 0, w: 1, row: 1 },
  { id: 'Digit1', label: '1 !', x: 1, w: 1, row: 1 },
  { id: 'Digit2', label: '2 @', x: 2, w: 1, row: 1 },
  { id: 'Digit3', label: '3 #', x: 3, w: 1, row: 1 },
  { id: 'Digit4', label: '4 $', x: 4, w: 1, row: 1 },
  { id: 'Digit5', label: '5 %', x: 5, w: 1, row: 1 },
  { id: 'Digit6', label: '6 ^', x: 6, w: 1, row: 1 },
  { id: 'Digit7', label: '7 &', x: 7, w: 1, row: 1 },
  { id: 'Digit8', label: '8 *', x: 8, w: 1, row: 1 },
  { id: 'Digit9', label: '9 (', x: 9, w: 1, row: 1 },
  { id: 'Digit0', label: '0 )', x: 10, w: 1, row: 1 },
  { id: 'Minus', label: '- _', x: 11, w: 1, row: 1 },
  { id: 'Equal', label: '= +', x: 12, w: 1, row: 1 },
  { id: 'Backspace', label: 'Back', x: 13, w: 2, row: 1 },
  { id: 'Insert', label: 'Ins', x: 15.5, w: 1, row: 1 },
  { id: 'Home', label: 'Home', x: 16.5, w: 1, row: 1 },
  { id: 'PageUp', label: 'PgUp', x: 17.5, w: 1, row: 1 },
  { id: 'NumLock', label: 'Num', x: 19, w: 1, row: 1 },
  { id: 'NumpadDivide', label: '/', x: 20, w: 1, row: 1 },
  { id: 'NumpadMultiply', label: '*', x: 21, w: 1, row: 1 },
  { id: 'NumpadSubtract', label: '-', x: 22, w: 1, row: 1 },

  // ── Row 2: QWERTY Row (y: 2, 21 键) ──
  { id: 'Tab', label: 'Tab', x: 0, w: 1.5, row: 2 },
  { id: 'KeyQ', label: 'Q', x: 1.5, w: 1, row: 2 },
  { id: 'KeyW', label: 'W', x: 2.5, w: 1, row: 2 },
  { id: 'KeyE', label: 'E', x: 3.5, w: 1, row: 2 },
  { id: 'KeyR', label: 'R', x: 4.5, w: 1, row: 2 },
  { id: 'KeyT', label: 'T', x: 5.5, w: 1, row: 2 },
  { id: 'KeyY', label: 'Y', x: 6.5, w: 1, row: 2 },
  { id: 'KeyU', label: 'U', x: 7.5, w: 1, row: 2 },
  { id: 'KeyI', label: 'I', x: 8.5, w: 1, row: 2 },
  { id: 'KeyO', label: 'O', x: 9.5, w: 1, row: 2 },
  { id: 'KeyP', label: 'P', x: 10.5, w: 1, row: 2 },
  { id: 'BracketLeft', label: '[ {', x: 11.5, w: 1, row: 2 },
  { id: 'BracketRight', label: '] }', x: 12.5, w: 1, row: 2 },
  { id: 'Backslash', label: '\\ |', x: 13.5, w: 1.5, row: 2 },
  { id: 'Delete', label: 'Del', x: 15.5, w: 1, row: 2 },
  { id: 'End', label: 'End', x: 16.5, w: 1, row: 2 },
  { id: 'PageDown', label: 'PgDn', x: 17.5, w: 1, row: 2 },
  { id: 'Numpad7', label: '7', x: 19, w: 1, row: 2 },
  { id: 'Numpad8', label: '8', x: 20, w: 1, row: 2 },
  { id: 'Numpad9', label: '9', x: 21, w: 1, row: 2 },
  { id: 'NumpadAdd', label: '+', x: 22, w: 1, h: 2, row: 2 },

  // ── Row 3: ASDF Row (y: 3, 16 键) ──
  { id: 'CapsLock', label: 'Caps', x: 0, w: 1.75, row: 3 },
  { id: 'KeyA', label: 'A', x: 1.75, w: 1, row: 3 },
  { id: 'KeyS', label: 'S', x: 2.75, w: 1, row: 3 },
  { id: 'KeyD', label: 'D', x: 3.75, w: 1, row: 3 },
  { id: 'KeyF', label: 'F', x: 4.75, w: 1, row: 3 },
  { id: 'KeyG', label: 'G', x: 5.75, w: 1, row: 3 },
  { id: 'KeyH', label: 'H', x: 6.75, w: 1, row: 3 },
  { id: 'KeyJ', label: 'J', x: 7.75, w: 1, row: 3 },
  { id: 'KeyK', label: 'K', x: 8.75, w: 1, row: 3 },
  { id: 'KeyL', label: 'L', x: 9.75, w: 1, row: 3 },
  { id: 'Semicolon', label: '; :', x: 10.75, w: 1, row: 3 },
  { id: 'Quote', label: '\' "', x: 11.75, w: 1, row: 3 },
  { id: 'Enter', label: 'Enter', x: 12.75, w: 2.25, row: 3 },
  { id: 'Numpad4', label: '4', x: 19, w: 1, row: 3 },
  { id: 'Numpad5', label: '5', x: 20, w: 1, row: 3 },
  { id: 'Numpad6', label: '6', x: 21, w: 1, row: 3 },

  // ── Row 4: ZXCV Row (y: 4, 17 键) ──
  { id: 'ShiftLeft', label: 'Shift', x: 0, w: 2.25, row: 4 },
  { id: 'KeyZ', label: 'Z', x: 2.25, w: 1, row: 4 },
  { id: 'KeyX', label: 'X', x: 3.25, w: 1, row: 4 },
  { id: 'KeyC', label: 'C', x: 4.25, w: 1, row: 4 },
  { id: 'KeyV', label: 'V', x: 5.25, w: 1, row: 4 },
  { id: 'KeyB', label: 'B', x: 6.25, w: 1, row: 4 },
  { id: 'KeyN', label: 'N', x: 7.25, w: 1, row: 4 },
  { id: 'KeyM', label: 'M', x: 8.25, w: 1, row: 4 },
  { id: 'Comma', label: ', <', x: 9.25, w: 1, row: 4 },
  { id: 'Period', label: '. >', x: 10.25, w: 1, row: 4 },
  { id: 'Slash', label: '/ ?', x: 11.25, w: 1, row: 4 },
  { id: 'ShiftRight', label: 'Shift', x: 12.25, w: 2.75, row: 4 },
  { id: 'ArrowUp', label: '↑', x: 16.5, w: 1, row: 4 },
  { id: 'Numpad1', label: '1', x: 19, w: 1, row: 4 },
  { id: 'Numpad2', label: '2', x: 20, w: 1, row: 4 },
  { id: 'Numpad3', label: '3', x: 21, w: 1, row: 4 },
  { id: 'NumpadEnter', label: 'Ent', x: 22, w: 1, h: 2, row: 4 },

  // ── Row 5: Bottom Space Row (y: 5, 13 键) ──
  { id: 'ControlLeft', label: 'Ctrl', x: 0, w: 1.25, row: 5 },
  { id: 'MetaLeft', label: 'Win', x: 1.25, w: 1.25, row: 5 },
  { id: 'AltLeft', label: 'Alt', x: 2.5, w: 1.25, row: 5 },
  { id: 'Space', label: 'Space', x: 3.75, w: 6.25, row: 5 },
  { id: 'AltRight', label: 'Alt', x: 10.0, w: 1.25, row: 5 },
  { id: 'MetaRight', label: 'Win', x: 11.25, w: 1.25, row: 5 },
  { id: 'ContextMenu', label: 'App', x: 12.5, w: 1.25, row: 5 },
  { id: 'ControlRight', label: 'Ctrl', x: 13.75, w: 1.25, row: 5 },
  { id: 'ArrowLeft', label: '←', x: 15.5, w: 1, row: 5 },
  { id: 'ArrowDown', label: '↓', x: 16.5, w: 1, row: 5 },
  { id: 'ArrowRight', label: '→', x: 17.5, w: 1, row: 5 },
  { id: 'Numpad0', label: '0', x: 19, w: 2, row: 5 },
  { id: 'NumpadDecimal', label: '.', x: 21, w: 1, row: 5 }
];

export const FULL_104_LAYOUT = FULL_104_COORDINATES;

// 鼠标按键矢量图标组件
function MouseIcon({ type }) {
  return (
    <svg viewBox="0 0 24 32" className="w-5 h-7 fill-none stroke-current" strokeWidth="1.8">
      {/* 鼠标外壳 */}
      <rect x="3" y="2" width="18" height="28" rx="9" className="opacity-90" />
      {/* 中间滚轮 */}
      <line x1="12" y1="5" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
      {/* 分割线 */}
      <line x1="3" y1="13" x2="21" y2="13" strokeWidth="1.2" opacity="0.6" />
      {type === 'left' && (
        <path d="M3 11 C3 6 7 2 12 2 L12 13 L3 13 Z" className="fill-[var(--info-color)]/70 stroke-none" />
      )}
      {type === 'right' && (
        <path d="M12 2 C17 2 21 6 21 11 L21 13 L12 13 Z" className="fill-[var(--info-color)]/70 stroke-none" />
      )}
      {type === 'middle' && (
        <rect x="10.5" y="4" width="3" height="7" rx="1.5" className="fill-[var(--info-color)] stroke-[var(--info-color)]" />
      )}
      {type === 'forward' && (
        <path d="M3 14 L1 15 L1 19 L3 18 Z" className="fill-[var(--info-color)] stroke-none" />
      )}
      {type === 'backward' && (
        <path d="M3 20 L1 21 L1 25 L3 24 Z" className="fill-[var(--info-color)] stroke-none" />
      )}
    </svg>
  );
}

// 7 大类按键字典与快捷键预设 (完全对齐用户上传的 5 张图)
export const SHORTCUT_CATEGORIES = {
  // 1. 特殊分类 (图二)
  special: [
    { id: 'None', label: '无功能', desc: '清空/禁用该按键', isBlank: true },
    { id: 'Fn', label: 'Fn ▵', desc: 'Fn 层切换键', badge: 'Fn' },
    { id: 'Fn0', label: 'Fn0', desc: '板载层 0 激活', badge: '0' },
    { id: 'Fn1', label: 'Fn1', desc: '板载层 1 激活', badge: '1' },
    { id: 'Fn2', label: 'Fn2', desc: '板载层 2 激活', badge: '2' },
    { id: 'Fn3', label: 'Fn3', desc: '板载层 3 激活', badge: '3' },
  ],

  // 2. 多媒体分类 (图三)
  media: [
    { id: 'BrightnessDown', label: '亮度 -', desc: '调低屏幕亮度', icon: SunDim },
    { id: 'BrightnessUp', label: '亮度 +', desc: '调高屏幕亮度', icon: Sun },
    { id: 'MediaNext', label: '下一曲', desc: '切换到下一首', icon: SkipForward },
    { id: 'MediaPrev', label: '上一曲', desc: '切换回上一首', icon: SkipBack },
    { id: 'MediaPlay', label: '播放', desc: '开始播放多媒体', icon: Play },
    { id: 'MediaPause', label: '暂停', desc: '暂停多媒体播放', icon: Pause },
    { id: 'VolumeMute', label: '静音', desc: '系统静音开关', icon: VolumeX },
    { id: 'VolumeUp', label: '音量 +', desc: '调高系统音量', icon: Volume2 },
    { id: 'VolumeDown', label: '音量 -', desc: '调低系统音量', icon: Volume1 },
    { id: 'MediaMusic', label: '音乐', desc: '打开系统音乐播放器', icon: Music },
    { id: 'Mail', label: '邮件/文档', desc: '打开默认邮件/文档', icon: Mail },
    { id: 'Calculator', label: '计算器', desc: '呼出 Windows 计算器', icon: Calculator },
    { id: 'MyComputer', label: '我的电脑', desc: '打开系统资源管理器', icon: Monitor },
    { id: 'BrowserHome', label: '浏览器', desc: '打开默认网页浏览器', icon: Globe },
  ],

  // 3. 灯效分类 (图四)
  lighting: [
    { id: 'LightToggle', label: '背光开关', desc: '开关键盘背光', icon: Power },
    { id: 'LightModeNext', label: '模式顺切', desc: '切换到下一个灯效模式', icon: Sparkles },
    { id: 'LightModePrev', label: '模式逆切', desc: '切换到上一个灯效模式', icon: RefreshCw },
    { id: 'LightBrightUp', label: '亮度 +', desc: '提高按键背光发光亮度', icon: SunMedium },
    { id: 'LightBrightDown', label: '亮度 -', desc: '降低按键背光发光亮度', icon: SunDim },
    { id: 'LightSpeedUp', label: '速度 +', desc: '加快流动与呼吸动效速度', icon: FastForwardIcon },
    { id: 'LightSpeedDown', label: '速度 -', desc: '减慢流动与呼吸动效速度', icon: RewindIcon },
    { id: 'LightColorCycle', label: '色彩切换', desc: '色相环循环与RGB模式', icon: Palette },
    { id: 'LightDirCycle', label: '方向切换', desc: '切换波浪/流动方向', icon: RefreshCw },
    { id: 'UnderglowToggle', label: '底灯开关', desc: '开启/关闭底板氛围灯', icon: Lightbulb },
    { id: 'UnderglowModeNext', label: '底灯模式+', desc: '底灯动效顺切', icon: Sliders },
    { id: 'UnderglowModePrev', label: '底灯模式-', desc: '底灯动效逆切', icon: SlidersHorizontal },
    { id: 'UnderglowBrightUp', label: '底灯亮度+', desc: '增加底灯发光亮度', icon: SunMedium },
    { id: 'UnderglowBrightDown', label: '底灯亮度-', desc: '减少底灯发光亮度', icon: SunDim },
    { id: 'UnderglowSpeedUp', label: '底灯速度+', desc: '加快底灯变换速度', icon: Gauge },
    { id: 'UnderglowSpeedDown', label: '底灯速度-', desc: '减慢底灯变换速度', icon: Timer },
    { id: 'UnderglowColor', label: '底灯颜色', desc: '循环底灯静态色彩', icon: Pipette },
    { id: 'SleepDelay', label: '休眠延时', desc: '调整键盘自动休眠时间', icon: Moon },
    { id: 'LightBreathStatic', label: '常亮/呼吸', desc: '在常亮与呼吸间切换', icon: Activity },
    { id: 'LightReset', label: '重置灯效', desc: '恢复默认灯效预设', icon: RotateCcw },
  ],

  // 4. 控制分类 (图五)
  control: [
    { id: 'ResetFactory', label: '恢复出厂', desc: '重置所有板载设置为出厂状态', icon: RotateCcw },
    { id: 'SystemWin', label: 'Win 模式', desc: '切换至 Windows 键盘映射', icon: Monitor },
    { id: 'SystemMac', label: 'Mac 模式', desc: '切换至 macOS 快捷键映射 (Cmd/Opt)', icon: Laptop },
    { id: 'Profile1', label: '≡ 1', desc: '切换至板载配置层 Profile 1', isProfile: true, pNum: '1' },
    { id: 'Profile2', label: '≡ 2', desc: '切换至板载配置层 Profile 2', isProfile: true, pNum: '2' },
    { id: 'Profile3', label: '≡ 3', desc: '切换至板载配置层 Profile 3', isProfile: true, pNum: '3' },
    { id: 'Profile4', label: '≡ 4', desc: '切换至板载配置层 Profile 4', isProfile: true, pNum: '4' },
  ],

  // 5. 鼠标分类 (图六)
  mouse: [
    { id: 'MouseLeft', label: '鼠标左键', desc: '鼠标标准单击左键', mouseType: 'left' },
    { id: 'MouseRight', label: '鼠标右键', desc: '鼠标右键上下文菜单', mouseType: 'right' },
    { id: 'MouseMiddle', label: '鼠标中键', desc: '滚轮向下按键', mouseType: 'middle' },
    { id: 'MouseForward', label: '前进键', desc: '浏览器/资源管理器前进', mouseType: 'forward' },
    { id: 'MouseBackward', label: '后退键', desc: '浏览器/资源管理器后退', mouseType: 'backward' },
    { id: 'MouseMoveLeft', label: '左移动', desc: '模拟光标向左移动', icon: ArrowLeft },
    { id: 'MouseMoveRight', label: '右移动', desc: '模拟光标向右移动', icon: ArrowRight },
    { id: 'MouseMoveUp', label: '上移动', desc: '模拟光标向上移动', icon: ArrowUp },
    { id: 'MouseMoveDown', label: '下移动', desc: '模拟光标向下移动', icon: ArrowDown },
    { id: 'MouseScrollUp', label: '滚轮上', desc: '模拟滚轮向上滚动', icon: ChevronsUp },
    { id: 'MouseScrollDown', label: '滚轮下', desc: '模拟滚轮向下滚动', icon: ChevronsDown },
  ],

  // 6. 快捷指令键分类 (对应截图中的 M0~M15 快捷指令键，完整覆盖官方 16 组)
  macro: Array.from({ length: 16 }).map((_, idx) => ({
    id: `M${idx}`,
    label: `M${idx}`,
    desc: `快捷指令 / 硬件宏 M${idx}`,
    isMacro: true,
    mIdx: idx,
  })),
};

function FastForwardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}

function RewindIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}

export default function KeybindsTab({ 
  selectedKeys = new Set(),
  activeLayer = 'win_default',
  onLayerChange,
  onAssignKey,
  onResetLayer
}) {
  const { addToast } = useToast();
  // 7 大分类：基础 | 特殊 | 多媒体 | 灯效 | 控制 | 组合键 | 鼠标
  const [activeCategory, setActiveCategory] = useState('basic');
  const [searchQuery, setSearchQuery] = useState('');

  // 响应式 104 键全配列尺寸计算 (自适应容器高度，确保 6 排按键完整显露，彻底杜绝上下截断)
  const basicKbRef = useRef(null);
  const comboKbRef = useRef(null);
  const [basicPitch, setBasicPitch] = useState(28);
  const [comboPitch, setComboPitch] = useState(26);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const calcPitch = (el, isCombo) => {
      if (!el) return isCombo ? 26 : 28;
      const h = el.clientHeight;
      const w = el.clientWidth;
      if (!h || !w) return isCombo ? 26 : 28;
      const paddingH = 6;
      const paddingW = 6;
      const availH = Math.max(100, h - paddingH);
      const availW = Math.max(300, w - paddingW);
      const pitchByH = availH / 6;
      const pitchByW = availW / 23;
      const maxP = isCombo ? 36 : 38;
      const minP = 22;
      return Math.max(minP, Math.min(maxP, Math.floor(Math.min(pitchByH, pitchByW))));
    };

    const update = () => {
      if (basicKbRef.current) {
        setBasicPitch(calcPitch(basicKbRef.current, false));
      }
      if (comboKbRef.current) {
        setComboPitch(calcPitch(comboKbRef.current, true));
      }
    };

    update();
    const ro = new ResizeObserver(() => update());
    if (basicKbRef.current) ro.observe(basicKbRef.current);
    if (comboKbRef.current) ro.observe(comboKbRef.current);

    return () => ro.disconnect();
  }, [activeCategory]);

  // 组合键独有状态 (图六完全对齐)
  const [selectedModifiers, setSelectedModifiers] = useState({
    CTRL: false,
    SHIFT: false,
    WIN: false,
    ALT: false,
  });
  const [comboMainKey, setComboMainKey] = useState(null); // { id: 'KeyC', label: 'C' }

  // 104 配列单键基准物理宽度 (常规基础按键：基准 35px 间隙 3px；紧凑组合键：基准 31px 间隙 3px)
  const calculateKeyWidth = (w, compact = false) => {
    const baseW = compact ? 31 : 35;
    const gap = 3;
    return Math.round(w * baseW + (w - 1) * gap);
  };

  const handleKeyClick = (keyItem) => {
    if (selectedKeys.size === 0) {
      addToast({
        message: '请先在上方键盘图点击选中要配置的目标按键！',
        type: 'warning'
      });
      return;
    }

    if (onAssignKey) {
      onAssignKey(keyItem);
    }

    const targetNames = Array.from(selectedKeys).map(k => k.replace('Key', '')).join(', ');
    addToast({
      message: `已将功能 [${keyItem.label}] 分配给按键 [${targetNames}]`,
      type: 'success'
    });
  };

  // 应用组合键
  const handleApplyCombo = () => {
    if (selectedKeys.size === 0) {
      addToast({
        message: '请先在上方键盘图点击选中目标按键！',
        type: 'warning'
      });
      return;
    }

    const activeMods = Object.keys(selectedModifiers).filter(k => selectedModifiers[k]);
    if (activeMods.length === 0 && !comboMainKey) {
      addToast({
        message: '请至少选择一个修饰键或主键！',
        type: 'warning'
      });
      return;
    }

    const comboLabel = [...activeMods, comboMainKey ? comboMainKey.label : ''].filter(Boolean).join(' + ');
    const comboItem = {
      id: `Combo_${activeMods.join('_')}_${comboMainKey ? comboMainKey.id : 'None'}`,
      label: comboLabel,
      desc: `自定义快捷组合: ${comboLabel}`,
      isCombo: true
    };

    if (onAssignKey) {
      onAssignKey(comboItem);
    }

    const targetNames = Array.from(selectedKeys).map(k => k.replace('Key', '')).join(', ');
    addToast({
      message: `已将组合键 [${comboLabel}] 应用给按键 [${targetNames}]`,
      type: 'success'
    });
  };

  const toggleModifier = (mod) => {
    setSelectedModifiers(prev => ({
      ...prev,
      [mod]: !prev[mod]
    }));
  };

  // 拖拽起点数据封装 (支持原生 HTML5 Drag & Drop 拖至上方任意键位实时替换)
  const handleDragStart = (e, item) => {
    const cleanLabel = (item.label || item.id || '').replace(/\n/g, ' ');
    const payload = JSON.stringify({
      id: item.id,
      label: cleanLabel,
      desc: item.desc || `按键 ${cleanLabel}`,
      type: item.type || (item.isMacro ? 'macro' : item.isCombo ? 'combo' : 'key'),
      ...item,
    });
    e.dataTransfer.setData('application/json', payload);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // 渲染单键方帽卡片 (特殊/媒体/灯效/控制/鼠标通用微圆方键)
  const renderKeycapButton = (item) => {
    const IconComp = item.icon;
    return (
      <button
        key={item.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, item)}
        onClick={() => handleKeyClick(item)}
        className="w-12 h-12 bg-[var(--bg-secondary)] hover:bg-[var(--primary-04)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[7px] flex flex-col items-center justify-center transition-all shadow-2xs cursor-grab active:cursor-grabbing group shrink-0 relative group-hover:z-[9999]"
        title={`可拖拽至上方键位替换，或点击分配【${item.label}】`}
      >
        {/* 图标或符号 */}
        {item.isBlank ? (
          <div className="w-5 h-5 rounded-[2px] border border-dashed border-[var(--border-color)] group-hover:border-[var(--info-color)] opacity-60" />
        ) : item.mouseType ? (
          <MouseIcon type={item.mouseType} />
        ) : IconComp ? (
          <IconComp className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--info-color)] transition-colors" />
        ) : item.isProfile ? (
          <div className="flex items-center space-x-0.5 font-bold text-xs tracking-tight">
            <span>≡</span>
            <span className="text-[11px] font-mono">{item.pNum}</span>
          </div>
        ) : item.isMacro ? (
          <div className="flex flex-col items-center justify-center font-bold">
            <span className="text-[11px] font-mono leading-none text-[var(--text-primary)] group-hover:text-[var(--info-color)]">{item.label}</span>
            <span className="text-[8px] text-[var(--info-color)] leading-none mt-0.5 scale-90">宏</span>
          </div>
        ) : item.badge ? (
          <div className="font-mono text-xs font-bold leading-none">
            {item.label}
          </div>
        ) : (
          <span className="text-[11px] font-bold font-mono leading-none">
            {item.label}
          </span>
        )}

        {/* 悬停气泡提示 (置顶最高层 z-[99999]) */}
        <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-[99999] pointer-events-none">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
            {item.label}
          </div>
          <div className="w-1.5 h-1.5 bg-[var(--bg-primary)] border-r border-b border-[var(--border-color)] rotate-45 -mt-1" />
        </div>
      </button>
    );
  };

  // 渲染完美物理对齐的 104 键全配列键盘 (基础与组合键共享统一物理坐标与圆角)
  const render104Keyboard = (isComboMode = false) => {
    const pitch = isComboMode ? comboPitch : basicPitch;
    const gap = pitch >= 34 ? 3 : 2.5;
    const totalW = Math.round(23 * pitch);
    const totalH = Math.round(6 * pitch);

    return (
      <div 
        className="relative select-none shrink-0 m-auto"
        style={{ width: `${totalW}px`, height: `${totalH}px` }}
      >
        {FULL_104_COORDINATES.map((k) => {
          const left = Math.round(k.x * pitch);
          const top = Math.round(k.row * pitch);
          const width = Math.round(k.w * pitch - gap);
          const height = Math.round((k.h || 1) * pitch - gap);
          const isMainSelected = isComboMode && comboMainKey?.id === k.id;

          const renderKeyLabel = () => {
            if (k.label.includes(' ')) {
              const parts = k.label.split(' ');
              if (parts.length === 2) {
                return (
                  <span className="flex flex-col items-center justify-center leading-tight select-none">
                    <span className={`${pitch >= 32 ? 'text-[9px]' : 'text-[7.5px]'} font-normal ${isMainSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>{parts[1]}</span>
                    <span className={`${pitch >= 32 ? 'text-[11px]' : 'text-[9px]'} font-bold ${isMainSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>{parts[0]}</span>
                  </span>
                );
              }
            }
            if (['↑', '↓', '←', '→'].includes(k.label)) {
              return <span className={`${pitch >= 32 ? 'text-[13px]' : 'text-[11px]'} font-bold select-none ${isMainSelected ? 'text-white' : ''}`}>{k.label}</span>;
            }
            if (k.label.length >= 4) {
              return <span className={`${pitch >= 32 ? 'text-[10px]' : 'text-[8.5px]'} font-bold select-none tracking-tight ${isMainSelected ? 'text-white' : ''}`}>{k.label}</span>;
            }
            return <span className={`${pitch >= 32 ? 'text-[11.5px]' : 'text-[9.5px]'} font-bold select-none ${isMainSelected ? 'text-white' : ''}`}>{k.label}</span>;
          };

          return (
            <button
              key={k.id}
              data-104-key={k.id}
              draggable={!isComboMode}
              onDragStart={(e) => !isComboMode && handleDragStart(e, k)}
              onClick={() => {
                if (isComboMode) {
                  setComboMainKey(k);
                } else {
                  handleKeyClick(k);
                }
              }}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              className={`border rounded-[6px] font-mono flex items-center justify-center shadow-2xs transition-colors px-0.5 tracking-tight ${
                isComboMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
              } ${
                isMainSelected
                  ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs z-10'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--primary-04)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-[var(--text-primary)] border-[var(--border-color)]'
              }`}
              title={isComboMode ? `选择【${k.label.replace('\n', ' ')}】作为组合键主键` : `可拖拽至上方键位替换，或点击分配【${k.label.replace('\n', ' ')}】`}
            >
              {renderKeyLabel()}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="panel-operation panel-operation-keybinds select-none">
      <div className="flex flex-col flex-1 min-h-0 justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* 功能分类导航栏 (对齐官方 8 大分类: 基础 | 特殊 | 多媒体 | 灯效 | 控制 | 组合键 | 鼠标 | 快捷指令) */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] shrink-0">
            <div className="flex items-center space-x-1.5">
              {[
                { id: 'basic', label: '基础' },
                { id: 'special', label: '特殊' },
                { id: 'media', label: '多媒体' },
                { id: 'lighting', label: '灯效' },
                { id: 'control', label: '控制' },
                { id: 'combo', label: '组合键' },
                { id: 'mouse', label: '鼠标' },
                { id: 'macro', label: '快捷指令' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-category-tab={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-[var(--info-color)] text-white shadow-xs'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--primary-04)] border border-[var(--border-color)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 右侧搜索框 */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="搜索按键或功能..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs focus:outline-none focus:border-[var(--info-color)] w-44 font-medium"
              />
            </div>
          </div>

          {/* 提示文案与当前目标受选键 */}
          <div className="text-[12px] text-[var(--text-tertiary)] py-1 flex items-center justify-between shrink-0">
            <span>拖拽下方按键或点击即可即时替换上方选中的目标按键</span>
            <span className="font-mono text-[var(--text-disabled)]">
              {selectedKeys.size > 0 ? (
                <span>目标受选键: <strong className="text-[var(--info-color)]">{Array.from(selectedKeys).map(k => k.replace('Key', '')).join(', ')}</strong></span>
              ) : (
                <span className="text-amber-600 font-bold">提示：尚未在上方选中按键</span>
              )}
            </span>
          </div>

          {/* 1. 基础按键分类 (104 全配列，高清晰度，完美对齐) */}
          {activeCategory === 'basic' && (
            <div 
              ref={basicKbRef}
              className="flex-1 overflow-x-auto overflow-y-hidden p-1.5 bg-[var(--bg-tertiary)]/70 rounded-[8px] border border-[var(--border-color)]/80 flex items-center justify-center min-h-0"
            >
              {render104Keyboard(false)}
            </div>
          )}

          {/* 2. 组合键分类 (关联按键修饰符 + 104键盘选择 + 触发按键预览与应用) */}
          {activeCategory === 'combo' && (
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-1.5 bg-[var(--bg-tertiary)]/70 rounded-[8px] border border-[var(--border-color)]/80 flex items-center justify-between gap-3 min-h-0">
              
              {/* 左侧：关联按键修饰符 (CTRL, SHIFT, WIN, ALT) */}
              <div className="flex flex-col gap-1 shrink-0 w-[68px]">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] text-center mb-0.5">关联按键</span>
                {['CTRL', 'SHIFT', 'WIN', 'ALT'].map((mod) => {
                  const isActive = selectedModifiers[mod];
                  return (
                    <button
                      key={mod}
                      onClick={() => toggleModifier(mod)}
                      className={`h-7 rounded-[7px] font-mono font-bold text-[11px] transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-white hover:bg-[var(--primary-04)]'
                      }`}
                    >
                      {mod}
                    </button>
                  );
                })}
              </div>

              {/* 中间：全配列主键选择器 (与基础分类 100% 相同排版与对齐) */}
              <div 
                ref={comboKbRef}
                className="flex-1 flex items-center justify-center min-w-0 h-full overflow-hidden"
              >
                {render104Keyboard(true)}
              </div>

              {/* 右侧：触发按键预览与应用按钮 */}
              <div className="flex flex-col justify-between items-center shrink-0 w-22 h-full max-h-[175px] py-0.5">
                <div className="flex flex-col items-center w-full">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)] text-center mb-1">触发按键</span>
                  <div className="w-full min-h-[38px] px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[7px] flex items-center justify-center font-mono font-bold text-xs text-[var(--info-color)] text-center shadow-2xs">
                    {[
                      ...Object.keys(selectedModifiers).filter(k => selectedModifiers[k]),
                      comboMainKey?.label
                    ].filter(Boolean).join(' + ') || '-'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCombo}
                  className="w-full py-1.5 bg-[var(--info-color)] hover:opacity-90 text-white font-bold text-xs rounded-[7px] shadow-xs cursor-pointer transition-all"
                >
                  应用
                </button>
              </div>

            </div>
          )}

          {/* 3. 特殊 / 多媒体 / 灯效 / 控制 / 鼠标 / 快捷指令 单键方帽网格排布 */}
          {['special', 'media', 'lighting', 'control', 'mouse', 'macro'].includes(activeCategory) && (
            <div className="flex-1 overflow-x-auto overflow-y-auto p-3 bg-[var(--bg-tertiary)]/70 rounded-[8px] border border-[var(--border-color)]/80 flex items-center min-h-0">
              <div className="flex flex-wrap items-center gap-2 select-none">
                {(SHORTCUT_CATEGORIES[activeCategory] || [])
                  .filter(item => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => renderKeycapButton(item))}
              </div>
            </div>
          )}

        </div>

        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11.5px] text-[var(--text-tertiary)] shrink-0">
          <span>支持 Windows 与 macOS 双系统模式切换 (Cmd ⌘ / Option ⌥)</span>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>改键映射已实时写入硬件</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  RotateCcw, 
  Trash2, 
  Sliders, 
  Zap, 
  HelpCircle,
  Keyboard,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Edit2,
  Lock,
  Mouse
} from 'lucide-react';
import { useToast } from './ToastProvider';
import { keyboardService } from '../services/keyboardService';
import { DV63_LAYOUT } from '../constants/dv63Layout';

// 星闪官方 7 大磁轴高级键定义
export const ADVANCED_TABS = [
  { id: 'SOCD', name: '设定优先 (SOCD)', code: 'SOCD', desc: '智能处理反向指令冲突', icon: '↔' },
  { id: 'RS', name: '迅洁 (RS)', code: 'RS', desc: '两个按键中会优先触发按下更深的按键', icon: '⚡' },
  { id: 'DKS', name: '动态键程 (DKS)', code: 'DKS', desc: '模拟一个按键按压深度实现4种功能', icon: '▦' },
  { id: 'MPT', name: '多段触发 (MPT)', code: 'MPT', desc: '单次按压过程中分阶段触发不同指令', icon: '≡' },
  { id: 'MT', name: '双效点击 (MT)', code: 'MT', desc: '一个按键绑定两种功能，按住为一种功能，单击...', icon: '⌥' },
  { id: 'TGL', name: '火力全开 (TGL)', code: 'TGL', desc: '按键状态持久化', icon: '⟲' },
  { id: 'END', name: '松开触发 (END)', code: 'END', desc: '松开按键时触发指定按键或功能', icon: '⤴' },
];

// 官方 7 大功能详细原理与说明
const MODE_INFOS = {
  SOCD: {
    title: '设定优先 (SOCD)',
    principle: '智能处理反向指令冲突',
    features: [
      '按住A键触发A，不松开A键的同时按住B，触发B',
      '按住A键触发A，不松开A键的同时按住B，触发A',
      '按住A键触发A，不松开A键的同时按住B，触发B',
      '按住A键触发A，不松开A键的同时按住B，AB键都是不触发',
    ],
    tip: '部分竞技游戏(CS2等)已禁用设定优先 (SOCD)功能，使用可能导致封号，请谨慎开启。',
  },
  DKS: {
    title: '动态键程 (DKS)',
    principle: '通过四段压力感应实现单键多重操作',
    features: [
      '一个按键，按下到松开的键程过程中，能触发 4 个按键',
    ],
    tip: '在CS2中可实现一键急停一键跳投功能',
  },
  MPT: {
    title: '多段触发 (MPT)',
    principle: '单次按压过程中分阶段触发不同指令',
    features: [
      '按下过程中可以阶段性触发三个按键，松开过程中逐一取消按键触发',
    ],
    tip: '《赛车计划》中：轻压转向微调/中压常规转向/重压急转',
  },
  MT: {
    title: '双效点击 (MT)',
    principle: '通过单击/长按触发两种独立功能',
    features: [
      '“快速”按压一次触发按键A(500ms内)，“长按”触发按键B(大于500ms)',
    ],
    tip: 'MOBA游戏中可设置智能施法',
  },
  TGL: {
    title: '火力全开 (TGL)',
    principle: '按键状态持久化',
    features: [
      '按压按键一次，按键一直触发，再按压一次，按键取消触发',
    ],
    tip: '火力全开 (TGL)功能可能违反“禁止宏”规则，建议在游戏前关闭。',
  },
  END: {
    title: '松开触发 (END)',
    principle: '按键回弹至设定位置时触发指令',
    features: [
      '按压按键时，触发A键，在松开按键时，瞬间触发一次B键',
    ],
    tip: '《osu!》中实现理论极限BPM，敲击后快速回弹触发',
  },
  RS: {
    title: '迅洁 (RS)',
    principle: '通过按压按键快速触发指令',
    features: [
      '当AB两键同时按压时，A键比B键按压更多，触发A键，当AB键同时触底，AB键都触发',
    ],
    tip: '在无畏契约中可实现急停功能',
  },
};

// 官方 DKS 逆向算法：7 点位布尔数组 -> 8-bit 整型 (0-255)
export const encodeDksTrps = (pts = []) => {
  let val = 0;
  if (pts[0]) val |= 1;
  if (pts[1]) val |= 2;
  if (pts[2]) val |= 4;
  if (pts[3]) { val |= 8; val |= 16; } // 触底 (0x18 = 24)
  if (pts[4]) val |= 32;
  if (pts[5]) val |= 64;
  if (pts[6]) val |= 128;
  return val;
};

// 官方 DKS 逆向算法：8-bit 整型 (0-255) -> 7 点位布尔数组
export const decodeDksTrps = (val = 0) => {
  const z = new Array(8);
  for (let i = 0; i < 8; i++) {
    z[i] = !!(val & (1 << i));
  }
  return [
    z[0],
    z[1],
    z[2],
    z[3] && z[4],
    z[5],
    z[6],
    z[7]
  ];
};

// 按键库矩阵 (9 列标准键帽矩阵 - 1:1 星闪官方布局)
const BASIC_KEY_MATRIX = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1!'],
  ['2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0)'],
  ['Space', '-_', '=+', '[{', ']}', '\\|', '#~', '::', '\'"'],
  ['`~', ',<', '.>', '/?', '→', '←', '↓', '↑', 'Enter'],
  ['Tab', 'Caps', 'Shift', 'Ctrl', 'Win', 'Alt', 'Backspace', 'Del', 'Esc']
];

const EXTENDED_KEY_MATRIX = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'],
  ['F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17'],
  ['F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24', 'PrtScr', 'Scroll'],
  ['Pause', 'Insert', 'Home', 'PgUp', 'Delete', 'End', 'PgDn', 'NumLock', 'PEnter'],
  ['音量+', '音量-', '静音', '上一曲', '下一曲', '播放', '计算器']
];

const MOUSE_CONTROL_KEYS = [
  '左键', '右键', '中键', '前进', '后退', '滚轮上', '滚轮下'
];

export const ACCORDION_BASIC_KEYS = BASIC_KEY_MATRIX.flat();
export const ACCORDION_EXTENDED_KEYS = EXTENDED_KEY_MATRIX.flat();
export const ACCORDION_MOUSE_KEYS = MOUSE_CONTROL_KEYS;

function renderKeycapLabel(key) {
  if (key === 'NumLock') {
    return (
      <span className="text-[8px] leading-[9px] text-center font-bold">
        Num<br />Lock
      </span>
    );
  }
  if (key === 'Backspace') {
    return <span className="text-[7.5px] leading-none whitespace-nowrap scale-90">Backspace</span>;
  }
  if (key === 'Delete') {
    return <span className="text-[8.5px] leading-none whitespace-nowrap scale-95">Delete</span>;
  }
  if (key === 'PEnter') {
    return <span className="text-[8.5px] leading-none whitespace-nowrap scale-95">PEnter</span>;
  }
  if (key === 'PrtScr') {
    return <span className="text-[8.5px] leading-none whitespace-nowrap scale-95">PrtScr</span>;
  }
  if (key === 'Scroll') {
    return <span className="text-[8.5px] leading-none whitespace-nowrap scale-95">Scroll</span>;
  }
  if (key === 'Insert' || key === 'Pause') {
    return <span className="text-[8.5px] leading-none whitespace-nowrap scale-95">{key}</span>;
  }
  if (key === 'Space') {
    return <span className="text-[9px] leading-none whitespace-nowrap">Space</span>;
  }
  if (key.length >= 4) {
    return <span className="text-[9px] leading-none whitespace-nowrap scale-95">{key}</span>;
  }
  if (key.length === 3 && /[\u4e00-\u9fa5]/.test(key)) {
    return <span className="text-[9px] leading-none whitespace-nowrap">{key}</span>;
  }
  return <span className="text-xs font-bold leading-none">{key}</span>;
}

const CHAR_TO_KEYCODE = {
  'A': 0x04, 'B': 0x05, 'C': 0x06, 'D': 0x07, 'E': 0x08, 'F': 0x09,
  'G': 0x0a, 'H': 0x0b, 'I': 0x0c, 'J': 0x0d, 'K': 0x0e, 'L': 0x0f,
  'M': 0x10, 'N': 0x11, 'O': 0x12, 'P': 0x13, 'Q': 0x14, 'R': 0x15,
  'S': 0x16, 'T': 0x17, 'U': 0x18, 'V': 0x19, 'W': 0x1a, 'X': 0x1b,
  'Y': 0x1c, 'Z': 0x1d,
  '1': 0x1e, '2': 0x1f, '3': 0x20, '4': 0x21, '5': 0x22,
  '6': 0x23, '7': 0x24, '8': 0x25, '9': 0x26, '0': 0x27,
  '1!': 0x1e, '2@': 0x1f, '3#': 0x20, '4$': 0x21, '5%': 0x22,
  '6^': 0x23, '7&': 0x24, '8*': 0x25, '9(': 0x26, '0)': 0x27,
  'Enter': 0x28, 'Esc': 0x29, 'Backspace': 0x2a, '退格': 0x2a, 'Back': 0x2a, 'Tab': 0x2b, 'Space': 0x2c,
  '-': 0x2d, '-_': 0x2d, '=': 0x2e, '=+': 0x2e, '[': 0x2f, '[{': 0x2f, ']': 0x30, ']}': 0x30, '\\': 0x31, '\\|': 0x31,
  '#~': 0x32, ';': 0x33, '::': 0x33, "'": 0x34, '\'"': 0x34, '`': 0x35, '`~': 0x35,
  ',': 0x36, ',<': 0x36, '.': 0x37, '.>': 0x37, '/': 0x38, '/?': 0x38,
  'Caps': 0x39, 'Shift': 0xe1, 'Ctrl': 0xe0, 'Alt': 0xe2, 'Win': 0xe3,
  'L-Ctrl': 0xe0, 'L-Shift': 0xe1, 'L-Alt': 0xe2, 'L-Gui': 0xe3,
  'R-Ctrl': 0xe4, 'R-Shift': 0xe5, 'R-Alt': 0xe6, 'R-Gui': 0xe7,
  'F1': 0x3a, 'F2': 0x3b, 'F3': 0x3c, 'F4': 0x3d, 'F5': 0x3e, 'F6': 0x3f,
  'F7': 0x40, 'F8': 0x41, 'F9': 0x42, 'F10': 0x43, 'F11': 0x44, 'F12': 0x45,
  'F13': 0x68, 'F14': 0x69, 'F15': 0x6a, 'F16': 0x6b, 'F17': 0x6c, 'F18': 0x6d,
  'F19': 0x6e, 'F20': 0x6f, 'F21': 0x70, 'F22': 0x71, 'F23': 0x72, 'F24': 0x73,
  'PrtScr': 0x46, 'Print': 0x46, 'Scroll': 0x47, 'Pause': 0x48, 'Insert': 0x49, 'Ins': 0x49,
  'Home': 0x4a, 'PgUp': 0x4b, 'Delete': 0x4c, 'Del': 0x4c, 'End': 0x4d, 'PgDn': 0x4e,
  '→': 0x4f, '←': 0x50, '↓': 0x51, '↑': 0x52,
  'Menu': 0x65, 'NumLock': 0x53, 'Num Lock': 0x53, 'PEnter': 0x58,
  '音量+': 0x78, '音量-': 0x79, '静音': 0x77, '上一曲': 0x73, '下一曲': 0x72, '播放': 0x76, '计算器': 0x7c,
  '鼠标左键': 0xc0, '左键': 0xc0,
  '鼠标右键': 0xc1, '右键': 0xc1,
  '鼠标中键': 0xc2, '中键': 0xc2,
  '前进': 0xc3, '后退': 0xc4,
  '滚轮上': 0xc9, '滚轮下': 0xca
};

const KEYCODE_TO_CHAR = Object.fromEntries(
  Object.entries(CHAR_TO_KEYCODE).map(([k, v]) => [v, k])
);

function getKeyCode(label) {
  if (!label) return 0;
  if (CHAR_TO_KEYCODE[label] !== undefined) return CHAR_TO_KEYCODE[label];
  const upper = String(label).toUpperCase();
  if (CHAR_TO_KEYCODE[upper] !== undefined) return CHAR_TO_KEYCODE[upper];
  const first = String(label).charAt(0);
  if (CHAR_TO_KEYCODE[first] !== undefined) return CHAR_TO_KEYCODE[first];
  return 0;
}

function formatKeyName(e) {
  if (!e) return '';
  const code = e.code || '';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ControlLeft') return 'L-Ctrl';
  if (code === 'ControlRight') return 'R-Ctrl';
  if (code === 'AltLeft') return 'L-Alt';
  if (code === 'AltRight') return 'R-Alt';
  if (code === 'ShiftLeft') return 'L-Shift';
  if (code === 'ShiftRight') return 'R-Shift';
  if (code === 'MetaLeft' || code === 'MetaRight') return 'Win';
  if (code === 'Space') return 'Space';
  if (code === 'Backspace') return 'Backspace';
  if (code === 'Enter') return 'Enter';
  if (code === 'Tab') return 'Tab';
  if (code === 'Escape') return 'Esc';
  if (code === 'CapsLock') return 'Caps';
  if (code === 'ArrowUp') return '↑';
  if (code === 'ArrowDown') return '↓';
  if (code === 'ArrowLeft') return '←';
  if (code === 'ArrowRight') return '→';
  return e.key?.toUpperCase() || code;
}

export const OFFICIAL_PRESET_HIGHER_KEYS = [
  { id: 'socd-W-E', type: 'SOCD', name: '设定优先 (SOCD)', keys: ['W', 'E'], desc: '后覆盖 · 0ms延迟', data: { bind1: 'W', bind2: 'E', triggerA: 'W', triggerB: 'E', mode: 0, delay: 0 } },
  { id: 'dks-V', type: 'DKS', name: '动态键程 (DKS - V)', keys: ['V'], desc: '绑定 [V] · 4阶触发行程 1.40 / 3.00mm', data: { bind: 'V', shallow: 1.40, deep: 3.00, rows: [
    { key: 'W', nodes: [false, false, true, true, true, false, false] },
    { key: 'Shift', nodes: [true, true, true, false, false, false, false] },
    { key: '', nodes: [false, false, false, false, false, false, false] },
    { key: '', nodes: [false, false, false, false, false, false, false] }
  ]} },
  { id: 'rs-B-N', type: 'RS', name: '迅洁 (RS)', keys: ['B', 'N'], desc: '双向急停', data: { bind1: 'B', bind2: 'N', triggerA: 'B', triggerB: 'N', delay: 0 } },
  { id: 'end-M', type: 'END', name: '松开触发 (END)', keys: ['M'], desc: '松开回弹瞬发', data: { bind: 'M', downKey: 'M', upKey: 'M', delay: 0 } },
];

/**
 * 具有平滑滑条与支持键盘直接精确输入的数值微调组件 (用于 MPT、MT、END、RS 等)
 */
export function TravelSliderStepper({
  value,
  onChange,
  min = 0.1,
  max = 4.0,
  step = 0.1,
  unit = 'mm',
  precision = 1
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(() => (value !== undefined && value !== null ? Number(value).toFixed(precision) : String(min)));

  useEffect(() => {
    if (!isEditing && value !== undefined && value !== null) {
      setInputText(Number(value).toFixed(precision));
    }
  }, [value, precision, isEditing]);

  const commitValue = (valStr) => {
    setIsEditing(false);
    const cleaned = String(valStr).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      const clamped = Math.min(Math.max(num, min), max);
      const rounded = parseFloat(clamped.toFixed(precision));
      onChange(rounded);
      setInputText(rounded.toFixed(precision));
    } else {
      const fallback = typeof value === 'number' ? value : min;
      setInputText(fallback.toFixed(precision));
    }
  };

  const handleMinus = () => {
    const cur = typeof value === 'number' ? value : min;
    const nextVal = Math.max(min, parseFloat((cur - step).toFixed(precision)));
    onChange(nextVal);
  };

  const handlePlus = () => {
    const cur = typeof value === 'number' ? value : min;
    const nextVal = Math.min(max, parseFloat((cur + step).toFixed(precision)));
    onChange(nextVal);
  };

  const currentVal = typeof value === 'number' && !isNaN(value) ? value : min;
  const pct = Math.max(0, Math.min(100, ((currentVal - min) / (max - min)) * 100));

  return (
    <div className="flex items-center gap-3 w-full">
      {/* 渐变高亮进度滑条 */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentVal}
          onChange={(e) => onChange(parseFloat(parseFloat(e.target.value).toFixed(precision)))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none bg-zinc-200 dark:bg-zinc-700"
          style={{
            background: `linear-gradient(to right, #0052ef 0%, #0052ef ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
          }}
        />
      </div>

      {/* 精确微调器与支持键盘直接打字的输入框 */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleMinus}
          disabled={currentVal <= min}
          className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed select-none"
          title="减少数值"
        >
          -
        </button>

        <div className="relative flex items-center">
          <input
            type="text"
            value={isEditing ? inputText : `${currentVal.toFixed(precision)} ${unit}`}
            onFocus={() => {
              setIsEditing(true);
              setInputText(String(currentVal.toFixed(precision)));
            }}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={(e) => commitValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
                setInputText(currentVal.toFixed(precision));
              }
            }}
            className="w-[66px] h-6 px-1 text-center font-mono font-bold text-[11px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded focus:border-[#0052ef] focus:ring-1 focus:ring-[#0052ef] focus:outline-none text-zinc-800 dark:text-zinc-100 shadow-2xs select-text"
            title="点击可直接使用键盘输入精确数值"
          />
        </div>

        <button
          type="button"
          onClick={handlePlus}
          disabled={currentVal >= max}
          className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed select-none"
          title="增加数值"
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * 右侧通用手风琴字符库抽屉 (所有高级键通用)
 */
export function KeyPaletteDrawer({
  activeAccordion,
  setActiveAccordion,
  assignKeyToActiveSlot,
  renderKeycapLabel
}) {
  return (
    <div className="w-[372px] flex flex-col gap-2.5 min-h-0 shrink-0 overflow-y-auto pr-0.5">
      {/* 1. 基本字符 */}
      {activeAccordion === 'basic' ? (
        <div className="w-full rounded-2xl border border-blue-500/40 overflow-hidden bg-[var(--bg-tertiary)] shadow-xs flex flex-col shrink-0">
          <button
            type="button"
            onClick={() => setActiveAccordion(null)}
            className="w-full px-5 py-3 bg-[var(--bg-tertiary)] flex items-center justify-between cursor-pointer select-none transition"
          >
            <span className="text-sm font-bold text-[#0052ef] dark:text-blue-400">基本字符</span>
            <ChevronUp className="w-4 h-4 text-[#0052ef] dark:text-blue-400 stroke-[2.5]" />
          </button>
          <div className="bg-[var(--bg-secondary)] p-3 rounded-b-2xl border-t border-[var(--border-color)]">
            <div className="grid grid-cols-9 gap-1.5">
              {BASIC_KEY_MATRIX.flat().map((ch) => (
                <button
                  key={ch}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', ch);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => assignKeyToActiveSlot(ch)}
                  className="h-[33px] w-full rounded-[6px] bg-[#24272e] hover:bg-[#323640] active:bg-[#1a1c22] border border-zinc-700/60 hover:border-[#0052ef] text-white font-bold flex items-center justify-center transition-all cursor-grab active:cursor-grabbing hover:scale-105 select-none shadow-xs"
                  title={`拖拽或点击填入: ${ch}`}
                >
                  {renderKeycapLabel(ch)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setActiveAccordion('basic')}
          className="w-full px-5 py-3 rounded-2xl bg-[#0052ef] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-between shadow-xs cursor-pointer transition select-none shrink-0"
        >
          <span>基本字符</span>
          <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      )}

      {/* 2. 扩展字符 */}
      {activeAccordion === 'extended' ? (
        <div className="w-full rounded-2xl border border-blue-500/40 overflow-hidden bg-[var(--bg-tertiary)] shadow-xs flex flex-col shrink-0">
          <button
            type="button"
            onClick={() => setActiveAccordion(null)}
            className="w-full px-5 py-3 bg-[var(--bg-tertiary)] flex items-center justify-between cursor-pointer select-none transition"
          >
            <span className="text-sm font-bold text-[#0052ef] dark:text-blue-400">扩展字符</span>
            <ChevronUp className="w-4 h-4 text-[#0052ef] dark:text-blue-400 stroke-[2.5]" />
          </button>
          <div className="bg-[var(--bg-secondary)] p-3 rounded-b-2xl border-t border-[var(--border-color)]">
            <div className="grid grid-cols-9 gap-1.5">
              {EXTENDED_KEY_MATRIX.flat().map((ch) => (
                <button
                  key={ch}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', ch);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => assignKeyToActiveSlot(ch)}
                  className="h-[33px] w-full rounded-[6px] bg-[#24272e] hover:bg-[#323640] active:bg-[#1a1c22] border border-zinc-700/60 hover:border-[#0052ef] text-white font-bold flex items-center justify-center transition-all cursor-grab active:cursor-grabbing hover:scale-105 select-none shadow-xs"
                  title={`拖拽或点击填入: ${ch}`}
                >
                  {renderKeycapLabel(ch)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setActiveAccordion('extended')}
          className="w-full px-5 py-3 rounded-2xl bg-[#0052ef] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-between shadow-xs cursor-pointer transition select-none shrink-0"
        >
          <span>扩展字符</span>
          <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      )}

      {/* 3. 鼠标控制 */}
      {activeAccordion === 'mouse' ? (
        <div className="w-full rounded-2xl border border-blue-500/40 overflow-hidden bg-[var(--bg-tertiary)] shadow-xs flex flex-col shrink-0">
          <button
            type="button"
            onClick={() => setActiveAccordion(null)}
            className="w-full px-5 py-3 bg-[var(--bg-tertiary)] flex items-center justify-between cursor-pointer select-none transition"
          >
            <span className="text-sm font-bold text-[#0052ef] dark:text-blue-400">鼠标控制</span>
            <ChevronUp className="w-4 h-4 text-[#0052ef] dark:text-blue-400 stroke-[2.5]" />
          </button>
          <div className="bg-[var(--bg-secondary)] p-3 rounded-b-2xl border-t border-[var(--border-color)]">
            <div className="grid grid-cols-4 gap-2">
              {MOUSE_CONTROL_KEYS.map((mKey) => (
                <button
                  key={mKey}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', mKey);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => assignKeyToActiveSlot(mKey)}
                  className="h-[36px] rounded-[6px] bg-[#24272e] hover:bg-[#323640] active:bg-[#1a1c22] border border-zinc-700/60 hover:border-[#0052ef] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-grab active:cursor-grabbing hover:scale-105 select-none shadow-xs px-1"
                  title={`拖拽或点击填入: ${mKey}`}
                >
                  <Mouse className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{mKey}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setActiveAccordion('mouse')}
          className="w-full px-5 py-3 rounded-2xl bg-[#0052ef] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-between shadow-xs cursor-pointer transition select-none shrink-0"
        >
          <span>鼠标控制</span>
          <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}

export default function AdvancedTab({
  deviceScopeKey = 'default',
  socdKeys = { keyA: null, keyB: null },
  onSocdKeysChange,
  layout = DV63_LAYOUT,
  selectedKeyFromApp = null,
  lastVirtualKeyClick = null,
  onConfiguredKeysChange,
  hwKeyCoords = null,
  findHwCoords: findHwCoordsProp
}) {
  const { addToast } = useToast();

  // 'overview' (概览列表与功能卡片) | 'editor' (单页直接编辑，不跳转第1/2步)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('advanced_view');
      if (q === 'editor') return 'editor';
    } catch {}
    return 'overview';
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('advanced_tab');
      if (q) return q.toUpperCase();
    } catch {}
    return 'SOCD';
  }); // 'SOCD' | 'RS' | 'DKS' | 'MPT' | 'MT' | 'TGL' | 'END'
  // 当前是否正在编辑已存在的配置项ID（若为 null 则表示新建模式）
  const [editingItemId, setEditingItemId] = useState(null);

  // 右侧抽屉手风琴折叠状态 ('basic' | 'extended' | 'mouse' | null) 1:1 星闪官方
  const [activeAccordion, setActiveAccordion] = useState('basic');

  // DKS 绑定的物理目标按键
  const [dksBind, setDksBind] = useState('');

  // 鼠标悬停高级键展示功能原理浮窗状态 (支持 url test_hover=SOCD 进行自动化实机验证)
  const [hoveredPrinciple, setHoveredPrinciple] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('test_hover');
      if (q && MODE_INFOS[q.toUpperCase()]) {
        return {
          modeId: q.toUpperCase(),
          coords: { top: 210, left: 450, placement: 'right' }
        };
      }
    } catch {}
    return null;
  });
  const hoverPrincipleTimerRef = useRef(null);
  const hidePrincipleTimerRef = useRef(null);

  const handleHoverPrincipleStart = (modeId, targetEl) => {
    if (!modeId || !MODE_INFOS[modeId]) return;
    if (hidePrincipleTimerRef.current) {
      clearTimeout(hidePrincipleTimerRef.current);
      hidePrincipleTimerRef.current = null;
    }
    if (hoverPrincipleTimerRef.current) {
      clearTimeout(hoverPrincipleTimerRef.current);
    }
    // 当前如果已有浮窗，切换仅需 80ms；首次触发自然延迟 300ms（防止快速划过误触）
    const delay = hoveredPrinciple ? 80 : 300;
    hoverPrincipleTimerRef.current = setTimeout(() => {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const popoverWidth = 390;
      const popoverHeight = 280;

      let left = rect.right + 12;
      let placement = 'right';
      if (left + popoverWidth > window.innerWidth - 16) {
        if (rect.left - popoverWidth - 12 > 16) {
          left = rect.left - popoverWidth - 12;
          placement = 'left';
        } else {
          left = Math.max(16, window.innerWidth - popoverWidth - 16);
          placement = 'bottom';
        }
      }

      let top = rect.top - 8;
      if (top + popoverHeight > window.innerHeight - 20) {
        top = Math.max(20, window.innerHeight - popoverHeight - 20);
      }
      if (top < 20) top = 20;

      setHoveredPrinciple({
        modeId,
        coords: { top, left, placement }
      });
    }, delay);
  };

  const handleHoverPrincipleEnd = () => {
    if (hoverPrincipleTimerRef.current) {
      clearTimeout(hoverPrincipleTimerRef.current);
      hoverPrincipleTimerRef.current = null;
    }
    hidePrincipleTimerRef.current = setTimeout(() => {
      setHoveredPrinciple(null);
    }, 150);
  };

  const handlePopoverMouseEnter = () => {
    if (hidePrincipleTimerRef.current) {
      clearTimeout(hidePrincipleTimerRef.current);
      hidePrincipleTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    hidePrincipleTimerRef.current = setTimeout(() => {
      setHoveredPrinciple(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverPrincipleTimerRef.current) clearTimeout(hoverPrincipleTimerRef.current);
      if (hidePrincipleTimerRef.current) clearTimeout(hidePrincipleTimerRef.current);
    };
  }, []);

  // 实时按键测试
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [releasedKeys, setReleasedKeys] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const label = formatKeyName(e);
      if (!label) return;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(label);
        return next;
      });
    };

    const handleKeyUp = (e) => {
      const label = formatKeyName(e);
      if (!label) return;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(label);
        return next;
      });
      setReleasedKeys((prev) => [label, ...prev.filter(k => k !== label)].slice(0, 6));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 已配置的高级键列表 (最大支持 20 个，按键盘设备唯一作用域强隔离)
  const [configuredList, setConfiguredList] = useState(() => {
    try {
      const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.id && !item.id.startsWith('draft-')).slice(0, 20);
        }
      }
    } catch (e) {}
    return [];
  });

  // 设备切换监听：当切换至新键盘设备时，强隔离重载该设备专属的高级键，并清空历史编辑态
  useEffect(() => {
    const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
    try {
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const list = parsed.filter(item => item && item.id && !item.id.startsWith('draft-')).slice(0, 20);
          setConfiguredList(list);
          setSelectedConfigId(null);
          setSelectedChar(null);
          setActiveSlot(null);
          setDksBind('');
          return;
        }
      }
    } catch (e) {}
    setConfiguredList([]);
    setSelectedConfigId(null);
    setSelectedChar(null);
    setActiveSlot(null);
    setDksBind('');
  }, [deviceScopeKey]);

  // 当前聚焦编辑的按键槽位 Slot
  const [activeSlot, setActiveSlot] = useState(null);
  // 当前在概览页选中的配置项与按键（避免强制跳转）
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);

  // 解析按键的物理硬件行列坐标 (优先传参探针/权威校验，回落布局树检索)
  const resolveKeyHwCoords = (charOrId) => {
    if (!charOrId) return null;
    if (typeof findHwCoordsProp === 'function') {
      const direct = findHwCoordsProp(charOrId);
      if (direct && typeof direct.row === 'number' && typeof direct.col === 'number') {
        return direct;
      }
    }
    const flatLayout = Array.isArray(layout) ? layout.flat() : [];
    const found = flatLayout.find(k => 
      k && (
        k.id === charOrId ||
        k.label === charOrId ||
        k.id === `Key${charOrId}` ||
        k.id === `Digit${charOrId}` ||
        (k.label && k.label.toUpperCase() === String(charOrId).toUpperCase())
      )
    );
    if (found) {
      if (typeof findHwCoordsProp === 'function') {
        const fromProp = findHwCoordsProp(found.id);
        if (fromProp && typeof fromProp.row === 'number' && typeof fromProp.col === 'number') {
          return fromProp;
        }
      }
      if (typeof found.row === 'number' && typeof found.col === 'number') {
        return { row: found.row, col: found.col };
      }
    }
    return null;
  };

  // 1. SOCD 状态配置
  const [socdState, setSocdState] = useState({
    bind1: '',
    bind2: '',
    triggerA: '',
    triggerB: '',
    mode: 0, // 0=最后激活覆盖, 1=绝对优先级(按键1), 2=绝对优先级(按键2), 3=相抵消
    delay: 0 // ms
  });
  const [showSocdDelayModal, setShowSocdDelayModal] = useState(false);
  const [tempSocdDelay, setTempSocdDelay] = useState(0);

  // 2. RS 状态配置
  const [rsState, setRsState] = useState({
    bind1: '',
    bind2: '',
    triggerA: '',
    triggerB: '',
    delay: 0
  });
  const [showRsDelayModal, setShowRsDelayModal] = useState(false);
  const [tempRsDelay, setTempRsDelay] = useState(0);

  // 3. DKS 动态键程状态配置 (严格对齐星闪官方规范: 浅层 1.40mm, 深层 3.00mm)
  const [dksTravelState, setDksTravelState] = useState({
    shallow: 1.40,
    deep: 3.00,
    focusGroup: 'shallow'
  });

  const [dksRows, setDksRows] = useState([
    { key: '', nodes: [false, false, true, true, true, false, false] },
    { key: '', nodes: [false, false, false, false, false, false, false] },
    { key: '', nodes: [false, false, false, false, false, false, false] },
    { key: '', nodes: [false, false, false, false, false, false, false] }
  ]);

  const [showDksTravelModal, setShowDksTravelModal] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('dks_modal') === 'true';
    } catch {}
    return false;
  });

  // 4. MPT 状态配置
  const [mptState, setMptState] = useState({
    bind: '',
    stages: [
      { key: '', depth: 0.5 },
      { key: '', depth: 1.0 },
      { key: '', depth: 1.5 }
    ]
  });

  // 5. MT 状态配置
  const [mtState, setMtState] = useState({
    bind: '',
    tapKey: '',
    holdKey: '',
    threshold: 200
  });
  const [showMtTimeModal, setShowMtTimeModal] = useState(false);
  const [tempMtThreshold, setTempMtThreshold] = useState(200);

  // 6. TGL 状态配置
  const [tglState, setTglState] = useState({
    bind: '',
    triggerKey: ''
  });

  // 7. END 状态配置
  const [endState, setEndState] = useState({
    bind: '',
    downKey: '',
    upKey: '',
    delay: 0
  });
  const [showEndDelayModal, setShowEndDelayModal] = useState(false);
  const [tempEndDelay, setTempEndDelay] = useState(0);

  // 同步通知外层 App.jsx 以在键盘上实时呈现徽标 (合并已保存列表与当前编辑草稿按键)
  useEffect(() => {
    let effectiveList = [...configuredList];
    if (viewMode === 'editor') {
      const currentEditingKeys = (() => {
        if (activeTab === 'SOCD') return [socdState?.bind1, socdState?.bind2].filter(Boolean);
        if (activeTab === 'RS') return [rsState?.bind1, rsState?.bind2].filter(Boolean);
        if (activeTab === 'DKS') return [dksBind].filter(Boolean);
        if (activeTab === 'MPT') return [mptState?.bind].filter(Boolean);
        if (activeTab === 'MT') return [mtState?.bind].filter(Boolean);
        if (activeTab === 'TGL') return [tglState?.bind].filter(Boolean);
        if (activeTab === 'END') return [endState?.bind].filter(Boolean);
        return [];
      })();

      if (currentEditingKeys.length > 0) {
        const filtered = effectiveList.filter(
          item => !item.keys.some(k => currentEditingKeys.includes(k))
        );
        const draftItem = {
          id: `draft-${activeTab}`,
          type: activeTab,
          keys: currentEditingKeys
        };
        effectiveList = [draftItem, ...filtered];
      }
    }
    onConfiguredKeysChange?.(effectiveList);
  }, [
    configuredList, 
    viewMode, 
    activeTab, 
    socdState?.bind1, 
    socdState?.bind2, 
    rsState?.bind1, 
    rsState?.bind2, 
    dksBind,
    mptState?.bind,
    mtState?.bind,
    tglState?.bind,
    endState?.bind
  ]);

  // 分配字符给当前聚焦槽位 (支持传入显式指定 explicitSlot)
  const assignKeyToActiveSlot = (char, explicitSlot = null) => {
    if (!char) return;
    const targetSlot = explicitSlot || activeSlot;

    if (targetSlot === 'socd_bind1') {
      if (socdState.bind2 && socdState.bind2 === char) {
        setSocdState(p => ({ ...p, bind1: char, bind2: '' }));
      } else {
        setSocdState(p => ({ ...p, bind1: char }));
      }
      if (!socdState.bind2) setActiveSlot('socd_bind2');
      else setActiveSlot(null);
      return;
    }
    if (targetSlot === 'socd_bind2') {
      if (socdState.bind1 && socdState.bind1 === char) {
        addToast({ message: '绑定按键2 不能与 按键1 相同', type: 'warning' });
        return;
      }
      setSocdState(p => ({ ...p, bind2: char }));
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'SOCD' && !explicitSlot) {
      if (!socdState.bind1) {
        setSocdState(p => ({ ...p, bind1: char }));
        setActiveSlot('socd_bind2');
        return;
      }
      if (!socdState.bind2) {
        if (char === socdState.bind1) {
          addToast({ message: '请选择不同的按键绑定为对冲互锁组（如 A 和 D）', type: 'warning' });
          return;
        }
        setSocdState(p => ({ ...p, bind2: char }));
        setActiveSlot(null);
        return;
      }
      if (char === socdState.bind1) {
        setActiveSlot('socd_bind1');
      } else if (char === socdState.bind2) {
        setActiveSlot('socd_bind2');
      } else {
        setSocdState(p => ({ ...p, bind2: char }));
        setActiveSlot(null);
      }
      return;
    }
    if (targetSlot === 'rs_bind1') {
      if (rsState.bind2 && rsState.bind2 === char) {
        setRsState(p => ({ ...p, bind1: char, bind2: '' }));
      } else {
        setRsState(p => ({ ...p, bind1: char }));
      }
      if (!rsState.bind2) setActiveSlot('rs_bind2');
      else setActiveSlot(null);
      return;
    }
    if (targetSlot === 'rs_bind2') {
      if (rsState.bind1 && rsState.bind1 === char) {
        addToast({ message: '绑定按键2 不能与 按键1 相同', type: 'warning' });
        return;
      }
      setRsState(p => ({ ...p, bind2: char }));
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'RS' && !explicitSlot) {
      if (!rsState.bind1) {
        setRsState(p => ({ ...p, bind1: char }));
        setActiveSlot('rs_bind2');
        return;
      }
      if (!rsState.bind2) {
        if (char === rsState.bind1) {
          addToast({ message: '请选择不同的按键绑定为急停互锁组（如 S 和 W）', type: 'warning' });
          return;
        }
        setRsState(p => ({ ...p, bind2: char }));
        setActiveSlot(null);
        return;
      }
      if (char === rsState.bind1) {
        setActiveSlot('rs_bind1');
      } else if (char === rsState.bind2) {
        setActiveSlot('rs_bind2');
      } else {
        setRsState(p => ({ ...p, bind2: char }));
        setActiveSlot(null);
      }
      return;
    }
    if (targetSlot === 'dks_bind') {
      setDksBind(char);
      setActiveSlot(null);
      return;
    }
    if (targetSlot?.startsWith('dks_row_')) {
      const idx = parseInt(targetSlot.replace('dks_row_', ''), 10);
      setDksRows(prev => {
        const next = [...prev];
        if (next[idx]) next[idx] = { ...next[idx], key: char };
        return next;
      });
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'DKS' && !explicitSlot) {
      if (!dksBind) {
        setDksBind(char);
        return;
      }
      const emptyIdx = dksRows.findIndex(r => !r.key);
      if (emptyIdx >= 0) {
        setDksRows(prev => {
          const next = [...prev];
          next[emptyIdx] = { ...next[emptyIdx], key: char };
          return next;
        });
      }
      return;
    }
    if (activeTab === 'MT') {
      if (targetSlot === 'bind' || targetSlot === 'mt_bind') setMtState(p => ({ ...p, bind: char }));
      else if (targetSlot === 'tap' || targetSlot === 'mt_tap') setMtState(p => ({ ...p, tapKey: char }));
      else if (targetSlot === 'hold' || targetSlot === 'mt_hold') setMtState(p => ({ ...p, holdKey: char }));
      else if (!mtState.bind) setMtState(p => ({ ...p, bind: char }));
      else if (!mtState.tapKey) setMtState(p => ({ ...p, tapKey: char }));
      else if (!mtState.holdKey) setMtState(p => ({ ...p, holdKey: char }));
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'TGL') {
      setTglState(p => ({ ...p, bind: char, triggerKey: char }));
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'END') {
      if (targetSlot === 'bind' || targetSlot === 'end_bind') setEndState(p => ({ ...p, bind: char, downKey: char, upKey: char }));
      else if (targetSlot === 'down' || targetSlot === 'end_down') setEndState(p => ({ ...p, downKey: char }));
      else if (targetSlot === 'up' || targetSlot === 'end_up') setEndState(p => ({ ...p, upKey: char }));
      else if (!endState.bind) setEndState(p => ({ ...p, bind: char, downKey: char, upKey: char }));
      else if (!endState.downKey) setEndState(p => ({ ...p, downKey: char }));
      else if (!endState.upKey) setEndState(p => ({ ...p, upKey: char }));
      setActiveSlot(null);
      return;
    }
    if (activeTab === 'MPT') {
      if (targetSlot === 'bind' || targetSlot === 'mpt_bind') {
        setMptState(p => ({ ...p, bind: char }));
      } else if (targetSlot?.startsWith('stage_')) {
        const sIdx = parseInt(targetSlot.replace('stage_', ''), 10);
        setMptState(p => {
          const nextStages = [...p.stages];
          if (nextStages[sIdx]) nextStages[sIdx] = { ...nextStages[sIdx], key: char };
          return { ...p, stages: nextStages };
        });
      } else if (!mptState.bind) {
        setMptState(p => ({ ...p, bind: char }));
      } else {
        const emptyIdx = mptState.stages.findIndex(s => !s.key);
        if (emptyIdx >= 0) {
          setMptState(p => {
            const nextStages = [...p.stages];
            nextStages[emptyIdx] = { ...nextStages[emptyIdx], key: char };
            return { ...p, stages: nextStages };
          });
        } else {
          setMptState(p => ({ ...p, bind: char }));
        }
      }
      setActiveSlot(null);
      return;
    }
  };

  // 监听上方虚拟键盘点击：在概览模式下不进行强制跳转！
  useEffect(() => {
    if (!lastVirtualKeyClick || !lastVirtualKeyClick.char) return;
    const { char } = lastVirtualKeyClick;

    if (viewMode === 'overview') {
      // 在概览模式下，点击键盘按键仅高亮/选中该按键已配置项，绝不强制跳转编辑！
      const existing = configuredList.find(it => it.keys && it.keys.includes(char));
      if (existing) {
        setSelectedConfigId(existing.id);
        setSelectedChar(char);
        addToast({ message: `按键 [${char}] 已配置高级功能: ${existing.name}`, type: 'info' });
      } else {
        setSelectedConfigId(null);
        setSelectedChar(char);
        addToast({ message: `已选中按键 [${char}]，点击左侧功能卡片可为其配置高级功能`, type: 'info' });
      }
      return;
    }

    // 在 editor 模式下：直接赋值给当前槽位或按规则默认分配
    if (activeSlot) {
      assignKeyToActiveSlot(char);
      addToast({ message: `已填充按键 [${char}] 到当前槽位`, type: 'info' });
    } else {
      assignKeyToActiveSlot(char);
      addToast({ message: `已分配按键 [${char}]`, type: 'info' });
    }
  }, [lastVirtualKeyClick]);

  // 打开特定配置的编辑界面
  const openEditForConfig = (item) => {
    setEditingItemId(item.id);
    setSelectedConfigId(item.id);
    setActiveTab(item.type);
    if (item.type === 'SOCD') {
      const d = item.data || {};
      setSocdState({
        bind1: d.bind1 || item.keys?.[0] || '',
        bind2: d.bind2 || item.keys?.[1] || '',
        triggerA: d.triggerA || item.keys?.[0] || '',
        triggerB: d.triggerB || item.keys?.[1] || '',
        mode: d.mode ?? 0,
        delay: d.delay ?? 0
      });
      setActiveSlot(null);
    } else if (item.type === 'RS') {
      const d = item.data || {};
      setRsState({
        bind1: d.bind1 || item.keys?.[0] || '',
        bind2: d.bind2 || item.keys?.[1] || '',
        triggerA: d.triggerA || item.keys?.[0] || '',
        triggerB: d.triggerB || item.keys?.[1] || '',
        delay: d.delay ?? 0
      });
      setActiveSlot(null);
    } else if (item.type === 'DKS') {
      const d = item.data || {};
      setDksBind(d.bind || item.keys?.[0] || '');
      if (d.shallow !== undefined) setDksTravelState(p => ({ ...p, shallow: d.shallow, deep: d.deep || 3.00 }));
      if (Array.isArray(d.rows)) {
        setDksRows(d.rows.map(r => ({
          key: r?.key || '',
          nodes: Array.isArray(r?.nodes) ? r.nodes : [false, false, false, false, false, false, false]
        })));
      } else {
        setDksRows([
          { key: '', nodes: [false, false, true, true, true, false, false] },
          { key: '', nodes: [false, false, false, false, false, false, false] },
          { key: '', nodes: [false, false, false, false, false, false, false] },
          { key: '', nodes: [false, false, false, false, false, false, false] }
        ]);
      }
      setActiveSlot(null);
    } else if (item.type === 'MT') {
      const d = item.data || {};
      setMtState({
        bind: d.bind || item.keys?.[0] || '',
        tapKey: d.tapKey || '',
        holdKey: d.holdKey || '',
        threshold: d.threshold || 200
      });
      setActiveSlot(null);
    } else if (item.type === 'TGL') {
      const d = item.data || {};
      setTglState({
        bind: d.bind || item.keys?.[0] || '',
        triggerKey: d.triggerKey || ''
      });
      setActiveSlot(null);
    } else if (item.type === 'END') {
      const d = item.data || {};
      setEndState({
        bind: d.bind || item.keys?.[0] || '',
        downKey: d.downKey || '',
        upKey: d.upKey || '',
        delay: d.delay ?? 0
      });
      setActiveSlot(null);
    } else if (item.type === 'MPT') {
      const d = item.data || {};
      setMptState({
        bind: d.bind || item.keys?.[0] || '',
        stages: d.stages || [
          { key: '', depth: 0.5 },
          { key: '', depth: 1.0 },
          { key: '', depth: 1.5 }
        ]
      });
      setActiveSlot(null);
    }
    setViewMode('editor');
  };

  // 启动新配置项创建
  const handleStartNewConfig = (type) => {
    setEditingItemId(null);
    setSelectedConfigId(null);
    setActiveTab(type);
    const initialChar = selectedChar || '';
    if (type === 'SOCD') {
      setSocdState({
        bind1: initialChar,
        bind2: '',
        triggerA: initialChar,
        triggerB: '',
        mode: 0,
        delay: 0
      });
      setActiveSlot(initialChar ? 'socd_bind2' : 'socd_bind1');
    } else if (type === 'RS') {
      setRsState({
        bind1: initialChar,
        bind2: '',
        triggerA: initialChar,
        triggerB: '',
        delay: 0
      });
      setActiveSlot(initialChar ? 'rs_bind2' : 'rs_bind1');
    } else if (type === 'DKS') {
      setDksBind(initialChar || '');
      setDksRows([
        { key: '', nodes: [false, false, true, true, true, false, false] },
        { key: '', nodes: [false, false, false, false, false, false, false] },
        { key: '', nodes: [false, false, false, false, false, false, false] },
        { key: '', nodes: [false, false, false, false, false, false, false] }
      ]);
      setActiveSlot(initialChar ? null : 'dks_bind');
    } else if (type === 'MT') {
      setMtState({ bind: initialChar, tapKey: initialChar, holdKey: initialChar, threshold: 200 });
      setActiveSlot(initialChar ? 'mt_tap' : 'mt_bind');
    } else if (type === 'TGL') {
      setTglState({ bind: initialChar, triggerKey: initialChar });
      setActiveSlot(initialChar ? 'tgl_trigger' : 'tgl_bind');
    } else if (type === 'END') {
      setEndState({ bind: initialChar, downKey: '', upKey: '', delay: 0 });
      setActiveSlot(initialChar ? 'end_down' : 'end_bind');
    } else if (type === 'MPT') {
      setMptState({
        bind: initialChar,
        stages: [
          { key: initialChar, depth: 0.5 },
          { key: '', depth: 1.0 },
          { key: '', depth: 1.5 }
        ]
      });
      setActiveSlot('mpt_bind');
    }
    setViewMode('editor');
  };

  // 取消当前编辑：丢弃临时修改，不保存并返回概览列表
  const handleCancelEdit = () => {
    setActiveSlot(null);
    setEditingItemId(null);
    setSelectedConfigId(null);
    setViewMode('overview');
    addToast({ message: '已返回高级配置主界面（未保存更改）', type: 'info' });
  };

  // 删除当前正编辑的高级键配置并清除板载闪存，随后返回概览主界面
  const handleDeleteCurrentEditorItem = async () => {
    if (editingItemId) {
      await handleDeleteConfig(editingItemId);
      setEditingItemId(null);
      setSelectedConfigId(null);
      setViewMode('overview');
      return;
    }
    let bindKeyToClear = null;
    if (activeTab === 'DKS') bindKeyToClear = dksBind;
    else if (activeTab === 'MPT') bindKeyToClear = mptState.bind;
    else if (activeTab === 'MT') bindKeyToClear = mtState.bind;
    else if (activeTab === 'TGL') bindKeyToClear = tglState.bind;
    else if (activeTab === 'END') bindKeyToClear = endState.bind;
    else if (activeTab === 'SOCD') bindKeyToClear = socdState.bind1;
    else if (activeTab === 'RS') bindKeyToClear = rsState.bind1;

    if (bindKeyToClear) {
      const coord = resolveKeyHwCoords(bindKeyToClear);
      if (coord) {
        try {
          await keyboardService.clearHigherKey({ row: coord.row, col: coord.col });
          await keyboardService.saveHigherKey();
        } catch (e) {
          console.warn('清除硬件配置失败:', e);
        }
      }
    }
    handleCancelEdit();
  };
  const handleDeleteCurrentDks = handleDeleteCurrentEditorItem;

  // 获取当前正在编辑的高级按键键名（用于工作台胶囊徽标 [ S ]）
  const getCurrentKeyLabel = () => {
    if (activeTab === 'DKS') return dksBind || selectedChar || '待选';
    if (activeTab === 'MPT') return mptState.bind || selectedChar || '待选';
    if (activeTab === 'TGL') return tglState.bind || selectedChar || '待选';
    if (activeTab === 'MT') return mtState.bind || selectedChar || '待选';
    if (activeTab === 'END') return endState.bind || selectedChar || '待选';
    if (activeTab === 'RS') {
      if (rsState.bind1 && rsState.bind2) return `${rsState.bind1}/${rsState.bind2}`;
      return rsState.bind1 || rsState.bind2 || selectedChar || '待选';
    }
    if (activeTab === 'SOCD') {
      if (socdState.bind1 && socdState.bind2) return `${socdState.bind1}/${socdState.bind2}`;
      return socdState.bind1 || socdState.bind2 || selectedChar || '待选';
    }
    return selectedChar || activeTab;
  };

  // 保存当前模式配置
  const handleSaveCurrentConfig = () => {
    let newItem = null;
    if (activeTab === 'SOCD') {
      if (!socdState.bind1 || !socdState.bind2) {
        addToast({ message: '请完整选择两个互锁绑定的按键（例如 A 和 D）', type: 'warning' });
        return;
      }
      if (socdState.bind1 === socdState.bind2) {
        addToast({ message: '绑定按键1 与 绑定按键2 不能为同一按键', type: 'warning' });
        return;
      }
      const b1 = socdState.bind1;
      const b2 = socdState.bind2;
      newItem = {
        id: `socd-${b1}-${b2}`,
        type: 'SOCD',
        name: `设定优先 (SOCD: ${b1} / ${b2})`,
        keys: [b1, b2],
        desc: `${['最后输入优先级', '绝对优先级(按键1)', '绝对优先级(按键2)', '中立相抵消'][socdState.mode] || '后输入优先'} · ${socdState.delay || 0}ms延迟`,
        data: { ...socdState, bind1: b1, bind2: b2, triggerA: b1, triggerB: b2 }
      };
      onSocdKeysChange?.({ keyA: `Key${b1}`, keyB: `Key${b2}` });
      const c1 = resolveKeyHwCoords(b1);
      const c2 = resolveKeyHwCoords(b2);
      if (c1 && c2) {
        const kc1 = getKeyCode(b1);
        const kc2 = getKeyCode(b2);
        keyboardService.setSocdBinding({
          row: c1.row,
          col: c1.col,
          row2: c2.row,
          col2: c2.col,
          kcs: [kc1, kc2],
          mode: socdState.mode,
          delay: socdState.delay
        }).catch(() => {});
      }
    } else if (activeTab === 'RS') {
      if (!rsState.bind1 || !rsState.bind2) {
        addToast({ message: '请完整选择两个互锁绑定的按键（例如 S 和 W）', type: 'warning' });
        return;
      }
      if (rsState.bind1 === rsState.bind2) {
        addToast({ message: '绑定按键1 与 绑定按键2 不能为同一按键', type: 'warning' });
        return;
      }
      const b1 = rsState.bind1;
      const b2 = rsState.bind2;
      newItem = {
        id: `rs-${b1}-${b2}`,
        type: 'RS',
        name: `迅洁 (RS: ${b1} / ${b2})`,
        keys: [b1, b2],
        desc: `${['相对运动急停', '绝对急停(按键1)', '绝对急停(按键2)'][rsState.mode] || '相对运动急停'} · ${rsState.delay || 0}ms延迟`,
        data: { ...rsState, bind1: b1, bind2: b2, triggerA: b1, triggerB: b2 }
      };
      const c1 = resolveKeyHwCoords(b1);
      const c2 = resolveKeyHwCoords(b2);
      if (c1 && c2) {
        const kc1 = getKeyCode(b1);
        const kc2 = getKeyCode(b2);
        keyboardService.setRsBinding({
          row: c1.row,
          col: c1.col,
          row2: c2.row,
          col2: c2.col,
          kcs: [kc1, kc2],
          delay: rsState.delay
        }).catch(() => {});
      }
    } else if (activeTab === 'DKS') {
      if (!dksBind) {
        addToast({ message: '请先绑定一个按键 (点击上方键盘按键或左上角绑定槽位)', type: 'warning' });
        setActiveSlot('dks_bind');
        return;
      }
      const activeKeys = dksRows.map(r => r.key).filter(Boolean);
      if (activeKeys.length === 0) {
        addToast({ message: '请至少为一个 DKS 动作分配按键', type: 'warning' });
        return;
      }
      newItem = {
        id: `dks-${dksBind}`,
        type: 'DKS',
        name: `动态键程 (DKS - ${dksBind})`,
        keys: [dksBind],
        desc: `绑定 [${dksBind}] · 行程 ${dksTravelState.shallow.toFixed(2)} / ${dksTravelState.deep.toFixed(2)}mm`,
        data: {
          bind: dksBind,
          shallow: dksTravelState.shallow,
          deep: dksTravelState.deep,
          rows: [...dksRows]
        }
      };

      // 实时向硬件板载写入 DKS
      const coord = resolveKeyHwCoords(dksBind);
      if (coord) {
        const kcs = dksRows.map(r => getKeyCode(r.key));
        const trps = dksRows.map(r => encodeDksTrps(r.nodes));
        const dbs = [Number(dksTravelState.shallow || 1.4), Number(dksTravelState.deep || 3.0)];
        keyboardService.setDksBinding({
          row: coord.row,
          col: coord.col,
          kcs,
          trps,
          dbs
        }).then((ok) => {
          if (ok) {
            addToast({ message: `DKS 已成功写入物理键盘 [${dksBind}] (行${coord.row}, 列${coord.col})`, type: 'success' });
          }
        }).catch(err => {
          console.warn('写入 DKS 失败:', err);
        });
      } else {
        console.warn('未能识别按键电气行列坐标:', dksBind);
      }
    } else if (activeTab === 'MT') {
      if (!mtState.bind) {
        addToast({ message: '请选择绑定按键', type: 'warning' });
        return;
      }
      newItem = {
        id: `mt-${mtState.bind}`,
        type: 'MT',
        name: '双效点击 (MT)',
        keys: [mtState.bind],
        desc: `短按[${mtState.tapKey}] 长按[${mtState.holdKey}] (${mtState.threshold}ms)`,
        data: { ...mtState }
      };
      const coord = resolveKeyHwCoords(mtState.bind);
      if (coord) {
        const tapKc = getKeyCode(mtState.tapKey || mtState.bind);
        const holdKc = getKeyCode(mtState.holdKey || mtState.bind);
        keyboardService.setMtBinding({
          row: coord.row,
          col: coord.col,
          kcs: [tapKc, holdKc],
          time: mtState.threshold
        }).catch(() => {});
      }
    } else if (activeTab === 'TGL') {
      if (!tglState.bind) {
        addToast({ message: '请选择绑定按键', type: 'warning' });
        return;
      }
      newItem = {
        id: `tgl-${tglState.bind}`,
        type: 'TGL',
        name: '火力全开 (TGL)',
        keys: [tglState.bind],
        desc: `状态切换锁定 [${tglState.triggerKey}]`,
        data: { ...tglState }
      };
      const coord = resolveKeyHwCoords(tglState.bind);
      if (coord) {
        const kc = getKeyCode(tglState.triggerKey || tglState.bind);
        keyboardService.setTglBind({
          row: coord.row,
          col: coord.col,
          kc
        }).catch(() => {});
      }
    } else if (activeTab === 'END') {
      if (!endState.bind) {
        addToast({ message: '请选择绑定按键', type: 'warning' });
        return;
      }
      newItem = {
        id: `end-${endState.bind}`,
        type: 'END',
        name: '松开触发 (END)',
        keys: [endState.bind],
        desc: `按下[${endState.downKey}] 松开[${endState.upKey}]`,
        data: { ...endState }
      };
      const coord = resolveKeyHwCoords(endState.bind);
      if (coord) {
        const downKc = getKeyCode(endState.downKey || endState.bind);
        const upKc = getKeyCode(endState.upKey || endState.bind);
        keyboardService.setEndBinding({
          row: coord.row,
          col: coord.col,
          kcs: [downKc, upKc],
          delay: endState.delay
        }).catch(() => {});
      }
    } else if (activeTab === 'MPT') {
      if (!mptState.bind) {
        addToast({ message: '请选择绑定按键 (点击上方键盘按键或槽位)', type: 'warning' });
        return;
      }
      const d0 = Number(mptState.stages?.[0]?.depth ?? 0);
      const d1 = Number(mptState.stages?.[1]?.depth ?? 0);
      const d2 = Number(mptState.stages?.[2]?.depth ?? 0);
      if (!(d0 < d1 && d1 < d2)) {
        addToast({ message: '三个深度值必须递增，每个值必须比前一个值大', type: 'warning' });
        return;
      }
      if (mptState.stages?.some(s => !s.key)) {
        addToast({ message: '请为所有三个阶段分配触发按键', type: 'warning' });
        return;
      }
      newItem = {
        id: `mpt-${mptState.bind}`,
        type: 'MPT',
        name: '多段触发 (MPT)',
        keys: [mptState.bind],
        desc: `3阶段深度触发 [${d0}mm / ${d1}mm / ${d2}mm]`,
        data: { ...mptState }
      };
      const coord = resolveKeyHwCoords(mptState.bind);
      if (coord) {
        const kcs = mptState.stages.map(s => getKeyCode(s.key));
        const dbs = mptState.stages.map(s => s.depth);
        keyboardService.setMptBinding({
          row: coord.row,
          col: coord.col,
          kcs,
          dbs
        }).catch(() => {});
      }
    }

    if (newItem) {
      // 若是编辑已有项且修改了绑定的按键，清理旧按键的硬件板载配置
      if (editingItemId) {
        const originalItem = configuredList.find(it => it.id === editingItemId);
        if (originalItem && Array.isArray(originalItem.keys)) {
          const keysToClear = originalItem.keys.filter(k => !newItem.keys.includes(k));
          for (const k of keysToClear) {
            const coord = resolveKeyHwCoords(k);
            if (coord) {
              keyboardService.clearHigherKey({ row: coord.row, col: coord.col }).catch(() => {});
            }
          }
        }
      }

      setConfiguredList(prev => {
        const filtered = prev.filter(it => it.id !== (editingItemId || newItem.id) && !it.keys.some(k => newItem.keys.includes(k)));
        const next = [newItem, ...filtered].slice(0, 20);
        try {
          const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {}
        onConfiguredKeysChange?.(next);
        return next;
      });
      setEditingItemId(null);
      setSelectedConfigId(null);
      addToast({ message: `已保存 ${newItem.name} 并应用到键盘`, type: 'success' });
      setViewMode('overview');
    }
  };

  // 删除某条配置
  const handleDeleteConfig = async (id) => {
    const item = configuredList.find(it => it.id === id);
    if (item && item.type === 'SOCD') {
      onSocdKeysChange?.({ keyA: null, keyB: null });
      try {
        localStorage.removeItem(`sparklink_socd_keys_${deviceScopeKey}`);
      } catch (e) {}
    }
    if (item && Array.isArray(item.keys)) {
      for (const k of item.keys) {
        const coord = resolveKeyHwCoords(k);
        if (coord) {
          try {
            await keyboardService.clearHigherKey({ row: coord.row, col: coord.col });
          } catch (e) {}
        }
      }
      try {
        await keyboardService.saveHigherKey();
      } catch (e) {}
    }
    setConfiguredList(prev => {
      const next = prev.filter(it => it.id !== id);
      try {
        const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {}
      onConfiguredKeysChange?.(next);
      return next;
    });
    addToast({ message: '已删除该高级键配置并同步键盘', type: 'info' });
  };

  // 清空全部
  const handleClearAll = async () => {
    for (const item of configuredList) {
      if (Array.isArray(item.keys)) {
        for (const k of item.keys) {
          const coord = resolveKeyHwCoords(k);
          if (coord) {
            try {
              await keyboardService.clearHigherKey({ row: coord.row, col: coord.col });
            } catch (e) {}
          }
        }
      }
    }
    try {
      await keyboardService.saveHigherKey();
    } catch (e) {}
    onSocdKeysChange?.({ keyA: null, keyB: null });
    try {
      localStorage.removeItem(`sparklink_socd_keys_${deviceScopeKey}`);
    } catch (e) {}
    setConfiguredList([]);
    try {
      const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
      localStorage.removeItem(storageKey);
    } catch (e) {}
    onConfiguredKeysChange?.([]);
    addToast({ message: '已清空当前设备的高级键配置并同步键盘', type: 'info' });
  };

  // 恢复出厂默认（清空高级键）
  const handleRestoreDefaults = () => {
    onSocdKeysChange?.({ keyA: null, keyB: null });
    try {
      localStorage.removeItem(`sparklink_socd_keys_${deviceScopeKey}`);
    } catch (e) {}
    setConfiguredList([]);
    try {
      const storageKey = `sparklink_configured_higher_keys_${deviceScopeKey}`;
      localStorage.removeItem(storageKey);
    } catch (e) {}
    onConfiguredKeysChange?.([]);
    addToast({ message: '已恢复出厂默认（清空当前设备的高级键配置）', type: 'info' });
  };

  // -------------------------------------------------------------
  // DKS 拖拽算法 (严格移植 gemini-code-1792041202901.html)
  // -------------------------------------------------------------
  const [dksDrag, setDksDrag] = useState({
    isDown: false,
    hasMoved: false,
    rowIndex: -1,
    startCol: -1,
    currentCol: -1,
    paintMode: true,
    snapshot: []
  });

  const getColFromClientX = (clientX, rect) => {
    const padding = 36;
    const effectiveWidth = rect.width - padding * 2;
    let ratio = (clientX - (rect.left + padding)) / effectiveWidth;
    ratio = Math.max(0, Math.min(1, ratio));
    return Math.round(ratio * 6);
  };

  const handleTrackMouseDown = (e, rIdx) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const startCol = getColFromClientX(e.clientX, rect);
    const snapshot = [...dksRows[rIdx].nodes];

    setDksDrag({
      isDown: true,
      hasMoved: false,
      rowIndex: rIdx,
      trackRect: rect,
      startCol: startCol,
      currentCol: startCol,
      paintMode: !snapshot[startCol],
      snapshot: snapshot
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dksDrag.isDown) return;
      const targetCol = getColFromClientX(e.clientX, dksDrag.trackRect);
      let nextDrag = { ...dksDrag };
      if (targetCol !== dksDrag.currentCol) {
        nextDrag.hasMoved = true;
        nextDrag.currentCol = targetCol;
      }
      if (nextDrag.hasMoved) {
        const nextNodes = [...dksDrag.snapshot];
        const minC = Math.min(dksDrag.startCol, nextDrag.currentCol);
        const maxC = Math.max(dksDrag.startCol, nextDrag.currentCol);
        for (let i = minC; i <= maxC; i++) {
          nextNodes[i] = dksDrag.paintMode;
        }
        setDksRows(prev => {
          const next = [...prev];
          next[dksDrag.rowIndex] = { ...next[dksDrag.rowIndex], nodes: nextNodes };
          return next;
        });
      }
      setDksDrag(nextDrag);
    };

    const handleMouseUp = () => {
      if (!dksDrag.isDown) return;
      const rIdx = dksDrag.rowIndex;
      const col = dksDrag.startCol;
      const nodes = [...dksRows[rIdx].nodes];

      if (!dksDrag.hasMoved) {
        nodes[col] = !dksDrag.snapshot[col];
        if (col % 2 === 1 && nodes[col]) {
          nodes[col - 1] = true;
          nodes[col + 1] = true;
        } else if (col % 2 === 0 && !nodes[col]) {
          if (col - 1 >= 0) nodes[col - 1] = false;
          if (col + 1 <= 6) nodes[col + 1] = false;
        }
      } else if (dksDrag.paintMode) {
        let minC = Math.min(dksDrag.startCol, dksDrag.currentCol);
        let maxC = Math.max(dksDrag.startCol, dksDrag.currentCol);
        if (minC % 2 === 1 && nodes[minC]) nodes[minC - 1] = true;
        if (maxC % 2 === 1 && nodes[maxC]) nodes[maxC + 1] = true;
      }

      // 清理孤立方块
      [1, 3, 5].forEach(b => {
        if (!nodes[b - 1] || !nodes[b + 1]) nodes[b] = false;
      });

      setDksRows(prev => {
        const next = [...prev];
        next[rIdx] = { ...next[rIdx], nodes };
        return next;
      });

      setDksDrag({
        isDown: false,
        hasMoved: false,
        rowIndex: -1,
        startCol: -1,
        currentCol: -1,
        paintMode: true,
        snapshot: []
      });
    };

    if (dksDrag.isDown) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dksDrag]);

  // 行程标尺弹窗交互算法 (gemini-code-1792041235190.md & gemini-code-1792041202901.html)
  const [rulerDrag, setRulerDrag] = useState({ active: false, target: 'shallow' });

  useEffect(() => {
    const handleRulerMove = (e) => {
      if (!rulerDrag.active) return;
      const trackEl = document.getElementById('barTrack');
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      let ratio = (e.clientY - rect.top) / rect.height;
      ratio = Math.max(0, Math.min(1, ratio));
      let mm = 0.1 + ratio * 3.2;
      mm = Math.round(mm * 100) / 100;

      setDksTravelState(prev => {
        if (rulerDrag.target === 'shallow') {
          return {
            ...prev,
            shallow: Math.min(Math.max(0.10, mm), +(prev.deep - 0.10).toFixed(2))
          };
        } else {
          return {
            ...prev,
            deep: Math.max(Math.min(3.30, mm), +(prev.shallow + 0.10).toFixed(2))
          };
        }
      });
    };

    const handleRulerUp = () => {
      if (rulerDrag.active) {
        setRulerDrag({ active: false, target: 'shallow' });
      }
    };

    if (rulerDrag.active) {
      window.addEventListener('mousemove', handleRulerMove);
      window.addEventListener('mouseup', handleRulerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleRulerMove);
      window.removeEventListener('mouseup', handleRulerUp);
    };
  }, [rulerDrag]);

  // 渲染槽位 Slot (普通尺寸)
  const renderSlot = (slotId, currentLabel, placeholder = '分配') => {
    const isActive = activeSlot === slotId;
    return (
      <button
        type="button"
        data-slot-id={slotId}
        onClick={() => setActiveSlot(isActive ? null : slotId)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const ch = e.dataTransfer.getData('text/plain');
          if (ch) {
            assignKeyToActiveSlot(ch, slotId);
            addToast({ message: `已将按键 [${ch}] 分配至槽位`, type: 'info' });
          }
        }}
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all cursor-pointer relative select-none shadow-xs ${
          isActive
            ? 'border-2 border-[#0052ef] ring-3 ring-[#0052ef]/20 bg-blue-50/80 dark:bg-blue-900/30 text-[#0052ef] dark:text-blue-300 scale-105'
            : currentLabel
            ? 'border-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-[#0052ef]'
            : 'border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#0052ef] bg-[#f4f5f7] dark:bg-zinc-800/50 text-zinc-500'
        }`}
        title="点击后在下方按键库或上方键盘选键，也可直接从上方键盘拖拽"
      >
        {currentLabel || <span className="text-xs font-normal text-zinc-400">{placeholder}</span>}
      </button>
    );
  };

  // 获取当前编辑模式下的绑定按键文本
  const getCurrentBindKey = () => {
    if (activeTab === 'DKS') return dksBind;
    if (activeTab === 'MPT') return mptState?.bind || '';
    if (activeTab === 'MT') return mtState?.bind || '';
    if (activeTab === 'TGL') return tglState?.bind || '';
    if (activeTab === 'END') return endState?.bind || '';
    if (activeTab === 'SOCD') return [socdState?.bind1, socdState?.bind2].filter(Boolean).join(' + ');
    if (activeTab === 'RS') return [rsState?.bind1, rsState?.bind2].filter(Boolean).join(' + ');
    return '';
  };

  // 渲染标准化按键槽位 (支持正方形与矩形圆角风格，统一样式与交互反馈)
  const renderKeySlot = (slotId, keyVal, placeholder = '+', widthClass = 'w-9', heightClass = 'h-9', roundedClass = 'rounded-[9px]', isSquare = true) => {
    const isActive = activeSlot === slotId;
    return (
      <div
        data-slot-id={slotId}
        onClick={() => setActiveSlot(isActive ? null : slotId)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={(e) => {
          e.preventDefault();
          const ch = e.dataTransfer.getData('text/plain');
          if (ch) {
            assignKeyToActiveSlot(ch, slotId);
            addToast({ message: `已将按键 [${ch}] 填入槽位`, type: 'info' });
          }
        }}
        className={`${widthClass} ${heightClass} ${roundedClass} ${isSquare ? 'aspect-square' : ''} flex items-center justify-center font-bold text-xs cursor-pointer transition-all select-none shrink-0 shadow-2xs ${
          isActive
            ? 'border-2 border-[#0052ef] bg-blue-50/90 dark:bg-blue-900/40 text-[#0052ef] dark:text-blue-300 ring-3 ring-blue-500/20 scale-105 shadow-xs'
            : keyVal
            ? 'border-2 border-solid border-[#0052ef] text-[#0052ef] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 text-sm hover:border-blue-400'
            : 'border-2 border-dashed border-zinc-400/90 dark:border-zinc-600 bg-white dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 hover:border-[#0052ef] hover:text-[#0052ef] hover:bg-blue-50/30'
        }`}
        title="点击后在右侧字符库或上方键盘分配按键，或直接从上方键盘拖拽"
      >
        {keyVal ? (
          renderKeycapLabel(keyVal)
        ) : placeholder === '' ? null : placeholder === '+' ? (
          <Plus className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        ) : (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{placeholder}</span>
        )}
      </div>
    );
  };

  // 渲染双按键绑定卡片组 (1:1 学习 Image 4: 正方形圆角卡片 + 状态指示圈 + 正方形按键槽)
  const renderDualBindingCards = (slot1Id, key1Val, label1, slot2Id, key2Val, label2) => {
    const cards = [
      { slotId: slot1Id, keyVal: key1Val, label: label1 },
      { slotId: slot2Id, keyVal: key2Val, label: label2 }
    ];
    return (
      <div className="flex items-center justify-center gap-5">
        {cards.map(({ slotId, keyVal, label }) => {
          const isActive = activeSlot === slotId;
          return (
            <div
              key={slotId}
              data-slot-id={slotId}
              onClick={() => setActiveSlot(isActive ? null : slotId)}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={(e) => {
                e.preventDefault();
                const ch = e.dataTransfer.getData('text/plain');
                if (ch) {
                  assignKeyToActiveSlot(ch, slotId);
                  addToast({ message: `已将按键 [${ch}] 填入${label}`, type: 'info' });
                }
              }}
              className={`w-[96px] h-[96px] rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all select-none shadow-2xs ${
                isActive
                  ? 'border-2 border-dashed border-[#0052ef] bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-blue-500/20 scale-102 shadow-xs'
                  : keyVal
                  ? 'border border-[#0052ef]/40 dark:border-blue-500/40 bg-zinc-50/90 dark:bg-zinc-800/80 hover:border-[#0052ef]'
                  : 'border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-[#0052ef]'
              }`}
            >
              {/* 右上角状态单选圈 (1:1 还原 Image 4) */}
              <div className="w-full flex justify-end">
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-[#0052ef] bg-[#0052ef]'
                    : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                }`}>
                  {isActive && <div className="w-1 h-1 rounded-full bg-white" />}
                </div>
              </div>

              {/* 中间正方形按键槽 (1:1 正方形圆角) */}
              <div className={`w-9 h-9 rounded-xl aspect-square flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                keyVal
                  ? 'bg-[#0052ef] text-white shadow-xs'
                  : isActive
                  ? 'bg-blue-100/90 dark:bg-blue-900/50 text-[#0052ef]'
                  : 'bg-zinc-200/80 dark:bg-zinc-700/70 text-zinc-400'
              }`}>
                {keyVal ? renderKeycapLabel(keyVal) : <Plus className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />}
              </div>

              {/* 底部标注 */}
              <span className={`text-[10.5px] font-bold truncate max-w-full ${
                isActive ? 'text-[#0052ef]' : 'text-zinc-600 dark:text-zinc-300'
              }`}>
                {keyVal ? `${label}: ${keyVal}` : `请选择${label}`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染单个主绑定按键卡片 (1:1 风格对标用户参考图 c2db3018.png: 虚线圆角卡片 + 状态指示圈 + 居中按键槽 + 底部说明)
  const renderSingleBindingCard = (slotId, keyVal, defaultLabel = '请选择按键') => {
    const isActive = activeSlot === slotId;
    return (
      <div
        data-slot-id={slotId}
        onClick={() => setActiveSlot(isActive ? null : slotId)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={(e) => {
          e.preventDefault();
          const ch = e.dataTransfer.getData('text/plain');
          if (ch) {
            assignKeyToActiveSlot(ch, slotId);
            addToast({ message: `已将按键 [${ch}] 设为主绑定按键`, type: 'info' });
          }
        }}
        className={`w-[104px] h-[104px] rounded-2xl p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all select-none shadow-2xs ${
          isActive
            ? 'border-2 border-dashed border-[#0052ef] bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-blue-500/20 scale-102 shadow-xs'
            : keyVal
            ? 'border-2 border-dashed border-[#0052ef]/60 dark:border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/10 hover:border-[#0052ef]'
            : 'border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-[#0052ef]'
        }`}
      >
        {/* 右上角状态单选圈 (1:1 还原 c2db3018.png) */}
        <div className="w-full flex justify-end">
          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
            isActive
              ? 'border-[#0052ef] bg-[#0052ef]'
              : keyVal
              ? 'border-blue-500 bg-blue-500'
              : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          }`}>
            {(isActive || keyVal) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </div>

        {/* 中间正方形按键槽 (1:1 正方形圆角) */}
        <div className={`w-10 h-10 rounded-xl aspect-square flex items-center justify-center font-bold text-sm transition-all shadow-2xs ${
          keyVal
            ? 'bg-[#0052ef] text-white shadow-xs'
            : isActive
            ? 'bg-blue-100/90 dark:bg-blue-900/50 text-[#0052ef]'
            : 'bg-zinc-200/80 dark:bg-zinc-700/70 text-zinc-400'
        }`}>
          {keyVal ? renderKeycapLabel(keyVal) : <Plus className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
        </div>

        {/* 底部标注 */}
        <span className={`text-[11px] font-bold truncate max-w-full leading-none ${
          isActive
            ? 'text-[#0052ef]'
            : keyVal
            ? 'text-zinc-800 dark:text-zinc-200'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}>
          {keyVal ? `已选: ${keyVal}` : defaultLabel}
        </span>
      </div>
    );
  };

  // -------------------------------------------------------------
  // 视图渲染
  // -------------------------------------------------------------
  return (
    <div className={`panel-operation panel-operation-bottom flex flex-col w-full select-none gap-2 relative ${viewMode === 'editor' ? '!p-2.5' : ''}`}>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 模式一：图三 1:1 官方主界面概览模式 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewMode === 'overview' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
          
          {/* ◄ 1. 左栏：选择高级功能配置 (占 5 列) ► */}
          <div className="lg:col-span-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] p-3.5 flex flex-col justify-between shadow-xs overflow-hidden h-full">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-color)] shrink-0">
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                  选择高级功能配置
                </h3>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  点击进入单页快速配置
                </span>
              </div>

              {/* 7 大功能卡片网格排布 (2 列，弹性伸展自适应撑满 50% 高度) */}
              <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {ADVANCED_TABS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-mode-id={item.id}
                    onMouseEnter={(e) => handleHoverPrincipleStart(item.id, e.currentTarget)}
                    onMouseLeave={handleHoverPrincipleEnd}
                    onClick={() => {
                      if (hoverPrincipleTimerRef.current) clearTimeout(hoverPrincipleTimerRef.current);
                      setHoveredPrinciple(null);
                      handleStartNewConfig(item.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const ch = e.dataTransfer.getData('text/plain');
                      if (ch) {
                        setEditingItemId(null);
                        setSelectedConfigId(null);
                        setSelectedChar(ch);
                        setActiveTab(item.id);
                        if (item.id === 'SOCD') {
                          setSocdState({ bind1: ch, bind2: '', triggerA: ch, triggerB: '', mode: 0, delay: 0 });
                          setActiveSlot('socd_bind2');
                        } else if (item.id === 'RS') {
                          setRsState({ bind1: ch, bind2: '', triggerA: ch, triggerB: '', delay: 0 });
                          setActiveSlot('rs_bind2');
                        } else if (item.id === 'DKS') {
                          setDksBind(ch);
                          setDksRows([
                            { key: '', nodes: [false, false, true, true, true, false, false] },
                            { key: '', nodes: [false, false, false, false, false, false, false] },
                            { key: '', nodes: [false, false, false, false, false, false, false] },
                            { key: '', nodes: [false, false, false, false, false, false, false] }
                          ]);
                          setActiveSlot(null);
                        } else if (item.id === 'MT') {
                          setMtState({ bind: ch, tapKey: ch, holdKey: ch, threshold: 200 });
                          setActiveSlot('mt_tap');
                        } else if (item.id === 'TGL') {
                          setTglState({ bind: ch, triggerKey: ch });
                          setActiveSlot(null);
                        } else if (item.id === 'END') {
                          setEndState({ bind: ch, downKey: ch, upKey: ch, delay: 0 });
                          setActiveSlot('end_up');
                        } else if (item.id === 'MPT') {
                          setMptState({
                            bind: ch,
                            stages: [
                              { key: ch, depth: 0.5 },
                              { key: '', depth: 1.0 },
                              { key: '', depth: 1.5 }
                            ]
                          });
                          setActiveSlot('mpt_bind');
                        }
                        setViewMode('editor');
                        addToast({ message: `已将按键 [${ch}] 载入 ${item.name} 配置`, type: 'info' });
                      }
                    }}
                    className="p-2 rounded-[8px] bg-slate-50/80 dark:bg-zinc-800/60 hover:bg-blue-50/60 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 hover:border-blue-400 dark:hover:border-blue-500 flex items-start gap-2 cursor-pointer transition shadow-2xs group text-left"
                  >
                    <div className="w-8 h-8 rounded-[6px] bg-blue-50/90 dark:bg-zinc-700/80 text-blue-600 dark:text-zinc-200 border border-blue-200/70 dark:border-zinc-600/60 flex flex-col items-center justify-center font-black text-[10px] font-mono leading-none shrink-0 shadow-2xs group-hover:bg-[#0052ef] group-hover:text-white dark:group-hover:bg-blue-600 transition">
                      <span className="text-[8.5px] scale-95 font-bold">{item.code}</span>
                      <span className="text-xs mt-0.5">{item.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                        {item.name}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 底栏提示 (移除独立按钮，改为悬浮功能原理说明引导) */}
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>💡 星闪磁轴极速算法 · 板载硬件存储</span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 select-none">
                <HelpCircle className="w-3.5 h-3.5 text-[#0052ef]" />
                鼠标悬浮高级键查看功能原理
              </span>
            </div>
          </div>

          {/* ▼ 2. 中栏：已配置列表 (占 4 列) ▼ */}
          <div className="lg:col-span-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] p-3 flex flex-col justify-between shadow-xs overflow-hidden h-full">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] shrink-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)]">已配置高级键</span>
                  <span className="text-xs font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-bold">
                    {configuredList.length}/20
                  </span>
                </div>
                {configuredList.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleRestoreDefaults}
                      className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                      title="恢复出厂预设"
                    >
                      恢复默认
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-rose-500 hover:text-rose-600 transition cursor-pointer"
                      title="清空全部高级键"
                    >
                      清空
                    </button>
                  </div>
                )}
              </div>

              {/* 列表滚动容器 (弹性伸展自适应撑满 50% 高度) */}
              <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5 mt-2">
                {configuredList.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 space-y-1">
                    <Sliders className="w-6 h-6 opacity-40" />
                    <p className="text-xs">暂无配置高级键</p>
                    <p className="text-xs text-[var(--text-secondary)]">点击左侧卡片直接为按键配置高级功能</p>
                  </div>
                ) : (
                  configuredList.map((item) => {
                    const isSelected = selectedConfigId === item.id || (selectedChar && item.keys?.includes(selectedChar));
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedConfigId(item.id);
                          openEditForConfig(item);
                        }}
                        className={`p-2 rounded-[6px] border transition flex items-center justify-between group shadow-2xs cursor-pointer ${
                          isSelected
                            ? 'border-[#0052ef] bg-blue-50/40 dark:bg-blue-900/20 ring-1 ring-[#0052ef]/40'
                            : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--info-color)]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0052ef] text-white font-mono font-bold text-xs shrink-0 shadow-2xs">
                            {item.type}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] truncate">
                              按键: <span className="font-mono font-semibold text-[var(--info-color)]">{(item.keys || []).join(', ')}</span> · {item.desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForConfig(item);
                            }}
                            className="p-1 rounded-[4px] hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-[var(--info-color)] transition cursor-pointer"
                            title="修改配置"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConfig(item.id);
                            }}
                            className="p-1 rounded-[4px] hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-disabled)] flex items-center justify-between">
              <span>最大支持 20 组硬件并发规则</span>
              <span className="font-mono text-emerald-500 font-bold">板载就绪</span>
            </div>
          </div>

          {/* ► 3. 右栏：实时按键测试看板 (占 3 列) ◄ */}
          <div className="lg:col-span-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[8px] p-3 flex flex-col justify-between shadow-xs h-full overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] shrink-0">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-[var(--info-color)]" />
                  按键测试
                </span>
                <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                  物理按压即显
                </span>
              </div>

              {/* 实时按下展示 */}
              <div className="mt-2.5 shrink-0">
                <span className="text-[10px] text-[var(--text-disabled)]">当前按下:</span>
                <div className="min-h-11 flex flex-wrap items-center gap-1.5 p-2 rounded-[6px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] mt-1">
                  {pressedKeys.size === 0 ? (
                    <span className="text-[10.5px] text-[var(--text-disabled)] font-mono">等待按键敲击...</span>
                  ) : (
                    Array.from(pressedKeys).map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded-[4px] bg-[#0052ef] text-white font-mono font-bold text-xs shadow-xs animate-in zoom-in-75 duration-75">
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* 历史抬起轨迹 */}
              <div className="mt-2.5 flex-1 min-h-0 flex flex-col">
                <span className="text-[10px] text-[var(--text-disabled)] shrink-0">抬起轨迹:</span>
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto py-1 flex-1">
                  {releasedKeys.length === 0 ? (
                    <span className="text-[10px] text-[var(--text-disabled)] font-mono">暂无历史</span>
                  ) : (
                    releasedKeys.map((k, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-[10px] text-[var(--text-secondary)] shrink-0">
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-disabled)] text-center shrink-0">
              按键物理防冲突检验通过
            </div>
          </div>

        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────── */
        /* 模式二：单页直达编辑工作台 (所有高级键统一 1:1 专业工作台) */
        /* ─────────────────────────────────────────────────────────── */
        <div className="flex-1 bg-[var(--bg-secondary)] rounded-[12px] border border-[var(--border-color)] px-3.5 py-1.5 flex flex-col justify-between shadow-xs min-h-0 overflow-hidden animate-in fade-in duration-150">
          
          {/* 核心工作区：左侧功能配置卡片 + 右侧手风琴字符库抽屉 */}
          <div className="flex items-stretch gap-3 w-full flex-1 min-h-0 overflow-hidden py-0.5">
            {/* 模块 1：左侧配置卡片 */}
            <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] px-2.5 py-2 flex flex-col justify-between shadow-2xs overflow-hidden">
              {/* 卡片顶栏：模式名称与绑定指示（彻底移除顶部的返回列表与右上角操作按钮） */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)] shrink-0 mb-0.5">
                <div className="flex items-center gap-3">
                  <span
                    onMouseEnter={(e) => handleHoverPrincipleStart(activeTab, e.currentTarget)}
                    onMouseLeave={handleHoverPrincipleEnd}
                    className="px-2 py-0.5 rounded-[4px] bg-[#0052ef] text-white font-mono font-bold text-xs shadow-2xs cursor-help select-none"
                    title="悬停查看原理说明"
                  >
                    {activeTab}
                  </span>
                  <span
                    onMouseEnter={(e) => handleHoverPrincipleStart(activeTab, e.currentTarget)}
                    onMouseLeave={handleHoverPrincipleEnd}
                    className="text-xs font-bold text-[var(--text-primary)] cursor-help select-none flex items-center gap-1.5"
                  >
                    <span>{MODE_INFOS[activeTab]?.title || activeTab}</span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400 hover:text-[#0052ef] transition-colors" />
                    <span className="font-normal text-zinc-400">{editingItemId ? '（编辑配置）' : '（新建配置）'}</span>
                  </span>

                  {/* 针对 DKS 显示快捷绑定槽位 */}
                  {activeTab === 'DKS' && (
                    <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-color)]">
                      <span className="text-xs font-bold text-[var(--text-secondary)]">绑定按键</span>
                      {renderKeySlot('dks_bind', dksBind, '+', 'w-[32px]', 'h-[32px]', 'rounded-[8px]')}
                    </div>
                  )}

                  {/* 针对 MPT, TGL, MT, END, RS, SOCD 显示模式标志说明 */}
                  {['MPT', 'TGL', 'MT', 'END', 'RS', 'SOCD'].includes(activeTab) && (
                    <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--border-color)]">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {activeTab === 'MPT' && '多段触发 (MPT)'}
                        {activeTab === 'TGL' && '按键状态锁定 (TGL)'}
                        {activeTab === 'MT' && '双效点击 (MT)'}
                        {activeTab === 'END' && '松开触发 (END)'}
                        {activeTab === 'RS' && '深度优先急停 (RS)'}
                        {activeTab === 'SOCD' && '设定优先 (SOCD)'}
                      </span>
                    </div>
                  )}
                </div>

                {activeSlot && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[var(--info-color)] text-[11px] font-semibold animate-pulse">
                    <span>正在等待按键选择...</span>
                  </div>
                )}
              </div>

              {/* 卡片主体：各种高级模式专属功能设置区域 */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col justify-between py-0.5">

                {/* 1. DKS 动态键程 */}
                {activeTab === 'DKS' && (
                  <div className="flex-1 flex flex-col justify-between py-0 min-h-0 select-none">
                    {/* 核心工作区：分为左侧 1/3 按键配置框与右侧 2/3 滑块轨道区 (对齐用户需求与参考图 4/5) */}
                    <div className="flex-1 flex gap-3 min-h-0 select-none py-1">
                      {/* 左侧 1/3 按键配置框 */}
                      <div className="w-[32%] min-w-[210px] max-w-[280px] flex flex-col justify-between bg-zinc-50/70 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 p-2.5 shadow-2xs">
                        {/* 顶部表头 */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60 shrink-0 h-[46px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-3.5 bg-[#0052ef] rounded-full shrink-0"></span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">动作按键</span>
                          </div>
                          <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-medium">4阶功能绑定</span>
                        </div>

                        {/* 4 动作按键配置槽位 (与右侧 4 轨道严格 1:1 垂直行对齐) */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          {dksRows.map((rawRow, rIdx) => {
                            const row = {
                              key: rawRow?.key || '',
                              nodes: Array.isArray(rawRow?.nodes) ? rawRow.nodes : [false, false, false, false, false, false, false]
                            };
                            const stageName = rIdx === 0 ? '初压' : rIdx === 1 ? '深压' : rIdx === 2 ? '初放' : '全放';
                            return (
                              <div
                                key={rIdx}
                                data-dks-row={rIdx}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const ch = e.dataTransfer.getData('text/plain');
                                  if (ch) {
                                    setDksRows(prev => {
                                      const next = [...prev];
                                      next[rIdx] = { ...next[rIdx], key: ch };
                                      return next;
                                    });
                                    setActiveSlot(null);
                                    addToast({ message: `已分配动作键 [${ch}] 到动作 ${rIdx + 1}`, type: 'info' });
                                  }
                                }}
                                className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-100/70 dark:hover:bg-zinc-700/40 transition-colors h-[28px]"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200 font-mono shrink-0">
                                    动作 {rIdx + 1}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate">
                                    {stageName}
                                  </span>
                                </div>
                                <div className="shrink-0 flex items-center">
                                  {renderKeySlot(`dks_row_${rIdx}`, row.key, '+', 'min-w-[64px] px-2', 'h-[26px]', 'rounded-[6px]', false)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 右侧 2/3 滑条轨道区 */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between relative bg-zinc-50/40 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 p-2.5 shadow-2xs">
                        {/* 整个轨道 + 标头工作区包装器 */}
                        <div className="relative flex-1 flex flex-col justify-between">
                          {/* 4 个分区的浅灰色竖线 (直接贯穿气泡底部至轨道最底端，置于滑条按键下方 z-[0]) */}
                          <div className="absolute inset-0 pointer-events-none z-[0]">
                            {[0, 2, 4, 6].map(cIdx => (
                              <div
                                key={cIdx}
                                style={{
                                  left: cIdx === 0 ? '36px' : cIdx === 6 ? 'calc(100% - 36px)' : `calc(36px + ${cIdx} * ((100% - 72px) / 6))`
                                }}
                                className="absolute top-[28px] bottom-1 w-[1.5px] bg-zinc-200 dark:bg-zinc-700/80 -translate-x-1/2"
                              />
                            ))}
                          </div>

                          {/* 顶部阶段标注与 4 数值气泡对齐区域 (带方形圆角框 + 放大清晰字体) */}
                          <div className="relative h-[46px] shrink-0 z-[10]">
                            {/* 顶部分组标题 1: 按键下压 */}
                            <div
                              style={{ left: 'calc(36px + 1 * ((100% - 72px) / 6))', transform: 'translateX(-50%)' }}
                              className="absolute top-0 text-center select-none pointer-events-none"
                            >
                              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <span className="text-blue-500 font-bold">↓</span> 按键下压
                              </span>
                            </div>

                            {/* 顶部分组标题 2: 按键释放 */}
                            <div
                              style={{ left: 'calc(36px + 5 * ((100% - 72px) / 6))', transform: 'translateX(-50%)' }}
                              className="absolute top-0 text-center select-none pointer-events-none"
                            >
                              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">↑</span> 按键释放
                              </span>
                            </div>

                            {/* Value 1: 按压起始 (Node 0) - 方形圆角框 */}
                            <div
                              style={{ left: '36px', transform: 'translateX(-50%)' }}
                              className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                              onClick={() => {
                                setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }));
                                setShowDksTravelModal(true);
                              }}
                              title="点击修改按键下压浅行程 (按压起始)"
                            >
                              <div className="px-2.5 py-0.5 rounded-[6px] border border-zinc-300/90 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-2xs group-hover:border-[#0052ef] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 transition-all flex items-center justify-center">
                                <span className="text-[12.5px] font-mono font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#0052ef] dark:group-hover:text-blue-400 transition-colors select-none leading-none">
                                  {dksTravelState.shallow.toFixed(2)}mm
                                </span>
                              </div>
                            </div>

                            {/* Value 2: 按压触底 (Node 2) - 方形圆角框 */}
                            <div
                              style={{ left: 'calc(36px + 2 * ((100% - 72px) / 6))', transform: 'translateX(-50%)' }}
                              className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                              onClick={() => {
                                setDksTravelState(p => ({ ...p, focusGroup: 'deep' }));
                                setShowDksTravelModal(true);
                              }}
                              title="点击修改按键下压深行程 (按压触底)"
                            >
                              <div className="px-2.5 py-0.5 rounded-[6px] border border-zinc-300/90 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-2xs group-hover:border-[#0052ef] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 transition-all flex items-center justify-center">
                                <span className="text-[12.5px] font-mono font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#0052ef] dark:group-hover:text-blue-400 transition-colors select-none leading-none">
                                  {dksTravelState.deep.toFixed(2)}mm
                                </span>
                              </div>
                            </div>

                            {/* Value 3: 触底抬起 (Node 4) - 方形圆角框 */}
                            <div
                              style={{ left: 'calc(36px + 4 * ((100% - 72px) / 6))', transform: 'translateX(-50%)' }}
                              className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                              onClick={() => {
                                setDksTravelState(p => ({ ...p, focusGroup: 'deep' }));
                                setShowDksTravelModal(true);
                              }}
                              title="点击修改按键释放深行程 (触底抬起)"
                            >
                              <div className="px-2.5 py-0.5 rounded-[6px] border border-zinc-300/90 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-2xs group-hover:border-[#0052ef] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 transition-all flex items-center justify-center">
                                <span className="text-[12.5px] font-mono font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#0052ef] dark:group-hover:text-blue-400 transition-colors select-none leading-none">
                                  {dksTravelState.deep.toFixed(2)}mm
                                </span>
                              </div>
                            </div>

                            {/* Value 4: 完全抬起 (Node 6) - 方形圆角框 */}
                            <div
                              style={{ left: 'calc(100% - 36px)', transform: 'translateX(-50%)' }}
                              className="absolute bottom-0 flex flex-col items-center group cursor-pointer"
                              onClick={() => {
                                setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }));
                                setShowDksTravelModal(true);
                              }}
                              title="点击修改按键释放浅行程 (完全抬起)"
                            >
                              <div className="px-2.5 py-0.5 rounded-[6px] border border-zinc-300/90 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-2xs group-hover:border-[#0052ef] group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/30 transition-all flex items-center justify-center">
                                <span className="text-[12.5px] font-mono font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#0052ef] dark:group-hover:text-blue-400 transition-colors select-none leading-none">
                                  {dksTravelState.shallow.toFixed(2)}mm
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4 条滑块轨道容器 */}
                          <div className="relative flex-1 flex flex-col justify-between py-1 z-[1]">
                            {/* 4 动作轨道 */}
                            {dksRows.map((rawRow, rIdx) => {
                              const row = {
                                key: rawRow?.key || '',
                                nodes: Array.isArray(rawRow?.nodes) ? rawRow.nodes : [false, false, false, false, false, false, false]
                              };
                              return (
                                <div
                                  key={rIdx}
                                  onMouseDown={(e) => handleTrackMouseDown(e, rIdx)}
                                  className="relative h-[28px] flex items-center cursor-pointer select-none"
                                >
                                  {/* 灰色底轨 */}
                                  <div
                                    style={{ left: '36px', right: '36px' }}
                                    className="absolute h-[2px] bg-zinc-200 dark:bg-zinc-700 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
                                  />

                                  {/* 蓝色连通线 */}
                                  {[0, 1, 2, 3, 4, 5].map((segIdx) => {
                                    const isSegActive = row.nodes[segIdx] && row.nodes[segIdx + 1];
                                    return (
                                      <div
                                        key={segIdx}
                                        style={{
                                          left: `calc(36px + ${segIdx} * ((100% - 72px) / 6))`,
                                          width: `calc((100% - 72px) / 6)`
                                        }}
                                        className={`absolute h-[3px] top-1/2 -translate-y-1/2 z-[1] pointer-events-none transition-colors duration-75 ${
                                          isSegActive ? 'bg-[#0052ef]' : 'bg-transparent'
                                        }`}
                                      />
                                    );
                                  })}

                                  {/* 拖拽高亮预览 */}
                                  {dksDrag.isDown && dksDrag.rowIndex === rIdx && dksDrag.hasMoved && (
                                    <div
                                      style={{
                                        left: `calc(36px + ${Math.min(dksDrag.startCol, dksDrag.currentCol)} * ((100% - 72px) / 6) - 10px)`,
                                        width: `calc(${Math.abs(dksDrag.currentCol - dksDrag.startCol)} * ((100% - 72px) / 6) + 20px)`
                                      }}
                                      className="absolute h-5 bg-blue-500/20 rounded-full top-1/2 -translate-y-1/2 z-[1] pointer-events-none"
                                    />
                                  )}

                                  {/* 7 个交互节点按钮 (圆/方交替) */}
                                  {row.nodes.map((isActive, cIdx) => {
                                    const isCircle = (cIdx % 2 === 0);
                                    const isAiming = dksDrag.isDown && dksDrag.rowIndex === rIdx && dksDrag.currentCol === cIdx;
                                    return (
                                      <div
                                        key={cIdx}
                                        style={{
                                          left: cIdx === 0 ? '36px' : cIdx === 6 ? 'calc(100% - 36px)' : `calc(36px + ${cIdx} * ((100% - 72px) / 6))`,
                                          transform: 'translateX(-50%)'
                                        }}
                                        className="absolute top-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center shrink-0 z-[2]"
                                      >
                                        <div
                                          className={`flex items-center justify-center font-bold text-[10.5px] transition-all duration-75 ${
                                            isCircle ? 'w-[18px] h-[18px] rounded-full' : 'w-[16px] h-[16px] rounded-[4px]'
                                          } ${
                                            isActive
                                              ? 'bg-[#0052ef] text-white shadow-xs'
                                              : 'bg-[#eaecf0] dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                          } ${
                                            isAiming ? 'scale-125 ring-2 ring-[#0052ef]/30' : 'hover:scale-115'
                                          }`}
                                        >
                                          +
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 底部功能条 (1:1 还原 Image 3) */}
                    <div className="flex items-center justify-between pt-1 mt-auto border-t border-zinc-100 dark:border-zinc-800 text-[10.5px] text-zinc-400 shrink-0">
                      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 truncate mr-2">
                        <span>💡 交互支持：按住鼠标左键左右拖拽可拉出/擦除连线；直接点击方块可连通。</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDksTravelModal(true)}
                        className="text-[#0052ef] hover:underline flex items-center gap-1 text-xs font-bold cursor-pointer transition shrink-0 ml-auto"
                      >
                        <Sliders className="w-3.5 h-3.5" /> 设置行程 ({dksTravelState.shallow.toFixed(2)} / {dksTravelState.deep.toFixed(2)}mm)
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. MPT 多段触发 (1:1 官方独立左右布局 + 大卡片主绑定按键 + 滑块微调器) */}
                {activeTab === 'MPT' && (() => {
                  const d0 = Number(mptState.stages?.[0]?.depth ?? 0);
                  const d1 = Number(mptState.stages?.[1]?.depth ?? 0);
                  const d2 = Number(mptState.stages?.[2]?.depth ?? 0);
                  const isIncreasing = d0 < d1 && d1 < d2;

                  return (
                    <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                      <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                        {/* 左栏：MPT 介绍与绑定按键 */}
                        <div className="w-[34%] flex flex-col justify-between pr-4 min-h-0">
                          <div className="shrink-0">
                            <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">高级按键类型</span>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              多段触发 (MPT)
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              磁轴高级键，可以通过下压不同深度依次触发不同阶段的按键。
                            </p>
                          </div>

                          {/* 居中主绑定按键卡片 (1:1 风格对标 c2db3018.png) */}
                          <div className="flex flex-col items-center justify-center my-auto py-1 min-h-0">
                            <span className="text-xs text-zinc-700 dark:text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-3 bg-[#0052ef] rounded-full"></span>
                              绑定按键
                            </span>
                            {renderSingleBindingCard('mpt_bind', mptState.bind, '请选择按键')}
                            <span className="text-[10.5px] text-zinc-400 mt-2 select-none">
                              深入下压此键触发各阶段按键
                            </span>
                          </div>
                        </div>

                        {/* 右栏：3 阶段触发配置 */}
                        <div className="flex-1 flex flex-col justify-between pl-4 min-w-0 min-h-0">
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                            <span>分段触发配置 (按压深度递增触发对应阶段按键)</span>
                            {!isIncreasing ? (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold animate-pulse">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                深度值必须递增
                              </span>
                            ) : (
                              <span className="text-[10.5px] text-[#0052ef] font-medium">支持直接用键盘输入精确 mm 数值</span>
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1 flex flex-col justify-center min-h-0 py-1">
                            {mptState.stages.map((stg, sIdx) => {
                              const isInvalidStage = (sIdx === 1 && d1 <= d0) || (sIdx === 2 && d2 <= d1);
                              return (
                                <div
                                  key={sIdx}
                                  className={`flex items-center gap-2.5 py-1 px-2.5 rounded-lg border transition-colors ${
                                    isInvalidStage
                                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600/80 shadow-2xs'
                                      : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-700/60 hover:border-blue-300 dark:hover:border-blue-800'
                                  }`}
                                >
                                  {/* 阶段按键槽位 */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-bold w-11 text-center ${isInvalidStage ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                      阶段 {sIdx + 1}
                                    </span>
                                    {renderKeySlot(`stage_${sIdx}`, stg.key, '+', 'w-[34px]', 'h-[34px]', 'rounded-[8px]')}
                                  </div>

                                  {/* 行程滑条与键盘精确微调输入器 */}
                                  <div className="flex-1 min-w-0">
                                    <TravelSliderStepper
                                      value={stg.depth}
                                      onChange={(val) => {
                                        setMptState(prev => {
                                          const nextStages = [...prev.stages];
                                          nextStages[sIdx] = { ...nextStages[sIdx], depth: val };
                                          return { ...prev, stages: nextStages };
                                        });
                                      }}
                                      min={0.1}
                                      max={4.0}
                                      step={0.1}
                                      unit="mm"
                                      precision={1}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10.5px] text-zinc-400 shrink-0">
                            <span>· 随着按键深入下压，依次触发对应设定的按键</span>
                            <span className="text-[#0052ef]">总键程范围: 0.1mm - 4.0mm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. MT 双效点击 (1:1 官方独立左右布局 + 单击/长按触发卡片 + 虚线下划线弹窗触发时间) */}
                {activeTab === 'MT' && (
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                    {/* 上半部分：左右分栏布局 */}
                    <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                      {/* 左栏：双效点击 (MT) 介绍与绑定按键 */}
                      <div className="w-[38%] flex flex-col justify-between pr-4 min-h-0">
                        <div className="shrink-0">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">高级按键类型</span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            双效点击 (MT)
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            磁轴高级键，可以通过单击和长按键盘触发不同的效果。
                          </p>
                        </div>

                        {/* 居中主绑定按键卡片 (1:1 风格对标 c2db3018.png) */}
                        <div className="flex flex-col items-center justify-center my-auto py-1 min-h-0">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#0052ef] rounded-full"></span>
                            绑定按键
                          </span>
                          {renderSingleBindingCard('mt_bind', mtState.bind, '请选择按键')}
                          <span className="text-[10.5px] text-zinc-400 mt-2 select-none">
                            单击或长按此键以触发右侧配置
                          </span>
                        </div>
                      </div>

                      {/* 右栏：触发按键配置 (单击触发 + 长按触发卡片) */}
                      <div className="flex-1 flex flex-col justify-between pl-4 min-w-0 min-h-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 shrink-0">
                          触发按键配置
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-2 min-h-0">
                          {/* 卡片 1: 单击触发 */}
                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">单击触发</span>
                              {renderKeySlot('mt_tap', mtState.tapKey, '', 'w-10', 'h-10', 'rounded-[10px]')}
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-300">
                              触发时间小于{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setTempMtThreshold(mtState.threshold || 200);
                                  setShowMtTimeModal(true);
                                }}
                                className="text-[#0052ef] font-bold border-b border-dotted border-[#0052ef] hover:opacity-80 transition cursor-pointer px-0.5"
                                title="点击修改触发时间"
                              >
                                {mtState.threshold || 200}ms
                              </button>
                            </div>
                          </div>

                          {/* 卡片 2: 长按触发 */}
                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">长按触发</span>
                              {renderKeySlot('mt_hold', mtState.holdKey, '', 'w-10', 'h-10', 'rounded-[10px]')}
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-300">
                              触发时间大于{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setTempMtThreshold(mtState.threshold || 200);
                                  setShowMtTimeModal(true);
                                }}
                                className="text-[#0052ef] font-bold border-b border-dotted border-[#0052ef] hover:opacity-80 transition cursor-pointer px-0.5"
                                title="点击修改触发时间"
                              >
                                {mtState.threshold || 200}ms
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. END 松开触发 (1:1 官方独立左右布局 + 按下/松开触发卡片 + 虚线下划线弹窗触发延迟) */}
                {activeTab === 'END' && (
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                    {/* 上半部分：左右分栏布局 */}
                    <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                      {/* 左栏：松开触发 (END) 介绍与绑定按键 */}
                      <div className="w-[38%] flex flex-col justify-between pr-4 min-h-0">
                        <div className="shrink-0">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">高级按键类型</span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            松开触发 (END)
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            磁轴高级键，可以通过按下和松开键盘触发不同的效果。
                          </p>
                        </div>

                        {/* 居中主绑定按键卡片 (1:1 风格对标 c2db3018.png) */}
                        <div className="flex flex-col items-center justify-center my-auto py-1 min-h-0">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#0052ef] rounded-full"></span>
                            绑定按键
                          </span>
                          {renderSingleBindingCard('end_bind', endState.bind, '请选择按键')}
                          <span className="text-[10.5px] text-zinc-400 mt-2 select-none">
                            按下与松开此键以分别触发不同按键
                          </span>
                        </div>
                      </div>

                      {/* 右栏：触发按键配置 (按下触发 + 松开触发卡片) */}
                      <div className="flex-1 flex flex-col justify-between pl-4 min-w-0 min-h-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 shrink-0">
                          触发按键配置
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-2 min-h-0">
                          {/* 卡片 1: 按下触发 (槽位) */}
                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">按下触发</span>
                              {renderKeySlot('end_down', endState.downKey, '', 'w-10', 'h-10', 'rounded-[10px]')}
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-300">
                              按下按键时立即触发对应按键
                            </div>
                          </div>

                          {/* 卡片 2: 松开触发 (槽位 + 触发延迟) */}
                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2 px-3 flex items-center gap-5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">松开触发</span>
                              {renderKeySlot('end_up', endState.upKey, '', 'w-10', 'h-10', 'rounded-[10px]')}
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-300">
                              触发延迟{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setTempEndDelay(endState.delay ?? 0);
                                  setShowEndDelayModal(true);
                                }}
                                className="text-[#0052ef] font-bold border-b border-dotted border-[#0052ef] hover:opacity-80 transition cursor-pointer px-0.5"
                                title="点击修改触发延迟"
                              >
                                {endState.delay ?? 0}ms
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. RS 迅洁 (结构与 SOCD 完全一致：仅绑定按键1与绑定按键2，右侧急停触发条件，双方互相绑定并互相显示) */}
                {activeTab === 'RS' && (
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                    {/* 上半部分：左右分栏布局 */}
                    <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                      {/* 左栏：绑定类型 & 仅两个按键绑定槽位 */}
                      <div className="flex-1 flex flex-col justify-between pr-2 min-h-0">
                        <div className="shrink-0">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">绑定类型</span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            迅洁 (RS)
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-snug">
                            会监听两个已选按键，当相反方向按键激活时立即急停复位，实现毫秒级快速变向与急停操作。
                          </p>
                        </div>

                        {/* 中部核心区：仅绑定按键1 与 绑定按键2 两个卡片式槽位 (1:1 学习 Image 4) */}
                        <div className="flex-1 flex flex-col items-center justify-center my-auto py-1 min-h-0">
                          {renderDualBindingCards('rs_bind1', rsState.bind1, '按键1', 'rs_bind2', rsState.bind2, '按键2')}

                          {/* 延迟时间 (可点击虚线下划线数字) */}
                          <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1 mt-1.5">
                            <span>延迟时间</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTempRsDelay(rsState.delay ?? 0);
                                setShowRsDelayModal(true);
                              }}
                              className="text-[#0052ef] font-bold border-b border-dotted border-[#0052ef] hover:opacity-80 transition cursor-pointer px-1 ml-0.5"
                              title="点击修改延迟时间"
                            >
                              {rsState.delay ?? 0}ms
                            </button>
                          </div>

                          {/* Image 4 提示气泡 */}
                          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-1.5 select-none shadow-2xs">
                            <span className="w-3.5 h-3.5 rounded-full bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900 font-bold text-[9px] flex items-center justify-center leading-none">
                              !
                            </span>
                            <span>请点击上方键盘或右侧字符库选择按键</span>
                          </div>
                        </div>
                      </div>

                      {/* 右栏：触发条件 */}
                      <div className="w-[280px] shrink-0 flex flex-col justify-between pl-4 min-w-0">
                        <div className="shrink-0 mb-1">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">触发条件</span>
                          <p className="text-xs text-zinc-400 leading-snug">
                            选择两个键触发时发生的急停互锁规则
                          </p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-2 py-1">
                          {[
                            { id: 0, title: '相对运动急停（双向互相急停）', desc: '后按键激活瞬间立即复位前按键，急停零延迟' },
                            { id: 1, title: `绝对急停（按键1${rsState.bind1 ? `: ${rsState.bind1}` : ''}优先）`, desc: '按键1激活时强制中断按键2并复位' },
                            { id: 2, title: `绝对急停（按键2${rsState.bind2 ? `: ${rsState.bind2}` : ''}优先）`, desc: '按键2激活时强制中断按键1并复位' },
                          ].map((opt) => {
                            const isSelected = (rsState.mode ?? 0) === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setRsState(p => ({ ...p, mode: opt.id }))}
                                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2 select-none ${
                                  isSelected
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0052ef] shadow-2xs'
                                    : 'bg-[#f8f9fa] dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-300'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition ${
                                    isSelected ? 'border-[#0052ef] bg-[#0052ef]' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#0052ef]' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                    {opt.title}
                                  </div>
                                  <div className="text-[10.5px] text-zinc-400 mt-0.5 leading-tight">
                                    {opt.desc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SOCD 设定优先 (1:1 对标官网 Image 2: 仅绑定按键1与绑定按键2，右侧触发条件，双方互相绑定并互相显示) */}
                {activeTab === 'SOCD' && (
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                    {/* 上半部分：左右分栏布局 */}
                    <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                      {/* 左栏：SOCD 介绍 + 仅两个绑定槽位 + 延迟时间 */}
                      <div className="flex-1 flex flex-col justify-between pr-2 min-h-0">
                        {/* 顶部标题与多行说明 */}
                        <div className="shrink-0">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">绑定类型</span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            SOCD
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-snug">
                            会监听两个已选按键，并根据设置规则触发对应输入。
                          </p>
                        </div>

                        {/* 中部核心区：仅绑定按键1 与 绑定按键2 两个卡片式槽位 (1:1 学习 Image 4) */}
                        <div className="flex-1 flex flex-col items-center justify-center my-auto py-1 min-h-0">
                          {renderDualBindingCards('socd_bind1', socdState.bind1, '按键1', 'socd_bind2', socdState.bind2, '按键2')}

                          {/* 延迟时间 (可点击虚线下划线数字) */}
                          <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1 mt-1.5">
                            <span>延迟时间</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSocdDelay(socdState.delay ?? 0);
                                setShowSocdDelayModal(true);
                              }}
                              className="text-[#0052ef] font-bold border-b border-dotted border-[#0052ef] hover:opacity-80 transition cursor-pointer px-1 ml-0.5"
                              title="点击修改延迟时间"
                            >
                              {socdState.delay ?? 0}ms
                            </button>
                          </div>

                          {/* Image 4 提示气泡 */}
                          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-1.5 select-none shadow-2xs">
                            <span className="w-3.5 h-3.5 rounded-full bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900 font-bold text-[9px] flex items-center justify-center leading-none">
                              !
                            </span>
                            <span>请点击上方键盘或右侧字符库选择按键</span>
                          </div>
                        </div>
                      </div>

                      {/* 右栏：触发条件 (1:1 复刻官网 Image 2) */}
                      <div className="w-[280px] shrink-0 flex flex-col justify-between pl-4 min-w-0">
                        <div className="shrink-0 mb-1">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">触发条件</span>
                          <p className="text-xs text-zinc-400 leading-snug">
                            选择两个键触发时选择一个发生的条件
                          </p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-2 py-1">
                          {[
                            { id: 0, title: '最后输入优先级', desc: '最后激活的按键会覆盖之前的按键' },
                            { id: 1, title: `绝对优先级（按键1${socdState.bind1 ? `: ${socdState.bind1}` : ''}）`, desc: '按键1始终优先于按键2' },
                            { id: 2, title: `绝对优先级（按键2${socdState.bind2 ? `: ${socdState.bind2}` : ''}）`, desc: '按键2始终优先于按键1' },
                            { id: 3, title: '相抵消', desc: '两个按键同时按下时互相抵消' },
                          ].map((opt) => {
                            const isSelected = (socdState.mode ?? 0) === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setSocdState(p => ({ ...p, mode: opt.id }))}
                                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2 select-none ${
                                  isSelected
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#0052ef] shadow-2xs'
                                    : 'bg-[#f8f9fa] dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-300'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition ${
                                    isSelected ? 'border-[#0052ef] bg-[#0052ef]' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#0052ef]' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                    {opt.title}
                                  </div>
                                  <div className="text-[10.5px] text-zinc-400 mt-0.5 leading-tight">
                                    {opt.desc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. TGL 按键状态锁定 (1:1 独立左右布局 + 大卡片主绑定按键) */}
                {activeTab === 'TGL' && (
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5 min-h-0">
                    <div className="flex-1 flex items-stretch divide-x divide-zinc-200 dark:divide-zinc-800 gap-6 min-h-0">
                      {/* 左栏：TGL 介绍与绑定按键 */}
                      <div className="w-[38%] flex flex-col justify-between pr-4 min-h-0">
                        <div className="shrink-0">
                          <span className="text-[11px] font-semibold text-zinc-400 block mb-0.5">高级按键类型</span>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            按键状态锁定 (TGL)
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            按压按键一次持久保持锁定状态（免长按）；再次按压该按键即可解除锁定。
                          </p>
                        </div>

                        {/* 居中主绑定按键卡片 (1:1 风格对标 c2db3018.png) */}
                        <div className="flex flex-col items-center justify-center my-auto py-1 min-h-0">
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 mb-2 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-3 bg-[#0052ef] rounded-full"></span>
                            绑定按键
                          </span>
                          {renderSingleBindingCard('tgl_bind', tglState.bind, '请选择按键')}
                          <span className="text-[10.5px] text-zinc-400 mt-2 select-none">
                            点击按键即可切换锁定 / 解除状态
                          </span>
                        </div>
                      </div>

                      {/* 右栏：触发特性说明卡片 */}
                      <div className="flex-1 flex flex-col justify-between pl-4 min-w-0 min-h-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 shrink-0">
                          触发按键配置与应用场景
                        </div>

                        <div className="flex-1 flex flex-col justify-center gap-2.5 min-h-0">
                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2.5 px-3.5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 rounded-full bg-[#0052ef]" />
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">持续锁定触发</span>
                            </div>
                            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              按下一次该按键，硬件将持续向主机发送按下信号（等同于物理一直按住不放）。
                            </p>
                          </div>

                          <div className="bg-[#f8f9fa] dark:bg-zinc-800/50 rounded-xl py-2.5 px-3.5 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">再次点击解除</span>
                            </div>
                            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              再次按下该按键时，硬件立即释放该按键信号，恢复常态。非常适合射击游戏持续开火、大地图自动奔跑等场景。
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 shrink-0">
                          <span>· 适合自动奔跑、持续开火、技能长按等特殊操作</span>
                          <span className="text-[#0052ef] font-semibold">免物理长按</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* 统一卡片底部操作栏：所有高级键统一保留底部的返回列表 / 确定与取消 */}
              <div className="pt-1.5 mt-0 border-t border-[var(--border-color)] flex items-center justify-center gap-4 shrink-0 relative">
                {editingItemId && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentEditorItem}
                    className="absolute left-0 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                    title="从物理键盘和配置列表彻底删除此项高级按键"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 删除配置
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveCurrentConfig}
                  className="min-w-[100px] px-5 py-1.5 rounded-xl bg-[#0052ef] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> 确定
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="min-w-[100px] px-5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] active:scale-95 text-[var(--text-primary)] font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" /> 取消
                </button>
              </div>
            </div>

            {/* 模块 2：右侧手风琴字符库抽屉 (所有高级键子界面统一携带！) */}
            <KeyPaletteDrawer
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
              assignKeyToActiveSlot={assignKeyToActiveSlot}
              renderKeycapLabel={renderKeycapLabel}
            />
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* 模块 3：“设置行程”双游标标尺弹窗 (Modal) (1:1 严格复刻！) */}
      {/* ============================================================= */}
      {showDksTravelModal && (
        <div 
          onClick={() => setShowDksTravelModal(false)}
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl w-[840px] max-w-[95vw] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-150 flex flex-col gap-5"
          >
            {/* Modal Top */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-5 bg-[#0052ef] rounded-full" />
                <span className="font-title text-lg tracking-wide text-zinc-900 dark:text-zinc-100">
                  设置行程
                </span>
                <span className="text-xs text-zinc-400 font-normal ml-1">
                  配置 DKS 四阶动作触发深度
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDksTravelModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Content (3 栏布局: 剖面图 / 标尺 / 设置卡片) */}
            <div className="flex items-stretch justify-between gap-6 px-1">
              
              {/* 1. 左侧：2D 工程剖面线稿 SVG 磁轴示意图 (带轴心下压与弹簧压缩物理动画) */}
              <div className="flex flex-col items-center justify-between w-[170px] shrink-0 py-1">
                {(() => {
                  const activeMm = (dksTravelState.focusGroup === 'shallow') ? dksTravelState.shallow : dksTravelState.deep;
                  const ratio = (activeMm - 0.1) / 3.2; // 0 ~ 1
                  const travelPx = ratio * 22; // 最大物理位移 22px
                  const origHeight = 54;
                  const newScaleY = (origHeight - travelPx) / origHeight;

                  return (
                    <svg width="160" height="190" viewBox="0 0 160 190">
                      {/* A. 静态上盖与底座外壳 */}
                      <g stroke="#b4b8bf" strokeWidth="1.2" fill="none" strokeLinejoin="round">
                        <path d="M 30,96 L 34,64 C 35,54 41,50 48,50 L 55,50 L 55,96 Z" fill="#f4f6f8" />
                        <path d="M 38,96 L 38,66 C 38,59 42,55 47,55 L 51,55 L 51,96 Z" fill="#eef0f4" />
                        <path d="M 101,50 L 106,50 L 130,92 L 130,96 L 101,96 Z" fill="#f4f6f8" />
                        <rect x="52" y="44" width="3" height="52" fill="#e6e9ef" />
                        <rect x="101" y="44" width="3" height="52" fill="#e6e9ef" />
                        <rect x="26" y="96" width="108" height="4" fill="#eaedf2" />
                        <path d="M 28,100 L 128,100 L 128,144 L 32,144 L 32,100 Z" fill="#f7f8fa" />
                        <path d="M 26,100 L 32,100 L 32,134 L 28,134 L 28,118 L 25,115 L 28,112 Z" fill="#eaedf2" />
                        <path d="M 128,100 L 132,100 L 132,110 L 129,114 L 131,117 L 128,125 Z" fill="#eaedf2" />
                        <rect x="104" y="100" width="24" height="24" fill="#eff1f5" />
                        <rect x="104" y="124" width="24" height="20" fill="#eaedf2" />
                        <path d="M 38,100 L 55,100 L 55,134 L 38,134 Z" fill="#eff1f5" />
                        <rect x="32" y="140" width="22" height="4" fill="#eaedf2" />
                        <rect x="55" y="96" width="46" height="38" fill="#ffffff" />
                        <line x1="55" y1="134" x2="101" y2="134" stroke="#9aa0a8" strokeWidth="1.5" />
                        <path d="M 73,144 L 83,144 L 83,157 L 80,164 L 76,164 L 73,157 Z" fill="#f0f2f5" />
                        <line x1="78" y1="144" x2="78" y2="160" stroke="#b4b8bf" strokeWidth="1.2" />
                      </g>

                      {/* B. 可动轴心与磁铁组件 (向下平移 translateY) */}
                      <g id="cadStemGroup" style={{ transform: `translateY(${travelPx.toFixed(2)}px)` }}>
                        <rect x="55" y="18" width="46" height="62" fill="#ffffff" stroke="#9aa0a8" strokeWidth="1.2" />
                        <rect x="60" y="19" width="11" height="28" fill="#f2f4f7" stroke="#8c929b" strokeWidth="1.3" />
                        <rect x="73" y="19" width="10" height="28" fill="#eaedf2" stroke="#8c929b" strokeWidth="1.3" />
                        <rect x="85" y="19" width="11" height="28" fill="#f2f4f7" stroke="#8c929b" strokeWidth="1.3" />
                        <polygon points="61,80 68,54 88,54 95,80" fill="#f2f4f7" stroke="#9aa0a8" strokeWidth="1.2" />
                        <rect x="55" y="75" width="7" height="19" fill="#c2c7d0" stroke="#8c929b" strokeWidth="1.2" />
                        <rect x="94" y="75" width="7" height="19" fill="#c2c7d0" stroke="#8c929b" strokeWidth="1.2" />
                      </g>

                      {/* C. 动态压缩螺旋弹簧 (以 y=132 底部锚定缩放) */}
                      <g stroke="#7d838c" strokeWidth="1.4" fill="none" strokeLinecap="round">
                        <g 
                          id="springCoils"
                          transform={`translate(0, 132) scale(1, ${newScaleY.toFixed(3)}) translate(0, -132)`}
                        >
                          <line x1="57" y1="78" x2="99" y2="78" strokeWidth="1.6" />
                          <line x1="57" y1="84" x2="99" y2="79" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="84" x2="99" y2="87" />
                          <line x1="57" y1="93" x2="99" y2="87" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="93" x2="99" y2="96" />
                          <line x1="57" y1="102" x2="99" y2="96" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="102" x2="99" y2="105" />
                          <line x1="57" y1="111" x2="99" y2="105" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="111" x2="99" y2="114" />
                          <line x1="57" y1="120" x2="99" y2="114" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="120" x2="99" y2="123" />
                          <line x1="57" y1="129" x2="99" y2="123" stroke="#c0c4cc" strokeDasharray="2,2" />
                          <line x1="57" y1="129" x2="99" y2="132" />
                          <line x1="57" y1="132" x2="99" y2="132" strokeWidth="1.6" />
                        </g>
                      </g>
                    </svg>
                  );
                })()}
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 text-center select-none">
                  动态示意图仅供参考
                </div>
              </div>

              {/* 2. 中间刻度尺与双黑线滑块柱 */}
              <div className="flex flex-col items-center justify-between w-[130px] shrink-0 py-1">
                <div className="flex items-stretch h-[240px] gap-2">
                  {/* 刻度列表 */}
                  <div className="relative w-11 h-full font-mono text-[10px] text-zinc-400">
                    {Array.from({ length: 33 }).map((_, i) => {
                      const mmVal = +(0.1 + i * 0.1).toFixed(1);
                      const isMajor = (i % 4 === 0);
                      const pct = (i / 32) * 100;
                      return (
                        <div
                          key={i}
                          style={{ top: `${pct}%` }}
                          className="absolute right-0 -translate-y-1/2 flex items-center justify-end gap-1"
                        >
                          {isMajor && <span className="tabular-nums">{mmVal.toFixed(1)}</span>}
                          <div className={`h-[1px] bg-zinc-400 ${isMajor ? 'w-2 bg-zinc-600' : 'w-1'}`} />
                        </div>
                      );
                    })}
                  </div>

                  {/* 滑块柱 */}
                  <div
                    id="barTrack"
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickMm = 0.1 + ((e.clientY - rect.top) / rect.height) * 3.2;
                      const distShallow = Math.abs(clickMm - dksTravelState.shallow);
                      const distDeep = Math.abs(clickMm - dksTravelState.deep);
                      const target = (distShallow <= distDeep) ? 'shallow' : 'deep';
                      setRulerDrag({ active: true, target });
                      setDksTravelState(p => ({ ...p, focusGroup: target }));
                    }}
                    className="relative w-9 h-full bg-[#f2f3f5] dark:bg-zinc-800 rounded-lg cursor-ns-resize overflow-hidden"
                  >
                    {/* 中间灰色填充块 */}
                    {(() => {
                      const topPct = ((dksTravelState.shallow - 0.1) / 3.2) * 100;
                      const botPct = ((dksTravelState.deep - 0.1) / 3.2) * 100;
                      return (
                        <div
                          style={{
                            top: `${topPct}%`,
                            height: `${Math.max(0, botPct - topPct)}%`
                          }}
                          className="absolute inset-x-0 bg-[#bcbec4] dark:bg-zinc-600 pointer-events-none"
                        />
                      );
                    })()}

                    {/* 浅层把手 (Handle Shallow) */}
                    <div
                      style={{ top: `${((dksTravelState.shallow - 0.1) / 3.2) * 100}%` }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setRulerDrag({ active: true, target: 'shallow' });
                        setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }));
                      }}
                      className="absolute inset-x-0 h-1 bg-[#18191c] dark:bg-white -translate-y-1/2 cursor-ns-resize z-10"
                      title="拖动调节：按压起始 / 完全抬起"
                    />

                    {/* 深层把手 (Handle Deep) */}
                    <div
                      style={{ top: `${((dksTravelState.deep - 0.1) / 3.2) * 100}%` }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setRulerDrag({ active: true, target: 'deep' });
                        setDksTravelState(p => ({ ...p, focusGroup: 'deep' }));
                      }}
                      className="absolute inset-x-0 h-1 bg-[#18191c] dark:bg-white -translate-y-1/2 cursor-ns-resize z-10"
                      title="拖动调节：按压触底 / 触底抬起"
                    />
                  </div>
                </div>

                {/* 重置按钮 (紧凑居中于标尺下方，绝不越界遮挡) */}
                <div className="w-full flex flex-col items-center gap-1 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDksTravelState({
                        shallow: 1.50,
                        deep: 3.00,
                        focusGroup: 'shallow'
                      });
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复默认</span>
                  </button>
                  <span className="text-[10px] text-zinc-400 font-mono">1.50 / 3.00mm</span>
                </div>
              </div>

              {/* 3. 右侧两组 4 框联动输入卡片 */}
              <div className="flex-1 min-w-0 bg-[#f8f9fa] dark:bg-zinc-800/60 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col justify-between">
                <div className="text-center pb-3">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 mb-0.5">
                    {dksTravelState.focusGroup === 'shallow' ? (
                      <span>设置（按压起始 / 完全抬起）</span>
                    ) : (
                      <span>设置（按压触底 / 触底抬起）</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {dksTravelState.focusGroup === 'shallow'
                      ? 'DKS 浅层动作的触发点 (建议 0.20 ~ 2.00mm)'
                      : 'DKS 深层动作的触发点 (建议 2.00 ~ 3.50mm)'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* 按键下压组 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700 shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <span className="text-blue-500 font-bold">↓</span> 按键下压
                      </span>
                      <span className="text-[10px] text-zinc-400">行程阶段</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* 按压起始 */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">按压起始</span>
                        <div
                          onClick={() => setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }))}
                          className={`flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border rounded-lg px-2 py-1.5 transition-all cursor-pointer ${
                            dksTravelState.focusGroup === 'shallow'
                              ? 'border-[#0052ef] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-zinc-300/80 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <input
                            type="number"
                            step="0.05"
                            min="0.10"
                            max="3.20"
                            value={dksTravelState.shallow}
                            onFocus={() => setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }))}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) {
                                setDksTravelState(p => ({
                                  ...p,
                                  shallow: Math.min(Math.max(0.10, v), +(p.deep - 0.10).toFixed(2))
                                }));
                              }
                            }}
                            className="w-full min-w-0 border-none outline-none text-xs text-center font-bold text-zinc-900 dark:text-zinc-100 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[10px] text-zinc-400 shrink-0 select-none ml-0.5">mm</span>
                        </div>
                      </div>

                      {/* 按压触底 */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">按压触底</span>
                        <div
                          onClick={() => setDksTravelState(p => ({ ...p, focusGroup: 'deep' }))}
                          className={`flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border rounded-lg px-2 py-1.5 transition-all cursor-pointer ${
                            dksTravelState.focusGroup === 'deep'
                              ? 'border-[#0052ef] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-zinc-300/80 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <input
                            type="number"
                            step="0.05"
                            min="0.20"
                            max="3.50"
                            value={dksTravelState.deep}
                            onFocus={() => setDksTravelState(p => ({ ...p, focusGroup: 'deep' }))}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) {
                                setDksTravelState(p => ({
                                  ...p,
                                  deep: Math.max(Math.min(3.50, v), +(p.shallow + 0.10).toFixed(2))
                                }));
                              }
                            }}
                            className="w-full min-w-0 border-none outline-none text-xs text-center font-bold text-zinc-900 dark:text-zinc-100 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[10px] text-zinc-400 shrink-0 select-none ml-0.5">mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 按键释放组 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700 shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <span className="text-emerald-500 font-bold">↑</span> 按键释放
                      </span>
                      <span className="text-[10px] text-zinc-400">行程阶段</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* 触底抬起 */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">触底抬起</span>
                        <div
                          onClick={() => setDksTravelState(p => ({ ...p, focusGroup: 'deep' }))}
                          className={`flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border rounded-lg px-2 py-1.5 transition-all cursor-pointer ${
                            dksTravelState.focusGroup === 'deep'
                              ? 'border-[#0052ef] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-zinc-300/80 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <input
                            type="number"
                            step="0.05"
                            min="0.20"
                            max="3.50"
                            value={dksTravelState.deep}
                            onFocus={() => setDksTravelState(p => ({ ...p, focusGroup: 'deep' }))}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) {
                                setDksTravelState(p => ({
                                  ...p,
                                  deep: Math.max(Math.min(3.50, v), +(p.shallow + 0.10).toFixed(2))
                                }));
                              }
                            }}
                            className="w-full min-w-0 border-none outline-none text-xs text-center font-bold text-zinc-900 dark:text-zinc-100 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[10px] text-zinc-400 shrink-0 select-none ml-0.5">mm</span>
                        </div>
                      </div>

                      {/* 完全抬起 */}
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">完全抬起</span>
                        <div
                          onClick={() => setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }))}
                          className={`flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 border rounded-lg px-2 py-1.5 transition-all cursor-pointer ${
                            dksTravelState.focusGroup === 'shallow'
                              ? 'border-[#0052ef] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-zinc-300/80 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <input
                            type="number"
                            step="0.05"
                            min="0.10"
                            max="3.20"
                            value={dksTravelState.shallow}
                            onFocus={() => setDksTravelState(p => ({ ...p, focusGroup: 'shallow' }))}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) {
                                setDksTravelState(p => ({
                                  ...p,
                                  shallow: Math.min(Math.max(0.10, v), +(p.deep - 0.10).toFixed(2))
                                }));
                              }
                            }}
                            className="w-full min-w-0 border-none outline-none text-xs text-center font-bold text-zinc-900 dark:text-zinc-100 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[10px] text-zinc-400 shrink-0 select-none ml-0.5">mm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部操作与确认栏 */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    当前行程：<b className="text-zinc-800 dark:text-zinc-200 font-mono">{dksTravelState.shallow.toFixed(2)}mm</b> / <b className="text-zinc-800 dark:text-zinc-200 font-mono">{dksTravelState.deep.toFixed(2)}mm</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDksTravelModal(false)}
                    className="px-5 py-1.5 rounded-lg bg-[#0052ef] hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    完成设置
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MT 触发时间弹窗 (1:1 复刻官方弹窗 + 支持滑块拖拽与键盘直接输入精确毫秒) */}
      {showMtTimeModal && (
        <div
          onClick={() => setShowMtTimeModal(false)}
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f0f0f2] dark:bg-zinc-800 rounded-2xl w-[440px] p-6 shadow-2xl border border-zinc-300/60 dark:border-zinc-700 flex flex-col items-center gap-6"
          >
            {/* 弹窗标题 */}
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              触发时间
            </h3>

            {/* 滑块 + 键盘直接输入精确数值区域 */}
            <div className="w-full flex items-center gap-4 px-2">
              {/* 滑块轨道 */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={10}
                  value={tempMtThreshold}
                  onChange={(e) => setTempMtThreshold(parseInt(e.target.value, 10) || 50)}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0052ef]"
                  style={{
                    background: `linear-gradient(to right, #0052ef 0%, #0052ef ${((tempMtThreshold - 50) / (800 - 50)) * 100}%, #d1d5db ${((tempMtThreshold - 50) / (800 - 50)) * 100}%, #d1d5db 100%)`
                  }}
                />
              </div>

              {/* 精确数值输入框 (支持键盘直接键入数字与精确毫秒) */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2.5 py-1 shadow-2xs focus-within:border-[#0052ef] focus-within:ring-2 focus-within:ring-[#0052ef]/20 transition shrink-0">
                <input
                  type="number"
                  min={50}
                  max={800}
                  step={10}
                  value={tempMtThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setTempMtThreshold(Math.max(50, Math.min(800, val)));
                    } else {
                      setTempMtThreshold(50);
                    }
                  }}
                  className="w-12 text-center text-xs font-bold text-zinc-800 dark:text-zinc-100 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-zinc-500 select-none">ms</span>
              </div>
            </div>

            {/* 底部按钮栏：取消 (深黑圆角胶囊) + 确认 (蓝色圆角胶囊) */}
            <div className="flex items-center gap-6 mt-1">
              <button
                type="button"
                onClick={() => setShowMtTimeModal(false)}
                className="px-9 py-2 rounded-full bg-[#32363e] hover:bg-[#40454f] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setMtState(p => ({ ...p, threshold: tempMtThreshold }));
                  setShowMtTimeModal(false);
                  addToast({ message: `长按判定阈值已设置为 ${tempMtThreshold}ms`, type: 'info' });
                }}
                className="px-9 py-2 rounded-full bg-[#0052ef] hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END 触发延迟弹窗 (1:1 复刻官方弹窗 + 支持滑块拖拽与键盘直接输入精确毫秒) */}
      {showEndDelayModal && (
        <div
          onClick={() => setShowEndDelayModal(false)}
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4 animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f0f0f2] dark:bg-zinc-800 rounded-2xl w-[440px] p-6 shadow-2xl border border-zinc-300/60 dark:border-zinc-700 flex flex-col items-center gap-6"
          >
            {/* 弹窗标题 */}
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              触发延迟
            </h3>

            {/* 滑块 + 键盘直接输入精确数值区域 */}
            <div className="w-full flex items-center gap-4 px-2">
              {/* 滑块轨道 */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={tempEndDelay}
                  onChange={(e) => setTempEndDelay(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0052ef]"
                  style={{
                    background: `linear-gradient(to right, #0052ef 0%, #0052ef ${(tempEndDelay / 500) * 100}%, #d1d5db ${(tempEndDelay / 500) * 100}%, #d1d5db 100%)`
                  }}
                />
              </div>

              {/* 精确数值输入框 (支持键盘直接键入数字与精确毫秒) */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2.5 py-1 shadow-2xs focus-within:border-[#0052ef] focus-within:ring-2 focus-within:ring-[#0052ef]/20 transition shrink-0">
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={5}
                  value={tempEndDelay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setTempEndDelay(Math.max(0, Math.min(500, val)));
                    } else {
                      setTempEndDelay(0);
                    }
                  }}
                  className="w-12 text-center text-xs font-bold text-zinc-800 dark:text-zinc-100 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-zinc-500 select-none">ms</span>
              </div>
            </div>

            {/* 底部按钮栏：取消 (深黑圆角胶囊) + 确认 (蓝色圆角胶囊) */}
            <div className="flex items-center gap-6 mt-1">
              <button
                type="button"
                onClick={() => setShowEndDelayModal(false)}
                className="px-9 py-2 rounded-full bg-[#32363e] hover:bg-[#40454f] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setEndState(p => ({ ...p, delay: tempEndDelay }));
                  setShowEndDelayModal(false);
                  addToast({ message: `松开触发延迟已设置为 ${tempEndDelay}ms`, type: 'info' });
                }}
                className="px-9 py-2 rounded-full bg-[#0052ef] hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RS 延迟时间弹窗 (1:1 复刻官方弹窗 + 支持滑块拖拽与键盘直接输入精确毫秒) */}
      {showRsDelayModal && (
        <div
          onClick={() => setShowRsDelayModal(false)}
          className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-4 animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#eaedf0] dark:bg-zinc-800 rounded-2xl w-[400px] p-6 shadow-2xl border border-zinc-300/40 dark:border-zinc-700 flex flex-col items-center gap-5"
          >
            {/* 弹窗标题 */}
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              延迟时间
            </h3>

            {/* 滑块 + 精确数值显示与输入 */}
            <div className="w-full flex items-center gap-4 px-3">
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={tempRsDelay}
                onChange={(e) => setTempRsDelay(parseInt(e.target.value, 10) || 0)}
                className="flex-1 h-1 bg-[#d5d8de] dark:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-[#2563eb] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2563eb] [&::-webkit-slider-thumb]:shadow-sm"
              />
              <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100 select-none min-w-[42px]">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={tempRsDelay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTempRsDelay(isNaN(val) ? 0 : Math.max(0, Math.min(500, val)));
                  }}
                  className="w-8 text-right bg-transparent outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>ms</span>
              </div>
            </div>

            {/* 底部按钮栏：取消 (深黑圆角胶囊) + 确认 (蓝色圆角胶囊) */}
            <div className="flex items-center justify-center gap-6 mt-1">
              <button
                type="button"
                onClick={() => setShowRsDelayModal(false)}
                className="px-8 py-1.5 rounded-full bg-[#2d3139] hover:bg-[#3c414b] text-white text-xs font-bold transition shadow-sm cursor-pointer min-w-[85px] text-center"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setRsState(p => ({ ...p, delay: tempRsDelay }));
                  setShowRsDelayModal(false);
                  addToast({ message: `延迟时间已设置为 ${tempRsDelay}ms`, type: 'info' });
                }}
                className="px-8 py-1.5 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm cursor-pointer min-w-[85px] text-center"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOCD 延迟时间弹窗 (1:1 复刻官方弹窗 + 支持滑块拖拽与键盘直接输入精确毫秒) */}
      {showSocdDelayModal && (
        <div
          onClick={() => setShowSocdDelayModal(false)}
          className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center p-4 animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#eaedf0] dark:bg-zinc-800 rounded-2xl w-[400px] p-6 shadow-2xl border border-zinc-300/40 dark:border-zinc-700 flex flex-col items-center gap-5"
          >
            {/* 弹窗标题 */}
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              延迟时间
            </h3>

            {/* 滑块 + 精确数值显示与输入 */}
            <div className="w-full flex items-center gap-4 px-3">
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={tempSocdDelay}
                onChange={(e) => setTempSocdDelay(parseInt(e.target.value, 10) || 0)}
                className="flex-1 h-1 bg-[#d5d8de] dark:bg-zinc-600 rounded-full appearance-none cursor-pointer accent-[#2563eb] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2563eb] [&::-webkit-slider-thumb]:shadow-sm"
              />
              <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100 select-none min-w-[42px]">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={tempSocdDelay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTempSocdDelay(isNaN(val) ? 0 : Math.max(0, Math.min(500, val)));
                  }}
                  className="w-8 text-right bg-transparent outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>ms</span>
              </div>
            </div>

            {/* 底部按钮栏：取消 (深黑圆角胶囊) + 确认 (蓝色圆角胶囊) */}
            <div className="flex items-center justify-center gap-6 mt-1">
              <button
                type="button"
                onClick={() => setShowSocdDelayModal(false)}
                className="px-8 py-1.5 rounded-full bg-[#2d3139] hover:bg-[#3c414b] text-white text-xs font-bold transition shadow-sm cursor-pointer min-w-[85px] text-center"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setSocdState(p => ({ ...p, delay: tempSocdDelay }));
                  setShowSocdDelayModal(false);
                  addToast({ message: `延迟时间已设置为 ${tempSocdDelay}ms`, type: 'info' });
                }}
                className="px-8 py-1.5 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm cursor-pointer min-w-[85px] text-center"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 高级键功能原理悬浮窗 (使用 createPortal 挂载到 body，避免被上层 panel-operation 的 overflow:hidden 裁剪) */}
      {hoveredPrinciple && MODE_INFOS[hoveredPrinciple.modeId] && typeof document !== 'undefined' && createPortal(
        <div
          id="dksPrinciplePopover"
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          style={{
            top: `${hoveredPrinciple.coords.top}px`,
            left: `${hoveredPrinciple.coords.left}px`
          }}
          className="fixed z-[9999] w-[390px] p-4.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none text-left flex flex-col gap-3 pointer-events-auto"
        >
          {/* 顶栏：图标 + 标题 */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5 text-[#0052ef]" />
              </div>
              <span className="font-title text-[15px] tracking-wide text-zinc-900 dark:text-zinc-100 font-bold">
                {MODE_INFOS[hoveredPrinciple.modeId].title} 原理说明
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[10.5px] font-mono font-bold text-[#0052ef] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
              {hoveredPrinciple.modeId}
            </span>
          </div>

          {/* 原理副标题 */}
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 leading-snug">
            {MODE_INFOS[hoveredPrinciple.modeId].principle}
          </div>

          {/* 功能特性要点列表 */}
          <div className="p-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1.5">
            {MODE_INFOS[hoveredPrinciple.modeId].features?.map((ft, i) => (
              <div key={i} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 leading-snug">
                <span className="text-[#0052ef] font-bold leading-none select-none mt-0.5">•</span>
                <span>{ft}</span>
              </div>
            ))}
          </div>

          {/* 警告 / 贴士条 */}
          {MODE_INFOS[hoveredPrinciple.modeId].tip && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50 leading-relaxed flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>{MODE_INFOS[hoveredPrinciple.modeId].tip}</span>
            </div>
          )}
        </div>,
        document.body
      )}

    </div>
  );
}

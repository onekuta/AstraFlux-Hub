// 多机型视觉配列库
// 全面支持星闪方案所有主流键盘配列：60% / 64 / 68 / 75% / 87 TKL / 98 / 104
// 基于工业级物理坐标网格 (x, y, width, height) 建模，彻底杜绝 flex 累积误差与错位

import { DV63_LAYOUT as LEGACY_DV63 } from './dv63Layout.js';

// ── 1. 经典 60% 配列 (61 Keys, 15u) ──
export const LAYOUT_60 = [
  [
    { id: 'Escape', label: 'Esc', sub: '~', width: 1, x: 0, y: 0, row: 1, col: 0 },
    { id: 'Digit1', label: '1', sub: '!', width: 1, x: 1, y: 0, row: 1, col: 1 },
    { id: 'Digit2', label: '2', sub: '@', width: 1, x: 2, y: 0, row: 1, col: 2 },
    { id: 'Digit3', label: '3', sub: '#', width: 1, x: 3, y: 0, row: 1, col: 3 },
    { id: 'Digit4', label: '4', sub: '$', width: 1, x: 4, y: 0, row: 1, col: 4 },
    { id: 'Digit5', label: '5', sub: '%', width: 1, x: 5, y: 0, row: 1, col: 5 },
    { id: 'Digit6', label: '6', sub: '^', width: 1, x: 6, y: 0, row: 1, col: 6 },
    { id: 'Digit7', label: '7', sub: '&', width: 1, x: 7, y: 0, row: 1, col: 7 },
    { id: 'Digit8', label: '8', sub: '*', width: 1, x: 8, y: 0, row: 1, col: 8 },
    { id: 'Digit9', label: '9', sub: '(', width: 1, x: 9, y: 0, row: 1, col: 9 },
    { id: 'Digit0', label: '0', sub: ')', width: 1, x: 10, y: 0, row: 1, col: 10 },
    { id: 'Minus', label: '-', sub: '_', width: 1, x: 11, y: 0, row: 1, col: 11 },
    { id: 'Equal', label: '=', sub: '+', width: 1, x: 12, y: 0, row: 1, col: 12 },
    { id: 'Backspace', label: 'Backspace', sub: '⌫', width: 2, x: 13, y: 0, row: 1, col: 13 },
  ],
  [
    { id: 'Tab', label: 'Tab', sub: '⇥', width: 1.5, x: 0, y: 1, row: 2, col: 0 },
    { id: 'KeyQ', label: 'Q', width: 1, x: 1.5, y: 1, row: 2, col: 1 },
    { id: 'KeyW', label: 'W', width: 1, x: 2.5, y: 1, row: 2, col: 2 },
    { id: 'KeyE', label: 'E', width: 1, x: 3.5, y: 1, row: 2, col: 3 },
    { id: 'KeyR', label: 'R', width: 1, x: 4.5, y: 1, row: 2, col: 4 },
    { id: 'KeyT', label: 'T', width: 1, x: 5.5, y: 1, row: 2, col: 5 },
    { id: 'KeyY', label: 'Y', width: 1, x: 6.5, y: 1, row: 2, col: 6 },
    { id: 'KeyU', label: 'U', width: 1, x: 7.5, y: 1, row: 2, col: 7 },
    { id: 'KeyI', label: 'I', width: 1, x: 8.5, y: 1, row: 2, col: 8 },
    { id: 'KeyO', label: 'O', width: 1, x: 9.5, y: 1, row: 2, col: 9 },
    { id: 'KeyP', label: 'P', width: 1, x: 10.5, y: 1, row: 2, col: 10 },
    { id: 'BracketLeft', label: '[', sub: '{', width: 1, x: 11.5, y: 1, row: 2, col: 11 },
    { id: 'BracketRight', label: ']', sub: '}', width: 1, x: 12.5, y: 1, row: 2, col: 12 },
    { id: 'Backslash', label: '\\', sub: '|', width: 1.5, x: 13.5, y: 1, row: 2, col: 13 },
  ],
  [
    { id: 'CapsLock', label: 'Caps', sub: '⇪', width: 1.75, x: 0, y: 2, row: 3, col: 0 },
    { id: 'KeyA', label: 'A', width: 1, x: 1.75, y: 2, row: 3, col: 1 },
    { id: 'KeyS', label: 'S', width: 1, x: 2.75, y: 2, row: 3, col: 2 },
    { id: 'KeyD', label: 'D', width: 1, x: 3.75, y: 2, row: 3, col: 3 },
    { id: 'KeyF', label: 'F', width: 1, x: 4.75, y: 2, row: 3, col: 4 },
    { id: 'KeyG', label: 'G', width: 1, x: 5.75, y: 2, row: 3, col: 5 },
    { id: 'KeyH', label: 'H', width: 1, x: 6.75, y: 2, row: 3, col: 6 },
    { id: 'KeyJ', label: 'J', width: 1, x: 7.75, y: 2, row: 3, col: 7 },
    { id: 'KeyK', label: 'K', width: 1, x: 8.75, y: 2, row: 3, col: 8 },
    { id: 'KeyL', label: 'L', width: 1, x: 9.75, y: 2, row: 3, col: 9 },
    { id: 'Semicolon', label: ';', sub: ':', width: 1, x: 10.75, y: 2, row: 3, col: 10 },
    { id: 'Quote', label: "'", sub: '"', width: 1, x: 11.75, y: 2, row: 3, col: 11 },
    { id: 'Enter', label: 'Enter', sub: '↵', width: 2.25, x: 12.75, y: 2, row: 3, col: 13 },
  ],
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2.25, x: 0, y: 3, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2.25, y: 3, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3.25, y: 3, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4.25, y: 3, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5.25, y: 3, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6.25, y: 3, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7.25, y: 3, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8.25, y: 3, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9.25, y: 3, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10.25, y: 3, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11.25, y: 3, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 2.75, x: 12.25, y: 3, row: 4, col: 12 },
  ],
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 4, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 4, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 4, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, x: 3.75, y: 4, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1.25, x: 10, y: 4, row: 5, col: 9 },
    { id: 'MetaRight', label: 'Win', width: 1.25, x: 11.25, y: 4, row: 5, col: 10 },
    { id: 'ContextMenu', label: 'App', width: 1.25, x: 12.5, y: 4, row: 5, col: 11 },
    { id: 'ControlRight', label: 'Ctrl', width: 1.25, x: 13.75, y: 4, row: 5, col: 12 },
  ],
];

// ── 2. 左移 64 配列 (64 Keys, 15u) ──
export const LAYOUT_64 = [
  LAYOUT_60[0],
  LAYOUT_60[1],
  LAYOUT_60[2],
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2, x: 0, y: 3, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2, y: 3, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3, y: 3, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4, y: 3, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5, y: 3, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6, y: 3, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7, y: 3, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8, y: 3, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9, y: 3, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10, y: 3, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11, y: 3, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 1, x: 12, y: 3, row: 4, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, x: 13, y: 3, row: 4, col: 13, isArrow: true },
    { id: 'Delete', label: 'Del', width: 1, x: 14, y: 3, row: 4, col: 14, isNav: true },
  ],
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 4, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 4, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 4, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, x: 3.75, y: 4, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1, x: 10, y: 4, row: 5, col: 9 },
    { id: 'Fn', label: 'Fn', width: 1, x: 11, y: 4, row: 5, col: 10 },
    { id: 'ArrowLeft', label: '←', width: 1, x: 12, y: 4, row: 5, col: 12, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, x: 13, y: 4, row: 5, col: 13, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, x: 14, y: 4, row: 5, col: 14, isArrow: true },
  ],
];

// ── 3. 紧凑 68 配列 (68 Keys, 16u) ──
export const LAYOUT_68 = [
  [
    ...LAYOUT_60[0],
    { id: 'Delete', label: 'Del', width: 1, x: 15, y: 0, row: 1, col: 14, isNav: true },
  ],
  [
    ...LAYOUT_60[1],
    { id: 'Home', label: 'Home', width: 1, x: 15, y: 1, row: 2, col: 14, isNav: true },
  ],
  [
    ...LAYOUT_60[2],
    { id: 'PageUp', label: 'PgUp', width: 1, x: 15, y: 2, row: 3, col: 14, isNav: true },
  ],
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2.25, x: 0, y: 3, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2.25, y: 3, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3.25, y: 3, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4.25, y: 3, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5.25, y: 3, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6.25, y: 3, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7.25, y: 3, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8.25, y: 3, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9.25, y: 3, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10.25, y: 3, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11.25, y: 3, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 1.75, x: 12.25, y: 3, row: 4, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, x: 14, y: 3, row: 4, col: 13, isArrow: true },
    { id: 'PageDown', label: 'PgDn', width: 1, x: 15, y: 3, row: 4, col: 14, isNav: true },
  ],
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 4, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 4, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 4, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 5.5, x: 3.75, y: 4, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1.25, x: 9.25, y: 4, row: 5, col: 9 },
    { id: 'Fn', label: 'Fn', width: 1.25, x: 10.5, y: 4, row: 5, col: 10 },
    { id: 'ControlRight', label: 'Ctrl', width: 1.25, x: 11.75, y: 4, row: 5, col: 11 },
    { id: 'ArrowLeft', label: '←', width: 1, x: 13, y: 4, row: 5, col: 12, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, x: 14, y: 4, row: 5, col: 13, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, x: 15, y: 4, row: 5, col: 14, isArrow: true },
  ],
];

// ── 4. 75% 主流电竞磁轴配列 (82 Keys, 16u) ──
export const LAYOUT_75 = [
  // F 区 (14键)
  [
    { id: 'Escape', label: 'Esc', width: 1, x: 0, y: 0, row: 0, col: 0 },
    { id: 'F1', label: 'F1', width: 1, x: 1.5, y: 0, row: 0, col: 1 },
    { id: 'F2', label: 'F2', width: 1, x: 2.5, y: 0, row: 0, col: 2 },
    { id: 'F3', label: 'F3', width: 1, x: 3.5, y: 0, row: 0, col: 3 },
    { id: 'F4', label: 'F4', width: 1, x: 4.5, y: 0, row: 0, col: 4 },
    { id: 'F5', label: 'F5', width: 1, x: 5.75, y: 0, row: 0, col: 5 },
    { id: 'F6', label: 'F6', width: 1, x: 6.75, y: 0, row: 0, col: 6 },
    { id: 'F7', label: 'F7', width: 1, x: 7.75, y: 0, row: 0, col: 7 },
    { id: 'F8', label: 'F8', width: 1, x: 8.75, y: 0, row: 0, col: 8 },
    { id: 'F9', label: 'F9', width: 1, x: 10, y: 0, row: 0, col: 9 },
    { id: 'F10', label: 'F10', width: 1, x: 11, y: 0, row: 0, col: 10 },
    { id: 'F11', label: 'F11', width: 1, x: 12, y: 0, row: 0, col: 11 },
    { id: 'F12', label: 'F12', width: 1, x: 13, y: 0, row: 0, col: 12 },
    { id: 'Delete', label: 'Del', width: 1, x: 15, y: 0, row: 0, col: 13, isNav: true },
  ],
  // 数字行 + Home (15键)
  [
    { id: 'Backquote', label: '`', sub: '~', width: 1, x: 0, y: 1.15, row: 1, col: 0 },
    { id: 'Digit1', label: '1', sub: '!', width: 1, x: 1, y: 1.15, row: 1, col: 1 },
    { id: 'Digit2', label: '2', sub: '@', width: 1, x: 2, y: 1.15, row: 1, col: 2 },
    { id: 'Digit3', label: '3', sub: '#', width: 1, x: 3, y: 1.15, row: 1, col: 3 },
    { id: 'Digit4', label: '4', sub: '$', width: 1, x: 4, y: 1.15, row: 1, col: 4 },
    { id: 'Digit5', label: '5', sub: '%', width: 1, x: 5, y: 1.15, row: 1, col: 5 },
    { id: 'Digit6', label: '6', sub: '^', width: 1, x: 6, y: 1.15, row: 1, col: 6 },
    { id: 'Digit7', label: '7', sub: '&', width: 1, x: 7, y: 1.15, row: 1, col: 7 },
    { id: 'Digit8', label: '8', sub: '*', width: 1, x: 8, y: 1.15, row: 1, col: 8 },
    { id: 'Digit9', label: '9', sub: '(', width: 1, x: 9, y: 1.15, row: 1, col: 9 },
    { id: 'Digit0', label: '0', sub: ')', width: 1, x: 10, y: 1.15, row: 1, col: 10 },
    { id: 'Minus', label: '-', sub: '_', width: 1, x: 11, y: 1.15, row: 1, col: 11 },
    { id: 'Equal', label: '=', sub: '+', width: 1, x: 12, y: 1.15, row: 1, col: 12 },
    { id: 'Backspace', label: 'Backspace', sub: '⌫', width: 2, x: 13, y: 1.15, row: 1, col: 13 },
    { id: 'Home', label: 'Home', width: 1, x: 15, y: 1.15, row: 1, col: 14, isNav: true },
  ],
  // Tab 行 + PgUp (15键)
  [
    { id: 'Tab', label: 'Tab', sub: '⇥', width: 1.5, x: 0, y: 2.15, row: 2, col: 0 },
    { id: 'KeyQ', label: 'Q', width: 1, x: 1.5, y: 2.15, row: 2, col: 1 },
    { id: 'KeyW', label: 'W', width: 1, x: 2.5, y: 2.15, row: 2, col: 2 },
    { id: 'KeyE', label: 'E', width: 1, x: 3.5, y: 2.15, row: 2, col: 3 },
    { id: 'KeyR', label: 'R', width: 1, x: 4.5, y: 2.15, row: 2, col: 4 },
    { id: 'KeyT', label: 'T', width: 1, x: 5.5, y: 2.15, row: 2, col: 5 },
    { id: 'KeyY', label: 'Y', width: 1, x: 6.5, y: 2.15, row: 2, col: 6 },
    { id: 'KeyU', label: 'U', width: 1, x: 7.5, y: 2.15, row: 2, col: 7 },
    { id: 'KeyI', label: 'I', width: 1, x: 8.5, y: 2.15, row: 2, col: 8 },
    { id: 'KeyO', label: 'O', width: 1, x: 9.5, y: 2.15, row: 2, col: 9 },
    { id: 'KeyP', label: 'P', width: 1, x: 10.5, y: 2.15, row: 2, col: 10 },
    { id: 'BracketLeft', label: '[', sub: '{', width: 1, x: 11.5, y: 2.15, row: 2, col: 11 },
    { id: 'BracketRight', label: ']', sub: '}', width: 1, x: 12.5, y: 2.15, row: 2, col: 12 },
    { id: 'Backslash', label: '\\', sub: '|', width: 1.5, x: 13.5, y: 2.15, row: 2, col: 13 },
    { id: 'PageUp', label: 'PgUp', width: 1, x: 15, y: 2.15, row: 2, col: 14, isNav: true },
  ],
  // Caps 行 + PgDn (14键)
  [
    { id: 'CapsLock', label: 'Caps', sub: '⇪', width: 1.75, x: 0, y: 3.15, row: 3, col: 0 },
    { id: 'KeyA', label: 'A', width: 1, x: 1.75, y: 3.15, row: 3, col: 1 },
    { id: 'KeyS', label: 'S', width: 1, x: 2.75, y: 3.15, row: 3, col: 2 },
    { id: 'KeyD', label: 'D', width: 1, x: 3.75, y: 3.15, row: 3, col: 3 },
    { id: 'KeyF', label: 'F', width: 1, x: 4.75, y: 3.15, row: 3, col: 4 },
    { id: 'KeyG', label: 'G', width: 1, x: 5.75, y: 3.15, row: 3, col: 5 },
    { id: 'KeyH', label: 'H', width: 1, x: 6.75, y: 3.15, row: 3, col: 6 },
    { id: 'KeyJ', label: 'J', width: 1, x: 7.75, y: 3.15, row: 3, col: 7 },
    { id: 'KeyK', label: 'K', width: 1, x: 8.75, y: 3.15, row: 3, col: 8 },
    { id: 'KeyL', label: 'L', width: 1, x: 9.75, y: 3.15, row: 3, col: 9 },
    { id: 'Semicolon', label: ';', sub: ':', width: 1, x: 10.75, y: 3.15, row: 3, col: 10 },
    { id: 'Quote', label: "'", sub: '"', width: 1, x: 11.75, y: 3.15, row: 3, col: 11 },
    { id: 'Enter', label: 'Enter', sub: '↵', width: 2.25, x: 12.75, y: 3.15, row: 3, col: 13 },
    { id: 'PageDown', label: 'PgDn', width: 1, x: 15, y: 3.15, row: 3, col: 14, isNav: true },
  ],
  // Shift 行 + ↑ + End (14键)
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2.25, x: 0, y: 4.15, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2.25, y: 4.15, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3.25, y: 4.15, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4.25, y: 4.15, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5.25, y: 4.15, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6.25, y: 4.15, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7.25, y: 4.15, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8.25, y: 4.15, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9.25, y: 4.15, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10.25, y: 4.15, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11.25, y: 4.15, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 1.75, x: 12.25, y: 4.15, row: 4, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, x: 14, y: 4.15, row: 4, col: 13, isArrow: true },
    { id: 'End', label: 'End', width: 1, x: 15, y: 4.15, row: 4, col: 14, isNav: true },
  ],
  // 底行 + 方向键 (10键)
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 5.15, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 5.15, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 5.15, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, x: 3.75, y: 5.15, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1, x: 10, y: 5.15, row: 5, col: 9 },
    { id: 'Fn', label: 'Fn', width: 1, x: 11, y: 5.15, row: 5, col: 10 },
    { id: 'ControlRight', label: 'Ctrl', width: 1, x: 12, y: 5.15, row: 5, col: 11 },
    { id: 'ArrowLeft', label: '←', width: 1, x: 13, y: 5.15, row: 5, col: 12, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, x: 14, y: 5.15, row: 5, col: 13, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, x: 15, y: 5.15, row: 5, col: 14, isArrow: true },
  ],
];

// ── 5. 87 键 TKL 配列 (87 Keys, 18.5u) ──
export const LAYOUT_87 = [
  // F 区 + 三键 (16键)
  [
    { id: 'Escape', label: 'Esc', width: 1, x: 0, y: 0, row: 0, col: 0 },
    { id: 'F1', label: 'F1', width: 1, x: 2, y: 0, row: 0, col: 1 },
    { id: 'F2', label: 'F2', width: 1, x: 3, y: 0, row: 0, col: 2 },
    { id: 'F3', label: 'F3', width: 1, x: 4, y: 0, row: 0, col: 3 },
    { id: 'F4', label: 'F4', width: 1, x: 5, y: 0, row: 0, col: 4 },
    { id: 'F5', label: 'F5', width: 1, x: 6.5, y: 0, row: 0, col: 5 },
    { id: 'F6', label: 'F6', width: 1, x: 7.5, y: 0, row: 0, col: 6 },
    { id: 'F7', label: 'F7', width: 1, x: 8.5, y: 0, row: 0, col: 7 },
    { id: 'F8', label: 'F8', width: 1, x: 9.5, y: 0, row: 0, col: 8 },
    { id: 'F9', label: 'F9', width: 1, x: 11, y: 0, row: 0, col: 9 },
    { id: 'F10', label: 'F10', width: 1, x: 12, y: 0, row: 0, col: 10 },
    { id: 'F11', label: 'F11', width: 1, x: 13, y: 0, row: 0, col: 11 },
    { id: 'F12', label: 'F12', width: 1, x: 14, y: 0, row: 0, col: 12 },
    { id: 'PrintScreen', label: 'PrSc', width: 1, x: 15.5, y: 0, row: 0, col: 13, isNav: true },
    { id: 'ScrollLock', label: 'ScLk', width: 1, x: 16.5, y: 0, row: 0, col: 14, isNav: true },
    { id: 'Pause', label: 'Paus', width: 1, x: 17.5, y: 0, row: 0, col: 15, isNav: true },
  ],
  // 数字行 + 编辑区 (17键)
  [
    { id: 'Backquote', label: '`', sub: '~', width: 1, x: 0, y: 1.15, row: 1, col: 0 },
    { id: 'Digit1', label: '1', sub: '!', width: 1, x: 1, y: 1.15, row: 1, col: 1 },
    { id: 'Digit2', label: '2', sub: '@', width: 1, x: 2, y: 1.15, row: 1, col: 2 },
    { id: 'Digit3', label: '3', sub: '#', width: 1, x: 3, y: 1.15, row: 1, col: 3 },
    { id: 'Digit4', label: '4', sub: '$', width: 1, x: 4, y: 1.15, row: 1, col: 4 },
    { id: 'Digit5', label: '5', sub: '%', width: 1, x: 5, y: 1.15, row: 1, col: 5 },
    { id: 'Digit6', label: '6', sub: '^', width: 1, x: 6, y: 1.15, row: 1, col: 6 },
    { id: 'Digit7', label: '7', sub: '&', width: 1, x: 7, y: 1.15, row: 1, col: 7 },
    { id: 'Digit8', label: '8', sub: '*', width: 1, x: 8, y: 1.15, row: 1, col: 8 },
    { id: 'Digit9', label: '9', sub: '(', width: 1, x: 9, y: 1.15, row: 1, col: 9 },
    { id: 'Digit0', label: '0', sub: ')', width: 1, x: 10, y: 1.15, row: 1, col: 10 },
    { id: 'Minus', label: '-', sub: '_', width: 1, x: 11, y: 1.15, row: 1, col: 11 },
    { id: 'Equal', label: '=', sub: '+', width: 1, x: 12, y: 1.15, row: 1, col: 12 },
    { id: 'Backspace', label: 'Backspace', sub: '⌫', width: 2, x: 13, y: 1.15, row: 1, col: 13 },
    { id: 'Insert', label: 'Ins', width: 1, x: 15.5, y: 1.15, row: 1, col: 14, isNav: true },
    { id: 'Home', label: 'Home', width: 1, x: 16.5, y: 1.15, row: 1, col: 15, isNav: true },
    { id: 'PageUp', label: 'PgUp', width: 1, x: 17.5, y: 1.15, row: 1, col: 16, isNav: true },
  ],
  // Tab 行 + 编辑区 (17键)
  [
    { id: 'Tab', label: 'Tab', sub: '⇥', width: 1.5, x: 0, y: 2.15, row: 2, col: 0 },
    { id: 'KeyQ', label: 'Q', width: 1, x: 1.5, y: 2.15, row: 2, col: 1 },
    { id: 'KeyW', label: 'W', width: 1, x: 2.5, y: 2.15, row: 2, col: 2 },
    { id: 'KeyE', label: 'E', width: 1, x: 3.5, y: 2.15, row: 2, col: 3 },
    { id: 'KeyR', label: 'R', width: 1, x: 4.5, y: 2.15, row: 2, col: 4 },
    { id: 'KeyT', label: 'T', width: 1, x: 5.5, y: 2.15, row: 2, col: 5 },
    { id: 'KeyY', label: 'Y', width: 1, x: 6.5, y: 2.15, row: 2, col: 6 },
    { id: 'KeyU', label: 'U', width: 1, x: 7.5, y: 2.15, row: 2, col: 7 },
    { id: 'KeyI', label: 'I', width: 1, x: 8.5, y: 2.15, row: 2, col: 8 },
    { id: 'KeyO', label: 'O', width: 1, x: 9.5, y: 2.15, row: 2, col: 9 },
    { id: 'KeyP', label: 'P', width: 1, x: 10.5, y: 2.15, row: 2, col: 10 },
    { id: 'BracketLeft', label: '[', sub: '{', width: 1, x: 11.5, y: 2.15, row: 2, col: 11 },
    { id: 'BracketRight', label: ']', sub: '}', width: 1, x: 12.5, y: 2.15, row: 2, col: 12 },
    { id: 'Backslash', label: '\\', sub: '|', width: 1.5, x: 13.5, y: 2.15, row: 2, col: 13 },
    { id: 'Delete', label: 'Del', width: 1, x: 15.5, y: 2.15, row: 2, col: 14, isNav: true },
    { id: 'End', label: 'End', width: 1, x: 16.5, y: 2.15, row: 2, col: 15, isNav: true },
    { id: 'PageDown', label: 'PgDn', width: 1, x: 17.5, y: 2.15, row: 2, col: 16, isNav: true },
  ],
  // Caps 行 (13键)
  [
    { id: 'CapsLock', label: 'Caps', sub: '⇪', width: 1.75, x: 0, y: 3.15, row: 3, col: 0 },
    { id: 'KeyA', label: 'A', width: 1, x: 1.75, y: 3.15, row: 3, col: 1 },
    { id: 'KeyS', label: 'S', width: 1, x: 2.75, y: 3.15, row: 3, col: 2 },
    { id: 'KeyD', label: 'D', width: 1, x: 3.75, y: 3.15, row: 3, col: 3 },
    { id: 'KeyF', label: 'F', width: 1, x: 4.75, y: 3.15, row: 3, col: 4 },
    { id: 'KeyG', label: 'G', width: 1, x: 5.75, y: 3.15, row: 3, col: 5 },
    { id: 'KeyH', label: 'H', width: 1, x: 6.75, y: 3.15, row: 3, col: 6 },
    { id: 'KeyJ', label: 'J', width: 1, x: 7.75, y: 3.15, row: 3, col: 7 },
    { id: 'KeyK', label: 'K', width: 1, x: 8.75, y: 3.15, row: 3, col: 8 },
    { id: 'KeyL', label: 'L', width: 1, x: 9.75, y: 3.15, row: 3, col: 9 },
    { id: 'Semicolon', label: ';', sub: ':', width: 1, x: 10.75, y: 3.15, row: 3, col: 10 },
    { id: 'Quote', label: "'", sub: '"', width: 1, x: 11.75, y: 3.15, row: 3, col: 11 },
    { id: 'Enter', label: 'Enter', sub: '↵', width: 2.25, x: 12.75, y: 3.15, row: 3, col: 13 },
  ],
  // Shift 行 + 方向键上 (13键)
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2.25, x: 0, y: 4.15, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2.25, y: 4.15, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3.25, y: 4.15, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4.25, y: 4.15, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5.25, y: 4.15, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6.25, y: 4.15, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7.25, y: 4.15, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8.25, y: 4.15, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9.25, y: 4.15, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10.25, y: 4.15, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11.25, y: 4.15, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 2.75, x: 12.25, y: 4.15, row: 4, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, x: 16.5, y: 4.15, row: 4, col: 14, isArrow: true },
  ],
  // 底行 + 方向键左下右 (11键)
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 5.15, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 5.15, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 5.15, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, x: 3.75, y: 5.15, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1.25, x: 10, y: 5.15, row: 5, col: 9 },
    { id: 'MetaRight', label: 'Win', width: 1.25, x: 11.25, y: 5.15, row: 5, col: 10 },
    { id: 'ContextMenu', label: 'App', width: 1.25, x: 12.5, y: 5.15, row: 5, col: 11 },
    { id: 'ControlRight', label: 'Ctrl', width: 1.25, x: 13.75, y: 5.15, row: 5, col: 12 },
    { id: 'ArrowLeft', label: '←', width: 1, x: 15.5, y: 5.15, row: 5, col: 13, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, x: 16.5, y: 5.15, row: 5, col: 14, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, x: 17.5, y: 5.15, row: 5, col: 15, isArrow: true },
  ],
];

// ── 6. 104 键 全尺寸配列 (104 Keys, 23u) ──
export const LAYOUT_104 = [
  // F 区 + 三键 (16键)
  LAYOUT_87[0],
  // 数字行 + 编辑区 + 小键盘顶行 (21键)
  [
    ...LAYOUT_87[1],
    { id: 'NumLock', label: 'Num', width: 1, x: 19, y: 1.15, row: 1, col: 17 },
    { id: 'NumpadDivide', label: '/', width: 1, x: 20, y: 1.15, row: 1, col: 18 },
    { id: 'NumpadMultiply', label: '*', width: 1, x: 21, y: 1.15, row: 1, col: 19 },
    { id: 'NumpadSubtract', label: '-', width: 1, x: 22, y: 1.15, row: 1, col: 20 },
  ],
  // Tab 行 + 编辑区 + 789+ (21键)
  [
    ...LAYOUT_87[2],
    { id: 'Numpad7', label: '7', width: 1, x: 19, y: 2.15, row: 2, col: 17 },
    { id: 'Numpad8', label: '8', width: 1, x: 20, y: 2.15, row: 2, col: 18 },
    { id: 'Numpad9', label: '9', width: 1, x: 21, y: 2.15, row: 2, col: 19 },
    { id: 'NumpadAdd', label: '+', width: 1, height: 2, x: 22, y: 2.15, row: 2, col: 20 },
  ],
  // Caps 行 + 456 (16键)
  [
    ...LAYOUT_87[3],
    { id: 'Numpad4', label: '4', width: 1, x: 19, y: 3.15, row: 3, col: 14 },
    { id: 'Numpad5', label: '5', width: 1, x: 20, y: 3.15, row: 3, col: 15 },
    { id: 'Numpad6', label: '6', width: 1, x: 21, y: 3.15, row: 3, col: 16 },
  ],
  // Shift 行 + ↑ + 123Ent (17键)
  [
    ...LAYOUT_87[4],
    { id: 'Numpad1', label: '1', width: 1, x: 19, y: 4.15, row: 4, col: 15 },
    { id: 'Numpad2', label: '2', width: 1, x: 20, y: 4.15, row: 4, col: 16 },
    { id: 'Numpad3', label: '3', width: 1, x: 21, y: 4.15, row: 4, col: 17 },
    { id: 'NumpadEnter', label: 'Ent', width: 1, height: 2, x: 22, y: 4.15, row: 4, col: 18 },
  ],
  // 底行 + 方向键 + 0. (13键)
  [
    ...LAYOUT_87[5],
    { id: 'Numpad0', label: '0', width: 2, x: 19, y: 5.15, row: 5, col: 16 },
    { id: 'NumpadDecimal', label: '.', width: 1, x: 21, y: 5.15, row: 5, col: 17 },
  ],
];

// ── 7. 98 键 1800 紧凑配列 (95/98 Keys, 19.3u) ──
export const LAYOUT_98 = [
  // F 区 + Del + Num/*- (18键)
  [
    { id: 'Escape', label: 'Esc', width: 1, x: 0, y: 0, row: 0, col: 0 },
    { id: 'F1', label: 'F1', width: 1, x: 1.5, y: 0, row: 0, col: 1 },
    { id: 'F2', label: 'F2', width: 1, x: 2.5, y: 0, row: 0, col: 2 },
    { id: 'F3', label: 'F3', width: 1, x: 3.5, y: 0, row: 0, col: 3 },
    { id: 'F4', label: 'F4', width: 1, x: 4.5, y: 0, row: 0, col: 4 },
    { id: 'F5', label: 'F5', width: 1, x: 5.75, y: 0, row: 0, col: 5 },
    { id: 'F6', label: 'F6', width: 1, x: 6.75, y: 0, row: 0, col: 6 },
    { id: 'F7', label: 'F7', width: 1, x: 7.75, y: 0, row: 0, col: 7 },
    { id: 'F8', label: 'F8', width: 1, x: 8.75, y: 0, row: 0, col: 8 },
    { id: 'F9', label: 'F9', width: 1, x: 10, y: 0, row: 0, col: 9 },
    { id: 'F10', label: 'F10', width: 1, x: 11, y: 0, row: 0, col: 10 },
    { id: 'F11', label: 'F11', width: 1, x: 12, y: 0, row: 0, col: 11 },
    { id: 'F12', label: 'F12', width: 1, x: 13, y: 0, row: 0, col: 12 },
    { id: 'Delete', label: 'Del', width: 1, x: 14.15, y: 0, row: 0, col: 13, isNav: true },
    { id: 'NumLock', label: 'Num', width: 1, x: 15.3, y: 0, row: 0, col: 14 },
    { id: 'NumpadDivide', label: '/', width: 1, x: 16.3, y: 0, row: 0, col: 15 },
    { id: 'NumpadMultiply', label: '*', width: 1, x: 17.3, y: 0, row: 0, col: 16 },
    { id: 'NumpadSubtract', label: '-', width: 1, x: 18.3, y: 0, row: 0, col: 17 },
  ],
  // 数字行 + 789+ (18键)
  [
    { id: 'Backquote', label: '`', sub: '~', width: 1, x: 0, y: 1.15, row: 1, col: 0 },
    { id: 'Digit1', label: '1', sub: '!', width: 1, x: 1, y: 1.15, row: 1, col: 1 },
    { id: 'Digit2', label: '2', sub: '@', width: 1, x: 2, y: 1.15, row: 1, col: 2 },
    { id: 'Digit3', label: '3', sub: '#', width: 1, x: 3, y: 1.15, row: 1, col: 3 },
    { id: 'Digit4', label: '4', sub: '$', width: 1, x: 4, y: 1.15, row: 1, col: 4 },
    { id: 'Digit5', label: '5', sub: '%', width: 1, x: 5, y: 1.15, row: 1, col: 5 },
    { id: 'Digit6', label: '6', sub: '^', width: 1, x: 6, y: 1.15, row: 1, col: 6 },
    { id: 'Digit7', label: '7', sub: '&', width: 1, x: 7, y: 1.15, row: 1, col: 7 },
    { id: 'Digit8', label: '8', sub: '*', width: 1, x: 8, y: 1.15, row: 1, col: 8 },
    { id: 'Digit9', label: '9', sub: '(', width: 1, x: 9, y: 1.15, row: 1, col: 9 },
    { id: 'Digit0', label: '0', sub: ')', width: 1, x: 10, y: 1.15, row: 1, col: 10 },
    { id: 'Minus', label: '-', sub: '_', width: 1, x: 11, y: 1.15, row: 1, col: 11 },
    { id: 'Equal', label: '=', sub: '+', width: 1, x: 12, y: 1.15, row: 1, col: 12 },
    { id: 'Backspace', label: 'Backspace', sub: '⌫', width: 2, x: 13, y: 1.15, row: 1, col: 13 },
    { id: 'Numpad7', label: '7', width: 1, x: 15.3, y: 1.15, row: 1, col: 14 },
    { id: 'Numpad8', label: '8', width: 1, x: 16.3, y: 1.15, row: 1, col: 15 },
    { id: 'Numpad9', label: '9', width: 1, x: 17.3, y: 1.15, row: 1, col: 16 },
    { id: 'NumpadAdd', label: '+', width: 1, height: 2, x: 18.3, y: 1.15, row: 1, col: 17 },
  ],
  // Tab 行 + 456 (17键)
  [
    { id: 'Tab', label: 'Tab', sub: '⇥', width: 1.5, x: 0, y: 2.15, row: 2, col: 0 },
    { id: 'KeyQ', label: 'Q', width: 1, x: 1.5, y: 2.15, row: 2, col: 1 },
    { id: 'KeyW', label: 'W', width: 1, x: 2.5, y: 2.15, row: 2, col: 2 },
    { id: 'KeyE', label: 'E', width: 1, x: 3.5, y: 2.15, row: 2, col: 3 },
    { id: 'KeyR', label: 'R', width: 1, x: 4.5, y: 2.15, row: 2, col: 4 },
    { id: 'KeyT', label: 'T', width: 1, x: 5.5, y: 2.15, row: 2, col: 5 },
    { id: 'KeyY', label: 'Y', width: 1, x: 6.5, y: 2.15, row: 2, col: 6 },
    { id: 'KeyU', label: 'U', width: 1, x: 7.5, y: 2.15, row: 2, col: 7 },
    { id: 'KeyI', label: 'I', width: 1, x: 8.5, y: 2.15, row: 2, col: 8 },
    { id: 'KeyO', label: 'O', width: 1, x: 9.5, y: 2.15, row: 2, col: 9 },
    { id: 'KeyP', label: 'P', width: 1, x: 10.5, y: 2.15, row: 2, col: 10 },
    { id: 'BracketLeft', label: '[', sub: '{', width: 1, x: 11.5, y: 2.15, row: 2, col: 11 },
    { id: 'BracketRight', label: ']', sub: '}', width: 1, x: 12.5, y: 2.15, row: 2, col: 12 },
    { id: 'Backslash', label: '\\', sub: '|', width: 1.5, x: 13.5, y: 2.15, row: 2, col: 13 },
    { id: 'Numpad4', label: '4', width: 1, x: 15.3, y: 2.15, row: 2, col: 14 },
    { id: 'Numpad5', label: '5', width: 1, x: 16.3, y: 2.15, row: 2, col: 15 },
    { id: 'Numpad6', label: '6', width: 1, x: 17.3, y: 2.15, row: 2, col: 16 },
  ],
  // Caps 行 + 123Ent (17键)
  [
    { id: 'CapsLock', label: 'Caps', sub: '⇪', width: 1.75, x: 0, y: 3.15, row: 3, col: 0 },
    { id: 'KeyA', label: 'A', width: 1, x: 1.75, y: 3.15, row: 3, col: 1 },
    { id: 'KeyS', label: 'S', width: 1, x: 2.75, y: 3.15, row: 3, col: 2 },
    { id: 'KeyD', label: 'D', width: 1, x: 3.75, y: 3.15, row: 3, col: 3 },
    { id: 'KeyF', label: 'F', width: 1, x: 4.75, y: 3.15, row: 3, col: 4 },
    { id: 'KeyG', label: 'G', width: 1, x: 5.75, y: 3.15, row: 3, col: 5 },
    { id: 'KeyH', label: 'H', width: 1, x: 6.75, y: 3.15, row: 3, col: 6 },
    { id: 'KeyJ', label: 'J', width: 1, x: 7.75, y: 3.15, row: 3, col: 7 },
    { id: 'KeyK', label: 'K', width: 1, x: 8.75, y: 3.15, row: 3, col: 8 },
    { id: 'KeyL', label: 'L', width: 1, x: 9.75, y: 3.15, row: 3, col: 9 },
    { id: 'Semicolon', label: ';', sub: ':', width: 1, x: 10.75, y: 3.15, row: 3, col: 10 },
    { id: 'Quote', label: "'", sub: '"', width: 1, x: 11.75, y: 3.15, row: 3, col: 11 },
    { id: 'Enter', label: 'Enter', sub: '↵', width: 2.25, x: 12.75, y: 3.15, row: 3, col: 13 },
    { id: 'Numpad1', label: '1', width: 1, x: 15.3, y: 3.15, row: 3, col: 14 },
    { id: 'Numpad2', label: '2', width: 1, x: 16.3, y: 3.15, row: 3, col: 15 },
    { id: 'Numpad3', label: '3', width: 1, x: 17.3, y: 3.15, row: 3, col: 16 },
    { id: 'NumpadEnter', label: 'Ent', width: 1, height: 2, x: 18.3, y: 3.15, row: 3, col: 17 },
  ],
  // Shift 行 + 沉降↑ + 0. (15键)
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2.25, x: 0, y: 4.15, row: 4, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, x: 2.25, y: 4.15, row: 4, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, x: 3.25, y: 4.15, row: 4, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, x: 4.25, y: 4.15, row: 4, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, x: 5.25, y: 4.15, row: 4, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, x: 6.25, y: 4.15, row: 4, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, x: 7.25, y: 4.15, row: 4, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, x: 8.25, y: 4.15, row: 4, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, x: 9.25, y: 4.15, row: 4, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, x: 10.25, y: 4.15, row: 4, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, x: 11.25, y: 4.15, row: 4, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 1.75, x: 12.25, y: 4.15, row: 4, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, x: 14.15, y: 4.3, row: 4, col: 13, isArrow: true },
    { id: 'Numpad0', label: '0', width: 2, x: 15.3, y: 4.15, row: 4, col: 14 },
    { id: 'NumpadDecimal', label: '.', width: 1, x: 17.3, y: 4.15, row: 4, col: 15 },
  ],
  // 底行 + 沉降←↓→ (10键)
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, x: 0, y: 5.15, row: 5, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, x: 1.25, y: 5.15, row: 5, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, x: 2.5, y: 5.15, row: 5, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, x: 3.75, y: 5.15, row: 5, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1, x: 10, y: 5.15, row: 5, col: 9 },
    { id: 'Fn', label: 'Fn', width: 1, x: 11, y: 5.15, row: 5, col: 10 },
    { id: 'ControlRight', label: 'Ctrl', width: 1, x: 12, y: 5.15, row: 5, col: 11 },
    { id: 'ArrowLeft', label: '←', width: 1, x: 13.15, y: 5.3, row: 5, col: 12, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, x: 14.15, y: 5.3, row: 5, col: 13, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, x: 15.15, y: 5.3, row: 5, col: 14, isArrow: true },
  ],
];

export const SUPPORTED_KEYBOARD_LAYOUTS = [
  { key: '60', name: '60% 经典配列 (61键)', keyCount: 61, layout: LAYOUT_60, widthUnits: 15, heightUnits: 5 },
  { key: '61', name: '60% 经典配列 (61键)', keyCount: 61, layout: LAYOUT_60, widthUnits: 15, heightUnits: 5 },
  { key: '64', name: '左移 64 配列', keyCount: 64, layout: LAYOUT_64, widthUnits: 15, heightUnits: 5 },
  { key: '68', name: '紧凑 68 配列', keyCount: 68, layout: LAYOUT_68, widthUnits: 16, heightUnits: 5 },
  { key: '75', name: '75% 电竞配列', keyCount: 82, layout: LAYOUT_75, widthUnits: 16, heightUnits: 6.15 },
  { key: '87', name: '87 键 TKL 配列', keyCount: 87, layout: LAYOUT_87, widthUnits: 18.5, heightUnits: 6.15 },
  { key: '98', name: '98 紧凑小键盘', keyCount: 95, layout: LAYOUT_98, widthUnits: 19.3, heightUnits: 6.3 },
  { key: '104', name: '104 全尺寸配列', keyCount: 104, layout: LAYOUT_104, widthUnits: 23, heightUnits: 6.15 },
];

export function getKeyCountForLayout(layout) {
  if (!layout) return 0;
  return layout.flat().filter((k) => k && !k.isSpacer && !k.gap && k.id).length;
}

export function getLayoutBounds(layout) {
  let maxX = 16;
  let maxY = 5;
  if (!layout) return { widthUnits: maxX, heightUnits: maxY };
  layout.flat().forEach(k => {
    if (k && !k.isSpacer && !k.gap) {
      if (k.x != null && k.width != null) maxX = Math.max(maxX, k.x + k.width);
      if (k.y != null) maxY = Math.max(maxY, k.y + (k.height || 1));
    }
  });
  return { widthUnits: maxX, heightUnits: maxY };
}

export function getLayoutDisplayName(layout) {
  const count = getKeyCountForLayout(layout);
  if (count === 61 || count === 60) return '60% 经典配列 (61键)';
  const found = SUPPORTED_KEYBOARD_LAYOUTS.find((item) => item.keyCount === count);
  if (found) return found.name;
  return `自定义配列 (${count}键)`;
}

export function getLayoutByKey(key) {
  if (key === '61' || key === '60') return LAYOUT_60;
  const item = SUPPORTED_KEYBOARD_LAYOUTS.find((l) => l.key === key);
  return item ? item.layout : LAYOUT_68;
}

export function resolveLayoutForProfile(profile) {
  if (!profile) return LAYOUT_68;
  const lKey = (profile.layout || profile.layoutCategory || '').toLowerCase();
  const mName = (profile.model || profile.name || '').toUpperCase();
  const keyCount = Number(
    profile.totalKeyCount ||
    profile.totalKeys ||
    profile.keyCount ||
    profile.matrixLayout?.totalKeys ||
    profile._hardwareDetails?.totalKeys ||
    0
  );

  // 1. 优先按 61 键/60 键核心强特征精确识别 (解决各类 61 键适配文件或硬件上报失效被回落至 68 键的致命 Bug)
  if (
    keyCount === 61 ||
    keyCount === 60 ||
    lKey.includes('61') ||
    lKey.includes('60') ||
    mName.includes('AE61') ||
    mName.includes('CHASE 61') ||
    mName.includes('61 PRO') ||
    mName.includes('61KEY') ||
    /\b61\b/.test(mName) ||
    /\b60\b/.test(mName)
  ) {
    return LAYOUT_60;
  }

  // 2. 按其它总键数硬件真实数值判定
  if (keyCount === 63 || keyCount === 64) return LAYOUT_64;
  if (keyCount >= 67 && keyCount <= 71) return LAYOUT_68;
  if (keyCount >= 75 && keyCount <= 84) return LAYOUT_75;
  if (keyCount >= 87 && keyCount <= 89) return LAYOUT_87;
  if (keyCount >= 95 && keyCount <= 100) return LAYOUT_98;
  if (keyCount >= 104) return LAYOUT_104;

  // 3. 按型号名和 layout 关键词判定
  if (lKey.includes('104') || mName.includes('104') || mName.includes('108')) return LAYOUT_104;
  if (lKey.includes('98') || mName.includes('98') || mName.includes('980') || mName.includes('100')) return LAYOUT_98;
  if (lKey.includes('87') || lKey.includes('80') || lKey.includes('tkl') || mName.includes('87') || mName.includes('80') || mName.includes('TKL')) return LAYOUT_87;
  if (lKey.includes('75') || mName.includes('75')) return LAYOUT_75;
  if (lKey.includes('68') || mName.includes('68') || mName.includes('ES68')) return LAYOUT_68;
  if (lKey.includes('64') || mName.includes('64') || mName.includes('DV63') || mName.includes('AE64')) return LAYOUT_64;

  // 4. 兜底保护：若 keyCount <= 61 且 > 0，按 61 键处理
  if (keyCount > 0 && keyCount <= 61) return LAYOUT_60;

  return LAYOUT_68;
}

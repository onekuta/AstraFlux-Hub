// DV63 标准左移64配列 (Left-Shift 64 Layout, 共 64 键)
// 特征：
// Row 0: Esc, 1~0, -, =, Backspace(2u) -> 14键
// Row 1: Tab(1.5u), Q~P, [, ], \(1.5u) -> 14键
// Row 2: Caps(1.75u), A~L, ;, ', Enter(2.25u) -> 13键
// Row 3: ShiftLeft(2u 左移), Z~M, <, >, ?, ShiftRight(1u), Up(1u), Del(1u) -> 14键
// Row 4: Ctrl(1.25u), Win(1.25u), Alt(1.25u), Space(6.25u), Alt(1.25u), Fn(1.25u), Left(1u), Down(1u), Right(1u) -> 9键
// 总计：14 + 14 + 13 + 14 + 9 = 64 键

export const DV63_LAYOUT = [
  // 第一行 Row 0 (14键)
  [
    { id: 'Escape', label: 'Esc', sub: '~', width: 1, row: 0, col: 0 },
    { id: 'Digit1', label: '1', sub: '!', width: 1, row: 0, col: 1 },
    { id: 'Digit2', label: '2', sub: '@', width: 1, row: 0, col: 2 },
    { id: 'Digit3', label: '3', sub: '#', width: 1, row: 0, col: 3 },
    { id: 'Digit4', label: '4', sub: '$', width: 1, row: 0, col: 4 },
    { id: 'Digit5', label: '5', sub: '%', width: 1, row: 0, col: 5 },
    { id: 'Digit6', label: '6', sub: '^', width: 1, row: 0, col: 6 },
    { id: 'Digit7', label: '7', sub: '&', width: 1, row: 0, col: 7 },
    { id: 'Digit8', label: '8', sub: '*', width: 1, row: 0, col: 8 },
    { id: 'Digit9', label: '9', sub: '(', width: 1, row: 0, col: 9 },
    { id: 'Digit0', label: '0', sub: ')', width: 1, row: 0, col: 10 },
    { id: 'Minus', label: '-', sub: '_', width: 1, row: 0, col: 11 },
    { id: 'Equal', label: '=', sub: '+', width: 1, row: 0, col: 12 },
    { id: 'Backspace', label: 'Backspace', sub: '⌫', width: 2, row: 0, col: 13 },
  ],
  // 第二行 Row 1 (14键)
  [
    { id: 'Tab', label: 'Tab', sub: '⇥', width: 1.5, row: 1, col: 0 },
    { id: 'KeyQ', label: 'Q', width: 1, row: 1, col: 1 },
    { id: 'KeyW', label: 'W', width: 1, row: 1, col: 2 },
    { id: 'KeyE', label: 'E', width: 1, row: 1, col: 3 },
    { id: 'KeyR', label: 'R', width: 1, row: 1, col: 4 },
    { id: 'KeyT', label: 'T', width: 1, row: 1, col: 5 },
    { id: 'KeyY', label: 'Y', width: 1, row: 1, col: 6 },
    { id: 'KeyU', label: 'U', width: 1, row: 1, col: 7 },
    { id: 'KeyI', label: 'I', width: 1, row: 1, col: 8 },
    { id: 'KeyO', label: 'O', width: 1, row: 1, col: 9 },
    { id: 'KeyP', label: 'P', width: 1, row: 1, col: 10 },
    { id: 'BracketLeft', label: '[', sub: '{', width: 1, row: 1, col: 11 },
    { id: 'BracketRight', label: ']', sub: '}', width: 1, row: 1, col: 12 },
    { id: 'Backslash', label: '\\', sub: '|', width: 1.5, row: 1, col: 13 },
  ],
  // 第三行 Row 2 (13键)
  [
    { id: 'CapsLock', label: 'Caps', sub: '⇪', width: 1.75, row: 2, col: 0 },
    { id: 'KeyA', label: 'A', width: 1, row: 2, col: 1 },
    { id: 'KeyS', label: 'S', width: 1, row: 2, col: 2 },
    { id: 'KeyD', label: 'D', width: 1, row: 2, col: 3 },
    { id: 'KeyF', label: 'F', width: 1, row: 2, col: 4 },
    { id: 'KeyG', label: 'G', width: 1, row: 2, col: 5 },
    { id: 'KeyH', label: 'H', width: 1, row: 2, col: 6 },
    { id: 'KeyJ', label: 'J', width: 1, row: 2, col: 7 },
    { id: 'KeyK', label: 'K', width: 1, row: 2, col: 8 },
    { id: 'KeyL', label: 'L', width: 1, row: 2, col: 9 },
    { id: 'Semicolon', label: ';', sub: ':', width: 1, row: 2, col: 10 },
    { id: 'Quote', label: "'", sub: '"', width: 1, row: 2, col: 11 },
    { id: 'Enter', label: 'Enter', sub: '↵', width: 2.25, row: 2, col: 13 },
  ],
  // 第四行 Row 3 (14键 - 核心左移64特征：2.0u左Shift，右侧紧凑带独立上方向键与Del)
  [
    { id: 'ShiftLeft', label: 'Shift', width: 2, row: 3, col: 0 },
    { id: 'KeyZ', label: 'Z', width: 1, row: 3, col: 2 },
    { id: 'KeyX', label: 'X', width: 1, row: 3, col: 3 },
    { id: 'KeyC', label: 'C', width: 1, row: 3, col: 4 },
    { id: 'KeyV', label: 'V', width: 1, row: 3, col: 5 },
    { id: 'KeyB', label: 'B', width: 1, row: 3, col: 6 },
    { id: 'KeyN', label: 'N', width: 1, row: 3, col: 7 },
    { id: 'KeyM', label: 'M', width: 1, row: 3, col: 8 },
    { id: 'Comma', label: ',', sub: '<', width: 1, row: 3, col: 9 },
    { id: 'Period', label: '.', sub: '>', width: 1, row: 3, col: 10 },
    { id: 'Slash', label: '/', sub: '?', width: 1, row: 3, col: 11 },
    { id: 'ShiftRight', label: 'Shift', width: 1, row: 3, col: 12 },
    { id: 'ArrowUp', label: '↑', width: 1, row: 3, col: 13, isArrow: true },
    { id: 'Delete', label: 'Del', width: 1, row: 3, col: 14, isNav: true },
  ],
  // 第五行 Row 4 (9键 - 底部标准大空格 + 独立左右下方向键，完美对齐15.0u)
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 1.25, row: 4, col: 0 },
    { id: 'MetaLeft', label: 'Win', width: 1.25, row: 4, col: 1 },
    { id: 'AltLeft', label: 'Alt', width: 1.25, row: 4, col: 2 },
    { id: 'Space', label: 'Space', width: 6.25, row: 4, col: 6 },
    { id: 'AltRight', label: 'Alt', width: 1, row: 4, col: 9 },
    { id: 'Fn', label: 'Fn', width: 1, row: 4, col: 10 },
    { id: 'ArrowLeft', label: '←', width: 1, row: 5, col: 12, isArrow: true },
    { id: 'ArrowDown', label: '↓', width: 1, row: 5, col: 13, isArrow: true },
    { id: 'ArrowRight', label: '→', width: 1, row: 5, col: 14, isArrow: true },
  ]
];

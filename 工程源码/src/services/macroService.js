// 快捷指令 (宏录制与执行) 数据管理服务
// 完全对齐官方星闪方案与前行者 EWEADN / MCHOSE 规范 (0xF500 ~ 0xF50F, M0 ~ M15 共 16 组)

import { keyboardService } from './keyboardService';
import { HID_KEYCODES, KEYCODE_LABELS } from '../constants/keycodes';

const STORAGE_KEY = 'sparklink_macros_v2';
export const MACRO_COUNT = 16; // M0 ~ M15 官方 16 组板载硬件槽位

// 默认 6 种快捷指令触发模式定义 (协议模式 0 ~ 5，严格对齐官方底层与 UI 规约)
export const MACRO_MODES = [
  {
    id: 0,
    title: '点击执行，重复次，执行期间再次点击无效',
    shortTitle: '点击执行 (单次/有限循环)',
    desc: '执行期间再次点击无效',
    hasRepeatInput: true,
  },
  {
    id: 1,
    title: '点击执行，重复 -，执行期间再次点击，重新执行',
    shortTitle: '点击执行 (重入打断)',
    desc: '执行期间再次点击，重新执行',
    hasRepeatInput: false,
  },
  {
    id: 2,
    title: '点击执行，重复 -，执行期间再次点击，立即停止执行',
    shortTitle: '点击执行 (点击立即停止)',
    desc: '执行期间再次点击，立即停止执行',
    hasRepeatInput: false,
  },
  {
    id: 3,
    title: '点击执行，重复 -，执行期间再次点击，完成本次快捷指令后停止执行',
    shortTitle: '点击执行 (完成本次后停止)',
    desc: '执行期间再次点击，完成本次快捷指令后停止执行',
    hasRepeatInput: false,
  },
  {
    id: 4,
    title: '按住执行，重复次数无限，松开后立即停止执行',
    shortTitle: '长按循环 (松开立停)',
    desc: '重复次数无限，松开后立即停止执行',
    hasRepeatInput: false,
  },
  {
    id: 5,
    title: '按住执行，重复次数无限，松开后完成本次快捷指令后停止执行',
    shortTitle: '长按循环 (松开本次结束停)',
    desc: '重复次数无限，松开后完成本次快捷指令后停止执行',
    hasRepeatInput: false,
  },
];

/**
 * 将前端 UI 动作流 (含独立延时节点) 转换为单片机硬件 MacroAction[]
 * 硬件单包 15 个动作，每动作 4 字节 UInt32 小端序:
 * (statusBit << 31) | (delay << 16) | (keyCode & 0xffff)
 */
export function uiActionsToHardware(uiActions = [], defaultDelay = 10) {
  const hwActions = [];
  for (let i = 0; i < uiActions.length; i++) {
    const act = uiActions[i];
    if (!act) continue;

    // 若已经是硬件动作格式 { status, delay, keyCode }
    if (typeof act.status === 'number' && act.keyCode != null) {
      hwActions.push({
        status: act.status === 1 ? 1 : 0,
        delay: Math.max(0, Math.min(32767, Number(act.delay) || 0)),
        keyCode: Number(act.keyCode) || 0x04,
      });
      continue;
    }

    if (act.type === 'down' || act.type === 'up') {
      const status = act.type === 'down' ? 1 : 0;
      let keyCode = act.keyCode;
      if (!keyCode) {
        if (act.code && HID_KEYCODES[act.code]) {
          keyCode = HID_KEYCODES[act.code];
        } else if (act.key) {
          const matchingKey = Object.entries(KEYCODE_LABELS).find(
            ([_, label]) => label.toLowerCase() === String(act.key).toLowerCase()
          );
          keyCode = matchingKey ? Number(matchingKey[0]) : 0x04;
        } else {
          keyCode = 0x04;
        }
      }

      // 若紧随其后的节点是延时节点，则将该延时毫秒合并进当前按键动作的 delay 字段
      let delay = defaultDelay || 10;
      if (i + 1 < uiActions.length && uiActions[i + 1].type === 'delay') {
        delay = Math.max(0, Math.min(32767, Number(uiActions[i + 1].ms) || 0));
      }

      hwActions.push({
        status,
        delay,
        keyCode: Number(keyCode) || 0x04,
      });
    }
  }
  return hwActions;
}

/**
 * 将从单片机硬件读取的 MacroAction[] 转换为前端可视化动作节点流
 */
export function hardwareActionsToUi(hwActions = []) {
  const uiActions = [];
  (hwActions || []).forEach((hw, idx) => {
    if (!hw || (hw.keyCode === 0 && hw.delay === 0 && hw.status === 0)) return;

    const keyLabel = KEYCODE_LABELS[hw.keyCode] || `0x${hw.keyCode.toString(16)}`;
    const codeEntry = Object.entries(HID_KEYCODES).find(([_, codeVal]) => codeVal === hw.keyCode);
    const code = codeEntry ? codeEntry[0] : (keyLabel.length === 1 && /[A-Z]/.test(keyLabel) ? `Key${keyLabel}` : keyLabel);

    uiActions.push({
      id: `${hw.status === 1 ? 'down' : 'up'}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      type: hw.status === 1 ? 'down' : 'up',
      code,
      key: keyLabel,
      keyCode: hw.keyCode,
    });

    if (hw.delay > 0) {
      uiActions.push({
        id: `delay-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'delay',
        ms: hw.delay,
      });
    }
  });
  return uiActions;
}

// 初始化预设宏 (M0 ~ M15)
const INITIAL_MACROS = Array.from({ length: MACRO_COUNT }).map((_, idx) => {
  const id = `M${idx}`;
  let defaultActions = [];
  if (idx === 0) {
    defaultActions = [
      { id: 'act-0-1', type: 'down', code: 'KeyA', key: 'A', keyCode: 0x04 },
      { id: 'act-0-2', type: 'delay', ms: 10 },
      { id: 'act-0-3', type: 'up', code: 'KeyA', key: 'A', keyCode: 0x04 },
      { id: 'act-0-4', type: 'delay', ms: 10 },
      { id: 'act-0-5', type: 'down', code: 'KeyD', key: 'D', keyCode: 0x07 },
      { id: 'act-0-6', type: 'delay', ms: 10 },
      { id: 'act-0-7', type: 'up', code: 'KeyD', key: 'D', keyCode: 0x07 },
      { id: 'act-0-8', type: 'delay', ms: 10 },
      { id: 'act-0-9', type: 'down', code: 'KeyA', key: 'A', keyCode: 0x04 },
      { id: 'act-0-10', type: 'delay', ms: 10 },
      { id: 'act-0-11', type: 'up', code: 'KeyA', key: 'A', keyCode: 0x04 },
    ];
  } else if (idx === 1) {
    defaultActions = [
      { id: 'act-1-1', type: 'down', code: 'KeyQ', key: 'Q', keyCode: 0x14 },
      { id: 'act-1-2', type: 'delay', ms: 25 },
      { id: 'act-1-3', type: 'up', code: 'KeyQ', key: 'Q', keyCode: 0x14 },
      { id: 'act-1-4', type: 'delay', ms: 15 },
      { id: 'act-1-5', type: 'down', code: 'KeyE', key: 'E', keyCode: 0x18 },
      { id: 'act-1-6', type: 'delay', ms: 25 },
      { id: 'act-1-7', type: 'up', code: 'KeyE', key: 'E', keyCode: 0x18 },
    ];
  }

  return {
    id,
    index: idx,
    name: id,
    alias: idx === 0 ? '急停滑步' : (idx === 1 ? 'QE探头' : ''),
    mode: 0, // 0 = 点击执行单次/循环
    repeatCount: 1,
    useDefaultDelay: true,
    defaultDelayMs: 10,
    actions: defaultActions,
    isHardwareSynced: false,
    updatedAt: Date.now(),
  };
});

class MacroService {
  constructor() {
    this.macros = this.loadMacros();
  }

  loadMacros() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === MACRO_COUNT) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[MacroService] 读取本地宏存储失败，恢复初始预设:', e);
    }
    return INITIAL_MACROS;
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.macros));
    } catch (e) {
      console.error('[MacroService] 写入宏存储失败:', e);
    }
  }

  getAllMacros() {
    return [...this.macros];
  }

  getMacro(id) {
    return this.macros.find((m) => m.id === id) || this.macros[0];
  }

  updateMacro(id, updates) {
    const idx = this.macros.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.macros[idx] = {
        ...this.macros[idx],
        ...updates,
        updatedAt: Date.now(),
      };
      this.persist();
      return this.macros[idx];
    }
    return null;
  }

  // 保存宏并写入单片机硬件与板载 Flash
  async saveMacro(id, updates) {
    const macro = this.updateMacro(id, updates);
    if (!macro) return { success: false };

    const macroIndex = macro.index ?? parseInt(id.replace('M', ''), 10) ?? 0;
    const hwActions = uiActionsToHardware(macro.actions, macro.useDefaultDelay ? macro.defaultDelayMs : 10);

    let flashSaved = false;
    if (keyboardService && keyboardService.connected) {
      const res = await keyboardService.saveMacroToHardware(macroIndex, {
        mode: macro.mode,
        repNum: (macro.mode === 4 || macro.mode === 5) ? 65535 : (macro.repeatCount || 1),
        actions: hwActions,
      });
      flashSaved = !!res?.flashSaved;
      if (res?.success) {
        this.updateMacro(id, { isHardwareSynced: true });
      }
      return { 
        success: !!res?.success, 
        flashSaved, 
        verified: !!res?.verified, 
        actNum: res?.actNum ?? hwActions.length, 
        hardwareActionsCount: hwActions.length 
      };
    }

    return { success: true, flashSaved: false, offline: true, hardwareActionsCount: hwActions.length, verified: false };
  }

  // 清除宏并同步到单片机
  async clearMacro(id) {
    const macro = this.updateMacro(id, { actions: [], isHardwareSynced: false });
    const macroIndex = macro ? (macro.index ?? parseInt(id.replace('M', ''), 10) ?? 0) : 0;
    if (keyboardService && keyboardService.connected) {
      await keyboardService.clearMacroHardware(macroIndex);
    }
    return macro;
  }

  // 从单片机硬件完整读取全部 M0~M15 宏数据并同步本地
  async syncFromHardware() {
    if (!keyboardService || !keyboardService.connected) {
      console.log('[MacroService] 键盘未连接，无法从硬件同步宏数据');
      return false;
    }
    try {
      const hwMacros = await keyboardService.getMacroAllData(MACRO_COUNT);
      if (!Array.isArray(hwMacros)) return false;

      let syncedCount = 0;
      hwMacros.forEach((hw) => {
        const id = `M${hw.macroId}`;
        const idx = this.macros.findIndex((m) => m.id === id);
        if (idx !== -1) {
          // 如果硬件中该宏包含有效动作，则使用硬件数据覆盖展示
          if (hw.actNum > 0 && Array.isArray(hw.actions) && hw.actions.length > 0) {
            const uiActions = hardwareActionsToUi(hw.actions);
            this.macros[idx] = {
              ...this.macros[idx],
              mode: hw.mode,
              repeatCount: hw.repNum === 65535 ? 1 : Math.max(1, hw.repNum),
              actions: uiActions,
              isHardwareSynced: true,
              updatedAt: Date.now(),
            };
            syncedCount++;
          }
        }
      });

      this.persist();
      console.log(`[MacroService] 成功从单片机同步了 ${syncedCount} 组板载快捷指令`);
      return true;
    } catch (e) {
      console.error('[MacroService] 从硬件同步宏数据失败:', e);
      return false;
    }
  }

  resetAllMacros() {
    this.macros = INITIAL_MACROS;
    this.persist();
    return [...this.macros];
  }
}

export const macroService = new MacroService();

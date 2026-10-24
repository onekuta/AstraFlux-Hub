import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Square, 
  Trash2, 
  Save, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Package,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useToast } from './ToastProvider';
import { macroService, MACRO_MODES } from '../services/macroService';
import { keyboardService } from '../services/keyboardService';
import { HID_KEYCODES, KEYCODE_LABELS } from '../constants/keycodes';

export default function MacroTab({ onAssignToKey }) {
  const { addToast } = useToast();
  
  const [macros, setMacros] = useState(() => macroService.getAllMacros());
  const [selectedMacroId, setSelectedMacroId] = useState('M0');
  const currentMacro = macros.find((m) => m.id === selectedMacroId) || macros[0];

  // 状态
  const [isRecording, setIsRecording] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(keyboardService.connected);
  const lastEventTimeRef = useRef(null);
  const pressedKeysRef = useRef(new Set());
  const initialSyncedRef = useRef(false);

  // 手动插入按键弹窗
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [manualKey, setManualKey] = useState('KeyQ');
  const [manualActionType, setManualActionType] = useState('both'); // 'both' (按下+抬起) | 'down' | 'up'

  // 同步当前选中的宏的表单状态
  const [macroMode, setMacroMode] = useState(currentMacro.mode);
  const [repeatCount, setRepeatCount] = useState(currentMacro.repeatCount || 1);
  const [useDefaultDelay, setUseDefaultDelay] = useState(currentMacro.useDefaultDelay);
  const [defaultDelayMs, setDefaultDelayMs] = useState(currentMacro.defaultDelayMs || 10);
  const [actions, setActions] = useState(currentMacro.actions || []);

  // 监听硬件连接事件与自动初次同步（仅初次连接时触发一次，严禁在录制或编辑期间覆盖用户动作）
  useEffect(() => {
    let unmounted = false;

    const performInitialSync = async () => {
      if (initialSyncedRef.current || !keyboardService.connected) return;
      initialSyncedRef.current = true;
      try {
        const ok = await macroService.syncFromHardware();
        if (ok && !unmounted) {
          const all = macroService.getAllMacros();
          setMacros(all);
          const cur = all.find((m) => m.id === selectedMacroId) || all[0];
          if (cur && cur.actions && cur.actions.length > 0) {
            setMacroMode(cur.mode);
            setRepeatCount(cur.repeatCount || 1);
            setUseDefaultDelay(cur.useDefaultDelay);
            setDefaultDelayMs(cur.defaultDelayMs || 10);
            setActions(cur.actions || []);
          }
        }
      } catch (err) {
        console.warn('[MacroTab] 初次硬件同步跳过:', err);
      }
    };

    const unsub = keyboardService.subscribe((state) => {
      setIsConnected(state.connected);
      if (state.connected && !initialSyncedRef.current && !unmounted) {
        performInitialSync();
      }
    });

    if (keyboardService.connected && !initialSyncedRef.current) {
      performInitialSync();
    }

    return () => {
      unmounted = true;
      unsub();
    };
  }, []);

  // 切换宏时载入对应配置（先将离开宏的当前草稿更新至内存，避免来回切换丢失编辑）
  const prevMacroIdRef = useRef(selectedMacroId);
  useEffect(() => {
    if (prevMacroIdRef.current && prevMacroIdRef.current !== selectedMacroId) {
      macroService.updateMacro(prevMacroIdRef.current, {
        mode: macroMode,
        repeatCount,
        useDefaultDelay,
        defaultDelayMs,
        actions,
      });
    }
    prevMacroIdRef.current = selectedMacroId;

    if (currentMacro) {
      setMacroMode(currentMacro.mode);
      setRepeatCount(currentMacro.repeatCount || 1);
      setUseDefaultDelay(currentMacro.useDefaultDelay);
      setDefaultDelayMs(currentMacro.defaultDelayMs || 10);
      setActions(currentMacro.actions || []);
      if (isRecording) {
        setIsRecording(false);
      }
    }
  }, [selectedMacroId]);

  // 全局键盘录制监听（对齐官方防抖、消除系统长按重复键、精确注入 HID 键码）
  useEffect(() => {
    if (!isRecording) {
      lastEventTimeRef.current = null;
      pressedKeysRef.current.clear();
      return;
    }

    const handleKeyDown = (e) => {
      if (e.code === 'F12') return;
      // 关键防抖：过滤系统长按导致的重复 keydown 事件
      if (e.repeat || pressedKeysRef.current.has(e.code)) return;

      e.preventDefault();
      e.stopPropagation();

      pressedKeysRef.current.add(e.code);
      const now = Date.now();
      const newActions = [];

      // 精准计算标准 HID Keycode
      const hidCode = HID_KEYCODES[e.code] || (e.key ? (KEYCODE_LABELS ? Object.entries(KEYCODE_LABELS).find(([_, l]) => l.toLowerCase() === e.key.toLowerCase())?.[0] : null) : null) || 0x04;
      const keyLabel = KEYCODE_LABELS[hidCode] || (e.key ? e.key.toUpperCase() : e.code);

      // 如果有前置事件，插入延时节点
      if (lastEventTimeRef.current !== null) {
        const delta = useDefaultDelay ? defaultDelayMs : Math.max(1, Math.min(2000, now - lastEventTimeRef.current));
        newActions.push({
          id: `delay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'delay',
          ms: delta,
        });
      }

      newActions.push({
        id: `down-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'down',
        code: e.code,
        key: keyLabel,
        keyCode: Number(hidCode) || 0x04,
      });

      lastEventTimeRef.current = now;
      setActions((prev) => [...prev, ...newActions]);
    };

    const handleKeyUp = (e) => {
      if (e.code === 'F12') return;
      e.preventDefault();
      e.stopPropagation();

      pressedKeysRef.current.delete(e.code);
      const now = Date.now();
      const newActions = [];

      const hidCode = HID_KEYCODES[e.code] || (e.key ? (KEYCODE_LABELS ? Object.entries(KEYCODE_LABELS).find(([_, l]) => l.toLowerCase() === e.key.toLowerCase())?.[0] : null) : null) || 0x04;
      const keyLabel = KEYCODE_LABELS[hidCode] || (e.key ? e.key.toUpperCase() : e.code);

      if (lastEventTimeRef.current !== null) {
        const delta = useDefaultDelay ? defaultDelayMs : Math.max(1, Math.min(2000, now - lastEventTimeRef.current));
        newActions.push({
          id: `delay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'delay',
          ms: delta,
        });
      }

      newActions.push({
        id: `up-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'up',
        code: e.code,
        key: keyLabel,
        keyCode: Number(hidCode) || 0x04,
      });

      lastEventTimeRef.current = now;
      setActions((prev) => [...prev, ...newActions]);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isRecording, useDefaultDelay, defaultDelayMs]);

  // 手动从键盘硬件同步
  const handleSyncFromHardware = async () => {
    if (!keyboardService.connected) {
      addToast({ message: '键盘未连接，无法从硬件读取快捷指令！', type: 'warning' });
      return;
    }
    setIsSyncing(true);
    try {
      const ok = await macroService.syncFromHardware();
      if (ok) {
        const all = macroService.getAllMacros();
        setMacros(all);
        const cur = all.find((m) => m.id === selectedMacroId) || all[0];
        if (cur) {
          setMacroMode(cur.mode);
          setRepeatCount(cur.repeatCount || 1);
          setUseDefaultDelay(cur.useDefaultDelay);
          setDefaultDelayMs(cur.defaultDelayMs || 10);
          setActions(cur.actions || []);
        }
        addToast({ message: '已成功从键盘单片机同步全部板载快捷指令！', type: 'success' });
      } else {
        addToast({ message: '从硬件读取快捷指令失败，请检查连接。', type: 'error' });
      }
    } catch (e) {
      addToast({ message: `读取异常: ${e.message || e}`, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // 保存当前宏并真实下发单片机板载 Flash
  const handleSave = async () => {
    setIsRecording(false);
    setIsSaving(true);
    try {
      const res = await macroService.saveMacro(selectedMacroId, {
        mode: macroMode,
        repeatCount,
        useDefaultDelay,
        defaultDelayMs,
        actions,
      });
      setMacros(macroService.getAllMacros());
      if (res?.verified) {
        addToast({
          message: `快捷指令【${currentMacro.name}】已成功写入单片机硬件并固化至板载 Flash 闪存！经回读校验包含 ${res.hardwareActionsCount} 个有效硬件动作。`,
          type: 'success',
        });
      } else if (res?.flashSaved) {
        addToast({
          message: `快捷指令【${currentMacro.name}】已成功写入单片机并固化至板载 Flash 闪存！包含 ${res.hardwareActionsCount} 个硬件动作。`,
          type: 'success',
        });
      } else if (res?.success && !res?.offline) {
        addToast({
          message: `快捷指令【${currentMacro.name}】已写入硬件！包含 ${res.hardwareActionsCount} 个动作。`,
          type: 'success',
        });
      } else {
        addToast({
          message: `键盘未连接，快捷指令【${currentMacro.name}】已保存至本地配置（连接键盘后点击保存即可下发板载闪存）。`,
          type: 'warning',
        });
      }
    } catch (e) {
      addToast({
        message: `保存快捷指令失败: ${e.message || e}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 清除数据
  const handleClear = async () => {
    setActions([]);
    await macroService.clearMacro(selectedMacroId);
    setMacros(macroService.getAllMacros());
    addToast({
      message: `快捷指令【${currentMacro.name}】动作数据已清空并从板载 Flash 清除。`,
      type: 'info',
    });
  };

  // 手动插入动作
  const handleAddManualKey = () => {
    const newItems = [];
    if (manualActionType === 'both') {
      newItems.push({
        id: `down-${Date.now()}`,
        type: 'down',
        code: manualKey,
        key: manualKey.replace('Key', ''),
      });
      newItems.push({
        id: `delay-${Date.now()}`,
        type: 'delay',
        ms: defaultDelayMs,
      });
      newItems.push({
        id: `up-${Date.now()}`,
        type: 'up',
        code: manualKey,
        key: manualKey.replace('Key', ''),
      });
    } else {
      newItems.push({
        id: `${manualActionType}-${Date.now()}`,
        type: manualActionType,
        code: manualKey,
        key: manualKey.replace('Key', ''),
      });
    }
    setActions((prev) => [...prev, ...newItems]);
    setShowAddKeyModal(false);
  };

  // 删除单步
  const handleDeleteAction = (idx) => {
    setActions((prev) => prev.filter((_, i) => i !== idx));
  };

  // 修改延迟毫秒数
  const handleUpdateDelay = (idx, newMs) => {
    const val = Math.max(1, parseInt(newMs, 10) || 1);
    setActions((prev) => prev.map((act, i) => i === idx ? { ...act, ms: val } : act));
  };

  return (
    <div className="panel-operation select-none h-full flex flex-col justify-between overflow-hidden">
      
      {/* 顶部简明提示条 */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[var(--border-color)] shrink-0 min-w-0">
        <div className="flex items-center space-x-2 min-w-0 mr-2">
          <Sparkles className="w-4 h-4 text-[var(--info-color)] shrink-0" />
          <span className="text-sm font-bold text-[var(--text-primary)] shrink-0 whitespace-nowrap">快捷指令与宏编辑器</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncFromHardware}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--primary-09)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] transition cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
            title="从键盘硬件单片机读取板载 Flash 宏数据"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[var(--info-color)]' : ''}`} />
            <span>{isSyncing ? '正在读取...' : '从键盘读取板载宏'}</span>
          </button>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isConnected ? '板载芯片就绪' : '本地暂存'}</span>
          </div>
        </div>
      </div>

      {/* 核心三栏布局 (完全对标官方与前行者 EWEADN 截屏) */}
      <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
        
        {/* ================= 第一列：宏列表 (官网 4x4 矩阵样式) ================= */}
        <div className="w-[276px] lg:w-[286px] shrink-0 flex flex-col h-full bg-[var(--bg-tertiary)]/70 rounded-xl border border-[var(--border-color)]/80 p-2.5 overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0 px-1">
            <span className="text-sm font-bold font-title text-[var(--text-primary)]">宏列表</span>
            <span className="text-[11px] font-mono text-[var(--text-disabled)]">共 {macros.length} 组</span>
          </div>

          {/* 官网 4x4 宏键矩阵面板 */}
          <div className="bg-[var(--bg-secondary)]/50 dark:bg-[#1a1c20]/60 p-2.5 rounded-xl border border-[var(--border-color)]/80 shadow-xs shrink-0">
            <div className="grid grid-cols-4 gap-2">
              {macros.map((m) => {
                const isSelected = m.id === selectedMacroId;
                const hasActions = (m.actions || []).length > 0;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMacroId(m.id)}
                    title={`${m.name}${m.alias ? ` (${m.alias})` : ''} · ${m.isHardwareSynced ? '板载芯片就绪' : (hasActions ? `${m.actions.length}个动作` : '未录制')}`}
                    className={`relative aspect-square flex items-center justify-center rounded-[8px] transition-all cursor-pointer select-none font-bold text-xs sm:text-sm tracking-wide ${
                      isSelected
                        ? 'bg-[#2b2d31] dark:bg-[#2b2d31] border-2 border-[#1677ff] text-white shadow-[0_0_10px_rgba(22,119,255,0.4)] z-10'
                        : 'bg-[var(--bg-secondary)]/90 dark:bg-[#23252a] hover:bg-[#2c2e34] border border-[var(--border-color)] hover:border-white/30 text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="font-bold">{m.name}</span>
                    {hasActions && (
                      <span 
                        className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                          m.isHardwareSynced 
                            ? 'bg-emerald-400 ring-2 ring-emerald-500/20' 
                            : 'bg-[#1677ff] ring-2 ring-[#1677ff]/20'
                        }`} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 当前选中宏信息与快速备注 */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)]/40 border border-[var(--border-color)]/70 flex flex-col gap-2 text-xs shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">当前宏备注 / 别名</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                currentMacro.isHardwareSynced
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold'
                  : ((currentMacro.actions || []).length > 0 ? 'bg-[var(--primary-04)] text-[var(--info-color)] border-[var(--primary-15)] font-semibold' : 'text-[var(--text-disabled)] border-transparent')
              }`}>
                {currentMacro.isHardwareSynced ? '板载同步' : ((currentMacro.actions || []).length > 0 ? `${currentMacro.actions.length} 动作` : '未录制')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0">
                {currentMacro.id}
              </span>
              <input
                type="text"
                value={currentMacro.alias || ''}
                placeholder="可输入备注 (如: 急停滑步)"
                onChange={(e) => {
                  const newAlias = e.target.value;
                  setMacros((prev) => prev.map((m) => m.id === currentMacro.id ? { ...m, alias: newAlias } : m));
                  macroService.updateMacro(currentMacro.id, { alias: newAlias });
                }}
                className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:border-[#1677ff]"
              />
            </div>
            
            <div className="text-[10px] text-[var(--text-tertiary)] flex items-center justify-between pt-0.5">
              <span>支持在按键配置中关联</span>
              <span className="font-mono">槽位: 0xF50{currentMacro.index != null ? currentMacro.index.toString(16).toUpperCase() : '0'}</span>
            </div>
          </div>
        </div>

        {/* ================= 第二列：选择快捷指令模式 ================= */}
        <div className="w-56 lg:w-60 shrink-0 flex flex-col h-full bg-[var(--bg-tertiary)]/70 rounded-xl border border-[var(--border-color)]/80 p-2.5 overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0 px-1">
            <span className="text-sm font-bold font-title text-[var(--text-primary)]">宏设置</span>
            <span className="text-[11px] text-[var(--text-disabled)]">6种模式</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {MACRO_MODES.map((mode) => {
              const isSelected = macroMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setMacroMode(mode.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start space-x-2 ${
                    isSelected
                      ? 'bg-[var(--bg-secondary)] border-[var(--text-primary)] shadow-xs'
                      : 'bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  {/* 单选圈指示器 */}
                  <div className="mt-0.5 shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? 'border-[var(--text-primary)] bg-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-primary)]" />}
                    </div>
                  </div>

                  {/* 模式内容 */}
                  <div className="flex-1 min-w-0 text-xs">
                    {mode.hasRepeatInput ? (
                      <div className="flex items-center flex-wrap gap-1 leading-relaxed text-[var(--text-primary)] font-medium">
                        <span>点击执行，重复</span>
                        {/* 数字步进器 */}
                        <div className="inline-flex items-center border border-[var(--border-color)] rounded bg-[var(--bg-primary)] px-1 py-0.5 mx-0.5" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="number" 
                            min="1" 
                            max="9999" 
                            value={repeatCount}
                            onChange={(e) => setRepeatCount(Math.max(1, Math.min(9999, parseInt(e.target.value, 10) || 1)))}
                            className="w-8 text-center text-xs font-mono font-bold focus:outline-none bg-transparent"
                          />
                          <div className="flex flex-col ml-0.5">
                            <button 
                              type="button"
                              onClick={() => setRepeatCount(c => Math.min(9999, c + 1))}
                              className="text-[8px] hover:text-[var(--info-color)] cursor-pointer leading-none"
                            >
                              ▲
                            </button>
                            <button 
                              type="button"
                              onClick={() => setRepeatCount(c => Math.max(1, c - 1))}
                              className="text-[8px] hover:text-[var(--info-color)] cursor-pointer leading-none"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <span>次，执行期间再次点击无效</span>
                      </div>
                    ) : (
                      <div className="text-[var(--text-primary)] font-medium leading-relaxed">
                        {mode.title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 第三列：快捷指令录制 ================= */}
        <div className="flex-1 min-w-0 flex flex-col h-full bg-[var(--bg-tertiary)]/70 rounded-xl border border-[var(--border-color)]/80 p-3 overflow-hidden">
          
          {/* 顶部操作工具栏 (对标官方与前行者规范：录制、清除、保存) */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)] shrink-0 gap-1.5 min-w-0">
            <span className="text-sm font-bold font-title text-[var(--text-primary)] shrink-0">快捷指令录制</span>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 录制按钮 */}
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                    addToast({ message: '已停止录制', type: 'info' });
                  } else {
                    setIsRecording(true);
                    addToast({ message: '● 正在录制按键操作，敲击键盘即可自动记录轨迹...', type: 'warning' });
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center space-x-1 cursor-pointer transition shrink-0 shadow-2xs ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)]'
                }`}
              >
                {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span className="whitespace-nowrap">{isRecording ? '停止' : '开始录制'}</span>
              </button>

              {/* 清除数据 */}
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 rounded-md text-xs font-medium bg-[var(--bg-secondary)] hover:bg-rose-50 hover:text-rose-600 text-[var(--text-secondary)] border border-[var(--border-color)] transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                清除
              </button>

              {/* 保存按钮 (对齐官方规范“保存”) */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center space-x-1 shrink-0 whitespace-nowrap"
              >
                {isSaving && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{isSaving ? '正在烧录...' : '保存'}</span>
              </button>
            </div>
          </div>

          {/* 说明文字与默认延时快捷设置行 */}
          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] py-1.5 shrink-0 gap-2 min-w-0">
            <div className="truncate min-w-0">
              {isRecording ? (
                <span className="text-rose-500 font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1.5 shrink-0" />
                  <span className="truncate">正在实时监听键盘输入，请敲击按键...</span>
                </span>
              ) : (
                <span className="truncate">点击开始录制，开始记录按键动作，最后记得进行保存哦</span>
              )}
            </div>

            {/* 默认延时设置 */}
            <div className="flex items-center space-x-1 text-xs text-[var(--text-secondary)] shrink-0">
              <input 
                type="checkbox" 
                id="use-default-delay"
                checked={useDefaultDelay} 
                onChange={(e) => setUseDefaultDelay(e.target.checked)} 
                className="w-3.5 h-3.5 accent-[var(--info-color)] cursor-pointer"
              />
              <label htmlFor="use-default-delay" className="text-[11px] whitespace-nowrap cursor-pointer select-none">
                默认延时
              </label>
              {useDefaultDelay && (
                <div className="flex items-center border border-[var(--border-color)] rounded bg-[var(--bg-primary)] px-1 py-0.5 ml-0.5 shadow-2xs">
                  <input 
                    type="number" 
                    min="1" 
                    max="5000" 
                    value={defaultDelayMs}
                    onChange={(e) => setDefaultDelayMs(Math.max(1, parseInt(e.target.value, 10) || 10))}
                    className="w-8 text-center text-xs font-mono font-bold focus:outline-none bg-transparent text-[var(--text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--text-disabled)] font-mono ml-0.5">ms</span>
                </div>
              )}
            </div>
          </div>

          {/* 动作流内容区 */}
          <div className="flex-1 overflow-y-auto p-2 bg-[var(--bg-secondary)]/40 rounded-xl border border-[var(--border-color)]/60 my-1 custom-scrollbar">
            {actions.length === 0 ? (
              /* 空状态：纸箱插画 + 暂无录制动作 (还原 media_1791893695809_f2d6e215.png) */
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-disabled)] py-8 select-none">
                <Package className="w-16 h-16 opacity-30 stroke-[1.2] mb-2" />
                <span className="text-xs font-medium">暂无录制动作</span>
              </div>
            ) : (
              /* 动作流序列 */
              <div className="space-y-1.5 select-none">
                {actions.map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs transition hover:border-[var(--info-color)]/50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-[var(--text-disabled)] w-5">
                        #{idx + 1}
                      </span>

                      {act.type === 'delay' ? (
                        <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>延时</span>
                          <input 
                            type="number" 
                            min="1" 
                            max="9999" 
                            value={act.ms} 
                            onChange={(e) => handleUpdateDelay(idx, e.target.value)}
                            className="w-12 px-1 text-center font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded focus:outline-none"
                          />
                          <span>ms</span>
                        </div>
                      ) : act.type === 'down' ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            按下
                          </span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            {act.key || act.code}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                            ({act.code})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                            抬起
                          </span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            {act.key || act.code}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                            ({act.code})
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAction(idx)}
                      className="p-1 hover:text-rose-500 text-[var(--text-disabled)] transition cursor-pointer"
                      title="删除该步动作"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部按钮：+ 添加键盘按键 */}
          <div className="pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddKeyModal(true)}
              className="w-full py-2 rounded-xl border border-dashed border-[var(--border-color)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-[var(--text-secondary)] text-xs font-bold flex items-center justify-center space-x-1 transition cursor-pointer bg-[var(--bg-secondary)]/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加键盘按键</span>
            </button>
          </div>

        </div>

      </div>

      {/* 手动插入按键弹窗 */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[8px] p-5 w-80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">添加键盘动作</span>
              <button onClick={() => setShowAddKeyModal(false)} className="text-[var(--text-disabled)] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">选择按键</label>
                <select
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg font-mono focus:outline-none"
                >
                  {['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'Space', 'ShiftLeft', 'ControlLeft', 'Tab', 'Enter'].map(k => (
                    <option key={k} value={k}>{k.replace('Key', '')} ({k})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] mb-1 font-semibold">动作类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: '按下+抬起' },
                    { id: 'down', label: '单按下' },
                    { id: 'up', label: '单抬起' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setManualActionType(t.id)}
                      className={`py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                        manualActionType === t.id
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)]'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setShowAddKeyModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddManualKey}
                className="px-4 py-1.5 rounded-lg bg-[var(--info-color)] text-white text-xs font-bold cursor-pointer hover:opacity-90 shadow-xs"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  Check, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ShieldAlert,
  Info,
  Lock
} from 'lucide-react';
import { keyboardService } from '../services/keyboardService';
import { ALL_POLLING_RATE_METADATA } from '../constants/deviceProfiles';
import { useToast } from './ToastProvider';

export default function PerformanceTab({ 
  pollingRate = 8000, 
  onPollingRateChange,
  deviceProfile,
  onOpenUsb3Prompt
}) {
  const { addToast } = useToast();

  // 判断当前设备是否具备 32K 硬件支持能力 (如前行者 ES68 破晓、32K 极速方案芯片等)
  const has32kHardware = !!(
    deviceProfile?.hardwareMaxPollingRate >= 32000 ||
    deviceProfile?.hardRateCeiling >= 32000 ||
    deviceProfile?.features?.['32K极速方案'] ||
    deviceProfile?.features?.rt32k ||
    (deviceProfile?.model || deviceProfile?.name || '').toUpperCase().includes('ES68') ||
    (deviceProfile?.shortName || '').toUpperCase().includes('ES68')
  );

  // 根据当前连接的设备动态确定最大支持回报率与可用档位 (DV63 封顶 8KHz)
  const maxPollingRate = deviceProfile?.maxPollingRate || 8000;
  const supportedRatesList = deviceProfile?.supportedPollingRates || [1000, 2000, 4000, 8000];

  // 若硬件支持 32K 方案，保留 32KHz (32000) 与 16KHz (16000) 供用户查看并引导安装 USB 3.0 专用驱动
  const effectiveSupportedRates = has32kHardware
    ? Array.from(new Set([32000, 16000, ...supportedRatesList]))
    : supportedRatesList;

  const availableRateItems = ALL_POLLING_RATE_METADATA.filter(
    (item) => effectiveSupportedRates.includes(item.val) && (has32kHardware || item.val <= maxPollingRate)
  );

  // USB 3.0 驱动就绪状态 (默认普通免驱模式下为未安装/未解锁，需要专用 USB 3.0 驱动支持)
  const [isUsb3Unlocked, setIsUsb3Unlocked] = useState(false);
  const [hoveredLockedRate, setHoveredLockedRate] = useState(null);

  // 1. 休眠设置 (0 表示永不休眠)
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [neverSleep, setNeverSleep] = useState(true);

  // 2. 回报率设置 (Hz) (严格受限于当前设备硬件上限)
  const [currentRate, setCurrentRate] = useState(() => Math.min(pollingRate || 8000, maxPollingRate));

  useEffect(() => {
    if (pollingRate) {
      const clamped = Math.min(pollingRate, maxPollingRate);
      setCurrentRate(clamped);
    }
  }, [pollingRate, maxPollingRate]);

  // 3. 按键防抖优化开关
  const [debounceEnabled, setDebounceEnabled] = useState(false);

  // 4. RT稳定性设置 (开关 + 1~15 梯度滑块)
  const [rtStabilityEnabled, setRtStabilityEnabled] = useState(true);
  const [rtStabilityValue, setRtStabilityValue] = useState(5); // 1: 极限, 5: 平衡偏极限, 10: 平衡, 15: 稳定

  // 5. 稳定性模式 (防误触)
  const [antiMisfireEnabled, setAntiMisfireEnabled] = useState(true);

  // 6. Win键锁定
  const [winLockEnabled, setWinLockEnabled] = useState(false);

  // 7. 切换为Mac模式
  const [macModeEnabled, setMacModeEnabled] = useState(false);

  // 8. 自适应动态校准2.0
  const [dynamicCalibrationEnabled, setDynamicCalibrationEnabled] = useState(true);

  // 休眠时间防抖 200ms 自动实时写入硬件
  const sleepTimerRef = useRef(null);
  const isInitialSleepMount = useRef(true);

  const deviceKey = deviceProfile?.id || deviceProfile?.model || 'default';

  // 首次连接时从硬件加载当前性能状态与模式
  useEffect(() => {
    if (!keyboardService.connected) return;
    const fetchBoardPerformance = async () => {
      try {
        const sleepTime = await keyboardService.getLightingSleepTime();
        if (typeof sleepTime === 'number') {
          setSleepMinutes(sleepTime);
          setNeverSleep(sleepTime === 0);
        }
      } catch (e) {}

      try {
        const shake = await keyboardService.getShakeOptimization();
        if (typeof shake === 'boolean') {
          setDebounceEnabled(shake);
        }
      } catch (e) {}

      try {
        const sys = await keyboardService.getSystemType();
        if (sys) {
          setMacModeEnabled(sys === 'MAC');
        }
      } catch (e) {}
    };
    fetchBoardPerformance();
  }, [keyboardService.connected]);

  // 读取已保存的设备偏好设置 (RT稳定性、防误触、Win锁、自适应校准等)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`perf_prefs_${deviceKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.rtStabilityEnabled === 'boolean') setRtStabilityEnabled(parsed.rtStabilityEnabled);
        if (typeof parsed.rtStabilityValue === 'number') setRtStabilityValue(parsed.rtStabilityValue);
        if (typeof parsed.antiMisfireEnabled === 'boolean') setAntiMisfireEnabled(parsed.antiMisfireEnabled);
        if (typeof parsed.winLockEnabled === 'boolean') setWinLockEnabled(parsed.winLockEnabled);
        if (typeof parsed.dynamicCalibrationEnabled === 'boolean') setDynamicCalibrationEnabled(parsed.dynamicCalibrationEnabled);
      }
    } catch (e) {}
  }, [deviceKey]);

  // 配置项发生变动时自动实时持久化保存
  useEffect(() => {
    try {
      localStorage.setItem(`perf_prefs_${deviceKey}`, JSON.stringify({
        rtStabilityEnabled,
        rtStabilityValue,
        antiMisfireEnabled,
        winLockEnabled,
        dynamicCalibrationEnabled
      }));
    } catch (e) {}
  }, [deviceKey, rtStabilityEnabled, rtStabilityValue, antiMisfireEnabled, winLockEnabled, dynamicCalibrationEnabled]);

  useEffect(() => {
    if (isInitialSleepMount.current) {
      isInitialSleepMount.current = false;
      return;
    }
    if (!keyboardService.connected) return;
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(async () => {
      const minutes = neverSleep ? 0 : sleepMinutes;
      await keyboardService.setLightingSleepTime(minutes);
    }, 200);
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepMinutes, neverSleep]);

  // 防抖开关即时写入硬件与闪存
  const handleDebounceToggle = async (val) => {
    setDebounceEnabled(val);
    if (keyboardService.connected) {
      await keyboardService.setShakeOptimization(val);
    }
  };

  // Mac模式开关即时写入硬件与闪存
  const handleMacModeToggle = async (val) => {
    setMacModeEnabled(val);
    if (keyboardService.connected) {
      await keyboardService.setSystemType(val ? 'MAC' : 'WIN');
    }
  };

  const handleRateSelect = (rate) => {
    const itemMeta = ALL_POLLING_RATE_METADATA.find((i) => i.val === rate);
    if (itemMeta?.requiresUsb3 && !isUsb3Unlocked) {
      if (typeof onOpenUsb3Prompt === 'function') {
        onOpenUsb3Prompt();
      } else if (typeof window.__triggerUsb3Prompt === 'function') {
        window.__triggerUsb3Prompt();
      }
      addToast({
        message: `${itemMeta.label} 极速回报率需要专用 USB 3.0 驱动与 USB 3.0 接口支持`,
        type: 'info',
        duration: 2500
      });
      return;
    }

    const clamped = Math.min(rate, maxPollingRate);
    setCurrentRate(clamped);
    if (keyboardService.connected) {
      keyboardService.setRateOfReturn(clamped);
    }
    if (onPollingRateChange) {
      onPollingRateChange(clamped);
    }
    // 超过 8KHz 提示专用 3.0 驱动
    if (clamped > 8000) {
      if (typeof onOpenUsb3Prompt === 'function') {
        onOpenUsb3Prompt();
      } else if (typeof window.__triggerUsb3Prompt === 'function') {
        window.__triggerUsb3Prompt();
      }
    }
    addToast({
      message: `回报率已切换为 ${clamped >= 1000 ? `${clamped / 1000}KHz` : `${clamped}Hz`} (${(1000 / clamped).toFixed(3)}ms)`,
      type: 'info',
      duration: 1500
    });
  };

  return (
    <div className="flex flex-col gap-4 flex-1 select-none overflow-y-auto pr-1 custom-scrollbar">
      
      {/* 双列 8 大核心性能卡片网格 (完全对齐截屏 media_1791573430257.png) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* ===================== 左列 4 张卡片 ===================== */}
        <div className="flex flex-col gap-4">
          
          {/* 卡片 1：休眠设置 (分钟) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                休眠设置 (分钟)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                设备空闲指定时间后，灯光会自动进入休眠状态
              </p>
            </div>

            <div className="flex items-center space-x-3 mt-4 pt-1">
              <input 
                type="range"
                min="0"
                max="30"
                step="1"
                value={neverSleep ? 0 : sleepMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSleepMinutes(val);
                  setNeverSleep(val === 0);
                }}
                className="flex-1 accent-[var(--info-color)] h-1.5 bg-[var(--primary-09)] rounded-lg cursor-pointer"
              />

              <span className="font-mono text-sm font-extrabold text-[var(--text-primary)] w-6 text-center">
                {neverSleep ? 0 : sleepMinutes}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (!neverSleep) {
                    setNeverSleep(true);
                    setSleepMinutes(0);
                  } else {
                    setNeverSleep(false);
                    setSleepMinutes(5);
                  }
                }}
                className="flex items-center space-x-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0 ml-2"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                  neverSleep ? 'bg-[var(--info-color)] text-white' : 'border border-[var(--border-color)] bg-[var(--bg-primary)]'
                }`}>
                  {neverSleep && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>永不休眠</span>
              </button>
            </div>
          </div>

          {/* 卡片 2：回报率设置 (Hz) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)]">
                  回报率设置 (Hz)
                </h3>
                <span 
                  className="text-rose-500 text-xs cursor-pointer font-bold" 
                  title="更高的回报率带来更低的输入延迟。16KHz/32KHz 超高回报率需安装专用 USB 3.0 驱动并在 USB 3.0 接口下运行"
                >
                  ⓘ
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                较高的键盘回报率，可以减少输入延迟的影响{has32kHardware && '（16K/32K 档位需专用 USB 3.0 驱动支持）'}
              </p>
            </div>

            <div className="flex items-center space-x-5 mt-4 pt-1 flex-wrap gap-y-2">
              {availableRateItems.map((item) => {
                const isSelected = currentRate === item.val;
                const isRequiresUsb3 = !!item.requiresUsb3;
                const isLocked = isRequiresUsb3 && !isUsb3Unlocked;
                const isHovered = hoveredLockedRate === item.val;

                return (
                  <div 
                    key={item.val} 
                    className="relative"
                    onMouseEnter={() => {
                      if (isLocked) setHoveredLockedRate(item.val);
                    }}
                    onMouseLeave={() => {
                      if (isLocked) setHoveredLockedRate(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          if (typeof onOpenUsb3Prompt === 'function') {
                            onOpenUsb3Prompt();
                          } else if (typeof window.__triggerUsb3Prompt === 'function') {
                            window.__triggerUsb3Prompt();
                          }
                          addToast({
                            message: `${item.label} 超高回报率需要专用 USB 3.0 驱动与 USB 3.0 接口支持`,
                            type: 'info',
                            duration: 2500
                          });
                          return;
                        }
                        handleRateSelect(item.val);
                      }}
                      className={`flex items-center space-x-1.5 text-[13px] font-bold transition group ${
                        isLocked
                          ? 'opacity-65 text-zinc-400 dark:text-zinc-500 hover:opacity-95 cursor-pointer'
                          : 'cursor-pointer'
                      }`}
                      title={isLocked ? `${item.label} 需要 USB 3.0 专用驱动，点击下载` : `${item.desc} (${item.timeMs})`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition border ${
                        isSelected 
                          ? 'bg-[var(--info-color)] border-[var(--info-color)] text-white' 
                          : isLocked
                          ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-400'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] group-hover:border-[var(--text-secondary)]'
                      }`}>
                        {isSelected ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        ) : isLocked ? (
                          <Lock className="w-2.5 h-2.5 text-zinc-400 dark:text-zinc-500" />
                        ) : null}
                      </div>

                      <span className={
                        isSelected 
                          ? 'text-[var(--info-color)] font-extrabold' 
                          : isLocked 
                          ? 'text-zinc-500 dark:text-zinc-400 font-bold' 
                          : 'text-[var(--text-secondary)]'
                      }>
                        {item.label}
                      </span>

                      {isLocked && (
                        <span className="text-[10px] px-1.5 py-[1px] rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-mono font-bold flex items-center gap-0.5">
                          需驱动
                        </span>
                      )}

                      {!isLocked && item.val === 8000 && !has32kHardware && (
                        <span className="text-[10px] px-1.5 py-[1px] rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono font-bold">
                          最高
                        </span>
                      )}

                      {!isLocked && item.val === 8000 && has32kHardware && (
                        <span className="text-[10px] px-1.5 py-[1px] rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-mono font-bold">
                          免驱最高
                        </span>
                      )}
                    </button>

                    {/* 悬浮提示气泡 (跟随整个软件主题配色：亮色浅雅白，深色沉浸黑，绝不突兀) */}
                    {isLocked && isHovered && (
                      <div 
                        className="absolute bottom-full left-0 mb-2.5 w-68 p-3.5 bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-[10px] shadow-2xl border border-[var(--border-color)] text-xs z-50 animate-fadeIn pointer-events-auto select-none"
                        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12))' }}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <div className="font-bold text-[var(--text-primary)] text-xs flex items-center justify-between">
                              <span>{item.label} 极速回报率</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-500/25">
                                USB 3.0
                              </span>
                            </div>
                            <span className="text-[var(--text-secondary)] leading-snug text-[11.5px] mt-0.5">
                              超高回报率需要专用 USB 3.0 驱动与 USB 3.0 接口支持。
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onOpenUsb3Prompt === 'function') {
                                  onOpenUsb3Prompt();
                                } else if (typeof window.__triggerUsb3Prompt === 'function') {
                                  window.__triggerUsb3Prompt();
                                }
                              }}
                              className="text-[var(--info-color)] font-bold hover:underline underline-offset-2 mt-1 text-left cursor-pointer flex items-center space-x-1"
                            >
                              <span>点击前往下载 USB 3.0 驱动</span>
                              <span>&gt;</span>
                            </button>
                          </div>
                        </div>
                        {/* 小三角形指示箭头 (主题自适应) */}
                        <div className="absolute top-full left-5 border-4 border-transparent border-t-[var(--border-color)]" />
                        <div className="absolute top-full left-5 border-4 border-transparent border-t-[var(--surface-solid-secondary)] -mt-[1px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 卡片 3：按键防抖优化 */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div className="pr-4">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                按键防抖优化
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                减少按键抖动导致的重复触发问题
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={debounceEnabled} 
                onChange={(e) => handleDebounceToggle(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
            </label>
          </div>

          {/* 卡片 4：RT稳定性设置 (带极限/平衡/稳定梯度滑块) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)]">
                RT稳定性设置
              </h3>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={rtStabilityEnabled} 
                  onChange={(e) => setRtStabilityEnabled(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
              </label>
            </div>

            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
              手动调节 RT 参数的响应激进度。向「极限」调整响应更快，向「稳定」调整按键更稳。
            </p>

            <div className={`pt-1 select-none transition-opacity ${rtStabilityEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              {/* 刻度与数字区域 (内边距 6px 对齐滑块圆心) */}
              <div className="relative px-[6px] mb-0.5">
                {/* 刻度数字与刻度线容器 */}
                <div className="relative h-[24px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => {
                    const isMajor = val === 1 || val === 5 || val === 10 || val === 15;
                    const leftPct = ((val - 1) / 14) * 100;
                    return (
                      <div 
                        key={val}
                        className="absolute top-0 bottom-0 flex flex-col items-center cursor-pointer"
                        style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                        onClick={() => rtStabilityEnabled && setRtStabilityValue(val)}
                      >
                        {/* 数字标注 (仅 1, 5, 10, 15 显示) */}
                        <div className="h-[14px] flex items-center justify-center">
                          {isMajor ? (
                            <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)] leading-none">
                              {val}
                            </span>
                          ) : null}
                        </div>

                        {/* 刻度竖线: Major 较长(8px)，Minor 较短(4px)，底部统一对齐 */}
                        <div className="flex-1 flex items-end">
                          <span 
                            className={`w-[1px] transition-colors ${
                              isMajor 
                                ? 'h-[8px] bg-[var(--text-secondary)]' 
                                : 'h-[4px] bg-[var(--text-tertiary)]/80'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 滑块轨道与滑块 */}
              <div className="relative px-[6px] py-1 flex items-center">
                {/* 背景灰底轨道 */}
                <div className="w-full h-[2.5px] bg-[#e2e4ea] dark:bg-white/15 rounded-full relative">
                  {/* 激活部分蓝色轨道 */}
                  <div 
                    className="h-full bg-[var(--info-color)] rounded-full transition-all duration-75"
                    style={{ width: `${((rtStabilityValue - 1) / 14) * 100}%` }}
                  />
                  {/* 蓝色实心圆滑块 */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[var(--info-color)] shadow-sm transition-all duration-75 pointer-events-none ring-2 ring-white/30"
                    style={{ left: `${((rtStabilityValue - 1) / 14) * 100}%` }}
                  />
                </div>

                {/* 原生隐藏 Range Input 用于支持鼠标拖拽、滚轮与键盘无障碍操作 */}
                <input 
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  disabled={!rtStabilityEnabled}
                  value={rtStabilityValue}
                  onChange={(e) => setRtStabilityValue(parseInt(e.target.value, 10))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>

              {/* 底部文字标签 */}
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] px-[6px] mt-2">
                <span className={rtStabilityValue <= 3 ? 'text-[var(--info-color)] font-extrabold' : ''}>极限</span>
                <span className={rtStabilityValue > 3 && rtStabilityValue <= 10 ? 'text-[var(--info-color)] font-extrabold' : ''}>平衡</span>
                <span className={rtStabilityValue > 10 ? 'text-[var(--info-color)] font-extrabold' : ''}>稳定</span>
              </div>
            </div>
          </div>

        </div>

        {/* ===================== 右列 4 张卡片 ===================== */}
        <div className="flex flex-col gap-4">
          
          {/* 卡片 5：稳定性模式 (防误触) */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div className="pr-4">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                稳定性模式 (防误触)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                极限性能参数下防止桌面抖动或手指按压状态下抖动造成的误触或断触，以提高键盘稳定性
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={antiMisfireEnabled} 
                onChange={(e) => setAntiMisfireEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
            </label>
          </div>

          {/* 卡片 6：Win键锁定 */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div className="pr-4">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                Win键锁定
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                开启后，Win键将被锁定无法使用，防止游戏中误触
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={winLockEnabled} 
                onChange={(e) => setWinLockEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
            </label>
          </div>

          {/* 卡片 7：切换为Mac模式 */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div className="pr-4">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                切换为Mac模式
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                切换Mac模式后，会将默认层切换到MacOS
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={macModeEnabled} 
                onChange={(e) => handleMacModeToggle(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
            </label>
          </div>

          {/* 卡片 8：自适应动态校准2.0 */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-4 flex items-center justify-between shadow-2xs">
            <div className="pr-4">
              <h3 className="text-[13.5px] font-black tracking-wide text-[var(--text-primary)] mb-1">
                自适应动态校准2.0
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                开启后，在键盘使用过程中会自动进行校准修正，每次触发都会进行修正补偿行程参数
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={dynamicCalibrationEnabled} 
                onChange={(e) => setDynamicCalibrationEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-5.5 bg-[var(--primary-09)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
            </label>
          </div>

        </div>

      </div>

      {/* 底部实时状态指示条 (严格跟随软件主色调与 CSS 变量，全自动实时持久化无需手动保存) */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-3 px-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 text-[12.5px] text-[var(--text-secondary)] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            设备: <strong className="text-[var(--text-primary)] font-bold">{deviceProfile?.name || '星闪外设'}</strong> · 
            当前回报率: <strong className="text-[var(--text-primary)] font-mono">{currentRate}Hz</strong> · 
            延迟约 <strong className="text-[var(--info-color)] font-mono">{(1000 / currentRate).toFixed(3)}ms</strong>
            {currentRate === maxPollingRate && (
              <span className="ml-1.5 text-[10.5px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                最高硬件档位
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-500/25 shadow-2xs select-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
          <span>配置实时自动同步生效中</span>
        </div>
      </div>

    </div>
  );
}

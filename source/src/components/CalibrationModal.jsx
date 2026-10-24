import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Activity,
  Check,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DV63_LAYOUT } from '../constants/dv63Layout';
import { getLayoutBounds } from '../constants/keyboardLayouts';
import { keyboardService } from '../services/keyboardService';
import KeyTravelIndicator from './KeyTravelIndicator';
import { useI18n } from '../i18n/LanguageContext';

/**
 * 霍尔下压物理行程解算函数
 * 严格按照官方逆向算法：将当前霍尔传感器 ADC / Route 精确映射到轴体物理行程 (mm)
 */
export function calculateKeyTravel(rawRoute, rawAdc, baseAdc, peakAdc, maxTravel = 3.50) {
  // 1. 单片机下发微米级已解算行程时的转换
  if (typeof rawRoute === 'number' && rawRoute > 0) {
    if (rawRoute <= 4500 && Math.abs(rawRoute - (rawAdc || 0)) > 50) {
      return Math.min(maxTravel, Number((rawRoute / 1000).toFixed(2)));
    }
    if (rawRoute <= 450 && Math.abs(rawRoute - (rawAdc || 0)) > 30) {
      return Math.min(maxTravel, Number((rawRoute / 100).toFixed(2)));
    }
  }

  // 2. 磁轴霍尔双向差分解算 (无论正向靠近变大还是反向靠近变小，严格以静止零位为基点)
  if (!baseAdc || !rawAdc) return 0.00;
  const delta = Math.abs(rawAdc - baseAdc);

  // 消除底噪死区 (16 AD)
  if (delta <= 16) {
    return 0.00;
  }

  const effectiveSpan = Math.max(220, (peakAdc ? Math.abs(peakAdc - baseAdc) : 520));
  const ratio = Math.max(0, Math.min(1.0, (delta - 16) / (effectiveSpan - 16)));
  return Number((ratio * maxTravel).toFixed(2));
}

export default function CalibrationModal({ 
  isOpen, 
  onClose, 
  currentAxis = { name: '天际线轴', maxTravel: 3.55 },
  perKeySwitches = {},
  axisList = [],
  layout = DV63_LAYOUT,
  hwKeyCoords = null,
  findHwCoords = null,
  initialCalibratedKeys = null,
  onUpdateCalibratedKeys = () => {},
}) {
  const { t } = useI18n();
  const KEYBOARD_LAYOUT = layout || DV63_LAYOUT;

  // 键盘校准开关
  const [calibrationEnabled, setCalibrationEnabled] = useState(true);
  // 是否展开顶部校准注意事项与步骤卡片 (按用户需求默认展开说明，用户可随时点击顶部按钮折叠，支持 URL 参数测试)
  const [showInstructions, setShowInstructions] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.has('calInstruct')) return p.get('calInstruct') === 'true';
    } catch (e) {}
    return true;
  });

  const effectiveCurrentAxis = currentAxis || { name: '天际线轴', maxTravel: 3.55 };

  // 所有扁平按键列表（自适应所有真实设备：AE64, ES68, DV63, 75, 87, 98, 104等）
  const flatKeys = useMemo(() => {
    const list = [];
    KEYBOARD_LAYOUT.forEach((row, rIdx) => {
      let colSeq = 0;
      row.forEach((k, cIdx) => {
        if (!k.isSpacer && !k.gap && k.id) {
          list.push({ ...k, rIdx, cIdx, colSeq });
          colSeq++;
        }
      });
    });
    return list;
  }, [KEYBOARD_LAYOUT]);

  const TOTAL_KEYS = flatKeys.length;

  const calBounds = useMemo(() => getLayoutBounds(KEYBOARD_LAYOUT), [KEYBOARD_LAYOUT]);
  // 紧凑黄金比例：根据是否展开说明动态计算键宽与键高，展开说明时使用 46px/38px，收起说明时使用 52px/42px，无论何种状态均杜绝挤压
  const calUnit = Math.max(26, Math.min(showInstructions ? 46 : 52, Math.floor(940 / (calBounds.widthUnits || 16))));
  const calKeyHeight = Math.max(24, Math.round(calUnit * 0.82));
  const calGap = 3;

  // 已完成校准的按键集合 (Key ID)
  const [calibratedKeys, setCalibratedKeys] = useState(() => {
    if (initialCalibratedKeys && initialCalibratedKeys instanceof Set) {
      return new Set(initialCalibratedKeys);
    }
    if (Array.isArray(initialCalibratedKeys)) {
      return new Set(initialCalibratedKeys);
    }
    return new Set();
  });

  // 当外部传入的已校准按键集合更新时同步
  useEffect(() => {
    if (initialCalibratedKeys && initialCalibratedKeys instanceof Set) {
      setCalibratedKeys(new Set(initialCalibratedKeys));
    } else if (Array.isArray(initialCalibratedKeys)) {
      setCalibratedKeys(new Set(initialCalibratedKeys));
    }
  }, [initialCalibratedKeys]);

  // 当前处于物理按压状态的按键集合
  const [pressedKeyIds, setPressedKeyIds] = useState(new Set());
  // 最近处于焦点的按键
  const [activeKey, setActiveKey] = useState(null);
  // 当前实时行程 (0 ~ maxTravel)
  const [currentTravel, setCurrentTravel] = useState(0);

  // 实时行程波形历史队列 (60 帧，未按压时绝对归零在 0mm)
  const [travelHistory, setTravelHistory] = useState(() => Array(60).fill(0));

  // 获取特定按键的配置轴体与最大行程 (支持混轴多轴体)
  const getKeyAxisInfo = useCallback((keyId) => {
    const switchName = perKeySwitches?.[keyId] || effectiveCurrentAxis?.name || '天际线轴';
    const axisObj = axisList?.find(a => a.name === switchName) || effectiveCurrentAxis || { name: switchName, maxTravel: 3.55 };
    const maxT = parseFloat(axisObj.maxTravel) || 3.55;
    return { name: axisObj.name || switchName, maxTravel: maxT, axisObj };
  }, [perKeySwitches, effectiveCurrentAxis, axisList]);

  // 全键盘各键实时霍尔读数 (初始以静止基线填充)
  const [hallReadings, setHallReadings] = useState(() => {
    const map = {};
    flatKeys.forEach((k) => {
      const charCode = (k.label && typeof k.label === 'string') ? k.label.charCodeAt(0) : (typeof k.id === 'number' ? k.id : 65);
      map[k.id] = 2650 + ((k.rIdx * 37 + k.cIdx * 23 + (charCode || 65) * 11) % 130);
    });
    return map;
  });

  // 每个按键的静止基线 (Zero Base) 与按压最大峰值引用
  const baseAdcRef = useRef({});
  const peakAdcRef = useRef({});

  // 当前激活按键的动态最大行程 (混轴自适应)
  const activeAxisInfo = activeKey ? getKeyAxisInfo(activeKey.id) : (effectiveCurrentAxis || { name: '天际线轴', maxTravel: 3.55 });
  const maxTravel = activeAxisInfo.maxTravel || 3.55;
  const isConnected = keyboardService?.connected;

  // 硬件真实矩阵与各行按键映射
  const [hwMatrixMap, setHwMatrixMap] = useState(null);

  // 解析任意按键的硬件电气行列坐标 (优先权威校验映射与探针映射)
  const resolveHwCoord = (k) => {
    if (!k || !k.id) return { row: 1, col: 0 };
    // 优先硬件上报的真实矩阵映射 (hwMatrixMap 或 hwKeyCoords)
    if (hwMatrixMap && hwMatrixMap[k.id]) {
      return {
        row: Math.round(Number(hwMatrixMap[k.id].row)),
        col: Math.round(Number(hwMatrixMap[k.id].col)),
      };
    }
    if (hwKeyCoords && hwKeyCoords[k.id]) {
      return {
        row: Math.round(Number(hwKeyCoords[k.id].row)),
        col: Math.round(Number(hwKeyCoords[k.id].col)),
      };
    }
    if (findHwCoords) {
      const c = findHwCoords(k.id);
      if (c && typeof c.row === 'number' && typeof c.col === 'number') {
        return { row: Math.round(Number(c.row)), col: Math.round(Number(c.col)) };
      }
    }
    // 权威默认物理电气矩阵映射 (左移 64 配列电气坐标回退)
    if (k.id === 'Space') return { row: 5, col: 6 };
    if (k.id === 'AltRight') return { row: 5, col: 9 };
    if (k.id === 'Fn') return { row: 5, col: 10 };
    if (k.id === 'ArrowLeft') return { row: 5, col: 12 };
    if (k.id === 'ArrowDown') return { row: 5, col: 13 };
    if (k.id === 'ArrowRight') return { row: 5, col: 14 };
    if (k.id === 'ShiftLeft') return { row: 4, col: 0 };
    if (k.id === 'ShiftRight') return { row: 4, col: 12 };
    if (k.id === 'ArrowUp') return { row: 4, col: 13 };
    if (k.id === 'Delete') return { row: 4, col: 14 };
    if (k.id === 'Quote') return { row: 3, col: 11 };
    if (k.id === 'Enter') return { row: 3, col: 13 };
    if (k.id === 'Backslash') return { row: 2, col: 13 };

    if (typeof k.row === 'number' && typeof k.col === 'number') {
      return { row: Math.round(Number(k.row)), col: Math.round(Number(k.col)) };
    }
    return {
      row: Math.round(Number((k.rIdx ?? 0) + 1)),
      col: Math.round(Number(k.colSeq ?? k.cIdx ?? 0)),
    };
  };

  // 1. 进入校准模式：下发硬件协议
  useEffect(() => {
    if (!isOpen) return;

    if (calibrationEnabled && keyboardService.connected) {
      keyboardService.startCalibration().catch(() => {});
      keyboardService.getKeyMatrix().then((matrix) => {
        if (matrix && matrix.length === flatKeys.length) {
          const map = {};
          flatKeys.forEach((k, i) => {
            map[k.id] = matrix[i];
          });
          setHwMatrixMap(map);
        }
      }).catch(() => {});
    }

    return () => {
      if (keyboardService.connected) {
        keyboardService.finishCalibration().catch(() => {});
      }
    };
  }, [isOpen, calibrationEnabled, flatKeys]);

  // 2. 真实硬件 HID 实时采样轮询器 (严格串行时序，杜绝 WebHID 响应队列冲刷与丢包)
  useEffect(() => {
    if (!isOpen || !calibrationEnabled || !keyboardService.connected) return;

    let isPolling = false;
    let timerId = null;

    const pollHardware = async () => {
      if (isPolling) return;
      isPolling = true;

      try {
        const rowSet = new Set();
        flatKeys.forEach((k) => {
          const hw = resolveHwCoord(k);
          if (hw && typeof hw.row === 'number') rowSet.add(hw.row);
        });
        const activeRows = rowSet.size > 0 ? Array.from(rowSet).sort((a, b) => a - b) : [1, 2, 3, 4, 5];

        // 串行有序查询每一行，行间 6ms 队列冲洗缓冲，彻底根除丢包与锁死
        const rowDataMap = {};
        for (const row of activeRows) {
          try {
            const adcRes = await keyboardService.getADCSample(row);
            const routeRes = await keyboardService.getRoute(row);
            rowDataMap[row] = {
              routeList: Array.isArray(routeRes?.data) ? routeRes.data : [],
              adcList: Array.isArray(adcRes?.data) ? adcRes.data : [],
            };
          } catch (e) {
            rowDataMap[row] = { routeList: [], adcList: [] };
          }
          await new Promise((r) => setTimeout(r, 6));
        }

        const framePressedKeyIds = new Set();
        let anyPressed = false;
        let maxPressedDepth = 0;
        let mostPressedKey = null;
        const newReadings = {};

        flatKeys.forEach((keyObj) => {
          const hw = resolveHwCoord(keyObj);
          const rowData = rowDataMap[hw.row];
          if (!rowData) return;

          const rawRoute = rowData.routeList[hw.col] ?? 0;
          const rawAdc = rowData.adcList[hw.col] ?? 0;
          const { maxTravel: keyMaxTravel } = getKeyAxisInfo(keyObj.id);

          if (rawAdc > 1200 && rawAdc < 3800) {
            newReadings[keyObj.id] = rawAdc;
            // 首次采集建立静止零位基准
            if (!baseAdcRef.current[keyObj.id]) {
              baseAdcRef.current[keyObj.id] = rawAdc;
            } else {
              const diffFromBase = Math.abs(rawAdc - baseAdcRef.current[keyObj.id]);
              // 未按压底噪范围内时（<= 12 AD），允许微弱自适应校准零位
              if (diffFromBase <= 12) {
                baseAdcRef.current[keyObj.id] = Math.round(baseAdcRef.current[keyObj.id] * 0.8 + rawAdc * 0.2);
              }
            }

            // 动态记录该按键的最大偏离量 (Peak Span)
            const currentDelta = Math.abs(rawAdc - baseAdcRef.current[keyObj.id]);
            if (!peakAdcRef.current[keyObj.id] || currentDelta > peakAdcRef.current[keyObj.id]) {
              peakAdcRef.current[keyObj.id] = currentDelta;
            }
          }

          const baseVal = baseAdcRef.current[keyObj.id];
          const spanVal = peakAdcRef.current[keyObj.id] || 520;
          const actualDepth = calculateKeyTravel(
            rawRoute,
            rawAdc,
            baseVal,
            baseVal ? baseVal + spanVal : null,
            keyMaxTravel
          );
          const clampedDepth = Math.max(0, Math.min(keyMaxTravel, actualDepth));

          if (clampedDepth > 0.08) {
            anyPressed = true;
            framePressedKeyIds.add(keyObj.id);
            if (clampedDepth > maxPressedDepth) {
              maxPressedDepth = clampedDepth;
              mostPressedKey = keyObj;
            }

            const deltaAdc = baseVal ? Math.abs(rawAdc - baseVal) : 0;
            // 双向霍尔极性安全校准判定：行程达到 60% 或霍尔偏差 >= 240 时变绿
            if (clampedDepth >= Math.min(2.10, keyMaxTravel * 0.60) || deltaAdc >= 240) {
              setCalibratedKeys((prev) => (prev.has(keyObj.id) ? prev : new Set(prev).add(keyObj.id)));
            }
          }
        });

        // 核心修复：每帧单次全量原子更新 pressedKeyIds！用户松手时未按压键瞬间清空高亮，彻底杜绝任何按键残留卡蓝
        setPressedKeyIds(framePressedKeyIds);

        if (Object.keys(newReadings).length > 0) {
          setHallReadings(prev => ({ ...prev, ...newReadings }));
        }

        if (anyPressed && mostPressedKey) {
          setActiveKey(mostPressedKey);
          setCurrentTravel(maxPressedDepth);
        } else if (!anyPressed) {
          setCurrentTravel(0.00);
        }
      } catch (err) {
      } finally {
        isPolling = false;
      }
    };

    timerId = setInterval(pollHardware, 70);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isOpen, calibrationEnabled, flatKeys, getKeyAxisInfo, hwKeyCoords, hwMatrixMap]);

  // 3. 本地按键事件响应 (仅在未接入物理硬件的离线预览模式下提供键盘仿真体验)
  useEffect(() => {
    if (!isOpen) return;

    // 当物理键盘已连接时，完全由硬件 HID 采样轮询器接管，严禁 window 键盘事件引发修饰键卡死与误触
    if (keyboardService.connected) {
      const handleBlur = () => {
        setPressedKeyIds(new Set());
        setCurrentTravel(0.00);
      };
      window.addEventListener('blur', handleBlur);
      return () => {
        window.removeEventListener('blur', handleBlur);
      };
    }

    const handleKeyDown = (e) => {
      const code = e.code;
      const target = flatKeys.find(k => 
        k.id === code || 
        k.id === `Key${code.replace(/^Key/, '')}` || 
        k.label?.toUpperCase() === e.key?.toUpperCase()
      );
      if (target) {
        setActiveKey(target);
        setPressedKeyIds(prev => new Set(prev).add(target.id));
        const { maxTravel: keyMaxTravel } = getKeyAxisInfo(target.id);
        const simDepth = Number((keyMaxTravel * 0.88).toFixed(2));
        setCurrentTravel(simDepth);
        setHallReadings(prev => ({
          ...prev,
          [target.id]: (baseAdcRef.current[target.id] || 2700) - 520
        }));
        setCalibratedKeys(prev => new Set(prev).add(target.id));
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      const target = flatKeys.find(k => 
        k.id === code || 
        k.id === `Key${code.replace(/^Key/, '')}` || 
        k.label?.toUpperCase() === e.key?.toUpperCase()
      );
      if (target) {
        setPressedKeyIds(prev => {
          const next = new Set(prev);
          next.delete(target.id);
          return next;
        });
        setCurrentTravel(0.00);
        setHallReadings(prev => ({
          ...prev,
          [target.id]: baseAdcRef.current[target.id] || 2700
        }));
      }
    };

    const handleBlur = () => {
      setPressedKeyIds(new Set());
      setCurrentTravel(0.00);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, flatKeys, getKeyAxisInfo]);

  const currentTravelRef = useRef(0);
  currentTravelRef.current = currentTravel;

  // 4. 行程深度波形队列推进 (每 50ms 记录当前深度，驱动官方 Image 3 曲线)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTravelHistory(prev => [...prev.slice(1), currentTravelRef.current]);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyClickInspect = (k) => {
    setActiveKey(k);
  };

  const handleRestart = async () => {
    const emptySet = new Set();
    setCalibratedKeys(emptySet);
    onUpdateCalibratedKeys(emptySet);
    setPressedKeyIds(new Set());
    setCurrentTravel(0);
    setActiveKey(null);
    baseAdcRef.current = {};
    peakAdcRef.current = {};
    if (keyboardService.connected) {
      await keyboardService.startCalibration().catch(() => {});
    }
  };

  const handleCalibrateAll = () => {
    const allSet = new Set(flatKeys.map((k) => k.id));
    setCalibratedKeys(allSet);
    onUpdateCalibratedKeys(allSet);
  };

  const handleExit = async () => {
    if (keyboardService.connected) {
      await keyboardService.finishCalibration().catch(() => {});
    }
    onUpdateCalibratedKeys(calibratedKeys);
    onClose();
  };

  const activeHallValue = activeKey ? hallReadings[activeKey.id] || (baseAdcRef.current[activeKey.id] || 2700) : null;
  const isCurrentKeyCalibrated = activeKey ? calibratedKeys.has(activeKey.id) : false;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 sm:p-2.5 select-none bg-black/60 backdrop-blur-sm transition-colors animate-in fade-in duration-150">
      <div className="w-[calc(100vw-24px)] max-w-[1344px] h-[calc(100vh-20px)] max-h-[860px] rounded-[14px] border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* 顶部标题栏 (去除非官方的轴体下拉菜单，校准继承自轴体设置页面的真实配置) */}
        <div className="h-11 px-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <h2 className="text-sm font-bold font-title modal-title flex items-center truncate text-[var(--text-primary)]">
              <Sparkles className="w-4 h-4 mr-1.5 text-[var(--info-color)] shrink-0" />
              {t('calibration.title')}
            </h2>

            <span className="text-xs font-mono shrink-0 text-[var(--text-secondary)]">
              {t('calibration.progress')}: <strong className="text-emerald-500 font-bold">{calibratedKeys.size}</strong> / {TOTAL_KEYS} {t('calibration.keysUnit')}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              id="btn-calibration-instructions"
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs font-medium px-3 py-1.5 rounded-[7px] border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--info-color)] text-[var(--text-secondary)] hover:text-[var(--info-color)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={showInstructions ? t('calibration.collapseInstructionsTitle') : t('calibration.expandInstructionsTitle')}
            >
              <Info className="w-3.5 h-3.5 text-[var(--info-color)]" />
              <span>{showInstructions ? t('calibration.collapseInstructions') : t('calibration.expandInstructions')}</span>
              {showInstructions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-[7px] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xs">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('calibration.hwCalibration')}
              </span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={calibrationEnabled}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setCalibrationEnabled(nextVal);
                    if (!nextVal && keyboardService.connected) {
                      keyboardService.finishCalibration().catch(() => {});
                    } else if (nextVal && keyboardService.connected) {
                      keyboardService.startCalibration().catch(() => {});
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
              </label>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-[7px] border border-[var(--border-color)] hover:border-[var(--info-color)] text-xs font-semibold text-[var(--info-color)] bg-[var(--bg-secondary)] hover:bg-[var(--primary-04)] transition cursor-pointer flex items-center shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {t('calibration.restartCalib')}
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="px-3 py-1.5 rounded-[7px] border border-[var(--border-color)] hover:border-red-400 text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 bg-[var(--bg-secondary)] hover:bg-red-50/10 transition cursor-pointer flex items-center shadow-2xs"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              {t('calibration.exitCalib')}
            </button>
          </div>
        </div>

        {/* 离线仿真运行提示横条 (未连设备时显示) */}
        {!isConnected && (
          <div className="px-3.5 py-1 text-[11px] flex items-center justify-between border-b border-amber-300/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium shrink-0">
            <div className="flex items-center space-x-1.5 truncate">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{t('calibration.simNotice')}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 font-bold shrink-0 ml-2">
              {t('calibration.simReady')}
            </span>
          </div>
        )}

        {/* 滚动容器 */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col justify-between">

          {/* 1. 校准说明与步骤提示折叠栏 (默认展开说明，精致紧凑无挤压) */}
          {showInstructions && (
            <div className="p-2 px-3.5 bg-[var(--bg-primary)] border-b border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-2.5 shrink-0">
              <div className="p-2 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col justify-between shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5 flex items-center">
                    <span className="w-1.5 h-2.5 bg-[var(--info-color)] rounded-full mr-1.5 inline-block"></span>
                    {t('calibration.notesTitle')}
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                    {t('calibration.notesDesc')}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-6 pt-1 mt-1 border-t border-[var(--border-color)]/60">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-[4px] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[10px] text-[var(--text-primary)] shadow-2xs">
                      A
                    </div>
                    <span className="text-[9px] text-[var(--text-disabled)]">{t('calibration.uncalibrated')}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[var(--text-disabled)]" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-[4px] bg-emerald-500 border border-emerald-600 flex items-center justify-center font-bold text-[10px] text-white shadow-xs">
                      A
                    </div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{t('calibration.calibratedSuccess')}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col justify-between shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5 flex items-center">
                    <span className="w-1.5 h-2.5 bg-emerald-500 rounded-full mr-1.5 inline-block"></span>
                    {t('calibration.stepsTitle')}
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                    {t('calibration.stepsDesc')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 mt-1 border-t border-[var(--border-color)]/60 text-center">
                  <div className="py-0.5 px-1 rounded-[5px] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">{t('calibration.step1Title')}</span>
                    <span className="text-[9px] text-[var(--text-disabled)] truncate">{t('calibration.step1Desc')}</span>
                  </div>
                  <div className="py-0.5 px-1 rounded-[5px] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[var(--info-color)]">{t('calibration.step2Title')}</span>
                    <span className="text-[9px] text-[var(--text-disabled)] truncate">{t('calibration.step2Desc')}</span>
                  </div>
                  <div className="py-0.5 px-1 rounded-[5px] bg-emerald-500/10 border border-emerald-500/40 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{t('calibration.step3Title')}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 truncate font-medium">{t('calibration.step3Desc')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 键盘物理阵列俯视区 */}
          <div className="py-1.5 px-3.5 flex flex-col items-center justify-center shrink-0 bg-[var(--bg-primary)]">
            <div className="p-1.5 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xs flex flex-col items-center">
              <div 
                className="relative select-none mx-auto"
                style={{
                  width: `${Math.round((calBounds.widthUnits || 16) * calUnit)}px`,
                  height: `${Math.round((calBounds.heightUnits || 5) * calKeyHeight)}px`,
                }}
              >
                {flatKeys.map((k, colIdx) => {
                  const isCalibrated = calibratedKeys.has(k.id);
                  const isPressed = pressedKeyIds.has(k.id);
                  const isSelected = activeKey?.id === k.id;
                  const keyLeftPx = Math.round((k.x || 0) * calUnit);
                  const keyTopPx = Math.round((k.y || 0) * calKeyHeight);
                  const keyWidthPx = Math.round((k.width || 1) * calUnit - calGap);
                  const keyHeightPx = Math.round((k.height || 1) * calKeyHeight - calGap);
                  const hallVal = hallReadings[k.id] || (baseAdcRef.current[k.id] || 2700);

                  return (
                    <div
                      key={k.id || `key-${colIdx}`}
                      onClick={() => handleKeyClickInspect(k)}
                      style={{ 
                        position: 'absolute',
                        left: `${keyLeftPx}px`,
                        top: `${keyTopPx}px`,
                        width: `${keyWidthPx}px`, 
                        height: `${keyHeightPx}px`,
                        ...(isPressed
                          ? { backgroundColor: '#0052ef', borderColor: '#60a5fa', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 82, 239, 0.4)' }
                          : isCalibrated
                          ? { backgroundColor: '#10b981', borderColor: '#059669', color: '#ffffff', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }
                          : isSelected
                          ? { borderColor: 'var(--info-color)' }
                          : {})
                      }}
                      title={`键位: ${k.label} | 霍尔AD: ${hallVal} | 状态: ${isCalibrated ? '已校准' : '待校准'}`}
                      className={`rounded-[5px] border flex flex-col items-center justify-between py-0.5 px-0.5 transition-all duration-75 select-none cursor-pointer ${
                        isPressed
                          ? 'scale-[0.96] z-10'
                          : isCalibrated
                          ? 'shadow-sm'
                          : isSelected
                          ? 'bg-[var(--bg-tertiary)] border-[var(--info-color)] text-[var(--text-primary)] ring-1 ring-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--info-color)] shadow-2xs'
                      }`}
                    >
                      {/* 顶部：1:1 还原官方校准页面的 已校准 / 待校准 状态字样 (未校准高亮鲜红，校准后白绿色) */}
                      <span 
                        className={`text-[8px] font-bold leading-none ${
                          isPressed || isCalibrated
                            ? 'text-emerald-100 opacity-90'
                            : 'text-rose-500 dark:text-rose-400 font-extrabold'
                        }`}
                      >
                        {isCalibrated ? '已校准' : '待校准'}
                      </span>

                      <span 
                        style={{ color: isPressed || isCalibrated ? '#ffffff' : undefined }}
                        className={`font-mono font-bold text-[11px] sm:text-xs leading-none my-0.5 ${
                          isPressed || isCalibrated ? 'text-white' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {k.label}
                      </span>

                      <div className="h-1 flex items-center justify-center w-full">
                        <span 
                          style={{ color: isPressed || isCalibrated ? '#d1fae5' : undefined }}
                          className={`text-[7.5px] font-mono leading-none tracking-tighter ${
                            isPressed || isCalibrated
                              ? 'text-emerald-100 font-medium'
                              : 'text-[var(--text-disabled)]'
                          }`}
                        >
                          {hallVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. 实时行程深度波形监控 (紧凑规整，高为 76px，绝不挤占下方卡片空间) */}
          <div className="p-2 px-3 mx-3.5 mb-2 rounded-[9px] border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col shrink-0 h-[76px] shadow-2xs">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0052ef]" />
                {t('calibration.waveformTitle')}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                {t('calibration.currentKeyLabel')} <strong className="text-[#0052ef]">{activeKey?.label || t('calibration.noneKey')}</strong> ({activeAxisInfo.name} · {t('calibration.maxTravelPrefix')} {maxTravel.toFixed(2)}mm) | {t('calibration.currentDepthLabel')} <strong className="text-emerald-500 font-bold">{currentTravel.toFixed(2)} mm</strong>
              </span>
            </div>

            <div className="relative flex-1 w-full min-h-0 flex items-stretch">
              <div className="w-10 h-full flex flex-col justify-between items-end pr-1.5 text-[9px] font-mono text-zinc-400 select-none shrink-0 py-0.5">
                <span>{maxTravel.toFixed(1)}mm</span>
                <span>{(maxTravel * 0.50).toFixed(1)}mm</span>
                <span>0mm</span>
              </div>

              <div className="flex-1 h-full relative overflow-hidden bg-slate-50/50 dark:bg-zinc-800/40 rounded-[5px] border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-0.5">
                  <div className="w-full h-[1px] bg-zinc-200/50 dark:bg-zinc-700/50" />
                  <div className="w-full h-[1px] bg-zinc-200/50 dark:bg-zinc-700/50" />
                  <div className="w-full h-[1px] bg-zinc-300 dark:bg-zinc-600" />
                </div>

                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 650 60">
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0052ef" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0052ef" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const points = travelHistory.map((val, idx) => {
                      const x = (idx / (travelHistory.length - 1)) * 650;
                      const y = 54 - (Math.min(maxTravel, Math.max(0, val)) / (maxTravel || 3.55)) * 48;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    });
                    const dLine = `M ${points.join(' L ')}`;
                    const dArea = `${dLine} L 650,60 L 0,60 Z`;
                    return (
                      <>
                        <path d={dArea} fill="url(#waveGradient)" />
                        <path d={dLine} fill="none" stroke="#0052ef" strokeWidth="1.8" strokeLinejoin="round" />
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>

          {/* 4. 下方分栏：左侧触发键程剖面标尺 + 右侧实时监控统计 (高度固定 172px，绝不挤压拉伸，展开/收起说明均100%完美契合) */}
          <div className="p-2.5 mx-3.5 mb-2.5 grid grid-cols-12 gap-3 border border-[var(--border-color)] rounded-[10px] bg-[var(--bg-tertiary)] shrink-0 h-[172px] shadow-2xs">
            {/* 左侧：迈从同款触发键程 2D 剖面与刻度柱 */}
            <div className="col-span-12 md:col-span-5 flex flex-col justify-stretch h-full">
              <KeyTravelIndicator
                travel={currentTravel}
                maxTravel={maxTravel}
                activeKeyLabel={activeKey?.label || ''}
                hallValue={activeHallValue}
                isCalibrated={isCurrentKeyCalibrated}
                className="h-full rounded-[8px] !p-2"
                showExtraMetrics={false}
                compact="medium"
              />
            </div>

            {/* 右侧：按键校准实时指标面板 */}
            <div className="col-span-12 md:col-span-7 rounded-[8px] p-2.5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between shadow-2xs h-full">
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
                <div className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[var(--info-color)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{t('calibration.realtimeMonitor')}</span>
                </div>

                {activeKey ? (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--primary-04)] text-[var(--info-color)] border border-[var(--primary-15)]">
                      {t('calibration.currentKeyLabel')} [{activeKey.label}]
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                      isCurrentKeyCalibrated
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    }`}>
                      {isCurrentKeyCalibrated ? t('calibration.calibStatusCalibrated') : t('calibration.calibStatusCalibrating')}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--text-disabled)] font-mono">
                    {t('calibration.pressPrompt')}
                  </span>
                )}
              </div>

              {/* 三大状态卡片 (居中自适应高度，大字号呈现) */}
              <div className="grid grid-cols-3 gap-2 my-auto py-1">
                <div className="p-2 sm:p-2.5 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col justify-between">
                  <span className="text-[10.5px] text-[var(--text-secondary)] font-medium leading-none mb-1">{t('calibration.realtimeDepth')}</span>
                  <div className="flex items-baseline space-x-1 my-1">
                    <span className={`text-lg sm:text-xl font-black font-mono tracking-tight leading-none ${
                      currentTravel > 0 ? 'text-[#0052ef]' : 'text-[var(--text-primary)]'
                    }`}>
                      {currentTravel.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[var(--text-disabled)] font-mono">mm</span>
                  </div>
                  <div className="text-[9.5px] text-[var(--text-disabled)] leading-none truncate font-mono">
                    {t('calibration.maxTravelPrefix')} {maxTravel.toFixed(2)}mm
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col justify-between">
                  <span className="text-[10.5px] text-[var(--text-secondary)] font-medium leading-none mb-1">{t('calibration.currentHallReading')}</span>
                  <div className="flex items-baseline space-x-1 my-1">
                    <span className={`text-lg sm:text-xl font-black font-mono tracking-tight leading-none ${
                      currentTravel > 0 ? 'text-emerald-500' : 'text-[var(--text-primary)]'
                    }`}>
                      {activeHallValue || 2700}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-[var(--text-disabled)] leading-none truncate font-mono">
                    {t('calibration.hallBaseline')} ~{(activeKey && baseAdcRef.current[activeKey.id]) || 2700} AD
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col justify-between">
                  <span className="text-[10.5px] text-[var(--text-secondary)] font-medium leading-none mb-1">{t('calibration.completedKeys')}</span>
                  <div className="flex items-baseline space-x-1 my-1">
                    <span className="text-lg sm:text-xl font-black font-mono text-emerald-500 tracking-tight leading-none">
                      {calibratedKeys.size}
                    </span>
                    <span className="text-[10px] text-[var(--text-disabled)] font-mono">/ {TOTAL_KEYS}</span>
                  </div>
                  <div className="text-[9.5px] text-[var(--text-disabled)] leading-none truncate font-mono">
                    {Math.round((calibratedKeys.size / TOTAL_KEYS) * 100)}%
                  </div>
                </div>
              </div>

              {/* 底部全键校准进度条 */}
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-[var(--text-disabled)] mb-1">
                    <span>{t('calibration.overallProgress')}</span>
                    <span>{calibratedKeys.size} / {TOTAL_KEYS} {t('calibration.keysUnit')} ({Math.round((calibratedKeys.size / TOTAL_KEYS) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                    <div
                      style={{ width: `${(calibratedKeys.size / TOTAL_KEYS) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[#0052ef] to-emerald-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCalibrateAll}
                  className="px-3 py-1.5 rounded-[7px] border border-[var(--border-color)] hover:border-emerald-500 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-[var(--bg-tertiary)] hover:bg-emerald-500/10 transition flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-2xs"
                  title={t('calibration.markAllTooltip')}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('calibration.markAllCalibrated')}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

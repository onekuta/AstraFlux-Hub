import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Edit3, Check } from 'lucide-react';
import SwitchCrossSection from './SwitchCrossSection';

/**
 * 竖向行程滑块 —— 1:1 对齐前行者官方「设置触发键程」柱状滑轨 (media_1791916183576_a0915762.png)
 *
 * 机械轴体物理特性：
 *   ① 轴体未按下时行程为 0.00mm (顶端)；按压到底部为最大行程 (如 3.50mm 底端)；
 *   ② 刻度：顶部 0.00mm，底部最大行程，每 0.50mm 大刻度带数字，每 0.10mm 小刻度；
 *   ③ 填充：自触发行程线向下至柱底，呈现浅蓝激活区；
 *   ④ 悬浮标签：带左向三角小指针贴轨对齐触发行程；按住可上下直接拖动微调；
 *   ⑤ 点击铅笔图标可直接输入数字设定参数；按 Enter 或点勾确认，按 ESC 取消。
 */
export default function VerticalTravelSlider({
  value = 0.4,
  max = 3.5,
  min = 0.01,
  step = 0.01,
  height = 116,
  unit = 'mm',
  tickStep = 0.5,
  minorStep = 0.1,
  disabled = false,
  showSwitchIllustration = true,
  onChange,
  ariaLabel = '触发行程',
}) {
  const trackRef = useRef(null);
  const trackDraggingRef = useRef(false);
  const bubbleDragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // 安全数值保护
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : (min || 0.40);
  const safeMax = (Number.isFinite(Number(max)) && Number(max) > 0) ? Number(max) : 3.50;

  // 动态精度：若 min < 0.01 (如 0.001) 则采用 3 位小数，若 min < 0.1 (如 0.01) 则采用 2 位小数
  const precision = min < 0.01 ? 3 : (min < 0.1 ? 2 : 1);

  // 键盘输入直接编辑模式
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(safeValue.toFixed(precision));
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(safeValue.toFixed(precision));
    }
  }, [safeValue, isEditing, precision]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const clamp = (v) => Math.min(safeMax, Math.max(min, v));
  const round = (v) => Number(clamp(v).toFixed(precision));

  const ratio = Math.max(0, Math.min(1, safeValue / safeMax));
  const topPct = `${(ratio * 100).toFixed(3)}%`;

  const emit = (v) => {
    if (disabled || !onChange) return;
    onChange(round(v));
  };

  // 由指针 clientY 反推行程值（顶 = 0，底 = safeMax）
  const valueFromClientY = useCallback(
    (clientY) => {
      const el = trackRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return null;
      const rY = (clientY - r.top) / r.height;
      return clamp(rY * safeMax);
    },
    [safeMax, min]
  );

  // 1. 柱状轨道按下与连续拖拽 (顶部 0.00mm，底部 safeMax)
  const handleTrackPointerDown = (e) => {
    if (disabled || isEditing) return;
    trackDraggingRef.current = true;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const v = valueFromClientY(e.clientY);
    if (v !== null) emit(v);
  };

  const handleTrackPointerMove = (e) => {
    if (!trackDraggingRef.current) return;
    const v = valueFromClientY(e.clientY);
    if (v !== null) emit(v);
  };

  const handleTrackPointerUp = (e) => {
    if (!trackDraggingRef.current) return;
    trackDraggingRef.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 2. 悬浮小标签独立拖拽处理 (向下拖行程变大，向上拖行程变小，1:1 跟手)
  const handleBubblePointerDown = (e) => {
    if (disabled || isEditing) return;
    // 如果点在输入框或按钮或 SVG 图标上，坚决不触发拖拽
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.vtravel-pencil-btn')) return;

    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const trackH = trackRef.current?.getBoundingClientRect()?.height || height;
    bubbleDragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startVal: value,
      trackHeight: trackH,
      moved: false,
    };
    setDragging(true);
  };

  const handleBubblePointerMove = (e) => {
    if (!bubbleDragRef.current) return;
    const dy = e.clientY - bubbleDragRef.current.startY; // 向下拖为正，向下行程变大
    if (Math.abs(dy) > 1.5) {
      bubbleDragRef.current.moved = true;
    }
    const deltaVal = (dy / bubbleDragRef.current.trackHeight) * safeMax;
    const nextVal = clamp(bubbleDragRef.current.startVal + deltaVal);
    emit(nextVal);
  };

  const handleBubblePointerUp = (e) => {
    if (!bubbleDragRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    bubbleDragRef.current = null;
    setDragging(false);
  };

  // 3. 提交键盘直接输入的数值
  const commitInput = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      emit(clamp(parsed));
    } else {
      setInputValue(safeValue.toFixed(precision));
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue(safeValue.toFixed(precision));
      setIsEditing(false);
    }
  };

  // 4. 刻度计算 (0.00 在顶，向下递增)
  const majors = [];
  const minors = [];
  for (let v = 0; v <= safeMax + 1e-4; v = Number((v + tickStep).toFixed(4))) {
    majors.push(Number(v.toFixed(2)));
  }
  for (let v = minorStep; v < safeMax - 1e-4; v = Number((v + minorStep).toFixed(4))) {
    const isMajor = Math.abs(v / tickStep - Math.round(v / tickStep)) < 1e-4;
    if (!isMajor) {
      minors.push(Number(v.toFixed(2)));
    }
  }

  return (
    <div className="flex items-center justify-center w-full select-none overflow-visible">
      <div className="flex items-center justify-center select-none gap-5 overflow-visible">
        {/* ── 1. 左侧：机械轴体剖面图 (尺寸跟随高度成比例放大，更加清晰大气) ── */}
        {showSwitchIllustration && (
          <div className="flex flex-col items-center justify-center shrink-0">
            <SwitchCrossSection
              travel={value}
              maxTravel={safeMax}
              width={Math.round(height * 0.73)}
              height={height}
            />
          </div>
        )}

        {/* ── 2. 中右侧：刻度 + 竖向行程柱体 + 悬浮标签 (右侧预留 96px 气泡空间，整体精确横向居中) ── */}
        <div className="vtravel flex items-center justify-start overflow-visible pr-[96px]">
          {/* 刻度刻线 (0.00 在顶，max 在底) */}
          <div className="vtravel-scale" style={{ height }}>
          {minors.map((v) => (
            <i
              key={`n${v}`}
              className="vtravel-minor"
              style={{ top: `${(v / safeMax) * 100}%` }}
            />
          ))}
          {majors.map((v) => (
            <span
              key={`M${v}`}
              className="vtravel-major"
              style={{ top: `${(v / safeMax) * 100}%` }}
            >
              {v.toFixed(2)}
            </span>
          ))}
        </div>

        {/* 柱状轨道与悬浮标签 */}
        <div className="vtravel-col relative" style={{ height }}>
          <div
            ref={trackRef}
            className={`vtravel-track${dragging ? ' dragging' : ''}${disabled ? ' disabled' : ''}`}
            style={{ height }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={Number(safeMax.toFixed(2))}
            aria-valuenow={Number(safeValue.toFixed(2))}
            aria-valuetext={`${safeValue.toFixed(2)}${unit}`}
            aria-disabled={disabled || undefined}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={handleTrackPointerUp}
            onPointerCancel={handleTrackPointerUp}
          >
            {/* 填充区：自触发行程点向下填充至柱底激活区 (100% 对齐官方驱动 media_1791916183576_a0915762.png 与物理触发特性) */}
            <div
              className="vtravel-fill"
              style={{
                top: topPct,
                height: `calc(100% - ${topPct})`,
              }}
            />
          </div>

          {/* 
            游标小标签：
            1. 可拖拽：按住上下拖拽可直接平滑调节行程；
            2. 左侧带三角尖嘴箭头，精确指向柱体触发线；
            3. 可输入：点击铅笔按钮进入 input 模式，支持键盘输入精确数字设定参数！
          */}
          <div
            className={`vtravel-bubble cursor-grab active:cursor-grabbing hover:border-[var(--info-color)] transition-shadow ${
              dragging ? 'shadow-md border-[var(--info-color)] !transition-none' : ''
            } ${isEditing ? '!cursor-default border-[var(--info-color)] ring-2 ring-[var(--info-color)]/25' : ''}`}
            style={{ top: topPct }}
            onPointerDown={handleBubblePointerDown}
            onPointerMove={handleBubblePointerMove}
            onPointerUp={handleBubblePointerUp}
            onPointerCancel={handleBubblePointerUp}
            onDoubleClick={(e) => {
              if (disabled) return;
              e.stopPropagation();
              setInputValue(value.toFixed(precision));
              setIsEditing(true);
            }}
            title={isEditing ? '敲击回车保存数值，按 ESC 取消' : '可直接上下拖拽数值；点击铅笔图标输入精确参数'}
          >
            {/* 左侧三角小指示箭头 */}
            <div className="vtravel-bubble-arrow" />

            {isEditing ? (
              <div
                className="flex items-center gap-1 select-none"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <input
                  ref={inputRef}
                  type="number"
                  step={step}
                  min={min}
                  max={safeMax}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={commitInput}
                  onKeyDown={handleInputKeyDown}
                  className="w-16 px-1 py-0.5 text-xs font-mono font-bold bg-[var(--bg-secondary)] border border-[var(--info-color)] rounded text-[var(--text-primary)] outline-none text-center shadow-inner"
                />
                <span className="text-[10px] font-mono text-[var(--text-disabled)] shrink-0 select-none">
                  {unit}
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitInput();
                  }}
                  className="p-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer transition flex items-center justify-center shrink-0"
                  title="确认设定"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 select-none">
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] pointer-events-none select-none">
                  {safeValue.toFixed(precision)}{unit}
                </span>
                <button
                  type="button"
                  className="vtravel-pencil-btn"
                  title="点击直接输入设定参数"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setInputValue(safeValue.toFixed(precision));
                    setIsEditing(true);
                  }}
                >
                  <Edit3 className="vtravel-pencil pointer-events-none" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

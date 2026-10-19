import React from 'react';
import SwitchCrossSection from './SwitchCrossSection';

/**
 * 迈从驱动同款「触发键程」实时行程深度视窗 (1:1 对齐 media_1791920209070_b9d1e31b.png)
 *
 * 核心特征：
 * 1. 左侧机械磁轴剖面图：按键物理按下时轴柱平滑下沉；
 * 2. 右侧垂直深度标尺刻度：0.00 到 3.00 (或 3.50/4.00)，每 0.5mm 大刻度，每 0.1mm 细刻度线；
 * 3. 迈从同款淡蓝水银柱 (高度与行程 1:1 动态下移填充)；
 * 4. 底部微标「动态示意图仅供参考」；
 * 5. 纯净自适应浅色 / 深色主题。
 */
export default function KeyTravelIndicator({
  travel = 0,
  maxTravel = 3.50,
  activeKeyLabel = '',
  hallValue = null,
  isCalibrated = false,
  isDark = false,
  className = '',
  showExtraMetrics = true,
  compact = false,
}) {
  const safeMax = maxTravel > 0 ? maxTravel : 3.50;
  const currentDepth = Math.max(0, Math.min(safeMax, Number(travel) || 0));
  const depthRatio = currentDepth / safeMax;

  // 标尺刻度档位：0.00, 0.50, 1.00, 1.50, 2.00, 2.50, 3.00 (以 0.5 为主要标尺)
  const majorSteps = [0.00, 0.50, 1.00, 1.50, 2.00, 2.50, 3.00];
  if (safeMax > 3.20 && !majorSteps.includes(3.50)) {
    majorSteps.push(3.50);
  }

  // 生成细密刻度线 (每 0.1mm 一档)
  const totalSubTicks = Math.round(majorSteps[majorSteps.length - 1] * 10);
  const subTicks = Array.from({ length: totalSubTicks + 1 }, (_, i) => i * 0.1);

  return (
    <div
      className={`relative rounded-[8px] ${compact ? 'p-2' : 'p-4'} flex flex-col justify-between transition-colors select-none bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xs ${className}`}
    >
      {/* 顶部标题区 */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-[var(--text-primary)]">
          触发键程
        </h3>

        {showExtraMetrics && activeKeyLabel && (
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] border bg-[var(--primary-04)] text-[var(--info-color)] border-[var(--primary-15)]">
              按键: {activeKeyLabel}
            </span>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] ${
              isCalibrated
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            }`}>
              {isCalibrated ? '已校准' : '待校准'}
            </span>
          </div>
        )}
      </div>

      {/* 中间核心视觉联动区：轴体线框 + 标尺刻度 + 水银柱 */}
      <div className={`flex items-center justify-center my-auto ${compact ? 'py-0.5 gap-3' : 'py-2 gap-6 sm:gap-8'}`}>
        
        {/* 1. 轴体剖面图 (黑白线稿剖面风格，轴柱下沉位移) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <SwitchCrossSection
            travel={currentDepth}
            maxTravel={safeMax}
            width={compact ? 66 : 108}
            height={compact ? 76 : 136}
            strokeColor={isDark ? '#71717a' : '#475569'}
          />
        </div>

        {/* 2. 标尺刻度 + 水银深度柱 (1:1 还原迈从截图) */}
        <div className={`flex items-stretch relative shrink-0 ${compact ? 'h-[78px]' : 'h-[154px]'}`}>
          
          {/* 左侧刻度数值与横向细刻度线 */}
          <div className={`flex flex-col justify-between items-end pr-1.5 py-[1px] font-mono select-none text-zinc-400 dark:text-zinc-500 ${compact ? 'text-[8px]' : 'text-[10.5px]'}`}>
            {majorSteps.map((val) => (
              <span key={val} className="leading-none tabular-nums font-medium">
                {val.toFixed(2)}
              </span>
            ))}
          </div>

          {/* 细密刻度标线 (带每 0.1mm 细刻度和每 0.5mm 粗刻度) */}
          <div className="w-2.5 flex flex-col justify-between py-[1px] pr-1 relative select-none">
            {subTicks.map((tickVal, idx) => {
              const isMajor = Math.abs(tickVal % 0.5) < 0.01;
              return (
                <div
                  key={idx}
                  className="w-full flex items-center justify-end"
                  style={{ height: '0px' }}
                >
                  <div
                    className={`transition-colors ${
                      isMajor
                        ? isDark
                          ? 'w-2 h-[1.5px] bg-zinc-500'
                          : 'w-2 h-[1.5px] bg-slate-400'
                        : isDark
                        ? 'w-1 h-[1px] bg-zinc-700'
                        : 'w-1 h-[1px] bg-slate-300'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* 3. 迈从同款浅蓝圆角水银柱 */}
          <div
            className={`${compact ? 'w-5.5' : 'w-7.5 sm:w-8'} h-full rounded-md border overflow-hidden relative flex flex-col transition-colors shadow-2xs ${
              isDark
                ? 'bg-zinc-800/40 border-zinc-700/80'
                : 'bg-white border-[#cbd5e1]'
            }`}
          >
            {/* 水银柱填充块：从顶部 0.00 向下延伸填充 (迈从同款柔和淡蓝) */}
            <div
              style={{ height: `${Math.min(100, Math.max(0, depthRatio * 100))}%` }}
              className="w-full transition-all duration-75 relative bg-[#b6d4fa] dark:bg-[#38bdf8]/50"
            >
              {/* 底部当前触底光效 */}
              {currentDepth > 0.02 && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-500 dark:bg-sky-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              )}
            </div>

            {/* 剩余空间 (未按到底的空白区) */}
            <div className="flex-1 w-full" />
          </div>

          {/* 右侧实时数值悬浮小标签 */}
          <div 
            style={{ 
              top: `${Math.min(100, Math.max(0, depthRatio * 100))}%`,
              transform: 'translateY(-50%)'
            }}
            className={`absolute ${compact ? '-right-19' : '-right-22'} flex items-center transition-all duration-75 select-none pointer-events-none`}
          >
            {/* 指向水银柱的水平连接线 */}
            <div className="w-1.5 h-[1.5px] bg-[#0052ef] dark:bg-sky-400 mr-1" />
            <div className={`${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'} rounded-[5px] border border-blue-400/40 bg-[var(--bg-secondary)] shadow-sm flex flex-col items-start font-mono`}>
              <span
                className={`${compact ? 'text-[10px]' : 'text-xs'} font-black tracking-tight tabular-nums ${
                  currentDepth > 0
                    ? isDark
                      ? 'text-sky-400'
                      : 'text-[#0052ef]'
                    : isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                {currentDepth.toFixed(2)}
                <span className={`${compact ? 'text-[8.5px]' : 'text-[10px]'} font-normal ml-0.5`}>mm</span>
              </span>

              {hallValue != null && (
                <span className={`${compact ? 'text-[7.5px]' : 'text-[9px]'} text-zinc-400 dark:text-zinc-500 font-mono leading-none mt-0.5`}>
                  AD: {hallValue}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 底部小字说明 (1:1 迈从原图媒体文本) */}
      <div className={`text-center ${compact ? 'pt-0.5' : 'pt-2'}`}>
        <span
          className={`font-medium tracking-wide ${compact ? 'text-[9px]' : 'text-[11px]'} ${
            isDark ? 'text-zinc-500' : 'text-gray-400'
          }`}
        >
          动态示意图仅供参考
        </span>
      </div>
    </div>
  );
}

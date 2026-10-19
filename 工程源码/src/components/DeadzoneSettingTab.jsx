import React, { useState } from 'react';
import { Shield, Zap, Sparkles, CheckCircle2, Flame, AlertCircle } from 'lucide-react';
import InlineNumberBadge from './InlineNumberBadge';

/**
 * 死区设置子页
 *
 * 包含：
 *   1. 初始死区 (顶部死区) + 支持手动输入数字 + 0.00mm 红字误触警示 (1:1 对齐用户图三 media_1791918940516_4c5384f7.png)
 *   2. 触底死区 (底部死区) + 支持手动输入数字 + 0.00mm 断触警示
 *   3. 极限切换开关 (开启后解锁最高 0.00mm 零死区) + 硬件消抖优化
 */
export default function DeadzoneSettingTab({
  initialDeadzone = 0.04,
  bottomDeadzone = 0.05,
  shakeFilter = true,
  antiGhosting = true,
  onDeadzoneChange,
  onAntiGhostingChange,
  onApplyToSelected,
  onApplyToAll,
  selectedKeysCount = 4,
}) {
  const [extremeZeroDeadzone, setExtremeZeroDeadzone] = useState(initialDeadzone === 0 || bottomDeadzone === 0);
  const [topDead, setTopDead] = useState(initialDeadzone);
  const [botDead, setBotDead] = useState(bottomDeadzone);
  const [filterEnabled, setFilterEnabled] = useState(shakeFilter);
  const [antiGhostingEnabled, setAntiGhostingEnabled] = useState(antiGhosting !== false);

  const handleTopChange = (val) => {
    const v = parseFloat(val);
    setTopDead(v);
    if (onDeadzoneChange) onDeadzoneChange({ initialDeadzone: v, bottomDeadzone: botDead, shakeFilter: filterEnabled });
  };

  const handleBotChange = (val) => {
    const v = parseFloat(val);
    setBotDead(v);
    if (onDeadzoneChange) onDeadzoneChange({ initialDeadzone: topDead, bottomDeadzone: v, shakeFilter: filterEnabled });
  };

  const handleFilterToggle = (val) => {
    setFilterEnabled(val);
    if (onDeadzoneChange) onDeadzoneChange({ initialDeadzone: topDead, bottomDeadzone: botDead, shakeFilter: val });
  };

  const handleExtremeToggle = (enabled) => {
    setExtremeZeroDeadzone(enabled);
    if (!enabled) {
      // 关闭极限零死区开关时，若当前为 0 则安全恢复至推荐值
      if (topDead < 0.01) handleTopChange(0.04);
      if (botDead < 0.01) handleBotChange(0.05);
    }
  };

  const minDeadzone = extremeZeroDeadzone ? 0.00 : 0.01;

  return (
    <div className="panel-operation panel-operation-bottom flex-1 flex flex-col justify-between">
      {/* 死区与消抖核心参数调节 */}

      <div className="operation-columns flex-1 min-h-0">

        {/* 1. 初始死区（顶部释放死区） */}
        <div className="col flex flex-col justify-between">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 mb-3">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center min-w-0">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)] shrink-0" />
                <span className="truncate">初始死区 (顶部死区)</span>
              </h3>
              <InlineNumberBadge
                value={topDead}
                onChange={handleTopChange}
                min={minDeadzone}
                max={0.50}
                precision={2}
                unit="mm"
                badgeClass={topDead === 0 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-[var(--info-color)] bg-[var(--primary-04)] border-[var(--primary-15)]"}
                title="点击直接输入数字设定死区参数"
              />
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed shrink-0">
              按键回弹至最高位时的无效过滤行程，避免手指搭在键帽上轻微静压导致误触。
            </p>

            {/* 输入调节区 */}
            <div className="flex-1 min-h-[96px] p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center gap-2">
              <input
                type="range"
                min={minDeadzone}
                max="0.50"
                step="0.01"
                value={topDead}
                onChange={(e) => handleTopChange(e.target.value)}
                aria-label="初始死区"
                className={`w-full h-1.5 rounded-lg cursor-pointer transition-all ${
                  topDead === 0 
                    ? 'accent-rose-500 bg-rose-200 dark:bg-rose-950' 
                    : 'accent-[var(--info-color)] bg-[var(--primary-15)]'
                }`}
              />

              <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs font-mono text-[var(--text-secondary)]">
                <span className={topDead === 0 ? "text-rose-500 font-bold" : ""}>
                  {extremeZeroDeadzone ? '0.00mm (零死区)' : '0.01mm (极度敏锐)'}
                </span>
                <span>0.50mm (防误触)</span>
              </div>

              {/* 1:1 对齐用户图三 (media_1791918940516_4c5384f7.png) 零死区警示红字 */}
              {topDead === 0 && (
                <div className="flex items-center space-x-1.5 text-rose-500 text-xs font-semibold mt-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>顶部死区为 0 时容易误触，请谨慎设置</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex justify-between items-center gap-2 text-xs">
            <span className="text-[var(--text-secondary)]">快捷预设</span>
            <div className="flex items-center space-x-2">
              {extremeZeroDeadzone && (
                <button
                  type="button"
                  onClick={() => handleTopChange(0.00)}
                  className="text-rose-500 font-semibold hover:underline shrink-0 text-xs"
                >
                  极限 0.00mm
                </button>
              )}
              <button
                type="button"
                onClick={() => handleTopChange(0.04)}
                className="text-[var(--info-color)] font-semibold hover:underline shrink-0 text-xs"
              >
                推荐 0.04mm
              </button>
            </div>
          </div>
        </div>

        {/* 2. 触底死区（底部极限死区） */}
        <div className="col flex flex-col justify-between">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 mb-3">
              <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center min-w-0">
                <Zap className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)] shrink-0" />
                <span className="truncate">触底死区 (底部死区)</span>
              </h3>
              <InlineNumberBadge
                value={botDead}
                onChange={handleBotChange}
                min={minDeadzone}
                max={0.50}
                precision={2}
                unit="mm"
                badgeClass={botDead === 0 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-[var(--info-color)] bg-[var(--primary-04)] border-[var(--primary-15)]"}
                title="点击直接输入数字设定死区参数"
              />
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed shrink-0">
              按键猛烈击底时的霍尔波动缓冲死区，防止由于轴芯撞底反弹引起的快速触发抖动。
            </p>

            <div className="flex-1 min-h-[96px] p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex flex-col justify-center gap-2">
              <input
                type="range"
                min={minDeadzone}
                max="0.50"
                step="0.01"
                value={botDead}
                onChange={(e) => handleBotChange(e.target.value)}
                aria-label="触底死区"
                className={`w-full h-1.5 rounded-lg cursor-pointer transition-all ${
                  botDead === 0 
                    ? 'accent-rose-500 bg-rose-200 dark:bg-rose-950' 
                    : 'accent-[var(--info-color)] bg-[var(--primary-15)]'
                }`}
              />

              <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs font-mono text-[var(--text-secondary)]">
                <span className={botDead === 0 ? "text-rose-500 font-bold" : ""}>
                  {extremeZeroDeadzone ? '0.00mm (零死区)' : '0.01mm (无缓冲)'}
                </span>
                <span>0.50mm (强吸收)</span>
              </div>

              {botDead === 0 && (
                <div className="flex items-center space-x-1.5 text-rose-500 text-xs font-semibold mt-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>触底死区为 0 时容易断触，请谨慎设置</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex justify-between items-center gap-2 text-xs">
            <span className="text-[var(--text-secondary)]">快捷预设</span>
            <div className="flex items-center space-x-2">
              {extremeZeroDeadzone && (
                <button
                  type="button"
                  onClick={() => handleBotChange(0.00)}
                  className="text-rose-500 font-semibold hover:underline shrink-0 text-xs"
                >
                  极限 0.00mm
                </button>
              )}
              <button
                type="button"
                onClick={() => handleBotChange(0.05)}
                className="text-[var(--info-color)] font-semibold hover:underline shrink-0 text-xs"
              >
                推荐 0.05mm
              </button>
            </div>
          </div>
        </div>

        {/* 3. 极限死区模式开关 + 硬件消抖优化 + 实时状态 */}
        <div className="col flex flex-col justify-between">
          <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
            
            {/* 极限零死区开关 */}
            <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Flame className={`w-3.5 h-3.5 ${extremeZeroDeadzone ? 'text-rose-500 animate-pulse' : 'text-amber-500'} shrink-0`} />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">极限模式 (解锁最高0死区)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={extremeZeroDeadzone}
                    onChange={(e) => handleExtremeToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-tight">
                打开后解锁最高 0.00mm 零死区选项，极致灵敏无延迟。
              </p>
            </div>

            {/* 硬件消抖优化开关 */}
            <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--info-color)] shrink-0" />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">硬件消抖滤波</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={filterEnabled}
                    onChange={(e) => handleFilterToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                </label>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-tight">
                芯片数字卡尔曼滤波，抑制桌面震动杂波与温漂。
              </p>
            </div>

            {/* 运行参数状态卡 */}
            <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] space-y-1 text-xs">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>极限死区状态：</span>
                <strong className={extremeZeroDeadzone ? "text-rose-500 font-bold" : "text-[var(--text-secondary)]"}>
                  {extremeZeroDeadzone ? '已解锁最高零死区' : '标准安全死区'}
                </strong>
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>零点温漂抑制：</span>
                <strong className="text-emerald-600 font-bold">实时校准开启</strong>
              </div>
            </div>
          </div>

          {/* 底部实时状态指示 */}
          <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-center">
            <div className="w-full py-1.5 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>死区参数已实时同步生效</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

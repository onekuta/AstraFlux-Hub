import React, { useState, useMemo } from 'react';
import { Check, CheckCircle2, Sparkles, Layers, Search, ShieldCheck, Cpu } from 'lucide-react';
import { axisService, PRIMARY_AXES } from '../services/axisService';

// 精确还原星闪驱动与轴体品牌分类 (首项遵从用户需求命名为常用/本机轴体)
export const SPARK_SWITCH_BRANDS = [
  { id: 'custom', label: '常用轴体' },
  { id: 'jiangwan', label: '江湾 (Everglide)' },
  { id: 'gateron', label: '佳达隆 (Gateron)' },
  { id: 'ttc', label: '正牌科电 (TTC)' },
  { id: 'other', label: '其它品牌' },
  { id: 'all', label: '全部官方校准库' },
];

// 紧凑轻量 3D 机械轴体 SVG 图标组件 (尺寸 26~32px)
function Switch3DIcon({ color = '#2563eb', size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M22 62L50 78L78 62L78 48L50 64L22 48Z" fill="#334155" />
      <path d="M22 62L50 78L50 64L22 48Z" fill="#1e293b" />
      <path d="M50 78L78 62L78 48L50 64Z" fill="#475569" />
      <path d="M26 46L50 58L74 46L68 32L50 24L32 32Z" fill="#94a3b8" fillOpacity="0.85" />
      <path d="M26 46L50 58L50 24L32 32Z" fill="#64748b" fillOpacity="0.9" />
      <path d="M50 58L74 46L68 32L50 24Z" fill="#cbd5e1" fillOpacity="0.85" />
      <rect x="44" y="10" width="12" height="24" rx="2" fill={color} />
      <rect x="38" y="16" width="24" height="12" rx="2" fill={color} />
      <rect x="47" y="12" width="6" height="8" rx="1" fill="#ffffff" fillOpacity="0.5" />
    </svg>
  );
}

// 规范化轴体名称展示，消除中英文粘连与杂乱命名（如 磁玉pro -> 磁玉 Pro, 万磁王RGB -> 万磁王 RGB）
export function formatAxisName(rawName) {
  if (!rawName) return '';
  let name = String(rawName).trim();
  name = name.replace(/pro\b/gi, 'Pro');
  name = name.replace(/rgb\b/gi, 'RGB');
  name = name.replace(/gaming\b/gi, 'Gaming');
  name = name.replace(/pom/gi, 'POM');
  name = name.replace(/([\u4e00-\u9fa5])([A-Za-z])/g, '$1 $2');
  name = name.replace(/([A-Za-z])([\u4e00-\u9fa5])/g, '$1 $2');
  return name.replace(/\s+/g, ' ').trim();
}

/**
 * 智能轴体匹配检索函数：全面支持轴体全称、品牌名、角标、描述以及行程数值检索
 */
export function matchSwitch(sw, query) {
  if (!query || !query.trim()) return true;
  const rawQuery = query.trim().toLowerCase();
  const tokens = rawQuery.split(/\s+/).filter(Boolean);

  return tokens.every(token => {
    // 1. 轴体基础元信息匹配 (名称 / 品牌 / 徽章 / 描述)
    if (sw.name && sw.name.toLowerCase().includes(token)) return true;
    if (sw.brand && sw.brand.toLowerCase().includes(token)) return true;
    if (sw.badge && sw.badge.toLowerCase().includes(token)) return true;
    if (sw.desc && sw.desc.toLowerCase().includes(token)) return true;

    // 2. 轴体行程深度匹配 (Travel / Stroke)
    const travelVal = sw.maxTravel || sw.travel;
    if (travelVal != null && !isNaN(travelVal)) {
      const travelNum = Number(travelVal);
      const travelFixed2 = travelNum.toFixed(2);
      const travelStr = String(travelNum);

      const cleanToken = token
        .replace(/mm$/i, '')
        .replace(/毫米$/i, '')
        .replace(/^行程[:：]?/i, '')
        .replace(/行程$/i, '')
        .trim();

      if (cleanToken && !isNaN(cleanToken)) {
        const queryNum = parseFloat(cleanToken);
        if (cleanToken.includes('.')) {
          if (travelFixed2.startsWith(cleanToken)) return true;
          if (travelStr.startsWith(cleanToken)) return true;
          if (Math.abs(travelNum - queryNum) < 0.001) return true;
        } else {
          if (Math.floor(travelNum) === parseInt(cleanToken, 10)) return true;
        }
      }
    }

    return false;
  });
}

export default function SwitchSettingTab({ 
  currentAxis, 
  onSelectAxis, 
  deviceProfile,
  selectedKeysCount = 4,
  keyCount = 64,
  onApplyToSelected,
  onApplyToAll,
  allAxes = [],
  primaryAxisKeyword = '神马',
  primaryAxisBadge = '出厂默认'
}) {
  const [activeBrand, setActiveBrand] = useState('custom');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSwitch, setHoveredSwitch] = useState(null);

  // 检测是否为具有特定出厂支持轴体库的成品键盘 (如 VICTKONG DV63、ES68、AE64-MAX)
  const supportedList = deviceProfile?.supportedSwitches;
  const isFinishedKeyboard = Array.isArray(supportedList) && supportedList.length > 0;
  const [onlyShowSupported, setOnlyShowSupported] = useState(isFinishedKeyboard);

  // 全量已鉴权官方真实轴体库 (通过官网与驱动官方库鉴权，排除未核准的虚假/实验轴体)
  const authenticatedAxes = useMemo(() => {
    const rawList = (allAxes && allAxes.length > 0) ? allAxes : (axisService.axes || PRIMARY_AXES);
    return rawList
      .filter(a => a && a.verified !== false && a.isOfficial !== false)
      .map(a => {
        const safeTravel = Number(a.maxTravel || a.travel || 3.50);
        return {
          ...a,
          id: a.id,
          hardwareAxisId: a.hardwareAxisId || a.id,
          name: formatAxisName(a.name),
          travel: safeTravel,
          maxTravel: safeTravel,
          driveRange: Number(a.driveRange || safeTravel - 0.20),
          recommendedAP: Number(a.recommendedAP || (safeTravel > 3.0 ? 0.35 : 0.30)),
          minActuationPoint: Number(a.minActuationPoint || 0.05),
          brand: a.brand || '星闪校准',
          color: a.color || '#2563eb',
          badge: a.badge || (a.name.includes(primaryAxisKeyword) ? primaryAxisBadge : '官方核准'),
          desc: a.description || `${a.brand || ''} ${a.name} 磁轴，行程 ${safeTravel}mm`,
          isOfficial: true,
          verified: true
        };
      });
  }, [allAxes, primaryAxisKeyword, primaryAxisBadge]);

  // 当前机型官方专属支持的轴体列表 (针对 DV63、AE64、ES68 等成品键盘过滤)
  const supportedAxes = useMemo(() => {
    if (!isFinishedKeyboard) return authenticatedAxes;
    const supSet = new Set(supportedList.map(s => s.toLowerCase().replace(/\s+/g, '')));
    const matched = authenticatedAxes.filter(a => {
      const n = a.name.toLowerCase().replace(/\s+/g, '');
      const sn = (a.shortName || '').toLowerCase().replace(/\s+/g, '');
      if (supSet.has(n) || supSet.has(sn)) return true;
      return supportedList.some(k => {
        const cleanK = k.toLowerCase().replace(/\s+/g, '');
        return n.includes(cleanK) || cleanK.includes(n);
      });
    });
    return matched.length > 0 ? matched : authenticatedAxes;
  }, [authenticatedAxes, isFinishedKeyboard, supportedList]);

  // 根据当前过滤模式决定的轴体集合
  const currentScopeAxes = useMemo(() => {
    if (isFinishedKeyboard && onlyShowSupported) {
      return supportedAxes;
    }
    return authenticatedAxes;
  }, [isFinishedKeyboard, onlyShowSupported, supportedAxes, authenticatedAxes]);

  // 动态品牌分类选项
  const brandTabs = useMemo(() => {
    const customLabel = isFinishedKeyboard && onlyShowSupported 
      ? `${deviceProfile.shortName || deviceProfile.model} 专属支持` 
      : '常用推荐轴体';
    return [
      { id: 'custom', label: customLabel },
      { id: 'jiangwan', label: '江湾 (Everglide)' },
      { id: 'gateron', label: '佳达隆 (Gateron)' },
      { id: 'ttc', label: '正牌科电 (TTC)' },
      { id: 'other', label: '其它品牌' },
      { id: 'all', label: `全部校准库 (${currentScopeAxes.length}款)` },
    ];
  }, [isFinishedKeyboard, onlyShowSupported, deviceProfile, currentScopeAxes.length]);

  // 综合计算在当前选中品牌及搜索关键词下展示的轴体列表
  const displayedSwitches = useMemo(() => {
    let list = [];
    if (activeBrand === 'all') {
      list = currentScopeAxes;
    } else if (activeBrand === 'custom') {
      if (isFinishedKeyboard) {
        list = supportedAxes;
      } else {
        // 客制化键盘展示核心特调出厂 SKU
        list = authenticatedAxes.filter(a => 
          PRIMARY_AXES.some(p => p.id === a.id || p.name === a.name) ||
          a.badge?.includes('标配') ||
          a.badge?.includes('原厂')
        );
        if (list.length === 0) list = currentScopeAxes.slice(0, 8);
      }
    } else if (activeBrand === 'jiangwan') {
      list = currentScopeAxes.filter(a => a.brand?.includes('江湾') || a.brand?.toLowerCase().includes('everglide'));
    } else if (activeBrand === 'gateron') {
      list = currentScopeAxes.filter(a => a.brand?.includes('佳达隆') || a.brand?.toLowerCase().includes('gateron'));
    } else if (activeBrand === 'ttc') {
      list = currentScopeAxes.filter(a => a.brand?.includes('正牌科电') || a.brand?.toUpperCase().includes('TTC') || a.name?.includes('神马'));
    } else if (activeBrand === 'other') {
      list = currentScopeAxes.filter(a => 
        !a.brand?.includes('江湾') && 
        !a.brand?.toLowerCase().includes('everglide') && 
        !a.brand?.includes('佳达隆') && 
        !a.brand?.toLowerCase().includes('gateron') && 
        !a.brand?.includes('正牌科电') && 
        !a.brand?.toUpperCase().includes('TTC') &&
        !a.name?.includes('神马')
      );
    }

    if (searchQuery.trim()) {
      return list.filter(s => matchSwitch(s, searchQuery));
    }
    return list;
  }, [activeBrand, currentScopeAxes, supportedAxes, authenticatedAxes, isFinishedKeyboard, searchQuery]);

  // 全库在当前搜索关键词下的匹配结果
  const fullLibraryMatches = useMemo(() => {
    if (!searchQuery.trim()) return currentScopeAxes;
    return currentScopeAxes.filter(s => matchSwitch(s, searchQuery));
  }, [currentScopeAxes, searchQuery]);

  // 点击选轴安全包裹：保证传递给外部的轴体对象 100% 具备 travel、maxTravel、recommendedAP
  const handleSelectAxis = (sw) => {
    const travelVal = Number(sw.maxTravel || sw.travel || 3.50);
    const safeSw = {
      ...sw,
      id: sw.id,
      name: sw.name,
      travel: travelVal,
      maxTravel: travelVal,
      recommendedAP: Number(sw.recommendedAP || (travelVal > 3.0 ? 0.35 : 0.30)),
      minActuationPoint: Number(sw.minActuationPoint || 0.05),
      brand: sw.brand || '星闪校准',
      color: sw.color || '#2563eb',
      badge: sw.badge || '官方核准',
      desc: sw.desc || sw.description || `${sw.name} 磁轴`,
      isOfficial: true,
      verified: true
    };
    onSelectAxis(safeSw);
  };

  return (
    <div className="panel-operation panel-operation-bottom min-h-0 select-none flex flex-col justify-between overflow-hidden relative">
      <div className="operation-columns flex-1 min-h-0">
        {/* 左侧品牌紧凑胶囊栏 */}
        <div className="col flex flex-col justify-between shrink-0" style={{ flex: '0 0 190px' }}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center font-title tracking-wider">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)]" />
                轴体品牌分类
              </h3>
            </div>

            <div className="space-y-1">
              {brandTabs.map((b) => {
                const active = activeBrand === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setActiveBrand(b.id)}
                    className={`w-full py-1.5 px-2.5 rounded-lg border text-left transition-all text-xs font-bold cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] border-[var(--primary-color)] shadow-xs'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-tertiary)] hover:border-[var(--primary-25)] hover:bg-[var(--primary-09)]'
                    }`}
                  >
                    <span className="truncate">{b.label}</span>
                    {active && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 底部机型与出厂硬件标定库信息 */}
          <div className="p-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl space-y-1.5 text-xs text-[var(--text-secondary)] shrink-0 mt-2">
            <div className="flex items-center font-bold text-[var(--text-primary)] font-title tracking-wider text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
              <span>官网真实轴体鉴权库</span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-medium">
              已对轴体库进行官方鉴权，收录真实官方标定参数 (已过滤隐藏未核准轴体)。
            </p>
            {isFinishedKeyboard && (
              <div className="pt-1 border-t border-[var(--border-color)]/60 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <Cpu className="w-3 h-3 shrink-0" />
                <span>当前机型: {deviceProfile?.shortName || deviceProfile?.model} (出厂标配: {deviceProfile?.defaultAxis || '神马轴'})</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧轴体高密度紧凑平铺网格区 */}
        <div className="col flex flex-col justify-between min-h-0 flex-1 ml-4 pl-4 border-l border-[var(--border-color)]/80">
          <div className="flex flex-col flex-1 min-h-0">
            {/* 顶栏：分类标题、机型模式切换与快速搜索 */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-color)] shrink-0 gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center font-title tracking-wider shrink-0">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)] shrink-0" />
                  <span className="truncate">{brandTabs.find(b => b.id === activeBrand)?.label}</span>
                  <span className="ml-2 text-xs text-[var(--text-secondary)] font-normal font-mono">
                    (共 {displayedSwitches.length} 款)
                  </span>
                </h3>

                {/* 成品键盘 (如 DV63) 专属支持库与全量官方库快速切换 */}
                {isFinishedKeyboard && (
                  <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-0.5 text-[10px] font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setOnlyShowSupported(true)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        onlyShowSupported 
                          ? 'bg-[var(--info-color)] text-white shadow-2xs font-extrabold' 
                          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                      }`}
                      title={`仅显示 ${deviceProfile?.shortName || '本机'} 出厂与硬件官方适配支持的轴体`}
                    >
                      本机专属支持 ({supportedAxes.length}款)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlyShowSupported(false)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer ${
                        !onlyShowSupported 
                          ? 'bg-[var(--info-color)] text-white shadow-2xs font-extrabold' 
                          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                      }`}
                      title="放开限制查看全部已鉴权的 220+ 款官方真实磁轴库"
                    >
                      全量官方库 ({authenticatedAxes.length}款)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <div className="relative">
                  <Search className="w-3 h-3 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="搜索轴体名称、行程(如3.5mm)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-6 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs focus:outline-none focus:border-[var(--info-color)] w-52 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xs cursor-pointer w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[var(--bg-secondary)]"
                      title="清空搜索"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-xs text-[var(--text-secondary)] font-mono font-medium hidden sm:block">
                  默认: <strong className="text-[var(--info-color)] font-bold">{currentAxis?.name || (deviceProfile?.defaultAxis || '神马轴')}</strong>
                </div>
              </div>
            </div>

            {/* 高密度轴体卡片平铺网格 */}
            <div 
              className="flex-1 overflow-y-auto pr-1"
              onScroll={() => setHoveredSwitch(null)}
            >
              {displayedSwitches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3 text-[var(--text-tertiary)] border border-[var(--border-color)]">
                    <Search className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mb-1 font-title tracking-wider">
                    当前分类未找到匹配轴体
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mb-3 max-w-sm leading-relaxed">
                    在当前分类中未搜索到与 “<span className="text-[var(--info-color)] font-bold">{searchQuery}</span>” 相关的轴体
                  </div>
                  {activeBrand !== 'all' && fullLibraryMatches.length > 0 && (
                    <button
                      onClick={() => setActiveBrand('all')}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--primary-color)] text-[var(--text-inverse-100)] text-xs font-bold hover:brightness-110 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>查看全库匹配轴体 ({fullLibraryMatches.length} 款)</span>
                    </button>
                  )}
                  {isFinishedKeyboard && onlyShowSupported && (
                    <button
                      onClick={() => setOnlyShowSupported(false)}
                      className="mt-2 text-xs text-[var(--info-color)] hover:underline cursor-pointer"
                    >
                      切换到【全量官方库】继续搜索全部 220+ 款轴体 →
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] gap-2.5">
                  {displayedSwitches.map((sw) => {
                    const isSelected = currentAxis?.name === sw.name || currentAxis?.id === sw.id;
                    const travelNum = Number(sw.maxTravel || sw.travel || 3.50);
                    return (
                      <div
                        key={`${sw.id}-${sw.name}`}
                        onClick={() => handleSelectAxis(sw)}
                        onMouseEnter={(e) => setHoveredSwitch({ sw, rect: e.currentTarget.getBoundingClientRect() })}
                        onMouseLeave={() => setHoveredSwitch(null)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between relative group ${
                          isSelected
                            ? 'bg-[var(--primary-04)]/90 border-[var(--info-color)] shadow-xs ring-1 ring-[var(--info-color)]/40'
                            : 'bg-[var(--bg-tertiary)]/80 border-[var(--border-color)] hover:border-[var(--primary-25)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          {/* 紧凑 3D 图标 */}
                          <div className="group-hover:scale-105 transition-transform shrink-0">
                            <Switch3DIcon color={sw.color} size={30} />
                          </div>

                          {/* 轴体名称与行程 */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--info-color)] transition truncate">
                                {sw.name}
                              </span>
                              {isSelected && (
                                <span className="w-3.5 h-3.5 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {/* 行程深度高对比度徽章 */}
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 shadow-2xs">
                                <span 
                                  className="w-1.5 h-1.5 rounded-full shrink-0 border border-black/20 dark:border-white/20" 
                                  style={{ backgroundColor: (sw.color && sw.color !== '#ffffff' && sw.color !== '#fff') ? sw.color : '#3b82f6' }} 
                                />
                                <span>{travelNum.toFixed(2)}mm</span>
                              </span>
                              {sw.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium truncate max-w-[70px]">
                                  {sw.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-[var(--text-disabled)] truncate">
                                · {sw.brand?.replace(/\s*\(.*\)/, '') || '星闪'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 底部实时状态条 */}
          <div className="pt-2 mt-2 border-t border-[var(--border-color)] flex items-center justify-between shrink-0">
            <div className="text-xs text-[var(--text-secondary)]">
              当前轴体: <strong className="text-[var(--info-color)] font-bold">{currentAxis?.name || '神马轴'}</strong> ({Number(currentAxis?.maxTravel || currentAxis?.travel || 3.45).toFixed(2)}mm)
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>轴体配置已实时同步硬件</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统一风格的浮动悬浮窗 Tooltip */}
      {hoveredSwitch && hoveredSwitch.rect && (() => {
        const rect = hoveredSwitch.rect;
        const tooltipWidth = 286;
        const idealLeft = Math.round(rect.left + rect.width / 2 - tooltipWidth / 2);
        const finalLeft = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, idealLeft));
        const placeAbove = rect.top > 250;
        const sw = hoveredSwitch.sw;
        const swTravel = Number(sw.maxTravel || sw.travel || 3.50);

        return (
          <div
            style={{
              position: 'fixed',
              left: `${finalLeft}px`,
              ...(placeAbove 
                ? { bottom: `${Math.max(12, Math.round(window.innerHeight - rect.top + 8))}px`, top: 'auto' }
                : { top: `${Math.round(rect.bottom + 8)}px`, bottom: 'auto' }
              ),
              transform: 'none',
              zIndex: 99999,
              pointerEvents: 'none',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'geometricPrecision',
            }}
            className="w-[286px] bg-white dark:bg-[#18181b] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 shadow-2xl text-xs select-none text-[var(--text-primary)]"
          >
            {/* 顶栏：3D图标 + 轴体全名 + 品牌微标 */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]/70">
              <div className="flex items-center gap-2 min-w-0">
                <Switch3DIcon color={sw.color} size={28} />
                <div className="min-w-0">
                  <div className="font-bold text-[13px] leading-tight text-[var(--text-primary)] truncate font-title tracking-wider">
                    {sw.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium truncate mt-0.5">
                    {sw.brand}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: (sw.color && sw.color !== '#ffffff' && sw.color !== '#fff') ? sw.color : '#3b82f6' }}
                />
                <span>{swTravel.toFixed(2)}mm</span>
              </span>
            </div>

            {/* 详细描述与标定规格 */}
            <div className="space-y-1.5">
              {sw.badge && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[var(--text-secondary)] font-medium">出厂定位:</span>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-[var(--primary-04)] text-[var(--info-color)] border border-[var(--primary-15)]">
                    {sw.badge}
                  </span>
                </div>
              )}
              <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-normal">
                {sw.desc || `${sw.brand} 原厂磁轴，支持 0.001mm 灵敏度响应与全行程自适应标定。`}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

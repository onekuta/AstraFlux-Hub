import React, { useState, useMemo } from 'react';
import { Check, CheckCircle2, Sparkles, Layers, Search, ShieldCheck } from 'lucide-react';
import { axisService } from '../services/axisService';

// 精确还原星闪驱动与轴体品牌分类 (首项遵从用户需求命名为常用轴体)
export const SPARK_SWITCH_BRANDS = [
  { id: 'custom', label: '常用轴体' },
  { id: 'jiangwan', label: '江湾 (Everglide)' },
  { id: 'gateron', label: '佳达隆 (Gateron)' },
  { id: 'ttc', label: '正牌科电 (TTC)' },
  { id: 'all', label: '全部校准库 (220+款)' },
];

export const BRANDED_SWITCHES = {
  custom: [
    { id: 788, name: '天际线轴', travel: 3.55, brand: '江湾 (Everglide)', color: '#4dd1f9', badge: '高导光柱', desc: '江湾天际线磁轴，高导光柱，极速回弹，线性顺滑手感' },
    { id: 1, name: '磁玉 Pro', travel: 3.50, brand: '佳达隆 (Gateron)', color: '#70cb9a', badge: '佳达隆标配', desc: '佳达隆磁玉 Pro 磁轴，双轨结构，高透光上盖，3.5mm 顺滑低抖' },
    { id: 1003, name: '磁玉 Pro 超竞版', travel: 3.50, brand: '佳达隆 (Gateron)', color: '#3b82f6', badge: '超竞特调', desc: '佳达隆特调超竞版磁轴，双轨结构，高频电竞调校，极速响应' },
    { id: 1002, name: '神马轴', travel: 3.45, brand: '神马 (Shenma)', color: '#2563eb', badge: '初始高磁通', desc: '神马磁轴，初始磁通量高，RT响应极速' },
    { id: 1219, name: '库里南轴', travel: 3.60, brand: '江湾 (Everglide)', color: '#eaeaea', badge: '江湾原厂', desc: '江湾库里南磁轴，双轨超顺滑，HiFi 敲击音' },
    { id: 20, name: '默认磁轴', travel: 3.50, brand: '常用轴体', color: '#64748b', badge: '通用标准', desc: '标准通用霍尔电压标定曲线' },
  ],
  jiangwan: [
    { id: 788, name: '天际线轴', travel: 3.55, brand: '江湾 (Everglide)', color: '#4dd1f9', badge: '高导光柱', desc: '江湾天际线磁轴，高导光柱，极速回弹，线性顺滑手感' },
    { id: 1219, name: '库里南轴', travel: 3.60, brand: '江湾 (Everglide)', color: '#eaeaea', badge: '江湾旗舰', desc: '江湾库里南磁轴，双轨超顺滑，HiFi 敲击音' },
    { id: 791, name: '磁神轴', travel: 3.47, brand: '江湾 (Everglide)', color: '#d3e4ff', badge: '电竞调校', desc: '江湾磁神轴，低死区高线性，瞬态响应' },
  ],
  gateron: [
    { id: 1, name: '磁玉 Pro', travel: 3.50, brand: '佳达隆', color: '#70cb9a', badge: '旗舰推荐', desc: '聚光镜大通孔，透光率提升35%，磁通量线性度优异' },
    { id: 18, name: '磁玉轴', travel: 3.30, brand: '佳达隆', color: '#a04444', badge: '经典HiFi', desc: '全POM材质，顺滑度极高' },
    { id: 4, name: '磁玉Gaming', travel: 3.50, brand: '佳达隆', color: '#a7e1d6', badge: '电竞强化', desc: '触发行程短，回弹跟手迅速' },
    { id: 8, name: '双轨磁白轴', travel: 4.00, brand: '佳达隆', color: '#c45353', badge: '4.0mm全键程', desc: '双轨导向结构，稳定性极强' },
  ],
  ttc: [
    { id: 3, name: '万磁王', travel: 3.50, brand: 'TTC', color: '#5f3873', badge: '旗舰电竞', desc: '聚光大通孔，RT 0.001mm 极致灵敏' },
    { id: 2, name: '万磁王RGB', travel: 3.40, brand: 'TTC', color: '#a04444', badge: 'RGB聚光', desc: '全透聚光柱设计，灯光效果拔群' },
    { id: 5, name: '天王轴', travel: 3.50, brand: 'TTC', color: '#2bc2bd', badge: '强劲回弹', desc: '双段长弹簧，段落感与线性兼顾' },
    { id: 7, name: 'POM万磁王', travel: 3.40, brand: 'TTC', color: '#ddcde6', badge: '自润滑', desc: '高硬度全POM外壳，越用越顺' },
    { id: 30, name: '爱心万磁王', travel: 3.30, brand: 'TTC', color: '#74d1e0', badge: '轻柔触感', desc: '粉色透光上盖，敲击轻盈省力' },
  ]
};

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
 * 支持场景：
 * 1. 轴体名称/品牌：如 "磁玉", "天际线", "江湾", "Gateron", "TTC", "超竞"
 * 2. 纯行程数值：如 "3.5", "3.55", "3.50", "3.6", "4.0", "4"
 * 3. 带单位行程：如 "3.5mm", "3.50mm", "3.55毫米", "3.5 mm"
 * 4. 组合关键词：如 "磁玉 3.5", "江湾 3.55mm", "TTC 3.50", "行程 3.6"
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
    if (sw.travel != null && !isNaN(sw.travel)) {
      const travelNum = Number(sw.travel);
      const travelFixed2 = travelNum.toFixed(2); // 如 "3.50", "3.55", "3.60", "4.00"
      const travelStr = String(travelNum);       // 如 "3.5", "3.55", "3.6", "4"

      // 清除用户输入中的行程前缀及单位: 如 "3.5mm" -> "3.5", "行程3.5" -> "3.5", "3.5毫米" -> "3.5"
      const cleanToken = token
        .replace(/mm$/i, '')
        .replace(/毫米$/i, '')
        .replace(/^行程[:：]?/i, '')
        .replace(/行程$/i, '')
        .trim();

      if (cleanToken && !isNaN(cleanToken)) {
        const queryNum = parseFloat(cleanToken);
        if (cleanToken.includes('.')) {
          // 带小数点的行程搜索（如 "3.5", "3.50", "3.55", "3.6", "4.0"）
          if (travelFixed2.startsWith(cleanToken)) return true;
          if (travelStr.startsWith(cleanToken)) return true;
          if (Math.abs(travelNum - queryNum) < 0.001) return true;
        } else {
          // 纯整数行程搜索（如 "3" 匹配 3.x 行程轴体，"4" 匹配 4.0 行程轴体，杜绝 3.45 中的 4 误匹配）
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
  selectedKeysCount = 4,
  keyCount = 64,
  onApplyToSelected,
  onApplyToAll,
  allAxes = [],
  primaryAxisKeyword = '破晓',
  primaryAxisBadge = '出厂默认'
}) {
  const [activeBrand, setActiveBrand] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('brand') || 'custom';
    } catch (e) {
      return 'custom';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSwitch, setHoveredSwitch] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('hover') === 'true') {
        return {
          sw: BRANDED_SWITCHES.gateron[1],
          rect: { left: 450, top: 480, width: 225, height: 50 }
        };
      }
    } catch (e) {}
    return null;
  });

  // 全库轴体标准格式列表 (供全库搜索与跨分类提示使用)
  const fullLibraryList = useMemo(() => {
    if (allAxes && allAxes.length > 0) {
      return allAxes.map(a => ({
        id: a.id,
        name: formatAxisName(a.name),
        travel: a.maxTravel,
        brand: a.brand || '其他',
        color: a.color || '#2563eb',
        badge: a.badge || (a.name.includes(primaryAxisKeyword) ? primaryAxisBadge : '星闪校准'),
        desc: a.description || `${a.brand} 磁轴`
      }));
    }
    // 回退备选
    return BRANDED_SWITCHES.custom;
  }, [allAxes, primaryAxisKeyword, primaryAxisBadge]);

  // 全库在当前搜索关键词下的匹配结果
  const fullLibraryMatches = useMemo(() => {
    if (!searchQuery.trim()) return fullLibraryList;
    return fullLibraryList.filter(s => matchSwitch(s, searchQuery));
  }, [fullLibraryList, searchQuery]);

  // 综合计算平铺显示的轴体卡片列表
  const displayedSwitches = useMemo(() => {
    let list = [];
    if (activeBrand === 'all') {
      list = fullLibraryList;
    } else {
      list = (BRANDED_SWITCHES[activeBrand] || []).map(s => ({
        ...s,
        name: formatAxisName(s.name)
      }));
    }

    if (searchQuery.trim()) {
      return list.filter(s => matchSwitch(s, searchQuery));
    }
    return list;
  }, [activeBrand, fullLibraryList, searchQuery]);

  return (
    <div className="panel-operation panel-operation-bottom min-h-0 select-none flex flex-col justify-between overflow-hidden relative">
      <div className="operation-columns flex-1 min-h-0">
        {/* 左侧品牌紧凑胶囊栏 */}
        <div className="col flex flex-col justify-between shrink-0" style={{ flex: '0 0 180px' }}>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center mb-2 font-title tracking-wider">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)]" />
              轴体品牌分类
            </h3>

            <div className="space-y-1">
              {SPARK_SWITCH_BRANDS.map((b) => {
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

          <div className="p-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl space-y-1 text-xs text-[var(--text-secondary)] shrink-0 mt-2">
            <div className="flex items-center font-bold text-[var(--text-primary)] font-title tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
              出厂硬件校准库
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              收录 220+ 款磁轴标定参数。公模客制化默认搭载磁玉 Pro。
            </p>
          </div>
        </div>

        {/* 右侧轴体高密度紧凑平铺网格区 */}
        <div className="col flex flex-col justify-between min-h-0 flex-1 ml-4 pl-4 border-l border-[var(--border-color)]/80">
          <div className="flex flex-col flex-1 min-h-0">
            {/* 顶栏：分类标题与快速搜索 */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border-color)] shrink-0">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center font-title tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)] shrink-0" />
                  <span className="truncate">{SPARK_SWITCH_BRANDS.find(b => b.id === activeBrand)?.label}</span>
                  <span className="ml-2 text-xs text-[var(--text-secondary)] font-normal font-mono">
                    (共 {displayedSwitches.length} 款{searchQuery.trim() && activeBrand !== 'all' && fullLibraryMatches.length > 0 ? (
                      <span 
                        onClick={() => setActiveBrand('all')}
                        className="ml-1 text-[var(--info-color)] hover:underline cursor-pointer"
                        title="点击查看全库匹配轴体"
                      >
                        · 全库 {fullLibraryMatches.length} 款
                      </span>
                    ) : ''})
                  </span>
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <div className="relative">
                  <Search className="w-3 h-3 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="搜索轴体名称、行程(如3.5mm)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-6 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs focus:outline-none focus:border-[var(--info-color)] w-56 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-colors"
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
                  默认: <strong className="text-[var(--info-color)] font-bold">{currentAxis?.name || '天际线轴'}</strong>
                </div>
              </div>
            </div>

            {/* 高密度轴体卡片平铺网格 (225px 宽卡片，顶行独占轴体名称，彻底消除截断) */}
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
                    在「{SPARK_SWITCH_BRANDS.find(b => b.id === activeBrand)?.label}」中未搜索到与 “<span className="text-[var(--info-color)] font-bold">{searchQuery}</span>” 相关的轴体名称或行程
                  </div>
                  {activeBrand !== 'all' && fullLibraryMatches.length > 0 && (
                    <button
                      onClick={() => setActiveBrand('all')}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--primary-color)] text-[var(--text-inverse-100)] text-xs font-bold hover:brightness-110 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>切换至【全部校准库】查看 ({fullLibraryMatches.length} 款)</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] gap-2.5">
                  {displayedSwitches.map((sw) => {
                    const isSelected = currentAxis?.name === sw.name;
                    return (
                      <div
                        key={sw.id + sw.name}
                        onClick={() => onSelectAxis(sw)}
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

                          {/* 轴体名称与行程 (顶行独占轴体全称，次行呈现高对比行程+角标+品牌) */}
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
                              <span>{Number(sw.travel).toFixed(2)}mm</span>
                            </span>
                            {sw.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium truncate max-w-[70px]">
                                {sw.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-[var(--text-disabled)] truncate">
                              · {sw.brand?.replace(/\s*\(.*\)/, '') || '默认'}
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
              当前轴体: <strong className="text-[var(--info-color)] font-bold">{currentAxis?.name}</strong> ({currentAxis?.maxTravel?.toFixed(2) || 3.40}mm)
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>轴体配置已实时同步硬件</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统一风格的浮动悬浮窗 Tooltip (纯整像素无 Transform 渲染，彻底消除文字模糊与亚像素抖动) */}
      {hoveredSwitch && hoveredSwitch.rect && (() => {
        const rect = hoveredSwitch.rect;
        const tooltipWidth = 286;
        const idealLeft = Math.round(rect.left + rect.width / 2 - tooltipWidth / 2);
        const finalLeft = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, idealLeft));
        const placeAbove = rect.top > 250;
        const sw = hoveredSwitch.sw;

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
                <span>{Number(sw.travel).toFixed(2)}mm</span>
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

import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量战翼 Logo (方案 D · Velocity-Blades)
 * 
 * 1. 造型：双子掠影战翼 (Velocity Blades) —— 平行错位疾速破空的极客流线，象征 8KHz 极速电竞性能与毫秒级瞬发响应
 * 2. 色彩：
 *    - 上战翼：荧光天青至高能电竞蓝 (#00F5FF -> #00A2FF -> #3B82F6)
 *    - 下战翼：极光紫至霓虹洋红 (#6366F1 -> #A855F7 -> #FF2E93)
 * 3. 深浅自适应：
 *    - 浅色模式：纯净珍珠白微透底座，与白色/浅灰标题栏天然一体
 *    - 深色模式：深邃曜石黑底座 + 极光青微发光轮廓
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} 
        bg-slate-100/95 border border-slate-200/90 shadow-2xs
        dark:bg-[#0c101c] dark:border-cyan-500/35 dark:shadow-[0_0_18px_rgba(0,242,254,0.2)]
        transition-colors duration-200`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-[84%] h-[84%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 上战翼渐变 (荧光青 -> 亮天蓝 -> 宝蓝) */}
          <linearGradient id="af_vb_top" x1="18" y1="26" x2="76" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="45%" stopColor="#00A2FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* 下战翼渐变 (电竞紫 -> 霓虹紫晶 -> 荧光粉红) */}
          <linearGradient id="af_vb_bottom" x1="32" y1="54" x2="90" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#FF2E93" />
          </linearGradient>

          {/* 战翼立体微投影 */}
          <filter id="af_vb_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1e1b4b" floodOpacity="0.22" />
          </filter>
        </defs>

        <g filter="url(#af_vb_shadow)">
          {/* 上战翼 (右掠流光刃) */}
          <path 
            d="M 22,28 L 62,28 C 72,28 78,35 74,44 L 34,44 C 24,44 18,37 22,28 Z" 
            fill="url(#af_vb_top)" 
          />
          {/* 上战翼高光导轨线 */}
          <path 
            d="M 26,31 L 60,31 C 67,31 71,36 68,41" 
            stroke="#ffffff" 
            strokeWidth="1.4" 
            strokeLinecap="round" 
            opacity="0.75" 
          />

          {/* 下战翼 (错位右掠，形成电竞速度剪影) */}
          <path 
            d="M 36,56 L 76,56 C 86,56 92,63 88,72 L 48,72 C 38,72 32,65 36,56 Z" 
            fill="url(#af_vb_bottom)" 
          />
          {/* 下战翼高光导轨线 */}
          <path 
            d="M 40,59 L 74,59 C 81,59 85,64 82,69" 
            stroke="#ffffff" 
            strokeWidth="1.4" 
            strokeLinecap="round" 
            opacity="0.7" 
          />
        </g>
      </svg>
    </div>
  );
}

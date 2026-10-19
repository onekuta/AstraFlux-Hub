import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量战翼 Logo (方案 D · Velocity-Blades 饱满高占比版)
 * 
 * 1. 造型：双子掠影战翼 (Velocity Blades) —— 视觉面积与厚度扩增，居中高占比，气场饱满纯粹
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
        className="w-[90%] h-[90%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 上战翼渐变 */}
          <linearGradient id="af_vb_top" x1="10" y1="18" x2="82" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="40%" stopColor="#00A2FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* 下战翼渐变 */}
          <linearGradient id="af_vb_bottom" x1="26" y1="56" x2="98" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#FF2E93" />
          </linearGradient>

          {/* 战翼立体微投影 */}
          <filter id="af_vb_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1e1b4b" floodOpacity="0.22" />
          </filter>
        </defs>

        <g filter="url(#af_vb_shadow)">
          {/* 上战翼 (右掠流光刃 · 扩大占比) */}
          <path 
            d="M 12,18 L 66,18 C 77,18 85,25 81,36 L 77,44 C 74,47 69,47 66,47 L 26,47 C 15,47 8,40 12,28 Z" 
            fill="url(#af_vb_top)" 
          />
          {/* 上战翼高光导流线 */}
          <path 
            d="M 17,22 L 64,22 C 72,22 77,27 74,35" 
            stroke="#ffffff" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            opacity="0.85" 
          />

          {/* 下战翼 (错位右掠 · 扩大占比) */}
          <path 
            d="M 28,56 L 82,56 C 93,56 101,63 97,74 L 93,82 C 90,85 85,85 82,85 L 42,85 C 31,85 24,78 28,66 Z" 
            fill="url(#af_vb_bottom)" 
          />
          {/* 下战翼高光导流线 */}
          <path 
            d="M 33,60 L 80,60 C 88,60 93,65 90,73" 
            stroke="#ffffff" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            opacity="0.8" 
          />
        </g>
      </svg>
    </div>
  );
}

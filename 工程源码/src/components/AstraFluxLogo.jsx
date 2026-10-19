import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量战翼 Logo
 * 方案 D · 跃迁双轨「Velocity Glide」
 * 
 * 1. 造型：双子极速并排流线 (Twin Velocity Glide) —— 100% 纯圆滑流体曲线，消除所有尖锐棱角
 * 2. 色彩：
 *    - 上轨 (主星流)：荧光青至高能电竞蓝 (#00F5FF -> #3B82F6)
 *    - 下轨 (伴星流)：极光紫至霓虹洋红 (#6366F1 -> #A855F7 -> #FF2E93)
 * 3. 质感：流光微投影与流线高光导槽，完美适配深浅主题
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} 
        bg-slate-100/95 border border-slate-200/90 shadow-2xs
        dark:bg-[#0c101c] dark:border-cyan-500/35 dark:shadow-[0_0_16px_rgba(0,242,254,0.2)]
        transition-colors duration-200`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-[88%] h-[88%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 上流线渐变 (荧光青 -> 亮蓝) */}
          <linearGradient id="af_vg_top" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* 下流线渐变 (极光紫 -> 霓虹洋红) */}
          <linearGradient id="af_vg_bot" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="60%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#FF2E93" />
          </linearGradient>

          {/* 柔和流线微阴影 */}
          <filter id="af_vg_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.3" />
          </filter>
        </defs>

        <g filter="url(#af_vg_shadow)">
          {/* 上流线：平滑圆角流体胶囊带 (左前探) */}
          <rect x="14" y="28" width="60" height="18" rx="9" fill="url(#af_vg_top)" />
          {/* 上流线立体高光导槽 */}
          <path 
            d="M 16 36 C 16 32 44 32 68 32" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            opacity="0.65" 
          />

          {/* 下流线：向右错位并排流线 (右后随) */}
          <rect x="26" y="54" width="60" height="18" rx="9" fill="url(#af_vg_bot)" />
          {/* 下流线立体高光导槽 */}
          <path 
            d="M 28 62 C 28 58 56 58 80 58" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            opacity="0.65" 
          />
        </g>
      </svg>
    </div>
  );
}

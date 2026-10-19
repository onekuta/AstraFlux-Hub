import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量 Logo
 * 方案 D · 跃迁双轨「Velocity Glide · 浅色高质感主用版」
 * 
 * 1. 造型：双子极速并排流线 (Twin Velocity Glide) —— 100% 纯圆滑流体曲线，消除所有尖锐棱角
 * 2. 色彩定位 (以浅色为主用视觉标准)：
 *    - 底座：纯净珍珠白微晶底座 (bg-white/95 + 细密柔和边框阴影)
 *    - 上轨 (主星流)：高饱和电竞青蓝至纯净蔚蓝 (#00A2FF -> #0284C7)，配纯白立体导槽高光
 *    - 下轨 (伴星流)：极光深紫至霓虹洋红 (#6366F1 -> #A855F7 -> #E11D48)，配纯白立体导槽高光
 * 3. 深色自适应：深色模式下自动切换曜石黑底板并附加极光微发光
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} 
        bg-white/95 border border-slate-200/90 shadow-2xs
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
          {/* 上流线高对比渐变 (电竞青蓝 -> 纯净蔚蓝) */}
          <linearGradient id="af_vg_top_light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A2FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* 下流线高对比渐变 (极光紫 -> 霓虹洋红) */}
          <linearGradient id="af_vg_bot_light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* 柔和流线微阴影 (确保浅色底板上层次分明) */}
          <filter id="af_vg_shadow_light" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter="url(#af_vg_shadow_light)">
          {/* 上流线：平滑圆角流体胶囊带 (左前探) */}
          <rect x="14" y="28" width="60" height="18" rx="9" fill="url(#af_vg_top_light)" />
          {/* 上流线纯白立体高光导槽 */}
          <path 
            d="M 16 36 C 16 32 44 32 68 32" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            opacity="0.85" 
          />

          {/* 下流线：向右错位并排流线 (右后随) */}
          <rect x="26" y="54" width="60" height="18" rx="9" fill="url(#af_vg_bot_light)" />
          {/* 下流线纯白立体高光导槽 */}
          <path 
            d="M 28 62 C 28 58 56 58 80 58" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            opacity="0.85" 
          />
        </g>
      </svg>
    </div>
  );
}

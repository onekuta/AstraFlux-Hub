import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量莫比乌斯无限环 Logo (旗舰 V2 版)
 * 
 * 1. 造型：纯正 3D 莫比乌斯立体双环扭带，通透镂空负空间，告别实心臃肿
 * 2. 色彩：荧光天青蓝 (#00E5FF -> #3755F0) 至高能洋红紫 (#4A34EE -> #9E00FF -> #FF00A0)，立体穿插高光脊线
 * 3. 细节：中央交汇节点镶嵌灵动高能 Astra 四芒星核
 * 4. 双模自适应：
 *    - 浅色模式：纯净珍珠白微透光基座 (bg-slate-100/90)，与浅色标题栏浑然天成
 *    - 深色模式：曜石暗夜黑基座 + 极光青微光晕 (dark:bg-[#0c111e])，极客电竞质感拉满
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} 
        bg-slate-100/95 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.05)]
        dark:bg-[#0c111e] dark:border-cyan-500/35 dark:shadow-[0_0_20px_rgba(0,242,254,0.22)]
        transition-colors duration-200`}
    >
      <svg 
        viewBox="0 0 160 100" 
        className="w-[88%] h-[88%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 左侧青蓝渐变 (荧光青 -> 湛蓝 -> 宝蓝) */}
          <linearGradient id="af_mobius_cyan_blue" x1="15" y1="50" x2="80" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#0091FF" />
            <stop offset="100%" stopColor="#3755F0" />
          </linearGradient>

          {/* 右侧霓虹紫粉渐变 (深紫 -> 亮紫 -> 洋红) */}
          <linearGradient id="af_mobius_purple_magenta" x1="80" y1="50" x2="145" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A34EE" />
            <stop offset="50%" stopColor="#9E00FF" />
            <stop offset="100%" stopColor="#FF00A0" />
          </linearGradient>

          {/* 3D 空间立体交叉投影 */}
          <filter id="af_mobius_twist_shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#1e1b4b" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* 1. 底层段：右环与后穿越段 */}
        <path 
          d="M 80,50 C 95,68 112,76 126,67 C 140,58 141,39 127,29 C 113,19 96,32 80,50" 
          stroke="url(#af_mobius_purple_magenta)" 
          strokeWidth="16" 
          strokeLinecap="round" 
        />

        {/* 2. 顶层段：左环并从上方穿过中心 (带立体投影，形成真实莫比乌斯交织) */}
        <path 
          d="M 80,50 C 65,32 48,24 34,33 C 20,42 19,61 33,71 C 47,81 64,68 80,50 C 92,36 104,26 116,29" 
          stroke="url(#af_mobius_cyan_blue)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          filter="url(#af_mobius_twist_shadow)" 
        />

        {/* 3. 右环闭合补充 (右上方平滑交接) */}
        <path 
          d="M 112,28 C 124,30 137,42 128,58" 
          stroke="url(#af_mobius_purple_magenta)" 
          strokeWidth="16" 
          strokeLinecap="round" 
        />

        {/* 4. 高光丝带脊线 (凸显流体金属与玻璃通透折射感) */}
        <path 
          d="M 34,33 C 22,41 21,58 33,68 C 46,78 61,67 76,52" 
          stroke="#ffffff" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          opacity="0.85" 
        />
        <path 
          d="M 126,67 C 138,59 139,42 127,32 C 115,22 100,34 86,48" 
          stroke="#ffffff" 
          strokeWidth="2" 
          strokeLinecap="round" 
          opacity="0.75" 
        />

        {/* 5. 焦点 Astra 四芒微星耀 */}
        <path 
          d="M 80,41 Q 80,50 71,50 Q 80,50 80,59 Q 80,50 89,50 Q 80,50 80,41 Z" 
          fill="#ffffff" 
        />
        <circle cx="80" cy="50" r="1.8" fill="#00E5FF" />
      </svg>
    </div>
  );
}

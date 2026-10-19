import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 品牌矢量莫比乌斯无限环 Logo (实体丝带立体版)
 * 
 * 1. 结构：实体带状 3D 莫比乌斯环 (Mobius Ribbon)，保留优雅无限流转的曲面拓扑与景深。
 * 2. 质感：双侧流体渐变（极光青蓝 -> 霓虹紫晶），高光曲面折射。
 * 3. 自适应背景：
 *    - 浅色模式：浅白灰自然柔光底，与浅色标题栏浑然一体，不再有黑色色块突兀感。
 *    - 深色模式：深空曜夜黑底 + 极光青微发光边框，富有未来科技感。
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} 
        bg-slate-100/90 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        dark:bg-[#0c101a] dark:border-cyan-500/30 dark:shadow-[0_2px_12px_rgba(0,242,254,0.15)]
        transition-colors duration-200`}
    >
      <svg 
        viewBox="0 0 120 80" 
        className="w-[84%] h-[84%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 左侧向右上方主丝带渐变 (极光青 -> 亮蓝) */}
          <linearGradient id="af_mobius_left_ribbon" x1="10" y1="40" x2="65" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="40%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* 右侧向左下方主丝带渐变 (深空蓝 -> 霓虹紫 -> 品红) */}
          <linearGradient id="af_mobius_right_ribbon" x1="110" y1="40" x2="55" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c026d3" />
            <stop offset="45%" stopColor="#9333ea" />
            <stop offset="85%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* 扭转翻面立体高光与暗部渐变 */}
          <linearGradient id="af_mobius_twist_front" x1="45" y1="30" x2="75" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* 背部交叠阴影 (制造 3D 穿插景深) */}
          <linearGradient id="af_mobius_depth_shadow" x1="55" y1="35" x2="65" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.05" />
          </linearGradient>

          {/* 中心星核高光 */}
          <radialGradient id="af_star_radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. 后层穿插曲面 (右侧回环并向后穿过中央) */}
        <path 
          d="M 60,40 
             C 72,55 88,64 100,56 
             C 112,47 112,28 98,20 
             C 84,12 68,26 56,38 
             C 52,42 48,46 44,50 
             L 52,58 
             C 55,54 58,47 60,40 Z" 
          fill="url(#af_mobius_right_ribbon)" 
        />

        {/* 2. 右侧环外侧饱满立体曲面 */}
        <path 
          d="M 60,40 
             C 72,25 88,16 100,24 
             C 113,33 112,52 98,60 
             C 84,68 68,54 54,40 
             C 52,38 50,36 48,34 
             L 54,26 
             C 56,29 58,34 60,40 Z" 
          fill="url(#af_mobius_twist_front)" 
        />

        {/* 3. 左侧主回环曲面 (饱满优美的大莫比乌斯叶片) */}
        <path 
          d="M 60,40 
             C 48,25 32,16 20,24 
             C 7,33 8,52 22,60 
             C 36,68 52,54 66,40 
             C 68,38 70,36 72,34 
             L 66,26 
             C 64,29 62,34 60,40 Z" 
          fill="url(#af_mobius_left_ribbon)" 
        />

        {/* 4. 左侧环穿插向后的延伸面 */}
        <path 
          d="M 60,40 
             C 48,55 32,64 20,56 
             C 8,47 8,28 22,20 
             C 36,12 52,26 64,38 
             C 66,41 68,44 70,47 
             L 62,55 
             C 61,50 60,45 60,40 Z" 
          fill="url(#af_mobius_left_ribbon)" 
          opacity="0.88" 
        />

        {/* 5. 中央立体交错景深投影面 */}
        <path 
          d="M 52,32 L 68,48 L 60,56 L 44,40 Z" 
          fill="url(#af_mobius_depth_shadow)" 
        />

        {/* 6. 莫比乌斯环流动导轨光刃 (微细高光线，提升精致感) */}
        <path 
          d="M 22,22 C 34,14 48,26 60,40 C 72,54 86,66 98,58" 
          stroke="#ffffff" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          opacity="0.65" 
        />

        {/* 7. 中央焦点：Astra 灵动四芒微星耀 */}
        <path 
          d="M 60,34 
             Q 60,40 54,40 
             Q 60,40 60,46 
             Q 60,40 66,40 
             Q 60,40 60,34 Z" 
          fill="url(#af_star_radial)" 
        />
        <circle cx="60" cy="40" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}

import React from 'react';

/**
 * AstraFlux-HUB (星流驱动HUB) 官方矢量标识组件
 * 
 * 设计意象：
 * - Astra（星宿/星芒）：中央高能四芒星核，象征星宿之光与 0.01mm 级精确触发点
 * - Flux（磁通量/磁流）：外围双环交错的磁感应轨道，象征霍尔效应磁通量与 8KHz 极速电竞流
 * - 完全中立原创，规避官方商标与视觉侵权
 */
export default function AstraFluxLogo({ className = "w-7 h-7", rounded = "rounded-lg" }) {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center shrink-0 ${rounded} ${className} bg-[#0b0f19] shadow-md border border-cyan-500/25`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-[85%] h-[85%]" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 外圈磁感环渐变 1 */}
          <linearGradient id="af_orbit_1" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* 外圈磁感环渐变 2 */}
          <linearGradient id="af_orbit_2" x1="85" y1="15" x2="15" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>

          {/* 中央星芒主渐变 */}
          <linearGradient id="af_star_core" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* 发光滤镜 */}
          <filter id="af_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. 背景微弱能量光晕 */}
        <circle cx="50" cy="50" r="32" fill="#00f2fe" opacity="0.12" filter="url(#af_glow)" />

        {/* 2. 磁通量流线外轨 A (上弧流) */}
        <path 
          d="M 18,50 C 18,28 32,15 52,15 C 72,15 84,27 84,40 C 84,43 81,46 78,46 C 75,46 73,43 73,40 C 73,32 64,23 52,23 C 36,23 26,34 26,50 C 26,53 23,55 21,55 C 19,55 18,53 18,50 Z" 
          fill="url(#af_orbit_1)" 
        />

        {/* 3. 磁通量流线外轨 B (下弧流) */}
        <path 
          d="M 82,50 C 82,72 68,85 48,85 C 28,85 16,73 16,60 C 16,57 19,54 22,54 C 25,54 27,57 27,60 C 27,68 36,77 48,77 C 64,77 74,66 74,50 C 74,47 77,45 79,45 C 81,45 82,47 82,50 Z" 
          fill="url(#af_orbit_2)" 
        />

        {/* 4. 磁极脉冲微点 (Magnetic Nodes) */}
        <circle cx="78" cy="46" r="3.2" fill="#00f2fe" />
        <circle cx="22" cy="54" r="3.2" fill="#c084fc" />

        {/* 5. 核心 Astra 四芒锐星 (四角极速光芒) */}
        <path 
          d="M 50,16 
             C 50,38 38,50 16,50 
             C 38,50 50,62 50,84 
             C 50,62 62,50 84,50 
             C 62,50 50,38 50,16 Z" 
          fill="url(#af_star_core)"
          filter="url(#af_glow)"
        />

        {/* 6. 星核中心聚变纯白光点 */}
        <circle cx="50" cy="50" r="3.8" fill="#ffffff" />
        <circle cx="50" cy="50" r="1.8" fill="#38bdf8" />
      </svg>
    </div>
  );
}

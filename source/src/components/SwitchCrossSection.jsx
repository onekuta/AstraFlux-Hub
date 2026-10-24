import React from 'react';

/**
 * 机械磁轴剖面透视结构图 (1:1 严格对齐图三 media_1791916253931_5e15f60c.png 工程图)
 * 特征结构：
 * 1. 轴柱 (Stem)：十字卡芯与阶梯导轨，带有轴柱下沉位移 (stemOffset)；
 * 2. 静态弹簧：严格按照图三弹簧圈数与静态比例绘制，弹簧无需压缩动画，仅轴柱运动；
 * 3. 轴座与上盖 (Housing)：包括外壳斜肩、卡扣、底壳固定脚与中心定位柱。
 */
export default function SwitchCrossSection({ 
  travel = 1.42, 
  maxTravel = 3.5, 
  width = 84, 
  height = 116,
  strokeColor = '#94a3b8'
}) {
  const safeMax = maxTravel > 0 ? maxTravel : 3.5;
  const ratio = Math.max(0, Math.min(1, travel / safeMax));
  // 轴柱下沉位移 (0 ~ 18px，清晰呈现物理触底与半程下压反馈)
  const stemOffset = ratio * 18;

  return (
    <div 
      className="relative flex items-center justify-center select-none shrink-0"
      style={{ width: `${width}px`, height: `${height}px` }}
      title={`磁轴剖面结构示意图 (当前行程: ${travel.toFixed(2)}mm)`}
    >
      <svg 
        viewBox="14 16 92 130" 
        width="100%" 
        height="100%" 
        className="transition-colors duration-200"
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* ── 1. 底座 Housing Base (严格对齐官方轮廓与引脚) ── */}
        {/* 底壳卡座底边与台阶 */}
        <path d="M 22 108 L 22 122 L 98 122 L 98 108" strokeWidth="1.3" />
        <line x1="18" y1="122" x2="102" y2="122" strokeWidth="1.5" />
        {/* 左右限位卡扣耳 */}
        <path d="M 18 96 L 22 96 L 22 108" strokeWidth="1.2" />
        <path d="M 102 96 L 98 96 L 98 108" strokeWidth="1.2" />
        {/* 中心圆柱形定位导脚 (PCB 穿孔柱带斜倒角) */}
        <path d="M 56 122 L 56 137 L 60 141 L 64 137 L 64 122" strokeWidth="1.3" />
        <line x1="60" y1="126" x2="60" y2="137" strokeWidth="0.9" strokeDasharray="2 1" />
        {/* 两侧定位小柱 (透视) */}
        <line x1="36" y1="122" x2="36" y2="127" strokeWidth="1" />
        <line x1="84" y1="122" x2="84" y2="127" strokeWidth="1" />

        {/* ── 2. 上盖外壳 Housing Top (斜切阶梯与透光天窗) ── */}
        <path d="M 22 96 L 25 76 L 33 54 L 46 54 L 46 64 L 74 64 L 74 54 L 87 54 L 95 76 L 98 96" strokeWidth="1.3" />
        {/* 上盖内部导向筋与倒角阶梯 */}
        <path d="M 33 54 L 33 96" strokeWidth="0.8" strokeOpacity="0.6" />
        <path d="M 87 54 L 87 96" strokeWidth="0.8" strokeOpacity="0.6" />
        {/* 侧面卡扣矩形孔 */}
        <rect x="23" y="82" width="5" height="10" rx="0.5" strokeWidth="0.9" />
        <rect x="92" y="82" width="5" height="10" rx="0.5" strokeWidth="0.9" />

        {/* ── 3. 静态不锈钢弹簧 (严格对齐官方线圈) ── */}
        <g strokeWidth="1.1" strokeOpacity="0.8" stroke="#94a3b8">
          <line x1="48" y1="78" x2="72" y2="78" />
          <line x1="47" y1="83" x2="73" y2="83" />
          <line x1="48" y1="90" x2="72" y2="90" />
          <line x1="48" y1="97" x2="72" y2="97" />
          <line x1="48" y1="104" x2="72" y2="104" />
          <line x1="48" y1="111" x2="72" y2="111" />
          <line x1="48" y1="118" x2="72" y2="118" />
          {/* 弹簧左右螺旋外切边界 */}
          <line x1="48" y1="78" x2="48" y2="118" strokeWidth="0.9" strokeDasharray="2 1.5" />
          <line x1="72" y1="78" x2="72" y2="118" strokeWidth="0.9" strokeDasharray="2 1.5" />
        </g>

        {/* ── 4. 机械轴柱 (Stem) —— 严格对齐官方轴芯轮廓与下压响应 ── */}
        <g transform={`translate(0, ${stemOffset})`} className="transition-transform duration-75">
          {/* 轴柱十字卡芯顶部 (防尘壁 + 十字口) */}
          <rect x="47" y="24" width="26" height="36" rx="1.5" strokeWidth="1.4" fill="var(--bg-secondary)" />
          {/* 十字口纵横凹槽 */}
          <line x1="60" y1="25" x2="60" y2="58" strokeWidth="1.3" />
          <line x1="49" y1="40" x2="71" y2="40" strokeWidth="1.3" />
          <line x1="53" y1="24" x2="53" y2="58" strokeWidth="0.7" strokeOpacity="0.5" />
          <line x1="67" y1="24" x2="67" y2="58" strokeWidth="0.7" strokeOpacity="0.5" />

          {/* 轴柱导轨双翼与台阶 (Stem Wings & Shoulders) */}
          <path 
            d="M 37 60 L 83 60 L 83 76 L 75 76 L 75 88 L 45 88 L 45 76 L 37 76 Z" 
            strokeWidth="1.3" 
            fill="var(--bg-secondary)" 
            fillOpacity="0.8" 
          />
          {/* 轴柱内圈中心圆柱柱塞 */}
          <rect x="52" y="60" width="16" height="34" strokeWidth="1" />
          <line x1="60" y1="60" x2="60" y2="94" strokeWidth="0.8" strokeDasharray="2 1" />

          {/* 霍尔感应永磁体胶囊仓 (底部磁铁) */}
          <rect x="53" y="78" width="14" height="12" rx="1" strokeWidth="1.1" stroke="var(--info-color)" fill="var(--primary-09)" />
          <line x1="53" y1="84" x2="67" y2="84" strokeWidth="0.9" stroke="var(--info-color)" />
        </g>
      </svg>
    </div>
  );
}

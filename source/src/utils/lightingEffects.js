// 星闪悦动 HUB · 实时动态灯效渲染引擎
// 完全基于星闪官方固件协议逆向标准与实机采样数据校准开发
// 支持官方 19 种真实灯效模式 (L1 ~ L19) + 双层自定义涂色叠加 + 炫彩彩虹/单色无缝切换 + 双向流动控制

// 官方 8 种预设调色板色值 (0=彩虹, 1~7=单色)
export const OFFICIAL_STATIC_COLORS = [
  '',         // 0: 彩虹 (Rainbow)
  '#FF3D3D',  // 1: 红色
  '#FFD42B',  // 2: 活力黄
  '#2EE944',  // 3: 竞技绿
  '#00D8E8',  // 4: 青空蓝
  '#2558FF',  // 5: 深海蓝
  '#E83FD7',  // 6: 赛博紫
  '#E8E8E8',  // 7: 极光白
];

/**
 * 计算指定按键在当前动态灯效下的 CSS 颜色与阴影
 * @param {Object} params
 * @param {number} params.mode 硬件真实灯效模式编号 (0~18 对应 L1~L19)
 * @param {number} params.selectStaticColor 调色板选择 (0=炫彩彩虹, 1~7=对应预设单色)
 * @param {number} params.row 硬件/视觉行号 (0~4)
 * @param {number} params.col 硬件/视觉列号 (0~14)
 * @param {number} params.tick 动画时间步进
 * @param {number} params.brightness 亮度 (0~100)
 * @param {number} params.speed 速度 (0~100)
 * @param {number} params.direction 流动方向 (0 = 正向/Forward, 1 = 反向/Backward)
 * @param {string} params.baseColor 基础单色 (HEX)
 * @param {boolean} params.isOpen 灯效是否开启
 * @param {boolean} params.isPressed 当前键是否按下
 * @param {string|null} params.customColor 单键自定义涂色 (双层叠加最高优先级)
 * @param {boolean} params.isDoubleLight 是否双灯
 */
export function computeKeyLighting({
  mode = 1,
  selectStaticColor = 0,
  row = 1,
  col = 0,
  tick = 0,
  brightness = 75,
  speed = 50,
  direction = 0, // 0 = 正向流动 (Forward), 1 = 反向流动 (Backward)
  baseColor = '#FF3D3D',
  isOpen = true,
  isPressed = false,
  customColor = null,
  isDoubleLight = false,
  topLightEnabled = true,
  bottomLightEnabled = true,
}) {
  // 1. 如果灯光关闭
  if (!isOpen) {
    return {
      bg: '#14171d',
      boxShadow: 'none',
      textColor: 'rgba(255,255,255,0.3)',
      isCustom: false,
    };
  }

  const bri = Math.max(0.15, brightness / 100);
  // 真实键盘速度系数：50% 为官方硬件基准 1.0x；0% 为极缓 0.35x；100% 为疾速 2.2x
  const speedFactor = (speed <= 50)
    ? 0.35 + (speed / 50) * 0.65
    : 1.0 + ((speed - 50) / 50) * 1.2;
  // 物理标准时间 t (单位：秒，30fps 下 1 tick ≈ 0.0333 秒)
  const t = tick * 0.0333 * speedFactor;

  // 流动方向系数：direction 0 = 正向 (dirSign = 1)，direction 1 = 反向 (dirSign = -1)
  const dirSign = direction === 0 ? 1 : -1;

  // 2. 双层动画核心规范：自定义涂色作用于当前动效之上（涂色键按指定单色进行动态调制，非涂色键按调色板/彩虹正常流转）
  const hasCustomColor = !!customColor;
  const isRainbow = !hasCustomColor && mode !== 0 && selectStaticColor === 0;

  // 获取有效的单色色值：若按键有自定义涂色，以 customColor 为基础色，完美融入当前动效波浪！
  const activeSingleColor = customColor || baseColor || ((selectStaticColor >= 1 && selectStaticColor <= 7)
    ? OFFICIAL_STATIC_COLORS[selectStaticColor]
    : '#FF3D3D');

  let bg = activeSingleColor;
  let shadowColor = activeSingleColor;

  switch (mode) {
    case 0: { // L1: 常亮模式 (静态全彩光谱，整列同色，从左至右固定垂直列色相分布：-36°/列)
      if (!hasCustomColor && selectStaticColor === 0) {
        // 官方硬件实测：整列严格同色，从左向右列色彩固定分布 (Blue c0:240° -> c6:24° -> c10:240° -> c14:96°)
        const hue = Math.round((240 - col * 36.0 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = activeSingleColor;
        shadowColor = activeSingleColor;
      }
      break;
    }

    case 1: { // L2: 随波逐流 (彩虹横向波浪，整列严格同色，沿列 X 轴平滑向右/向左流转)
      const wavePhase = col * 0.42 - dirSign * t * 2.3;
      const wave = (Math.sin(wavePhase) + 1) / 2;
      if (isRainbow) {
        // 官方硬件实测：整列同色，每列严格递增 24.0° 色相，时间递减 170°/秒 (向右顺流推进)
        const hue = Math.round((col * 24.0 - dirSign * t * 170 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((20 + 38 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 2: { // L3: 往下渐变流动 (官方实机严格整行同色，沿 Y 轴自上向下平滑渐变向下涌动)
      // 视觉行号归一化：保证整行完全同色 (0..4)
      const r = Math.max(0, Math.min(4, Math.round(row)));
      // 波浪自上而下推进：当 dirSign === 1 时，随着时间推进颜色向下流淌
      const rowPhase = r * 0.9 - dirSign * t * 2.5;
      const wave = (Math.sin(rowPhase) + 1) / 2;
      if (isRainbow) {
        // 色相沿行垂直自上向下流动：Row 0~4 呈绿->青->浅蓝->深蓝等全彩光谱向下涌动
        const hue = Math.round((r * 28.0 - dirSign * t * 130 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((18 + 42 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 3: { // L4: 球形展开 (官方实机对齐：球形光波自键盘中心向外层层扩散展开)
      const centerCol = 7.0;
      const centerRow = 2.0;
      const dx = (col - centerCol) * 0.75;
      const dy = (row - centerRow) * 1.35;
      const dist = Math.hypot(dx, dy);
      // 球形波浪自中心向外扩展推进
      const wavePhase = dist * 0.95 - dirSign * t * 3.2;
      const wave = (Math.sin(wavePhase) + 1) / 2;
      if (isRainbow) {
        // 环形彩虹光谱由中心向外层层展开
        const hue = Math.round((dist * 32.0 - dirSign * t * 150 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((18 + 42 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 4: { // L5: 棒棒糖旋转 (官方实机对齐：螺旋曲线全彩绕中心旋转，犹如旋转炫彩波板糖/棒棒糖)
      const centerCol = 7.0;
      const centerRow = 2.0;
      const dx = (col - centerCol) * 0.72;
      const dy = (row - centerRow) * 1.35;
      const dist = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      // 棒棒糖的核心特征：螺旋条纹 (角度随着距离递增而旋转扭曲)
      // dist * 36.0 形成顺畅的外延螺旋臂
      const spiralAngle = (angle + dist * 36.0 - dirSign * t * 220 + 36000) % 360;

      if (isRainbow) {
        // 炫彩棒棒糖：全光谱沿螺旋臂连续旋转流转
        bg = `hsl(${Math.round(spiralAngle)}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${Math.round(spiralAngle)}, 100%, 55%)`;
      } else {
        // 单色棒棒糖：3 瓣螺旋糖果条纹旋转
        const stripe = Math.pow((Math.cos(spiralAngle * 3 * (Math.PI / 180)) + 1) / 2, 2.0);
        const wave = 0.2 + 0.8 * stripe;
        bg = adjustColorLightness(activeSingleColor, Math.round((16 + 44 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 5: { // L6: 炫彩旋转 (围绕键盘中心全彩风车旋转，全彩光谱平滑转动)
      const dx = (col - 7.0) * 0.72;
      const dy = (row - 2.0) * 1.35;
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const rotAngle = (angle - dirSign * t * 180 + 36000) % 360;
      if (isRainbow) {
        bg = `hsl(${Math.round(rotAngle)}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${Math.round(rotAngle)}, 100%, 55%)`;
      } else {
        const blade = Math.pow((Math.cos(rotAngle * (Math.PI / 180) * 2) + 1) / 2, 2.0);
        const wave = 0.2 + 0.8 * blade;
        bg = adjustColorLightness(activeSingleColor, Math.round((16 + 44 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 6: { // L7: 从键盘边缘的中间向外扩展 (以中心列为源头向左右边缘平滑向外扩展推移)
      const distX = Math.abs(col - 7.0);
      const distY = Math.abs(row - 2.0) * 0.35;
      const dist = distX + distY;
      const wavePhase = dist * 0.5 - dirSign * t * 2.8;
      const wave = (Math.sin(wavePhase) + 1) / 2;
      if (isRainbow) {
        // 中间暖色向外推移扩散成草绿/青绿
        const hue = Math.round((dist * 20.0 - dirSign * t * 140 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((18 + 42 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 7: { // L8: 繁星点点 / 晶莹雪花 (按键独立哈希闪烁星芒，单键呼吸闪耀)
      const hash = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
      const seed = hash - Math.floor(hash);
      const keyPhase = seed * Math.PI * 2 + dirSign * t * (2.0 + seed * 1.8);
      const shine = Math.pow((Math.sin(keyPhase) + 1) / 2, 4.0);
      if (isRainbow) {
        const hue = Math.round((seed * 360 + t * 45) % 360);
        bg = `hsl(${hue}, 95%, ${Math.round((12 + 50 * shine) * bri)}%)`;
        shadowColor = `hsl(${hue}, 95%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((10 + 52 * shine) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 8: { // L9: 雨滴滑落 / 水波微澜 (列方向数码雨滴飘落拖尾，图标水滴入水)
      const colHash = Math.sin(col * 93.123) * 43758.5453;
      const colSeed = colHash - Math.floor(colHash);
      const dropSpeed = 2.0 + colSeed * 1.2;
      const dropPos = dirSign === 1
        ? ((t * dropSpeed + colSeed * 8) % 8) - 1
        : 6 - (((t * dropSpeed + colSeed * 8) % 8) - 1);
      const diff = row - dropPos;
      const inTrail = dirSign === 1 ? (diff <= 0.2 && diff >= -1.6) : (diff >= -0.2 && diff <= 1.6);
      if (inTrail) {
        const intensity = Math.max(0.12, 1 - Math.abs(diff) / 1.6);
        if (isRainbow) {
          const hue = Math.round((colSeed * 360 + t * 45) % 360);
          bg = `hsl(${hue}, 95%, ${Math.round(52 * intensity * bri)}%)`;
          shadowColor = `hsl(${hue}, 95%, 55%)`;
        } else {
          bg = adjustColorLightness(activeSingleColor, Math.round(52 * intensity * bri));
          shadowColor = bg;
        }
      } else {
        bg = '#13171e';
        shadowColor = 'transparent';
      }
      break;
    }

    case 9: { // L10: 左右移动然后到尽头切换色块 (官方实测对齐：单程耗时 0.95 秒往复扫掠，全屏呈现双色块，到尽头换色)
      const sweepDuration = 0.95; // 官方实机基准速度：单程扫掠耗时约 0.95 秒
      const totalPhase = t / sweepDuration;
      const cycle = Math.floor(totalPhase); // 到达尽头的次数编号
      const progress = totalPhase - cycle; // 当前单程进度 0.0 ~ 1.0
      const movingRight = (cycle % 2 === 0); // 偶数向右扫，奇数向左扫
      const boundaryCol = movingRight ? (progress * 14.0) : ((1 - progress) * 14.0);

      // 丰富对比色块序列 (玫红、草绿、活力橙、青空蓝、洋红、明黄、薄荷绿、深蓝)
      const BLOCK_PALETTE = [300, 115, 35, 195, 345, 60, 160, 240];
      const curHue = BLOCK_PALETTE[cycle % BLOCK_PALETTE.length];
      const prevHue = BLOCK_PALETTE[(cycle - 1 + BLOCK_PALETTE.length) % BLOCK_PALETTE.length];

      // 判断按键处于新色块还是旧色块
      const isNewBlock = movingRight ? (col <= boundaryCol) : (col >= boundaryCol);
      const activeHue = isNewBlock ? curHue : prevHue;

      if (isRainbow) {
        bg = `hsl(${activeHue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${activeHue}, 100%, 55%)`;
      } else {
        const level = isNewBlock ? 0.95 : 0.28;
        bg = adjustColorLightness(activeSingleColor, Math.round((15 + 45 * level) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 10: { // L11: 对角穿梭 (官方实测对齐：diag = col - row * 1.85，斜向彩虹色带顺滑流淌奔涌)
      const diag = col - row * 1.85;
      const wavePhase = diag * 0.55 - dirSign * t * 2.8;
      const wave = (Math.sin(wavePhase) + 1) / 2;
      if (isRainbow) {
        // 精确对齐用户官方实机截图：黄绿(85°)->橙红(25°)->玫红(320°)->蓝紫(260°)->天蓝(195°)->回环黄绿
        const hue = Math.round((85 - diag * 32.5 - dirSign * t * 135 + 36000) % 360);
        bg = `hsl(${hue}, 100%, ${Math.round(50 * bri)}%)`;
        shadowColor = `hsl(${hue}, 100%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((18 + 42 * wave) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 11: { // L12: 光之靶心 / 同心圆靶 (圆圈自中心同轴向外扩散，图标同心靶心)
      const centerR = 2.0;
      const centerC = 7.0;
      const dist = Math.hypot(row - centerR, (col - centerC) * 0.7);
      const ripple = (Math.sin(dist * 0.9 - dirSign * t * 3.0) + 1) / 2;
      if (isRainbow) {
        const hue = Math.round((dist * 30 - dirSign * t * 135 + 36000) % 360);
        bg = `hsl(${hue}, 95%, ${Math.round((22 + 36 * ripple) * bri)}%)`;
        shadowColor = `hsl(${hue}, 95%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((16 + 42 * ripple) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 12: { // L13: 旋涡星系 (气旋漩涡角向流转，图标旋涡)
      const centerR = 2.0;
      const centerC = 7.0;
      const dist = Math.hypot(row - centerR, (col - centerC) * 0.7);
      const angle = Math.atan2(row - centerR, (col - centerC) * 0.7);
      const spiral = (Math.sin(angle * 3 + dist * 0.85 - dirSign * t * 3.2) + 1) / 2;
      if (isRainbow) {
        const hue = Math.round((angle * (180 / Math.PI) + dist * 25 - dirSign * t * 90 + 36000) % 360);
        bg = `hsl(${hue}, 95%, ${Math.round((24 + 32 * spiral) * bri)}%)`;
        shadowColor = `hsl(${hue}, 95%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((16 + 44 * spiral) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 13: { // L14: 交叉射线 / 百花争艳 (十字星芒向四周脉冲辐射，图标十字星芒)
      const pulseStep = Math.floor(t * 1.6);
      const activeCol = (pulseStep * 7 + 4) % 15;
      const activeRow = (pulseStep * 3 + 2) % 5;
      const colDist = Math.abs(col - activeCol);
      const rowDist = Math.abs(row - activeRow);
      const crossIntensity = Math.max(0, 1 - colDist / 1.8) * (row === activeRow ? 1 : 0.2) +
                             Math.max(0, 1 - rowDist / 1.4) * (col === activeCol ? 1 : 0.2);
      if (crossIntensity > 0.08) {
        if (isRainbow) {
          const hue = Math.round((t * 90 + (col + row) * 20) % 360);
          bg = `hsl(${hue}, 95%, ${Math.round(52 * Math.min(1, crossIntensity) * bri)}%)`;
          shadowColor = `hsl(${hue}, 95%, 55%)`;
        } else {
          bg = adjustColorLightness(activeSingleColor, Math.round(52 * Math.min(1, crossIntensity) * bri));
          shadowColor = bg;
        }
      } else {
        bg = '#14171d';
        shadowColor = 'transparent';
      }
      break;
    }

    case 14: { // L15: 朝阳初升 / 极光穹顶 (半圆光弧自底部中心向上半部扩散，图标半圆拱门)
      const dist = Math.hypot(row - 4.2, (col - 7.0) * 0.65);
      const arc = (Math.sin(dist * 0.85 - dirSign * t * 2.6) + 1) / 2;
      if (isRainbow) {
        const hue = Math.round((dist * 32 - dirSign * t * 120 + 36000) % 360);
        bg = `hsl(${hue}, 95%, ${Math.round((20 + 36 * arc) * bri)}%)`;
        shadowColor = `hsl(${hue}, 95%, 55%)`;
      } else {
        bg = adjustColorLightness(activeSingleColor, Math.round((16 + 42 * arc) * bri));
        shadowColor = bg;
      }
      break;
    }

    case 15: { // L16: 灵动小球 (官方实机对齐：一个小球在键盘区域随机平滑跑动，按键呈现球形光斑，移动中变换色彩)
      // 小球平滑跑动轨迹：通过多频复合正弦波产生自然、连续、无重复感的二维穿梭路径
      const ballSpeed = 1.35;
      const ballX = 7.0 + 5.2 * Math.sin(t * ballSpeed * 0.72) + 0.9 * Math.sin(t * ballSpeed * 1.83);
      const ballY = 2.0 + 1.25 * Math.sin(t * ballSpeed * 0.95 + 1.2) + 0.35 * Math.cos(t * ballSpeed * 2.31);

      // 计算当前按键到小球中心的物理视觉距离（结合键帽长宽比修正）
      const dx = col - ballX;
      const dy = (row - ballY) * 1.32;
      const dist = Math.hypot(dx, dy);
      const ballRadius = 2.85; // 刚好点亮中心键及周围 1~2 圈键，与官方实机图 1:1 绝对对齐

      if (dist < ballRadius || isPressed) {
        const intensity = isPressed ? 1.0 : Math.pow(Math.max(0, 1 - dist / ballRadius), 1.25);
        if (isRainbow) {
          // 小球跑动中持续平滑变色
          const hue = Math.round((t * 85 + 210) % 360);
          bg = `hsl(${hue}, 100%, ${Math.round((20 + 35 * intensity) * bri)}%)`;
          shadowColor = `hsl(${hue}, 100%, 55%)`;
        } else {
          bg = adjustColorLightness(activeSingleColor, Math.round((18 + 42 * intensity) * bri));
          shadowColor = bg;
        }
      } else {
        bg = '#13171e';
        shadowColor = 'transparent';
      }
      break;
    }

    case 16: { // L17: 水波涟漪 (按键触发同心圆水波向全键盘波及扩散)
      const ripplePeriod = 2.2;
      const ripplePhase = (t % ripplePeriod) / ripplePeriod;
      const rippleRadius = ripplePhase * 10.5;
      const originR = isPressed ? row : 2.0;
      const originC = isPressed ? col : 7.0;
      const dist = Math.hypot(row - originR, (col - originC) * 0.7);
      const ringDiff = Math.abs(dist - rippleRadius);
      const ringIntensity = Math.max(0, 1 - ringDiff / 1.1) * Math.max(0, 1 - ripplePhase * 0.6);

      if (isPressed || ringIntensity > 0.08) {
        const intensity = isPressed ? 1.0 : ringIntensity;
        if (isRainbow) {
          const hue = Math.round((dist * 32 - t * 120 + 36000) % 360);
          bg = `hsl(${hue}, 95%, ${Math.round((15 + 45 * intensity) * bri)}%)`;
          shadowColor = `hsl(${hue}, 95%, 55%)`;
        } else {
          bg = adjustColorLightness(activeSingleColor, Math.round((12 + 48 * intensity) * bri));
          shadowColor = bg;
        }
      } else {
        bg = '#12151c';
        shadowColor = 'transparent';
      }
      break;
    }

    case 17: { // L18: 激光横扫 (按压按键向左右两侧横向极光扩展，图标同心圆靶)
      const laserPeriod = 1.8;
      const laserPhase = (t % laserPeriod) / laserPeriod;
      const spreadDist = laserPhase * 14;
      const originR = isPressed ? row : Math.floor((t / laserPeriod) % 5);
      const originC = isPressed ? col : 7.0;
      const rowDiff = Math.abs(row - originR);
      const colDist = Math.abs(col - originC);
      const beamDiff = Math.abs(colDist - spreadDist);
      const beamIntensity = (rowDiff === 0 ? 1.0 : Math.max(0, 1.0 - rowDiff * 0.7)) * 
                            Math.max(0, 1.0 - beamDiff / 1.1) * 
                            Math.max(0, 1.0 - laserPhase * 0.4);

      if (isPressed || beamIntensity > 0.08) {
        const intensity = isPressed ? 1.0 : beamIntensity;
        if (isRainbow) {
          const hue = Math.round((colDist * 28 + t * 90 + 36000) % 360);
          bg = `hsl(${hue}, 95%, ${Math.round((15 + 45 * intensity) * bri)}%)`;
          shadowColor = `hsl(${hue}, 95%, 55%)`;
        } else {
          bg = adjustColorLightness(activeSingleColor, Math.round((12 + 48 * intensity) * bri));
          shadowColor = bg;
        }
      } else {
        bg = '#12151c';
        shadowColor = 'transparent';
      }
      break;
    }

    case 18: { // L19: 踏雪无痕 (全键盘常亮/流光，按压单键瞬间熄灭并渐隐恢复)
      if (isPressed) {
        bg = '#101318';
        shadowColor = 'transparent';
      } else {
        if (isRainbow) {
          const hue = Math.round((col * 18 + row * 24 - dirSign * t * 75 + 36000) % 360);
          bg = `hsl(${hue}, 92%, ${Math.round(48 * bri)}%)`;
          shadowColor = `hsl(${hue}, 92%, 55%)`;
        } else {
          bg = activeSingleColor;
          shadowColor = activeSingleColor;
        }
      }
      break;
    }

    default: {
      if (isRainbow) {
        const hue = Math.round((col * 20 - dirSign * t * 112.5 + 36000) % 360);
        bg = `hsl(${hue}, 95%, ${Math.round(48 * bri)}%)`;
        shadowColor = `hsl(${hue}, 95%, 55%)`;
      } else {
        bg = activeSingleColor;
        shadowColor = activeSingleColor;
      }
      break;
    }
  }

  // 双灯珠渲染增强 (支持上位灯/下位灯独立与联动发光)
  let finalBg = bg;
  if (isDoubleLight) {
    if (topLightEnabled && bottomLightEnabled) {
      finalBg = `linear-gradient(180deg, ${bg} 0%, ${bg} 48%, rgba(0,0,0,0.35) 50%, ${bg} 52%, ${bg} 100%)`;
    } else if (topLightEnabled && !bottomLightEnabled) {
      finalBg = `linear-gradient(180deg, ${bg} 0%, ${bg} 48%, #14171d 50%, #14171d 100%)`;
    } else if (!topLightEnabled && bottomLightEnabled) {
      finalBg = `linear-gradient(180deg, #14171d 0%, #14171d 48%, ${bg} 50%, ${bg} 100%)`;
    } else {
      finalBg = '#14171d';
    }
  }

  const isLampLit = !isDoubleLight || topLightEnabled || bottomLightEnabled;

  return {
    bg: finalBg,
    rawColor: bg,
    boxShadow: (shadowColor !== 'transparent' && isLampLit)
      ? `0 0 ${Math.round(14 * bri)}px ${shadowColor}88, inset 0 1px 2px rgba(255,255,255,0.3)`
      : 'none',
    textColor: isLampLit ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
    isCustom: false,
  };
}

// 辅助：微调色光纯度/亮度
function adjustColorLightness(hex, lightnessPercent) {
  if (!hex) return `hsl(0, 90%, ${lightnessPercent}%)`;
  if (hex.startsWith('hsl')) return hex;
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return `hsl(0, 90%, ${lightnessPercent}%)`;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, 95%, ${lightnessPercent}%)`;
}

/**
 * 贯穿式底灯/装饰灯带 LED 颜色与阴影计算
 * 支持实时动态动效运算 (L1常亮, L2随波逐流, L3呼吸模式, L4流光漫延)
 * 完美支持单键自定义涂色叠加与全彩光谱流转
 */
export function computeStripLedColor({
  mode = 1,
  ledIndex = 0,
  index = 0,
  totalLeds = 34,
  total = 34,
  tick = 0,
  brightness = 100,
  speed = 50,
  direction = 0,
  baseColor = '#FF3D3D',
  selectStaticColor = 0,
  customColor = null,
  isOpen = true,
}) {
  const actualIndex = (typeof index === 'number') ? index : (ledIndex || 0);
  const actualTotal = total || totalLeds || 34;

  const bri = Math.max(0.15, brightness / 100);

  if (customColor) {
    return {
      bg: customColor,
      rawColor: customColor,
      boxShadow: isOpen ? `0 0 ${Math.round(10 * bri)}px ${customColor}cc, 0 0 ${Math.round(18 * bri)}px ${customColor}66` : 'none',
      isCustom: true,
      toString() { return this.bg; }
    };
  }

  if (!isOpen) {
    return {
      bg: '#12161f',
      rawColor: '#12161f',
      boxShadow: 'none',
      isCustom: false,
      toString() { return this.bg; }
    };
  }

  const speedFactor = (speed <= 50)
    ? 0.35 + (speed / 50) * 0.65
    : 1.0 + ((speed - 50) / 50) * 1.2;
  const t = tick * 0.0333 * speedFactor;
  const dirSign = direction === 0 ? 1 : -1;
  const isRainbow = selectStaticColor === 0;

  const activeColor = (selectStaticColor >= 1 && selectStaticColor <= 7 && OFFICIAL_STATIC_COLORS[selectStaticColor])
    ? OFFICIAL_STATIC_COLORS[selectStaticColor]
    : (baseColor || '#FF3D3D');

  let finalColor = activeColor;

  switch (mode) {
    case 0: { // L1: 底灯常亮
      if (isRainbow) {
        const hue = Math.round(((actualIndex / actualTotal) * 360) % 360);
        finalColor = `hsl(${hue}, 95%, ${Math.round(50 * bri)}%)`;
      } else {
        finalColor = activeColor;
      }
      break;
    }

    case 1: { // L2: 底灯随波逐流 (环绕流动)
      if (isRainbow) {
        const hue = Math.round(((actualIndex / actualTotal) * 360 - dirSign * t * 140 + 36000) % 360);
        finalColor = `hsl(${hue}, 95%, ${Math.round(50 * bri)}%)`;
      } else {
        const wave = (Math.sin((actualIndex / actualTotal) * Math.PI * 2 - dirSign * t * 2.8) + 1) / 2;
        finalColor = adjustColorLightness(activeColor, Math.round((18 + 42 * wave) * bri));
      }
      break;
    }

    case 2: { // L3: 底灯呼吸
      const wave = (Math.sin(t * 2.0) + 1) / 2;
      if (isRainbow) {
        const hue = Math.round((t * 50) % 360);
        finalColor = `hsl(${hue}, 95%, ${Math.round((14 + 46 * wave) * bri)}%)`;
      } else {
        finalColor = adjustColorLightness(activeColor, Math.round((12 + 50 * wave) * bri));
      }
      break;
    }

    case 3: { // L4: 底灯流光漫延
      const phase = (actualIndex / actualTotal) * Math.PI * 4 - dirSign * t * 3.2;
      const wave = (Math.sin(phase) + 1) / 2;
      if (isRainbow) {
        const hue = Math.round(((actualIndex / actualTotal) * 720 - dirSign * t * 180 + 36000) % 360);
        finalColor = `hsl(${hue}, 95%, ${Math.round((20 + 36 * wave) * bri)}%)`;
      } else {
        finalColor = adjustColorLightness(activeColor, Math.round((15 + 45 * wave) * bri));
      }
      break;
    }

    default:
      finalColor = activeColor;
      break;
  }

  return {
    bg: finalColor,
    rawColor: finalColor,
    boxShadow: (isOpen && finalColor !== 'transparent' && finalColor !== '#12161f')
      ? `0 0 ${Math.round(10 * bri)}px ${finalColor}bb, 0 0 ${Math.round(18 * bri)}px ${finalColor}55`
      : 'none',
    isCustom: false,
    toString() { return this.bg; }
  };
}

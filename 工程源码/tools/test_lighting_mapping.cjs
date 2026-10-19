const { LAYOUT_60, LAYOUT_64, LAYOUT_68, LAYOUT_75, LAYOUT_87, LAYOUT_98, LAYOUT_104 } = require('d:/desk/星闪悦动驱动/工程源码/src/constants/keyboardLayouts.js');

console.log('=== 1. 验证全部视觉配列坐标规范性 (必须全部为正整数) ===');
const layouts = { LAYOUT_60, LAYOUT_64, LAYOUT_68, LAYOUT_75, LAYOUT_87, LAYOUT_98, LAYOUT_104 };
let hasError = false;

for (const [name, lay] of Object.entries(layouts)) {
  const flat = lay.flat().filter(k => k && !k.isSpacer && !k.gap && k.id);
  for (const k of flat) {
    if (!Number.isInteger(k.row) || !Number.isInteger(k.col) || k.row < 0 || k.row >= 6 || k.col < 0 || k.col >= 21) {
      console.error(`[${name}] 错误坐标: ${k.id} -> row: ${k.row}, col: ${k.col}`);
      hasError = true;
    }
  }
}
if (!hasError) {
  console.log('✅ 所有 7 种主流键盘方案静态矩阵坐标均严格为 [0~5, 0~20] 整数！');
}

console.log('\n=== 2. 模拟 setCustomKeyLighting 矩阵组装与空格5灯 ===');
const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return { R: 0, G: 0, B: 0, isCustom: false };
  const n = parseInt(m[1], 16);
  return { R: (n >> 16) & 255, G: (n >> 8) & 255, B: n & 255, isCustom: true };
};

function buildCustomLightingMatrix(colorEntries) {
  const data = Array.from({ length: 6 }, () =>
    Array.from({ length: 21 }, () => ({ R: 0, G: 0, B: 0, isCustom: false }))
  );
  const hasSpecificSpaceLamps = colorEntries.some((e) => e.isSpaceLamp || (e.keyId && e.keyId.startsWith('Space_')));

  colorEntries.forEach((e) => {
    const row = Math.round(Number(e.row));
    const col = Math.round(Number(e.col));
    if (e.hex && row >= 0 && row < 6 && col >= 0 && col < 21) {
      const rgb = hexToRgb(e.hex);
      data[row][col] = rgb;

      const isFullSpaceBar = e.keyId === 'Space' || (!e.isSpaceLamp && col === 6 && row === 5);
      if (isFullSpaceBar && !hasSpecificSpaceLamps) {
        [4, 5, 6, 7, 8].forEach((c) => {
          data[row][c] = rgb;
        });
      }
    }
  });

  return data;
}

// Case A: 涂 Space_1 为红色 (#FF0000)
const entriesA = [{ row: 5, col: 4, hex: '#FF0000', keyId: 'Space_1', isSpaceLamp: true }];
const matrixA = buildCustomLightingMatrix(entriesA);
console.log('Case A (Space_1 红色):');
console.log('  Row 5, Col 3 (不应被污染):', matrixA[5][3]);
console.log('  Row 5, Col 4 (应为红色):', matrixA[5][4]);
console.log('  Row 5, Col 5 (不应被污染):', matrixA[5][5]);
if (matrixA[5][3].isCustom === false && matrixA[5][4].isCustom === true && matrixA[5][4].R === 255 && matrixA[5][5].isCustom === false) {
  console.log('  ✅ Space_1 独立灯珠精确生效，Col 3 未受污染！');
} else {
  console.error('  ❌ Space_1 测试失败！');
}

// Case B: 涂整颗 Space 为蓝色 (#0000FF)
const entriesB = [{ row: 5, col: 6, hex: '#0000FF', keyId: 'Space', isSpaceLamp: false }];
const matrixB = buildCustomLightingMatrix(entriesB);
console.log('\nCase B (整颗 Space 蓝色):');
let spaceAllBlue = true;
[4, 5, 6, 7, 8].forEach(c => {
  if (matrixB[5][c].B !== 255 || !matrixB[5][c].isCustom) spaceAllBlue = false;
});
console.log('  Row 5, Cols 4~8 全部为蓝色:', spaceAllBlue);
console.log('  Row 5, Col 3 (不应被污染):', matrixB[5][3]);
if (spaceAllBlue && matrixB[5][3].isCustom === false) {
  console.log('  ✅ 整颗 Space 正确联动 5 颗物理灯珠！');
} else {
  console.error('  ❌ 整颗 Space 测试失败！');
}

// Case C: 浮点数坐标防御 (例如 1.5, 2.7)
const entriesC = [{ row: 1.0, col: 1.49, hex: '#00FF00', keyId: 'KeyQ' }];
const matrixC = buildCustomLightingMatrix(entriesC);
console.log('\nCase C (浮点坐标输入自动取整):');
console.log('  Row 1, Col 1 (自动取整生效):', matrixC[1][1]);
if (matrixC[1][1].isCustom === true && matrixC[1][1].G === 255) {
  console.log('  ✅ 浮点坐标安全取整，成功进入单片机数组槽位！');
} else {
  console.error('  ❌ 浮点坐标防御失败！');
}

console.log('\n=== 3. 验证探针适配数据转换器 ===');
const { translateProbeJsonToProfile } = require('d:/desk/星闪悦动驱动/工程源码/src/services/adapterTranslator.js');
const probeSample = require('d:/desk/星闪悦动驱动/PCB信息枚举探针/导出数据/PCB_适配示例_AE64_MAX_0x1CA6_0x300D.json');
const { runtimeProfile } = translateProbeJsonToProfile(probeSample);
console.log('导入 AE64-MAX 档案:');
console.log('  总键数:', runtimeProfile.totalKeyCount);
console.log('  空格灯珠数:', runtimeProfile.lighting.spacebarLeds);
console.log('  空格独立编辑:', runtimeProfile.lighting.spaceLedsEditable);
console.log('  空格坐标列表:', runtimeProfile.lighting.spaceLamps.coordinates.map(c => `[${c.row},${c.col}]`).join(', '));
console.log('  底灯数:', runtimeProfile.lighting.stripLighting.totalStripLeds, `(${runtimeProfile.lighting.stripLighting.stripCols}列 x ${runtimeProfile.lighting.stripLighting.stripRows}行)`);

if (runtimeProfile.totalKeyCount === 64 && runtimeProfile.lighting.spacebarLeds === 5 && runtimeProfile.lighting.stripLighting.totalStripLeds === 34) {
  console.log('  ✅ 探针数据转换器 100% 具备 64键 + 5灯空格 + 34灯底灯高保真架构！');
} else {
  console.error('  ❌ 探针数据转换器测试失败！');
}

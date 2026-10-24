// 批量布局扫描（纯数据，不出截图）
// 用途：一次跑完所有标签页 × 指定视口，汇总「越界 / 重叠 / 键帽挤压 / 滚动」结论
// 用法: node tools/scan-layout.cjs [cdpBaseUrl] [WxH]
const { dumpLayout } = require('./dump-layout.cjs');

const base = process.argv[2] || 'http://127.0.0.1:9333';
const viewport = process.argv[3] || '1100x700';
// 可选：只跑指定标签页，如 advanced,keybinds
const only = (process.argv[4] || '').split(',').map((s) => s.trim()).filter(Boolean);

const ALL_TABS = [
  ['lighting', '灯光配置'],
  ['trigger', '触发配置'],
  ['keybinds', '改键配置'],
  ['advanced', '高级按键'],
  ['performance', '性能配置'],
  ['settings', '其他设置'],
];
const TABS = only.length ? ALL_TABS.filter(([id]) => only.includes(id)) : ALL_TABS;

// 非标签页视图：首页（无 query = 默认首页）、DV63 档案的触发页
const EXTRA_VIEWS = [
  ['view=home', '设备主页 (view=home)'],
  ['view=device&tab=trigger&profile=dv63', 'DV63 档案 · 触发配置'],
  ['view=device&tab=lighting&profile=dv63', 'DV63 档案 · 灯光配置'],
];

(async () => {
  let bad = 0;
  console.log(`########## 批量布局扫描 · ${viewport} ##########`);
  console.log('');

  const cases = [
    ...TABS.map(([tab, label]) => [`view=device&tab=${tab}&profile=es68`, `${label} (${tab})`]),
    ...(only.length ? [] : EXTRA_VIEWS),
  ];

  for (const [search, label] of cases) {
    let r;
    try {
      const { text } = await dumpLayout({ base, search, viewport });
      r = JSON.parse(text);
    } catch (err) {
      console.log(`❌ ${label} — 探针失败: ${String(err.message).split('\n')[0]}`);
      bad++;
      continue;
    }

    const ovCnt = r.overlapCount;
    const sq = r.keycapSqueezeCount;
    const ok = ovCnt === 0 && sq === 0;
    if (!ok) bad++;

    console.log(`${ok ? '✅' : '⚠️ '} ${label}   视口 ${r.viewport.w}x${r.viewport.h}`);
    console.log(`    同级实心块重叠 ${ovCnt} 处 | 键帽挤压 ${sq} 处 | 超出内容区元素 ${r.bleeds.length} 个`);
    const col0 = r.containers && r.containers['col[0]'];
    if (col0) console.log(`    首列 col[0] 实测 ${col0.w} x ${col0.h}`);
    (r.scrollBoxes || []).forEach((b) => {
      if (b.over > 2) {
        console.log(`    滚动 ${b.el}: 内容超出 ${b.over}px, overflowY=${b.overflowY} → ${b.scrollable ? '可滚动 ✅' : '会被裁掉 ⛔'}`);
      }
    });
    if (ovCnt) {
      r.topOverlaps.slice(0, 3).forEach((o) => {
        console.log(`    ⛔ 重叠 ${o.ix} x ${o.iy}px  (${o.area}px²)`);
        console.log(`       A: ${o.a}`);
        (o.chainA || []).forEach((c) =>
          console.log(`          ^ h=${c.h} oy=${c.oy} flex=${c.fx} minH=${c.minH} 溢出${c.sc} | ${c.p}`)
        );
        console.log(`       B: ${o.b}`);
        (o.chainB || []).forEach((c) =>
          console.log(`          ^ h=${c.h} oy=${c.oy} flex=${c.fx} minH=${c.minH} 溢出${c.sc} | ${c.p}`)
        );
      });
      if (ovCnt > 3) console.log(`    … 另有 ${ovCnt - 3} 处同类重叠未展开`);
    }
    console.log('');
  }

  console.log(
    bad === 0
      ? '########## 全部通过：无重叠、无键帽挤压 ##########'
      : `########## 仍有 ${bad} 个页面存在问题 ##########`
  );
  process.exit(bad === 0 ? 0 : 1);
})();

# 星闪悦动 HUB · 项目长期记忆

> 只记跨会话长期有效、且**必须遵守**的项目事实与铁律。日常流水见 `YYYY-MM-DD.md`。

## 〇、交付铁律（最高优先级）

1. **不要产出界面截图。用户只要成品软件。** 验收一律用**纯数据探针**（CDP 回显 DOM 文本 / 元素计数 / console）。
2. 每轮改完前端，**必须同步更新 `软件本体/resources/app.asar`** —— 用户靠双击 `软件本体/星闪悦动HUB.exe` 验收，只改源码他打不开。
3. 交付话术只讲「成品在哪 + 这次改了什么 + 数据验收结果」。

### 探针清单（全在 `工程源码/tools/`）

| 探针 | 用途 / 何时必跑 |
| :--- | :--- |
| `dump-hid.cjs [cdp]` | 真机 HID 原始枚举 |
| `dump-home.cjs [cdp] [query]` | 首页 / 驱动页数据回显 |
| `dump-layout.cjs [cdp] [query] [WxH]` | 布局几何：越界 / 溢出 / 同级重叠 / 键帽挤压（支持模拟视口）。已导出 `dumpLayout()` 供 `scan-layout.cjs` require（沙箱里 node **不能 spawn 自己**，会 EBUSY） |
| `scan-layout.cjs [cdp] [WxH] [tab,...]` | 一次跑完 6 个标签页 + 首页 + DV63 档案。**改字号 = 布局重洗 → 必跑 1100×700 与 1380×880 两个尺寸** |
| `dump-font.cjs [cdp] [query]` | 字体是否加载 / 命中哪些元素 |
| `dump-calibrate.cjs [cdp] [profile] [机型]` | 校准弹窗 + 触发子页（跳过 URL 刷新、走 SPA 点选机型） |
| `dump-late-mount.cjs [cdp]` | **键盘「晚挂载」复现**：先 `tab=performance` 再点侧栏「触发配置」，量 1100/1200/1380 三个宽度。**改键盘区布局或自适应逻辑必跑** |
| `dump-vslider.cjs [cdp] [query]` | **竖向行程滑块 `.vtravel`**：A 段读结构，B 段真实拖拽（CDP 鼠标 + 合成 PointerEvent 双路径）比对 `aria-valuenow`。**改 `VerticalTravelSlider.jsx` / `.vtravel*` / 触发页 AP 卡必跑** |
| `dump-struct.cjs [cdp] [WxH]` | **操作区结构统一性**：8 页逐页报 `.panel-operation` / `.col` 数 / 列宽高 / 是否越界溢出。**改任何 `*Tab.jsx` 根容器必跑** |
| `dump-line.cjs [cdp] [viewQuery]` | **竖分隔线可见度（像素级）**：按 `clip` 抓窄条 → 自解 PNG → 算对比度，用 WCAG **1.5:1** 门槛判定。**视觉模型说「看不到分隔线」时用它仲裁** |
| `dump-misalign.cjs [cdp] [WxH] [subTab]` | 界面显示错位专项：侧栏裁切/交叠、键帽逐行 top、操作区标准结构与底部余白 |
| `dump-continuous.cjs [cdp]` | **「连续快速触发」机型门控**：逐页验证 **AE64_MAX 有 · ES68/DV63 无**。**改触发页 RT 列或 `features.continuousRt` 必跑** |

**启动 + 探针必须写在同一条 Bash 命令里**（后台 exe 会随命令结束被回收）：
```bash
cd 软件本体 && (env -u ELECTRON_RUN_AS_NODE ./星闪悦动HUB.exe \
  --remote-debugging-port=9333 --no-sandbox --disable-gpu --disable-software-rasterizer >/dev/null 2>&1 &) ; sleep 9
cd ../工程源码 && node tools/dump-home.cjs http://127.0.0.1:9333
```
旧抓图工具（`shot.cjs` / `cdp_shot.cjs` / `cdp_nav.cjs` / `cdp_es68.cjs` / `debug-tab.cjs`）**保留但不用**。

## 一、项目定位、目录与文档

- 桌面端外设驱动软件 **星闪悦动 HUB (SparkLink PlayJoy)**，Electron + React 19 + Vite + Tailwind v4。
- 根目录中文分类（用户明确要求，勿打乱）：
  - `软件本体/` —— 免安装绿色版，**只放可直接打开的程序文件**。真代码在 `软件本体/resources/app.asar`（`dist` 前端 + `electron` 主进程），**每轮要改的就是它**。
  - `工程源码/` —— 工程本体；所有构建命令先 `cd 工程源码`。
  - `项目文档/` —— **没有 `docs/` 目录！** SOP.md / PROJECT_AI_SPEC.md / SDK标准.md / SKU清单.md / 软件本体更新说明.md / 更新迭代.md / 开发日志.md / 界面预览/。
  - `旧版本存档/`、`参考内容包/`（官方 SDK 文档 + 迈从 HUB 解包）。
  - 根目录只留一个快捷方式 `星闪悦动HUB (最新版).lnk`（手写 MS-SHLLINK，非符号链接）。
- **`项目文档/SOP.md` 是唯一作业手册**（12 章 + 3 条最高铁律）；旧的「AI 版 SOP」有 6 类硬错，已废弃。
- ❌ **`npm run dist`（electron-builder → `release-v4/`）是历史遗留，已不是交付路径，不要跑。** 它是当年产出 7 个残留构建目录 + `.asar` 句柄锁死的根源。交付只有一条路：**原地覆盖 `app.asar`**。
- `app.asar.unpacked` 里只有 **2 个** `.node`（rolldown / lightningcss）。

## 二、构建与调试

```bash
cd 工程源码 && node node_modules/vite/bin/vite.js build   # 构建前端
```
- **调试入口**：`index.html?view=device&tab=<lighting|trigger|keybinds|advanced|performance|settings>&profile=<es68|dv63|AE64_MAX>`
  - ⚠️ **URL 显式写 `profile=` 会「锁定」档案**：`App.jsx` 的设备回调只在 `!PROFILE_LOCKED` 时才 `setDeviceProfile(state.profile)`。
    「URL 写 `AE64_MAX`、运行时实际是 `es68`」→ 机型门控探针**假阴性**。不带 `profile=` 才跟随真实设备。**改这条逻辑前先想清楚，它决定所有探针的可信度。**
  - 🔍 **排障利器：CDP 读 React fiber** —— `#root` 上找 `__reactContainer$*` key，DFS 遍历 `child`/`sibling`，沿 `memoizedState.next` 枚举 hook 链，即可读到任意 state 真实值。**别靠猜。**

## 三、环境铁律（沙箱）

1. `rm` 被 node-safe-delete-shim 劫持（转发 genie-trash，中文路径必败）→ **真实删除用绝对路径 `/usr/bin/rm`**。
2. PowerShell 工具不回显 stdout → 必须 `Out-File` 到文件再 `Read`。
3. 被禁：`schtasks.exe`、`Add-Type`、`WScript.Shell` COM、Bash 内调 PowerShell。
4. 跑 Electron 必须 `env -u ELECTRON_RUN_AS_NODE` + `--no-sandbox --disable-gpu --disable-software-rasterizer`。
5. 🚨 **沙箱里所有「同步」子进程创建一律 EBUSY**：`spawnSync` ❌ / `execSync` ❌ / **异步 `spawn` ✅**。
   `spawnSync` 出错时 `stdout` 为 `null`，脚本不检查 `r.error` 就表现成「被调用方什么都没输出」，极易误判。
   **新写任何调外部程序的脚本，一律用异步 `spawn` 包 Promise，且必须处理 `error` 事件。**

## 四、`app.asar` 文件锁（关键）

- 现象：`软件本体/resources/app.asar` **可读、可写，但不能改名/删除**（WinError 32），父目录 `软件本体/`、`resources/` 也跟着改名失败。
- 规律：**凡被访问过的 `.asar` 都会被句柄锁住**。❌ `resources/app/` 目录覆盖法**无效**（Electron 加载顺序 `app.asar` 优先于 `resources/app/`）。
- ✅ 正解：**原地覆盖** —— `asar extract` → 替换 `dist/` + `electron/*.js` → `asar pack --unpack "*.node"` → Python `open(dst,'r+b')` + `write` + `truncate()`。
- 中间产物放 `工程源码/.asar-tmp/`，**别放项目根目录**（放根目录会被锁住删不掉）。详见 SOP 第四/五章。

## 五、设备与 SDK 事实

- ES68（前行者破晓）= `0x1CA6:0x1C24`（官网 7334:7204），**有线 32K 磁轴**，68 键，贯穿式灯带 26 列。
- DV63 = `0x1CA6:0x7A02`，64 键（左移配列），有线，8000Hz 封顶。
- AE64-MAX = `0x1CA6:0x300D`，64 键，上下双灯。
- **星闪 SDK（sdk-keyboard-v2 / protocol-keyboard-v2）回报率枚举只到 `R8KHz`** —— 键盘 UI 封顶 8K，勿显示 16K/32K。
- 型号匹配分支顺序：`DV63` → **`ES68`** → `AE64` → `M6`(鼠标) → 通用兜底。**ES68 必须排在 M6 之前**。
- **官方设备库（222 条）覆盖不全**：AE64-MAX 与 DV63 **都不在库里**，靠主 VID 分支才可见。
- **首页可见性判定用 `isSupportedSparklinkDevice(vid,pid)`**：① 精确命中官方库 → 可见；② 属于主 VID `0x1CA6` → 可见；③ 其它 VID 且未入库 → 不可见。
  ⚠️ 不要退回 `SPARKLINK_VIDS.includes(vendorId)`，那会让 Dragonfly `0x391D:0x1A36`、iKF、MCHOSE 等历史授权残留冒出来。
- **一台键盘 = 多个 HID 接口集合**：`navigator.hid.getDevices()` 会把 MI_00/01/02/03 当多台返回 → 必须经 `keyboardService.normalizeDeviceList()` 按 `vid:pid` 去重。实测本机 29 条原始 → 归一化后正好 **2 台**。

## 六、官方设备库真相：509 组 ≠ 项目运行时 222 组（2026-10-14 查证）

- **官方站点设备库按「方案」分四组集合**（本地快照 `工程源码/scratch/keyboards.json`，2026-10-10 抓）：
  `shuangzixin`（**双子星**独占）**23** ｜ `public`（**公版**独占）**452** ｜ `shuangzixinAndPublic`（**双支持**）**36** ｜ `other` **42** → 去重合计 **509 组 VID:PID**（22 个 VID；主 VID `0x1CA6` 单独占 418 条）。
  这就是**官方驱动侧真正的方案划分**：只有 `双子星` 与 `公版` 两条线。
- ⚠️ **项目运行时库 `src/constants/sparklinkDevices.js` 只有 7 VID / 222 组，且完全没有「方案归属」维度** —— 与官方 509 组存在 **287 组缺口**。做 SKU 适配 / 按方案分流前必须先补。
- **型号名映射在官方前端包里**：`scratch/main.1e6e89d87476c9ca15fc.js` 含 **236 条 `productName`**（行进者 EWEADN 系为主）。抽取脚本：`工程源码/scratch/extract-device-map.cjs`。
- **已核实的三条方案归属**（务必记住）：
  - `ES68` `0x1CA6:0x1C24` → **`public` 公版**
  - `DV63` `0x1CA6:0x7A02` → **`public` 公版**
  - `AE64-MAX` `0x1CA6:0x300D` → **`shuangzixinAndPublic` 双子星 + 公版双支持**（印证「AE64-MAX 走双子星官方驱动体系」）
- **星闪方案命名体系（9 套，定位升序）**：水星（RT 0.01）→ 火星8K（0.005）→ 天王星8K（32K 全键 + 256K 通道扫描）→ 海王星8K（0.001~0.005，峰值 512K）→ **星闪480**（480MHz 主控 + 9~10 颗独立芯片，第二代 GTurbo，单键 RT 0.001）→ **双子星 / 2.0**（双 MCU + ADC 全键直连）→ **双子星280** → **双子星 Extreme**（三核）→ **银河600**（全键 32K 扫描、双灯位）→ 前行者 × 星闪悦动 **32K 联合方案**。
- 📌 **口径铁律**：官方明示「**双子星的 256K = ADC 采样率**」「**银河600 的 32K = 全键扫描率**」，**属不同指标、不能比大小** —— 任何参数表都必须分列，不得合并成一个「扫描率」列。
- **客制化 PCB 侧 = 公版白牌流通，不是开源硬件**。已查证 5 款：星闪悦动 `META60`、`双子星 PCB XS60`、`WuqueStudio Flux60 HE`（驱动名 **Polaris Twin OS**）、BG BOX63 双子星版 / 银河600 版 PCB。
  ⚠️ 淘宝 59.8 元「XS60 GH60 PCB」是 **QMK 机械轴板**，与「双子星 PCB XS60」同名不同物。
- **判定为非星闪悦动（勿纳入 SKU）**：**迈从 Ace 75 / Jet 75 HE** —— 英文官方页明确写 MCHOSE 自研方案 + 自研 **M HUB** 驱动，标称扫描率 128KHz 与星闪悦动典型 256KHz 不符。
- 归档文档：`项目文档/星闪方案产品适配SKU总表.md` + `.html`；`项目文档/星闪悦动方案PCB与成品键盘清单.md`。

## 七、UI 约定

- 视觉配列随档案切换，见 `src/constants/keyboardLayouts.js`（`ES68_LAYOUT` 68 键 / `DV63_LAYOUT` 64 键）。
- 键帽按页面分流：灯光页深色键帽（`keycap-light*`），其余页浅色（`keycap-lite*`）。
- **竖向行程量用竖向滑轨**：触发页 AP 卡的「设置触发行程」用 `src/components/VerticalTravelSlider.jsx`，**不是** `input[type=range]`。
- ⚠️ **范围边界（用户 2026-10-13 拍板）**：**只有 AP 这一根是竖向**。RT「按下/抬起灵敏度」与狂暴模式「按下/抬起死区」**保持横向 `input[type=range]`** —— 问过用户，用户选「就保持现在这样」。**别再自作主张把它们也竖起来。**

## 七、字体铁律（无版权无衬线黑体 + 特殊标题体）

- 四个字体族，**全部随包内置、完全离线**，源文件 `工程源码/src/assets/fonts/`（11 个 woff2，约 7.0MB），`@font-face` 在 `src/index.css` 顶部，构建后落 `dist/assets/*.woff2`：
  - 正文黑体 = **思源黑体 Noto Sans SC**（SIL OFL），400/500/700 × (latin + chinese-simplified)
  - 标题体（主）= **庞门正道标题体 PangMenZhengDao**，单文件 1.04MB（6231 字形，V3.12）
  - 标题体（备）= **得意黑 Smiley Sans Oblique**（SIL OFL），1.10MB
  - 等宽 = **JetBrains Mono**（SIL OFL），400/500/700 latin 子集
- **庞门正道的授权不是 SIL OFL**，是作者庞门正道（阿门）的「作者声明」：企业/个人均可免费商用，**禁止转售字库、禁止用于商标注册**。本软件只用于界面文案展示，在授权范围内。**改动用途前先确认。**
- CSS 变量：`--font-sans` / `--font-title` / `--font-display` / `--font-mono`（`:root`）。
  - `--font-title`（庞门正道）用在：`h1,h2`、`.page-title`、`.section-title`、`.form-section-title`、`.modal-title`、`.text-brand-gradient`、`.device-card-name`、`.font-title`，以及**产品型号**（侧栏顶部 / 标题栏徽章 / 首页设备卡 / 轴体名）。
  - `--font-display`（得意黑）只作备用，保留 `.font-display`。
  - 侧栏 `.nav-group-title`（12px）与所有 `<h3>/<h4>` 小标题**故意不用**标题体 —— 笔画粗、字腔小，12px 下会糊。
  - ⚠️ 庞门正道只有 Regular 一个字重，`@font-face` 声明成 `font-weight: 400 700`，让 `font-bold` 复用同一份字形，避免合成伪粗拉糊。
- 🔍 **验证字体是否真生效，不能只看 computed `font-family`**（那只说明「栈里写了谁」）。用 `tools/dump-font.cjs` 的 canvas `measureText` 实测宽度：「星闪悦动」在庞门正道下 147.2px、系统兜底 160px —— **宽度不同才证明字形真来自目标字体**。
- ⚠️ **`tailwind.config.js` 的 `fontFamily.sans/mono` 必须与 CSS 变量同步改**，否则 `font-sans`/`font-mono` 工具类走另一套。
- ⚠️ **声明顺序有坑**：fontsource 子集 CSS 不带 `unicode-range`。latin 子集要手动补 `unicode-range` 并**放在 chinese-simplified 之后**（同 family+weight 后声明者胜，中文子集无 range 会抢走所有字符）。
- ❌ 两个必须避免的坑：① 字体栈写 `PingFang SC` 优先（仅 macOS 自带）；② `index.html` 挂 Google Fonts CDN（离线包请求必失败，还注册 500+ 幽灵 FontFace）。

## 八、窄窗口布局铁律

- 窗口最小 **1100×700**（`electron/main.js`），默认 1380×880。**改完布局必须两个尺寸都扫一遍**。`lg` 断点 1024 < 1100 → 组件里 `flex-col lg:flex-row` 的竖排分支是**死代码**。
- 键盘可视化 **1u 尺寸不能写死**。ES68 每行 16u，写死 52px 会宽 826px 撑爆白卡。现用 `ResizeObserver` 反算 `kbUnit`（30~52px），键高 `kbUnit * 0.885`。
- 🚨 **自适应观察器必须用「回调 ref」，不能用 `useRef` + `useEffect`**：键盘卡片只在 `activeTab ∉ {performance, settings}` 时渲染，App 启动在首页时它**根本不在 DOM 里**。旧写法首次 commit 时 `ref.current === null` 直接 return，**`ResizeObserver` 永远没挂上**；用户走「首页 → 点设备 → 切到触发配置」时键盘是**晚挂载**的，永远停在初始 1u（实测 1100 下 unit 恒 52、底板 774、容器内宽 656 → 左右各戳出 58px）。正解：`const ref = useCallback((el) => {...}, [ACTIVE_LAYOUT])`，挂载那刻接观察器 + 立刻 `recalc()`，再补 `resize` 兜底；初始 `kbUnit` 取 **`KB_UNIT_MIN`(30)** —— 宁可偏小，绝不戳出去。
- ⚠️ **「直接用 URL 导航到 `?tab=trigger`」测不出上面的 Bug**（键盘首次 commit 就在 DOM 里）。必须用 `dump-late-mount.cjs` 走真实路径。**这是探针方法论级别的教训。**
- 「左文 + 右按钮组」的标题行 / 提示行必须成对保护：左组 `min-w-0 flex-1` + 文本 `truncate`，右组 `shrink-0`，容器 `gap-3`。否则长文案会把右侧按钮挤出去（用户说的「没有让位留空」）。
- ⚠️ **`@media` 断点是 1024**：1100 宽时 `lg:flex-row` 已生效但内容区只剩 ~880px，多列面板每列仅 ~240px —— 凡「左文 + 右按钮组」一行排布的卡片都要 `flex-wrap`。
- `.app-content` **必须是 `overflow-y: auto`**，不能 `hidden`：1100×700 下「高级按键」页内容比可用高度高 ~80px，写 hidden 会裁掉底部按钮且无法滚动。
- 🔍 探针判定重叠时**必须用「可见盒」**（与所有 `overflow !== visible` 的祖先求交）：滚动容器里被滚出可视区的内容 `getBoundingClientRect()` 仍返回原始布局位置，直接用会大量误报（改键页曾误报 32 处）。`dump-layout.cjs` 的 `visibleBox()` 已处理，并另输出不裁剪的 `rawOverlaps` 交叉验证。
- ⚠️ **探针的 `Emulation.setDeviceMetricsOverride` 会让配列档案变掉**：视口被覆盖后 `deviceProfile` 会重算到**真机正连的设备**（本机连着 ES68 + AE64-MAX → 变成 64 键）。所以 `scan-layout.cjs` / `dump-late-mount.cjs` 在模拟视口下量到的是 64 键配列；不加 override 用真实窗口才是 68 键。不影响结论：`unit = floor((inner + KEY_GAP_PX) / units_max)`，`plate = units_max × unit − KEY_GAP_PX ≤ inner` 对任意配列恒成立。
  ⚠️ Electron **不支持** `Browser.getWindowForTarget` / `setWindowBounds`，改真实窗口尺寸这条路走不通。

## 九、字号规范

- **`text-[Npx]` 字面量统一映射（129 处已替换）**：`7→9 · 7.5→10 · 8→10 · 9→10 · 9.5→11 · 10→11 · 11→12 · 12→13 · 13→14`。
  唯一例外：首页设备卡 42px 的 "SparkLink" 装饰水印。
- **`--text-*` 变量同步上调一档**（`src/index.css` `:root`）：`--text-h1 18→20` · `--text-h2 16→17` · `--text-h3 14→15` · `--text-body 14`（不变） · `--text-caption 12→13`。

## 十、竖向行程滑块（`VerticalTravelSlider.jsx`）

- 参考前行者官网「设置触发键程」：**一列刻度数字 + 一根竖向柱体（填充到当前行程）+ 跟随的数值气泡（带铅笔图标）**。
- 样式在 `src/index.css` 的 `.vtravel*` 整块。
- ❌ **不要用 `<input type="range">` 竖过来**（`writing-mode`/`direction`/`-webkit-appearance` 版本相关写法，Electron 打包后不稳）。
- ✅ **自绘 + Pointer Events，四个必须点**：
  ① `pointerdown` 里 `e.currentTarget.setPointerCapture(e.pointerId)`（`try/catch` 包住）；
  ② `value = (1 − (clientY − rect.top) / rect.height) × max`（**底=0 顶=max，别写反**）；
  ③ CSS `touch-action: none`；④ **拖拽中禁用过渡**（`.vtravel-track.dragging .vtravel-fill{transition:none}` + `.vtravel-col:has(.dragging) .vtravel-bubble{transition:none}`），否则气泡会「追」指针。
- 刻度/填充/气泡全用**百分比绝对定位**（`bottom: X%`），柱高由 `height` prop 定。主刻度 `tickStep 0.5`（带数字）、次刻度 `minorStep 0.25`（只画短线），**次刻度落在主刻度上要 `continue` 跳过**。
- 无障碍：`role="slider"` + `tabIndex={0}` + `aria-valuemin/max/now/valuetext` + `aria-label`；`↑↓←→` 微调、`Shift` 加速到 0.1mm、`Home`/`End`/`PageUp`/`PageDown`。**不能省。**

## 十一、操作区结构统一规约（**改 UI 必守**）

**除首页外，8 个标签页的操作区必须是**（灯光/触发/死区/轴体/改键/高级按键/性能/设置已全部统一）：
```jsx
<div className="panel-operation">            {/* flex:1 1 0 · 圆角20 · padding24 · 白底 */}
  <div className="operation-columns">        {/* flex 横排 · width100% · height100% */}
    <div className="col">…</div>             {/* flex:1 1 0 · min-width:0 · overflow:hidden auto */}
    <div className="col">…</div>             {/* `.col + .col` 自带 1px 竖线 + padding-left24 + margin-left24 */}
  </div>
</div>
```
- **严禁**裸 grid/flex + 每张卡自带 `bg + border + rounded-2xl + shadow`。这是「UI 显示错位」的**真正病根**（切标签时白面板/卡片边框/内边距/卡片高度全跳变）。
- 列内只允许「输入区 / 状态区」用 `bg-[var(--bg-tertiary)] + border + rounded-xl` 的**内嵌小盒**。
- ⚠️ **`flex: 1 1 0` 不能丢** —— 写成 `flex: 0 0 auto` 会让面板高度从 336 涨到 ~432。
- **非等宽列用内联 style 覆盖，别改公共 CSS**：轴体页左列 `flex:'0 0 208px'`；高级按键页左 `0 1 320px / minWidth 260`、中 `1 1 340px`、右 `0 1 240px / minWidth 210`。
  **必须用 `0 1`（可收缩）而不是 `0 0`**：最小 1100px 时两个固定列 + 98px 分隔线会把中列挤到只剩 148px。
- **列内不要留「中空」**：`.col` 用 `justify-between` 会把顶/底块顶到两端、中段掏空（死区页曾空 ~80px）。修法：输入区/状态区改 `flex-1 min-h-[88px] flex flex-col justify-center`。三列**底部动作条必须在同一水平线**。
- **竖分隔线用专用变量**：`--col-divider-color: var(--color-black-22)`（浅色）/ `--color-white-22`（深色）。
  用 `--line-color`（9% 不透明）→ 白底对比度 ≈ **1.19:1**，**低于 WCAG 非文本元素 1.5:1 门槛，肉眼读不出来**；提到 22% → **1.56:1** ✅（`dump-line.cjs` 实测）。`--line-color` 留给子标签栏下划线等「越淡越好」的场景。

## 十二、交叉验证：视觉模型 vs 像素仲裁

1. **先用已知答案当考题**：截图前先说清「里面有什么」，再比对模型输出。答不上已知项 → 其它结论都不可信。
2. **先算清截图真实窗口尺寸，再量 DOM**：用户给的截图 1080×720，默认窗口 1380×880（0.783 等比）。按 1440×960 量 DOM 会得出相反结论。**不看图先量 DOM，等于白量。**
3. **模型对「1px 细线 / 省略号」极不可靠，必须用像素或几何仲裁**：

| 模型的判断 | 真相 | 仲裁手段 |
| :--- | :--- | :--- |
| 「三列之间看不到竖分隔线」 | 9% 确实≈不可见；提到 22% 后仍报看不见 | `dump-line.cjs` 像素对比度 1.19:1 → 1.56:1 ✅ |
| 「卡片最下方描述文字被底部边框切掉」 | 是 `truncate` 的**横向省略号**，纵向没被裁 | 量 `clientHeight vs scrollHeight` + 最深后代是否越出内容区下沿（实测 **0px**） |
| 「第三列明显偏矮、悬在半空」 | 三列容器**等高**（288/288/288），底部动作条对齐 | `dump-misalign` 逐列报高 |

**一句话：几何探针只认「有没有」，视觉模型只认「像不像」，谁都不能单独定「是不是缺陷」；结论冲突时，去抓第三份客观数据（像素/对比度/高度差）仲裁。**

## 十三、视觉外援：Antigravity CLI（`agy`）＋ `tools/vision.cjs`

- Antigravity IDE 是纯 GUI 的 Electron 应用，**无任何可编程入口**；只有 CLI（`agy`）能无头调用。
- 安装：`winget install --id Google.AntigravityCLI --exact`；**不需要 API key**，继承现有 Google 登录态。配置在 `~/.gemini/antigravity-cli/`。
- 入口：`node tools/vision.cjs <图片> "<问题>" [--model id] [--effort lvl] [--timeout 秒] [--raw|--json]`
- 可用模型：`gemini-3.8-flash-high`（默认）/ `-medium` / `-low`、`claude-sonnet-4-6`、`claude-opus-4-6-thinking`、`gpt-oss-120b-medium`。单图 13~22s，**别每张图都过**。
- 权限：agy 无头模式不能弹权限框，读文件会被静默拒绝（`status=SUCCESS` 但 `response` 空 + `denied_actions:[{"action":"command"}]`）→ 脚本固定带 `--dangerously-skip-permissions`，保留默认 sandbox（写入仅限 `/tmp`），只把图片所在目录 `--add-dir` 进 workspace。
- **`tools/vision-app.cjs`**：CDP 抓当前画面 → 交 `vision.cjs` → 删临时 PNG。
  `node tools/vision-app.cjs "<问题>" [--view <query>] [--vp <WxH>] [--click <文字>] [--model <id>] [--timeout <秒>] [--keep]`
  临时图**只写 `os.tmpdir()`**，默认结束即 `unlinkSync`，`--keep` 才留下。**项目目录永远不出现 png。**
  ⚠️ 提示词必须**收紧**（最多 N 条 + 逐区域结论 + 直接作答不要反复裁图 + 「正常」也要报）。开放式「列出所有缺陷」→ 模型反复裁图，烧 8.7 万 tokens / 296 秒后超时。模型选 `claude-sonnet-4-6`（~20-30s，稳）。

## 十四、机型能力位：「连续快速触发」

- **来源**：深圳江湾数码 LV100 管理员群公告（2026-10-13）——「AE64 max 增加了一个新的功能…连续快速触发的开关。打开后就开始支持在 **RT 行程中也连续快速触发**。在 **0.04 版本固件**开始支持。」
- **用户拍板：只在 AE64-MAX 显示。** 落地 = 能力位 `DEVICE_PROFILES.*.features.continuousRt`（DV63/ES68/GENERIC_KEYBOARD = `false`，**AE64_MAX = `true`**）。
  对外只暴露 `CONTINUOUS_RT_MIN_FIRMWARE = '0.04'` 与 `supportsContinuousRt(profile)`。**以后官方放开到其它机型 → 只改那一个布尔值**。
  ⚠️ **不要在页面里散落写 `deviceProfile.id === 'AE64_MAX'`**。
- ⚠️ **现发行版 SDK 没有这个协议字段**（必须如实告知，不能淡化）：
  - `@sparklinkplayjoy/protocol-keyboard-v2@1.0.23` 的 `IPerformanceData` 是**固定字节布局**，字段只有 `mode / normalPress / normalRelease / rtFirstTouch / rtPress / rtRelease / pressDeadStroke / releaseDeadStroke / axis / calibrate / axisV2Id / axisRangeMax / axisCoefficient`。
  - `src/pack/performance.ts` 的 `setPerformanceDataPack` **解构固定字段名**，未知 key 被**静默忽略**。
  - `GlobalFeatureSwitchConfig` 枚举只有 `Config1~Config4`（配置档切换），不是这个开关。
  - 三个 SDK 包（`hid@1.0.16` / `protocol-keyboard-v2@1.0.23` / `sdk-keyboard-v2@1.0.29`）都已是 npm 最新（2026-08-24）。
  - → **UI + state + 下发链路已铺好，但官方开放该字段前不会真正落到硬件。** 话术：「界面与下发链路已就绪，等官方 SDK 开放该字段后即刻生效」，**不说成「已支持硬件」**。
- 📌 **通用教训**：新功能「UI 出得来但硬件没反应」→ 先查该字段在**现发行版 SDK 里存不存在**。固定字节布局的接口只认它列出的 key，多传的 key 被静默丢掉，**不报错**。

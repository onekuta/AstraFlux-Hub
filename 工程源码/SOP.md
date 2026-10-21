# 星闪悦动 HUB · 项目 SOP（标准作业流程）

> 本文件是 **星闪悦动 HUB 桌面端驱动** 的作业手册：接手 → 改代码 → 构建 → **交付成品** → 验收 → 归档。  
> 🚀 **全局版本发版与自动化更新最高规范** 详见根目录：**[`UPDATE_WORKFLOW_RULES.md`](../UPDATE_WORKFLOW_RULES.md)**。
> 配套文档见 [`PROJECT_AI_SPEC.md`](./PROJECT_AI_SPEC.md)（架构规约）、[`SDK标准.md`](./SDK标准.md)（协议铁律）、[`SKU清单.md`](./SKU清单.md)（机型矩阵）。

---

## 〇、四条最高铁律（先看这个）

| #     | 铁律                           | 说明                                                                               |
| :---- | :--------------------------- | :------------------------------------------------------------------------------- |
| **1** | **交付物 = `软件本体/` + `安装包/V<Version>/`** | 用户日常测试靠双击 `软件本体/AstraFlux-HUB.exe` 验收（必须同步热覆盖 `resources/app.asar`）；正式版本封包统一存放在 `安装包/V<Version>/` 中。 |
| **2** | **版本子文件夹标准三文件规范** | `安装包/` 目录下按版本建子文件夹（如 `安装包/V1.1.1/`），每个子文件夹内**严格包含三个文件**：`更新日志.md`、`AstraFlux-HUB_Setup_v<Version>.exe`（安装包本体）、`manifest.json`（可直接上传至云端发布工具）。 |
| **3** | **AI Agent 负责云端发布与官网更新** | 云端版本更新（GitHub Releases 页面、Gitee 页面同步）以及后续宣发官网（`docs/`）的更新全部由 AI Agent 负责执行。**严守人类确认门禁：在开发者确认无误前，严禁推送远端！** |
| **4** | **标题与型号必须强制使用「庞门正道标题体」** | 全局所有大标题（首页「我的设备」、各窗口标题）、设备卡型号（AE64-MAX等）、顶栏品牌标题必须严格生效庞门正道标题体（`font-title` / `--font-title` 首位为 `"PangMenZhengDao"`），严禁被无衬线黑体（Noto Sans）覆盖，构建前必须通过字体门禁！ |

---

## 一、项目到底是什么

### 1.1 定位

**通用外设 HUB**，不是单一型号专属驱动。

- 技术栈：**Electron 31 + React 19 + Vite 8 + Tailwind v4**，通信走 **WebHID**。
- 界面复刻 **前行者 EWEADN** 桌面端（`new-hub.eweadn.cn`），主色黑 `#1E2023`，蓝 `#3C61F2` 仅作强调。
- 支持深浅色切换（`data-theme` 机制），跟随系统 + 顶栏右上角手动切换。
- 已适配机型：**ES68（前行者破晓，68 键）**、**AE64-MAX（江湾，64 键）**、**DV63（64 键）**，另预留 M6 鼠标分支与通用兜底档案。

### 1.2 目录（中文分类，勿打乱）

```
星闪悦动驱动/
├── AstraFlux-HUB.exe - 快捷方式.lnk
├── README.md
├── UPDATE_WORKFLOW_RULES.md       # ★ 全局版本更新与自动化发版规范 (SOP)
├── 安装包/                         # ★ 官方发版归档目录 (子文件夹 V<Version>/)
│   ├── V1.1.0/                    #   标准三文件：更新日志.md、Setup安装包、manifest.json
│   └── V1.1.1/                    #   标准三文件：更新日志.md、Setup安装包、manifest.json
├── 软件本体/                      # ★ 免安装绿色版，只放可直接打开的程序文件
│   ├── AstraFlux-HUB.exe          #   双击即用
│   └── resources/
│       ├── app.asar               #   ★ 应用代码包（dist 前端 + electron 主进程）—— 每次改源码都热覆盖这里
│       └── app.asar.unpacked/     #   构建工具 .node
├── 工程源码/                      # ★ 工程本体，所有构建命令必须先 cd 进来
│   ├── src/                       #   React 源码
│   │   └── assets/fonts/          #   随包内置字体（11 个 woff2，约 7.0MB，禁引在线 CDN）
│   ├── electron/                  #   main.js / preload.js / 图标
│   ├── tools/                     #   package-release.cjs (标准三文件自动封包)、update-asar.cjs 等
│   └── dist/                      #   Vite 构建产物（asar 里装的就是它）
├── 开发者云端发布工具/              # ★ 开发者专属本地发布工具 (config.json, publish.cjs, 星闪云端发布工具.exe)
├── docs/                          # ★ 官方宣发静态页面 (由 AI Agent 自动维护更新)
├── 项目文档/                      # 架构规约、协议标准、SKU清单
└── PCB信息枚举探针/                # 硬件探针工具
```

> 根目录只应保留「一个快捷方式 + 中文分类文件夹」。

### 1.3 应用信息架构（改 UI 前必读）

```
首页 DeviceHomeView          多设备卡片平铺 + 「添加设备」虚线卡
        ↓ 点「进入驱动」
设备详情页 Device Driver View
├── 顶栏 app-titlebar        品牌 / 设备名 + 配列徽章 / 返回主页 / 连接状态 / 主题 / 设置 / 窗口控制
├── 左侧栏 sidebar           设备状态卡 + 配置导航 + 板载配置 + 底部
│   ├── 配置（6 项 nav-item）  灯光配置 · 触发配置 · 改键配置 · 高级按键 · 性能配置 · 其他设置
│   └── 板载配置（4 项）       板载 #1 竞技FPS / #2 极速敲击 / #3 日常办公 / #4 自定义
│                             → 共 10 个 .nav-item（探针的自检基线）
└── 主区                     键盘可视配列 + 右侧操作区
```

**操作区统一骨架**（照抄官网 `.lighting-main` + `.section-child-box`）：

```
.panel-operation（白底 / 圆角 20px / padding 24px）
  └── .operation-columns
        └── .col + .col + .col   ← 列之间用竖分隔线，不是三张独立白卡
```

---

## 二、设备与协议事实（写代码前必须知道）

### 2.1 机型矩阵

| 机型               | VID:PID         | 键数 | 配列   | 官方设备库                    | 备注                     |
| :--------------- | :-------------- | -: | :--- | :----------------------- | :--------------------- |
| **ES68**（前行者破晓）  | `0x1CA6:0x1C24` | 68 | 紧凑68 | ✅ 在库（`EWEADN ES68 Dawn`） | 有线，硬件 32K 方案，贯穿灯带 26 列 |
| **AE64-MAX**（江湾） | `0x1CA6:0x300D` | 64 | 左移64 | ❌ **不在库**                | 有线，单键上下双灯              |
| **DV63**         | `0x1CA6:0x7A02` | 64 | 左移64 | ❌ **不在库**                | 有线，无电池                 |
| AE61 Pro         | `0x1CA6:0x300B` |  — | —    | ❌ 不在库                    | 同主 VID 体系              |
| M6 Ultra（鼠标）     | `0x1CA6:0x7A03` |  — | —    | —                        | 分支匹配须排在 ES68 **之后**    |

> ★ **「连续快速触发」= AE64-MAX 专属**（需固件 ≥ 0.04）。能力位写在 `DEVICE_PROFILES.*.features.continuousRt`，
> 只有 AE64-MAX 为 `true`。详见第十二章。

### 2.2 官方设备库的现实

- `sparklinkDevices.js` 收录 **7 个 VID / 222 条** `VID:PID`：  
  `0x1CA6`(主) / `0x38A6` / `0x1A86` / `0x391D` / `0x371C` / `0x3806` / `0x31E3`。
- ⚠️ **覆盖不全**：`0x1CA6` 系在库里 200+ 条，但 **AE64-MAX、DV63 都没收录**。
- 所以「在不在官方库」**不能**直接当作「支不支持」的判据。

### 2.3 首页可见性：三级判定

用 `constants/deviceProfiles.js` 的 **`isSupportedSparklinkDevice(vendorId, productId)`**：

| 条件                                           | 结果                              |
| :------------------------------------------- | :------------------------------ |
| ① 精确命中官方库                                    | 可见                              |
| ② 属于主 VID `0x1CA6`（`SPARKLINK_PRIMARY_VIDS`） | 可见（覆盖 AE64-MAX / DV63 等未入库在售机型） |
| ③ 其它 VID 且未入库                                | **不可见**                         |

> ⚠️ **不要退回成 `SPARKLINK_VIDS.includes(vendorId)`**。那样会让 `0x391D:0x1A36` Dragonfly、iKF、MCHOSE 等**历史授权残留**全部冒出来，首页一团乱。

### 2.4 一台键盘 = 多个 HID 接口集合

USB 复合键盘会暴露 `MI_00/01/02/03` 多个 HID 接口集合，`navigator.hid.getDevices()` 会**把每个接口都当成一台独立设备返回**。

**必须**经 `keyboardService.normalizeDeviceList()` 处理：过滤 → 按 `vendorId:productId` 去重（留接口集合最多的那条）→ 挂上 `analyzeDeviceCapabilities` 档案 → 已知型号优先排序。

实测本机基线：**29 条原始 → ES68 ×2 + AE64-MAX ×4 + Dragonfly ×3 … → 归一化后正好 2 台**。

### 2.5 回报率：SDK 只到 8K

- `@sparklinkplayjoy/sdk-keyboard-v2` 的 `RateOfReturnList` 枚举**只到 `R8KHz`**。
- 因此**所有键盘在 UI 上都封顶 8K**，不要自己显示 16K/32K。
- ES68 硬件是 32K 方案，用 `DEVICE_PROFILES.ES68.hardRateCeiling = 32000` 单独记录，**等 SDK 放开再启用**。
- 安全边界写在 `analyzeDeviceCapabilities()` 里：`hardCeiling = baseProfile.hardRateCeiling || 8000`，超限自动截断。

### 2.6 型号匹配分支顺序（改这个函数要小心）

`analyzeDeviceCapabilities()` 里的 `if / else if` **顺序即优先级**：

```
DV63  →  ES68  →  AE64  →  M6(鼠标)  →  通用兜底
```

⚠️ **ES68 必须排在 M6 之前**，否则含 "M6" 的名字会被误判成鼠标。

---

## 三、日常迭代标准流程（七步）

```
1 定位改动点 → 2 改代码 → 3 构建 → 4 更新 app.asar → 5 数据验收 → 6 写日志 → 7 交付说明
```

### Step 1 — 定位改动点

- 先读相关模块，搞清改哪里、影响谁。
- 涉及**硬件写入** → 必须先读 [`SDK标准.md`](./SDK标准.md)，确认协议铁律。
- 涉及**设备识别 / 首页列表** → 先读本文 §2.3 / §2.4。

### Step 2 — 改代码

- 颜色/样式一律用 CSS 变量（`var(--primary-color)`、`var(--text-primary)`…），**禁止硬编码色值**，否则深浅色切换会破。
- 键帽按页面分流：**灯光页**用深色键帽 `keycap-light*`，**其余页**用浅色键帽 `keycap-lite*`。
- 新增机型 → 同步改 `deviceProfiles.js`（档案 + 匹配分支）、`sparklinkDevices.js`（如入库）、`SKU清单.md`（文档）。
- 视觉配列走 `constants/keyboardLayouts.js`，用 `resolveLayoutForProfile(profile)` 取，**不要硬编码某个型号的布局**。

#### 🅰 字体与标题体铁律（改字体/排版前必读 · 绝对红线）

🚨 **【严重警示：标题体（庞门正道）是驱动软件的核心视觉标识，严禁发生任何退化】**：
- 用户明确指示：“**标题要用标题体，这个标准要严肃写入 SOP**”。
- 历史血泪教训：曾有修改在 `src/index.css` 中误将 `--font-title` 变量修改为 `Noto Sans SC`（思源黑体），导致首页「我的设备」、卡片型号「AE64-MAX」退化回常规黑体，严重损害软件的高级电竞感与辨识度。
- **铁律规约：全局任何涉及「页面大标题」、「产品型号标识」、「窗口主标题」、「品牌标题」的元素，必须 100% 确保生效庞门正道标题体（`PangMenZhengDao`）！**

软件**完全离线**，字体一律随包内置，**禁止引用任何在线字体 CDN**。源文件在 `src/assets/fonts/`（11 个 woff2，约 7.0MB）。

| 用途 | 字体 | 授权 | 对应 CSS 变量 / Tailwind 类名 |
| :--- | :--- | :--- | :--- |
| **标题（主 / 铁律）** | **庞门正道标题体 `PangMenZhengDao`** | **作者声明（非 OFL）** | `--font-title`（首位必须是庞门）、`font-title`、`font-pangmen` |
| 标题（备） | 得意黑 `Smiley Sans Oblique` | SIL OFL 1.1 | `--font-display`、`font-display` |
| 正文 / 说明 / 小字 | 思源黑体 `Noto Sans SC` | SIL OFL 1.1 | `--font-sans`、`font-sans` |
| 数字 / 键码 / 坐标 | `JetBrains Mono` | SIL OFL 1.1 | `--font-mono`、`font-mono` |

##### 标题体（庞门正道）落地清单与防回退红线：
1. **CSS 变量声明（`src/index.css`）**：
   ```css
   --font-title: "PangMenZhengDao", "Noto Sans SC", "Source Han Sans SC", "思源黑体",
     "Alibaba PuHuiTi 3.0", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
   ```
   ⚠️ **严禁** 将 `--font-title` 开头写成 `Noto Sans SC` 或将其首项移出！
2. **Tailwind 配置同步（`tailwind.config.js`）**：
   `theme.extend.fontFamily.title` 首位必须是 `"PangMenZhengDao"`。
3. **关键 UI 标题覆盖清单**（全部强制使用庞门正道标题体）：
   - **首页大标题**（`DeviceHomeView.jsx`）：`<h1>`「我的设备」必须带有 `font-title` 类。
   - **首页设备卡型号**（`DeviceHomeView.jsx`）：`<h3>` `{modelName}`（例如 AE64-MAX、ES68）必须带有 `font-title` 和 `device-card-name` 类。
   - **首页添加设备卡**（`DeviceHomeView.jsx`）：`<h4>`「添加设备」必须带有 `font-title` 类。
   - **顶部标题栏品牌标**（`App.jsx`）：「星闪悦动 HUB」（带有 `.text-brand-gradient`，继承 `var(--font-title)`）。
   - **顶部标题栏当前型号**（`App.jsx`）：`{chipDeviceName}` 必须带有 `font-title` 类。
   - **侧栏设备状态卡型号**（`App.jsx`）：卡片第一行 `{chipDeviceName}` 与切换设备按钮文本必须带有 `font-title` 类。
   - **全局所有弹窗标题**：轴体校准（`CalibrationModal`）、添加设备（`AddDeviceModal`）、常规/消息设置（`GlobalSettingsModal`）、开发者后台（`DevLabModal`）、方案管理（`ProfileManagerTab`）所有主标题均显式带有 `font-title` 或 `modal-title` 类。
4. **验证字体是否真生效，不能只看 computed `font-family`**：
   - 用 `tools/dump-font.cjs` 的 canvas `measureText` 实测渲染宽度：「星闪悦动」在庞门正道下为 147.2px、系统兜底为 160px、思源黑体为 154px。
   - **宽度必须为 147.2px 才证明字形真正由庞门正道渲染！相同则说明字体未命中！**
5. **字体声明技术细节**：
   - ⚠️ 庞门正道只有 Regular 一个字重，`@font-face` 里声明成 `font-weight: 100 900`（或 `400 700`），让标题上的 `font-bold` 复用同一份字形，避免浏览器合成伪粗把方正的字形拉糊。
   - ⚠️ 改字体栈时 **`tailwind.config.js` 的 `fontFamily.sans/title/mono` 必须同步改**，否则工具类会走另一套。
   - ❌ **不要放 `public/fonts/`**：`vite.config.js` 里 `base: './'`，运行时页面 URL 是 `.../app.asar/dist/index.html`，`public/` 的相对路径会解析到不存在的 `.../app.asar/fonts/`。走 `src/assets/fonts/` 让 Vite 生成哈希资产。

#### 🅲 字号规范（第十九轮整体上调一档）

- 用户反馈「有些地方文字还是太小了」。原字号在 1380×880 下偏小 —— 面板里大量 7.5px / 9px / 10px / 11px。
- **`text-[Npx]` 字面量统一映射**（共 129 处）：
  `7→9 · 7.5→10 · 8→10 · 9→10 · 9.5→11 · 10→11 · 11→12 · 12→13 · 13→14`。
  唯一例外：首页设备卡那个 42px 的 `SparkLink` 装饰水印。
- **`--text-*` 变量同步上调**：`--text-h1 18→20` · `--text-h2 16→17` · `--text-h3 14→15` ·
  `--text-body 14（不变）` · `--text-caption 12→13`。
- ⚠️ **改字号 = 布局重新洗牌**。字号一旦改动，**必须**重跑 `scan-layout.cjs` 的
  **1100×700 与 1380×880 两个尺寸** + `dump-late-mount.cjs`。

#### 🅱 窄窗口布局（用户报过「UI 挤在一块 / 重叠」）

- 窗口最小 **1100×700**，默认 1380×880。**改完布局必须两个尺寸都扫**（`tools/scan-layout.cjs`）。
- 键盘可视化 **1u 尺寸不能写死**：ES68 每行 16u，写死 52px 会宽 826px 撑爆白卡。
  现用 `ResizeObserver` 实测容器宽度反算 `kbUnit`（30~52px），键高 `kbUnit * 0.885`。
- 🚨 **观察器必须用「回调 ref」，不能用 `useRef` + `useEffect`**（第十九轮血泪教训）：
  键盘卡片只在 `activeTab ∉ {performance, settings}` 时渲染，App 启动在首页时它**根本不在 DOM 里**。
  旧写法 `const ref = useRef(null); useEffect(() => {...}, [ACTIVE_LAYOUT])` ——
  首次 commit 时 `ref.current === null` 直接 return，**`ResizeObserver` 永远没挂上**；
  之后用户走「首页 → 点设备 → 切到触发配置」时键盘是**晚挂载**的，于是永远停在初始 1u。
  实测 1100 宽下 unit 恒为 52、底板 774px、容器内宽 656px → **左右各戳出 58px**，压住左侧栏与右侧快捷栏。
  正解：`const ref = useCallback((el) => {...}, [ACTIVE_LAYOUT])` —— 在元素挂载那一刻接上观察器、
  立刻 `recalc()` 一次，再补 `window.addEventListener('resize', recalc)` 兜底；
  初始 `kbUnit` 取 **`KB_UNIT_MIN`（30）**：宁可偏小，绝不戳出去。
  修复后实测 1100 → unit 41 / OVERFLOW −5；1200 → unit 47 / OVERFLOW −8；1380 → unit 52 / OVERFLOW −110。
- ⚠️ 验收这条修复**必须用 `tools/dump-late-mount.cjs`**（走真实路径）。
  直接用 URL 进 `?tab=trigger` 时键盘首次 commit 就在 DOM 里，**测不出这个 Bug**。
- 「左文 + 右按钮组」的标题行 / 提示行要成对保护：左组 `min-w-0 flex-1` + 文本 `truncate`，
  右组 `shrink-0`，容器加 `gap-3`。否则长文案（如「ES68 磁轴物理触发行程与RT状态 (68-Key Layout)」）
  会把右侧按钮挤出去 —— 即用户说的「**没有让位留空**」。
- ⚠️ **CSS 断点是 1024**：1100 宽时 `lg:flex-row` 已生效，但内容区只剩 ~880px、多列面板每列仅 ~240px。
  凡是「左文 + 右按钮组」一行排布的卡片都要加 `flex-wrap`，否则 `flex-1` 会把左侧压到内容宽度以下，
  `shrink-0` 的徽章就会「溢出」压到按钮上（实测 AP 轴体卡重叠 30.6×13.3px）。
- `.app-content` **必须是 `overflow-y: auto`**，不能是 `hidden`：1100×700 下「高级按键」页内容比可用高度高 ~80px，
  写成 hidden 会把底部按钮直接裁掉且无法滚动。

#### 🅳 竖向行程滑块（第二十轮新增，`VerticalTravelSlider.jsx`）

- **用户原话**：「滑轨条不直观，竖着展示行程的拖动条怎么能是横着的，也要竖起来」。
  触发设置页原来左边竖着一根行程柱、右边却横着一根 `input[type=range]` —— 表意打架。
  现参考前行者官网「设置触发键程」改成：**一列刻度数字 + 一根竖向柱体（填充到当前行程）+ 跟随的数值气泡（带铅笔图标）**。
- **文件**：组件 `src/components/VerticalTravelSlider.jsx`，样式 `src/index.css` 里的 `.vtravel*` 一整块。
- ❌ **不要用 `<input type="range">` 竖过来**：要靠 `writing-mode` / `direction` / `-webkit-appearance`
  的版本相关写法，Electron 打包后表现不稳；且官方样式是「柱体 + 刻度数字 + 气泡」，不是细轨道 + 圆点 thumb。
- ✅ **自绘 + Pointer Events**，四个必须点：
  1. `pointerdown` 里 `e.currentTarget.setPointerCapture(e.pointerId)`（配 `try/catch`，失败不算致命）；
  2. `clientY` 反推：`value = (1 − (clientY − rect.top) / rect.height) × max` —— **底=0、顶=max**，别写反；
  3. CSS 加 `touch-action: none`，否则触屏上会抢走滚动手势；
  4. **拖拽中必须禁用过渡**（`.vtravel-track.dragging .vtravel-fill { transition: none; }` +
     `.vtravel-col:has(.dragging) .vtravel-bubble { transition: none; }`），否则气泡会「追」指针、手感发黏。
- 刻度/填充/气泡全部用 **百分比绝对定位**（`bottom: X%`），柱体高度由 `height` prop 决定 → 换任意轴体行程都自适应。
  主刻度 `tickStep = 0.5`（带数字），次刻度 `minorStep = 0.25`（只画短线），
  **落在主刻度上的次刻度要 `continue` 跳过**（`Math.abs(k - Math.round(k)) < 1e-6`），否则会画出双线。
- **无障碍不能省**：`role="slider"` + `tabIndex={0}` + `aria-valuemin/max/now/valuetext` + `aria-label`；
  键盘 `↑↓←→` 微调 `step`、`Shift` 加速到 0.1mm、`Home`→min、`End`→max、`PageUp/Down` ±0.1。
- 当前用法（触发页 AP 卡）：`<VerticalTravelSlider value={actuationPoint} max={currentAxis.maxTravel} min={0.05} step={0.01} height={168} />`。
- ⚠️ **范围边界（用户 2026-10-13 明确拍的板）**：**只有 AP 这一根竖起来**。
  RT 的「按下灵敏度 / 抬起灵敏度」和狂暴模式的「按下/抬起死区」**继续用横向 `input[type=range]`** ——
  问过用户，用户选择「就保持现在这样」。**别再自作主张把它们也改成竖向。**
- ⚠️ 验收必须跑 `tools/dump-vslider.cjs`（结构与真实拖拽双段）。

### Step 3 — 构建

```bash
cd 工程源码
node node_modules/vite/bin/vite.js build          # 等价于 npm run build
```

- 必须看到 `✓ built`，不能留编译错误。
- 产物落在 `工程源码/dist/`（`index.html` + `assets/index-*.js|css`）。

### Step 4 — 更新软件本体（**关键，别漏**）

见第四章。做完这一步用户才能打开新版。

### Step 5 — 数据验收

见第五章。**不出截图**。

### Step 6 — 写日志

- 追加 `.workbuddy/memory/YYYY-MM-DD.md`（本轮流水）。
- 有版本级价值 → 同步 `项目文档/开发日志.md` / `更新迭代.md`。

### Step 7 — 交付说明

一句话讲清：**成品在哪（`软件本体/星闪悦动HUB.exe`）+ 这次改了什么 + 数据验收结果**。

---

## 四、构建与交付：原地覆盖 `app.asar`

### 4.1 为什么不能直接替换 exe

`软件本体/` 是**保留 Electron 运行时壳、只替换内部代码包**的绿色版结构。要改的东西全在 `resources/app.asar` 里。

> ❌ **历史上的 `npm run dist`（electron-builder → NSIS/portable）已不是交付路径。**  
> `package.json` 里的 `build.directories.output = "release-v4"`、`app-builder-lib` 补丁、`release-v5/v6` 递增目录那一套全是历史包袱 —— 它正是当年产出 7 个残留构建目录、以及 `.asar` 被句柄锁死的根源。**除非用户明确要求出安装包，否则不要跑它。**

### 4.2 ⚠️ `app.asar` 会被文件锁

| 操作                             | 结果                                          |
| :----------------------------- | :------------------------------------------ |
| 读取 / **写入**（`r+b`）             | ✅ 可以                                        |
| 同目录新建文件、改名 `app.asar.unpacked` | ✅ 可以                                        |
| **改名 / 删除 `app.asar`**         | ❌ `WinError 32` / `Device or resource busy` |
| 改名父目录 `resources/`、`软件本体/`     | ❌ `Permission denied`                       |

- **规律**：凡是被访问过的 `.asar` 都会被不带 `FILE_SHARE_DELETE` 的句柄锁住 —— 只挡改名与删除，**不挡读写**。
- 这解释了为什么那些残留构建目录删不掉。

### 4.3 ❌ 已证伪：`resources/app/` 目录覆盖法

曾试过放置 `resources/app/package.json` + 探针脚本并启动 —— **探针完全没被执行**。  
Electron 的加载顺序是 **`app.asar` 优先于 `resources/app/`**。此路不通，**不要再试**。

### 4.4 ✅ 正确姿势：解包 → 替换 → 重打包 → 原地覆盖

```bash
cd 工程源码

# 0) 构建最新前端
node node_modules/vite/bin/vite.js build

# 1) 解出现有 app.asar
node node_modules/@electron/asar/bin/asar.js extract \
  "../软件本体/resources/app.asar" .asar-tmp/app_orig

# 2) 只替换变化的部分（通常只有 dist/）
/usr/bin/rm -rf .asar-tmp/app_orig/dist && cp -r dist .asar-tmp/app_orig/dist
#    electron/*.js 若也改了，一并 cp 覆盖

# 3) 重新打包（.node 保持 unpacked，与现有 app.asar.unpacked 对齐）
node node_modules/@electron/asar/bin/asar.js pack \
  .asar-tmp/app_orig .asar-tmp/app_new.asar --unpack "*.node"
```

```python
# 4) 原地覆盖（关键：r+b 打开 + truncate，绝不能 rm/mv）
import hashlib
src = r'D:\desk\星闪悦动驱动\工程源码\.asar-tmp\app_new.asar'
dst = r'D:\desk\星闪悦动驱动\软件本体\resources\app.asar'
data = open(src, 'rb').read()
f = open(dst, 'r+b'); f.seek(0); f.write(data); f.truncate(); f.close()
print('MATCH' if hashlib.md5(open(dst,'rb').read()).hexdigest() == hashlib.md5(data).hexdigest() else 'MISMATCH')
```

```bash
# 5) 清临时目录
/usr/bin/rm -rf 工程源码/.asar-tmp
```

**要点**

- 中间产物放 `.asar-tmp/`，**别放项目根目录**（放根目录会被句柄锁住，删不掉）。
- 字节数变化（如 `45056270 → 45057756`）是正常的，只要 MD5 写入前后一致即可。
- 版本流水记在 [`软件本体更新说明.md`](./软件本体更新说明.md)。

### 4.5 官方版本发布与安装包封包规范 (Standard Packaging)

> 详细规范与执行流水线见根目录：[`UPDATE_WORKFLOW_RULES.md`](../UPDATE_WORKFLOW_RULES.md)。

当收到用户“更新”、“发版”指令时，必须按以下标准闭环流程执行：
1. **先做版本迭代，确认版本号**：
   - 递增版本号：小版本修复递增末位（如 `V1.1.0` ➔ `V1.1.1`），大版本更新递增中间位（如 `V1.1.x` ➔ `V1.2.0`）。
   - 在对话中明确向开发者告知确认本次目标版本号。
2. **全量配置与源码同步**：
   - 同步 `package.json`、`updaterService.js`、`GlobalSettingsModal.jsx`、`开发者云端发布工具/config.json` 等。
3. **前端构建与 asar 热覆盖**：
   ```bash
   cd 工程源码
   npm run build
   npm run repack
   ```
4. **运行标准三文件封包工具**：
   ```bash
   npm run release:pack
   ```
   自动在根目录 `安装包/` 下按版本创建子文件夹 `安装包/V<Version>/`，并**严格产出且仅包含标准三文件**：
   - 📄 **`更新日志.md`**：记录版本详细改动、发布日期与文件哈希。
   - 💿 **`AstraFlux-HUB_Setup_v<Version>.exe`**：软件安装包本体（独立安装向导）。
   - 🌐 **`manifest.json`**：更新清单，能直接上传/导入到开发者云端发布工具。
5. **AI Agent 执行宣发官网与云端发版**：
   - AI Agent 自动更新宣发官网（`docs/index.html`）与项目根目录 `README.md` 中的版本号、文件体积与哈希。
   - AI Agent 负责 GitHub Releases 页面、Gitee 页面同步与云端发布工具执行。
   - 🛑 **人类确认门禁绝对红线**：封包完成后必须向开发者汇报并等待本地测试验收，在开发者确认无误前，严禁执行 `git push` 或推送网络发版！

---

## 五、验收：数据探针（不出截图）

> 用户要求：**不产出界面截图，只要成品软件**。旧抓图工具（`tools/shot.cjs` / `cdp_shot.cjs` / `cdp_nav.cjs` / `cdp_es68.cjs` / `debug-tab.cjs`）**保留但已停用**。

### 5.1 ⚠️ 启动与探针必须写在同一行

后台启动的 exe 会**随命令结束被回收**，分两条命令跑必然 `ECONNREFUSED`。

```bash
cd 软件本体 && (env -u ELECTRON_RUN_AS_NODE ./星闪悦动HUB.exe \
  --remote-debugging-port=9333 --no-sandbox --disable-gpu --disable-software-rasterizer >/dev/null 2>&1 &) ; sleep 9
cd ../工程源码 && node tools/dump-home.cjs http://127.0.0.1:9333
```

### 5.2 十二个探针

| 探针 | 作用 |
| :--- | :--- |
| `tools/dump-hid.cjs [cdpBase]` | 真机 `navigator.hid.getDevices()` **原始枚举**回显（查重复 / 查 VID:PID） |
| `tools/dump-home.cjs [cdpBase]` | **首页**：卡片名、`已接入 N 台` 文案、配列徽章、bundle 指纹 |
| `tools/dump-home.cjs [cdpBase] "<query>"` | **驱动页**：`hasSidebar` / `navItems` / `opPanelRadius` / keycap 分布 / 标题键数 |
| `tools/dump-layout.cjs [cdpBase] "<query>" [WxH]` | **布局几何**：关键容器包围盒 / 越界 bleeds / 溢出 overflow / 同级实心块重叠 / 键帽内容挤压 / **`kbDiag` 键盘专项诊断** / **`rawOverlaps` 原始矩形重叠（与可见盒版交叉验证）**。`WxH`（如 `1100x700`）用 `Emulation.setDeviceMetricsOverride` 模拟视口；不传则用真实窗口 |
| `tools/scan-layout.cjs [cdpBase] [WxH] [tab,tab…]` | **批量扫页**：6 个标签页 + 首页 + DV63 档案一次跑完，输出「重叠 N 处 / 键帽挤压 N 处」汇总。第 3 参可只跑指定页，如 `advanced,keybinds` |
| **`tools/dump-struct.cjs [cdpBase] [WxH]`** | **操作区结构统一性（必跑）**：8 个页面逐页报「是否 `.panel-operation` / `.col` 数 / 各列宽·高 / 列右边缘相对面板内边距是否越界 / 列内容是否横向溢出」。**凡改动任何 `*Tab.jsx` 的根容器，必须跑它** —— 它是「UI 显示错位」这类报障的正面回归。 |
| **`tools/dump-line.cjs [cdpBase] [viewQuery]`** | **竖分隔线可见度（像素级，仲裁用）**：按 clip 抓分隔线那一窄条 22×30 → 自解 PNG → 逐列平均 RGB + 相对面板底色的真实对比度 → 用 WCAG 非文本元素 **1.5:1** 门槛判定「肉眼可辨 / 几乎不可见」。**当视觉模型说「看不到分隔线」时用它仲裁**（模型对 1px 细线极不可靠）。 |
| `tools/dump-font.cjs [cdpBase] "<query>"` | **字体**：FontFaceSet 注册了哪些字体、`document.fonts.check()`、CSS 变量实际值、关键元素 computed `font-family`、**canvas `measureText` 实测渲染宽度（证明字形真的命中）**、全页命中统计 |
| `tools/dump-calibrate.cjs [cdpBase] [profile] [机型]` | **校准弹窗 / 触发子页**：子标签是否恰为 3 个、页面是否残留已删的「校准设置」、点「校准」后弹窗是否打开、标题是否命中标题体、进度分母是否等于弹窗实际渲染键帽数 |
| **`tools/dump-late-mount.cjs [cdpBase]`** | **键盘「晚挂载」复现（必跑）**：先 `tab=performance`（该页不渲染键盘）→ 再点侧栏「触发配置」→ 在 1100 / 1200 / 1380 三个宽度下量键盘底板是否溢出。**凡改动键盘区布局或 1u 自适应逻辑，必须跑它。** |
| **`tools/dump-vslider.cjs [cdpBase] [search]`** | **竖向行程滑块（`.vtravel`）结构与交互（必跑）**：A 段读 DOM（柱体包围盒 / 填充比例 / 气泡文本与跟随 / 主次刻度 / `role` / `aria-*` 三件套）；B 段**真实拖拽** —— 先用 CDP `Input.dispatchMouseEvent` 按住拖到 75% 高度，再用页面内合成 `PointerEvent` 走一遍，两条路径分别判定，最后对比 `aria-valuenow` 与 `max × 0.75`。**凡改动 `VerticalTravelSlider.jsx` / `.vtravel*` CSS / 触发页 AP 卡，必须跑它。** |

| **`tools/dump-continuous.cjs [cdpBase]`** | **「连续快速触发」机型门控（必跑）**：逐页 `?tab=trigger&profile=<P>` 验证 **AE64_MAX 有、ES68 / DV63 无**；判定 `行数量 / 开关 checked / aria-label / 固件徽章 / 说明文字 / 底部状态文案`。**凡改动触发页 RT 列或 `deviceProfiles.js` 的 `features.continuousRt`，必须跑它。** |

驱动页 query 形如 `view=device&tab=trigger&profile=es68`（内置调试入口，无硬件也能进）。

> ⚠️ **URL 显式指定 `profile=` 时会锁定档案**（第二十三轮修正）。
> 从前的 `App.jsx` 里 `keyboardService.subscribe` 回调是**无条件** `setDeviceProfile(state.profile)` —— 设备服务一上报就把 URL 指定的机型顶掉。
> 本机同时插着 ES68 与 AE64-MAX 时，探针测到的到底是哪个档，**全看谁后上报**。
> 第二十三轮实测过：「URL 写 `AE64_MAX`，运行时实际是 `es68`」，直接导致机型门控探针假阴性。
> 现在 `App.jsx` 用 `FORCED_PROFILE_KEY` / `PROFILE_LOCKED` 判断：**URL 显式指定即锁定，设备上报不再覆盖**。
> → 各类探针里 `profile=` 现在是**可信**的；不带 `profile=` 时才跟随真实设备。
`dump-layout.cjs` 同时导出 `dumpLayout({base, search, viewport})` 供 `scan-layout.cjs` 直接 `require`
（沙箱里 `node.exe` **不能 spawn 自己**，会 `EBUSY`）。

### 5.3 布局与字体的自检基线

```bash
cd 软件本体 && (env -u ELECTRON_RUN_AS_NODE ./星闪悦动HUB.exe \
  --remote-debugging-port=9333 --no-sandbox --disable-gpu --disable-software-rasterizer >/dev/null 2>&1 &) ; sleep 11
cd ../工程源码
node tools/scan-layout.cjs      http://127.0.0.1:9333 1100x700    # 期望：全部通过（0 重叠 / 0 键帽挤压）
node tools/scan-layout.cjs      http://127.0.0.1:9333 1380x880    # 期望：全部通过
node tools/dump-struct.cjs      http://127.0.0.1:9333 1380x880    # 期望：8 页全 ✅、越界 0、内容溢出 ✅
node tools/dump-struct.cjs      http://127.0.0.1:9333 1100x700    # 期望：同上（最窄窗口也要过）
node tools/dump-line.cjs        http://127.0.0.1:9333 "view=device&tab=advanced&profile=es68"   # 期望：≥ 1.5:1
node tools/dump-late-mount.cjs  http://127.0.0.1:9333             # 期望：三宽度 OVERFLOW 全 ≤ 0
node tools/dump-vslider.cjs     http://127.0.0.1:9333             # 期望：结构 9 项全 ✅ + 拖拽后 aria-valuenow ≈ max×0.75
node tools/dump-continuous.cjs  http://127.0.0.1:9333             # 期望：AE64_MAX 有 / ES68 无 / DV63 无 → 3 机型门控全 ✅
node tools/dump-font.cjs        http://127.0.0.1:9333 "view=device&tab=trigger&profile=es68"
```

| 检查项 | 期望值 |
| :--- | :--- |
| `scan-layout` 重叠 | **0 处**（`overlapCount`） |
| `scan-layout` 键帽挤压 | **0 处**（`keycapSqueezeCount`） |
| `scan-layout` 越界 | **0 个**（`bleeds.length`） |
| `scan-layout` 滚动 | 内容超出时 `overflowY=auto` → **可滚动**；出现「会被裁掉 ⛔」即为 bug |
| **`dump-struct` 结构** | **8 个页面全部 `.panel-operation` ✅**（不得有任何一页退化成裸 grid + 独立圆角卡） |
| **`dump-struct` 越界** | 每页「越界」必须 **≤ 1px**（列右边缘越过面板内边距 = 被 `overflow:hidden` 裁掉）；「内容溢出」必须 ✅ |
| **`dump-line` 对比度** | 竖分隔线相对面板底色 **≥ 1.5:1**（WCAG 非文本元素门槛）。低于此值 = 肉眼读成「三块各自独立的卡片」 |
| **`dump-late-mount` 溢出** | 1100 / 1200 / 1380 下 **`OVERFLOW ≤ 0`**，且 `leftGap` / `rightGap` 均 ≥ 0 |
| `dump-font` FontFace | **恰好 11 个**（Noto Sans SC ×6 / **PangMenZhengDao ×1** / Smiley Sans ×1 / JetBrains Mono ×3），**不得有任何 Google CDN 来源** |
| `dump-font` 命中 | `body/h3/button/input` → `"Noto Sans SC"` 打头；`h1`、`.text-brand-gradient`、`.device-card-name`、`.page-title`、`.section-title` → **`"PangMenZhengDao"` 打头** |
| **`dump-font` 实测宽度** | 「星闪悦动」在庞门正道下与系统兜底**宽度必须不同**（当前 147.2 vs 160）—— 相同即说明字体没真正生效 |
| `dump-calibrate` 子标签 | 恰为 `["触发设置","死区设置","轴体设置"]`，**不得出现「校准设置」** |
| `dump-calibrate` 弹窗 | 标题「轴体校准」命中标题体；进度分母 == 弹窗实际渲染键帽数（ES68 → 68，AE64-MAX/DV63 → 64） |
| **`dump-vslider` 结构** | 柱体宽 ≥ 28px、高 == 组件 `height`（当前 168）· `role="slider"` · `tabIndex=0` · `aria-valuenow/max/valuetext` 三件套齐全 · 主刻度 ≥ 5 且首项 `"0.00"` · 次刻度 ≥ 1 · 气泡带铅笔图标且 `style.bottom` 与填充比例误差 < 1% |
| **`dump-vslider` 交互** | 拖到 75% 高度后 `aria-valuenow ≈ max × 0.75`（误差 < 0.15mm）。**B1（CDP 真实鼠标）与 B2（合成 PointerEvent）必须至少一条通过**；两条都不过 = 组件指针事件接线坏了 |
| **`dump-continuous` 门控** | **AE64-MAX 有（行数 == 1、开关 `checked`、aria-label `连续快速触发`、徽章 `固件 ≥ 0.04`、底部状态 `连续快速触发 已开启`）**；**ES68 / DV63 无（行数 == 0）**。任一不符 = 机型能力位 `features.continuousRt` 写错或触发页判断漏了 |

> ⚠️ **重叠判定必须用「可见盒」**（`dump-layout.cjs` 里的 `visibleBox()`）：滚动容器里被滚出可视区的内容
> `getBoundingClientRect()` 仍返回原始布局位置，直接用原始矩形会大量误报（曾误报改键页 32 处 / 高级页 2 处）。
>
> 🚨 **探针必须走「真实用户路径」，不能只会 `Page.navigate` 到目标页**（第十九轮的血泪教训）：
> 键盘卡片只在 `activeTab ∉ {performance, settings}` 时渲染，App 启动在首页时它**根本不在 DOM 里**。
> 前几轮所有探针都直接导航到 `?tab=trigger`，键盘首次 commit 就在，
> 于是**永远测不出**「晚挂载导致观察器没接上、1u 停在 52px、底板戳出压住左右侧栏」这个 Bug ——
> 直到改用 `dump-late-mount.cjs`（先 `tab=performance` 再点侧栏「触发配置」）才复现。
> **结论：任何依赖「元素挂载后再测量」的功能，验收都必须覆盖「晚挂载」这条路径。**
>
> ⚠️ **CDP 派发的鼠标事件要经过命中测试 —— 目标元素必须先滚进视口中央**（第二十轮的假阴性）：
> 第一版 `dump-vslider` 直接拿 `getBoundingClientRect()` 的坐标去 `Input.dispatchMouseEvent`，
> 而触发页 AP 卡在滚动容器里、柱体当时 `top=670`，派出去的坐标没打中柱体，
> 于是「拖拽后 `aria-valuenow` 纹丝不动」，**被误判成「组件交互坏了」**，白查了一轮。
> 正解：读几何前先 `el.scrollIntoView({ block: 'center' })`，并把 `inViewport` 一并回显；
> 同时**并行**用页面内合成 `PointerEvent` 走一遍（绕过命中测试，只验 React 的 `onPointerDown/Move/Up` 接线）。
> **两条路径分开报结果**：B1 过 B2 不过 = 元素在视口外（探针问题）；两条都不过 = 组件真有问题。

### 5.4 自检基线（首页 / 驱动页）

| 检查项                 | 期望值                                         |
| :------------------ | :------------------------------------------ |
| 首页卡片                | 恰为 **`["ES68", "AE64-MAX"]`**，各一张（本机 2 台设备） |
| 首页文案                | `已接入 2 台官方星闪方案外设`                           |
| 驱动页 `hasSidebar`    | `true`                                      |
| 驱动页 `navItems`      | `10`（6 配置 + 4 板载）                           |
| 驱动页 `opPanelRadius` | `"20px"`                                    |
| 驱动页 keycap 总数       | 与配列一致（ES68 = 68 / AE64-MAX·DV63 = 64）       |
| `bundle`            | 指向新建的 `./assets/index-*.js` ← **证明新包已生效**   |
| console             | 出现 `授权设备枚举: 原始 29 条 → 归一化 2 台`              |

```
[SparkLink HID] 扫描到的设备列表: …
[SparkLink HID] 正在初始化设备 ID: …
[SparkLink HID] 设备矩阵坐标已同步 (官方 getKeyLayoutStyle)   ← 关键！出现=坐标对上了
[SparkLink HID] 已从键盘回读触发参数同步 UI (KeyW {"row":1,"col":2}): {…}
```

❌ 若出现「设备矩阵键数与视觉布局不一致 … 回落视觉坐标」→ 矩阵读取失败，检查 `getKeyMatrix` 的**逐行读取**逻辑（见 `SDK标准.md`）。

---

## 六、沙箱环境铁律

| #  | 规则                                                                 | 原因                                                               |
| :- | :----------------------------------------------------------------- | :--------------------------------------------------------------- |
| 1  | **真实删除用绝对路径 `/usr/bin/rm`**                                        | `rm` 被 `node-safe-delete-shim` 劫持转发 `genie-trash`，中文路径必败         |
| 2  | **PowerShell 工具不回显 stdout**                                        | 结果必须 `Out-File` 到文件再 `Read`                                      |
| 3  | **被安全策略禁用**                                                        | `schtasks.exe`、`Add-Type`、`WScript.Shell` COM、Bash 内调 PowerShell |
| 4  | **跑 Electron 必须 `env -u ELECTRON_RUN_AS_NODE`**                    | 否则报 `Cannot read properties of undefined (reading 'whenReady')`  |
| 5  | **必须带 `--no-sandbox --disable-gpu --disable-software-rasterizer`** | 否则 GPU 进程崩 `exit_code=-1073741819` + `FATAL`                     |
| 6  | **启动 exe 与探针同一条命令**                                                | 后台进程随命令结束被回收                                                     |


| 7 | **改了 `src/` 但软件没变化** | Electron 加载的是 `dist/`（asar 内），先 build 再覆盖 asar |

---

## 七、红线速查

### 7.1 交互与 UI 红线

1. **禁绝原生 `alert()` / `confirm()`** —— 统一 `useToast()` 顶部气泡，自动去重且防遮挡。
2. **颜色一律走 CSS 变量**，硬编码色值会破深浅色切换。
3. **灯光页深黑 RGB 键盘，其它页常规键帽** —— 灯光底板不随主题变浅。
4. 键帽类名分流：灯光页 `keycap-light*`，其余页 `keycap-lite*`。
5. **竖向行程量必须用竖向滑轨**（触发页 AP 卡 → `VerticalTravelSlider`），
   横向行程量保持横向 `input[type=range]`（RT 灵敏度、狂暴模式死区）。
   用户拍过板：「就保持现在这样」，**别把 RT / 死区也竖起来**。详见 Step 2 的 🅳。
6. **标签页操作区一律用标准结构**（`.panel-operation > .operation-columns > .col`），
   **严禁**裸 grid/flex + 每张卡自带 `bg + border + rounded-2xl + shadow`。
   改任何 `*Tab.jsx` 根容器后必须跑 `tools/dump-struct.cjs`。详见第十一章。

### 7.2 设备真实性红线

1. **有机器型一律为纯 USB 有线（ES68 / AE64-MAX / DV63 均无电池）** —— **严禁**渲染电池图标、电量百分比、无线假状态。统一标 `USB 8KHz` / `USB 极速有线`。
2. **回报率 UI 封顶 8K**（SDK 只枚举到 `R8KHz`），**严禁**自行显示 16K/32K。
3. 轴体默认值按机型：**ES68 = 磁玉 Pro**，**DV63 = 马轴**；AE64-MAX 以云端轴体库（`getAxisListV3`）动态拉取为准。
4. **一台设备一条记录** —— 首页必须经过 `normalizeDeviceList()` 去重，严禁把 HID 子接口当多台设备平铺。

### 7.3 高级按键

**允许全部删除**（逐条或一键清空），**严禁**弹「至少保留一组」的拦截弹窗。

### 7.4 SDK 写入铁律（违反即写不进去 / 断电丢失）

1. **硬件矩阵坐标 ≠ 视觉坐标** —— 必须用 `getKeyLayoutStyle` 逐行读真实矩阵。
2. **写完必须 `GFSParamSave`** 提交闪存（`Performance` / `Layout` / `HigherKey` 分类）。
3. **批量写用 `Promise.all` 并发**，逐键串行会卡死 UI。
4. **RT 开关 = `performance.mode` 1/0**，没有独立字段。
5. **读写合并（Read-Modify-Write）**，避免覆盖其他参数。
6. 写入失败要**诚实报错**，不许假成功。

---

## 八、文档与记忆维护地图

| 场景 | 写到哪 |
| :--- | :--- |
| 每次迭代流水 | `.workbuddy/memory/YYYY-MM-DD.md`（追加，不覆盖） |
| 跨会话长期铁律 / 机型事实 | `.workbuddy/memory/MEMORY.md` |
| 版本级变更 | `项目文档/更新迭代.md` |
| 逐轮技术决策归档 | `项目文档/开发日志.md` |
| 新增机型 / 协议 | `项目文档/SKU清单.md` / `项目文档/SDK标准.md` |
| `app.asar` 大小与 md5 流水 | `项目文档/软件本体更新说明.md` |
| 跨项目个人偏好 | `~/.workbuddy/user-*/MEMORY.md` |

> 新增文档统一放 `项目文档/`，**不要再造 `docs/` 目录**。

---

## 九、故障速查

| 症状 | 首选排查方向 |
| :--- | :--- |
| 首页出现一堆重复 / 杂乱设备 | `normalizeDeviceList()` 是否生效；可见性是否误用了 `SPARKLINK_VIDS.includes()` |
| 设备连不上 | 主 VID 是否 `0x1CA6`；`electron/main.js` 的 `select-hid-device` VID 列表是否同步；官方库是否漏收该型号 |
| 键数显示不对（如 67/63） | 视觉配列定义漏键（`keyboardLayouts.js`），核对各行键数与总键数 |
| 设置写入失败 | 是否漏 `GFSParamSave`；坐标是否用了视觉坐标而非硬件矩阵坐标 |
| 灯光键位错位 | `setCustomKeyLighting` 收到的是否为硬件矩阵坐标 |
| UI 卡死 | 批量写入是否用了 `Promise.all` |
| 深浅色显示异常 | 是否硬编码色值 |
| 整页白屏 | CDP 看 console 报错（多为组件内悬空引用 / 未定义 state） |
| `app.asar` 改不了名/删不掉 | 正常现象 —— 用原地覆盖，别改名删除 |
| 探针 `ECONNREFUSED` | 启动 exe 与探针没写在同一条命令；exe 启动耗时不稳定 → **必须用轮询等 CDP 就绪**，别写死 `sleep` |
| **`?profile=` 探针结果随机漂移**（同一机型两次跑出不同答案） | **设备上报顶掉了 URL 指定档**（第二十三轮）。本机同时插着 ES68 与 AE64-MAX 时最明显。已修：URL 显式指定 `profile=` 即 **锁定**，设备上报不再覆盖。排查手段：**CDP 读 React fiber 的 hook 链**，直接看运行时 `deviceProfile` 的真实值，别靠猜 |
| 新功能 UI 出得来但硬件没反应 | 先查该字段在**现发行版 SDK 里是否存在**（`node_modules/@sparklinkplayjoy/protocol-keyboard-v2/src/types/interface.ts`）。固定字节布局的接口只认它列出的 key，未知 key 会被静默忽略 —— 见 §12.2 |
| 改了代码软件没变 | 忘了 build，或忘了覆盖 `app.asar` |
| **node 里 `spawnSync` / `execSync` 报 `EBUSY`** | **正常现象** —— 沙箱拦所有同步子进程创建（连 `where.exe`、node 自己都起不来）。**改用异步 `spawn`**，见第十章 |
| `agy` 返回空 / `status=SUCCESS` 但 `response` 为空 | 读文件这一步被权限自动拒了。加 `--dangerously-skip-permissions`，见第十章 |

---

## 十、视觉外援：把图片交给 Antigravity CLI

> 用途：遇到「高 DPI 密集小字 / 照着官方截图 1:1 复刻 / 需要像素级比对」这类活，
> 换一双眼睛（Gemini 3.8 / Claude Opus 4.6 的视觉）交叉验证，挡掉误判。
> 注意：**这不是「本模型看不了图」的补救**，普通截图自己就能读；这是**第二意见**。

### 10.1 为什么必须走 CLI，不能走 Antigravity IDE

- Antigravity **IDE** 是纯 GUI 的 Electron 应用（`%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe`），
  **没有任何可编程入口**，无法被自动化驱动。想「联动 IDE」是死路。
- Antigravity **CLI（`agy`）** 是无头可调用的，`agy -p "<prompt>"` 就是完整能力面。
  **所以联动的前提是把 CLI 装上。**

### 10.2 安装与登录

```bash
winget install --id Google.AntigravityCLI --exact --accept-package-agreements --accept-source-agreements
```

- 安装后二进制在 `%LOCALAPPDATA%\Microsoft\WinGet\Links\agy.exe`（**符号链接**，真身在
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Google.AntigravityCLI_*_8wekyb3d8bbwe\agy.exe`）。
- **不需要 API key** —— 它继承现有 Google 登录态。装了 IDE 并登过的机器上，
  `agy models` 直接就能列出模型（配置落在 `~/.gemini/antigravity-cli/`）。
- 自检：`agy models` 有输出即已登录；`agy -p "say pong" --output-format json` 返回 `"response":"pong"` 即通路正常。

可用模型（`agy models` 的实测输出，2026-10）：

| 模型 id | 说明 |
| :--- | :--- |
| `gemini-3.8-flash-high` / `-medium` / `-low` | 默认用 `high` |
| `claude-sonnet-4-6` | 快、便宜，日常读图够用 |
| `claude-opus-4-6-thinking` | 最强，细节纠结时用 |
| `gpt-oss-120b-medium` | 备选 |

### 10.3 用法：`tools/vision.cjs`

```bash
cd 工程源码
# 基本：图片路径 + 问题
node tools/vision.cjs "../项目文档/界面预览/es68-trigger.png" "读出所有按钮上的文字"

# 多图一起问
node tools/vision.cjs a.png b.png "这两张图的差异在哪"

# 换模型 / 结构化输出
node tools/vision.cjs shot.png "滑条两端写了什么" --model claude-opus-4-6-thinking --json
```

| 选项 | 说明 |
| :--- | :--- |
| `--model <id>` | 默认 `gemini-3.8-flash-high` |
| `--effort <lvl>` | `low` / `medium` / `high` / `xhigh` / `max` |
| `--timeout <秒>` | 默认 300（同时传给 agy 的 `--print-timeout` 与本地看门狗） |
| `--raw` | 打印 agy 原始输出，排障用 |
| `--json` | 输出 `{ok, model, seconds, response, denied_actions, usage}` |

退出码：`0` 成功 · `1` 参数/前置错误 · `2` agy 失败或被拒。

耗时参考：单图 13~22 秒（`claude-sonnet-4-6` 最快，约 13s；`gemini-3.8-flash-high` 约 21s）。
**比直接读图慢两个数量级，所以只在真需要第二意见时用，不要每张图都过一遍。**

### 10.4 权限与安全边界

- agy 无头模式**无法弹权限确认框**，任何需要审批的工具都会被**静默拒绝**，
  表现为 `status=SUCCESS` 但 `response` 为空 + `denied_actions:[{"action":"command"}]`。
  → 脚本固定加 `--dangerously-skip-permissions`。
- 但**保留了 agy 默认的 sandbox**：可以读任意路径、**写入仅限 `/tmp`**。
- 并且**只把图片所在目录**用 `--add-dir` 加进 workspace，`cwd` 固定为系统临时目录 ——
  避免把项目目录整体暴露出去。

### 10.5 🚨 沙箱铁律：必须用异步 `spawn`

这个沙箱里**所有同步形式的子进程创建一律 `EBUSY`**：

| 调用形式 | 结果 |
| :--- | :--- |
| `spawnSync(...)` | ❌ `EBUSY` |
| `execSync(...)` | ❌ `EBUSY`（内部走 `cmd.exe`） |
| `spawn(...)` **异步** | ✅ 正常 |

实测连 `spawnSync('where.exe', ['agy'])` 和 `spawnSync(process.execPath, ['-p','1+1'])` 都是 `EBUSY` ——
**不是 agy 的问题，是沙箱对 node 创建子进程的限制。**

⚠️ 最坑的是它**静默失败**：`spawnSync` 出错时 `stdout` 是 `null`，
如果脚本没检查 `r.error`，就会表现成「agy 什么都没输出」，极易误判成 agy 或权限的问题（本轮就这么白查了一轮）。
**结论：新写任何调用外部程序的脚本，一律用异步 `spawn` 包成 Promise，并且必须处理 `error` 事件。**

### 10.6 🚨 交叉验证的正确姿势（第二十二轮血泪）

「我读图 + 视觉模型读图」两张眼睛对账，能抓出单一证据源抓不到的缺陷，
**但前提是得知道两张眼睛各自的失效模式**，否则会把误报当缺陷去改，越改越坏。

**（1）先用已知答案当考题。**
截图前先说清「里面有什么」，再去比对模型的输出。模型答不上已知项，它的其它结论就不可信。

**（2）先算清截图的真实窗口尺寸，再量 DOM。**
用户给的截图是 **1080×720**，而软件默认窗口是 **1380×880**（0.783 等比缩放）。
第一轮我按 1440×960 量 DOM → 得出「侧栏正常 ✅」，而模型看图说「板载 #4 被切」。
**在 1380×880 重跑后完全复现模型的结论**（`hiddenPx:20`、底部按钮交叠 177×8px）。
教训：**不看图先量 DOM，等于白量。**

**（3）视觉模型对「1px 细线 / 省略号」两件事极不可靠，必须用像素或几何仲裁。**

| 模型的判断 | 真相 | 仲裁手段 |
| :--- | :--- | :--- |
| 「三列之间看不到竖分隔线」 | 9% 不透明度确实 ≈ 不可见；提到 22% 后仍报「看不见」 | **`tools/dump-line.cjs`** 抓像素算对比度 → 1.19:1 → 1.56:1 ✅ |
| 「卡片最下方描述文字被底部边框切掉」 | 是 `truncate` 的**横向省略号**，纵向没被裁 | 量 `clientHeight vs scrollHeight` + 最深后代是否越出内容区下沿（实测越出 **0px**） |
| 「第三列内容明显偏矮、悬在半空」 | 三列容器**等高**（288/288/288），底部动作条对齐；只是内容长短不同 | `dump-misalign` 逐列报高 + `上边对齐` |

一句话：**几何探针只认「有没有」，视觉模型只认「像不像」，谁都不能单独定「是不是缺陷」；
两边的结论冲突时，去抓第三份客观数据（像素 / 对比度 / 高度差）来仲裁。**

### 10.7 把当前界面交给第二双眼睛

```bash
cd 软件本体 && (env -u ELECTRON_RUN_AS_NODE ./星闪悦动HUB.exe \
  --remote-debugging-port=9333 --no-sandbox --disable-gpu --disable-software-rasterizer >/dev/null 2>&1 &) ; sleep 10
cd ../工程源码
CDP_BASE=http://127.0.0.1:9333 node tools/vision-app.cjs "<问题>" \
  --view "view=device&tab=advanced&profile=es68" --model claude-sonnet-4-6 --timeout 300
```

- 临时 PNG **只写 `os.tmpdir()`，调用结束立刻删除**（`--keep` 才留下，排障用）。**项目目录永远不出现 png。**
- 提示词必须**收紧**：明确「最多 N 条 + 逐区域给结论 + 直接看图作答、不要反复裁剪图片 + 『正常』也要报」。
  给一个开放式「列出所有缺陷，越具体越好」→ 模型反复裁图深挖，烧掉 8.7 万 tokens / 296 秒后**撞上 300s 上限超时**。
- 模型选择：`claude-sonnet-4-6`（~20-30s，稳）；`gemini-3.8-flash-high` 容易反复裁图，慎用。

---

## 十一、操作区结构统一规约（第二十二轮定稿）

### 11.1 唯一标准结构

**除首页外，所有标签页的操作区必须长这样**（灯光 / 触发 / 死区 / 轴体 / 改键 / 高级按键 / 性能 / 设置 全部已统一）：

```jsx
<div className="panel-operation">                 {/* 白面板：宽100% · flex:1 1 0 · 圆角20 · padding24 */}
  <div className="operation-columns">             {/* 横排容器：width100% · height100% */}
    <div className="col">…</div>                  {/* flex:1 1 0 · min-width:0 · overflow:hidden auto */}
    <div className="col">…</div>                  {/* `.col + .col` 自带 1px 竖线 + padding-left24 + margin-left24 */}
  </div>
</div>
```

配套 CSS（`src/index.css`）：

```css
.panel-operation { width:100%; flex:1 1 0; min-height:0; display:flex; flex-direction:column;
                   overflow:hidden; background:var(--bg-secondary); border-radius:20px; padding:24px; box-sizing:border-box; }
.operation-columns { display:flex; width:100%; height:100%; min-height:0; }
.operation-columns > .col { flex:1 1 0; min-width:0; min-height:0; display:flex; flex-direction:column; overflow:hidden auto; }
.operation-columns > .col + .col { border-left:1px solid var(--col-divider-color); padding-left:24px; margin-left:24px; }
```

**卡片语言**：列内的卡片**不带自己的 `border` + `rounded-2xl` + `shadow`**，
融进白面板，靠 1px 竖线分隔（对应官网 `.section-child-box`）。
只允许「输入区 / 状态区」用 `bg-[var(--bg-tertiary)] + border + rounded-xl` 这种**内嵌小盒**。

### 11.2 ⚠️ `flex: 1 1 0` 不能丢

`.panel-operation` 在 `.app-content`（`flex-direction: column`）里与 `.panel-keyboard`（`flex: 0 0 50%`）同级。
`flex-basis: 0` + `flex-grow: 1` 让面板**独占剩余全部高度**。
若包成 `.panel-operation` 却写成 `flex: 0 0 auto` 之类 → 面板高度从 336 涨到 ~432、卡片从 288 涨到 564，**越改越糟**。

### 11.3 非等宽列怎么处理

标准 `.col` 是 `flex: 1 1 0`（等宽）。需要固定/加宽某列时用**内联 style 覆盖**，别改公共 CSS：

| 页面 | 写法 |
| :--- | :--- |
| 轴体设置 | 左列 `style={{ flex: '0 0 208px' }}`（原 224px，让出 `.col + .col` 多出来的 24+24+1） |
| 高级按键 | 左 `0 1 320px / minWidth 260` · 中 `1 1 340px` · 右 `0 1 240px / minWidth 210` |

**必须用 `0 1`（可收缩）而不是 `0 0`（不可收缩）**：窗口最小 1100px，两个固定列 + 98px 分隔线会把中间列挤到只剩 148px。
改成可收缩 + 给中等列 `basis 340px` 后，1380 下是 `320/488/240`、1100 下是 `269/289/210`，都不挤。

### 11.4 窗口最小尺寸 = 1100×700

`electron/main.js` 里 `minWidth: 1100, minHeight: 700`。
**注意**：`min-*` 大于 `lg`(1024) 断点 → 组件里写 `flex-col lg:flex-row` 的**竖排分支是死代码**，
可以放心换成恒定横排的 `.operation-columns`（高级按键页原来就是这么写的）。

### 11.5 列内不要留「中空」

`.col` 是 `justify-between` 时，顶部块与底部动作条会被顶到两端，中间**掏出一个空洞**（死区页原来中段空 ~80px）。
**修法**：让输入区 / 状态区 `flex-1 min-h-[88px] flex flex-col justify-center`，把空洞变成「输入区」，内容垂直居中。
底部动作条（推荐值 / 应用按钮）仍然对齐 —— 三列底部动作条必须在同一水平线上。

### 11.6 竖分隔线的颜色是**专用变量**，别用 `--line-color`

```css
--col-divider-color: var(--color-black-22);   /* 浅色主题 */
--col-divider-color: var(--color-white-22);   /* 深色主题 */
```

- `--line-color` 只有 **9% 不透明度**，白底上对比度 ≈ **1.19:1** —— 低于 WCAG 非文本元素 1.5:1 门槛，
  **肉眼读不出来**，会被当成「三块各自独立的卡片」。
- `--col-divider-color` 用 **22%** → ≈ **1.56:1** ✅。用 `tools/dump-line.cjs` 实测确认。
- `--line-color` **保留给子标签栏下划线等「越淡越好」的场景，不要直接改它**。

---

## 十二、机型能力位与「连续快速触发」（第二十三轮定稿）

### 12.1 能力位写在哪

**不要**在页面里写 `deviceProfile.id === 'AE64_MAX'` 这种散落判断。
统一收在 `src/constants/deviceProfiles.js` 的 `DEVICE_PROFILES.*.features`：

```js
// DV63 / ES68 / GENERIC_KEYBOARD
continuousRt: false,

// AE64_MAX
continuousRt: true,      // ★ AE64-MAX 专属，需固件 ≥ 0.04
```

对外只暴露两个东西：

```js
export const CONTINUOUS_RT_MIN_FIRMWARE = '0.04';
export function supportsContinuousRt(profile) { return !!profile?.features?.continuousRt; }
```

页面侧：

```jsx
const canContinuousRt = supportsContinuousRt(deviceProfile);
// …
{canContinuousRt && ( /* 那一行开关 */ )}
```

**以后官方若放开到其它机型，只改 profile 里那一个布尔值**，界面会自动出现这一行，探针也自动跟着变。

### 12.2 ⚠️ 现发行版 SDK **没有**这个协议字段（必须如实告知）

`连续快速触发` 是我们**按官方公告提前铺**的功能，链路如下：

- ✅ UI（开关 + 固件徽章 + 说明 + 底部状态文案）—— 已完成
- ✅ state + 保存下发（`...(canContinuousRt ? { continuousRt: continuousRt ? 1 : 0 } : {})`）—— 已完成
- ❌ **真正落到硬件** —— **暂时不会**

原因，三处都查过：

| 位置 | 事实 |
| :--- | :--- |
| `node_modules/@sparklinkplayjoy/protocol-keyboard-v2/src/types/interface.ts` | `IPerformanceData` 是**固定字节布局**，字段只有 `mode / normalPress / normalRelease / rtFirstTouch / rtPress / rtRelease / pressDeadStroke / releaseDeadStroke / axis / calibrate / axisV2Id / axisRangeMax / axisCoefficient`。**没有连续快速触发**。 |
| `src/pack/performance.ts` | `setPerformanceDataPack` **解构固定字段名**，未知 key 会被**静默忽略**。 |
| `GlobalFeatureSwitchConfig` 枚举 | 只有 `Config1 ~ Config4`（配置档切换），**不是这个开关**。 |

三个 SDK 包都已经是 npm 最新版（2026-08-24 发布）：
`hid@1.0.16`、`protocol-keyboard-v2@1.0.23`、`sdk-keyboard-v2@1.0.29`。

→ 所以代码里这段下发是**前瞻性的**（注释已写明）。
对外话术必须是：**「界面与下发链路已就绪，等官方 SDK 开放该字段后即刻生效」**，不说成「已支持硬件」。

### 12.3 来源

深圳江湾数码 LV100 管理员群公告（2026-10-13）：

> AE64 max 增加了一个新的功能。增加了一个连续快速触发的开关。打开后，就开始支持在 RT 行程中也连续快速触发。
> 在 0.04 版本的固件开始支持的，请 Ae64 max 用户更新固件到 0.04。

→ 结论：**AE64-MAX 专属；固件门槛 0.04；作用范围是「RT 行程中」。**
显示范围由用户在第二十三轮明确拍板：**只在 AE64-MAX 显示**。

---

## 十三、UI/UX 双主题一致性门禁规范（严禁局部割裂黑块 / 一块黑一块白）

### 13.1 核心铁律（用户最高视觉诉求）

> **「这些页面风格颜色一定要跟随软件，不要一块黑一块白的，浅色界面就都做浅色的，这些也要写入 SOP 标准里面去。」**

在全生命周期维护中，任何页面、任何弹窗、任何组件必须严格遵守双主题自适应准则：
- **浅色模式（`data-theme="light"`）**：
  全界面必须是纯粹、协调、通透的浅色系（白/浅灰底 `bg-white / bg-slate-50` + 浅边框 `border-slate-200 / border-zinc-200` + 深灰可读文本 `text-slate-800 / text-zinc-800` + 品牌蓝 `#0D5FFF` 聚焦与高亮）。
  **严禁在浅色界面中硬编码突兀的死黑块（如 `#1E2024`、`#25282F`、`#2D3035`、`bg-black/...` 等）**。
- **深色模式（`data-theme="dark"`）**：
  全界面为统一沉浸电竞暗色（深灰黑底 `bg-zinc-900 / bg-[#1E2023]` + 深色边框 `border-zinc-800` + 浅灰白字 `text-zinc-100` + 蓝发光强调）。
  **严禁深色模式下遗漏 `dark:` 适配导致白底亮瞎眼或黑字隐身**。

### 13.2 严禁触犯的四大典型反模式（Anti-Patterns）

| 禁则模块 | 错误反模式（官方 Web 驱动坏味道） | 正确规范（星闪悦动标准规范） |
| :--- | :--- | :--- |
| **字符库/按键矩阵** | 浅色底板上密密麻麻嵌一整片纯黑小按键（`bg-[#25282F]`），视觉极度割裂。 | 浅色下采用高质感浅灰仿真键帽（`bg-slate-100 hover:bg-blue-50 text-slate-800 border-slate-200`）；深色下采用电竞暗键帽（`dark:bg-zinc-800 dark:text-zinc-100`）。 |
| **功能卡片小徽标** | 左侧前缀小方块写死 `bg-[#1E2024] text-white`，浅色模式下像打了一块块黑补丁。 | 浅色下为清爽星闪微蓝底 + 品牌蓝字（`bg-blue-50 text-blue-600 border-blue-200`）；深色下为 `dark:bg-zinc-700 dark:text-zinc-200`，悬浮时统一变亮蓝。 |
| **弹窗与模态按钮** | 纯白提示卡片右下角塞一个突兀的纯黑色主按钮（`bg-[#1e2329]`）。 | 主行动按钮统一采用品牌高亮蓝（`bg-[#0D5FFF] hover:bg-blue-600 text-white`），次要按钮自适应浅灰/暗灰。 |
| **测试与槽位回显** | 监听按下的按键回显标签写死 `bg-[#2D3035]`，虚线槽位写死 `bg-black/60`。 | 槽位与按下回显统一采用品牌蓝高亮（`bg-[#0D5FFF] text-white`）或自适应键帽色，严禁纯黑半透明死色。 |

### 13.3 自动化门禁与自检命令

每次修改 UI 代码后，上线前必须执行两道门禁：

1. **静态未加前缀的深色 Hex 扫描门禁**：
   ```bash
   node -e "const fs=require('fs'),path=require('path');function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(f.endsWith('.jsx')){const ls=fs.readFileSync(p,'utf8').split('\n');ls.forEach((l,i)=>{if(/bg-\[#(0|1|2)[0-9a-fA-F]{5}\]/.test(l)&&!l.includes('#0D5FFF')&&!l.includes('dark:'))console.error('FAIL: '+p+':'+(i+1)+' '+l.trim());});}}}walk('工程源码/src');"
   ```
   **门禁结果必须为 0 报错**，否则严禁打包交付。

2. **双主题实机渲染验证**：
   - 运行 `--theme=light` 验证浅色模式无任何黑色块；
   - 运行 `--theme=dark` 验证深色模式无任何亮白刺眼；
   - 重点检查：主界面、高级按键概览页、高级按键编辑工作台（选键第 1 步与规则第 2 步）、按键测试面板、驱动提示弹窗。

---

## 十四、高级磁轴按键（HigherKey）底层协议与硬件通信规范

> 逆向来源：星闪悦动官方微前端驱动 `https://www.xsyd.top/connect/`、`@sparklinkplayjoy/sdk-keyboard-v2` 及 `@sparklinkplayjoy/protocol-keyboard-v2`。

### 14.1 官方 7 大磁轴高级键协议规约

| 模式编码 | 功能名称 | 官方方法名 | 官方下发 Payload 结构要求 | 典型踩坑与门禁 |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **无/清除** (NONE) | `setHigherKeyNONE` | `{ row, col, mode: 'NONE', data: { mode: 0 } }` | 清除后必须调用 `saveHigherKey()` 提交 Flash，否则断电复原。 |
| **1** | **动态键程** (DKS) | `setHigherKeyDKS` | `{ row, col, mode: 'DKS', data: { kcs: number[4], trps: number[4], dbs: number[2] } }` | **严禁传入 > 255 的数值！** `trps` 为 4 组 8-bit 位掩码（0~255），对应 7 阶段点位（0x1, 0x2, 0x4, 0x18, 0x20, 0x40, 0x80）；`dbs` 为两个浮点数行程（如 `[1.5, 3.0]` mm），底层协议自动 `* 1000` 转微米。 |
| **2** | **多段触发** (MPT) | `setHigherKeyMPT` | `{ row, col, mode: 'MPT', data: { kcs: number[3], dbs: number[3] } }` | `kcs` 必须包含 3 个键码；`dbs` 的 3 个深度值（mm）**必须严格单调递增**，否则固件计算报错。 |
| **3** | **双效点击** (MT) | `setHigherKeyMT` | `{ row, col, mode: 'MT', data: { kcs: [tapKey, holdKey], time: number } }` | **字段名必须为 `time`**（解构读取），传 `delay` 会被视作 undefined 导致固件接收到 0ms。 |
| **4** | **火力全开** (TGL) | `setHigherKeyTGL` | `{ row, col, mode: 'TGL', data: { kcs: number, time: number } }` | **`kcs` 必须为单数字（非数组！）**；且字段名必须为 `time`。 |
| **5** | **松开触发** (END) | `setHigherKeyEND` | `{ row, col, mode: 'END', data: { kcs: [downKey, upKey], delay: number } }` | `kcs` 必须为包含按下与松开 2 个键码的数组；字段名为 `delay`。 |
| **6** | **设定优先** (SOCD) | `setHigherKeySOCD` | `{ row, col, row2, col2, socdMode: number, delay: number, kcs: [keyA, keyB] }` | 参数直接平铺在根对象，底层解构生成 `[pack1, pack2]` 双包并分别写入两键。 |
| **7** | **迅洁急停** (RS) | `setHigherKeyRS` | `{ row, col, mode: 'RS', data: { row2, col2, delay: number, kcs: [keyA, keyB] } }` | 底层打包同样生成 `[pack1, pack2]` 双包。`keyboardService` 需严格下发并执行 `saveHigherKey()`。 |

### 14.2 官方 DKS 7 点位双向编解码算法

```javascript
// 编码：7 点位布尔数组 -> 8-bit 单字节整数 (0~255)
export const encodeDksTrps = (pts = []) => {
  let val = 0;
  if (pts[0]) val |= 1;           // 阶段 1: 按下起点
  if (pts[1]) val |= 2;           // 阶段 2: 浅按下到达 db (默认 1.5mm)
  if (pts[2]) val |= 4;           // 阶段 3: 深按下到达 db2 (默认 3.0mm)
  if (pts[3]) { val |= 8; val |= 16; } // 阶段 4: 触底 (0x18 = 24)
  if (pts[4]) val |= 32;          // 阶段 5: 松开回弹到达 db2
  if (pts[5]) val |= 64;          // 阶段 6: 松开回弹到达 db
  if (pts[6]) val |= 128;         // 阶段 7: 完全抬起
  return val;
};

// 解码：从硬件返回的 8-bit 整数反解为 7 点位布尔数组
export const decodeDksTrps = (val = 0) => {
  const z = new Array(8);
  for (let i = 0; i < 8; i++) {
    z[i] = !!(val & (1 << i));
  }
  return [z[0], z[1], z[2], z[3] && z[4], z[5], z[6], z[7]];
};
```

---

## 十五、快捷指令（Macro）底层协议与板载闪存持久化规范

> 逆向来源：星闪悦动官方微前端驱动 `https://www.xsyd.top/connect/`、`@sparklinkplayjoy/sdk-keyboard-v2`（`MacroController`）及 `@sparklinkplayjoy/protocol-keyboard-v2`。

### 15.1 宏动作底层二进制结构（MacroAction）
单片机硬件定义单个动作占 4 字节 UInt32（小端序 LE）：
```typescript
// status: 1=按下, 0=抬起; delay: 0~32767ms; keyCode: USB HID Usage ID
const statusBit = status === 1 ? 1 : 0;
const packed = (statusBit << 31) | (delay << 16) | (keyCode & 0xffff);
// 字节小端序打包: [packed & 0xff, (packed >>> 8) & 0xff, (packed >>> 16) & 0xff, (packed >>> 24) & 0xff]
```

### 15.2 分包写入与闪存持久化规约
1. **分包传输限制**：单包 64 字节 HID 报文，除去协议头 `[Macro(7), SetMacro(4), macroId, offset]` 占 4 字节，每包最多容纳 **15 个动作**。
2. **总包数计算**：`Math.ceil(actions.length / 15)`，`offset` 从 `0` 开始递增下发。
3. **模式下发与动作总数**：下发动作前必须先调用 `setMacroMode({ macroId, actNum: actions.length, repNum, mode, valid: 1 })`。
4. **触发模式（Mode 0~5）严格对应**：
   - `mode = 0`: 点击执行，重复 N 次（`repNum = 1~9999`），执行期间再次点击无效；
   - `mode = 1`: 点击执行，重复 -，执行期间再次点击，重新执行（打断重入）；
   - `mode = 2`: 点击执行，重复 -，执行期间再次点击，立即停止执行；
   - `mode = 3`: 点击执行，重复 -，执行期间再次点击，完成本次快捷指令后停止执行；
   - `mode = 4`: 按住执行，重复次数无限（`repNum = 65535`），松开后立即停止执行；
   - `mode = 5`: 按住执行，重复次数无限（`repNum = 65535`），松开后完成本次快捷指令后停止执行。
5. **板载 Flash 闪存持久化铁律**：写完 `setMacroMode` 与 `setMacroData` 之后，**必须调用 `keyboardService.paramSave('Macro')`（即底层 `GFSParamSave('Macro')`）**，单片机才会将宏数据写入板载 Flash 芯片。否则官方网页驱动或重新插拔后硬件数据将变空！

---

## 十六、性能配置（Performance）与未定义变量白屏防御规范

### 16.1 模态弹窗与全局触发边界
- 凡全局性质的系统级提示（如 USB 3.0 超高回报率专用驱动下载弹窗），必须统一在 `App.jsx` 顶层统一挂载（`Usb3DriverModal`），子组件通过全局事件或 `window.__triggerUsb3Prompt?.()` 调起。
- 严禁在子 Tab 组件（如 `PerformanceTab.jsx`）底部遗留未定义状态（如 `showDriverModal`、`driverInfo` 等未声明变量）的冗余 JSX，否则渲染即触发 `ReferenceError` 导致整个 Tab 崩溃进入错误捕获页。

### 16.2 性能配置主题自适应规范
- 性能配置 8 大卡片（休眠设置、回报率设置、按键防抖、RT稳定性、防误触、Win锁定、Mac模式、自适应动态校准）必须严格跟随软件全局配色，背景统一采用 `bg-[var(--bg-secondary)] border border-[var(--border-color)]`，文字采用 `text-[var(--text-primary)] / text-[var(--text-tertiary)]`，严禁写死 `bg-white` 或 `border-slate-200`。

---

*本 SOP 为活文档。发现新踩坑、新约定，请补充到对应章节 —— 但请确保写的是**项目真实状态**，不要照搬过时流程。*


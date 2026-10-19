# AstraFlux-HUB (星流驱动HUB) — 通用磁轴与电竞外设开源控制中心

> **AstraFlux-HUB** 是一款面向磁轴键盘与极速电竞外设的第三方现代化桌面控制中枢，支持 WebHID 直连、8KHz 超高回报率、0.01mm 级 Rapid Trigger 动态行程调校、SOCD 急停、DKS 与板载硬件参数写入。
>
> ⚠️ **开源与商标免责声明**：本项目为独立开源社区软件，与华为技术有限公司、星闪联盟 (NearLink / SparkLink Alliance) 或硬件外设品牌方无商业隶属关系。相关设备协议与固件知识产权均归原厂商所有。

> [!IMPORTANT]
> **🤖 给后续接手 AI Agent 与开发者的必读指引**
> - 标准作业流程：**[`项目文档/SOP.md`](./项目文档/SOP.md)** ⭐ **第一优先级**（接手 / 迭代 / 构建 / **原地覆盖 app.asar 交付** / 数据验收）
> - 开发全景规约：**[`项目文档/PROJECT_AI_SPEC.md`](./项目文档/PROJECT_AI_SPEC.md)**（权威规范，含硬件铁律）
> - 软件本体更新流程：**[`项目文档/软件本体更新说明.md`](./项目文档/软件本体更新说明.md)**（app.asar 文件锁与原地覆盖）
> - 源码工程根目录：**`工程源码/`**（所有 `npm` / `node` 命令请在该目录内执行）
>
> ⚠️ **三条交付铁律**：① 交付物是 `软件本体/`（改完前端必须同步更新 `resources/app.asar`）；② 不产出界面截图；③ 话术只讲「成品在哪 + 改了什么 + 数据验收结果」。

---

## 📁 目录结构（中文分类）

```
星闪悦动驱动/
├── 星闪悦动HUB (最新版).lnk      # ★ 最新版软件快捷方式（指向 软件本体/星闪悦动HUB.exe）
├── README.md                     # 本文件：项目总览
├── 软件本体/                      # ★ 绿色纯净版：双击 星闪悦动HUB.exe 直接运行，免安装
│   ├── 星闪悦动HUB.exe            #   Electron 运行时壳
│   └── resources/
│       ├── app.asar               #   ★ 应用代码包（dist 前端 + electron 主进程）—— 每轮必改
│       └── app.asar.unpacked/
├── 项目文档/                      # SOP、开发规约、设备清单、迭代与日志
│   ├── SOP.md                     #   ⭐ 唯一作业手册（接手 / 迭代 / 构建 / 交付 / 验收）
│   ├── PROJECT_AI_SPEC.md
│   ├── SDK标准.md
│   ├── SKU清单.md
│   ├── 软件本体更新说明.md         #   app.asar 文件锁与原地覆盖全流程
│   ├── 更新迭代.md
│   ├── 开发日志.md
│   └── 界面预览/                  #   历史截图归档（不再新增）
├── 工程源码/                      # 前端 + Electron 主进程完整工程
│   ├── src/  electron/  public/  index.html
│   ├── tools/                     #   数据探针（dump-hid / dump-home）
│   ├── dist/                      #   Vite 构建产物（装进 app.asar 的就是它）
│   ├── package.json  vite.config.js  tailwind.config.js  ...
│   └── spec_guide.cjs
├── 旧版本存档/                    # 历史版本保留内容
│   └── 历史安装包/                # 既往版本安装包与 blockmap
└── 参考内容包/                    # 逆向参考与官方 SDK 资料（只读参考，不参与构建）
    ├── sparklink_sdk_docs/
    ├── mchose_extracted/
    └── mchose_unpacked/
```

> **设计原则**：根目录只保留「一个快捷方式 + 分类文件夹」，其它一切内容全部归入对应中文分类文件夹，避免根目录杂乱。

---

## 🌐 核心参考网站与资料库

| 站点 / 资料名称 | 访问地址 / 相对路径 | 说明 |
| :--- | :--- | :--- |
| **⭐ 双子星 (SparkLink Web 官方新驱动)** | [https://v2-dev.xsyd.top/](https://v2-dev.xsyd.top/) | 官方在线驱动站，支持 WebHID 快速配对 |
| **⭐ 双子星 · 高级按键专属开发参考** | [https://v2-dev.xsyd.top/advancedKey](https://v2-dev.xsyd.top/advancedKey) | RS/LT/SOCD/DKS/MPT 等高级按键卡槽交互 |
| **⭐ 官方 v2-app 全量设备库** | [https://www.xsyd.top/v2-app](https://www.xsyd.top/v2-app) | 官方在线驱动站，**能连所有星闪键盘**（7 VID/222 设备） |
| **⭐ 双子星 · 硬件设备描述符数据库** | [https://v2-dev.xsyd.top/js/device.js](https://v2-dev.xsyd.top/js/device.js) | 官方 33+ 款星闪外设 VID/PID/Usage 描述符清单（仅双子星子集） |
| **星闪悦动云端轴体 API** | `https://api.sparklinkplayjoy.com/api/v1/getAxisListV3` | 动态拉取磁轴行程、阻尼曲线与参数 |
| **本地官方 SDK 完整技术规范手册** | [`参考内容包/sparklink_sdk_docs/`](./参考内容包/sparklink_sdk_docs/) | 包含 keyboardv2 完整底层协议（higherKey 等） |
| **本地迈从 (MCHOSE HUB) 解包参考** | [`参考内容包/mchose_extracted/`](./参考内容包/mchose_extracted/) | 现代浅色极简 UI、双列卡片布局与通用 HUB 模型 |

---

## 🛡️ 硬件真实性与避坑红线

> 完整版见 [`项目文档/SOP.md`](./项目文档/SOP.md) 第七章「红线速查」。

1. **已适配机型全部为纯 USB 极速有线键盘**（ES68 / AE64-MAX / DV63 均无电池）：**严禁**出现电池图标、电量百分比或无线假状态，统一标识为 `USB 极速有线`。
2. **回报率 UI 封顶 8KHz**：星闪 SDK（`sdk-keyboard-v2`）的 `RateOfReturnList` 只枚举到 `R8KHz`，**所有键盘都严禁渲染 16k/32k 选项**。ES68 硬件侧为 32K 方案，仅用 `hardRateCeiling` 记录，等 SDK 放开再启用。
3. **默认轴体按机型区分**：ES68 = 磁玉 Pro；DV63 = 马轴（青龙磁轴，最大行程 3.4mm，推荐 AP 0.40mm）；AE64-MAX 以云端轴体库（`getAxisListV3`）动态拉取为准。
4. **一台设备一条记录**：首页必须经 `normalizeDeviceList()` 按 `vendorId:productId` 去重，严禁把 HID 子接口（MI_00/01/02/03）当多台设备平铺。
5. **高级按键允许全部删除**：支持逐条或一键清空至 0 组，严禁弹出"至少保留一组"的拦截弹窗。
6. **禁绝原生 alert()/confirm() 弹窗**：全软件一律使用 `useToast()` 顶部气泡通知，自动去重且防遮挡。
7. **灯光深邃 RGB 与常规白色电竞键帽解耦**：【灯光设置】专享深黑 RGB 发光键盘，其它页面使用白色电竞键帽。

> 硬件写入侧铁律（硬件矩阵坐标 ≠ 视觉坐标、写完必须 `GFSParamSave`、批量并发写入等）见 [`项目文档/SDK标准.md`](./项目文档/SDK标准.md)。

---

## 🚀 启动、自检与生产命令

> ⚠️ 工程源码已归入 `工程源码/`，以下命令请先 `cd 工程源码` 再执行。

```bash
cd 工程源码

# 1. 运行规范自检与引导脚本
node spec_guide.cjs

# 2. 构建前端产物 -> dist/
node node_modules/vite/bin/vite.js build        # 等价于 npm run build

# 3. 启动开发版 Electron（真机调试，必须带这三个参数）
env -u ELECTRON_RUN_AS_NODE npx electron --no-sandbox --disable-gpu \
  --disable-software-rasterizer electron/main.js

# 4. 启动前端 Vite 热重载服务（浏览器内调 UI，不接硬件）
npm run dev
```

> ⚠️ **构建完前端 ≠ 交付完成**。用户验收的是 `软件本体/星闪悦动HUB.exe`，
> 必须再执行「解包 → 替换 `dist/` → 重打包 → 原地覆盖 `resources/app.asar`」，详见
> [`项目文档/软件本体更新说明.md`](./项目文档/软件本体更新说明.md)。
>
> ❌ `npm run dist`（electron-builder，输出 `release-v4/`）是**历史遗留流程，已不是交付路径**，不要使用。
>
> 真机调试 / 验收时若遇到沙箱、GPU 或探针报错，请参考 [`项目文档/SOP.md`](./项目文档/SOP.md)：
> **第五章「验收：数据探针」** + **第六章「沙箱环境铁律」**。
> ⚠️ 本项目**不产出界面截图**，验收一律走数据探针。

---

## 📚 项目文档索引（`项目文档/`）

| 文档 | 说明 |
| :--- | :--- |
| [`SOP.md`](./项目文档/SOP.md) ⭐ | **唯一作业手册**：接手 / 迭代 / 构建 / 交付成品 / 数据验收 / 红线速查 |
| [`PROJECT_AI_SPEC.md`](./项目文档/PROJECT_AI_SPEC.md) | 开发全景规约（权威规范，含架构与通信数据流） |
| [`软件本体更新说明.md`](./项目文档/软件本体更新说明.md) | `app.asar` 文件锁原理与原地覆盖全流程 + 版本流水 |
| [`SKU清单.md`](./项目文档/SKU清单.md) | 支持的星闪设备型号、7 厂商 VID、能力矩阵 |
| [`SDK标准.md`](./项目文档/SDK标准.md) | SDK 版本、写入铁律（硬件矩阵坐标 / GFSParamSave / 并发写入） |
| [`更新迭代.md`](./项目文档/更新迭代.md) | 版本迭代历史（v0.1 ~ v0.9） |
| [`开发日志.md`](./项目文档/开发日志.md) | 逐轮开发日志归档 |

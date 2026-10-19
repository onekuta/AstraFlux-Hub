# 星闪悦动 HUB (SparkLink PlayJoy) - 核心开发与工程交付规范大典
> **致后续接手本项目的 AI Agent 与核心开发者：**  
> 本文件为本工程（星闪悦动桌面端外设驱动中心）的唯一权威开发全景规约。接手本项目的任何 AI，**必须首先通读本规约**，严格遵照其中的**硬件铁律、通信协议、UI/UX 设计哲学及避坑准则**开展生产与后续功能演进，严禁擅自修改已确立的硬件物理约束。

---

## 目录索引
1. [项目全景定位与产品愿景](#一项目全景定位与产品愿景)
2. [权威参考网站、驱动源与协议资料库](#二权威参考网站驱动源与协议资料库)
3. [核心驱动包与底层技术栈](#三核心驱动包与底层技术栈)
4. [六大硬件红线与避坑铁律（AI 必须遵守）](#四六大硬件红线与避坑铁律ai-必须遵守)
5. [项目架构、目录拓扑与文件模块职责](#五项目架构目录拓扑与文件模块职责)
6. [核心通信服务实现与硬件数据流](#六核心通信服务实现与硬件数据流)
7. [本地开发、验证与打包部署指南](#七本地开发验证与打包部署指南)
8. [后续功能演进与扩展蓝图 (Roadmap)](#八后续功能演进与扩展蓝图-roadmap)

---

## 一、项目全景定位与产品愿景

- **产品名称**：星闪悦动 HUB (SparkLink PlayJoy Hub)
- **定位**：基于华为星闪 (NearLink) 与超高速 USB 有线通信的**下一代通用型桌面电竞外设驱动中心**。
- **通用 HUB 架构原则**：
  - 驱动**并非 DV63 专属单一驱动**，而是具备完整设备生命周期的**通用外设集线平台**（支持星闪/有线磁轴键盘、星闪无线鼠标、NearLink 接收器、手柄等）。
  - 架构分为两大视图模式：
    1. **主页设备管理视图 (`DeviceHomeView`)**：卡片化扫描与多外设发现，直观呈现已接入设备能力，支持随时接入新设备。
    2. **设备专属驱动详情视图**：进入指定设备后的深度调优中控（触发设置、按键改键、高级按键、性能调优、灯光引擎、固件管理）。

---

## 二、权威参考网站、驱动源与协议资料库

在继续生产或新增功能时，请直接参考以下已对齐的上游站点与本地归档协议：

### 1. 双子星 (官方 Web 驱动新站点)
- 🌐 **[双子星] 官方驱动开发站**：[https://v2-dev.xsyd.top/](https://v2-dev.xsyd.top/)  
- 🌐 **[双子星] 高级按键专属开发参考**：[https://v2-dev.xsyd.top/advancedKey](https://v2-dev.xsyd.top/advancedKey)  
- 🌐 **[双子星] 官方硬件外设描述符数据库**：[https://v2-dev.xsyd.top/js/device.js](https://v2-dev.xsyd.top/js/device.js)  
  *(收录了包含厂商 VID `7334` (0x1CA6)、`14502` (0x38A6)、`12771` (0x31E3) 以及 UsagePage `65456` (0xFFB0)、Usage `1` 的全部 33+ 款官方支持设备型号)*
- 🌐 **[双子星] PWA Manifest 配置**：[https://v2-dev.xsyd.top/manifest.webmanifest](https://v2-dev.xsyd.top/manifest.webmanifest)

### 2. 星闪悦动云端 API 服务
- ☁️ **云端轴体参数与阻尼库接口**：`https://api.sparklinkplayjoy.com/api/v1/getAxisListV3`  
  *(通过 `board_id`、`vid`、`pid` 动态拉取官方最新磁轴参数，已集成在 `src/services/axisService.js`)*

### 3. 本地官方协议与 SDK 归档文档 (`参考内容包/`)
- 📁 **官方 SDK 完整技术规范手册**：`参考内容包/sparklink_sdk_docs/`
  - [`higherKey.md`](file:///d:/desk/星闪悦动驱动/参考内容包/sparklink_sdk_docs/keyboardv2/api/higherKey.md)：高级按键协议底层 API（RS 深度优先急停、LT/SOCD 反向对冲、DKS 动态键程、MPT 多段触发、MT 双效点击、TGL 火力开关、END 松开触发的完整结构体与写入方法）。
  - [`performance.md`](file:///d:/desk/星闪悦动驱动/参考内容包/sparklink_sdk_docs/keyboardv2/api/performance.md)：AP (触发行程)、RT (动态急停重置)、死区、防抖与 3D 霍尔校准协议。
  - [`lighting.md`](file:///d:/desk/星闪悦动驱动/参考内容包/sparklink_sdk_docs/keyboardv2/api/lighting.md)：L1~L20 官方 20 种灯效预设、亮度、速度、HSV/RGB 调色板协议。
  - [`custom.md`](file:///d:/desk/星闪悦动驱动/参考内容包/sparklink_sdk_docs/keyboardv2/api/custom.md)：全键改键、Win/Mac 切换、Fn 层映射协议。
  - [`keyboard.md`](file:///d:/desk/星闪悦动驱动/参考内容包/sparklink_sdk_docs/keyboardv2/keyboard.md)：官方键盘按键键码映射全表（包含基础键、媒体键、特殊穿透键、宏按键全枚举）。

### 4. 迈从 (MCHOSE HUB) 桌面端交互设计参考 (`参考内容包/mchose_extracted/`)
- 参考其顶尖电竞驱动的**精致浅色界面设计风格**、双列性能卡片排布、关于页面与全局设置模态框架构。

---

## 三、核心驱动包与底层技术栈

### 核心生产依赖 (`package.json`)
```json
{
  "dependencies": {
    "@sparklinkplayjoy/sdk-keyboard-v2": "^1.0.29", // 官方核心键盘协议 SDK
    "react": "^19.3.0",                              // 现代 React 19 UI 框架
    "react-dom": "^19.3.0",
    "tailwindcss": "^4.3.3",                        // Tailwind CSS v4 现代原子样式引擎
    "lucide-react": "^1.54.0",                      // 高精度矢量电竞图标库
    "vite": "^8.3.4"                                // 极速前端打包构建工具
  },
  "devDependencies": {
    "electron": "^31.7.7"                           // 桌面端宿主，管理原生窗口与 WebHID
  }
}
```

### 关联生态参考包
- `@sparklinkplayjoy/protocol-mouse`: 星闪无线鼠标协议插件。
- `@sparklinkplayjoy/webhid-plugin`: 官方 WebHID 硬件通信层。

---

## 四、六大硬件红线与避坑铁律（AI 必须遵守）

后续 AI 在修改代码或扩展特性时，**必须严格遵守以下六大铁律**，不得因自我推测而回退：

| 序号 | 铁律核心 | 严格规范与技术依据 |
| :--- | :--- | :--- |
| 🔴 **1** | **DV63 是纯 USB 极速有线键盘** | DV63 磁轴键盘为**纯 USB 有线电竞外设，无内置锂电池**！<br>• **严禁**出现电池图标、电量百分比（如 `94%`、`95%`）或“星闪无线/2.4G”等伪造状态；<br>• 统一标注为 **`USB 8K有线`** 或 **`USB 8KHz 极速有线`**，使用 `Cable` / `Usb` 图标。 |
| 🔴 **2** | **DV63 回报率上限为 8KHz (0.125ms)** | DV63 硬件主控物理极限为 **8000Hz (0.125ms)**，绝不支持 16KHz！<br>• 在【性能调优】与【设置】界面中，**严禁显示或渲染 16k 档位**；<br>• 通过 `analyzeDeviceCapabilities()` 动态分析设备能力，仅当硬件上报支持更高规格外设时才动态放行。 |
| 🔴 **3** | **DV63 默认推荐标配轴体为「马轴」** | 键盘出厂默认搭载**马轴**（青龙磁轴），最大触发行程 3.4mm，推荐 AP 触发点 0.40mm，RT 精度可达 0.001mm。<br>• 轴体选择界面已全面重构为**平铺式子页面 (`SwitchSettingTab`)**，便于直观预览全部轴体压力克数与顺滑曲线。 |
| 🔴 **4** | **高级按键支持完全删除 (允许 0 组绑定)** | 在【高级按键】(`AdvancedTab.jsx`) 中，**严禁添加“至少保留一组”的拦截弹窗**！<br>• 用户有权逐条删除所有绑定，或点击「全部清空」一次性重置为 `0/40`；<br>• 当绑定清空时，自动将 SOCD 状态重置，并展示优雅的空状态（Empty State）虚线卡片。 |
| 🔴 **5** | **禁绝原生 alert() / confirm() 弹窗** | 全工程统一人机交互体验：<br>• 所有改键、保存、升级、重置等提示，**一律使用 `useToast()` 顶部毛玻璃气泡通知**；<br>• Toast 系统已具备**同名防堆叠**与**最多保留 2 条**的限流保护，确保不遮挡键盘操作。 |
| 🔴 **6** | **灯光设置深邃 RGB 与常规按键白色电竞键帽完全解耦** | 【灯光设置】必须使用专享的深黑色高对比度 RGB 发光键盘渲染（还原真实 1680 万色炫彩流水效果）；<br>• 【触发设置】、【按键配置】、【高级按键】、【性能调优】保持清爽护眼的白色电竞键帽，两者的 DOM 与状态严禁混用。 |

---

## 五、项目架构、目录拓扑与文件模块职责

```text
d:\desk\星闪悦动驱动\
├── electron/                         # 【桌面宿主进程】
│   ├── main.js                       # 主进程入口：窗口尺寸/防缩放变形、免弹窗静默 WebHID 自动握手
│   ├── preload.js                    # 安全上下文桥接层
│   └── icon.png                      # 星闪圆角矢量 Logo (512x512)
├── src/                              # 【前端核心应用】(React 19 + Tailwind CSS)
│   ├── constants/
│   │   ├── deviceProfiles.js         # ⭐ 设备硬件能力分析引擎 (动态分析 VID/PID、回报率上限、有线/无线)
│   │   └── dv63Layout.js             # DV63 左移 64 键物理键位矩阵、物理间距与宽度系数
│   ├── services/
│   │   ├── keyboardService.js        # ⭐ 核心硬件通信中枢：单例模式封装 SDK v2，读写 AP/RT/回报率/灯光
│   │   └── axisService.js            # 星闪云端与本地轴体库管理（马轴、白龙轴、磁玉轴等）
│   ├── components/
│   │   ├── DeviceHomeView.jsx        # ⭐ 主页多设备管理中心（星闪外设发现网格，对标迈从 HUB）
│   │   ├── KeybindsTab.jsx           # 专属改键配置器：支持选中即换、下层 104 全配配列无感映射
│   │   ├── LightingTab.jsx           # 独立 RGB 灯光引擎：L1~L20 动效、HSV/RGB 调色板、单键自定义
│   │   ├── AdvancedTab.jsx           # ⭐ 高级按键编辑器：RS/LT/SOCD/DKS，支持全部删除与实时对冲测试
│   │   ├── PerformanceTab.jsx        # ⭐ 性能调优面板：动态 8KHz 回报率、RT 稳定性滑块、自适应校准
│   │   ├── SwitchSettingTab.jsx      # 平铺式轴体选择子页面：详细展示行程曲线、按压力度与参数应用
│   │   ├── DeadzoneSettingTab.jsx    # 死区精调子页面：初始死区与触底死区微米级调节
│   │   ├── SettingsTab.jsx           # 固件在线检测与设备维护：下发出厂重置与软重启指令
│   │   ├── GlobalSettingsModal.jsx   # 全局偏好设置模态框：常规设置、消息通知、问题反馈、关于 HUB
│   │   ├── CalibrationModal.jsx      # 轴体全键霍尔极值校准视窗
│   │   ├── ToastProvider.jsx         # ⭐ 统一轻量顶部气泡通知总线 (含防堆叠机制)
│   │   └── SparkLinkLogo.jsx         # 官方高保真矢量圆角星闪 Logo 组件
│   ├── App.jsx                       # 顶层交互容器、主状态机与导航路由
│   ├── index.css                     # 全局样式：柔和无衬线黑体、电竞键帽微阴影与防畸变约束
│   └── main.jsx                      # React 应用根挂载点
├── 参考内容包/                       # 【参考资料与官方协议归档库】（位于项目根目录）
│   ├── sparklink_sdk_docs/           # 星闪官方 SDK 完整 markdown 文档（keyboardv2, mouse）
│   ├── mchose_extracted/             # 迈从驱动解包架构与交互设计参考
│   └── mchose_unpacked/              # 迈从驱动解包产物（含 resources/app.asar）
├── spec_guide.cjs                    # 🌟 工程源码内的规范自检与引导脚本（cd 工程源码 后执行）
├── package.json                      # 依赖与脚本配置
└── vite.config.js                    # Vite 生产编译配置
```

> ⚠️ 项目根目录只保留「一个快捷方式 + 中文分类文件夹」；本规范大典位于 `项目文档/PROJECT_AI_SPEC.md`，
> 完整目录与作业流程见 [`SOP.md`](./SOP.md) 第一章。

---

## 六、核心通信服务实现与硬件数据流

### 1. 设备能力动态探测 (`src/constants/deviceProfiles.js`)
```javascript
import { analyzeDeviceCapabilities } from './constants/deviceProfiles';

// 连接硬件后，动态依据硬件返回数据分析其能力边界：
const profile = analyzeDeviceCapabilities({
  vendorId: 0x1ca6,
  productId: 0x7a02,
  productName: 'DV63',
  sdkRates: ['R8KHz', 'R4KHz', 'R2KHz', 'R1KHz']
});

console.log(profile.maxPollingRate); // 8000 (自动封顶 8KHz，坚决过滤 16KHz)
console.log(profile.isWired);        // true (纯有线)
```

### 2. 回报率指令双向转译 (`src/services/keyboardService.js`)
SDK 寄存器要求使用枚举，Service 自动完成无感转换：
- `8000Hz` $\leftrightarrow$ `'R8KHz'`
- `4000Hz` $\leftrightarrow$ `'R4KHz'`
- `2000Hz` $\leftrightarrow$ `'R2KHz'`
- `1000Hz` $\leftrightarrow$ `'R1KHz'`

写入时调用：
```javascript
await keyboardService.setRateOfReturn(8000); // 内部发送 writeType: 'R8KHz'
```

---

## 七、本地开发、验证与打包部署指南

> [!IMPORTANT]
> **Windows 环境 Node.js 路径说明**：  
> 当前系统 Node.js 位于 `C:\Program Files\nodejs`。在终端中执行任何命令前，确保该路径已加入 `PATH`，或使用本项目提供的自动化脚本。

### 1. 运行规范自检脚本（极力推荐）
任何 AI 在开始工作前，可随时在终端运行根目录规范自检脚本，自动校验依赖包、协议链接与工程完整度：
```bash
cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && node spec_guide.cjs"
```

### 2. 启动前端 Vite 开发服务器
```bash
cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
```
默认开发地址为：`http://localhost:5173`。

### 3. 生产打包构建
```bash
cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run build"
```
产物将编译至 `dist/` 目录。

### 4. 启动桌面端 Electron 客户端
```bash
cmd.exe /c "set PATH=C:\Program Files\nodejs;%PATH% && npx electron electron/main.js"
```

---

## 八、后续功能演进与扩展蓝图 (Roadmap)

后续接手的 AI 可在坚守上述六大铁律的前提下，优先开展以下进阶特性的生产：

1. **宏按键录制编辑器 (Macro Editor)**
   - 参考 `参考内容包/sparklink_sdk_docs/keyboardv2/api/macro.md`。
   - 实现包含按键延时、抬起/按下事件序列的录制、编辑与硬件芯片直接下发。
2. **多设备生态扩展：星闪电竞鼠标 (M6 Ultra 等)**
   - 参考 `参考内容包/sparklink_sdk_docs/mouse/` 与 [双子星 device.js](https://v2-dev.xsyd.top/js/device.js) 中包含的鼠标 PID。
   - 完善鼠标 DPI 档位（支持 26000 DPI、LOD 静默高度、直线修正）的真实通信读写。
3. **板载配置与云端社区互通**
   - 接入职业电竞选手（如无畏契约/瓦罗兰特/CS2）官方推荐磁轴 AP/RT 参数预设，支持一键分享与导入 JSON 配置文件。
4. **全键 3D 霍尔热力图可视化**
   - 调用 SDK `getRoute({ row })` 实时读取霍尔磁通量变化，在键盘视图上实现毫秒级下压深度热力渲染。

---
*本文档持续受工程门禁保护，任何代码变更均需严格向本规约对齐。*

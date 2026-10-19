# 星闪悦动 HUB · 项目 SKU 清单

> 本文档记录星闪悦动 HUB 桌面端驱动所支持的**全部星闪外设型号（SKU）**及其硬件能力矩阵。
> 数据来源：`src/constants/sparklinkDevices.js`（自动生成自官方 v2-app 全量设备库）+ `src/constants/deviceProfiles.js`（能力档案引擎）。

---

## 一、支持范围总览

星闪悦动 HUB 是**通用型外设集线平台**，并非某单一型号的专属驱动。当前通过 WebHID 支持以下厂商/设备族：

| 项目 | 数值 |
| :--- | :--- |
| 厂商 VID 数量 | **7 个** |
| 设备 VID:PID 组合 | **222 个** |
| 主导厂商 VID | `0x1CA6`（7334，209 款） |

### 官方 7 个厂商 VID

| VID (十进制) | VID (十六进制) | 设备数 | 备注 |
| :--- | :--- | :--- | :--- |
| 7334 | `0x1CA6` | 209 | 星闪主厂商（双子星 / 星闪悦动主力） |
| 14502 | `0x38A6` | 7 | 江湾系（AE64-MAX 所属） |
| 6790 | `0x1A86` | 2 | 南京沁恒 |
| 12771 | `0x31E3` | 1 | — |
| 14108 | `0x371C` | 1 | — |
| 14342 | `0x3806` | 1 | — |
| 14621 | `0x391D` | 1 | — |

> ⚠️ 关键认知：官方 `www.xsyd.top/v2-app` 站点拥有 **7 VID / 222 设备**的全量库；而双子星 `v2-dev.xsyd.top` 只有 **3 VID / 33 设备**。若只参考双子星，会漏连江湾、沁恒等厂商的星闪键盘。

---

## 二、已建档的重点 SKU（能力档案）

以下型号已在 `deviceProfiles.js` 中建立**专属能力档案**，其余设备回落通用档案 `GENERIC_KEYBOARD`。

### 1. 0x1CA6:0x1C24 — 前行者 EWEADN ES68 Dawn（破晓 · 磁轴键盘）

> **真机已实测连接**（2026-10-13）。官网设备库条目：
> `{vendorId:7334(0x1CA6), productId:7204(0x1C24), productName:"EWEADN ES68 Dawn", displayname:"ES68", keyboardType:"68"}`

| 属性 | 值 |
| :--- | :--- |
| model | `ES68` |
| 厂商 | 前行者 EWEADN × 星闪悦动联合方案 |
| VID:PID (主) | `0x1CA6` : `0x1C24`（7334 : 7204） |
| VID:PID (备) | `0x1A86` : `0xFE81`（6790 : 65153，沁恒重枚举形态） |
| 通信 | **纯 USB 极速有线**（左右双 USB-C 5Gbps，无电池，勿渲染电量/无线） |
| 配列 | **紧凑 68 配列**（65% 主体 + 右侧 Del/Home/PgUp/PgDn 导航列） |
| 轴体 | 佳达隆磁玉 Pro 超竞版 / 前行者自研飓风轴（`defaultAxis: 磁玉 Pro`） |
| 回报率 | 硬件 **32K 方案**；当前星闪 SDK 仅开放至 **8KHz**，故 UI 封顶 8K（`hardRateCeiling: 32000` 预留） |
| 灯效 | 主键区 ARGB + **贯穿式漫反射灯带**（`XINGSHAN_ES68_STRIP_COLS = 26` 列 × 10px） |
| 板载 | Config1~4 四槽 |
| 特殊能力 | RS / SOCD / DKS / MT / TGL / MPT / END 七种高级按键；0.001mm RT 精度；256kHz 扫描率 |

**ES68 家族全量 PID（官网设备库）**

| 型号 | vendorId | productId | keyboardType |
| :--- | :--- | :--- | :--- |
| ES68 / ES68 Dawn（破晓） | 7334 | **7204** | 68 |
| ES68 Dawn（沁恒形态） | 6790 | 65153 | 68 |
| ES68 EVO | 7334 | 7215 | 68EVO |
| ES68 EVO（沁恒形态） | 6790 | 65153 | 68EVO |
| ES68 EVO (Full) | 7334 | 7244 | 68 |
| ES68 TIANYI（天一） | 7334 | 7248 | 68 |
| ES68 Lite | 7334 | 7242 | 68 |

> 匹配优先级：ES68 分支置于 `M6` 鼠标分支**之前**（否则含 “M6” 的型号会被误判为鼠标）。
> 视觉配列由 `src/constants/keyboardLayouts.js` 的 `ES68_LAYOUT`（68 键）提供。

### 2. 江湾 AE64-MAX（磁轴键盘）
| 属性 | 值 |
| :--- | :--- |
| model | `AE64-MAX` |
| 厂商 | 江湾（VID `0x38A6` 系） |
| 通信 | 星闪 / USB 有线 |
| 轴体 | 磁轴（霍尔） |
| 灯效 | **上下双灯**：PCB 单键上下两颗灯珠 + PCB 一圈底灯装饰灯（Decorate1） |
| 板载 | 支持 Config1~4 四槽板载切换 |
| 特殊能力 | 轴体校准、动态键程（RT）、高级按键（SOCD/DKS 等） |

> AE64-MAX 通过 `productName` 包含 `AE64` / `AE64MAX` / `AE64-MAX` 关键词自动匹配档案。

### 3. 星闪悦动 DV63（磁轴键盘）
| 属性 | 值 |
| :--- | :--- |
| model | `DV63` |
| 通信 | **纯 USB 极速有线**（无电池，勿渲染电量/无线状态） |
| 回报率上限 | 8000Hz（0.125ms），**严禁 16KHz 选项** |
| 默认轴体 | 马轴（青龙磁轴），最大行程 3.4mm，推荐 AP 触发点 0.40mm |
| 灯效 | 单灯（深黑 RGB 发光键盘） |

### 4. M6 Ultra（星闪电竞鼠标）
| 属性 | 值 |
| :--- | :--- |
| model | `M6 Ultra` |
| 通信 | 星闪无线 |
| 状态 | 预留档案，未连接时主页不显示（隐藏未连接设备） |

### 5. GENERIC_KEYBOARD（通用星闪磁轴键盘 · 兜底）
- 任何**未建档但属于官方 7 VID** 的星闪键盘，均回落此档案，按通用能力渲染。
- 保证「不会再把未知设备误判成 DV63」。

---

## 三、设备能力识别机制

1. `analyzeDeviceCapabilities({ vendorId, productId, productName, sdkRates })` 读取设备真实上报信息；
2. 匹配优先级：`DV63`（VID:PID 或型号名）→ **`ES68` 家族** → `AE64` → `M6` 鼠标 → 其它；
3. 未命中型号关键词时按官方 VID:PID 精确匹配；
4. 仍未命中但属于 7 个官方 VID → 回落 `GENERIC_KEYBOARD`；
5. 完全未知 → 不识别为星闪设备，不予连接；
6. 视觉配列随档案切换：`layout: '68keys'` → `ES68_LAYOUT`（68 键），`'64keys'` → `DV63_LAYOUT`（64 键），见 `src/constants/keyboardLayouts.js`。

---

## 四、SKU 维护指南

- **新增型号**：在 `src/constants/deviceProfiles.js` 的 `DEVICE_PROFILES` 增加档案，并补充型号关键词匹配逻辑。
- **新增 VID:PID**：若官方设备库更新，重新抓取 `www.xsyd.top/v2-app/js/device-*.js`，再生成 `src/constants/sparklinkDevices.js`。
- **同步位置**：新增 VID 时需同步更新 `electron/main.js` 的 `select-hid-device` 自动授权逻辑与 `keyboardService.js` 的 `requestDevice` filters。

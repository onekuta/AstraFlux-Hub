# 星闪悦动 HUB · 项目 SDK 标准

> 本文档定义本项目使用的**官方 SDK 版本、协议写入铁律与硬件通信标准**。
> 任何后续开发者在调用键盘写入相关能力前，**必须通读本文档**，避免重蹈「写入失败 / 键位错位 / 断电丢失」的覆辙。

---

## 一、SDK 依赖清单

| 包名 | 版本 | 说明 |
| :--- | :--- | :--- |
| `@sparklinkplayjoy/sdk-keyboard-v2` | `^1.0.29` | 官方键盘高层 SDK（本项目主入口） |
| `@sparklinkplayjoy/protocol-keyboard-v2` | （随 SDK 传递依赖） | 底层通信协议层 |
| Electron | `^31.7.7` | 桌面端容器，主进程处理 WebHID 权限 |
| `electron-builder` | `^26.15.3` | 打包（NSIS + portable） |

> 安装目录：`node_modules/@sparklinkplayjoy/sdk-keyboard-v2/dist/esm/`
> 类型声明：`node_modules/@sparklinkplayjoy/sdk-keyboard-v2/dist/` 下的 `.d.ts`

---

## 二、通信层架构（WebHID + Electron）

```
渲染进程 (React App.jsx)
   │  IPC 调用
   ▼
Electron 主进程 (electron/main.js)
   │  处理 select-hid-device 自动授权（7 个官方 VID）
   ▼
keyboardService.js (核心通信层)
   │  SDK 注册全量 222 设备描述符
   ▼
@sparklinkplayjoy/sdk-keyboard-v2
   │  WebHID
   ▼
星闪外设硬件
```

---

## 三、⚠️ 写入铁律（踩坑总结，必须遵守）

### 铁律 1：硬件矩阵坐标 ≠ 视觉布局坐标（且必须【逐行】读取）

**这是性能写入失败、灯光错位的头号根因。**

- 键盘的物理矩阵（row/col）与屏幕上看到的键位布局是**两套坐标系**。
- `getKeyLayoutStyle({ row })` 是**逐行接口**：每次只返回该行的最多 21 个格位，**不是**一次返回全键盘！

> ⚠️ **血泪教训**：早期实现用 `getKeyLayoutStyle({ row: 0 })` 想"一次拿全键盘矩阵"，结果拿到的只是**第 0 行**——而 AE64-MAX 的第 0 行是**保留空行**（全 0），导致矩阵永远校验失败、回落视觉坐标、写入全部错位。

- **正确姿势**：遍历每一行（row 从 0 到 N），收集所有**非零格**，得到完整矩阵键列表。
- **空位判定**：`{row: 0, col: 0, ratio: 0}` 是空位；有效键位至少有一个字段非 0。
- **连续 3 行无有效键**即认为矩阵结束，可提前终止。

```js
// ✅ 正确：逐行读取，收集所有非零格
async getKeyMatrix() {
  const allKeys = [];
  let emptyStreak = 0;
  for (let row = 0; row < 21; row++) {
    const list = (await sdk.getKeyLayoutStyle({ row }))?.keyLayoutStyle || [];
    let cnt = 0;
    list.forEach((k) => {
      if (k.row !== 0 || k.col !== 0 || (k.ratio && k.ratio !== 0)) {
        allKeys.push({ row: k.row, col: k.col, ratio: k.ratio });
        cnt++;
      }
    });
    if (cnt === 0) { if (++emptyStreak >= 3) break; } else { emptyStreak = 0; }
  }
  return allKeys.sort((a, b) => a.row - b.row || a.col - b.col); // 按行、列升序
}

// ❌ 错误：只读第 0 行（AE64-MAX 第 0 行是空行，拿到全 0）
// const list = (await sdk.getKeyLayoutStyle({ row: 0 })).keyLayoutStyle;
```

**AE64-MAX 实测矩阵结构**（2026-10-13 真机验证）：

| 矩阵行 | 有效键数 |
| :--- | :--- |
| row 0 | 0（保留空行） |
| row 1 | 14 |
| row 2 | 14 |
| row 3 | 13 |
| row 4 | 14 |
| row 5 | 9 |
| **合计** | **64 键** ✅ |

> 64 键与视觉布局 `DV63_LAYOUT`（14+14+13+14+9=64）**完全吻合**，按行序一一对齐即可建立映射。
> 真机验证：KeyW 硬件坐标 = `{row:1, col:2}`，用该坐标 `getPerformance` 成功读到真实参数（AP 0.40mm / RT 1.129 / 死区 0.04），`setPerformance` 写回 `{ok:1, saved:true}`。

```js
// 硬件坐标建立后，写入时按视觉键 → 硬件坐标转换
const hw = findHwCoords(visualKey);               // 视觉键 → 硬件 {row, col}
await service.writePerformanceBatch([{ row: hw.row, col: hw.col, overrides: params }]);
```

### 铁律 2：写入后必须 `GFSParamSave` 提交闪存

- 官方所有参数写入 RAM 后，**必须调用 `GFSParamSave({ key })` 落盘**，否则断电/重启即丢失。

| 参数类别 | `GFSParamSave` 的 key |
| :--- | :--- |
| 性能参数（AP/RT/死区） | `'Performance'` |
| 键位布局（改键） | `'Layout'` |
| 高级按键（SOCD/DKS 等） | `'HigherKey'` |
| 灯光自定义 | 用 `saveLightingCustom()`（独立接口） |

### 铁律 3：批量写入必须并发，禁止逐键串行

- `getPerformance` 协议层**只收单键 `{row, col}`**，没有批量接口。
- 逐键串行写 64 键会**卡死 UI**。
- 官方 store 的做法是 `Promise.all` 并发。

```js
// ✅ 并发写入
await Promise.all(entries.map(e => service.writePerformance(e.row, e.col, params)));
await service.savePerformance();   // GFSParamSave({key:'Performance'})

// ❌ for...of + await 串行 → 64 键卡死
```

### 铁律 4：RT 开关 = `performance.mode`（不是独立字段）

- 动态急停（Rapid Trigger）开关通过 `performance.mode: 1/0` 控制，**没有独立的 RT 字段**。

### 铁律 5：读写合并（Read-Modify-Write）

- 修改单个参数前，先读回当前值，合并后再写，避免覆盖其他已配置项。

```js
// applyKeyPerformance：读 → 改 → 写 → 存
const cur = await service.getPerformance(row, col);
await service.writePerformance(row, col, { ...cur, ap: newAp });
```

---

## 四、核心协议能力对照表

| 能力 | SDK 方法 | 落盘 |
| :--- | :--- | :--- |
| 读取硬件矩阵 | `getKeyLayoutStyle({row:0})` → `getKeyMatrix()` | — |
| 性能参数写入 | `writePerformanceBatch()` (Promise.all) | `GFSParamSave('Performance')` |
| 回报率切换 | `setRateOfReturn()`（带成败校验+回滚） | — |
| 防抖优化 | `setShakeOptimizationSwitch()` | — |
| 改键 | `setKeycode()`（`src/constants/keycodes.js` HID 键码表，layer 0-3） | `GFSParamSave('Layout')` |
| SOCD 反向对冲 | `setSocdBinding()` / `setHigherKeySOCD()` | `GFSParamSave('HigherKey')` |
| 单键/全键灯光 | `setCustomKeyLighting(colorEntries)`（收硬件坐标 entries） | `saveCustomLighting()` |
| 灯光区域 | `getLightingAreas()`（主键盘 index 0 + Decorate1~5） | — |
| 双灯探测 | `isDoubleLighting()`（`getDoubleLighting` 返回 0/1） | — |
| 装饰灯 | `setDecorateCustom(areaIndex, rows, cols, ledEntries)` | `saveCustomLighting()` |
| 板载切换 | `getBoardConfigList()` / `getCurrentBoardConfig()` / `setBoardConfig('Config1'~'Config4')` | — |
| 已授权设备 | `listAuthorizedDevices()`（`navigator.hid.getDevices` 过滤 7 VID） | — |
| 自动连接 | `autoConnect(preferredDevice)`（型号关键词→VID:PID→VID→首设备） | — |

---

## 五、HID 键码表

改键硬件写入需 `USB HID Usage ID`，映射表见 `src/constants/keycodes.js`：
- `HID_KEYCODES`：`KeyboardEvent.code` → USB HID Usage ID。

---

## 六、SDK 升级注意事项

1. **升级前核对 `.d.ts`**：确认新版本方法签名未变，避免调用「幽灵 API」。
2. **设备描述符需重新生成**：若官方新增设备，重新抓取 `v2-app` 设备库更新 `sparklinkDevices.js`。
3. **electron-builder 补丁会丢失**：`node_modules/app-builder-lib/out/util/electronGet.js` 的沙箱补丁（rm 失败改名绕过 + 空目录 rmdir）在重装依赖后会丢失，需重新打补丁（详见打包文档）。

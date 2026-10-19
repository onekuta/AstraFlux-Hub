import KeyboardSDK from '@sparklinkplayjoy/sdk-keyboard-v2';
import {
  analyzeDeviceCapabilities,
  RATE_HZ_TO_SDK,
  RATE_SDK_TO_HZ,
  SPARKLINK_DEVICE_LIST,
  SPARKLINK_HID_FILTERS,
  SPARKLINK_VIDS,
  SPARKLINK_PRIMARY_VIDS,
  SPARKLINK_USAGE_PAGE,
  SPARKLINK_USAGE,
  isOfficialSparklinkDevice,
  isSupportedSparklinkDevice,
} from '../constants/deviceProfiles';
import { customDeviceRegistry } from './customDeviceRegistry';

// 已知型号识别关键词（按优先级，越靠前越优先被自动选中）
const MODEL_KEYWORDS = [
  { keyword: 'ES68', profile: 'ES68' },
  { keyword: 'AE64', profile: 'AE64_MAX' },
  { keyword: 'DV63', profile: 'DV63' },
  { keyword: '75', profile: 'SPARKLINK_75' },
  { keyword: '87', profile: 'SPARKLINK_87' },
  { keyword: '98', profile: 'SPARKLINK_98' },
  { keyword: '104', profile: 'SPARKLINK_104' },
  { keyword: '60', profile: 'SPARKLINK_60' },
];

/**
 * 把 navigator.hid.getDevices() 的原始列表归一化为「一台物理设备一条记录」
 * 背景：一台 USB 复合键盘会暴露 MI_00 / MI_01 / MI_02 / MI_03 多个 HID 接口集合，
 *       WebHID 会把每个接口集合当成一台独立设备返回 → 首页出现 3~4 张重复卡片。
 *
 * ① 过滤：只保留驱动真正支持的星闪方案外设（剔除历史授权残留的其它品牌 / 其它型号）
 * ② 去重：按 vendorId:productId 合并，同一物理设备只留一条
 *        （保留接口集合最多的那条，便于后续 SDK 按 id 初始化）
 * ③ 补档：挂上 analyzeDeviceCapabilities 解出的档案（型号名 / 配列 / 回报率）
 * ④ 排序：已知型号（ES68 → AE64-MAX → DV63）优先，其余按名称稳定排列
 */
export function normalizeDeviceList(rawList = [], allowAll = false) {
  const supported = (rawList || []).filter((d) => {
    if (!d) return false;
    // 1. 若是官方或主星闪方案设备，确认为键盘并放行
    if (isSupportedSparklinkDevice(d.vendorId, d.productId)) {
      return true;
    }

    // 2. 如果不需要枚举未录入设备，其它设备一律不放行
    if (!allowAll) {
      return false;
    }

    // 3. 在允许未录入设备时（添加设备页面手动拾取）：
    // 严格过滤非键盘设备！绝不能混入鼠标（如蜻蜓 Dragonfly）、耳机（iKF）、USB Hub、触控板（HIDI2C）等！
    const rawName = (d.productName || '').toLowerCase();
    const NON_KEYBOARD_WORDS = [
      'mouse', '鼠标', 'dragonfly',
      'headset', 'headphone', 'audio', 'sound', 'ikf', '耳机',
      'hub', '拓展坞', '集线器',
      'touchpad', 'trackpad', 'hidi2c', 'touch', '触控',
      'gamepad', 'controller', 'joystick', '手柄', '摇杆',
    ];
    if (NON_KEYBOARD_WORDS.some((w) => rawName.includes(w))) {
      return false;
    }

    // 检查是否有键盘接口集合 (usagePage === 1 && usage === 6) 或 厂商配置接口 (usagePage >= 0xff00)
    const collections = d.collections || [];
    if (collections.length > 0) {
      const hasKeyboardUsage = collections.some(
        (c) =>
          (c.usagePage === 1 && c.usage === 6) ||
          c.usagePage === SPARKLINK_USAGE_PAGE ||
          (c.usagePage >= 0xff00 && c.usagePage <= 0xffff)
      );
      const isOnlyMouseOrTouch = collections.every(
        (c) =>
          (c.usagePage === 1 && (c.usage === 1 || c.usage === 2)) ||
          c.usagePage === 0x0d ||
          c.usagePage === 0x0c
      );
      return hasKeyboardUsage && !isOnlyMouseOrTouch;
    }

    return false;
  });

  // ② 按 VID:PID 去重：绝对优先保留具有 0xffb0 (或 0xff00~0xffff) 官方配置通信协议集合的实例！
  const merged = new Map();
  supported.forEach((d) => {
    const key = `${d.vendorId}:${d.productId}`;
    const prev = merged.get(key);
    const hasVendor = d.collections?.some((c) => c.usagePage === SPARKLINK_USAGE_PAGE || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff));
    const prevHasVendor = prev?.collections?.some((c) => c.usagePage === SPARKLINK_USAGE_PAGE || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff));

    if (!prev) {
      merged.set(key, d);
    } else if (hasVendor && !prevHasVendor) {
      merged.set(key, d);
    } else if (!prevHasVendor && (d.collections?.length || 0) > (prev.collections?.length || 0)) {
      merged.set(key, d);
    }
  });

  // ③ 补档 + ④ 排序
  return [...merged.values()]
    .map((d) => {
      const rawName = (d.productName || '').replace(/\0/g, '').trim();
      const profile = analyzeDeviceCapabilities({
        vendorId: d.vendorId,
        productId: d.productId,
        productName: rawName,
      });
      const priority = MODEL_KEYWORDS.findIndex(({ keyword }) =>
        rawName.toUpperCase().includes(keyword)
      );
      const isOfficial = isOfficialSparklinkDevice(d.vendorId, d.productId);
      const isPrimary = SPARKLINK_PRIMARY_VIDS.includes(d.vendorId);
      const hexVid = '0x' + (d.vendorId || 0).toString(16).toUpperCase();
      const hexPid = '0x' + (d.productId || 0).toString(16).toUpperCase();

      return {
        // 供 React key / 选中比对使用的稳定标识
        id: `${d.vendorId}:${d.productId}`,
        // 原始 HIDDevice 引用（需要真机 init 时可直接透传给 SDK 前做兜底）
        hidDevice: d,
        vendorId: d.vendorId,
        productId: d.productId,
        productName: rawName || (isOfficial || isPrimary ? profile.name : `未录入键盘 (${hexVid}:${hexPid})`),
        displayName: rawName || (isOfficial || isPrimary ? profile.name : `未录入键盘 (${hexVid})`),
        profile,
        isOfficial,
        isSupported: isSupportedSparklinkDevice(d.vendorId, d.productId),
        maxRate: profile.maxPollingRate || 8000,
        layoutName: isOfficial || isPrimary ? (profile.layoutName || '标准配列') : '未录入',
        connectionLabel: profile.connectionLabel || 'USB 极速有线',
        interfaceCount: d.collections?.length || 0,
        opened: !!d.opened,
        _sortWeight: priority < 0 ? MODEL_KEYWORDS.length : priority,
      };
    })
    .sort((a, b) => a._sortWeight - b._sortWeight || a.displayName.localeCompare(b.displayName))
    .map(({ _sortWeight, ...rest }) => rest);
}

export const DV63_CONFIG = {
  vendorId: 0x1ca6,
  productId: 0x7a02,
  usagePage: 0xffb0,
  usage: 0x01,
};

// 依据硬件描述符识别已知型号，未知设备回落通用档案
function identifyProfile(descriptor = {}) {
  const productName = (descriptor.productName || '').toUpperCase();
  for (const { keyword, profile } of MODEL_KEYWORDS) {
    if (productName.includes(keyword)) return profile;
  }
  return 'GENERIC_KEYBOARD';
}

class KeyboardService {
  constructor() {
    this.sdk = null;
    this.device = null;
    this.connected = false;
    this.deviceInfo = null;
    this.deviceProfile = analyzeDeviceCapabilities({
      vendorId: DV63_CONFIG.vendorId,
      productId: DV63_CONFIG.productId,
      productName: 'VICTKONG DV63'
    });
    this.listeners = new Set();
  }

  // 初始化 SDK 实例 (注册官方全量 637 个 VID:PID 描述符，覆盖 20 家厂商全部星闪方案外设)
  initSDK(forceNew = false) {
    if (!this.sdk || forceNew) {
      if (this.sdk) {
        try {
          this.sdk.closeDevice?.().catch(() => {});
        } catch (e) {}
      }
      try {
        this.sdk = new KeyboardSDK({
          configs: SPARKLINK_DEVICE_LIST.map((d) => ({
            vendorId: d.vendorId,
            productId: d.productId,
            usagePage: d.usagePage,
            usage: d.usage,
          })),
          usage: [SPARKLINK_USAGE, 0x01, 0x06],
          usagePage: [SPARKLINK_USAGE_PAGE, 0xffb0, 0xffa0, 0xff00, 65456, 1],
        });

        // 核心修复：官方 SDK hidService.reconnection 存在严重缺陷
        // 官方代码仅在 isUpgrading 为 true 时才更新 this.device，普通热插拔/回报率重置时 this.device 保持旧的已关闭句柄，
        // 导致后续 .open() 报错且永远无法自愈重连。此处劫持修复，确保 this.device 始终更新为新接入的 WebHID 句柄
        if (this.sdk.deviceBase?.hidService) {
          const hidService = this.sdk.deviceBase.hidService;
          const origReconnection = hidService.reconnection;
          hidService.reconnection = async function(device, id, isUpgrading) {
            console.log('[SparkLink HID] 拦截并修复 SDK hidService.reconnection: 强制更新 this.device 实例');
            this.device = device;
            return origReconnection.call(this, device, id, true);
          };
        }

        // 监听系统插拔事件
        this.sdk.on('usbChange', (data) => {
          console.log('[SparkLink HID] USB 插拔事件:', data);
          if (data.type === 'disconnect') {
            this.connected = false;
            this.device = null;
            this.emitChange();
          } else if (data.type === 'connect') {
            // 若正在回报率重置序列中，由重连序列接管，避免并发冲突
            if (!this.isResettingRate) {
              this.autoConnect();
            }
          }
        });
      } catch (err) {
        console.warn('SDK 初始化提示 (可能在非 WebHID 环境):', err);
      }
    }
    return this.sdk;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emitChange() {
    this.listeners.forEach((fn) =>
      fn({
        connected: this.connected,
        device: this.device,
        info: this.deviceInfo,
        profile: this.deviceProfile,
        deviceFeatures: this.deviceFeatures,
        deviceProtocol: this.deviceProtocol,
        deviceList: this.discoveredDevices || [],
      })
    );
  }

  // 枚举所有已授权的官方星闪外设与自定义PCB (主页多设备平铺或添加设备弹窗用)
  // 一台物理键盘的多个 HID 接口集合会被 WebHID 拆成多条，这里统一归一化为一台设备一条
  async listAuthorizedDevices(allowAll = false) {
    try {
      if (!navigator.hid) return [];
      const all = await navigator.hid.getDevices();
      const list = normalizeDeviceList(all, allowAll);
      console.log(
        `[SparkLink HID] 授权设备枚举 (allowAll=${allowAll}): 原始 ${all.length} 条 → 归一化 ${list.length} 台`,
        list.map((d) => `${d.displayName} (0x${d.vendorId.toString(16)}:0x${d.productId.toString(16)})`)
      );
      return list;
    } catch (e) {
      console.warn('枚举已授权设备失败:', e);
      return [];
    }
  }

  // 尝试连接并握手 (可传入指定的 HIDDevice 以连接多设备中的某一台)
  async autoConnect(preferredDevice = null) {
    // 互斥锁：如果正在握手连接中，直接返回，避免 USB HID 并发死锁
    if (this.isConnecting) return false;

    // 若已经处于连接状态，且没有指定连接其它硬件，直接复用当前连接
    if (this.connected && this.device && !preferredDevice) {
      return true;
    }

    this.isConnecting = true;
    try {
      this.initSDK();
      if (!this.sdk) return false;

      // 1. 获取授权设备列表 (先尝试 SDK，若为空则直接穿透读取 navigator.hid.getDevices())
      let devices = [];
      try {
        devices = await this.sdk.getDevices();
      } catch (err) {
        console.warn('[SparkLink HID] sdk.getDevices 异常，降级直取 navigator.hid:', err);
      }
      if (!devices || devices.length === 0) {
        if (navigator.hid) {
          try {
            const raw = await navigator.hid.getDevices();
            devices = raw;
          } catch (e) {}
        }
      }
      this.discoveredDevices = devices || [];
      console.log('[SparkLink HID] 扫描到的设备列表:', devices);

      let targetDevice = null;
      if (devices && devices.length > 0) {
        // 优先筛选具备 0xffb0 / 官方通信协议集合的设备
        const vendorFirst = (list) => {
          const withVendor = list.filter((d) =>
            d.collections?.some((c) => c.usagePage === SPARKLINK_USAGE_PAGE || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff))
          );
          return withVendor.length > 0 ? withVendor : list;
        };
        const candidates = vendorFirst(devices);

        // 0) 用户在主页指定点击的设备 → 1) 型号关键词 → 2) 官方库精确 VID:PID → 3) 官方 VID → 4) 首个
        const matchPreferred = (d) =>
          preferredDevice &&
          d.vendorId === preferredDevice.vendorId &&
          d.productId === preferredDevice.productId;
        targetDevice =
          (preferredDevice &&
            candidates.find(
              (d) =>
                matchPreferred(d) ||
                (preferredDevice.productName &&
                  d.productName === preferredDevice.productName &&
                  d.vendorId === preferredDevice.vendorId) ||
                (preferredDevice.id && d.id === preferredDevice.id)
            )) ||
          candidates.find((d) =>
            MODEL_KEYWORDS.some(({ keyword }) =>
              (d.productName || '').toUpperCase().includes(keyword)
            )
          ) ||
          candidates.find((d) => isOfficialSparklinkDevice(d.vendorId, d.productId)) ||
          candidates.find((d) => SPARKLINK_VIDS.includes(d.vendorId)) ||
          candidates[0];
      }

      if (targetDevice) {
        const rawDev = targetDevice.data || targetDevice;
        if (this.sdk?.deviceBase?.hidService) {
          const hs = this.sdk.deviceBase.hidService;
          if (!targetDevice.id) {
            targetDevice.id = hs.tagDevice ? hs.tagDevice(rawDev, false)?.id : (`dev_${rawDev.vendorId}_${rawDev.productId}`);
          }
          hs.hidDevices[targetDevice.id] = {
            data: rawDev,
            id: targetDevice.id,
            usage: hs.usage?.[0] || SPARKLINK_USAGE,
            usagePage: rawDev.collections?.[0]?.usagePage || SPARKLINK_USAGE_PAGE,
            vendorId: rawDev.vendorId,
            productId: rawDev.productId,
            productName: rawDev.productName || '',
            collections: rawDev.collections
          };
          hs.device = rawDev;
        }

        console.log('[SparkLink HID] 正在初始化设备 ID:', targetDevice.id, rawDev.productName);

        // 清空 commandQueue 避免上次异常或物理断开残留的指令死锁
        try {
          if (this.sdk?.deviceBase?.commandQueueWrapper) {
            this.sdk.deviceBase.commandQueueWrapper.commandQueue = [];
            this.sdk.deviceBase.commandQueueWrapper.isFlushing = false;
          }
          if (this.sdk?.deviceBase?.commandQueueWrapperMultiple) {
            this.sdk.deviceBase.commandQueueWrapperMultiple.commandQueue = [];
            this.sdk.deviceBase.commandQueueWrapperMultiple.isFlushing = false;
          }
        } catch (e) {}

        await this.sdk.init(targetDevice.id);
        this.device = rawDev;
        this.connected = true;

        // 1. 获取硬件参数与出厂 SN 码 (调用 SDK 官方 getDevicesInfo，适用于所有星闪键盘)
        try {
          let info = null;
          if (typeof this.sdk.getDevicesInfo === 'function') {
            info = await this.sdk.getDevicesInfo();
          } else if (typeof this.sdk.getDeviceInfo === 'function') {
            info = await this.sdk.getDeviceInfo();
          }
          const chipUsbName = (targetDevice.productName || '').replace(/\0/g, '').trim();
          if (info) {
            this.deviceInfo = {
              ...info,
              name: info.name || info.model || info.deviceName || chipUsbName || '',
              model: info.model || chipUsbName || '',
              productName: chipUsbName || info.name || '',
              sn: info.sn || targetDevice.serialNumber || '',
            };
            console.log('[SparkLink HID] 成功读取键盘硬件芯片参数与出厂 SN 码:', this.deviceInfo);
          } else {
            this.deviceInfo = {
              name: chipUsbName || '',
              model: chipUsbName || '',
              productName: chipUsbName || '',
              sn: targetDevice.serialNumber || '',
            };
          }
        } catch (e) {
          console.warn('读取键盘硬件参数/SN跳过:', e);
        }

        // 2. 读取硬件功能特性 (轴体/磁轴/连接方式/灯光等)
        try {
          if (typeof this.sdk.getDeviceFeature === 'function') {
            this.deviceFeatures = await this.sdk.getDeviceFeature();
            console.log('[SparkLink HID] 成功读取键盘硬件特性:', this.deviceFeatures);
          }
        } catch (e) {
          console.warn('读取硬件特性跳过:', e);
        }

        // 3. 读取设备协议版本
        try {
          if (typeof this.sdk.getDeviceProtocol === 'function') {
            this.deviceProtocol = await this.sdk.getDeviceProtocol();
          }
        } catch (e) {
          console.warn('读取设备协议跳过:', e);
        }

        // 动态分析设备能力：读取硬件支持的回报率列表
        let sdkRates = null;
        try {
          if (typeof this.sdk.getRateOfReturnList === 'function') {
            const listRes = await this.sdk.getRateOfReturnList();
            if (listRes && Array.isArray(listRes.list)) {
              sdkRates = listRes.list;
            }
          }
        } catch (e) {
          console.log('读取硬件回报率列表跳过', e);
        }

        // 读取硬件 USB 模式与 3.0 驱动状态
        try {
          if (typeof this.sdk.getUSBModeStatus === 'function') {
            const usbRes = await this.sdk.getUSBModeStatus();
            if (usbRes && typeof usbRes === 'object') {
              this.usbModeStatus = usbRes;
            }
          }
        } catch (e) {
          console.log('读取 USBModeStatus 跳过', e);
        }

        this.deviceProfile = analyzeDeviceCapabilities({
          vendorId: targetDevice.vendorId,
          productId: targetDevice.productId,
          productName: targetDevice.productName || '',
          sdkRates,
        });

        this.emitChange();
        return true;
      }
    } catch (error) {
      console.error('[SparkLink HID] 连接失败:', error);
    } finally {
      this.isConnecting = false;
    }
    return false;
  }

  // 手动请求浏览器/HID授权（支持官方过滤器与全量自定义PCB模式）
  async requestPermission(allowAll = true) {
    try {
      this.initSDK();
      if (!navigator.hid) return false;
      let approved = null;
      if (allowAll) {
        // 全量放行模式：包含星闪官方过滤器、常见客制化 UsagePage (0xffb0, 0xff00, 0xffa0) 及空过滤器放行任意连接的 HID 设备
        try {
          approved = await navigator.hid.requestDevice({
            filters: [
              ...SPARKLINK_HID_FILTERS,
              { usagePage: SPARKLINK_USAGE_PAGE },
              { usagePage: 0xff00 },
              { usagePage: 0xffa0 },
              { usagePage: 0x0001, usage: 0x0006 },
              { usagePage: 0x0001 },
              {},
            ],
          });
        } catch (e1) {
          console.warn('全量 HID 过滤器降级至官方过滤器:', e1);
          approved = await navigator.hid.requestDevice({
            filters: SPARKLINK_HID_FILTERS,
          });
        }
      } else {
        approved = await navigator.hid.requestDevice({
          filters: SPARKLINK_HID_FILTERS,
        });
      }

      if (approved && approved.length > 0) {
        return await this.autoConnect(approved[0]);
      }
    } catch (e) {
      console.error('授权出错:', e);
    }
    return false;
  }

  // 获取指定按键性能/RT设置
  async getPerformance(row, col) {
    if (!this.sdk || !this.connected) return null;
    try {
      return await this.sdk.getPerformance({ row, col });
    } catch (e) {
      console.warn(`获取按键性能 [${row},${col}] 失败:`, e);
      return null;
    }
  }

  // 保存按键性能参数 (读改写合并，避免覆盖硬件已有字段)
  async setPerformance(params) {
    if (!this.sdk || !this.connected) return false;
    try {
      return await this.sdk.setPerformance(params);
    } catch (e) {
      console.error('设置按键性能失败:', e);
      return false;
    }
  }

  // 读取设备真实按键矩阵 (官方 getKeyLayoutStyle 一次返回全部行列坐标)
  // 返回 [{row, col}] 按 row-major 排序；失败返回 null (调用方回落视觉布局)
  // 读取设备真实矩阵坐标 (逐行读取，官方 getKeyLayoutStyle 一次只返回一行的 21 格)
  // 关键：必须遍历每一行！空位是 {row:0,col:0,ratio:0}，有效键位 row>=1。
  // AE64-MAX 实测：row 0 为空行，有效行从 row=1 开始 (14/14/13/14/9 = 64 键)
  // 必须注意：SDK 返回的 k.col 是浮点视觉X偏移(如 3.75, 11.75, 13.5)，真实电气列下标是数组索引 colIndex (0~20)！
  async getKeyMatrix() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getKeyLayoutStyle !== 'function') return null;
      const allKeys = [];
      let emptyStreak = 0;
      for (let row = 0; row < 21; row++) {
        let res;
        try {
          res = await this.sdk.getKeyLayoutStyle({ row });
        } catch (e) {
          break;
        }
        const list = res?.keyLayoutStyle || [];
        let rowKeyCount = 0;
        list.forEach((k, colIndex) => {
          // 有效键位判定：row/col/ratio 至少一个非 0（空位三者皆为 0）
          if (k.row !== 0 || k.col !== 0 || (k.ratio && k.ratio !== 0)) {
            allKeys.push({
              row,
              col: colIndex,
              visualX: k.col,
              ratio: k.ratio,
            });
            rowKeyCount += 1;
          }
        });
        // 连续 3 行无有效键 → 认为矩阵结束，提前终止
        if (rowKeyCount === 0) {
          emptyStreak += 1;
          if (emptyStreak >= 3) break;
        } else {
          emptyStreak = 0;
        }
      }
      if (!allKeys.length) return null;
      // 按行升序、行内按视觉X坐标升序，保证与视觉布局（从左到右、从上到下）顺序严格一致
      return allKeys.sort((a, b) => a.row - b.row || (a.visualX ?? a.col) - (b.visualX ?? b.col));
    } catch (e) {
      console.warn('读取设备按键矩阵失败，回落视觉布局坐标:', e);
      return null;
    }
  }

  // 批量合并写入性能参数 (官方姿势：Promise.all 并发 + GFSParamSave 提交闪存)
  // entries: [{ row, col, overrides }]
  async writePerformanceBatch(entries) {
    if (!this.sdk || !this.connected) return { ok: 0, total: entries.length, saved: false };
    let ok = 0;
    await Promise.all(entries.map(async ({ row, col, overrides }) => {
      try {
        const base = await this.getPerformance(row, col);
        const defaultAP = overrides?.normalPress ?? base?.normalPress ?? 0.4;
        const merged = {
          ...(base && typeof base === 'object' ? base : {}),
          row,
          col,
          mode: overrides?.mode ?? base?.mode ?? 1,
          normalPress: defaultAP,
          normalRelease: overrides?.normalRelease ?? base?.normalRelease ?? defaultAP,
          rtFirstTouch: overrides?.rtFirstTouch ?? overrides?.normalPress ?? base?.rtFirstTouch ?? defaultAP,
          ...overrides,
        };
        const res = await this.sdk.setPerformance(merged);
        if (res !== false) ok += 1;
      } catch (e) {
        console.error(`写入按键性能 [${row},${col}] 失败:`, e);
      }
    }));
    // 官方流程：写入后必须 GFSParamSave 提交闪存，否则断电丢失
    let saved = false;
    try {
      const res = await this.paramSave('Performance');
      saved = res !== false;
    } catch (e) {
      console.warn('GFSParamSave 提交失败:', e);
    }
    return { ok, total: entries.length, saved };
  }

  // 将 AP/RT/死区覆盖值合并写入指定按键 (单个键，含闪存提交)
  async applyKeyPerformance({ row, col }, overrides = {}) {
    if (!this.sdk || !this.connected) return false;
    try {
      const base = await this.getPerformance(row, col);
      const defaultAP = overrides?.normalPress ?? base?.normalPress ?? 0.4;
      const merged = {
        ...(base && typeof base === 'object' ? base : {}),
        row,
        col,
        mode: overrides?.mode ?? base?.mode ?? 1,
        normalPress: defaultAP,
        normalRelease: overrides?.normalRelease ?? base?.normalRelease ?? defaultAP,
        rtFirstTouch: overrides?.rtFirstTouch ?? overrides?.normalPress ?? base?.rtFirstTouch ?? defaultAP,
        rtPress: base?.rtPress ?? 0.005,
        rtRelease: base?.rtRelease ?? 0.005,
        pressDeadStroke: base?.pressDeadStroke ?? 0.04,
        releaseDeadStroke: base?.releaseDeadStroke ?? 0.05,
        ...overrides,
      };
      const res = await this.sdk.setPerformance(merged);
      if (res === false) return false;
      try {
        await this.paramSave('Performance');
      } catch (e) { /* 提交失败不阻塞单键写入 */ }
      return true;
    } catch (e) {
      console.error(`合并写入按键性能 [${row},${col}] 失败:`, e);
      return false;
    }
  }

  // 设置指定位置按键的编码值 (改键硬件写入)
  async setKeycode({ layer = 0, row, col, keycode }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setKeyCode === 'function') {
        return await this.sdk.setKeyCode({ layer, row, col, keycode });
      }
    } catch (e) {
      console.error(`写入改键 [${row},${col}] 失败:`, e);
    }
    return false;
  }

  // 批量下发单键自定义灯光 (RGB 十六进制表 -> ICustomLightingInfo 二维数组)
  // 批量下发单键自定义灯光
  // colorEntries: [{ row, col, hex }] —— row/col 必须是硬件矩阵坐标 (getKeyLayoutStyle 同步)，而非视觉布局坐标！
  async setCustomKeyLighting(colorEntries) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setLightingCustom !== 'function') return false;
      const hexToRgb = (hex) => {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
        if (!m) return { R: 0, G: 0, B: 0, isCustom: false };
        const n = parseInt(m[1], 16);
        return { R: (n >> 16) & 255, G: (n >> 8) & 255, B: n & 255, isCustom: true };
      };
      // 硬件官方固件严格要求 6 行 x 21 列完整二维矩阵
      const data = Array.from({ length: 6 }, () =>
        Array.from({ length: 21 }, () => ({ R: 0, G: 0, B: 0, isCustom: false }))
      );
      // 检查是否有空格独立灯珠指定 (isSpaceLamp || keyId 以 Space_ 开头)
      const hasSpecificSpaceLamps = colorEntries.some((e) => e.isSpaceLamp || (e.keyId && e.keyId.startsWith('Space_')));

      colorEntries.forEach((e) => {
        const row = Math.round(Number(e.row));
        const col = Math.round(Number(e.col));
        if (e.hex && row >= 0 && row < 6 && col >= 0 && col < 21) {
          const rgb = hexToRgb(e.hex);
          data[row][col] = rgb;

          // 硬件物理特性：当且仅当未开启或未单独涂 5 颗独立灯珠时，用户涂整颗 Space 才联动全部 5 颗物理灯珠 (col 4, 5, 6, 7, 8)
          const isFullSpaceBar = e.keyId === 'Space' || (!e.isSpaceLamp && col === 6 && row === 5);
          if (isFullSpaceBar && !hasSpecificSpaceLamps) {
            [4, 5, 6, 7, 8].forEach((c) => {
              data[row][c] = rgb;
            });
          }
        }
      });
      const promises = await this.sdk.setLightingCustom({
        area: 'Keyboard',
        protocol: 'Custom',
        data,
      });

      // 关键！SDK 返回包含 9 个分包的 Promise 数组，必须完整等待全部 9 包发送确认！
      if (Array.isArray(promises)) {
        await Promise.all(promises);
      }

      // 给单片机缓冲时间刷新显示缓冲区
      await new Promise((r) => setTimeout(r, 5));
      return true;
    } catch (e) {
      console.error('下发单键自定义灯光失败:', e);
      return false;
    }
  }

  // 保存自定义灯光到闪存 (通过官方 GFSParamSave('Lighting') 真实闪存持久化)
  async saveCustomLighting() {
    if (!this.sdk || !this.connected) return false;
    try {
      const res = await this.paramSave('Lighting');
      return res !== false;
    } catch (e) {
      console.error('保存自定义灯光到闪存失败:', e);
    }
    return false;
  }

  // 实时读取键盘物理灯光矩阵 (通过官方 SDK getLightingCustom 权威读取硬件当前 LED 实际 RGB 矩阵)
  async getLightingCustom(area = 'Keyboard', rows = 6, cols = 21) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getLightingCustom === 'function') {
        const matrix = await this.sdk.getLightingCustom({ area, rows, cols });
        if (Array.isArray(matrix) && Array.isArray(matrix[0])) {
          return matrix;
        }
      }
    } catch (e) {
      // 降低高频轮询时的 warning 噪点
    }
    return null;
  }

  // 实时读取装饰灯带/底灯物理矩阵 (通过官方 SDK getDecorate1Custom 或 getLightingCustom)
  async getDecorateCustom(area = 'Decorate1', rows = 2, cols = 17) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getDecorate1Custom === 'function') {
        const matrix = await this.sdk.getDecorate1Custom({ area, rows, cols });
        if (Array.isArray(matrix) && Array.isArray(matrix[0])) {
          return matrix;
        }
      }
      if (typeof this.sdk.getLightingCustom === 'function') {
        const matrix = await this.sdk.getLightingCustom({ area, rows, cols });
        if (Array.isArray(matrix) && Array.isArray(matrix[0])) {
          return matrix;
        }
      }
    } catch (e) {
      // 降低高频轮询时的 warning 噪点
    }
    return null;
  }

  // 读取指定坐标的高级键配置 (对齐官方 SDK getHigherKey)
  async getHigherKey({ row, col }) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getHigherKey === 'function') {
        const res = await this.sdk.getHigherKey({ row, col });
        return res;
      }
    } catch (e) {
      console.warn(`[SparkLink HID] 读取高级键 (${row}, ${col}) 失败:`, e);
    }
    return null;
  }

  // 批量扫描/读取当前键盘所有已配置的高级键 (对齐星闪官网 getHighLevelKeys 机制)
  async loadAllHigherKeys(flatKeys = []) {
    if (!this.sdk || !this.connected) return {};
    const result = {};
    const visited = new Set();
    try {
      for (const k of flatKeys) {
        const row = k.row !== undefined ? k.row : k.rIdx;
        const col = k.col !== undefined ? k.col : k.cIdx;
        if (row === undefined || col === undefined) continue;
        const keyTag = `${row}-${col}`;
        if (visited.has(keyTag)) continue;
        visited.add(keyTag);
        try {
          const res = await this.sdk.getHigherKey({ row, col });
          if (res && res.mode && res.mode !== 0) {
            result[keyTag] = res;
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('[SparkLink HID] 批量读取高级键失败:', e);
    }
    return result;
  }

  // 写入 SOCD 对冲绑定 (mode: 0=后覆盖 1=A优先 2=B优先 3=相抵消)
  // 写入 SOCD 对冲绑定 (mode: 0=后覆盖 1=A优先 2=B优先 3=相抵消)
  // 协议规范：SOCD 必须向顶层传 row, col, row2, col2, mode: 'SOCD', socdMode, delay, kcs
  async setSocdBinding({ row, col, row2, col2, mode = 0, delay = 0, kcs = [0, 0] }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeySOCD === 'function') {
        const cleanKcs = [Number(kcs[0] || 0), Number(kcs[1] || 0)];
        const res = await this.sdk.setHigherKeySOCD({
          row: Number(row || 0),
          col: Number(col || 0),
          row2: Number(row2 || 0),
          col2: Number(col2 || 0),
          mode: 'SOCD',
          socdMode: Number(mode || 0),
          delay: Number(delay || 0),
          kcs: cleanKcs
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 SOCD 对冲失败:', e);
    }
    return false;
  }

  // 写入动态键程 (DKS) 硬件配置 (严格对齐星闪官方规范: 4个键码, 4组8-bit位掩码trps, 2个递增行程dbs)
  async setDksBinding({ row, col, kcs = [0, 0, 0, 0], trps = [2, 4, 32, 64], dbs = [1.5, 3.0] }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyDKS === 'function') {
        const cleanKcs = [
          Number(kcs[0] || 0),
          Number(kcs[1] || 0),
          Number(kcs[2] || 0),
          Number(kcs[3] || 0)
        ];
        // 关键门禁：trps 必须是 4 个单字节整数 (0~255)，禁止溢出
        const cleanTrps = [
          Math.min(255, Math.max(0, Number(trps[0]) || 0)),
          Math.min(255, Math.max(0, Number(trps[1]) || 0)),
          Math.min(255, Math.max(0, Number(trps[2]) || 0)),
          Math.min(255, Math.max(0, Number(trps[3]) || 0))
        ];
        const cleanDbs = [
          Number(dbs[0] || 1.5),
          Number(dbs[1] || 3.0)
        ];
        const res = await this.sdk.setHigherKeyDKS({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'DKS',
          data: { kcs: cleanKcs, trps: cleanTrps, dbs: cleanDbs }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 DKS 动态键程失败:', e);
    }
    return false;
  }

  // 写入多段触发 (MPT) 硬件配置 (严格对齐星闪官方: 3个键码, 3个严格递增深度dbs)
  async setMptBinding({ row, col, kcs = [0, 0, 0], dbs = [0.5, 1.0, 1.5] }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyMPT === 'function') {
        const cleanKcs = [
          Number(kcs[0] || 0),
          Number(kcs[1] || 0),
          Number(kcs[2] || 0)
        ];
        let db1 = Number(dbs[0] || 0.5);
        let db2 = Number(dbs[1] || 1.0);
        let db3 = Number(dbs[2] || 1.5);
        // 官方硬件门禁：三个深度必须严格递增
        if (db2 <= db1) db2 = +(db1 + 0.3).toFixed(2);
        if (db3 <= db2) db3 = +(db2 + 0.3).toFixed(2);

        const res = await this.sdk.setHigherKeyMPT({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'MPT',
          data: { kcs: cleanKcs, dbs: [db1, db2, db3] }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 MPT 多段触发失败:', e);
    }
    return false;
  }

  // 写入双效点击 (MT) 硬件配置 (严格对齐官方规范: kcs包含[单击,长按], 字段必须为time)
  async setMtBinding({ row, col, kcs = [0, 0], time = 200, delay = 200 }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyMT === 'function') {
        const cleanKcs = [Number(kcs[0] || 0), Number(kcs[1] || 0)];
        const cleanTime = Number(time || delay || 200);
        const res = await this.sdk.setHigherKeyMT({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'MT',
          data: { kcs: cleanKcs, time: cleanTime, delay: cleanTime }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 MT 双效点击失败:', e);
    }
    return false;
  }

  // 写入火力全开 (TGL) 硬件配置 (严格对齐官方规范: kcs为单数字, 字段必须为time)
  async setTglBind({ row, col, kc = 0, kcs = 0, time = 50, delay = 50 }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyTGL === 'function') {
        const rawKc = kc || kcs || 0;
        const singleKc = Number(Array.isArray(rawKc) ? (rawKc[0] || 0) : rawKc);
        const cleanTime = Number(time || delay || 50);
        const res = await this.sdk.setHigherKeyTGL({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'TGL',
          data: { kcs: singleKc, time: cleanTime, delay: cleanTime }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 TGL 火力开关失败:', e);
    }
    return false;
  }

  // 写入松开触发 (END) 硬件配置 (严格对齐官方规范: kcs包含[按下,松开], 字段为delay)
  async setEndBinding({ row, col, kcs = [0, 0], delay = 0 }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyEND === 'function') {
        const cleanKcs = [Number(kcs[0] || 0), Number(kcs[1] || 0)];
        const cleanDelay = Number(delay || 0);
        const res = await this.sdk.setHigherKeyEND({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'END',
          data: { kcs: cleanKcs, delay: cleanDelay }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 END 松开触发失败:', e);
    }
    return false;
  }

  // 写入迅洁 (RS) 硬件配置 (严格对齐官方规范: 双键深度对冲, 完整下发双包)
  async setRsBinding({ row, col, row2, col2, kcs = [0, 0], delay = 0 }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyRS === 'function') {
        const cleanKcs = [Number(kcs[0] || 0), Number(kcs[1] || 0)];
        const cleanDelay = Number(delay || 0);
        const res = await this.sdk.setHigherKeyRS({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'RS',
          data: {
            row2: Number(row2 || 0),
            col2: Number(col2 || 0),
            kcs: cleanKcs,
            delay: cleanDelay
          }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('写入 RS 迅洁失败:', e);
    }
    return false;
  }

  // 清除指定按键的高级键绑定 (严格对齐星闪官方 SDK setHigherKeyNONE)
  async clearHigherKey({ row, col }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setHigherKeyNONE === 'function') {
        const res = await this.sdk.setHigherKeyNONE({
          row: Number(row || 0),
          col: Number(col || 0),
          mode: 'NONE',
          data: { mode: 0 }
        });
        await this.saveHigherKey();
        return res;
      }
    } catch (e) {
      console.error('清除高级键失败:', e);
    }
    return false;
  }

  // 保存高级键到板载存储 (严格对齐星闪 SDK 字符串参数 'HigherKey')
  async saveHigherKey() {
    return await this.paramSave('HigherKey');
  }

  // 统一持久化参数到板载 Flash 芯片 (与星闪官方协议严格对齐)
  async paramSave(type) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.GFSParamSave === 'function') {
        // SDK 官方协议要求传入直接枚举字符串 (如 'HigherKey', 'Lighting', 'Performance')
        const key = typeof type === 'object' && type ? (type.key || type.type || 'All') : type;
        const res = await this.sdk.GFSParamSave(key);
        console.log(`[SparkLink HID] GFSParamSave(${key}) 成功写入板载 Flash:`, res);
        return res;
      }
    } catch (e) {
      console.warn(`[SparkLink HID] GFSParamSave(${type}) 失败:`, e);
    }
    return false;
  }

  // 防抖/防自显优化开关 (读取硬件真实状态)
  async getShakeOptimization() {
    if (!this.sdk || !this.connected) return true;
    try {
      if (typeof this.sdk.getShakeOptimizationSwitch === 'function') {
        const res = await this.sdk.getShakeOptimizationSwitch();
        if (res && typeof res.enabled === 'boolean') {
          return res.enabled;
        }
      }
    } catch (e) {
      console.warn('[SparkLink HID] 读取防自显状态跳过:', e);
    }
    return true; // 官方固件规范：掉电或默认重置为开启状态
  }

  // 防抖/防自显优化开关 (写入硬件固件)
  async setShakeOptimization(enabled) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setShakeOptimizationSwitch === 'function') {
        const res = await this.sdk.setShakeOptimizationSwitch(enabled ? 1 : 0);
        console.log('[SparkLink HID] 成功设置硬件防自显开关:', res);
        return res;
      }
    } catch (e) {
      console.error('[SparkLink HID] 设置防自显优化失败:', e);
    }
    return false;
  }

  // ---------- 板载配置切换 (官方 Config1~Config4 四槽位) ----------
  // 读取板载配置列表 { total, list }
  async getBoardConfigList() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getConfigList === 'function') {
        return await this.sdk.getConfigList();
      }
    } catch (e) {
      console.warn('读取板载配置列表失败:', e);
    }
    return null;
  }

  // 读取当前激活的板载配置 (返回 'Config1'~'Config4' 或原始值)
  async getCurrentBoardConfig() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getConfig === 'function') {
        return await this.sdk.getConfig();
      }
    } catch (e) {
      console.warn('读取当前板载配置失败:', e);
    }
    return null;
  }

  // 切换板载配置 (configKey: 'Config1'~'Config4')
  async setBoardConfig(configKey) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setConfig === 'function') {
        await this.sdk.setConfig(configKey);
        return true;
      }
    } catch (e) {
      console.error('切换板载配置失败:', e);
    }
    return false;
  }

  // 从键盘硬件读取 4 个板载槽位的名称 (与官网驱动完全互通)
  async getBoardConfigNames() {
    if (!this.sdk || !this.connected) return null;
    const names = {};
    try {
      if (typeof this.sdk.getConfigName === 'function') {
        for (let i = 0; i < 4; i++) {
          try {
            const rawName = await this.sdk.getConfigName(i);
            if (typeof rawName === 'string' && rawName.trim()) {
              names[`Config${i + 1}`] = rawName.trim();
            }
          } catch (err) {
            // 单个槽位读取容错
          }
        }
        return Object.keys(names).length > 0 ? names : null;
      }
    } catch (e) {
      console.warn('读取板载配置名称失败:', e);
    }
    return null;
  }

  // 重命名板载槽位并写入键盘硬件 Flash (官网驱动同步生效)
  async setBoardConfigName(slotKeyOrIndex, name) {
    if (!this.sdk || !this.connected) return false;
    try {
      const index = typeof slotKeyOrIndex === 'number'
        ? slotKeyOrIndex
        : ['Config1', 'Config2', 'Config3', 'Config4'].indexOf(slotKeyOrIndex);
      if (index < 0 || index > 3) return false;
      const cleanName = (name || '').trim();
      if (!cleanName) return false;

      if (typeof this.sdk.setConfigName === 'function') {
        const res = await this.sdk.setConfigName(index, cleanName);
        console.log(`[SparkLink HID] 成功将配置槽位 Config${index + 1} 重命名写入键盘板载:`, cleanName, res);
        try {
          if (typeof this.sdk.GFSParamSave === 'function') {
            await this.sdk.GFSParamSave('Layout');
          }
        } catch (saveErr) {}
        return true;
      }
    } catch (e) {
      console.error(`[SparkLink HID] 写入板载配置名称失败:`, e);
    }
    return false;
  }

  // 获取实时下压行程 (Route)
  async getRoute(row) {
    if (!this.sdk || !this.connected) return null;
    try {
      return await this.sdk.getRoute({ row });
    } catch (e) {
      return null;
    }
  }

  // 开始全键校准
  async startCalibration() {
    if (!this.sdk || !this.connected) return false;
    try {
      return await this.sdk.calibrationStart();
    } catch (e) {
      console.error('启动校准失败:', e);
      return false;
    }
  }

  // 结束全键校准 (释放 HID 键盘输入锁定)
  async finishCalibration() {
    if (!this.sdk || !this.connected) return false;
    try {
      const res = await this.sdk.calibrationEnd();
      try {
        await this.paramSave('Calibration');
      } catch (e) {}
      return res;
    } catch (e) {
      console.error('结束校准失败:', e);
      return false;
    }
  }

  // 强制退出校准模式（防呆安全保障）
  async forceExitCalibration() {
    return await this.finishCalibration();
  }

  // 恢复出厂设置 (调用星闪官方 GFSRestore: 'All' | 'Performance' | 'Layout' | 'Calibration')
  async restoreFactory(target = 'All') {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.GFSRestore === 'function') {
        const res = await this.sdk.GFSRestore(target);
        // 保存复位状态
        try {
          await this.paramSave(target);
        } catch (e) {}
        console.log(`[SparkLink HID] 成功执行恢复出厂设置 (${target}):`, res);
        return true;
      }
    } catch (e) {
      console.error('执行恢复出厂设置失败:', e);
    }
    return false;
  }

  // 一键键盘输入急救（解决无法打字/按键无反应）
  // 1. 强制退出校准锁定
  // 2. 恢复出厂触发行程 (0.40mm) 与默认布局
  async emergencyInputRecovery() {
    if (!this.sdk || !this.connected) return false;
    try {
      // 1. 强制下发退出校准
      await this.finishCalibration();
      // 2. 复位性能参数和布局
      if (typeof this.sdk.GFSRestore === 'function') {
        await this.sdk.GFSRestore('Performance');
        await this.sdk.GFSRestore('Layout');
        await this.paramSave('Performance');
        await this.paramSave('Layout');
      }
      return true;
    } catch (e) {
      console.error('一键急救执行失败:', e);
      return false;
    }
  }

  // 获取键盘支持的轴体列表 (硬件端)
  async getAxisList() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getAxisList === 'function') {
        return await this.sdk.getAxisList();
      }
    } catch (e) {
      console.warn('获取键盘硬件轴体列表失败:', e);
    }
    return null;
  }

  // 获取当前默认轴体
  async getDefaultAxis() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getDefaultAxis === 'function') {
        return await this.sdk.getDefaultAxis();
      }
    } catch (e) {
      console.warn('获取默认轴体失败:', e);
    }
    return null;
  }

  // 设置键盘默认轴体
  async setDefaultAxis(axisId) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setDefaultAxis === 'function') {
        return await this.sdk.setDefaultAxis(axisId);
      }
    } catch (e) {
      console.error('设置默认轴体失败:', e);
      return false;
    }
  }

  // 获取指定行校准状态 (Calibration)
  async getCalibrationStatus(row = 0) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getCalibrationStatus === 'function') {
        return await this.sdk.getCalibrationStatus({ row });
      }
      if (this.sdk.performanceController && typeof this.sdk.performanceController.getCalibrationStatus === 'function') {
        return await this.sdk.performanceController.getCalibrationStatus({ row });
      }
    } catch (e) {
      return null;
    }
  }

  // 获取指定行 ADC 霍尔电压原始读数采样
  async getADCSample(row = 0) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getADC === 'function') {
        return await this.sdk.getADC({ row });
      }
      if (typeof this.sdk.getADCSample === 'function') {
        return await this.sdk.getADCSample({ row });
      }
      if (this.sdk.performanceController && typeof this.sdk.performanceController.getADC === 'function') {
        return await this.sdk.performanceController.getADC({ row });
      }
    } catch (e) {
      return null;
    }
  }

  // 获取指定行实时行程读数 (Route)
  async getRoute(row = 0) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getRoute === 'function') {
        return await this.sdk.getRoute({ row });
      }
      if (this.sdk.performanceController && typeof this.sdk.performanceController.getRoute === 'function') {
        return await this.sdk.performanceController.getRoute({ row });
      }
    } catch (e) {
      return null;
    }
  }

  // 获取指定行按键状态
  async getKeyStatus(row = 0) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getKeyStatus === 'function') {
        return await this.sdk.getKeyStatus({ row });
      }
      if (this.sdk.performanceController && typeof this.sdk.performanceController.getKeyStatus === 'function') {
        return await this.sdk.performanceController.getKeyStatus({ row });
      }
    } catch (e) {
      return null;
    }
  }

  // 获取当前灯光参数 (从键盘板载内存读取)
  async getLightingBase(area = 'Keyboard', config = 'Base', lamp = 'SingleLighting') {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getLightingBase === 'function') {
        const res = await this.sdk.getLightingBase({ area, config, lamp });
        if (res && res.data) return res.data;
        return res;
      }
    } catch (e) {
      console.warn('获取当前灯光参数失败:', e);
    }
    return null;
  }

  // 设置灯光模式 (lamp 自动识别单/双灯)
  async setLightingBase(area, mode, luminance, speed, lamp = 'SingleLighting', extra = {}) {
    if (!this.sdk || !this.connected) return false;
    try {
      const res = await this.sdk.setLightingBase({
        area: area || 'Keyboard',
        config: 'Base',
        lamp: lamp || 'SingleLighting',
        data: {
          open: extra.open || 'Open',
          mode: mode ?? 0,
          luminance: luminance ?? 80,
          speed: speed ?? 50,
          direction: extra.direction || 'Forward',
          selectStaticColor: extra.selectStaticColor ?? 0,
          primaryColor: extra.primaryColor || { R: 255, G: 61, B: 61 },
        },
      });
      try {
        if (typeof this.sdk.GFSParamSave === 'function') {
          await this.sdk.GFSParamSave({ key: 'Lighting' });
        }
      } catch (e) { /* ignore */ }
      return res;
    } catch (e) {
      console.error('设置灯效失败:', e);
      return false;
    }
  }

  // 设置键盘/装饰灯调色板预设颜色 (固件协议严格要求 8 颗静态色槽位 0~7)
  // staticColors: [{ R, G, B, H }] 或 8 个 (或 7 个) hex 字符串
  async setLightingPalette(area = 'Keyboard', staticColors = []) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setLightingPalette !== 'function') return false;
      const colors8 = Array.isArray(staticColors) ? [...staticColors] : [];
      while (colors8.length < 8) {
        colors8.push(colors8[colors8.length - 1] || '#FF3D3D');
      }
      const formattedColors = colors8.slice(0, 8).map((c, idx) => {
        if (typeof c === 'string') {
          const cleanHex = (c.startsWith('#') ? c.slice(1) : c) || 'FF3D3D';
          const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
          const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
          const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
          return { R: r, G: g, B: b, H: idx };
        }
        return { R: c.R ?? 255, G: c.G ?? 61, B: c.B ?? 61, H: c.H ?? idx };
      });

      const res = await this.sdk.setLightingPalette({
        area: area || 'Keyboard',
        config: 'Palette',
        data: {
          paletteLight: {
            staticColors: formattedColors,
          },
          staticColors: formattedColors,
        },
      });

      try {
        if (typeof this.sdk.GFSParamSave === 'function') {
          await this.sdk.GFSParamSave({ key: 'Lighting' });
        }
      } catch (e) { /* ignore */ }

      return res;
    } catch (e) {
      console.error('设置调色板预设失败:', e);
      return false;
    }
  }

  // 探测键盘灯光区域 (主键盘 + 上下装饰灯带)，返回 [{ index, count, rows, cols }]
  async getLightingAreas() {
    if (!this.sdk || !this.connected) return [];
    try {
      if (typeof this.sdk.getLightingArea !== 'function') return [];
      const res = await this.sdk.getLightingArea();
      return (res && Array.isArray(res.areas)) ? res.areas : [];
    } catch (e) {
      console.warn('探测灯光区域失败:', e);
      return [];
    }
  }

  // 探测是否单键双灯设计 (AE64-MAX 为上下双灯珠)
  // 返回 1 = 双灯，0 = 单灯；失败返回 null
  async isDoubleLighting() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getDoubleLighting !== 'function') return null;
      const res = await this.sdk.getDoubleLighting();
      return res?.doubleLighting ?? null;
    } catch (e) {
      console.warn('探测双灯状态失败:', e);
      return null;
    }
  }

  // 设置装饰灯带自定义颜色 (AE64-MAX 上下双灯设计)
  // area 索引对应 Decorate1/2/...，rows/cols 由 getLightingAreas 返回
  // ledEntries: [{ index, hex }]，index 为 0-based LED 序号
  async setDecorateCustom(areaIndex, rows, cols, ledEntries, totalLeds) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setDecorate1Custom !== 'function') return false;
      const hexToRgb = (hex) => {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
        if (!m) return { R: 0, G: 0, B: 0, isCustom: false };
        const n = parseInt(m[1], 16);
        return { R: (n >> 16) & 255, G: (n >> 8) & 255, B: n & 255, isCustom: true };
      };
      const total = totalLeds || (rows * cols);
      const flat = Array.from({ length: Math.max(total, rows * cols) }, () => ({ R: 0, G: 0, B: 0, isCustom: false }));
      ledEntries.forEach((e) => {
        if (e.index >= 0 && e.index < flat.length && e.hex) flat[e.index] = hexToRgb(e.hex);
      });
      // 折叠成一维数组 -> rows 行 x cols 列
      const data = [];
      for (let r = 0; r < rows; r++) {
        data.push(flat.slice(r * cols, (r + 1) * cols));
      }
      const areaName = areaIndex <= 1 ? 'Decorate1' : `Decorate${areaIndex}`;
      return await this.sdk.setDecorate1Custom({
        area: areaName,
        protocol: 'Custom',
        data,
      });
    } catch (e) {
      console.error('设置装饰灯带失败:', e);
      return false;
    }
  }

  // 获取当前回报率 (Hz，如 8000, 4000)
  async getRateOfReturn() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getRateOfReturn === 'function') {
        const res = await this.sdk.getRateOfReturn();
        if (res && res.key) {
          return RATE_SDK_TO_HZ[res.key] || 8000;
        }
      }
    } catch (e) {
      console.warn('获取当前硬件回报率失败:', e);
    }
    return null;
  }

  // 获取硬件 USB 模式状态 (mode: 0=USB2.0, 1=USB3.0_8K, 2=USB3.0_16K, 3=USB3.0_32K; driverStatus: 0=未安装, 1=已安装)
  async getUSBModeStatus() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getUSBModeStatus === 'function') {
        const res = await this.sdk.getUSBModeStatus();
        if (res && typeof res === 'object') {
          this.usbModeStatus = res;
        }
        return res;
      }
    } catch (e) {
      console.warn('获取 USB 模式状态失败:', e);
    }
    return null;
  }

  // 获取板载存储的 USB 模式与回报率
  async getUSBModeStored() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getUSBModeStored === 'function') {
        return await this.sdk.getUSBModeStored();
      }
    } catch (e) {
      console.warn('获取 USB 模式存储信息失败:', e);
    }
    return null;
  }

  // 设置 USB 模式 (例如切换到 USB 3.0 16K/32K)
  async setUSBMode(mode, pollingRateKey) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setUSBMode === 'function') {
        const res = await this.sdk.setUSBMode(mode, pollingRateKey);
        try {
          await this.paramSave('HighPollingRateReset');
        } catch (e) {}
        return res;
      }
    } catch (e) {
      console.error('设置 USB 模式失败:', e);
    }
    return false;
  }

  // 关闭当前设备连接
  async closeDevice() {
    try {
      if (this.sdk?.closeDevice) {
        await this.sdk.closeDevice().catch(() => {});
      }
    } catch (e) {}
    this.connected = false;
    this.device = null;
    this.isConnecting = false;
    this.emitChange();
  }

  // 回报率切换自愈重连序列 (处理单片机 HighPollingRateReset 后的物理 USB 重新枚举与握手)
  async handleRateChangeResetSequence(lastDeviceInfo = {}) {
    console.log('[SparkLink HID] 启动回报率切换平滑自愈重连序列...', lastDeviceInfo);
    this.isResettingRate = true;

    // 1. 释放旧的死句柄与死锁队列，确保 Windows HID 底层释放句柄
    try {
      if (this.sdk?.closeDevice) {
        await this.sdk.closeDevice().catch(() => {});
      }
    } catch (e) {}

    try {
      if (this.sdk?.deviceBase?.commandQueueWrapper) {
        this.sdk.deviceBase.commandQueueWrapper.commandQueue = [];
        this.sdk.deviceBase.commandQueueWrapper.isFlushing = false;
      }
      if (this.sdk?.deviceBase?.commandQueueWrapperMultiple) {
        this.sdk.deviceBase.commandQueueWrapperMultiple.commandQueue = [];
        this.sdk.deviceBase.commandQueueWrapperMultiple.isFlushing = false;
      }
    } catch (e) {}

    this.connected = false;
    this.device = null;
    this.isConnecting = false;
    this.emitChange();

    // 2. 单片机 USB PHY 重启需要物理时间，等待 600ms 后开始步进式探测
    await new Promise((r) => setTimeout(r, 600));

    // 3. 渐进式多轮探测重连 (第 1~7 轮递进等待)
    const retryDelays = [500, 600, 800, 1000, 1200, 1500, 2000];
    for (let attempt = 0; attempt < retryDelays.length; attempt++) {
      if (this.connected && this.device) {
        console.log(`[SparkLink HID] 设备已在第 ${attempt} 轮自动重连成功！`);
        break;
      }

      console.log(`[SparkLink HID] 回报率重连探测 第 ${attempt + 1}/${retryDelays.length} 轮...`);
      try {
        if (navigator.hid) {
          const rawDevices = await navigator.hid.getDevices();
          const matchTarget = rawDevices.find((d) => {
            if (lastDeviceInfo.vendorId && d.vendorId === lastDeviceInfo.vendorId) {
              if (!lastDeviceInfo.productId || d.productId === lastDeviceInfo.productId) return true;
            }
            return false;
          }) || rawDevices.find((d) => SPARKLINK_VIDS.includes(d.vendorId));

          if (matchTarget) {
            console.log('[SparkLink HID] 发现重连后的新 USB 句柄:', matchTarget.productName, matchTarget.vendorId, matchTarget.productId);
            const success = await this.autoConnect(matchTarget);
            if (success) {
              console.log('[SparkLink HID] 回报率切换后自愈重连成功！');
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`[SparkLink HID] 探测重连第 ${attempt + 1} 轮异常:`, err);
      }

      await new Promise((r) => setTimeout(r, retryDelays[attempt]));
    }

    this.isResettingRate = false;
  }

  // 设置硬件回报率 (自动转换 Hz 为 SDK 寄存器指令如 R8KHz，若为 16K/32K 则联动 setUSBMode)
  async setRateOfReturn(rateHz) {
    if (!this.sdk || !this.connected) return false;
    try {
      const sdkKey = RATE_HZ_TO_SDK[rateHz] || 'R8KHz';

      // 若为 32K 或 16K 超高回报率，优先下发 setUSBMode
      if (rateHz === 32000 && typeof this.sdk.setUSBMode === 'function') {
        try {
          await this.sdk.setUSBMode('USB3_0_32K', 'R32KHz');
        } catch (e) {
          console.warn('下发 setUSBMode 32K 提示:', e);
        }
      } else if (rateHz === 16000 && typeof this.sdk.setUSBMode === 'function') {
        try {
          await this.sdk.setUSBMode('USB3_0_16K', 'R16KHz');
        } catch (e) {
          console.warn('下发 setUSBMode 16K 提示:', e);
        }
      }

      if (typeof this.sdk.setRateOfReturn === 'function') {
        const lastVendorId = this.device?.vendorId;
        const lastProductId = this.device?.productId;
        const lastProductName = this.device?.productName;

        const res = await this.sdk.setRateOfReturn(sdkKey);
        console.log(`[SparkLink HID] 成功设置回报率为 ${rateHz}Hz (${sdkKey}):`, res);

        try {
          await this.paramSave('HighPollingRateReset');
        } catch (e) { /* ignore */ }

        // 启动自愈重连序列，确保 USB PHY 复位后平滑无感重新建立通信，无需重启客户端
        this.handleRateChangeResetSequence({
          vendorId: lastVendorId,
          productId: lastProductId,
          productName: lastProductName,
          rateHz
        });

        return true;
      }
    } catch (e) {
      console.error('设置硬件回报率失败:', e);
    }
    return false;
  }

  // 获取灯光休眠时间 (分钟)
  async getLightingSleepTime() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getLightingSleepTime === 'function') {
        return await this.sdk.getLightingSleepTime();
      }
    } catch (e) {
      console.warn('获取休眠时间失败:', e);
    }
    return null;
  }

  // 设置灯光休眠时间并提交闪存 (0=永不休眠)
  async setLightingSleepTime(minutes) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setLightingSleepTime === 'function') {
        const res = await this.sdk.setLightingSleepTime(Number(minutes) || 0);
        try {
          await this.paramSave('Lighting');
        } catch (e) {}
        return res !== undefined;
      }
    } catch (e) {
      console.error('设置休眠时间失败:', e);
    }
    return false;
  }

  // 获取系统模式 ('WIN' | 'MAC')
  async getSystemType() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getSystemType === 'function') {
        return await this.sdk.getSystemType();
      }
    } catch (e) {
      console.warn('获取系统模式失败:', e);
    }
    return null;
  }

  // 设置系统模式 ('WIN' | 'MAC')
  async setSystemType(sys = 'WIN') {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setSystemType === 'function') {
        const res = await this.sdk.setSystemType(sys);
        try {
          await this.paramSave('Layout');
        } catch (e) {}
        return res !== undefined;
      }
    } catch (e) {
      console.error('设置系统模式失败:', e);
    }
    return false;
  }

  // 切换目标星闪键盘外设 (支持用户在顶部/侧栏快捷切换)
  async switchDevice(targetDevice) {
    if (!targetDevice) return false;
    console.log('[SparkLink HID] 切换目标设备:', targetDevice);
    return await this.autoConnect(targetDevice);
  }

  // 获取完整硬件参数 (含出厂 SN 码、固件版本、PCB 版本、板载 ID、特性)
  async getHardwareInfo() {
    if (this.deviceInfo && (this.deviceInfo.name || this.deviceInfo.sn)) return this.deviceInfo;
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getDevicesInfo === 'function') {
        const info = await this.sdk.getDevicesInfo();
        const chipUsbName = (this.device?.productName || '').replace(/\0/g, '').trim();
        if (info) {
          this.deviceInfo = {
            ...info,
            name: info.name || info.model || info.deviceName || chipUsbName || '',
            model: info.model || chipUsbName || '',
            productName: chipUsbName || info.name || '',
            sn: info.sn || this.device?.serialNumber || '',
          };
          return this.deviceInfo;
        }
      }
    } catch (e) {
      console.warn('获取硬件信息失败:', e);
    }
    return this.deviceInfo || null;
  }

  // ==================== 快捷指令 (Macro) 硬件单片机通信与板载 Flash 闪存持久化 ====================

  // 获取宏空间信息 (组数与容量)
  async getMacroSpaceInfo() {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getMacroSpaceInfo === 'function') {
        return await this.sdk.getMacroSpaceInfo();
      }
    } catch (e) {
      console.warn('[SparkLink HID] 获取宏空间信息失败:', e);
    }
    return null;
  }

  // 获取单个宏的模式元数据
  async getMacroMode(macroId = 0) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getMacroMode === 'function') {
        return await this.sdk.getMacroMode({ macroId });
      }
    } catch (e) {
      console.warn(`[SparkLink HID] 获取宏 M${macroId} 模式失败:`, e);
    }
    return null;
  }

  // 设置单个宏的模式元数据 (包含 mode 0~5, repNum, actNum, valid)
  async setMacroMode({ macroId, actNum = 0, repNum = 1, mode = 0, valid = 1 }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setMacroMode === 'function') {
        const payload = {
          macroId,
          actNum: Number(actNum) || 0,
          repNum: (mode === 4 || mode === 5) ? 65535 : Math.max(1, Math.min(9999, Number(repNum) || 1)),
          mode: Number(mode) || 0,
          valid: valid ? 1 : 0,
        };
        const res = await this.sdk.setMacroMode(payload);
        return res;
      }
    } catch (e) {
      console.error(`[SparkLink HID] 下发宏 M${macroId} 模式失败:`, e);
    }
    return false;
  }

  // 分包读取宏动作数据 (单包最多 15 个动作)
  async getMacroData({ macroId, offset = 0 }) {
    if (!this.sdk || !this.connected) return null;
    try {
      if (typeof this.sdk.getMacroData === 'function') {
        return await this.sdk.getMacroData({ macroId, offset });
      }
    } catch (e) {
      console.warn(`[SparkLink HID] 读取宏 M${macroId} 动作包 offset=${offset} 失败:`, e);
    }
    return null;
  }

  // 分包写入宏动作数据 (每包 15 个动作，每动作 4 字节 UInt32 小端序)
  async setMacroData({ macroId, actions = [] }) {
    if (!this.sdk || !this.connected) return false;
    try {
      if (typeof this.sdk.setMacroData === 'function') {
        const total = actions.length;
        const chunksCount = Math.ceil(total / 15);
        if (chunksCount === 0) {
          await this.sdk.setMacroData({ macroId, offset: 0, actions: [] });
          return true;
        }
        for (let offset = 0; offset < chunksCount; offset++) {
          const chunk = actions.slice(offset * 15, (offset + 1) * 15);
          await this.sdk.setMacroData({
            macroId,
            offset,
            actions: chunk,
          });
          if (offset < chunksCount - 1) {
            await new Promise((r) => setTimeout(r, 35));
          }
        }
        return true;
      }
    } catch (e) {
      console.error(`[SparkLink HID] 写入宏 M${macroId} 动作失败:`, e);
    }
    return false;
  }

  // 完整下发宏模式与动作，并写入单片机板载 Flash 持久化
  async saveMacroToHardware(macroId, { mode = 0, repNum = 1, actions = [] }) {
    if (!this.sdk || !this.connected) {
      console.warn('[SparkLink HID] 键盘未连接，仅本地暂存宏数据');
      return { success: false, reason: 'disconnected' };
    }
    try {
      console.log(`[SparkLink HID] 开始下发宏 M${macroId} 到单片机: mode=${mode}, repNum=${repNum}, actions=${actions.length}`);

      // 1. 下发宏模式与动作总数
      const modeRes = await this.setMacroMode({
        macroId,
        actNum: actions.length,
        repNum: (mode === 4 || mode === 5) ? 65535 : (repNum || 1),
        mode,
        valid: actions.length > 0 ? 1 : 0,
      });

      // 硬件时序保护：等待单片机 EEPROM / RAM 头信息落锁
      await new Promise((r) => setTimeout(r, 45));

      // 2. 分包下发动作序列 (15 actions/packet)
      const dataRes = await this.setMacroData({
        macroId,
        actions,
      });

      await new Promise((r) => setTimeout(r, 45));

      // 3. 核心：提交板载 Flash 持久化 (GFSParamSave('Macro'))
      let flashSaved = false;
      try {
        const saveRes = await this.paramSave('Macro');
        flashSaved = saveRes !== false;
      } catch (e) {
        console.warn('[SparkLink HID] GFSParamSave(Macro) 提交失败:', e);
      }

      await new Promise((r) => setTimeout(r, 45));

      // 4. 关键：真实硬件回读校验（Verify after Write），对齐官方驱动状态规约
      let verified = false;
      let readBackActNum = 0;
      try {
        const checkMode = await this.sdk.getMacroMode({ macroId });
        readBackActNum = checkMode?.actNum || 0;
        verified = (actions.length === 0) 
          ? (!checkMode?.valid || readBackActNum === 0) 
          : (!!checkMode?.valid && readBackActNum === actions.length);
        console.log(`[SparkLink HID] 宏 M${macroId} 硬件回读校验: verified=${verified}, valid=${checkMode?.valid}, actNum=${readBackActNum}/${actions.length}`);
      } catch (err) {
        console.warn(`[SparkLink HID] 宏 M${macroId} 硬件回读校验跳过:`, err);
      }

      console.log(`[SparkLink HID] 宏 M${macroId} 写入单片机完成: modeRes=${!!modeRes}, dataRes=${!!dataRes}, flashSaved=${flashSaved}, verified=${verified}`);
      return { success: true, flashSaved, verified, actNum: readBackActNum, hardwareActionsCount: actions.length };
    } catch (e) {
      console.error(`[SparkLink HID] 下发宏 M${macroId} 异常:`, e);
      return { success: false, error: e };
    }
  }

  // 清除单个板载宏数据并提交持久化
  async clearMacroHardware(macroId) {
    if (!this.sdk || !this.connected) return false;
    try {
      await this.setMacroMode({
        macroId,
        actNum: 0,
        repNum: 1,
        mode: 0,
        valid: 0,
      });
      await new Promise((r) => setTimeout(r, 40));
      await this.setMacroData({
        macroId,
        actions: [],
      });
      await new Promise((r) => setTimeout(r, 40));
      await this.paramSave('Macro');
      return true;
    } catch (e) {
      console.error(`[SparkLink HID] 清除宏 M${macroId} 失败:`, e);
      return false;
    }
  }

  // 从单片机硬件完整读取全部 M0~M15 宏数据（严格串行 + 时序保护，避免并发导致 WebHID 丢失响应）
  async getMacroAllData(total = 16) {
    if (!this.sdk || !this.connected) return null;
    try {
      console.log(`[SparkLink HID] 正在从单片机串行读取全部 M0~M${total - 1} 快捷指令数据...`);
      const list = [];
      for (let macroId = 0; macroId < total; macroId++) {
        try {
          const modeInfo = await this.sdk.getMacroMode({ macroId });
          const actNum = modeInfo?.actNum || 0;
          const chunksCount = Math.ceil(actNum / 15);
          const rawActions = [];
          if (chunksCount > 0) {
            for (let offset = 0; offset < chunksCount; offset++) {
              const cr = await this.sdk.getMacroData({ macroId, offset });
              if (cr && Array.isArray(cr.macros)) {
                rawActions.push(...cr.macros);
              }
              if (offset < chunksCount - 1) {
                await new Promise((r) => setTimeout(r, 15));
              }
            }
          }
          // 过滤单片机填充空白 (0, 0, 0)
          const actions = rawActions.filter((a) => !(a.keyCode === 0 && a.delay === 0 && a.status === 0));
          list.push({
            macroId,
            name: `M${macroId}`,
            mode: modeInfo?.mode ?? 0,
            valid: !!modeInfo?.valid && actions.length > 0,
            actNum: actions.length,
            repNum: modeInfo?.repNum ?? 1,
            actions,
          });
        } catch (err) {
          console.warn(`[SparkLink HID] 读取宏 M${macroId} 失败:`, err);
          list.push({
            macroId,
            name: `M${macroId}`,
            mode: 0,
            valid: false,
            actNum: 0,
            repNum: 1,
            actions: [],
          });
        }
        await new Promise((r) => setTimeout(r, 15));
      }
      return list;
    } catch (e) {
      console.error('[SparkLink HID] 获取全部宏数据失败:', e);
      return null;
    }
  }
}

export const keyboardService = new KeyboardService();
if (typeof window !== 'undefined') {
  window.__keyboardService = keyboardService;
}

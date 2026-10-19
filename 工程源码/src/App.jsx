import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Lightbulb, 
  Keyboard, 
  Gamepad2, 
  Sliders, 
  RotateCcw, 
  CheckCircle2, 
  Wifi, 
  BatteryMedium, 
  Crosshair, 
  Flame, 
  CloudDownload,
  Minus,
  Square,
  X,
  Sparkles,
  ChevronDown,
  Settings2,
  Cable,
  Moon,
  Sun,
  ChevronRight,
  Cpu,
  Copy,
  Check,
  HelpCircle,
  FolderArchive,
  Layers,
  Send,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  resolveLayoutForProfile, 
  getLayoutByKey, 
  SUPPORTED_KEYBOARD_LAYOUTS, 
  getKeyCountForLayout, 
  getLayoutDisplayName,
  getLayoutBounds
} from './constants/keyboardLayouts';
import { keyboardService } from './services/keyboardService';
import { axisService, PRIMARY_AXES, getDefaultAxisForProfile } from './services/axisService';
import { profileService } from './services/profileService';

if (typeof window !== 'undefined') {
  window.keyboardService = keyboardService;
  window.axisService = axisService;
}
import LightingTab from './components/LightingTab';
import KeybindsTab from './components/KeybindsTab';
import AdvancedTab from './components/AdvancedTab';
import MacroTab from './components/MacroTab';
import PerformanceTab from './components/PerformanceTab';
import SwitchSettingTab from './components/SwitchSettingTab';
import DeadzoneSettingTab from './components/DeadzoneSettingTab';
import SettingsTab from './components/SettingsTab';
import ProfileManagerTab from './components/ProfileManagerTab';
import CalibrationModal from './components/CalibrationModal';
import VerticalTravelSlider from './components/VerticalTravelSlider';
import InlineNumberBadge from './components/InlineNumberBadge';
import DeviceHomeView from './components/DeviceHomeView';
import GlobalSettingsModal from './components/GlobalSettingsModal';
import HardwareParamsModal from './components/HardwareParamsModal';
import AddDeviceModal from './components/AddDeviceModal';
import DevLabModal from './components/DevLabModal';
import Usb3DriverPromptModal from './components/Usb3DriverPromptModal';
import AstraFluxLogo from './components/AstraFluxLogo';
import ErrorBoundary from './components/ErrorBoundary';
import { Home, ExternalLink } from 'lucide-react';
import { useToast } from './components/ToastProvider';
import { DEVICE_PROFILES, supportsContinuousRt, CONTINUOUS_RT_MIN_FIRMWARE, getMinActuationPoint, SPARKLINK_HID_FILTERS, isSupportedSparklinkDevice, getDecorateLightingConfig } from './constants/deviceProfiles';
import { findMatchedEcosystemProduct } from './constants/sparklinkEcosystem';
import { customDeviceRegistry } from './services/customDeviceRegistry';
import { HID_KEYCODES } from './constants/keycodes';
import { resolveKeyForLayer, LAYER_DEFINITIONS } from './constants/layerLayouts';
import { computeKeyLighting, computeStripLedColor } from './utils/lightingEffects';

export default function App() {
  const { addToast } = useToast();

  // 主题切换（前行者同款：跟随系统 + 手动覆盖 + localStorage 持久化 + URL 参数指定）
  const [theme, setTheme] = useState(() => {
    try {
      const qTheme = new URLSearchParams(window.location.search).get('theme');
      if (qTheme === 'dark' || qTheme === 'light') return qTheme;
    } catch {}
    const saved = localStorage.getItem('eweadn-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'system';
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme, systemDark]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const resolved = prev === 'system' ? (systemDark ? 'dark' : 'light') : prev;
      const next = resolved === 'dark' ? 'light' : 'dark';
      localStorage.setItem('eweadn-theme', next);
      return next;
    });
  };

  // 调试/截图入口：index.html?view=device&tab=lighting&profile=es68 可直接进入指定机型的驱动页
  const qs = (() => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(''); } })();

  // ⚠️ URL 显式指定 profile 时必须「锁定档案」。
  // 否则设备服务一上报（state.profile），下面 setDeviceProfile(state.profile) 会立刻把
  // URL 指定的机型顶掉 —— 本机同时插着 ES68 与 AE64-MAX 时，测哪个机型全看谁后上报，
  // 探针结果会随机漂移（第二十三轮实测：URL 写 AE64_MAX，运行时却是 es68）。
  // 现在 URL 一旦给了合法 profile，就以它为准，设备上报不再覆盖。
  const targetProfileParam = (qs.get('profile') || '').toLowerCase();
  const matchedProfile = Object.values(DEVICE_PROFILES).find(
    (p) => p.id?.toLowerCase() === targetProfileParam || 
           p.model?.toLowerCase() === targetProfileParam ||
           (targetProfileParam && p.id?.toLowerCase().includes(targetProfileParam))
  ) || DEVICE_PROFILES[targetProfileParam.toUpperCase()];
  const PROFILE_LOCKED = !!matchedProfile;

  const [deviceProfile, setDeviceProfile] = useState(
    () => matchedProfile || DEVICE_PROFILES.GENERIC_KEYBOARD,
  );
  // 手动覆盖配列（未手动覆盖时跟随 deviceProfile 智能解析）
  const [overrideLayoutKey, setOverrideLayoutKey] = useState(null);
  const ACTIVE_LAYOUT = overrideLayoutKey 
    ? getLayoutByKey(overrideLayoutKey) 
    : resolveLayoutForProfile(deviceProfile);
  const KEY_COUNT = getKeyCountForLayout(ACTIVE_LAYOUT);
  // 「连续快速触发」当前只有 AE64-MAX 支持（features.continuousRt），需固件 ≥ 0.04。
  // ES68 / DV63 / 通用兜底档案该位为 false → 触发页不渲染这一行。
  const canContinuousRt = supportsContinuousRt(deviceProfile);

  const [currentView, setCurrentView] = useState(qs.get('view') === 'device' ? 'device' : 'home'); // 'home' (主页设备选择) | 'device' (设备驱动详情)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [globalSettingsSection, setGlobalSettingsSection] = useState('general');
  const [activeTab, setActiveTab] = useState(qs.get('tab') || 'trigger'); // 'lighting' | 'trigger' | 'keybinds' | 'advanced' | 'performance'
  const [triggerSubTab, setTriggerSubTab] = useState(qs.get('subtab') || 'trigger'); // 'trigger' | 'deadzone' | 'switch'
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [authorizedDevices, setAuthorizedDevices] = useState([]);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(qs.get('modal') === 'add');
  const [showDevLabModal, setShowDevLabModal] = useState(false);
  const [showUsb3DriverModal, setShowUsb3DriverModal] = useState(false);
  const [isScanningDevices, setIsScanningDevices] = useState(false);

  // USB 3.0 专用驱动提示交互逻辑
  const handleNeverRemindUsb3Driver = () => {
    try {
      localStorage.setItem('sparklink_usb3_prompt_dismissed', 'true');
    } catch (e) {}
    setShowUsb3DriverModal(false);
    addToast({ message: '已设置不再提醒 USB 3.0 驱动', type: 'info' });
  };

  const handleDownloadUsb3Driver = async () => {
    setShowUsb3DriverModal(false);
    if (window.electronAPI && typeof window.electronAPI.installUsb3Driver === 'function') {
      try {
        const res = await window.electronAPI.installUsb3Driver();
        if (res && res.success) {
          addToast({ message: res.message || '驱动安装程序已启动，请按提示完成安装并在安装后重新插拔设备', type: 'success' });
          return;
        }
      } catch (e) {
        console.warn('调起本地 3.0 驱动安装失败:', e);
      }
    }
    const downloadUrl = 'https://www.xsyd.top/v2-app/exe/EnhanceHidUSB_V140-Cm5NvLzR.exe';
    if (window.electronAPI && typeof window.electronAPI.openExternalUrl === 'function') {
      await window.electronAPI.openExternalUrl(downloadUrl);
    } else {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'EnhanceHidUSB_V140.exe';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    addToast({ message: '正在调起专用 3.0 驱动下载，安装后请重新插拔设备', type: 'info' });
  };

  // 全局快捷键：Ctrl+Alt+Shift+D 唤起开发者硬件实验室后台
  useEffect(() => {
    const handleDevShortcut = (e) => {
      if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setShowDevLabModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleDevShortcut);
    window.__triggerUsb3Prompt = () => setShowUsb3DriverModal(true);
    return () => {
      window.removeEventListener('keydown', handleDevShortcut);
      delete window.__triggerUsb3Prompt;
    };
  }, []);

  // 主页及全局自主检索已连接的设备：
  // 1. 调用 WebHID 原生枚举已授权硬件；
  // 2. 自动匹配星闪方案与客制化 PCB；
  // 3. 若有可用设备且尚未握手，自主尝试静默连接首个设备；
  // 4. 实时更新主页设备卡片列表。
  const refreshAuthorizedDevices = async (silentlyConnect = true) => {
    try {
      setIsScanningDevices(true);
      // 严格仅枚举星闪方案设备，防止系统触控板、USB Hub 等非星闪外设混入
      let list = await keyboardService.listAuthorizedDevices(false);

      // 如果当前尚未授权，但在支持免弹窗的 Electron 下静默尝试请求星闪设备授权
      if ((!list || list.length === 0) && typeof navigator.hid?.requestDevice === 'function') {
        try {
          const req = await navigator.hid.requestDevice({ filters: SPARKLINK_HID_FILTERS });
          if (req && req.length > 0) {
            list = await keyboardService.listAuthorizedDevices(false);
          }
        } catch (e) {}
      }

      setAuthorizedDevices(list);

      // 若检索到了已授权的硬件设备：自动对应已建库默认方案并尝试连接，无需手动去添加页面挑选
      if (list.length > 0) {
        const preferred = list[0];
        const matched = findMatchedEcosystemProduct(preferred.vendorId, preferred.productId, preferred.productName || preferred.displayName);
        if (matched && (!deviceProfile || deviceProfile.id === 'default_device' || deviceProfile.id === 'generic_sparklink_kb')) {
          const baseProfile = DEVICE_PROFILES[matched.profileId] || DEVICE_PROFILES.ES68;
          setDeviceProfile({
            ...baseProfile,
            id: matched.id,
            name: matched.name,
            model: matched.model,
            layoutName: matched.layoutName || baseProfile.layoutName,
            maxPollingRate: matched.maxPollingRate || baseProfile.maxPollingRate,
            vendorId: preferred.vendorId,
            productId: preferred.productId,
          });
        }

        if (silentlyConnect && !keyboardService.connected) {
          console.log('[SparkLink AutoScan] 主页自主检索到已建库设备，正在自动握手默认方案:', preferred.displayName);
          keyboardService.autoConnect(preferred.hidDevice || preferred).catch(() => {});
        }
      }

      // 将真实检测到的设备列表同步给系统托盘右键菜单
      if (window.electronAPI?.updateTrayDevices) {
        const effectiveList = list.length > 0 ? list : (isConnected && deviceProfile ? [{
          id: deviceProfile.id,
          name: deviceProfile.name || deviceProfile.shortName,
          connected: true,
        }] : []);
        const trayList = effectiveList.map((d) => ({
          id: d.id,
          name: d.displayName || d.name || d.productName,
          connected: (device && d.vendorId === device.vendorId && d.productId === device.productId) || isConnected,
        }));
        window.electronAPI.updateTrayDevices(trayList);
      }
    } catch (e) {
      console.warn('检索已连接设备失败:', e);
    } finally {
      setIsScanningDevices(false);
    }
  };

  // 手动载入与绑定指定星闪产品档案 (支持未兼容第三方 PCB 一键强制进入驱动)
  const handleSelectManualProfile = (manualProfile, boundDevice) => {
    setDeviceProfile(manualProfile);
    if (boundDevice) {
      keyboardService.autoConnect(boundDevice).then(() => {
        refreshAuthorizedDevices(false);
      });
    }
    setCurrentView('device');
  };

  // ── 硬件出厂参数与 SN 码状态 ──
  const [hardwareInfo, setHardwareInfo] = useState(null);
  const [hardwareFeatures, setHardwareFeatures] = useState(null);
  const [hardwareProtocol, setHardwareProtocol] = useState(null);
  const [discoveredDevicesList, setDiscoveredDevicesList] = useState([]);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [showHwInfoModal, setShowHwInfoModal] = useState(false);
  const [snCopied, setSnCopied] = useState(false);

  // ── 设备隔离作用域 Key（彻底解决 AE64-MAX 与 ES68 等不同键盘间高级键/改键配置串扰问题） ──
  const currentDeviceScopeKey = React.useMemo(() => {
    const profileKey = (deviceProfile?.id && deviceProfile.id !== 'generic_sparklink_kb' && deviceProfile.id !== 'default_device')
      ? String(deviceProfile.id).toLowerCase()
      : (device?.productId ? `dev_${Number(device.productId).toString(16).padStart(4, '0')}` : 'default');

    const sn = (hardwareInfo?.sn || device?.sn || '').toString().trim();
    if (sn && sn !== '00000000' && sn !== 'unknown' && sn !== 'undefined') {
      return `${profileKey}_sn_${sn}`;
    }
    return `profile_${profileKey}`;
  }, [deviceProfile?.id, device?.productId, device?.sn, hardwareInfo?.sn]);

  // 从键盘芯片与底层硬件描述符读取真实设备名称 (优先真实芯片硬件上报，应该都有的)
  const chipDeviceName = React.useMemo(() => {
    // 1. 优先从板载芯片读取的硬件信息 (model / name / deviceName)
    const infoName = hardwareInfo?.name || hardwareInfo?.model || hardwareInfo?.deviceName;
    if (infoName && typeof infoName === 'string' && infoName.trim()) {
      return infoName.trim();
    }
    // 2. 优先从 USB 芯片固件字符串描述符读取 (即物理芯片直接上报的 productName)
    const rawUsbName = (device?.productName || '').replace(/\0/g, '').trim();
    if (rawUsbName) {
      return rawUsbName;
    }
    // 3. 若用户手动绑定了生态档案，取该档案全名
    if (deviceProfile?.isManualOverridden && deviceProfile?.name) {
      return deviceProfile.name;
    }
    // 4. 从设备档案中读取完整名称 (若档案名称存在且不为通用名称)
    if (deviceProfile?.name && deviceProfile.name !== '星闪通用磁轴键盘') {
      return deviceProfile.name;
    }
    // 5. 回退 shortName 或通用名
    return deviceProfile?.shortName || '星闪键盘';
  }, [hardwareInfo, device, deviceProfile]);

  // 扫描与可切换的星闪设备集合 (对齐截图「切换设备: [ EWEADN ES68 Da...  v ]」)
  // 扫描与可切换的星闪设备集合 (仅保留物理连接在线的设备)
  const allSwitchableDevices = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (d) => {
      if (!d) return;
      const key = `${d.vendorId}_${d.productId}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(d);
      }
    };
    if (device) add(device);
    // 将所有受支持的已检测星闪键盘纳入切换列表
    (authorizedDevices || []).forEach((d) => {
      if (d && isSupportedSparklinkDevice(d.vendorId, d.productId)) {
        add(d);
      }
    });
    if (list.length === 0) {
      list.push({
        id: deviceProfile?.id || 'default_device',
        productName: chipDeviceName,
        displayName: chipDeviceName,
        vendorId: 0x1ca6,
        productId: 0x7a02,
      });
    }
    return list;
  }, [device, authorizedDevices, deviceProfile, chipDeviceName]);

  // 首页平铺设备集合：【核心】只展示当前处于真实物理连接 / 在线状态的星闪设备！
  // 严禁将任何未连接、未激活、离线拔掉或历史残留设备作为卡片塞入首页！
  const homeDisplayDevices = React.useMemo(() => {
    const list = [];
    const seen = new Set();
    const add = (d) => {
      if (!d) return;
      const key = `${d.vendorId}_${d.productId}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(d);
      }
    };

    // 1. 当前已经握手连接的真实设备 (确保在线且已激活)
    if (isConnected && device) {
      const realChipName = (device.productName || '').replace(/\0/g, '').trim() || chipDeviceName;
      const regProf = customDeviceRegistry?.getProfile ? customDeviceRegistry.getProfile(device.vendorId, device.productId) : null;
      const matchedProd = findMatchedEcosystemProduct(device.vendorId, device.productId, realChipName);
      const effBrand = device.brand || regProf?.brand || deviceProfile?.brand || matchedProd?.brand || '';
      const effModel = device.model || regProf?.model || deviceProfile?.model || matchedProd?.model || '';
      const effLayout = (regProf?.layoutName || deviceProfile?.layoutName || matchedProd?.layoutName || '标准配列').replace(/[\(（][^()（）]*?(如|例如)[^()（）]*?[\)）]/g, '').trim();

      add({
        id: device.id || `${device.vendorId}:${device.productId}`,
        vendorId: device.vendorId || deviceProfile?.vendorId || 0x1ca6,
        productId: device.productId || deviceProfile?.productId || 0x1c24,
        displayName: realChipName,
        productName: realChipName,
        brand: effBrand,
        model: effModel,
        profile: deviceProfile,
        maxRate: deviceProfile?.maxPollingRate || 8000,
        layoutName: effLayout,
        connectionLabel: deviceProfile?.connectionLabel || 'USB 极速有线',
        isOfficial: true,
        connected: true,
      });
    } else if (isConnected && deviceProfile) {
      const regProf = customDeviceRegistry?.getProfile ? customDeviceRegistry.getProfile(deviceProfile.vendorId, deviceProfile.productId) : null;
      const matchedProd = findMatchedEcosystemProduct(deviceProfile.vendorId, deviceProfile.productId, chipDeviceName);
      const effBrand = regProf?.brand || deviceProfile?.brand || matchedProd?.brand || '';
      const effModel = regProf?.model || deviceProfile?.model || matchedProd?.model || '';
      const effLayout = (regProf?.layoutName || deviceProfile?.layoutName || matchedProd?.layoutName || '标准配列').replace(/[\(（][^()（）]*?(如|例如)[^()（）]*?[\)）]/g, '').trim();

      add({
        id: deviceProfile.id || 'sparklink_active_kb',
        vendorId: deviceProfile.vendorId || 0x1ca6,
        productId: deviceProfile.productId || 0x1c24,
        displayName: chipDeviceName,
        productName: chipDeviceName,
        brand: effBrand,
        model: effModel,
        profile: deviceProfile,
        maxRate: deviceProfile.maxPollingRate || 8000,
        layoutName: effLayout,
        connectionLabel: deviceProfile.connectionLabel || 'USB 极速有线',
        isOfficial: true,
        connected: true,
      });
    }

    // 2. 将当前物理插入/已授权扫描到的受支持星闪键盘全部纳入首页卡片展示！
    // 只要是受支持的星闪键盘，无论是已握手还是待连接，均自动对齐默认方案作为设备卡片展示！
    (authorizedDevices || []).forEach((d) => {
      if (d && isSupportedSparklinkDevice(d.vendorId, d.productId)) {
        const isThisConnected = (isConnected && (
          (device && d.vendorId === device.vendorId && d.productId === device.productId) ||
          (deviceProfile && d.vendorId === deviceProfile.vendorId && d.productId === deviceProfile.productId)
        )) || !!d.opened;

        const regProf = customDeviceRegistry?.getProfile ? customDeviceRegistry.getProfile(d.vendorId, d.productId) : null;
        const matchedProduct = findMatchedEcosystemProduct(d.vendorId, d.productId, d.productName || d.displayName);
        const resolvedName = (d.productName || '').replace(/\0/g, '').trim() || regProf?.name || matchedProduct?.name || d.displayName;
        const resolvedProfile = regProf || (matchedProduct ? (DEVICE_PROFILES[matchedProduct.profileId] || d.profile) : d.profile);
        const effBrand = d.brand || regProf?.brand || matchedProduct?.brand || resolvedProfile?.brand || '';
        const effModel = d.model || regProf?.model || matchedProduct?.model || resolvedProfile?.model || '';
        const effLayout = (regProf?.layoutName || matchedProduct?.layoutName || resolvedProfile?.layoutName || d.layoutName || '标准配列').replace(/[\(（][^()（）]*?(如|例如)[^()（）]*?[\)）]/g, '').trim();

        add({
          ...d,
          displayName: resolvedName,
          productName: resolvedName,
          brand: effBrand,
          model: effModel,
          profile: resolvedProfile,
          layoutName: effLayout,
          connected: !!isThisConnected,
        });
      }
    });

    return list;
  }, [isConnected, device, deviceProfile, chipDeviceName, authorizedDevices]);

  const rawSn = hardwareInfo?.sn || device?.serialNumber || '';
  const shortSn = rawSn ? (rawSn.length > 16 ? `${rawSn.slice(0, 16)}...` : rawSn) : '--';

  const [activeProfile, setActiveProfile] = useState('board1');
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  
  // 维护各页面独立的按键选择集合，页面切换时互不污染继承；再次切回时恢复各自页面的历史选择
  const tabSelectedKeysMapRef = useRef({
    trigger: new Set(),
    keybinds: new Set(),
    lighting: new Set(),
    advanced: new Set(),
    performance: new Set(),
    macro: new Set(),
    settings: new Set(),
  });

  const handleTabChange = useCallback((newTab) => {
    if (newTab === activeTab) return;
    // 1. 保存离开页面的按键选中集合
    tabSelectedKeysMapRef.current[activeTab] = new Set(selectedKeys);
    // 2. 恢复进入页面的按键选中集合 (若目标页面此前没有独立选中，则为空 Set，绝对不继承上一页面的全选或多选)
    const restored = tabSelectedKeysMapRef.current[newTab] || new Set();
    setSelectedKeys(new Set(restored));
    setActiveTab(newTab);
  }, [activeTab, selectedKeys]);

  useEffect(() => {
    tabSelectedKeysMapRef.current[activeTab] = selectedKeys;
  }, [selectedKeys, activeTab]);

  // 改键拖拽高亮按键 ID
  const [dragOverKeyId, setDragOverKeyId] = useState(null);
  
  // RT 及触发参数
  const [actuationPoint, setActuationPoint] = useState(0.40);
  const [rtEnabled, setRtEnabled] = useState(true);
  const [rtPress, setRtPress] = useState(0.005);
  const [rtRelease, setRtRelease] = useState(0.005);
  const [deadzone, setDeadzone] = useState(0.04);
  const [bottomDeadzone, setBottomDeadzone] = useState(0.05);
  const [separateDeadzone, setSeparateDeadzone] = useState(true); // 是否开启单独调节顶部与底部死区
  const [shakeFilter, setShakeFilter] = useState(true);
  const [antiGhosting, setAntiGhosting] = useState(true);
  const [showAntiGhostingTip, setShowAntiGhostingTip] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('showTip') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [furyMode, setFuryMode] = useState(false);
  const [rtPressPrecision, setRtPressPrecision] = useState('0.01mm');
  const [rtReleasePrecision, setRtReleasePrecision] = useState('0.01mm');

  // 解析并动态计算 RT 精度与滑块最小值 / 步长 (由狂暴模式和精度档位共同决定)
  // 当选 0.1mm 或 0.01mm 时，最小 rt 也是 0.1mm 或 0.01mm；只有打开狂暴/高性能模式才会解锁 0.005mm 与 0.001mm 最高精度
  const parsePrecisionVal = (precStr) => {
    if (precStr === '0.1mm') return 0.1;
    if (precStr === '0.01mm') return 0.01;
    if (precStr === '0.005mm') return 0.005;
    if (precStr === '0.001mm') return 0.001;
    return 0.01;
  };

  const activePressStep = (!furyMode && (rtPressPrecision === '0.001mm' || rtPressPrecision === '0.005mm'))
    ? 0.01
    : parsePrecisionVal(rtPressPrecision);
  const minRtPress = activePressStep;

  const activeReleaseStep = (!furyMode && (rtReleasePrecision === '0.001mm' || rtReleasePrecision === '0.005mm'))
    ? 0.01
    : parsePrecisionVal(rtReleasePrecision);
  const minRtRelease = activeReleaseStep;

  // 当关闭狂暴模式时，如果精度停留在 0.001mm 或 0.005mm，自动降级回 0.01mm
  useEffect(() => {
    if (!furyMode) {
      if (rtPressPrecision === '0.001mm' || rtPressPrecision === '0.005mm') {
        setRtPressPrecision('0.01mm');
      }
      if (rtReleasePrecision === '0.001mm' || rtReleasePrecision === '0.005mm') {
        setRtReleasePrecision('0.01mm');
      }
    }
  }, [furyMode, rtPressPrecision, rtReleasePrecision]);

  // 当精度或最小 RT 变化时，如果当前 RT 小于最小值，自动修正向上对齐
  useEffect(() => {
    if (rtPress < minRtPress) {
      setRtPress(minRtPress);
    }
  }, [minRtPress, rtPress]);

  useEffect(() => {
    if (rtRelease < minRtRelease) {
      setRtRelease(minRtRelease);
    }
  }, [minRtRelease, rtRelease]);

  // 最小触发行程 (AP / 首次触发行程) 与步进（根据键盘 SKU 及狂暴模式动态决定，对齐官网规格 0.01mm ~ 0.001mm）
  const minActuationPoint = useMemo(() => {
    return getMinActuationPoint(deviceProfile, furyMode);
  }, [deviceProfile, furyMode]);

  const activeActuationStep = minActuationPoint < 0.01 ? 0.001 : 0.01;

  useEffect(() => {
    if (actuationPoint < minActuationPoint) {
      setActuationPoint(minActuationPoint);
    }
  }, [minActuationPoint, actuationPoint]);
  // 「连续快速触发」—— 江湾官方 2026-10-13 公告：AE64-MAX 0.04 版固件起支持，
  // 打开后 RT 行程中也支持连续快速触发。显示范围由机型能力位 features.continuousRt 决定。
  const [continuousRt, setContinuousRt] = useState(true);
  const [liveTravels, setLiveTravels] = useState({});

  // ── 迈从式三种参数预览界面状态 ('ap': 触发键程 | 'rt': 快速触发 | 'deadzone': 死区) ──
  const [paramPreviewMode, setParamPreviewMode] = useState('ap');
  const [perKeyPerformances, setPerKeyPerformances] = useState({});
  const [hoveredKeyTooltip, setHoveredKeyTooltip] = useState(null);

  // 页面切换时智能联动预览显示模式
  useEffect(() => {
    if (triggerSubTab === 'deadzone') {
      setParamPreviewMode('deadzone');
    } else if (triggerSubTab === 'trigger') {
      setParamPreviewMode('ap');
    }
  }, [triggerSubTab]);

  // ── 键盘可视化自适应缩放 ──
  // 旧实现把 1u 写死成 52px，轮到 ES68 时整块键盘宽 826px，窄窗口下会左右戳出白卡、
  // 压住右侧快捷栏和左边侧栏。现在按容器**实测宽度**反算 1u。
  //
  // ⚠️ 这里必须用「回调 ref」而不是 useRef + useEffect：
  // 键盘卡片只在 activeTab ∉ {performance, settings} 时渲染。App 启动在首页，
  // 首次 commit 时 kbWrapRef.current === null → 那个 useEffect 直接 return →
  // **ResizeObserver 永远不会被挂上**，之后用户点进驱动页，键盘就永远停在初始 52u 上。
  // 实测（1100 宽 → 容器内宽 656，底板 774）：左右各戳出 58px，压住侧栏与快捷栏。
  // 回调 ref 在「元素挂载/卸载的那一刻」触发，无论晚多久挂载都能接上。
  const KEY_GAP_PX = 6;                 // 与行/列 gap-1.5 保持一致
  const KB_UNIT_STANDARD = 50;          // 统一黄金标准键帽尺寸 (60/64/68/75 等主流电竞配列完全恒定，绝不缩水压扁)
  const KB_UNIT_MIN = 34;                // 保证最小窗口下按键依然足够大且字号清晰，绝不缩成微型按键
  const KB_UNIT_MAX = 64;                // 允许大屏与全屏下充分伸展，界面以键盘展示为主视觉核心

  const layoutBounds = useMemo(() => getLayoutBounds(ACTIVE_LAYOUT), [ACTIVE_LAYOUT]);
  const kbTotalWidthUnits = layoutBounds.widthUnits;
  const kbTotalHeightUnits = layoutBounds.heightUnits;

  // 初始值根据当前视口与当前配列总宽动态预估
  const [kbUnit, setKbUnit] = useState(() => {
    if (typeof window !== 'undefined') {
      const winW = window.innerWidth || 1280;
      const winH = window.innerHeight || 800;
      const estimatedW = Math.max(500, winW - 440);
      const estimatedH = Math.max(220, 240);
      const totalW = layoutBounds.widthUnits || 16;
      const totalH = layoutBounds.heightUnits || 5;
      const uW = (estimatedW + KEY_GAP_PX) / totalW;
      const uH = (estimatedH + KEY_GAP_PX) / totalH;
      let initU = Math.floor(Math.min(uW, uH));
      if (totalW <= 16.5 && uW >= 48 && uH >= 48) {
        initU = KB_UNIT_STANDARD;
      }
      return Math.max(KB_UNIT_MIN, Math.min(KB_UNIT_MAX, initU));
    }
    return 50;
  });
  const kbObserverRef = useRef(null);
  const kbWrapElRef = useRef(null);
  const kbKeyHeight = kbUnit; // 1:1 物理键帽真实比例，彻底杜绝上下扁平压扁

  const recalcKb = useCallback((entries) => {
    const el = kbWrapElRef.current;
    if (!el && typeof window === 'undefined') return;

    let availW = el ? el.clientWidth - 20 : 0;
    let availH = el ? el.clientHeight - 16 : 0;

    if (Array.isArray(entries) && entries[0]?.contentRect) {
      availW = entries[0].contentRect.width - 20;
      availH = entries[0].contentRect.height - 16;
    }

    if (availW <= 0 && typeof window !== 'undefined') {
      availW = Math.max(500, (window.innerWidth || 1280) - 440);
    }
    if (availH <= 0 && typeof window !== 'undefined') {
      availH = Math.max(220, 240);
    }

    const totalW = layoutBounds.widthUnits || 16;
    const totalH = layoutBounds.heightUnits || 5;

    // 按宽度反算的 1u
    const unitFromW = totalW > 0 ? (availW + KEY_GAP_PX) / totalW : 50;
    // 按高度反算的 1u (1:1 物理真实比例，键高与键宽相等)
    const unitFromH = totalH > 0 ? (availH + KEY_GAP_PX) / totalH : 50;

    // 核心显示原则：主流配列 (60/64/68/75，宽度 <= 16.5u) 在可用空间允许时，恒定锁定 50px 黄金标准键位！
    // 使得用户切换 64/68/75 配列时，按键物理视觉尺寸保持完全一致，绝不会因为多了 F 区而缩水、扁平或变形！
    let optimalUnit = Math.floor(Math.min(unitFromW, unitFromH));
    if (totalW <= 16.5 && availH >= totalH * 46 && availW >= totalW * 46) {
      optimalUnit = KB_UNIT_STANDARD;
    }

    const next = Math.max(KB_UNIT_MIN, Math.min(KB_UNIT_MAX, optimalUnit));
    setKbUnit((prev) => (prev === next ? prev : next));
  }, [layoutBounds, activeTab]);

  const kbWrapRef = useCallback((el) => {
    kbWrapElRef.current = el;
    if (kbObserverRef.current) {
      kbObserverRef.current.disconnect();
      kbObserverRef.current = null;
    }
    if (!el) return;

    recalcKb();
    const ro = new ResizeObserver(recalcKb);
    ro.observe(el);
    kbObserverRef.current = ro;
    window.addEventListener('resize', recalcKb);
    el.__kbRecalc = recalcKb;
  }, [recalcKb]);

  // 当 profile / layout 变化时，立即重算 1u
  useEffect(() => {
    recalcKb();
  }, [recalcKb, deviceProfile, ACTIVE_LAYOUT]);

  // 卸载时清理窗口监听
  useEffect(() => () => {
    const el = kbWrapElRef.current || document.querySelector('.app-content .flex-1.min-w-0 > div.p-4');
    if (el && el.__kbRecalc) window.removeEventListener('resize', el.__kbRecalc);
    if (kbObserverRef.current) kbObserverRef.current.disconnect();
  }, []);

  // 轴体 SKU 与独立按键指派状态 (根据连接的机型部署原生出厂轴体，公模/客制化默认搭载磁玉 Pro)
  const [axisList, setAxisList] = useState(PRIMARY_AXES);
  const [currentAxis, setCurrentAxis] = useState(() => getDefaultAxisForProfile(deviceProfile));
  const [perKeySwitches, setPerKeySwitches] = useState({});

  // 切换或连接不同键盘时，自动部署该机型的出厂默认轴体
  useEffect(() => {
    const def = getDefaultAxisForProfile(deviceProfile);
    setCurrentAxis(def);
    setActuationPoint(def.recommendedAP || 0.40);
    setHardwareIsDoubleLight(null);
  }, [deviceProfile]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(qs.get('modal') === 'calibration');
  const [isCalibrating, setIsCalibrating] = useState(false);

  // 高级按键 SOCD 对冲按键对状态 (按设备独立隔离，默认不配置)
  const [socdKeys, setSocdKeys] = useState({ keyA: null, keyB: null });

  // 高级按键统一配置列表 (包含 SOCD, DKS, RS, MPT, MT, TGL, END 等，按设备独立隔离，在键盘各键上实时呈现真实徽标)
  const [configuredHigherKeys, setConfiguredHigherKeys] = useState([]);

  // 设备切换隔离加载高级键配置
  useEffect(() => {
    if (!currentDeviceScopeKey) return;
    
    // 迁移老版本无设备作用域的全局配置（首次迁移至 AE64-MAX，避免历史数据丢失，并清除全局污染源）
    try {
      const legacyGlobal = localStorage.getItem('sparklink_configured_higher_keys');
      if (legacyGlobal) {
        const targetKey = 'sparklink_configured_higher_keys_profile_ae64_max';
        if (!localStorage.getItem(targetKey)) {
          localStorage.setItem(targetKey, legacyGlobal);
        }
        localStorage.removeItem('sparklink_configured_higher_keys');
      }
    } catch (e) {}

    const storageKey = `sparklink_configured_higher_keys_${currentDeviceScopeKey}`;
    try {
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setConfiguredHigherKeys(parsed.filter(item => item && item.id && !item.id.startsWith('draft-')).slice(0, 20));
          return;
        }
      }
    } catch (e) {}
    setConfiguredHigherKeys([]);
  }, [currentDeviceScopeKey]);

  // SOCD 独立设备加载
  useEffect(() => {
    if (!currentDeviceScopeKey) return;
    const storageKey = `sparklink_socd_keys_${currentDeviceScopeKey}`;
    try {
      const local = localStorage.getItem(storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          setSocdKeys({ keyA: parsed.keyA || null, keyB: parsed.keyB || null });
          return;
        }
      }
    } catch (e) {}
    setSocdKeys({ keyA: null, keyB: null });
  }, [currentDeviceScopeKey]);

  // 当高级键配置列表变更时，确保 socdKeys 与 configuredHigherKeys 保持一致（无 SOCD 配置时立即清空，避免孤立残留）
  useEffect(() => {
    const socdItem = configuredHigherKeys.find(item => item && item.type === 'SOCD');
    if (socdItem && Array.isArray(socdItem.keys) && socdItem.keys.length >= 2) {
      const keyA = `Key${String(socdItem.keys[0]).replace(/^Key/, '')}`;
      const keyB = `Key${String(socdItem.keys[1]).replace(/^Key/, '')}`;
      setSocdKeys({ keyA, keyB });
      if (currentDeviceScopeKey) {
        try {
          localStorage.setItem(`sparklink_socd_keys_${currentDeviceScopeKey}`, JSON.stringify({ keyA, keyB }));
        } catch (e) {}
      }
    } else {
      setSocdKeys({ keyA: null, keyB: null });
      if (currentDeviceScopeKey) {
        try {
          localStorage.removeItem(`sparklink_socd_keys_${currentDeviceScopeKey}`);
        } catch (e) {}
      }
    }
  }, [configuredHigherKeys, currentDeviceScopeKey]);

  // 全局灯光模式与动态动效状态 (从板载内存同步，并在顶部虚拟键盘动态演算渲染)
  const [lightingMode, setLightingMode] = useState(() => {
    const qMode = qs.get('lightMode') || qs.get('mode');
    if (qMode !== null && !isNaN(Number(qMode))) return Number(qMode);
    return 1;
  }); // 真实硬件 mode (默认 1: 随波逐流)
  const [selectStaticColor, setSelectStaticColor] = useState(0); // 0=炫彩彩虹, 1~7=单色预设
  const [lightingBrightness, setLightingBrightness] = useState(75);
  const [lightingSpeed, setLightingSpeed] = useState(50);
  const [lightingDirection, setLightingDirection] = useState(0); // 0=正向流动 (Forward), 1=反向流动 (Backward)
  const [isLightingOn, setIsLightingOn] = useState(true);
  const [animTick, setAnimTick] = useState(0);

  // 虚拟键盘 30fps 实时灯效动效 Tick（仅在处于灯光配置 Tab 时运行，节约系统资源）
  useEffect(() => {
    if (activeTab !== 'lighting') return;
    let animId;
    let lastTime = performance.now();
    const loop = (now) => {
      if (now - lastTime >= 33) {
        setAnimTick((prev) => (prev + 1) % 100000);
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  // ── 实时读取物理键盘灯光 (对齐官方 v2-views Zc 架构，通过官方 HID 协议实时读取当前发光物理 LED 矩阵) ──
  // 默认常驻开启 (true)；仅在进入「灯光设置」时与键盘进行 HID 实时灯光通讯；离开灯光界面时自动停止通讯并由键盘留存板载预设
  const [isLiveHwLightingSync, setIsLiveHwLightingSync] = useState(() => {
    try {
      const stored = localStorage.getItem('sparklink_live_hw_lighting_sync');
      return stored !== null ? stored === 'true' : true;
    } catch (e) {
      return true;
    }
  });
  const [liveHardwareMatrix, setLiveHardwareMatrix] = useState(null);

  // 物理灯光高频轮询监听 (仅在处于灯光 Tab 且设备已连接时进行通讯；离开灯光 Tab 时立即挂起轮询，留存键盘板载预设)
  useEffect(() => {
    if (!isLiveHwLightingSync || !isConnected || activeTab !== 'lighting') {
      setLiveHardwareMatrix(null);
      return;
    }

    let isMounted = true;
    let isFetching = false;
    let timerId = null;

    // 动态同步间隔：对齐官方 Gc(lightingSpeed): 110 - Math.floor(speed / 10) * 10 ms
    const pollInterval = Math.max(50, Math.min(120, 110 - Math.floor((lightingSpeed || 50) / 10) * 10));

    const fetchLiveLighting = async () => {
      if (!isMounted || isFetching) return;
      isFetching = true;
      try {
        const matrix = await keyboardService.getLightingCustom('Keyboard', 6, 21);
        if (isMounted && Array.isArray(matrix) && Array.isArray(matrix[0])) {
          setLiveHardwareMatrix(matrix);
        }
      } catch (err) {
        // 降低控制台高频重试噪音
      } finally {
        isFetching = false;
        if (isMounted) {
          timerId = setTimeout(fetchLiveLighting, pollInterval);
        }
      }
    };

    fetchLiveLighting();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      setLiveHardwareMatrix(null);
    };
  }, [isLiveHwLightingSync, isConnected, activeTab, lightingSpeed]);

  const handleToggleLiveHwLightingSync = useCallback(() => {
    setIsLiveHwLightingSync((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sparklink_live_hw_lighting_sync', String(next));
      } catch (e) {}
      if (next) {
        if (isConnected) {
          addToast({ message: '已开启【实时读取物理灯效】：虚拟键盘将 1:1 实时直读物理单片机发光矩阵', type: 'success' });
        } else {
          addToast({ message: '物理直读已就绪：检测到设备离线，当前运行 30FPS 算法动画；连接物理键盘后将无缝直读', type: 'info' });
        }
      } else {
        addToast({ message: '已切换为【驱动内置高精算法动画】(30 FPS 流畅演算)', type: 'info' });
        setLiveHardwareMatrix(null);
      }
      return next;
    });
  }, [isConnected, addToast]);

  // 自定义按键灯光状态 (对齐截屏4)
  const [customKeyColors, setCustomKeyColors] = useState({});
  const [currentLightingColor, setCurrentLightingColor] = useState('#0284C7');
  const [pollingRate, setPollingRate] = useState(8000);

  // 灯光区域 (AE64-MAX 上下双灯设计)：lightingAreas 存硬件上报灯区，decorateColors 存装饰灯带逐颗颜色
  const [lightingAreas, setLightingAreas] = useState([]);
  const [decorateColors, setDecorateColors] = useState([]); // [{ index, hex }]
  const [hardwareIsDoubleLight, setHardwareIsDoubleLight] = useState(null);

  // 综合判定是否双灯键盘 (AE64-MAX 等上下双灯位设计)：
  // 1. 硬件 probe 直接上报双灯
  // 2. deviceProfile 标记 doubleLight / doubleLighting / dualLamps / isDoubleLighting
  // 3. features 数组中包含 '双灯位' / '双灯'
  // 4. 型号名称或芯片设备名包含 AE64 / DUAL / 双灯
  const isDoubleLight = useMemo(() => {
    if (hardwareIsDoubleLight === true) return true;
    if (deviceProfile?.features?.doubleLight || deviceProfile?.features?.doubleLighting) return true;
    if (Array.isArray(deviceProfile?.features) && deviceProfile.features.some(f => typeof f === 'string' && f.includes('双灯'))) return true;
    if (deviceProfile?.lighting?.dualLamps || deviceProfile?.lightingTopology?.isDoubleLighting || deviceProfile?.isDoubleLighting) return true;
    if (deviceProfile?._hardwareDetails?.lampStructure?.includes('双灯')) return true;
    
    // 型号与名称启发式兜底：江湾 AE64-MAX 及其衍生客制化双灯内胆全量支持
    const combinedName = `${deviceProfile?.model || ''} ${deviceProfile?.name || ''} ${deviceProfile?.shortName || ''} ${chipDeviceName || ''}`.toUpperCase();
    if (combinedName.includes('AE64') || combinedName.includes('双灯') || combinedName.includes('DUAL LAMP') || combinedName.includes('DUAL_LAMP')) {
      return true;
    }
    return false;
  }, [hardwareIsDoubleLight, deviceProfile, chipDeviceName]);

  const [topLightEnabled, setTopLightEnabled] = useState(true); // 上位灯光开关 (针对双灯位机型)
  const [bottomLightEnabled, setBottomLightEnabled] = useState(true); // 下位灯光开关 (针对双灯位机型)
  const [lightingLinked, setLightingLinked] = useState(true); // 上下灯位联动状态 (默认开启联动，操作任一开关同步控制上下灯)
  const [spaceMultiLampEnabled, setSpaceMultiLampEnabled] = useState(true); // 空格5灯独立设置 (对齐官方驱动与用户截图)

  // 贯穿式底灯/装饰灯带专属状态 (对齐前行者 ES68 驱动 & 星闪底层协议)
  const [activeLightingArea, setActiveLightingArea] = useState('keyboard'); // 'keyboard' | 'decorate1' | 'decorate2'
  const [stripMode, setStripMode] = useState(1); // 默认 1: 随波逐流 (0=常亮, 1=随波逐流, 7=闪耀彩虹, 15=流光漫延)
  const [stripBrightness, setStripBrightness] = useState(100);
  const [stripSpeed, setStripSpeed] = useState(50);
  const [stripDirection, setStripDirection] = useState(0); // 0=逆时针 (Forward), 1=顺时针 (Backward)
  const [stripLightEnabled, setStripLightEnabled] = useState(true);
  const [stripStaticColor, setStripStaticColor] = useState(0); // 0=炫彩彩虹, 1~7=单色预设
  const [stripCustomColors, setStripCustomColors] = useState({}); // { [ledIndex]: hex }
  const [stripSimViewMode, setStripSimViewMode] = useState('unified'); // 'unified' | 'split'

  // 用户可针对当前客制化板子微调底灯数量（解决不同板子物理底灯数量差异导致末尾灯珠控制不上）
  const [customStripCount, setCustomStripCount] = useState(() => {
    try {
      const devId = deviceProfile?.id || 'default';
      const saved = localStorage.getItem(`strip_led_count_${devId}`);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const handleUpdateStripCount = (newCount) => {
    const val = Math.max(1, Math.min(64, newCount));
    setCustomStripCount(val);
    try {
      const devId = deviceProfile?.id || 'default';
      localStorage.setItem(`strip_led_count_${devId}`, String(val));
    } catch {}
    addToast({ message: `底灯数量已设为 ${val} 颗 LED！`, type: 'info' });
  };

  // 动态底灯/装饰灯规格 (支持真实硬件探测、客制化板子数量自定义、AE64-MAX 34颗 [17, 17] / ES68 26颗 [13, 13])
  const decorateConfig = useMemo(() => {
    return getDecorateLightingConfig(deviceProfile, lightingAreas[1], customStripCount);
  }, [deviceProfile, lightingAreas, customStripCount]);
  const bottomLedCount = decorateConfig.count;
  const hasDecorateLighting = (lightingAreas && lightingAreas.length > 1) || !!deviceProfile?.features?.decorateLighting || !!deviceProfile?.features?.stripLighting || (deviceProfile?.model && (deviceProfile.model.includes('AE64') || deviceProfile.model.includes('ES68')));

  // 改键映射状态 (按设备独立隔离，按层级 win_default, win_fn, mac_default, mac_fn)
  const [activeKeybindLayer, setActiveKeybindLayer] = useState('win_default');
  const [customKeyMappings, setCustomKeyMappings] = useState({
    win_default: {},
    win_fn: {},
    mac_default: {},
    mac_fn: {}
  });

  // 板载配置真切换 (官方 Config1~Config4 硬件槽位)
  const [boardSlots, setBoardSlots] = useState([]); // 硬件返回的配置名列表
  const [activeBoardSlot, setActiveBoardSlot] = useState('Config1'); // 当前激活槽位
  const [boardSlotAliases, setBoardSlotAliases] = useState(() => 
    profileService.getOnboardSlotAliases(currentDeviceScopeKey)
  );
  const [boardSlotRemarks, setBoardSlotRemarks] = useState(() =>
    profileService.getOnboardSlotRemarks(currentDeviceScopeKey)
  );

  useEffect(() => {
    if (currentDeviceScopeKey) {
      setBoardSlotAliases(profileService.getOnboardSlotAliases(currentDeviceScopeKey));
      setBoardSlotRemarks(profileService.getOnboardSlotRemarks(currentDeviceScopeKey));
    }
  }, [currentDeviceScopeKey]);

  // ── 方案与键盘全设置绑定与切换引擎 ──
  const profileSnapshotsRef = useRef({});
  const isSwitchingProfileRef = useRef(false);

  // 初始化或设备作用域切换时，加载该设备的各槽位快照
  useEffect(() => {
    if (!currentDeviceScopeKey) return;
    profileSnapshotsRef.current = profileService.getProfileSettingsStore(currentDeviceScopeKey);
  }, [currentDeviceScopeKey]);

  // 捕获当前正在生效的全部 UI 设置打包为快照
  const captureCurrentSettingsSnapshot = useCallback(() => {
    return {
      performance: {
        actuationPoint,
        rtEnabled,
        rtPress,
        rtRelease,
        deadzone,
        bottomDeadzone,
        shakeFilter,
        antiGhosting,
        furyMode,
        continuousRt,
        pollingRate,
        perKeyPerformances,
      },
      lighting: {
        isLightingOn,
        lightingMode,
        selectStaticColor,
        lightingBrightness,
        lightingSpeed,
        lightingDirection,
        currentLightingColor,
        customKeyColors,
      },
      higherKeys: {
        configuredHigherKeys,
        socdKeys,
      },
      keyMappings: customKeyMappings,
    };
  }, [
    actuationPoint, rtEnabled, rtPress, rtRelease, deadzone, bottomDeadzone,
    shakeFilter, antiGhosting, furyMode, continuousRt, pollingRate, perKeyPerformances,
    isLightingOn, lightingMode, selectStaticColor, lightingBrightness, lightingSpeed,
    lightingDirection, currentLightingColor, customKeyColors, configuredHigherKeys,
    socdKeys, customKeyMappings
  ]);

  // 将某个槽位的快照还原到各 React 状态
  const restoreSettingsSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    const { performance: p, lighting: l, higherKeys: hk, keyMappings: km } = snapshot;
    if (p) {
      if (typeof p.actuationPoint === 'number') setActuationPoint(p.actuationPoint);
      if (typeof p.rtEnabled === 'boolean') setRtEnabled(p.rtEnabled);
      if (typeof p.rtPress === 'number') setRtPress(p.rtPress);
      if (typeof p.rtRelease === 'number') setRtRelease(p.rtRelease);
      if (typeof p.deadzone === 'number') setDeadzone(p.deadzone);
      if (typeof p.bottomDeadzone === 'number') setBottomDeadzone(p.bottomDeadzone);
      if (typeof p.shakeFilter === 'boolean') setShakeFilter(p.shakeFilter);
      if (typeof p.antiGhosting === 'boolean') setAntiGhosting(p.antiGhosting);
      if (typeof p.furyMode === 'boolean') setFuryMode(p.furyMode);
      if (typeof p.continuousRt === 'boolean') setContinuousRt(p.continuousRt);
      if (typeof p.pollingRate === 'number') setPollingRate(p.pollingRate);
      if (p.perKeyPerformances && typeof p.perKeyPerformances === 'object') {
        setPerKeyPerformances(p.perKeyPerformances);
      } else {
        setPerKeyPerformances({});
      }
    }
    if (l) {
      if (typeof l.isLightingOn === 'boolean') setIsLightingOn(l.isLightingOn);
      if (typeof l.lightingMode === 'number') setLightingMode(l.lightingMode);
      if (typeof l.selectStaticColor === 'number') setSelectStaticColor(l.selectStaticColor);
      if (typeof l.lightingBrightness === 'number') setLightingBrightness(l.lightingBrightness);
      if (typeof l.lightingSpeed === 'number') setLightingSpeed(l.lightingSpeed);
      if (typeof l.lightingDirection === 'number') setLightingDirection(l.lightingDirection);
      if (typeof l.currentLightingColor === 'string') setCurrentLightingColor(l.currentLightingColor);
      if (l.customKeyColors && typeof l.customKeyColors === 'object') {
        setCustomKeyColors(l.customKeyColors);
      }
    }
    if (hk) {
      if (Array.isArray(hk.configuredHigherKeys)) setConfiguredHigherKeys(hk.configuredHigherKeys);
      if (hk.socdKeys && typeof hk.socdKeys === 'object') setSocdKeys(hk.socdKeys);
    }
    if (km && typeof km === 'object') {
      setCustomKeyMappings(km);
    }
  }, []);

  // 当用户在当前槽位调节任意键盘参数时，自动保存至当前槽位快照
  useEffect(() => {
    if (isSwitchingProfileRef.current || !currentDeviceScopeKey || !activeBoardSlot) return;
    const snap = captureCurrentSettingsSnapshot();
    if (!profileSnapshotsRef.current) profileSnapshotsRef.current = {};
    profileSnapshotsRef.current[activeBoardSlot] = snap;
    profileService.saveProfileSettingsStore(currentDeviceScopeKey, profileSnapshotsRef.current);
  }, [
    currentDeviceScopeKey, activeBoardSlot, captureCurrentSettingsSnapshot
  ]);

  // 侧边栏方案管理集合按钮悬浮窗交互
  const [showProfileHoverMenu, setShowProfileHoverMenu] = useState(false);
  const [hoverPopoverPos, setHoverPopoverPos] = useState({ top: 0, left: 0 });
  const profileBtnRef = useRef(null);
  const profileHoverTimerRef = useRef(null);

  const handleProfileMouseEnter = () => {
    if (profileHoverTimerRef.current) {
      clearTimeout(profileHoverTimerRef.current);
      profileHoverTimerRef.current = null;
    }
    if (profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      const popoverHeight = 360;
      let top = rect.top - 40;
      if (top + popoverHeight > window.innerHeight - 20) {
        top = Math.max(20, window.innerHeight - popoverHeight - 20);
      }
      if (top < 20) top = 20;
      setHoverPopoverPos({
        top: top,
        left: rect.right + 10
      });
    }
    setShowProfileHoverMenu(true);
  };

  const handleProfileMouseLeave = () => {
    profileHoverTimerRef.current = setTimeout(() => {
      setShowProfileHoverMenu(false);
    }, 220);
  };

  const refreshBoardConfigs = async () => {
    const list = await keyboardService.getBoardConfigList();
    if (list && Array.isArray(list.list)) {
      setBoardSlots(list.list);
    }
    const cur = await keyboardService.getCurrentBoardConfig();
    if (cur) setActiveBoardSlot(cur?.config || cur?.key || String(cur));

    // 从键盘硬件回读官网驱动写入的名称 (如 123、配置二等)
    const hwNames = await keyboardService.getBoardConfigNames();
    if (hwNames && Object.keys(hwNames).length > 0) {
      setBoardSlotAliases((prev) => {
        const merged = { ...prev, ...hwNames };
        profileService.saveOnboardSlotAliases(currentDeviceScopeKey, merged);
        return merged;
      });
    }
  };

  // 核心切换逻辑：切换配置文件槽位 (全量绑定 AP / RT / 死区 / 回报率 / 灯效 / 高级键 / 改键)
  const handleSwitchBoardSlot = async (slotKey) => {
    if (slotKey === activeBoardSlot) return;

    // 1. 保存当前老槽位设置
    if (activeBoardSlot && profileSnapshotsRef.current) {
      profileSnapshotsRef.current[activeBoardSlot] = captureCurrentSettingsSnapshot();
      profileService.saveProfileSettingsStore(currentDeviceScopeKey, profileSnapshotsRef.current);
    }

    isSwitchingProfileRef.current = true;

    // 2. 如果键盘已连接，发送硬件切换指令
    let switchedOnHw = false;
    if (isConnected) {
      switchedOnHw = await keyboardService.setBoardConfig(slotKey);
      if (switchedOnHw) {
        await new Promise((r) => setTimeout(r, 60));

        // 尝试从新槽位回读真实硬件参数 (触发参数、灯光、回报率等)
        try {
          const refKey = ACTIVE_LAYOUT.flat().find((k) => k.id === 'KeyA') || ACTIVE_LAYOUT.flat().find((k) => k.id === 'KeyW');
          if (refKey) {
            const perf = await keyboardService.getPerformance(refKey.row, refKey.col);
            if (perf && typeof perf === 'object') {
              const targetSnap = profileSnapshotsRef.current[slotKey] || profileService.defaultSnapshotForSlot(slotKey);
              const readAP = (perf.mode === 1 && typeof perf.rtFirstTouch === 'number' && perf.rtFirstTouch > 0)
                ? perf.rtFirstTouch
                : perf.normalPress;
              if (typeof readAP === 'number' && readAP > 0) targetSnap.performance.actuationPoint = parseFloat(readAP.toFixed(3));
              if (typeof perf.rtPress === 'number' && perf.rtPress > 0) targetSnap.performance.rtPress = parseFloat(perf.rtPress.toFixed(3));
              if (typeof perf.rtRelease === 'number' && perf.rtRelease > 0) targetSnap.performance.rtRelease = parseFloat(perf.rtRelease.toFixed(3));
              if (typeof perf.pressDeadStroke === 'number' && perf.pressDeadStroke > 0) targetSnap.performance.deadzone = parseFloat(perf.pressDeadStroke.toFixed(3));
              if (typeof perf.releaseDeadStroke === 'number' && perf.releaseDeadStroke > 0) targetSnap.performance.bottomDeadzone = parseFloat(perf.releaseDeadStroke.toFixed(3));
              if (perf.mode !== undefined) targetSnap.performance.rtEnabled = perf.mode === 1;
            }
          }
        } catch (e) {
          console.log('读取新槽位硬件参数跳过', e);
        }
      }
    }

    // 3. 将新槽位的设置恢复到 React 各状态
    const targetSnapshot = profileSnapshotsRef.current[slotKey] || profileService.defaultSnapshotForSlot(slotKey);
    restoreSettingsSnapshot(targetSnapshot);

    // 4. 更新激活槽位
    setActiveBoardSlot(slotKey);

    setTimeout(() => {
      isSwitchingProfileRef.current = false;
    }, 100);

    const slotName = boardSlotAliases[slotKey] || slotKey.replace('Config', '配置 ');
    addToast({
      message: `已切换至「${slotName}」(${slotKey.replace('Config', '板载槽位 #')})，各项键盘设置已跟随同步！`,
      type: 'success'
    });

    // 重新同步硬件矩阵与状态
    keyboardService.getKeyMatrix().then((m) => {
      if (m && m.length === VISUAL_KEY_ORDER.length) {
        const map = {};
        VISUAL_KEY_ORDER.forEach((k, i) => { map[k.id] = m[i]; });
        setHwKeyCoords(map);
      }
    });
  };

  // 重命名板载槽位并写入硬件 Flash (使官网驱动完全同步互通)
  const handleRenameBoardSlot = async (slotKey, newName) => {
    const cleanName = (newName || '').trim();
    if (!cleanName) return false;

    // 1. 本地别名更新与持久化
    const updatedAliases = profileService.setOnboardSlotAlias(currentDeviceScopeKey, slotKey, cleanName);
    setBoardSlotAliases({ ...updatedAliases });

    // 2. 写入键盘硬件 Flash (使官网驱动完全同步互通)
    if (isConnected) {
      const slotIndex = ['Config1', 'Config2', 'Config3', 'Config4'].indexOf(slotKey);
      if (slotIndex >= 0) {
        const ok = await keyboardService.setBoardConfigName(slotIndex, cleanName);
        if (ok) {
          addToast({
            message: `配置已重命名为「${cleanName}」并成功写入键盘硬件！官网驱动将同步显示。`,
            type: 'success'
          });
          return true;
        } else {
          addToast({
            message: `已保存本地名称「${cleanName}」，硬件写入失败，请检查连接。`,
            type: 'warning'
          });
          return false;
        }
      }
    } else {
      addToast({
        message: `已更新名称「${cleanName}」，连接物理键盘后将同步写入板载硬件。`,
        type: 'info'
      });
      return true;
    }
  };

  // 更新用户自定义备注 (杜绝无端猜测，仅由用户自填)
  const handleUpdateSlotRemark = (slotKey, remark) => {
    const updated = profileService.setOnboardSlotRemark(currentDeviceScopeKey, slotKey, remark);
    setBoardSlotRemarks({ ...updated });
  };

  // 应用本地配置到键盘硬件
  const handleApplyProfileToHardware = async (params) => {
    if (!params) return false;
    if (params.actuationPoint !== undefined) setActuationPoint(params.actuationPoint);
    if (params.rtEnabled !== undefined) setRtEnabled(params.rtEnabled);
    if (params.rtPress !== undefined) {
      setRtPress(params.rtPress);
      setRtPressPrecision(`${params.rtPress}mm`);
    }
    if (params.rtRelease !== undefined) {
      setRtRelease(params.rtRelease);
      setRtReleasePrecision(`${params.rtRelease}mm`);
    }
    if (params.initialDeadzone !== undefined) setDeadzone(params.initialDeadzone);
    if (params.bottomDeadzone !== undefined) setBottomDeadzone(params.bottomDeadzone);
    if (params.shakeFilter !== undefined) setShakeFilter(params.shakeFilter);
    if (params.antiGhosting !== undefined) {
      setAntiGhosting(params.antiGhosting);
      keyboardService.setShakeOptimization(params.antiGhosting).catch(() => {});
    }
    if (params.pollingRate !== undefined) {
      setPollingRate(params.pollingRate);
      keyboardService.setPerformance(params.pollingRate).catch(() => {});
    }
    if (params.furyMode !== undefined) setFuryMode(params.furyMode);

    const res = await writePerformanceToKeys({
      normalPress: params.actuationPoint ?? actuationPoint,
      rtFirstTouch: params.actuationPoint ?? actuationPoint,
      rtPress: params.rtPress ?? (params.rtEnabled ? (rtPress || 0.01) : 0),
      rtRelease: params.rtRelease ?? (params.rtEnabled ? (rtRelease || 0.01) : 0),
      deadZoneTop: params.initialDeadzone ?? deadzone,
      deadZoneBottom: params.bottomDeadzone ?? bottomDeadzone,
      filter: params.shakeFilter ?? shakeFilter,
      mode: params.rtEnabled !== undefined ? (params.rtEnabled ? 1 : 0) : (rtEnabled ? 1 : 0)
    }, '写入方案');

    // 同步更新当前槽位的快照缓存与持久化，防止切槽位后丢失
    if (activeBoardSlot && profileSnapshotsRef.current) {
      const currentSnap = profileSnapshotsRef.current[activeBoardSlot] || profileService.defaultSnapshotForSlot(activeBoardSlot);
      if (!currentSnap.performance) currentSnap.performance = {};
      if (params.actuationPoint !== undefined) currentSnap.performance.actuationPoint = params.actuationPoint;
      if (params.rtEnabled !== undefined) currentSnap.performance.rtEnabled = params.rtEnabled;
      if (params.rtPress !== undefined) currentSnap.performance.rtPress = params.rtPress;
      if (params.rtRelease !== undefined) currentSnap.performance.rtRelease = params.rtRelease;
      if (params.initialDeadzone !== undefined) currentSnap.performance.deadzone = params.initialDeadzone;
      if (params.bottomDeadzone !== undefined) currentSnap.performance.bottomDeadzone = params.bottomDeadzone;
      if (params.pollingRate !== undefined) currentSnap.performance.pollingRate = params.pollingRate;
      if (params.furyMode !== undefined) currentSnap.performance.furyMode = params.furyMode;
      profileSnapshotsRef.current[activeBoardSlot] = currentSnap;
      profileService.saveProfileSettingsStore(currentDeviceScopeKey, profileSnapshotsRef.current);
    }

    return res;
  };

  // 防自显优化开关 (与硬件固件双向同步：开启抑制极限精度抖动，关闭直通ADC)
  const handleAntiGhostingChange = async (val) => {
    setAntiGhosting(val);
    if (keyboardService.connected) {
      try {
        await keyboardService.setShakeOptimization(val);
      } catch (e) {
        console.error('[SparkLink HID] 写入防自显开关失败:', e);
      }
    }
    addToast({
      message: val ? '防自显已开启 (已启用硬件抖动抑制，防止极限精度自触)' : '防自显已关闭 (掉电重启后将恢复开启)',
      type: 'info'
    });
  };


  const syncedDeviceIdRef = useRef(null);

  useEffect(() => {
    // 异步加载星闪云端与本地轴体库
    axisService.loadAxisList().then((list) => {
      if (list && list.length > 0) {
        setAxisList(list);
      }
    });

    const unsubscribe = keyboardService.subscribe(async (state) => {
      setIsConnected(state.connected);
      setDevice(state.device || null);
      if (state.info) setHardwareInfo(state.info);
      if (state.deviceFeatures) setHardwareFeatures(state.deviceFeatures);
      if (state.deviceProtocol) setHardwareProtocol(state.deviceProtocol);
      if (state.deviceList && state.deviceList.length > 0) {
        setDiscoveredDevicesList(state.deviceList);
      }
      if (state.profile && !PROFILE_LOCKED) {
        setDeviceProfile(state.profile);
      }

      if (!state.connected || !state.device) {
        syncedDeviceIdRef.current = null;
        return;
      }

      // 关键防抖：同一设备只在首次连接成功时执行一次板载回读，防止频繁重渲染与 USB HID 死锁
      const devKey = `${state.device.vendorId}:${state.device.productId}`;
      if (syncedDeviceIdRef.current === devKey) {
        return;
      }
      syncedDeviceIdRef.current = devKey;

      if (state.connected) {
        // 自动读取星闪键盘出厂硬件参数与 SN 码
        keyboardService.getHardwareInfo().then((info) => {
          if (info) setHardwareInfo(info);
        });

        try {
          const hwRate = await keyboardService.getRateOfReturn();
          if (hwRate) {
            setPollingRate(hwRate);
          }
        } catch (e) {
          console.log('读取键盘回报率跳过', e);
        }

        // 读取硬件防自显开关状态 (掉电或默认重置为开启状态)
        try {
          const hwShake = await keyboardService.getShakeOptimization();
          if (typeof hwShake === 'boolean') {
            setAntiGhosting(hwShake);
          }
        } catch (e) {
          console.log('读取防自显状态跳过', e);
        }

        // 初始硬件参数检测 (回报率与出厂轴体)

        try {
          // 先尝试从 Esc 键电气配置获取真实板载 axisV2Id 和 axisRangeMax (AE64-MAX 硬件上报 axisV2Id: 12608 -> 天际线轴)
          const escPerf = await keyboardService.getPerformance(1, 0);
          if (escPerf && (escPerf.axisV2Id || escPerf.axisRangeMax)) {
            const detectedAxis = axisService.resolveAxisByHardwarePerf(escPerf, deviceProfile);
            if (detectedAxis) {
              console.log('[App] 从硬件 Esc 键检测到当前真实轴体:', detectedAxis.name, detectedAxis.maxTravel);
              setCurrentAxis(detectedAxis);
            }
          } else {
            const hwAxis = await keyboardService.getDefaultAxis();
            if (hwAxis && hwAxis.id) {
              const found = axisService.getAxisById(hwAxis.id);
              if (found) setCurrentAxis(found);
            }
          }
        } catch (e) {
          console.log('读取键盘当前轴体略过', e);
        }

        // 连接后回读板载灯光基础参数 (模式、亮度、速度、开关、色彩)
        try {
          const hwLight = await keyboardService.getLightingBase('Keyboard', 'Base', isDoubleLight ? 'DoubleLighting' : 'SingleLighting');
          if (hwLight && typeof hwLight === 'object') {
            if (typeof hwLight.mode === 'number') {
              setLightingMode(hwLight.mode); // 直接使用真实硬件 mode (0~19)
            }
            if (typeof hwLight.selectStaticColor === 'number') {
              setSelectStaticColor(hwLight.selectStaticColor);
            }
            if (typeof hwLight.luminance === 'number') {
              setLightingBrightness(hwLight.luminance);
            }
            if (typeof hwLight.speed === 'number') {
              setLightingSpeed(hwLight.speed);
            }
            if (hwLight.direction !== undefined) {
              const dirNum = (hwLight.direction === 1 || hwLight.direction === 'Backward') ? 1 : 0;
              setLightingDirection(dirNum);
            }
            if (hwLight.open !== undefined) {
              const rawOpen = hwLight.open;
              const isTop = rawOpen === 'Open' || rawOpen === 'OpenUp' || rawOpen === 3 || rawOpen === 2 || rawOpen === true;
              const isBottom = rawOpen === 'Open' || rawOpen === 'OpenDown' || rawOpen === 3 || rawOpen === 1 || rawOpen === true;
              const isOpen = isTop || isBottom;
              setIsLightingOn(isOpen);
              setTopLightEnabled(isTop);
              setBottomLightEnabled(isBottom);
            }
            console.log('[SparkLink HID] 已从板载内存同步灯光参数:', hwLight);
          }
        } catch (e) {
          console.log('读取板载灯光参数跳过', e);
        }

        // 连接后回读真实硬件按键 (优先 KeyA / KeyW) 的板载触发性能参数，让界面与键盘同步
        try {
          const refKey = ACTIVE_LAYOUT.flat().find((k) => k.id === 'KeyA') || ACTIVE_LAYOUT.flat().find((k) => k.id === 'KeyW');
          if (refKey) {
            const perf = await keyboardService.getPerformance(refKey.row, refKey.col);
            if (perf && typeof perf === 'object') {
              const readAP = (perf.mode === 1 && typeof perf.rtFirstTouch === 'number' && perf.rtFirstTouch > 0)
                ? perf.rtFirstTouch
                : perf.normalPress;
              if (typeof readAP === 'number' && readAP > 0) {
                setActuationPoint(parseFloat(readAP.toFixed(3)));
              }
              if (typeof perf.rtPress === 'number' && perf.rtPress > 0) {
                setRtPress(parseFloat(perf.rtPress.toFixed(3)));
              }
              if (typeof perf.rtRelease === 'number' && perf.rtRelease > 0) {
                setRtRelease(parseFloat(perf.rtRelease.toFixed(3)));
              }
              if (typeof perf.pressDeadStroke === 'number' && perf.pressDeadStroke > 0) {
                setDeadzone(parseFloat(perf.pressDeadStroke.toFixed(3)));
              }
              if (typeof perf.releaseDeadStroke === 'number' && perf.releaseDeadStroke > 0) {
                setBottomDeadzone(parseFloat(perf.releaseDeadStroke.toFixed(3)));
              }
              if (perf.mode !== undefined) {
                setRtEnabled(perf.mode === 1);
              }
              console.log('[SparkLink HID] 已从键盘板载内存回读触发参数同步 UI (' + refKey.id + '):', perf);
            }
          }
        } catch (e) {
          console.log('回读键盘触发参数跳过', e);
        }
      }
    });

    // 初始执行一次连接尝试
    keyboardService.autoConnect().catch(() => {});
    refreshAuthorizedDevices(true);

    // 连接后探测灯光区域 (主键盘 + 上下装饰灯带) 与板载配置槽位、双灯状态
    keyboardService.getLightingAreas().then((areas) => setLightingAreas(areas));
    keyboardService.isDoubleLighting().then((v) => {
      if (v === 1) setHardwareIsDoubleLight(true);
      else if (v === 0) setHardwareIsDoubleLight(false);
    });
    refreshBoardConfigs();

    // 硬件即插即用原生事件监听
    const onHidChange = () => {
      syncedDeviceIdRef.current = null;
      refreshAuthorizedDevices(true);
    };
    navigator.hid?.addEventListener?.('connect', onHidChange);
    navigator.hid?.addEventListener?.('disconnect', onHidChange);

    // 守护心跳：仅在未连接时每 4 秒尝试一次自动发现；一旦连接，绝不再发起多余硬件指令！
    const autoScanInterval = setInterval(() => {
      if (!keyboardService.connected) {
        refreshAuthorizedDevices(true);
      }
    }, 4000);

    // 按键超时定时器集合，防止系统全局热键（如 QQ 截图 Ctrl+Alt+A、Win+Shift+S 等）截断事件导致按键永久常驻挂死
    const keyTimersMap = new Map();

    const clearAllLiveTravels = () => {
      keyTimersMap.forEach((timer) => clearTimeout(timer));
      keyTimersMap.clear();
      setLiveTravels((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    };

    // 校验物理修饰键真实状态（通过 MouseEvent / KeyboardEvent 的 ctrlKey, altKey, shiftKey, metaKey 真实硬件状态）
    const syncModifierStates = (e) => {
      setLiveTravels((prev) => {
        let changed = false;
        const next = { ...prev };

        if (!e.ctrlKey && (next['ControlLeft'] || next['ControlRight'])) {
          delete next['ControlLeft'];
          delete next['ControlRight'];
          if (keyTimersMap.has('ControlLeft')) { clearTimeout(keyTimersMap.get('ControlLeft')); keyTimersMap.delete('ControlLeft'); }
          if (keyTimersMap.has('ControlRight')) { clearTimeout(keyTimersMap.get('ControlRight')); keyTimersMap.delete('ControlRight'); }
          changed = true;
        }
        if (!e.altKey && (next['AltLeft'] || next['AltRight'])) {
          delete next['AltLeft'];
          delete next['AltRight'];
          if (keyTimersMap.has('AltLeft')) { clearTimeout(keyTimersMap.get('AltLeft')); keyTimersMap.delete('AltLeft'); }
          if (keyTimersMap.has('AltRight')) { clearTimeout(keyTimersMap.get('AltRight')); keyTimersMap.delete('AltRight'); }
          changed = true;
        }
        if (!e.shiftKey && (next['ShiftLeft'] || next['ShiftRight'])) {
          delete next['ShiftLeft'];
          delete next['ShiftRight'];
          if (keyTimersMap.has('ShiftLeft')) { clearTimeout(keyTimersMap.get('ShiftLeft')); keyTimersMap.delete('ShiftLeft'); }
          if (keyTimersMap.has('ShiftRight')) { clearTimeout(keyTimersMap.get('ShiftRight')); keyTimersMap.delete('ShiftRight'); }
          changed = true;
        }
        if (!e.metaKey && (next['MetaLeft'] || next['MetaRight'] || next['OSLeft'] || next['OSRight'])) {
          delete next['MetaLeft'];
          delete next['MetaRight'];
          delete next['OSLeft'];
          delete next['OSRight'];
          if (keyTimersMap.has('MetaLeft')) { clearTimeout(keyTimersMap.get('MetaLeft')); keyTimersMap.delete('MetaLeft'); }
          if (keyTimersMap.has('MetaRight')) { clearTimeout(keyTimersMap.get('MetaRight')); keyTimersMap.delete('MetaRight'); }
          changed = true;
        }

        return changed ? next : prev;
      });
    };

    const handleKeyDown = (e) => {
      syncModifierStates(e);
      setLiveTravels((prev) => {
        if (prev[e.code] === 0.95) return prev;
        return { ...prev, [e.code]: 0.95 };
      });

      // 自动超时熔断器：如果 1.2 秒内既无按键长按重复也未收到 keyup（被外部截图工具抢占焦点），自动释放
      if (keyTimersMap.has(e.code)) {
        clearTimeout(keyTimersMap.get(e.code));
      }
      const t = setTimeout(() => {
        setLiveTravels((prev) => {
          if (!prev[e.code]) return prev;
          const copy = { ...prev };
          delete copy[e.code];
          return copy;
        });
        keyTimersMap.delete(e.code);
      }, 1200);
      keyTimersMap.set(e.code, t);
    };

    const handleKeyUp = (e) => {
      if (keyTimersMap.has(e.code)) {
        clearTimeout(keyTimersMap.get(e.code));
        keyTimersMap.delete(e.code);
      }
      setLiveTravels((prev) => {
        if (!prev[e.code]) return prev;
        const copy = { ...prev };
        delete copy[e.code];
        return copy;
      });
      syncModifierStates(e);
    };

    // 窗口失焦（如呼出 QQ 截图、Win+Shift+S、Alt+Tab 切走、锁屏）时立刻清空所有按压残留
    const handleWindowBlur = () => {
      clearAllLiveTravels();
    };

    // 窗口重获焦点时也执行一次复位清空
    const handleWindowFocus = () => {
      clearAllLiveTravels();
    };

    // 页面可见性改变（最小化、遮挡、后台）时清空
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAllLiveTravels();
      }
    };

    // 鼠标在页面内移动或点击时，自动根据 e.ctrlKey, e.altKey 等硬件状态矫正修饰键
    const handlePointerActivity = (e) => {
      syncModifierStates(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handlePointerActivity, { passive: true });
    window.addEventListener('mousedown', handlePointerActivity, { passive: true });

    // 监听托盘右键设备选择事件 (对齐图五：从托盘点击特定设备呼出驱动并直接定位)
    let unsubscribeTray = null;
    if (window.electronAPI?.onShowDevice) {
      unsubscribeTray = window.electronAPI.onShowDevice((devId) => {
        setCurrentView('device');
      });
    }

    return () => {
      unsubscribe();
      if (unsubscribeTray) unsubscribeTray();
      clearInterval(autoScanInterval);
      clearAllLiveTravels();
      navigator.hid?.removeEventListener?.('connect', onHidChange);
      navigator.hid?.removeEventListener?.('disconnect', onHidChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handlePointerActivity);
      window.removeEventListener('mousedown', handlePointerActivity);
    };
  }, []);

  // 用户明确要求：开局 32k 的提示要到进入有 32k 的键盘页面才会提示，绝不在主菜单提示！
  useEffect(() => {
    // 门禁 1：若当前不在键盘详情页面 (currentView !== 'device')，或未连接，绝不自动弹窗
    if (currentView !== 'device') {
      setShowUsb3DriverModal(false);
      return;
    }
    if (!isConnected) {
      return;
    }

    // 门禁 2：若用户已设置不再提醒，不弹窗
    let isDismissed = false;
    try {
      isDismissed = localStorage.getItem('sparklink_usb3_prompt_dismissed') === 'true';
    } catch (e) {}
    if (isDismissed) return;

    // 门禁 3：仅当进入的键盘是真正具备 32K / 16K 高回报率方案的设备时才提示
    const hardCeiling = deviceProfile?.hardRateCeiling || deviceProfile?.hardwareMaxPollingRate || deviceProfile?.maxPollingRate || 8000;
    const is32kKeyboard =
      hardCeiling >= 16000 ||
      (device?.productName && (device.productName.includes('32K') || device.productName.includes('32k') || device.productName.includes('16K'))) ||
      (deviceProfile?.name && (deviceProfile.name.includes('32K') || deviceProfile.name.includes('32k') || deviceProfile.name.includes('16K'))) ||
      (deviceProfile?.scheme && (deviceProfile.scheme.includes('32K') || deviceProfile.scheme.includes('32k'))) ||
      (Array.isArray(deviceProfile?.features) && deviceProfile.features.some((f) => String(f).includes('32K') || String(f).includes('32k')));

    if (!is32kKeyboard) return;

    // 异步查询真实硬件驱动状态
    keyboardService.getUSBModeStatus().then((usbStatus) => {
      if (usbStatus && usbStatus.driverStatus === 1 && !usbStatus.needInstallDriver) {
        return; // 专用驱动已安装且正常工作，不打扰用户
      }
      setShowUsb3DriverModal(true);
    }).catch(() => {
      setShowUsb3DriverModal(true);
    });
  }, [currentView, isConnected, deviceProfile?.id, device?.id]);

  // 键盘 1u 自适应的观察器挂在 kbWrapRef 这个「回调 ref」里，见上方注释。
  // （旧实现在这里放了 useRef + useEffect，元素未挂载时观察器永远挂不上，已移除。）

  const handleSelectWASD = () => {
    setSelectedKeys(new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']));
  };

  const handleSelectAll = () => {
    const all = new Set();
    ACTIVE_LAYOUT.forEach(row => row.forEach(k => {
      if (k && !k.isSpacer && !k.gap && k.id) all.add(k.id);
    }));
    setSelectedKeys(all);
  };

  const handleInvertSelect = () => {
    const inverted = new Set();
    ACTIVE_LAYOUT.forEach(row => row.forEach(k => {
      if (k && !k.isSpacer && !k.gap && k.id && !selectedKeys.has(k.id)) {
        inverted.add(k.id);
      }
    }));
    setSelectedKeys(inverted);
  };

  const handleClearSelect = () => {
    setSelectedKeys(new Set());
  };

  // 高级按键专属：点按虚拟键盘即刻直接填充目标槽位
  const [lastAdvancedKeyClick, setLastAdvancedKeyClick] = useState(null);

  const toggleKey = async (keyId) => {
    if (activeTab === 'advanced') {
      const found = ACTIVE_LAYOUT.flat().find(k => k && k.id === keyId);
      const char = found?.label || keyId.replace(/^Key/, '');
      setLastAdvancedKeyClick({ keyId, char, time: Date.now() });
      return;
    }

    let willBeSelected = false;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
        willBeSelected = false;
      } else {
        next.add(keyId);
        willBeSelected = true;
      }
      return next;
    });

    if (willBeSelected) {
      const localPerf = perKeyPerformances[keyId];
      if (localPerf) {
        if (typeof localPerf.normalPress === 'number') setActuationPoint(localPerf.normalPress);
        if (typeof localPerf.rtPress === 'number') setRtPress(localPerf.rtPress);
        if (typeof localPerf.rtRelease === 'number') setRtRelease(localPerf.rtRelease);
        if (localPerf.mode !== undefined) setRtEnabled(localPerf.mode === 1);
        if (typeof localPerf.pressDeadStroke === 'number') setDeadzone(localPerf.pressDeadStroke);
        if (typeof localPerf.releaseDeadStroke === 'number') setBottomDeadzone(localPerf.releaseDeadStroke);
      } else if (isConnected) {
        // 若当前连接在线，尝试从键盘板载内存读取该按键的触发与 RT 参数并同步面板
        const hw = findHwCoords(keyId);
        if (hw) {
          try {
            const perf = await keyboardService.getPerformance(hw.row, hw.col);
            if (perf && typeof perf === 'object') {
              if (typeof perf.normalPress === 'number' && perf.normalPress > 0) {
                setActuationPoint(parseFloat(perf.normalPress.toFixed(3)));
              }
              if (typeof perf.rtPress === 'number' && perf.rtPress > 0) {
                setRtPress(parseFloat(perf.rtPress.toFixed(3)));
              }
              if (typeof perf.rtRelease === 'number' && perf.rtRelease > 0) {
                setRtRelease(parseFloat(perf.rtRelease.toFixed(3)));
              }
              if (typeof perf.pressDeadStroke === 'number' && perf.pressDeadStroke > 0) {
                setDeadzone(parseFloat(perf.pressDeadStroke.toFixed(3)));
              }
              if (typeof perf.releaseDeadStroke === 'number' && perf.releaseDeadStroke > 0) {
                setBottomDeadzone(parseFloat(perf.releaseDeadStroke.toFixed(3)));
              }
              if (perf.mode !== undefined) {
                setRtEnabled(perf.mode === 1);
              }
            }
          } catch (e) {
            console.warn('读取按键性能失败:', e);
          }
        }
      }
    }
  };

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    await keyboardService.startCalibration();
    setTimeout(async () => {
      await keyboardService.finishCalibration();
      setIsCalibrating(false);
    }, 2000);
  };

  // ---------- 硬件写入工具 ----------
  // 视觉键位按 row-major 顺序展开 (与硬件矩阵按序对齐，严格过滤占位 spacer)
  const VISUAL_KEY_ORDER = useMemo(
    () => ACTIVE_LAYOUT.flat().filter((k) => k && !k.isSpacer && !k.gap && k.id),
    [ACTIVE_LAYOUT]
  );

  const KEY_LAYOUT_INDEX = useMemo(() => {
    const map = {};
    ACTIVE_LAYOUT.forEach((row) => {
      row.forEach((k) => {
        if (k && !k.isSpacer && !k.gap && k.id) {
          map[k.id] = k;
        }
      });
    });
    return map;
  }, [ACTIVE_LAYOUT]);

  const findLayoutKey = (id) => KEY_LAYOUT_INDEX[id];

  // 设备真实矩阵坐标 (getKeyLayoutStyle 读取)；读取失败时回落视觉布局坐标
  const [hwKeyCoords, setHwKeyCoords] = useState(null);

  useEffect(() => {
    if (isConnected) {
      keyboardService.getKeyMatrix().then((matrix) => {
        if (matrix && matrix.length === VISUAL_KEY_ORDER.length) {
          // 按序对齐：视觉键位 i ↔ 硬件矩阵第 i 个键
          const map = {};
          VISUAL_KEY_ORDER.forEach((k, i) => {
            const m = matrix[i];
            map[k.id] = {
              ...m,
              row: Math.round(Number(m.row)),
              col: Math.round(Number(m.col)),
            };
          });
          setHwKeyCoords(map);
          console.log('[SparkLink HID] 设备矩阵坐标已同步 (官方 getKeyLayoutStyle)');
        } else {
          setHwKeyCoords(null);
          if (matrix) {
            console.warn('[Spark HID] 设备矩阵键数与视觉布局不一致:', matrix.length, '回落视觉坐标');
          }
        }
      });
    } else {
      setHwKeyCoords(null);
    }
  }, [isConnected]);

  // 解析按键的硬件矩阵坐标 (优先经过真机校验的精确行列坐标，支持空格 5 颗独立灯珠，回落动态探针)
  const findHwCoords = useCallback((id) => {
    if (typeof id === 'string' && id.startsWith('Space_')) {
      const idx = parseInt(id.split('_')[1], 10) || 1;
      const profileCoords = deviceProfile?.lightingTopology?.spaceLamps?.coordinates ||
                            deviceProfile?._hardwareDetails?.spaceLamps?.coordinates;
      if (Array.isArray(profileCoords) && profileCoords[idx - 1]) {
        return {
          row: Math.round(Number(profileCoords[idx - 1].row)),
          col: Math.round(Number(profileCoords[idx - 1].col)),
          isSpaceLamp: true,
          lampIndex: idx,
        };
      }
      const isDv63 = deviceProfile?.id === 'dv63';
      const spaceRow = isDv63 ? 4 : 5;
      const baseCol = isDv63 ? 3 : 4;
      return {
        row: spaceRow,
        col: baseCol + idx - 1,
        isSpaceLamp: true,
        lampIndex: idx,
      };
    }

    // 优先真实设备上报的硬件矩阵 (来自 getKeyLayoutStyle 权威数据)
    if (hwKeyCoords?.[id]) {
      return {
        ...hwKeyCoords[id],
        row: Math.round(Number(hwKeyCoords[id].row)),
        col: Math.round(Number(hwKeyCoords[id].col)),
      };
    }

    // 针对 64 键/左移 64 配列电气坐标权威回落校准
    if (id === 'Space') return { row: 5, col: 6 };
    if (id === 'AltRight') return { row: 5, col: 9 };
    if (id === 'Fn') return { row: 5, col: 10 };
    if (id === 'ArrowLeft') return { row: 5, col: 12 };
    if (id === 'ArrowDown') return { row: 5, col: 13 };
    if (id === 'ArrowRight') return { row: 5, col: 14 };
    if (id === 'ShiftLeft') return { row: 4, col: 0 };
    if (id === 'ShiftRight') return { row: 4, col: 12 };
    if (id === 'ArrowUp') return { row: 4, col: 13 };
    if (id === 'Delete') return { row: 4, col: 14 };
    if (id === 'Quote') return { row: 3, col: 11 };
    if (id === 'Enter') return { row: 3, col: 13 };
    if (id === 'Backslash') return { row: 2, col: 13 };

    // 经固件严格校验的整数矩阵坐标 (KEY_LAYOUT_INDEX)
    const layoutKey = KEY_LAYOUT_INDEX[id];
    if (layoutKey && typeof layoutKey.row === 'number' && typeof layoutKey.col === 'number') {
      return {
        ...layoutKey,
        row: Math.round(Number(layoutKey.row)),
        col: Math.round(Number(layoutKey.col)),
      };
    }
    return null;
  }, [deviceProfile, KEY_LAYOUT_INDEX, hwKeyCoords]);

  // 改键功能写入（支持点击分配或直接拖拽替换至目标键位）
  const handleAssignKeyToSpecificKeys = useCallback(async (targetIds, newKeyItem) => {
    if (!targetIds || targetIds.length === 0) return;
    setCustomKeyMappings((prev) => {
      const currentLayer = { ...prev[activeKeybindLayer] };
      targetIds.forEach((targetId) => {
        currentLayer[targetId] = newKeyItem;
      });
      const next = {
        ...prev,
        [activeKeybindLayer]: currentLayer,
      };
      if (currentDeviceScopeKey) {
        try {
          localStorage.setItem(`sparklink_custom_key_mappings_${currentDeviceScopeKey}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    // 选中被替换的按键，提供直观的视觉焦点反馈
    setSelectedKeys(new Set(targetIds));

    const friendlyNames = targetIds.map(id => id.replace(/^Key/, '')).join(', ');
    if (!isConnected) {
      addToast({
        message: `已将【${newKeyItem.label}】替换至按键【${friendlyNames}】(离线暂存本地)`,
        type: 'info'
      });
      return;
    }

    const layerIndex = { win_default: 0, win_fn: 1, mac_default: 2, mac_fn: 3 }[activeKeybindLayer] ?? 0;
    const keycode = HID_KEYCODES[newKeyItem.id];
    if (keycode == null) {
      addToast({ message: `【${newKeyItem.label}】暂无硬件键码映射，仅保存于本地。`, type: 'info' });
      return;
    }

    let okCount = 0;
    const writes = [];
    for (const targetId of targetIds) {
      const k = findHwCoords(targetId);
      if (!k) continue;
      writes.push(
        keyboardService.setKeycode({ layer: layerIndex, row: k.row, col: k.col, keycode })
          .then((ok) => { if (ok) okCount += 1; })
      );
    }
    await Promise.all(writes);

    let layoutSaved = false;
    try {
      const res = await keyboardService.paramSave('Layout');
      layoutSaved = res !== false;
    } catch (e) {}

    addToast({
      message: `已将【${newKeyItem.label}】替换至按键【${friendlyNames}】${layoutSaved ? ' (已同步板载闪存)' : ''}`,
      type: 'success',
    });
  }, [activeKeybindLayer, isConnected, findHwCoords, addToast, currentDeviceScopeKey]);

  // 将性能覆盖值 (AP/RT/死区) 合并写入已选按键；未选中任何键则写入全键
  // 官方姿势：Promise.all 并发写入 + GFSParamSave 提交闪存
  const writePerformanceToKeys = async (overrides, successLabel = '触发参数', explicitKeyIds = null) => {
    if (!isConnected) {
      if (successLabel) {
        addToast({ message: '设备未连接，参数暂存于本地，连接键盘后才能写入硬件！', type: 'warning' });
      }
      return false;
    }
    const allValidKeyIds = VISUAL_KEY_ORDER.map((k) => k.id);
    const targetIds = explicitKeyIds && explicitKeyIds.length > 0
      ? explicitKeyIds
      : (selectedKeys.size > 0 ? [...selectedKeys] : allValidKeyIds);

    if (!targetIds || targetIds.length === 0) {
      if (successLabel) {
        addToast({ message: '未找到可用按键！', type: 'warning' });
      }
      return false;
    }
    const entries = targetIds
      .map((id) => {
        const hw = findHwCoords(id);
        return hw ? { row: hw.row, col: hw.col, overrides } : null;
      })
      .filter(Boolean);

    const { ok, total, saved } = await keyboardService.writePerformanceBatch(entries);
    if (ok > 0) {
      setPerKeyPerformances((prev) => {
        const next = { ...prev };
        targetIds.forEach((id) => {
          next[id] = {
            ...(next[id] || {}),
            normalPress: overrides.normalPress ?? actuationPoint,
            rtFirstTouch: overrides.rtFirstTouch ?? overrides.normalPress ?? actuationPoint,
            rtPress: overrides.rtPress ?? (rtEnabled ? rtPress : 0),
            rtRelease: overrides.rtRelease ?? (rtEnabled ? rtRelease : 0),
            pressDeadStroke: overrides.pressDeadStroke ?? deadzone,
            releaseDeadStroke: overrides.releaseDeadStroke ?? (separateDeadzone ? bottomDeadzone : deadzone),
            mode: overrides.mode ?? (rtEnabled ? 1 : 0),
          };
        });
        return next;
      });
    }
    if (successLabel) {
      if (ok === total && saved) {
        const labelText = targetIds.length >= allValidKeyIds.length ? `${successLabel}已写入全键并保存至键盘闪存！` : `${successLabel}已写入 ${ok} 颗按键并保存至键盘闪存！`;
        addToast({ message: labelText, type: 'success' });
        return true;
      }
      addToast({
        message: `${successLabel}写入 ${ok}/${total} 颗${saved ? '' : '，闪存保存失败 (参数断电可能丢失)'}，请重试。`,
        type: ok > 0 ? 'warning' : 'error',
      });
    }
    return ok > 0;
  };

  // 实时自动下发触发与死区参数（防抖 120ms，拖拽滑块流畅且修改完成即实时写入硬件闪存）
  const triggerAutoSyncTimerRef = useRef(null);
  const isTriggerMountedRef = useRef(false);

  useEffect(() => {
    if (!isTriggerMountedRef.current) {
      isTriggerMountedRef.current = true;
      return;
    }
    if (!isConnected) return;
    // 门禁：没选中按键之前，虽然允许拖动滑块体验，但绝对不修改任何按键配置
    if (selectedKeys.size === 0) return;

    if (triggerAutoSyncTimerRef.current) clearTimeout(triggerAutoSyncTimerRef.current);
    triggerAutoSyncTimerRef.current = setTimeout(async () => {
      await writePerformanceToKeys({
        mode: rtEnabled ? 1 : 0,
        normalPress: actuationPoint,
        normalRelease: actuationPoint,
        rtFirstTouch: actuationPoint,
        rtPress: rtEnabled ? rtPress : 0,
        rtRelease: rtEnabled ? rtRelease : 0,
        pressDeadStroke: deadzone,
        releaseDeadStroke: separateDeadzone ? bottomDeadzone : deadzone,
        axisV2Id: currentAxis?.id,
        axisRangeMax: parseFloat(currentAxis?.maxTravel) || 3.4,
        axisCoefficient: 1,
        ...(canContinuousRt ? { continuousRt: continuousRt ? 1 : 0 } : {}),
      }, null);
    }, 120);
    return () => {
      if (triggerAutoSyncTimerRef.current) clearTimeout(triggerAutoSyncTimerRef.current);
    };
  }, [actuationPoint, rtPress, rtRelease, rtEnabled, deadzone, separateDeadzone, bottomDeadzone, continuousRt, currentAxis, selectedKeys]);

  // 单键自定义灯光下发硬件 (使用严格校验的硬件矩阵坐标 + 5颗独立空格灯珠 + 完整9包异步确认，支持队列与防抖)
  const isSyncingLightingRef = useRef(false);
  const nextPendingColorsRef = useRef(null);
  const syncLightingDebounceTimerRef = useRef(null);
  const saveLightingDebounceTimerRef = useRef(null);

  const doSyncLightingToHardware = async (colors) => {
    if (!isConnected) return;
    if (isSyncingLightingRef.current) {
      nextPendingColorsRef.current = colors;
      return;
    }
    isSyncingLightingRef.current = true;
    try {
      let currentColors = colors;
      while (currentColors) {
        nextPendingColorsRef.current = null;
        const entries = VISUAL_KEY_ORDER.map((k) => {
          const hw = findHwCoords(k.id);
          return hw ? { row: hw.row, col: hw.col, hex: currentColors[k.id] || '', keyId: k.id } : null;
        }).filter(Boolean);

        // 注入空格 5 颗独立物理灯珠
        [1, 2, 3, 4, 5].forEach((idx) => {
          const lampId = `Space_${idx}`;
          if (currentColors[lampId]) {
            const hw = findHwCoords(lampId);
            if (hw) {
              entries.push({
                row: hw.row,
                col: hw.col,
                hex: currentColors[lampId],
                keyId: lampId,
                isSpaceLamp: true,
                lampIndex: idx,
              });
            }
          }
        });

        await keyboardService.setCustomKeyLighting(entries);
        currentColors = nextPendingColorsRef.current;
      }

      // 后台防抖保存闪存，杜绝每次修改或取消涂色时因为频繁写 Flash 造成的卡顿与高延迟
      if (saveLightingDebounceTimerRef.current) {
        clearTimeout(saveLightingDebounceTimerRef.current);
      }
      saveLightingDebounceTimerRef.current = setTimeout(async () => {
        try {
          await keyboardService.saveCustomLighting();
        } catch (e) {
          console.warn('saveCustomLighting background error:', e);
        }
      }, 1500);
    } catch (e) {
      console.warn('syncLightingToHardware error:', e);
    } finally {
      isSyncingLightingRef.current = false;
    }
  };

  const syncLightingToHardware = (colors, immediate = false) => {
    if (syncLightingDebounceTimerRef.current) {
      clearTimeout(syncLightingDebounceTimerRef.current);
    }
    if (immediate) {
      doSyncLightingToHardware(colors);
    } else {
      syncLightingDebounceTimerRef.current = setTimeout(() => {
        doSyncLightingToHardware(colors);
      }, 80);
    }
  };

  // 同步追踪自定义按键色彩 ref，确保连续高速拖拽涂色时状态无缝累加
  const customKeyColorsRef = useRef(customKeyColors);
  useEffect(() => {
    customKeyColorsRef.current = customKeyColors;
  }, [customKeyColors]);

  // 单键拖拽涂色 / 单击涂色 (星闪双层动画：涂色作用于当前动态模式之上，严禁强切 mode 20！)
  const handleApplyKeyColor = useCallback((keyId, colorToApply) => {
    const color = colorToApply || currentLightingColor;
    if (customKeyColorsRef.current[keyId] === color) return;
    const next = { ...customKeyColorsRef.current, [keyId]: color };
    customKeyColorsRef.current = next;
    setCustomKeyColors(next);
    syncLightingToHardware(next);
  }, [currentLightingColor]);

  // 单键右键拖拽擦除 / 右键单击清除 (即时无延迟生效)
  const handleEraseKeyColor = useCallback((keyId) => {
    if (!customKeyColorsRef.current[keyId]) return;
    const next = { ...customKeyColorsRef.current };
    delete next[keyId];
    customKeyColorsRef.current = next;
    setCustomKeyColors(next);
    syncLightingToHardware(next, true);
  }, []);

  // 上位灯光开关 (针对单键上下双灯珠机型如 AE64-MAX，支持联动控制)
  const handleTopLightSwitch = async (enabled) => {
    const nextTop = enabled;
    const nextBottom = lightingLinked ? enabled : bottomLightEnabled;
    setTopLightEnabled(nextTop);
    if (lightingLinked) {
      setBottomLightEnabled(nextBottom);
    }
    const nextOpen = (nextTop && nextBottom) ? 'Open' : (nextTop && !nextBottom) ? 'OpenUp' : (!nextTop && nextBottom) ? 'OpenDown' : 'Close';
    setIsLightingOn(nextTop || nextBottom);
    if (keyboardService.connected) {
      await keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, 'DoubleLighting', {
        open: nextOpen,
        selectStaticColor,
        direction: lightingDirection === 0 ? 'Forward' : 'Backward',
      });
    }
  };

  // 下位灯光开关 (针对单键上下双灯珠机型如 AE64-MAX，支持联动控制)
  const handleBottomLightSwitch = async (enabled) => {
    const nextBottom = enabled;
    const nextTop = lightingLinked ? enabled : topLightEnabled;
    setBottomLightEnabled(nextBottom);
    if (lightingLinked) {
      setTopLightEnabled(nextTop);
    }
    const nextOpen = (nextTop && nextBottom) ? 'Open' : (nextTop && !nextBottom) ? 'OpenUp' : (!nextTop && nextBottom) ? 'OpenDown' : 'Close';
    setIsLightingOn(nextTop || nextBottom);
    if (keyboardService.connected) {
      await keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, 'DoubleLighting', {
        open: nextOpen,
        selectStaticColor,
        direction: lightingDirection === 0 ? 'Forward' : 'Backward',
      });
    }
  };

  // 上下灯位联动切换：开启联动时自动同步上位与下位灯状态
  const handleLightingLinkedToggle = (newLinked) => {
    setLightingLinked(newLinked);
    if (newLinked && topLightEnabled !== bottomLightEnabled) {
      const synced = topLightEnabled || bottomLightEnabled;
      setTopLightEnabled(synced);
      setBottomLightEnabled(synced);
      const nextOpen = synced ? 'Open' : 'Close';
      setIsLightingOn(synced);
      if (keyboardService.connected) {
        keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, 'DoubleLighting', {
          open: nextOpen,
          selectStaticColor,
          direction: lightingDirection === 0 ? 'Forward' : 'Backward',
        });
      }
    }
  };

  // 主键盘背光总开关 (双灯键盘一键全开/全关上下双灯珠，单灯键盘常规切换)
  const handleMasterLightSwitch = async (enabled) => {
    setIsLightingOn(enabled);
    if (isDoubleLight) {
      setTopLightEnabled(enabled);
      setBottomLightEnabled(enabled);
      if (keyboardService.connected) {
        await keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, 'DoubleLighting', {
          open: enabled ? 'Open' : 'Close',
          selectStaticColor,
          direction: lightingDirection === 0 ? 'Forward' : 'Backward',
        });
      }
    } else {
      if (keyboardService.connected) {
        await keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, 'SingleLighting', {
          open: enabled ? 'Open' : 'Close',
          selectStaticColor,
          direction: lightingDirection === 0 ? 'Forward' : 'Backward',
        });
      }
    }
  };

  // 主键盘背光流动方向切换 (Forward / Backward)
  const handleLightingDirectionChange = async (dir) => {
    setLightingDirection(dir);
    if (keyboardService.connected) {
      const lamp = isDoubleLight ? 'DoubleLighting' : 'SingleLighting';
      await keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, lamp, {
        open: isLightingOn ? (isDoubleLight ? ((topLightEnabled && bottomLightEnabled) ? 'Open' : topLightEnabled ? 'OpenUp' : 'OpenDown') : 'Open') : 'Close',
        selectStaticColor,
        direction: dir === 0 ? 'Forward' : 'Backward',
      });
    }
  };

  // 单颗空格灯珠独立涂色 (复用 handleApplyKeyColor，支持连续拖拽)
  const handleSetSpaceLampColor = useCallback((lampIdx, hex) => {
    const lampId = `Space_${lampIdx}`;
    handleApplyKeyColor(lampId, hex || currentLightingColor);
  }, [handleApplyKeyColor, currentLightingColor]);

  // 单颗空格灯珠清除涂色 (复用 handleEraseKeyColor)
  const handleClearSpaceLamp = useCallback((lampIdx) => {
    const lampId = `Space_${lampIdx}`;
    handleEraseKeyColor(lampId);
  }, [handleEraseKeyColor]);

  // 一键将空格 5 颗灯珠全部设为目标颜色 (保留当前动态动效，作用于对应动效上)
  const handleSetAllSpaceLamps = (hex) => {
    const targetColor = hex || currentLightingColor;
    const next = { ...customKeyColorsRef.current, Space: targetColor };
    [1, 2, 3, 4, 5].forEach((idx) => {
      next[`Space_${idx}`] = targetColor;
    });
    customKeyColorsRef.current = next;
    setCustomKeyColors(next);
    syncLightingToHardware(next, true);
  };

  // 一键为 5 颗空格灯珠设置平滑彩虹渐变 (保留当前动态动效，作用于对应动效上)
  const handleRainbowSpaceLamps = () => {
    const rainbowColors = ['#FF3366', '#FF9933', '#33CC66', '#3399FF', '#9933FF'];
    const next = { ...customKeyColorsRef.current };
    rainbowColors.forEach((color, i) => {
      next[`Space_${i + 1}`] = color;
    });
    customKeyColorsRef.current = next;
    setCustomKeyColors(next);
    syncLightingToHardware(next, true);
  };

  // 清空空格 5 颗灯珠的涂色
  const handleClearAllSpaceLamps = () => {
    const next = { ...customKeyColorsRef.current };
    delete next['Space'];
    [1, 2, 3, 4, 5].forEach((idx) => {
      delete next[`Space_${idx}`];
    });
    customKeyColorsRef.current = next;
    setCustomKeyColors(next);
    syncLightingToHardware(next, true);
  };

  // ── 贯穿式底灯/装饰灯带 批量与逐颗控制处理 (动态适配不同键盘底灯数量) ──
  const stripCustomColorsRef = useRef(stripCustomColors);
  useEffect(() => {
    stripCustomColorsRef.current = stripCustomColors;
  }, [stripCustomColors]);

  const syncDecorateDebounceTimerRef = useRef(null);
  const doSyncDecorateToHardware = async (entries) => {
    if (!keyboardService.connected) return;
    await keyboardService.setDecorateCustom(1, decorateConfig.rows || 1, decorateConfig.cols || bottomLedCount, entries, bottomLedCount);
  };
  const debouncedSyncDecorate = (entries, immediate = false) => {
    if (syncDecorateDebounceTimerRef.current) {
      clearTimeout(syncDecorateDebounceTimerRef.current);
    }
    if (immediate) {
      doSyncDecorateToHardware(entries);
    } else {
      syncDecorateDebounceTimerRef.current = setTimeout(() => {
        doSyncDecorateToHardware(entries);
      }, 100);
    }
  };

  const handleSetStripLedColor = (index, hex) => {
    const targetColor = hex || currentLightingColor;
    if (stripCustomColorsRef.current[index] === targetColor) return;
    const next = { ...stripCustomColorsRef.current, [index]: targetColor };
    stripCustomColorsRef.current = next;
    setStripCustomColors(next);
    const entries = Object.entries(next).map(([idx, c]) => ({ index: Number(idx), hex: c }));
    setDecorateColors(entries);
    debouncedSyncDecorate(entries);
  };

  const handleClearStripLedColor = (index) => {
    if (stripCustomColorsRef.current[index] === undefined) return;
    const next = { ...stripCustomColorsRef.current };
    delete next[index];
    stripCustomColorsRef.current = next;
    setStripCustomColors(next);
    const entries = Object.entries(next).map(([idx, c]) => ({ index: Number(idx), hex: c }));
    setDecorateColors(entries);
    debouncedSyncDecorate(entries);
  };

  const handleSetAllStrip = async (hex) => {
    const targetColor = hex || currentLightingColor;
    const total = bottomLedCount;
    const next = {};
    const entries = [];
    for (let i = 0; i < total; i++) {
      next[i] = targetColor;
      entries.push({ index: i, hex: targetColor });
    }
    setStripCustomColors(next);
    setDecorateColors(entries);
    await keyboardService.setDecorateCustom(1, decorateConfig.rows || 1, decorateConfig.cols || total, entries, total);
    addToast({ message: `已将全部 ${total} 颗底灯设为 ${targetColor}！`, type: 'success' });
  };

  const handleRainbowStrip = async () => {
    const total = bottomLedCount;
    const next = {};
    const entries = [];
    for (let i = 0; i < total; i++) {
      const hex = `hsl(${Math.round((i / total) * 360)}, 100%, 50%)`;
      next[i] = hex;
      entries.push({ index: i, hex });
    }
    setStripCustomColors(next);
    setDecorateColors(entries);
    await keyboardService.setDecorateCustom(1, decorateConfig.rows || 1, decorateConfig.cols || total, entries, total);
    addToast({ message: `已为 ${total} 颗底灯下发彩虹渐变！`, type: 'success' });
  };

  const handleClearAllStrip = async () => {
    setStripCustomColors({});
    setDecorateColors([]);
    await keyboardService.setDecorateCustom(1, decorateConfig.rows || 1, decorateConfig.cols || bottomLedCount, [], bottomLedCount);
    addToast({ message: '已清空底灯自定义涂色，恢复动态灯效！', type: 'info' });
  };

  // SOCD 变更 -> 同步硬件写入 + 独立设备持久化
  const handleSocdKeysChange = async (next) => {
    setSocdKeys(next);
    if (currentDeviceScopeKey) {
      try {
        localStorage.setItem(`sparklink_socd_keys_${currentDeviceScopeKey}`, JSON.stringify(next));
      } catch (e) {}
    }
    if (!isConnected) {
      addToast({ message: '设备未连接，SOCD 配置暂存本地，连接后才会写入键盘。', type: 'warning' });
      return;
    }
    const keyA = findHwCoords(next.keyA);
    const keyB = findHwCoords(next.keyB);
    if (!keyA || !keyB) {
      addToast({ message: 'SOCD 对冲已清空。', type: 'info' });
      return;
    }
    const ok = await keyboardService.setSocdBinding({
      row: keyA.row, col: keyA.col,
      row2: keyB.row, col2: keyB.col,
      mode: 2, delay: 0,
      kcs: [0, 0],
    });
    // 官方流程：高级按键写入后提交 HigherKey 闪存
    let saved = false;
    try {
      const res = await keyboardService.paramSave('HigherKey');
      saved = res !== false;
    } catch (e) { /* 提交失败不阻塞 */ }
    addToast({
      message: ok
        ? `SOCD 对冲 (${keyA.label} vs ${keyB.label}) 已写入键盘${saved ? '并保存闪存' : ''}！`
        : 'SOCD 对冲写入硬件失败，请重试。',
      type: ok ? 'success' : 'warning',
    });
  };

  // 窗口最大化状态感知与窗口控制
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.onMaximizeChange) {
      const unsub = window.electronAPI.onMaximizeChange((isMax) => {
        setIsWindowMaximized(Boolean(isMax));
      });
      return unsub;
    }
  }, []);

  // 浏览器环境/纯前端运行时的等比自适应缩放 fallback (Electron 下由 main.js 统一原生处理)
  useEffect(() => {
    const BASE_WIDTH = 1380;
    const BASE_HEIGHT = 880;

    const handleWebZoom = () => {
      if (window.electronAPI?.isElectron) return;
      const w = window.innerWidth || document.documentElement.clientWidth;
      const h = window.innerHeight || document.documentElement.clientHeight;
      const scale = Math.max(1.0, Math.min(w / BASE_WIDTH, h / BASE_HEIGHT));
      document.documentElement.style.zoom = scale;
    };

    window.addEventListener('resize', handleWebZoom);
    handleWebZoom();
    return () => window.removeEventListener('resize', handleWebZoom);
  }, []);

  // 窗口控制
  const handleMinimize = () => window.electronAPI?.minimize?.();
  const handleMaximize = () => window.electronAPI?.maximize?.();
  const handleClose = () => window.electronAPI?.close?.();

  // 左侧导航 (学习前行者 EWEADN 桌面端信息架构)
  const TABS = [
    { id: 'lighting', label: '灯光配置', icon: Lightbulb },
    { id: 'trigger', label: '触发配置', icon: Zap },
    { id: 'keybinds', label: '改键配置', icon: Keyboard },
    { id: 'advanced', label: '高级按键', icon: Gamepad2 },
    { id: 'macro', label: '快捷指令', icon: Sparkles },
    { id: 'performance', label: '性能配置', icon: Sliders },
    { id: 'settings', label: '其他设置', icon: Settings2 },
  ];

  return (
    <div className="app-shell">
      {/* 顶部标题栏（前行者 EWEADN 简洁风格：白底、无边框、文字层级清晰） */}
      <header className="app-titlebar">
        {/* 左：品牌 + 当前设备 */}
        <div className="flex items-center gap-3 min-w-0" style={{ WebkitAppRegion: 'no-drag' }}>
          <div onClick={() => setCurrentView('home')} className="flex items-center gap-2 cursor-pointer shrink-0">
            <AstraFluxLogo className="w-[22px] h-[22px]" rounded="rounded-md" />
            <span className="text-[15px] font-bold tracking-tight text-brand-gradient whitespace-nowrap flex items-baseline gap-1.5">
              <span>AstraFlux-HUB</span>
              <span className="text-[11px] font-medium opacity-75 font-sans">星流驱动</span>
            </span>
          </div>

          {currentView === 'device' ? (
            <div className="flex items-center gap-2.5 pl-3 shrink-0" style={{ borderLeft: '1px solid var(--border-color)' }}>
              {/* 产品型号清晰标题展示 */}
              <span className="text-[15px] font-bold whitespace-nowrap tracking-tight text-[var(--text-primary)] font-title">
                {chipDeviceName}
              </span>
              {/* 配列快速切换下拉菜单 */}
              <div className="relative group" style={{ WebkitAppRegion: 'no-drag' }}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[12.5px] px-3 py-1 rounded-full font-semibold whitespace-nowrap border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] transition cursor-pointer text-[var(--text-secondary)]"
                  title="点击自由切换键盘物理视觉配列 (60% / 64 / 68 / 75% / 87 / 98 / 104)"
                >
                  <span>{getLayoutDisplayName(ACTIVE_LAYOUT)} ({KEY_COUNT}K)</span>
                  <span className="text-[10px] opacity-70">▾</span>
                </button>
                <div className="absolute left-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[6px] shadow-xl py-1 z-[99999] min-w-[170px]">
                  <div className="px-3 py-1 text-[11px] font-bold text-[var(--text-tertiary)] border-b border-[var(--border-color)]/60">
                    切换物理键盘配列
                  </div>
                  {SUPPORTED_KEYBOARD_LAYOUTS.map((item) => {
                    const isCurrent = (overrideLayoutKey === item.id) || (!overrideLayoutKey && deviceProfile?.layout === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setOverrideLayoutKey(item.id);
                        }}
                        className={`px-3 py-1.5 text-left text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent 
                            ? 'bg-[var(--primary-04)] text-[var(--info-color)] font-bold' 
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        <span className="font-medium">{item.name}</span>
                        {isCurrent && <span className="text-[11px] text-[var(--info-color)] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1 px-2 py-[3px] text-[12px] rounded-md font-semibold transition whitespace-nowrap"
                style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <Home className="w-3 h-3" />
                <span>设备主页</span>
              </button>
            </div>
          ) : (
            <span className="text-[13px] whitespace-nowrap" style={{ color: 'var(--text-disabled)' }}>
              NearLink 互联设备管理中心
            </span>
          )}
        </div>

        {/* 右：连接状态 / 主题 / 设置 / 窗口控制 */}
        <div className="flex items-center gap-1 shrink-0" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={() => setShowAddDeviceModal(true)}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[13px] font-semibold transition cursor-pointer"
            style={{ background: isConnected ? 'var(--primary-04)' : 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="查看已连接设备或添加/手动识别新设备"
          >
            <Cable className="w-3.5 h-3.5" style={{ color: isConnected ? 'var(--success-color)' : 'var(--text-disabled)' }} />
            <span className="font-mono whitespace-nowrap">{isConnected ? 'USB 8KHz' : '接入设备'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="icon-button"
            style={{ width: 32, height: 32, color: 'var(--text-tertiary)' }}
            title="切换深浅色主题"
          >
            {theme === 'system'
              ? (systemDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />)
              : (theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />)}
          </button>

          <button
            onClick={() => {
              setGlobalSettingsSection('general');
              setShowGlobalSettings(true);
            }}
            className="icon-button"
            style={{ width: 32, height: 32, color: 'var(--text-tertiary)' }}
            title="常规设置 / 消息通知 / 关于"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-[2px] pl-2 ml-1" style={{ borderLeft: '1px solid var(--border-color)' }}>
            <button onClick={handleMinimize} className="icon-button" style={{ width: 30, height: 30, color: 'var(--text-tertiary)' }}>
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleMaximize} 
              className="icon-button" 
              style={{ width: 30, height: 30, color: 'var(--text-tertiary)' }}
              title={isWindowMaximized ? '还原窗口' : '最大化窗口'}
            >
              {isWindowMaximized ? (
                <Copy className="w-3 h-3 rotate-90" />
              ) : (
                <Square className="w-3 h-3" />
              )}
            </button>
            <button onClick={handleClose} className="icon-button" style={{ width: 30, height: 30, color: 'var(--text-tertiary)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 视图分发：主页 (DeviceHomeView) vs 设备详情驱动 (Device Driver View) */}
      <ErrorBoundary onReset={() => window.location.reload()} onBackHome={() => setCurrentView('home')}>
      {currentView === 'home' ? (
        <DeviceHomeView
          isConnected={isConnected}
          devices={homeDisplayDevices}
          activeDevice={device}
          deviceName={chipDeviceName}
          deviceLabel={deviceProfile?.connectionLabel || 'USB 极速有线磁轴'}
          maxRate={deviceProfile?.maxPollingRate || 8000}
          isScanning={isScanningDevices}
          onRefreshDevices={async () => {
            try {
              await keyboardService.requestPermission(true);
            } catch (e) {}
            await refreshAuthorizedDevices(false);
          }}
          onConnectDevice={async () => {
            setShowAddDeviceModal(true);
            try {
              await refreshAuthorizedDevices(false);
            } catch (e) {}
          }}
          onConnectSpecific={async (dev) => {
            const matched = findMatchedEcosystemProduct(dev.vendorId, dev.productId, dev.productName || dev.displayName);
            if (matched) {
              const baseProfile = DEVICE_PROFILES[matched.profileId] || DEVICE_PROFILES.ES68;
              setDeviceProfile({
                ...baseProfile,
                id: matched.id,
                name: matched.name,
                model: matched.model,
                layoutName: matched.layoutName || baseProfile.layoutName,
                maxPollingRate: matched.maxPollingRate || baseProfile.maxPollingRate,
                vendorId: dev.vendorId,
                productId: dev.productId,
              });
            }
            try {
              // 优先尝试直接连接已识别的设备，避免不必要的系统授权弹窗
              const ok = await keyboardService.autoConnect(dev.hidDevice || dev);
              if (!ok && typeof keyboardService.requestPermission === 'function') {
                await keyboardService.requestPermission(true);
              }
            } catch (err) {
              console.warn('onConnectSpecific fallback to autoConnect:', err);
              await keyboardService.autoConnect(dev.hidDevice || dev).catch(() => {});
            }
            await refreshAuthorizedDevices(false);
            setCurrentView('device');
          }}
          onEnterDevice={() => setCurrentView('device')}
          onOpenGlobalSettings={(sec) => {
            setGlobalSettingsSection(sec || 'general');
            setShowGlobalSettings(true);
          }}
        />
      ) : (
        /* 主体左右布局 (设备驱动详情视图) */
        <div className="app-body">
        
        {/* 左侧导航栏（复刻前行者 .menu-box：设备状态卡 + 分组导航 + 底部） */}
        <aside className="sidebar">
          {/* 设备状态卡（对齐前行者 EWEADN 官方驱动截图：设备名+芯片图标、已连接、出厂SN码、切换设备下拉选框） */}
          <div className="device-card !h-auto !justify-start !overflow-visible z-30 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-[8px] relative shadow-sm mb-3">
            {/* 第一行：设备型号 + 硬件参数芯片图标 (优先从键盘芯片读取真实信息) */}
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-bold text-[15px] tracking-tight text-[var(--text-primary)] truncate font-title" title={chipDeviceName}>
                {chipDeviceName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHwInfoModal(true);
                }}
                title="查看星闪键盘出厂硬件参数与芯片信息"
                className="p-1 rounded-md hover:bg-[var(--primary-09)] text-[var(--primary-color)] transition cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
              </button>
            </div>

            {/* 第二行：连接状态与当前回报率 */}
            <div className="flex items-center justify-between w-full text-xs text-[var(--text-disabled)] mb-2">
              <span className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-slate-400'}`} />
                <span className={isConnected ? 'text-emerald-500 font-semibold' : 'text-[var(--text-disabled)]'}>
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] font-bold text-[var(--text-secondary)]">
                {pollingRate}Hz
              </span>
            </div>

            {/* 第三行：出厂 SN 码展示 (支持一键复制完整出厂SN码) */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (!rawSn) return;
                navigator.clipboard?.writeText?.(rawSn);
                setSnCopied(true);
                addToast({
                  message: `已复制出厂 SN 码：${rawSn}`,
                  type: 'success',
                });
                setTimeout(() => setSnCopied(false), 2000);
              }}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono cursor-pointer transition mb-2.5 group/sn"
              title={rawSn ? `点击一键复制完整出厂序列号: ${rawSn}` : '未读取到出厂 SN'}
            >
              <span className="truncate text-[var(--text-primary)] font-semibold">
                SN: {shortSn}
              </span>
              <span className="shrink-0 text-[var(--text-disabled)] group-hover/sn:text-[var(--primary-color)] transition ml-1">
                {snCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </span>
            </div>

            {/* 第四行：切换设备下拉菜单 (完全对齐截图「切换设备: [ EWEADN ES68 Da...  v ]」) */}
            <div className="relative w-full pt-1.5 border-t border-[var(--border-color)]/70">
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <span className="shrink-0 text-[var(--text-secondary)] text-xs font-medium">切换设备:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeviceDropdown(!showDeviceDropdown);
                  }}
                  className="flex-1 flex items-center justify-between px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition cursor-pointer min-w-0"
                >
                  <span className="truncate font-title">
                    {chipDeviceName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* 下拉展开面板 */}
              {showDeviceDropdown && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl p-1.5 animate-in fade-in slide-in-from-top-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[10px] text-[var(--text-disabled)] border-b border-[var(--border-color)] font-mono flex items-center justify-between">
                    <span>检测到星闪外设</span>
                    <span>{allSwitchableDevices.length} 台</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto py-1">
                    {allSwitchableDevices.map((dev, idx) => {
                      const devName = (dev.productName || '').replace(/\0/g, '').trim() || dev.displayName || chipDeviceName;
                      const isCurrent = device && (dev === device || dev.id === device.id || dev.productId === device.productId);
                      return (
                        <button
                          key={dev.id || idx}
                          type="button"
                          onClick={async () => {
                            setShowDeviceDropdown(false);
                            addToast({ message: `正在切换连接至：${devName}...`, type: 'info' });
                            const ok = await keyboardService.switchDevice(dev);
                            if (ok) {
                              addToast({ message: `已成功连接切换至 ${devName}！`, type: 'success' });
                            } else {
                              addToast({ message: '设备切换失败，请确认设备已插入。', type: 'warning' });
                            }
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                            isCurrent
                              ? 'bg-[var(--primary-09)] text-[var(--primary-color)] font-bold'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <span className="truncate">{devName}</span>
                          {isCurrent && <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-500 shrink-0 ml-1">当前</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-1 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeviceDropdown(false);
                        keyboardService.requestPermission().then(refreshAuthorizedDevices);
                      }}
                      className="w-full text-center py-1 text-[11px] text-[var(--primary-color)] hover:underline cursor-pointer"
                    >
                      + 扫描 / 授权新设备
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-scroll">
          {/* 配置导航组（对应官方 .menu-list / .menu-child） */}
          <div className="nav-group">
            <div className="nav-group-title">配置</div>
            <div className="nav-list">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span className="nav-icon"><Icon className="w-[18px] h-[18px]" /></span>
                  <span className="nav-text">{tab.label}</span>
                </button>
              );
            })}
            </div>
          </div>

          {/* 方案管理集合按钮 (悬浮弹出悬浮窗快捷切换，点击进入配置管理中心) */}
          <div className="nav-group">
            <div className="flex items-center justify-between pr-1">
              <div className="nav-group-title">方案管理</div>
              <span className="text-xs font-mono pb-2 text-[var(--text-disabled)]">4 槽板载</span>
            </div>
            <div className="nav-list relative">
              <div 
                ref={profileBtnRef}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                className="w-full"
              >
                <button
                  type="button"
                  data-tab="profiles"
                  onClick={() => handleTabChange('profiles')}
                  className={`nav-item w-full flex items-center justify-between cursor-pointer ${
                    activeTab === 'profiles' ? 'active' : ''
                  }`}
                  title="点击进入键盘方案配置管理中心，悬浮快捷切换"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="nav-icon"><Keyboard className="w-[18px] h-[18px]" /></span>
                    <span className="nav-text truncate font-bold">{boardSlotAliases[activeBoardSlot] || '配置一'}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--primary-09)] text-[var(--info-color)] font-mono font-bold shrink-0 border border-[var(--primary-15)]">
                    {activeBoardSlot.replace('Config', '#')}
                  </span>
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* 侧栏底部（对应官方 .menu-footer 与 THRM 风格侧栏底部导航） */}
          <div className="sidebar-footer flex flex-col gap-1.5">
            <button className="ghost-button !h-10 text-xs" onClick={() => setShowCalibrateModal(true)}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="truncate">全键消磁校准</span>
            </button>
            <button 
              className="ghost-button !h-10 text-xs" 
              onClick={() => {
                setGlobalSettingsSection('about');
                setShowGlobalSettings(true);
              }}
              title="关于软件、开发者与开源生态"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="truncate">关于软件</span>
            </button>
          </div>
        </aside>

        {/* 右侧主工作区 */}
        <main className="app-content">

          {/* 上半部分：键盘结构图 + 右侧快捷操作栏 (与底部操作区严格 5:5 黄金分配，告别挤压) */}
          {!['performance', 'settings', 'macro', 'profiles'].includes(activeTab) && (
          <div className="keyboard-section-top flex gap-3 items-stretch flex-1 min-h-0 w-full relative z-0">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-2.5 shadow-sm flex flex-col h-full justify-between">
            <div className="flex items-center justify-between gap-3 mb-2 shrink-0">
              {/* ⚠️ 左组必须 min-w-0 + 文本 truncate、右组 shrink-0：
                  标题文案含型号与键数（如「ES68 磁轴物理触发行程与RT状态 (68-Key Layout)」），
                  窄窗口下不加约束会把右侧按钮组挤出去 —— 也就是用户说的「没有让位留空」。 */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-[13.5px] font-bold text-[var(--text-primary)] tracking-tight flex items-center min-w-0">
                  <Keyboard className="w-4 h-4 mr-1.5 text-[var(--info-color)] shrink-0" />
                  <span className="truncate">
                    {activeTab === 'lighting'
                      ? '灯光设置'
                      : activeTab === 'keybinds'
                      ? '按键改键设置'
                      : activeTab === 'advanced'
                      ? '高级按键设置'
                      : '触发行程与RT设置'}
                  </span>
                </span>
                {activeTab === 'lighting' ? (
                  <div className="flex items-center space-x-1.5 text-[12px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium shrink-0">
                    <span>{activeLightingArea === 'keyboard' ? '主键盘背光 · 独立RGB' : `${decorateConfig.name || '底灯装饰灯'} · 独立RGB`}</span>
                  </div>
                ) : activeTab === 'advanced' ? (
                  <div className="flex items-center space-x-1 text-[12px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-medium shrink-0">
                    <span>点按上方键盘直接填充按键</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-[12px] bg-[var(--primary-09)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)] font-mono shrink-0">
                    <span className="text-[var(--text-disabled)]">已选中:</span>
                    <span className="font-bold text-[var(--info-color)]">{selectedKeys.size} 颗按键</span>
                  </div>
                )}
              </div>
            </div>

            {/* 左移64按键矩阵图 (针对灯光设置：深黑沉浸式发光底盘；针对触发与改键：仿真极简白键帽) */}
            <div
              ref={kbWrapRef}
              className={`p-2 rounded-[8px] transition-all duration-150 flex flex-col items-center justify-center flex-1 min-h-0 overflow-hidden ${
                activeTab === 'lighting' 
                  ? 'bg-[#0b0f19] border border-[#1e2530] shadow-xl' 
                  : 'bg-[var(--primary-09)]/80 border border-[var(--border-color)]/90 shadow-inner'
              }`}>
              {/* AE64-MAX 上下双灯设计：仅在主键盘背光视图下渲染 PCB 一圈底灯装饰灯带 */}
              {activeTab === 'lighting' && activeLightingArea === 'keyboard' && lightingAreas.length > 1 && (
                <div className="flex flex-col items-center gap-3 w-full mb-3">
                  {lightingAreas.slice(1).map((area, areaIdx) => {
                    const ledCount = (area.rows || 1) * (area.cols || 0);
                    if (!ledCount) return null;
                    return (
                      <div key={areaIdx} className="flex flex-col items-center gap-1 w-fit">
                        <span className="text-[10px] font-mono text-[var(--text-disabled)] tracking-widest">
                          PCB 底灯装饰灯 · {ledCount} LED
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: ledCount }).map((_, ledIdx) => {
                            const entry = decorateColors.find((c) => c.index === ledIdx);
                            const color = entry?.hex || `hsl(${Math.round((ledIdx / ledCount) * 320)}, 95%, 52%)`;
                            return (
                              <button
                                key={ledIdx}
                                onClick={() => {
                                  const next = [...decorateColors.filter((c) => c.index !== ledIdx), { index: ledIdx, hex: currentLightingColor }];
                                  setDecorateColors(next);
                                  keyboardService.setDecorateCustom(areaIdx + 1, area.rows || 1, area.cols || ledCount, next);
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  const next = decorateColors.filter((c) => c.index !== ledIdx);
                                  setDecorateColors(next);
                                  keyboardService.setDecorateCustom(areaIdx + 1, area.rows || 1, area.cols || ledCount, next);
                                }}
                                style={{ width: '22px', height: '14px', backgroundColor: color, boxShadow: `0 0 8px ${color}88` }}
                                className="rounded-sm border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                                title={`装饰灯 LED #${ledIdx + 1}，左键涂色 / 右键清除`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 当处于灯带/底灯页面时：根据机型规格动态渲染底灯矩阵 (AE64-MAX 31颗[17,14] / ES68 26颗[13,13] / 硬件动态探测) */}
              {activeTab === 'lighting' && activeLightingArea !== 'keyboard' ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center py-4 px-3 select-none">
                  {/* 仿真键盘底壳卡片：深灰带倒角底壳，精准对齐官方驱动实机外观与色调 */}
                  <div className="relative w-full max-w-4xl py-8 px-6 rounded-2xl bg-[#59606d] dark:bg-[#343a46] border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-all">
                    {/* 按照机型行规格渲染按行排列的 LED 珠 (AE64-MAX: 第1行17颗, 第2行14颗) */}
                    <div className="flex flex-col items-start gap-3 w-fit max-w-full overflow-x-auto p-1">
                      {(() => {
                        let currentLedIndex = 0;
                        return decorateConfig.rowLayout.map((rowSize, rIdx) => {
                          const startIdx = currentLedIndex;
                          currentLedIndex += rowSize;
                          return (
                            <div key={rIdx} className="flex items-center justify-start gap-2 sm:gap-2.5">
                              {Array.from({ length: rowSize }).map((_, inRowIdx) => {
                                const idx = startIdx + inRowIdx;
                                const isCustom = stripCustomColors[idx] !== undefined;
                                const { bg, boxShadow } = computeStripLedColor({
                                  index: idx,
                                  total: bottomLedCount,
                                  mode: stripMode,
                                  tick: animTick,
                                  speed: stripSpeed,
                                  brightness: stripBrightness,
                                  direction: stripDirection,
                                  baseColor: currentLightingColor,
                                  isOpen: stripLightEnabled,
                                  selectStaticColor: stripStaticColor,
                                  customColor: stripCustomColors[idx] || null,
                                });

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      if (e.button === 0) {
                                        handleSetStripLedColor(idx, currentLightingColor);
                                      } else if (e.button === 2) {
                                        e.preventDefault();
                                        handleClearStripLedColor(idx);
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      if ((e.buttons & 1) === 1) {
                                        handleSetStripLedColor(idx, currentLightingColor);
                                      } else if ((e.buttons & 2) === 2) {
                                        handleClearStripLedColor(idx);
                                      }
                                    }}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      handleClearStripLedColor(idx);
                                    }}
                                    style={{
                                      background: bg,
                                      boxShadow: boxShadow,
                                    }}
                                    className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] border border-white/20 transition-all duration-150 hover:scale-115 hover:z-20 cursor-pointer shadow-md group shrink-0"
                                    title={`底灯 LED #${idx + 1}：鼠标左键拖拽涂色，右键取消`}
                                  >
                                    {isCustom && (
                                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs ring-1 ring-black/40" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* 居中提示文本 (完全对齐官方驱动实机文字与鼠标图标) */}
                    <div
                      className="flex items-center justify-center gap-1.5 mt-5 text-[13px] font-medium select-none"
                      style={{ color: 'rgba(255, 255, 255, 0.92)' }}
                    >
                      <span className="text-sm">🖱️</span>
                      <span>鼠标左键拖拽修改灯光颜色，右键点击取消灯光颜色</span>
                    </div>
                  </div>

                  {/* 全机型通用 · 底部贯穿式全息导光管 / 氛围灯效物理仿真 */}
                  {(() => {
                    const modelUpper = (deviceProfile?.model || deviceProfile?.name || deviceProfile?.shortName || chipDeviceName || '').toUpperCase();
                    let stripSimTitle = '星闪键盘 底部全息导光管/氛围灯物理仿真';
                    if (modelUpper.includes('ES68')) {
                      stripSimTitle = '前行者 ES68 底部贯穿式全息导光管物理仿真';
                    } else if (modelUpper.includes('AE64')) {
                      stripSimTitle = 'AE64-MAX 底部电竞环形氛围灯光效物理仿真';
                    } else if (modelUpper.includes('DV63')) {
                      stripSimTitle = 'DV63 底部双翼全息漫反射氛围灯物理仿真';
                    } else if (modelUpper.includes('75')) {
                      stripSimTitle = '星闪 75 底部贯穿式全息电竞氛围灯物理仿真';
                    } else if (modelUpper.includes('87')) {
                      stripSimTitle = '星闪 87 底部贯穿式全息电竞氛围灯物理仿真';
                    } else if (modelUpper.includes('98')) {
                      stripSimTitle = '星闪 98 底部贯穿式全息电竞氛围灯物理仿真';
                    } else {
                      const cleanName = deviceProfile?.shortName || deviceProfile?.name || chipDeviceName || '星闪键盘';
                      stripSimTitle = `${cleanName} 底部全息导光管/氛围灯物理仿真`;
                    }

                    const hasSplitRows = decorateConfig.rowLayout && decorateConfig.rowLayout.length > 1;

                    return (
                      <div className="w-full max-w-4xl mt-4 p-4 rounded-xl bg-[#0f131a] border border-white/20 shadow-2xl flex flex-col gap-3 select-none">
                        {/* 顶栏信息与状态：采用高对比度纯白与高饱和荧光绿，消除浅色主题下文字发暗/无对比度的问题 */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399] shrink-0" />
                            <span className="font-extrabold text-white text-[13px] tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {stripSimTitle}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 font-bold shrink-0">
                              {bottomLedCount} LED 物理联动
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {hasSplitRows && (
                              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/15 text-[11px] font-medium">
                                <button
                                  type="button"
                                  onClick={() => setStripSimViewMode('unified')}
                                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                                    stripSimViewMode === 'unified'
                                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  一体全息管
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStripSimViewMode('split')}
                                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                                    stripSimViewMode === 'split'
                                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  双翼分路
                                </button>
                              </div>
                            )}

                            <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-xs flex items-center gap-1.5 drop-shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              {stripLightEnabled ? (
                                stripMode === 0 ? '常亮模式' :
                                stripMode === 1 ? `随波逐流 · ${stripDirection === 0 ? '逆时针' : '顺时针'}` :
                                (stripMode === 2 || stripMode === 7) ? `闪耀彩虹 · ${stripDirection === 0 ? '逆时针' : '顺时针'}` :
                                `流光漫延 · ${stripDirection === 0 ? '逆时针' : '顺时针'}`
                              ) : '灯带已关闭'}
                            </span>
                          </div>
                        </div>

                        {/* 导光管发光渲染区：支持一体贯穿全息管与双翼分路独立管 */}
                        {(!hasSplitRows || stripSimViewMode === 'unified') ? (
                          <div className="relative w-full h-8 rounded-full p-1 bg-black/90 border border-white/20 shadow-2xl flex items-center overflow-hidden">
                            <div
                              className="w-full h-full rounded-full transition-all duration-75"
                              style={{
                                background: `linear-gradient(to right, ${Array.from({ length: Math.min(33, Math.max(17, bottomLedCount)) }).map((_, i, arr) => {
                                  const ledIdx = Math.round((i / (arr.length - 1)) * (bottomLedCount - 1));
                                  const c = computeStripLedColor({
                                    index: ledIdx,
                                    total: bottomLedCount,
                                    mode: stripMode,
                                    tick: animTick,
                                    speed: stripSpeed,
                                    brightness: stripBrightness,
                                    direction: stripDirection,
                                    baseColor: currentLightingColor,
                                    isOpen: stripLightEnabled,
                                    selectStaticColor: stripStaticColor,
                                    customColor: stripCustomColors[ledIdx] || null,
                                  });
                                  return `${c.bg} ${(i / (arr.length - 1) * 100).toFixed(1)}%`;
                                }).join(', ')})`,
                                filter: stripLightEnabled ? `drop-shadow(0 0 ${Math.round(18 * (stripBrightness / 100))}px rgba(255,255,255,0.85))` : 'none',
                                opacity: stripLightEnabled ? Math.max(0.25, stripBrightness / 100) : 0.08,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 w-full">
                            {decorateConfig.rowLayout.map((rowSize, rIdx) => {
                              const startIdx = rIdx === 0 ? 0 : decorateConfig.rowLayout.slice(0, rIdx).reduce((a, b) => a + b, 0);
                              const rowName = rIdx === 0 ? '前沿 / 上翼漫反射导光条' : '后沿 / 下翼漫反射导光条';
                              const sampleSteps = Math.min(25, Math.max(9, rowSize));
                              return (
                                <div key={rIdx} className="flex flex-col gap-1 w-full">
                                  <div className="flex items-center justify-between text-[11px] px-1 text-zinc-300 font-mono">
                                    <span className="font-semibold text-white/90">{rowName}</span>
                                    <span className="text-zinc-400">{rowSize} LED (灯珠 #{startIdx + 1} ~ #{startIdx + rowSize})</span>
                                  </div>
                                  <div className="relative w-full h-7 rounded-full p-1 bg-black/90 border border-white/20 shadow-xl flex items-center overflow-hidden">
                                    <div
                                      className="w-full h-full rounded-full transition-all duration-75"
                                      style={{
                                        background: `linear-gradient(to right, ${Array.from({ length: sampleSteps }).map((_, i) => {
                                          const ledIdx = startIdx + Math.round((i / (sampleSteps - 1)) * (rowSize - 1));
                                          const c = computeStripLedColor({
                                            index: ledIdx,
                                            total: bottomLedCount,
                                            mode: stripMode,
                                            tick: animTick,
                                            speed: stripSpeed,
                                            brightness: stripBrightness,
                                            direction: stripDirection,
                                            baseColor: currentLightingColor,
                                            isOpen: stripLightEnabled,
                                            selectStaticColor: stripStaticColor,
                                            customColor: stripCustomColors[ledIdx] || null,
                                          });
                                          return `${c.bg} ${(i / (sampleSteps - 1) * 100).toFixed(1)}%`;
                                        }).join(', ')})`,
                                        filter: stripLightEnabled ? `drop-shadow(0 0 ${Math.round(14 * (stripBrightness / 100))}px rgba(255,255,255,0.85))` : 'none',
                                        opacity: stripLightEnabled ? Math.max(0.25, stripBrightness / 100) : 0.08,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
              <div 
                className="relative select-none mx-auto"
                style={{
                  width: `${Math.round(kbTotalWidthUnits * kbUnit)}px`,
                  height: `${Math.round(kbTotalHeightUnits * kbKeyHeight)}px`,
                }}
              >
                {ACTIVE_LAYOUT.flat().filter(k => k && !k.isSpacer && !k.gap && k.id).map((k) => {
                  const isSelected = selectedKeys.has(k.id);
                  const isPressed = liveTravels[k.id];
                  const cleanLabel = String(k.label || k.code || k.id || '').toUpperCase().trim();
                  const cleanId = String(k.id || '').replace(/^Key/, '').toUpperCase().trim();
                  const rawId = String(k.id || '').toUpperCase().trim();
                  const higherKeyItem = configuredHigherKeys.find((item) =>
                    Array.isArray(item.keys) && item.keys.some((keyName) => {
                      const cleanKey = String(keyName).replace(/^Key/, '').toUpperCase().trim();
                      const rawKey = String(keyName).toUpperCase().trim();
                      return cleanKey === cleanLabel || cleanKey === cleanId || rawKey === rawId || rawKey === cleanLabel;
                    })
                  );
                  const higherKeyBadge = higherKeyItem?.type || null;
                  const isAdvancedActive = activeTab === 'advanced' && !!higherKeyBadge;
                  const customColor = customKeyColors[k.id];
                  const assignedSwitch = perKeySwitches[k.id] || currentAxis.name;

                  // 改键映射状态：仅在【改键配置】页面（activeTab === 'keybinds'）根据当前选中的层级（Win Base, Win Fn, Mac Base, Mac Fn）展示层级按键与映射状态；
                  // 其它所有页面（触发配置、高级按键、快捷指令、性能调优等）独立管理，一律严格展示标准的物理出厂按键文本（Base Layer 键名与原键文本）
                  const isKeybindsTab = activeTab === 'keybinds';
                  const resolvedLayer = isKeybindsTab 
                    ? resolveKeyForLayer(activeKeybindLayer, k, customKeyMappings)
                    : { label: k.label, isReplaced: false, isSwapped: false, isPassThrough: false };
                  const displayLabel = isKeybindsTab ? resolvedLayer.label : k.label;
                  const isKeyReplaced = isKeybindsTab ? resolvedLayer.isReplaced : false;
                  const isKeySwapped = isKeybindsTab ? resolvedLayer.isSwapped : false;
                  const isPassThrough = isKeybindsTab ? resolvedLayer.isPassThrough : false;
                  
                  const keyLeftPx = Math.round((k.x || 0) * kbUnit);
                  const keyTopPx = Math.round((k.y || 0) * kbKeyHeight);
                  const keyWidthPx = Math.round((k.width || 1) * kbUnit - KEY_GAP_PX);
                  const keyHeightPx = Math.round((k.height || 1) * kbKeyHeight - KEY_GAP_PX);

                  // 1. 如果在【灯光设置】页面：根据当前选中的灯效模式 L1~L20 实时计算动态灯效并渲染动画！
                  if (activeTab === 'lighting') {
                    // 空格键 5 颗独立物理灯珠拆分展开 (对齐官方前行者 ES68 驱动 & 用户截屏)
                    if (k.id === 'Space' && spaceMultiLampEnabled) {
                      const subGap = 4;
                      const subWidth = Math.max(16, (keyWidthPx - subGap * 4) / 5);
                      return (
                        <div
                          key={k.id}
                          style={{
                            position: 'absolute',
                            left: `${keyLeftPx}px`,
                            top: `${keyTopPx}px`,
                            width: `${keyWidthPx}px`,
                            height: `${keyHeightPx}px`,
                          }}
                          className="flex items-center justify-between"
                        >
                          {[1, 2, 3, 4, 5].map((lampIdx) => {
                            const lampId = `Space_${lampIdx}`;
                            const lampCustomColor = customKeyColors[lampId] || (customColor || null);
                            const hw = findHwCoords(lampId);
                            const isSpaceLit = isLightingOn && (!isDoubleLight || topLightEnabled || bottomLightEnabled);
                            const visualRow = typeof k.y === 'number' ? k.y : (hw ? hw.row : k.row);
                            const visualCol = typeof k.x === 'number' 
                              ? (k.x + ((lampIdx - 0.5) / 5) * (k.width || 6.25)) 
                              : (hw ? hw.col : (k.col + lampIdx - 3));
                            let bg, boxShadow, textColor, isCustom;
                            const hwCell = (isLiveHwLightingSync && liveHardwareMatrix && hw && liveHardwareMatrix[hw.row])
                              ? liveHardwareMatrix[hw.row][hw.col]
                              : null;

                            if (hwCell && typeof hwCell.R === 'number' && typeof hwCell.G === 'number' && typeof hwCell.B === 'number') {
                              if (!isSpaceLit) {
                                bg = 'rgba(30, 41, 59, 0.45)';
                                boxShadow = 'none';
                                textColor = '#64748B';
                              } else {
                                bg = `rgb(${hwCell.R}, ${hwCell.G}, ${hwCell.B})`;
                                const lum = (hwCell.R * 299 + hwCell.G * 587 + hwCell.B * 114) / 1000;
                                textColor = lum > 128 ? '#000000' : '#FFFFFF';
                                const isNonZero = hwCell.R > 0 || hwCell.G > 0 || hwCell.B > 0;
                                boxShadow = isNonZero ? `0 0 10px rgba(${hwCell.R}, ${hwCell.G}, ${hwCell.B}, 0.7)` : 'none';
                              }
                              isCustom = !!hwCell.isCustom || !!lampCustomColor;
                            } else {
                              const computed = computeKeyLighting({
                                mode: lightingMode,
                                selectStaticColor,
                                row: visualRow,
                                col: visualCol,
                                tick: animTick,
                                brightness: lightingBrightness,
                                speed: lightingSpeed,
                                direction: lightingDirection,
                                baseColor: currentLightingColor,
                                isOpen: isSpaceLit,
                                isPressed: !!isPressed,
                                customColor: lampCustomColor,
                                isDoubleLight,
                                topLightEnabled,
                                bottomLightEnabled,
                              });
                              bg = computed.bg;
                              boxShadow = computed.boxShadow;
                              textColor = computed.textColor;
                              isCustom = computed.isCustom;
                            }

                            return (
                              <button
                                key={lampId}
                                type="button"
                                onMouseDown={(e) => {
                                  if (e.button === 0) {
                                    handleApplyKeyColor(lampId, currentLightingColor);
                                  } else if (e.button === 2) {
                                    e.preventDefault();
                                    handleEraseKeyColor(lampId);
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  if ((e.buttons & 1) === 1) {
                                    handleApplyKeyColor(lampId, currentLightingColor);
                                  } else if ((e.buttons & 2) === 2) {
                                    handleEraseKeyColor(lampId);
                                  }
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  handleEraseKeyColor(lampId);
                                }}
                                style={{
                                  width: `${subWidth}px`,
                                  height: `${keyHeightPx}px`,
                                  background: bg,
                                  boxShadow: isSpaceLit ? boxShadow : 'none',
                                }}
                                className="relative rounded-lg flex flex-col items-center justify-center transition-colors duration-100 border border-black/25 hover:scale-105 hover:z-20 cursor-pointer overflow-hidden select-none"
                                title={`空格独立灯珠 #${lampIdx} [行${hw ? hw.row : k.row} 列${hw ? hw.col : (k.col + lampIdx - 3)}]：鼠标左键拖拽涂色 [${currentLightingColor}]，右键清除`}
                              >
                                <span 
                                  style={{ color: textColor }} 
                                  className="font-extrabold text-[12px] font-mono leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] pointer-events-none"
                                >
                                  Space
                                </span>
                                <span className="text-[9px] text-white/75 font-mono scale-90 leading-none mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pointer-events-none">
                                  灯${lampIdx}
                                </span>
                                {isCustom && (
                                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none" title="已自定义涂色" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    }

                    const hw = findHwCoords(k.id);
                    const isKeyLit = isLightingOn && (!isDoubleLight || topLightEnabled || bottomLightEnabled);
                    const visualRow = typeof k.y === 'number' ? k.y : (hw ? hw.row : k.row);
                    const visualCol = typeof k.x === 'number' ? (k.x + (k.width || 1) / 2) : (hw ? hw.col : k.col);
                    let bg, boxShadow, textColor, isCustom;
                    const hwCell = (isLiveHwLightingSync && liveHardwareMatrix && hw && liveHardwareMatrix[hw.row])
                      ? liveHardwareMatrix[hw.row][hw.col]
                      : null;

                    if (hwCell && typeof hwCell.R === 'number' && typeof hwCell.G === 'number' && typeof hwCell.B === 'number') {
                      if (!isKeyLit) {
                        bg = 'rgba(30, 41, 59, 0.45)';
                        boxShadow = 'none';
                        textColor = '#64748B';
                      } else {
                        bg = `rgb(${hwCell.R}, ${hwCell.G}, ${hwCell.B})`;
                        const lum = (hwCell.R * 299 + hwCell.G * 587 + hwCell.B * 114) / 1000;
                        textColor = lum > 128 ? '#000000' : '#FFFFFF';
                        const isNonZero = hwCell.R > 0 || hwCell.G > 0 || hwCell.B > 0;
                        boxShadow = isNonZero ? `0 0 10px rgba(${hwCell.R}, ${hwCell.G}, ${hwCell.B}, 0.7)` : 'none';
                      }
                      isCustom = !!hwCell.isCustom || !!customColor;
                    } else {
                      const computed = computeKeyLighting({
                        mode: lightingMode,
                        selectStaticColor,
                        row: visualRow,
                        col: visualCol,
                        tick: animTick,
                        brightness: lightingBrightness,
                        speed: lightingSpeed,
                        direction: lightingDirection,
                        baseColor: currentLightingColor,
                        isOpen: isKeyLit,
                        isPressed: !!isPressed,
                        customColor: customColor || null,
                        isDoubleLight,
                        topLightEnabled,
                        bottomLightEnabled,
                      });
                      bg = computed.bg;
                      boxShadow = computed.boxShadow;
                      textColor = computed.textColor;
                      isCustom = computed.isCustom;
                    }

                    return (
                      <button
                        key={k.id}
                        type="button"
                        onMouseDown={(e) => {
                          if (e.button === 0) {
                            handleApplyKeyColor(k.id, currentLightingColor);
                          } else if (e.button === 2) {
                            e.preventDefault();
                            handleEraseKeyColor(k.id);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if ((e.buttons & 1) === 1) {
                            handleApplyKeyColor(k.id, currentLightingColor);
                          } else if ((e.buttons & 2) === 2) {
                            handleEraseKeyColor(k.id);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleEraseKeyColor(k.id);
                        }}
                        style={{ 
                          position: 'absolute',
                          left: `${keyLeftPx}px`,
                          top: `${keyTopPx}px`,
                          width: `${keyWidthPx}px`, 
                          height: `${keyHeightPx}px`,
                          background: bg,
                          boxShadow: isKeyLit ? boxShadow : 'none',
                        }}
                        className="rounded-[4px] flex flex-col items-center justify-center transition-colors duration-100 border border-black/25 hover:scale-105 hover:z-20 cursor-pointer overflow-hidden select-none"
                        title={`${isDoubleLight ? `单键上下双灯珠 (上位:${topLightEnabled ? '开' : '关'} / 下位:${bottomLightEnabled ? '开' : '关'})` : '物理灯珠'}[行${k.row} 列${k.col}]：鼠标左键拖拽涂色 [${currentLightingColor}]，右键清除涂色`}
                      >
                        {isDoubleLight && (
                          <span className="absolute left-0 right-0 top-1/2 h-px bg-black/40 pointer-events-none" />
                        )}
                        <span 
                          style={{ color: textColor }} 
                          className="font-extrabold text-[13px] font-mono leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] pointer-events-none"
                        >
                          {k.label}
                        </span>
                        {k.sub && (
                          <span className="text-[10px] text-white/75 font-mono scale-90 leading-none mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pointer-events-none">
                            {k.sub}
                          </span>
                        )}
                        {isCustom && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs pointer-events-none" title="已自定义涂色" />
                        )}
                      </button>
                    );
                  }

                  // 2. 其它页面 (触发设置 / 改键配置 / 高级按键 / 性能调优)：根据当前预览模式展示精准参数
                  const isSwitchTab = activeTab === 'trigger' && triggerSubTab === 'switch';
                  const keyPerf = perKeyPerformances[k.id] || {};
                  const isCurrentlyEditing = isSelected;
                  const effectiveAP = isCurrentlyEditing 
                    ? actuationPoint 
                    : (keyPerf.rtFirstTouch || keyPerf.normalPress || currentAxis.recommendedAP || 0.40);
                  const effectiveRtPress = isCurrentlyEditing 
                    ? (rtEnabled ? rtPress : 0) 
                    : (keyPerf.rtPress !== undefined ? keyPerf.rtPress : (keyPerf.mode === 1 ? 0.01 : 0));
                  const effectiveRtRelease = isCurrentlyEditing 
                    ? (rtEnabled ? rtRelease : 0) 
                    : (keyPerf.rtRelease !== undefined ? keyPerf.rtRelease : (keyPerf.mode === 1 ? 0.01 : 0));
                  const effectiveTopDeadzone = isCurrentlyEditing 
                    ? deadzone 
                    : (keyPerf.pressDeadStroke !== undefined ? keyPerf.pressDeadStroke : 0.04);
                  const effectiveBottomDeadzone = isCurrentlyEditing 
                    ? (separateDeadzone ? bottomDeadzone : deadzone) 
                    : (keyPerf.releaseDeadStroke !== undefined ? keyPerf.releaseDeadStroke : 0.05);
                  const effectiveRtOn = isCurrentlyEditing 
                    ? rtEnabled 
                    : (keyPerf.mode === 1);

                  const switchShortName = k.width >= 3
                    ? assignedSwitch 
                    : assignedSwitch
                        .replace(/定制磁轴|定制轴|磁轴/g, '')
                        .replace(/轴(?=\s|[A-Za-z]|$)/g, '')
                        .replace(/轴$/g, '')
                        .trim();

                  return (
                    <button
                      key={k.id}
                      data-key-id={k.id}
                      draggable={activeTab === 'advanced' || activeTab === 'keybinds'}
                      onDragStart={(e) => {
                        const cleanChar = String(k.label || k.code || k.id || '').replace(/^Key/, '').trim();
                        e.dataTransfer.setData('text/plain', cleanChar);
                        e.dataTransfer.setData('application/sparklink-key', JSON.stringify({
                          id: k.id,
                          label: k.label,
                          char: cleanChar,
                          row: k.row,
                          col: k.col
                        }));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => toggleKey(k.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (activeTab === 'keybinds') {
                          setCustomKeyMappings(prev => {
                            const next = { ...prev };
                            const layerMap = { ...next[activeKeybindLayer] };
                            delete layerMap[k.id];
                            next[activeKeybindLayer] = layerMap;
                            if (currentDeviceScopeKey) {
                              try {
                                localStorage.setItem(`sparklink_custom_key_mappings_${currentDeviceScopeKey}`, JSON.stringify(next));
                              } catch (err) {}
                            }
                            return next;
                          });
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab === 'advanced') return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredKeyTooltip({
                          keyId: k.id,
                          keyLabel: k.label,
                          subLabel: k.sub,
                          assignedSwitch,
                          effectiveAP,
                          effectiveRtOn,
                          canContinuousRt,
                          continuousRt,
                          effectiveRtPress,
                          effectiveRtRelease,
                          effectiveTopDeadzone,
                          effectiveBottomDeadzone,
                          shakeFilter,
                          furyMode,
                          displayLabel,
                          isKeyReplaced,
                          isKeySwapped,
                          isPassThrough,
                          activeKeybindLayer,
                          higherKeyBadge,
                          higherKeyItem,
                          rect: {
                            left: rect.left,
                            top: rect.top,
                            right: rect.right,
                            bottom: rect.bottom,
                            width: rect.width,
                            height: rect.height,
                          },
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredKeyTooltip(null);
                      }}
                      onDragOver={(e) => {
                        if (activeTab === 'keybinds') {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                          if (dragOverKeyId !== k.id) {
                            setDragOverKeyId(k.id);
                          }
                        }
                      }}
                      onDragEnter={(e) => {
                        if (activeTab === 'keybinds') {
                          e.preventDefault();
                          setDragOverKeyId(k.id);
                        }
                      }}
                      onDragLeave={(e) => {
                        if (activeTab === 'keybinds' && dragOverKeyId === k.id) {
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setDragOverKeyId(null);
                          }
                        }
                      }}
                      onDrop={(e) => {
                        if (activeTab === 'keybinds') {
                          e.preventDefault();
                          setDragOverKeyId(null);
                          try {
                            const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                            if (raw) {
                              const item = JSON.parse(raw);
                              handleAssignKeyToSpecificKeys([k.id], item);
                            }
                          } catch (err) {
                            console.error('Drop keybind error:', err);
                          }
                        }
                      }}
                      style={{ 
                        position: 'absolute',
                        left: `${keyLeftPx}px`,
                        top: `${keyTopPx}px`,
                        width: `${keyWidthPx}px`, 
                        height: `${keyHeightPx}px`,
                      }}
                      className={`rounded-[4px] flex flex-col items-center justify-between p-0.5 overflow-hidden transition-all duration-100 select-none ${
                        activeTab === 'advanced' ? 'cursor-grab active:cursor-grabbing hover:border-[#0052ef] ' : ''
                      }${
                        activeTab === 'keybinds' && dragOverKeyId === k.id
                          ? '!ring-2 !ring-[var(--info-color)] !bg-[var(--primary-04)] !scale-105 !z-30 shadow-lg'
                          : isPressed
                          ? (activeTab === 'lighting' ? 'keycap-light-pressed' : 'keycap-lite-pressed')
                          : (activeTab === 'advanced' && isAdvancedActive)
                          ? 'bg-[#0D5FFF] text-white border-2 border-[#0D5FFF] font-bold shadow-md ring-2 ring-[#0D5FFF]/30'
                          : isSelected
                          ? (activeTab === 'lighting' ? 'keycap-light-selected' : 'keycap-lite-selected')
                          : (activeTab === 'keybinds' && isKeyReplaced)
                          ? 'bg-[var(--primary-04)]/80 border-[var(--info-color)] text-[var(--info-color)] shadow-sm'
                          : (activeTab === 'keybinds' && isKeySwapped)
                          ? 'bg-[#fed7aa] dark:bg-[#7c2d12]/70 border-[#fb923c] dark:border-[#ea580c] text-[#9a3412] dark:text-[#fed7aa] shadow-xs font-semibold'
                          : (activeTab === 'keybinds' && isPassThrough)
                          ? 'bg-[var(--bg-tertiary)]/20 border border-dashed border-[var(--border-color)]/60 text-zinc-400 dark:text-zinc-500'
                          : (activeTab === 'lighting' ? 'keycap-light text-[var(--text-secondary)]' : 'keycap-lite')
                      }`}
                    >
                      {/* 1. 顶部微标内容 (按需解析) */}
                      {(() => {
                        let topNode = null;
                        if (activeTab === 'keybinds') {
                          const kbBadge = isKeyReplaced ? '已改键' : isKeySwapped ? '换位' : isPassThrough ? '' : (activeKeybindLayer === 'win_default' ? '原键' : '');
                          if (kbBadge) {
                            topNode = (
                              <span className={`text-[8.5px] font-sans leading-none truncate ${
                                isKeyReplaced 
                                  ? 'text-[var(--info-color)] font-bold' 
                                  : isKeySwapped 
                                  ? 'text-[#9a3412] dark:text-[#fed7aa] font-bold' 
                                  : 'text-[var(--text-disabled)]'
                              }`}>
                                {kbBadge}
                              </span>
                            );
                          }
                        } else if (isSwitchTab) {
                          if (!k.isArrow) {
                            const isSmallKey = (k.width || 1) < 1.25;
                            const len = switchShortName.length;
                            // 自适应字号与字间距，彻底消除 1u 键位上的省略号截断（如 "磁玉 Pro" 完整清晰呈现）
                            const badgeFontSize = !isSmallKey 
                              ? (len > 8 ? '8px' : '8.5px')
                              : (len > 6 ? '6.5px' : len > 4 ? '7px' : len > 3 ? '7.5px' : '8px');
                            const badgeLetterSpacing = isSmallKey ? (len > 5 ? '-0.04em' : '-0.02em') : '-0.01em';
                            const badgePadding = isSmallKey ? 'px-0.5 py-[0.5px]' : 'px-1.5 py-0.5';

                            topNode = (
                              <span 
                                style={{ 
                                  fontSize: badgeFontSize, 
                                  letterSpacing: badgeLetterSpacing,
                                  transform: isSmallKey && len > 8 ? 'scale(0.88)' : 'none',
                                  transformOrigin: 'center'
                                }}
                                className={`inline-flex items-center justify-center font-sans leading-none text-[var(--info-color)] font-bold bg-[var(--primary-04)] ${badgePadding} rounded border border-[var(--primary-15)] whitespace-nowrap select-none max-w-full text-center shadow-2xs`}
                              >
                                {switchShortName}
                              </span>
                            );
                          }
                        } else if (activeTab === 'trigger' && paramPreviewMode === 'rt') {
                          if (effectiveRtOn) {
                            topNode = (
                              <span className="text-[9.5px] font-mono leading-none px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                                {effectiveRtPress < 0.01 ? effectiveRtPress.toFixed(3) : effectiveRtPress.toFixed(2)}
                              </span>
                            );
                          }
                        } else if (activeTab === 'trigger' && paramPreviewMode === 'deadzone') {
                          topNode = (
                            <span className="text-[9px] font-mono leading-none text-rose-500 font-bold tracking-tight">
                              ▲{effectiveTopDeadzone.toFixed(2)}
                            </span>
                          );
                        }

                        {/* 2. 底部微标/参数内容 (按需解析：当配置了高级键且处于触发预览时，两者并排共存，互不顶掉) */}
                        let bottomNode = null;
                        if (activeTab === 'advanced') {
                          if (higherKeyBadge) {
                            bottomNode = (
                              <span className="px-1.5 py-[0.5px] bg-[#0062FF] text-white rounded-[2.5px] text-[10px] font-black tracking-tight leading-none shadow-xs select-none">
                                {higherKeyBadge}
                              </span>
                            );
                          }
                        } else if (activeTab === 'trigger') {
                          let paramNode = null;
                          if (paramPreviewMode === 'ap') {
                            paramNode = (
                              <span className="text-[9.5px] font-mono font-bold leading-none text-[var(--info-color)]">
                                ▲{effectiveAP.toFixed(2)}
                              </span>
                            );
                          } else if (paramPreviewMode === 'rt') {
                            paramNode = effectiveRtOn ? (
                              <span className="text-[8.5px] font-mono leading-none px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                                {effectiveRtRelease < 0.01 ? effectiveRtRelease.toFixed(3) : effectiveRtRelease.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-mono font-bold text-[var(--text-disabled)]">OFF</span>
                            );
                          } else if (paramPreviewMode === 'deadzone') {
                            paramNode = (
                              <span className="text-[9px] font-mono leading-none text-amber-500 font-bold tracking-tight">
                                ▼{effectiveBottomDeadzone.toFixed(2)}
                              </span>
                            );
                          }
                          // 触发设置页面按键内部只展示触发参数数值，不显示高级键微标（用户要求：仅在高级页面按键内与触发悬浮信息窗内展示）
                          bottomNode = paramNode;
                        } else if (activeTab === 'keybinds') {
                          const subText = isKeyReplaced ? `原:${k.label}` : isKeySwapped ? `Win:${k.label}` : (isPassThrough ? '' : (k.sub || ''));
                          if (higherKeyBadge && subText) {
                            bottomNode = (
                              <div className="flex items-center justify-center gap-1 max-w-full leading-none">
                                <span className="px-1 py-[0.5px] bg-[#0062FF] text-white rounded-[2px] text-[8.5px] font-black tracking-tight leading-none shadow-2xs select-none shrink-0">
                                  {higherKeyBadge}
                                </span>
                                <span className={`text-[9px] font-mono leading-none truncate ${
                                  isKeyReplaced 
                                    ? 'text-[var(--info-color)] font-bold' 
                                    : isKeySwapped 
                                    ? 'text-[#9a3412]/80 dark:text-[#fed7aa]/80' 
                                    : 'text-[var(--text-disabled)]'
                                }`}>
                                  {subText}
                                </span>
                              </div>
                            );
                          } else if (higherKeyBadge) {
                            bottomNode = (
                              <span className="px-1.5 py-[0.5px] bg-[#0062FF] text-white rounded-[2px] text-[9.5px] font-black tracking-tight leading-none shadow-xs select-none">
                                {higherKeyBadge}
                              </span>
                            );
                          } else if (subText) {
                            bottomNode = (
                              <span className={`text-[9.5px] font-mono leading-none truncate ${
                                isKeyReplaced 
                                  ? 'text-[var(--info-color)] font-bold' 
                                  : isKeySwapped 
                                  ? 'text-[#9a3412]/80 dark:text-[#fed7aa]/80' 
                                  : 'text-[var(--text-disabled)]'
                              }`}>
                                {subText}
                              </span>
                            );
                          }
                        } else if (higherKeyBadge) {
                          bottomNode = (
                            <span className="px-1.5 py-[0.5px] bg-[#0062FF] text-white rounded-[2.5px] text-[10px] font-black tracking-tight leading-none shadow-xs select-none">
                              {higherKeyBadge}
                            </span>
                          );
                        } else if (k.sub) {
                          bottomNode = (
                            <span className="text-[9.5px] font-mono leading-none text-[var(--text-disabled)] truncate">
                              {k.sub}
                            </span>
                          );
                        }

                        {/* 3. 中心字符自适应字号 (字号放大且保持适度留白，保证文字清晰锐利不拥挤) */}
                        const computedFontSize = displayLabel.length > 5
                          ? Math.max(9, Math.min(10.5, Math.round(kbUnit * 0.17)))
                          : displayLabel.length > 3
                          ? Math.max(10, Math.min(11.5, Math.round(kbUnit * 0.19)))
                          : Math.max(11.5, Math.min(14, Math.round(kbUnit * (topNode && bottomNode ? 0.22 : 0.25))));

                        return (
                          <>
                            {/* 顶部微标 (固定 12px 高度，保证上下边框与字体完好展示) */}
                            {topNode ? (
                              <div className="h-[12px] flex items-center justify-center max-w-full px-0.25 pointer-events-none shrink-0 leading-none">
                                {topNode}
                              </div>
                            ) : null}

                            {/* 键位中心字符 (flex-1 独立垂直弹性槽位，居中呈现，永不与上下微标发生物理重叠) */}
                            <div className="flex-1 flex items-center justify-center min-h-[14px] w-full overflow-hidden pointer-events-none px-0.5">
                              <span 
                                style={{ fontSize: `${computedFontSize}px`, lineHeight: 1 }}
                                className={`font-bold tracking-tight text-center truncate ${
                                  activeTab === 'advanced' && (isSelected || isAdvancedActive)
                                    ? 'text-white'
                                    : isKeyReplaced
                                    ? 'text-[var(--info-color)] font-mono'
                                    : isPassThrough
                                    ? 'text-zinc-400 dark:text-zinc-500 font-normal'
                                    : isKeySwapped
                                    ? 'text-[#9a3412] dark:text-[#fed7aa]'
                                    : ''
                                }`}
                              >
                                {displayLabel}
                              </span>
                            </div>

                            {/* 底部副标/参数/高级键徽标 (固定 11px 高度，保证整齐统一，不贴边被截断) */}
                            {bottomNode ? (
                              <div className="h-[11px] flex items-center justify-center max-w-full px-0.5 pointer-events-none shrink-0 leading-none">
                                {bottomNode}
                              </div>
                            ) : null}
                          </>
                        );
                      })()}
                    </button>
                  );
                })}
              </div>
              )}
            </div>

            <div className="relative flex items-center justify-between gap-3 mt-2 text-[11px] text-[var(--text-disabled)] font-medium shrink-0 min-w-0 h-8">
              <span className="truncate min-w-0 flex-1 pr-4">{
                activeTab === 'lighting'
                  ? (activeLightingArea !== 'keyboard'
                      ? '提示：鼠标左键点选灯珠修改灯光颜色，右键点击取消涂色；下方可调整灯带专属4大灯效、速度、亮度及旋转方向。'
                      : '提示：点击鼠标左键修改单键灯光颜色，右键点击取消按键自定义颜色。')
                  : activeTab === 'keybinds' 
                  ? '提示：在上方点选键位后，点击下方替换键即可瞬间完成映射替换；右键按键可恢复原键。' 
                  : '敲击键盘任意键即可在上方结构图查看下压响应。'
              }</span>

              {/* 迈从式三种参数预览界面切换栏：居中水平对齐展示 (对应图二需求) */}
              {activeTab === 'trigger' && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1.5 py-0.5 px-2.5 bg-[var(--bg-tertiary)] rounded-[8px] border border-[var(--border-color)] shadow-xs z-10 pointer-events-auto">
                  <span className="text-[11px] font-bold text-[var(--text-disabled)] mr-1">预览显示：</span>
                  <button
                    type="button"
                    data-preview-mode="ap"
                    onClick={() => setParamPreviewMode('ap')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paramPreviewMode === 'ap'
                        ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-xs'
                        : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    触发键程
                  </button>
                  <button
                    type="button"
                    data-preview-mode="rt"
                    onClick={() => setParamPreviewMode('rt')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paramPreviewMode === 'rt'
                        ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-xs'
                        : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    快速触发 (RT)
                  </button>
                  <button
                    type="button"
                    data-preview-mode="deadzone"
                    onClick={() => setParamPreviewMode('deadzone')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paramPreviewMode === 'deadzone'
                        ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-xs'
                        : 'bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    死区
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-3 shrink-0 pl-4">
                {activeTab === 'lighting' ? (
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 to-blue-500 mr-1"></span> 独立RGB单键发光</span>
                ) : activeTab === 'keybinds' ? (
                  <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[var(--primary-04)] border border-[var(--info-color)] mr-1"></span> 已替换映射</span>
                ) : activeTab === 'advanced' ? (
                  <>
                    <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[var(--primary-09)] border border-[var(--info-color)] mr-1"></span> 选中按键</span>
                    <span className="flex items-center"><span className="px-1.5 py-[0.5px] bg-[#0062FF] text-white rounded-[2.5px] text-[9.5px] font-black mr-1 shadow-2xs">高级键</span> 按键已配对应模式</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[var(--primary-09)] border border-[var(--info-color)] mr-1"></span> 选中编辑</span>
                  </>
                )}
                <span className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--primary-25)] mr-1"></span> 默认键位</span>
              </div>
            </div>
          </div>

          {/* 右侧竖排快捷操作栏：统一保持尺寸，与键盘卡片并肩齐平，杜绝切页时大卡片忽大忽小 */}
          <div className="w-32 shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-color)]/90 rounded-[8px] p-2.5 shadow-sm flex flex-col justify-between self-stretch">
            {activeTab === 'keybinds' ? (
              <div className="flex flex-col gap-2.5 flex-1 justify-center py-1">
                {[
                  { id: 'win_default', label: 'Win Base' },
                  { id: 'win_fn', label: 'Win Fn' },
                  { id: 'mac_default', label: 'Mac Base' },
                  { id: 'mac_fn', label: 'Mac Fn' },
                ].map((layer) => {
                  const isActive = activeKeybindLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setActiveKeybindLayer(layer.id)}
                      className={`py-2 px-3 rounded-[6px] text-xs font-bold transition-all cursor-pointer border text-center shadow-2xs ${
                        isActive
                          ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-xs'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--primary-25)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {layer.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const layerNameMap = { win_default: 'Win Base', win_fn: 'Win Fn', mac_default: 'Mac Base', mac_fn: 'Mac Fn' };
                    setCustomKeyMappings(prev => {
                      const next = { ...prev, [activeKeybindLayer]: {} };
                      if (currentDeviceScopeKey) {
                        try {
                          localStorage.setItem(`sparklink_custom_key_mappings_${currentDeviceScopeKey}`, JSON.stringify(next));
                        } catch (err) {}
                      }
                      return next;
                    });
                    addToast({ message: `已恢复【${layerNameMap[activeKeybindLayer] || activeKeybindLayer}】为出厂默认键位`, type: 'info' });
                  }}
                  className="py-2 px-3 rounded-[6px] text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:text-rose-500 hover:border-rose-400/80 transition cursor-pointer text-center shadow-2xs mt-1"
                >
                  恢复默认
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 flex-1 justify-center">
                {[
                  { label: '全选按键', onClick: handleSelectAll },
                  { label: '反选按键', onClick: handleInvertSelect },
                  { label: 'WASD急停', onClick: handleSelectWASD },
                  { label: '取消选中', onClick: handleClearSelect },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className="px-3 py-2.5 rounded-[8px] text-xs font-bold bg-[var(--bg-tertiary)] hover:bg-[var(--primary-04)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] transition cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
          )}



          {/* 当处于 trigger 页面时，展示顶部三段式切换 (完全对齐截屏1中的 [触发设置] [死区设置] [轴体设置]) */}
          {activeTab === 'trigger' && (
            <div className="relative z-10 flex items-center justify-between gap-3 px-1 min-w-0">
              <div className="flex items-center space-x-1.5 p-1 bg-[var(--primary-09)] rounded-[8px] border border-[var(--border-color)] shrink-0">
                {[
                  { id: 'trigger', label: '触发设置' },
                  { id: 'deadzone', label: '死区设置' },
                  { id: 'switch', label: '轴体设置' },
                ].map((t) => (
                  <button
                    key={t.id}
                    data-subtab={t.id}
                    onClick={() => setTriggerSubTab(t.id)}
                    className={`px-4 py-1 rounded-lg text-xs font-bold transition-all ${
                      triggerSubTab === t.id
                        ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)] shadow-sm'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="text-[12px] text-[var(--text-disabled)] font-medium truncate min-w-0">
                当前模式: <strong className="text-[var(--text-secondary)]">{
                  triggerSubTab === 'trigger' ? '触发行程与快速重置 (RT)' :
                  triggerSubTab === 'deadzone' ? '上下极限死区与消抖' :
                  '3D 机械轴体校准指派'
                }</strong>
              </div>
            </div>
          )}

          {/* 下半部分：动态 Tab 内容 */}
          {activeTab === 'lighting' && (
            <LightingTab
              currentMode={lightingMode}
              onModeChange={setLightingMode}
              selectStaticColor={selectStaticColor}
              onSelectStaticColorChange={(idx, hex) => {
                setSelectStaticColor(idx);
                if (hex) setCurrentLightingColor(hex);
              }}
              brightness={lightingBrightness}
              onBrightnessChange={setLightingBrightness}
              speed={lightingSpeed}
              onSpeedChange={setLightingSpeed}
              lightingDirection={lightingDirection}
              onLightingDirectionChange={handleLightingDirectionChange}
              lightEnabled={isLightingOn}
              onLightEnabledChange={handleMasterLightSwitch}
              onCustomColorChange={setCurrentLightingColor}
              customKeyColors={customKeyColors}
              onClearCustomKeyColors={() => {
                customKeyColorsRef.current = {};
                setCustomKeyColors({});
                syncLightingToHardware({}, true);
                if (keyboardService.connected) {
                  keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, isDoubleLight ? 'DoubleLighting' : 'SingleLighting', {
                    open: isLightingOn ? 'Open' : 'Close',
                    selectStaticColor,
                  });
                }
              }}
              lightingAreas={lightingAreas}
              decorateConfig={decorateConfig}
              hasDecorateLighting={hasDecorateLighting}
              isDoubleLight={isDoubleLight}
              topLightEnabled={topLightEnabled}
              onTopLightEnabledChange={handleTopLightSwitch}
              bottomLightEnabled={bottomLightEnabled}
              onBottomLightEnabledChange={handleBottomLightSwitch}
              lightingLinked={lightingLinked}
              onLightingLinkedChange={handleLightingLinkedToggle}
              decorateColors={decorateColors}
              onDecorateColorsChange={setDecorateColors}
              onSyncDecorate={async (entries) => {
                const ok = await keyboardService.setDecorateCustom(1, decorateConfig.rows || 1, decorateConfig.cols || bottomLedCount, entries, bottomLedCount);
                if (!ok) addToast({ message: '装饰灯下发失败，请检查连接。', type: 'warning' });
              }}
              spaceMultiLampEnabled={spaceMultiLampEnabled}
              onToggleSpaceMultiLamp={() => setSpaceMultiLampEnabled((prev) => !prev)}
              onSetSpaceLampColor={handleSetSpaceLampColor}
              onClearSpaceLamp={handleClearSpaceLamp}
              onSetAllSpaceLamps={handleSetAllSpaceLamps}
              onRainbowSpaceLamps={handleRainbowSpaceLamps}
              onClearAllSpaceLamps={handleClearAllSpaceLamps}
              activeLightingArea={activeLightingArea}
              onActiveLightingAreaChange={setActiveLightingArea}
              stripMode={stripMode}
              onStripModeChange={setStripMode}
              stripBrightness={stripBrightness}
              onStripBrightnessChange={setStripBrightness}
              stripSpeed={stripSpeed}
              onStripSpeedChange={setStripSpeed}
              stripDirection={stripDirection}
              onStripDirectionChange={setStripDirection}
              stripLightEnabled={stripLightEnabled}
              onStripLightEnabledChange={setStripLightEnabled}
              stripStaticColor={stripStaticColor}
              onStripStaticColorChange={(idx, hex) => {
                setStripStaticColor(idx);
                if (hex) setCurrentLightingColor(hex);
              }}
              bottomLedCount={bottomLedCount}
              onUpdateStripCount={handleUpdateStripCount}
              onApplyAllKeyColor={(color) => {
                const allColors = {};
                ACTIVE_LAYOUT.forEach(row => row.forEach(k => {
                  allColors[k.id] = color;
                }));
                [1, 2, 3, 4, 5].forEach(i => {
                  allColors[`Space_${i}`] = color;
                });
                customKeyColorsRef.current = allColors;
                setCustomKeyColors(allColors);
                // 官网双层动画规范：自定义涂色作为 Layer 1 叠加作用于当前动效模式上，严禁强切为 mode 20！
                syncLightingToHardware(allColors, true);
                if (keyboardService.connected) {
                  keyboardService.setLightingBase('Keyboard', lightingMode, lightingBrightness, lightingSpeed, isDoubleLight ? 'DoubleLighting' : 'SingleLighting', {
                    open: isLightingOn ? 'Open' : 'Close',
                    selectStaticColor,
                  });
                }
              }}
              onSetAllStrip={handleSetAllStrip}
              onRainbowStrip={handleRainbowStrip}
              onClearAllStrip={handleClearAllStrip}
              isLiveHwLightingSync={isLiveHwLightingSync}
              onToggleLiveHwLightingSync={handleToggleLiveHwLightingSync}
              isConnected={isConnected}
            />
          )}
          {activeTab === 'keybinds' && (
            <KeybindsTab 
              selectedKeys={selectedKeys} 
              activeLayer={activeKeybindLayer}
              onLayerChange={setActiveKeybindLayer}
              onAssignKey={(newKeyItem) => {
                handleAssignKeyToSpecificKeys(Array.from(selectedKeys), newKeyItem);
              }}
              onResetLayer={() => {
                setCustomKeyMappings(prev => {
                  const next = { ...prev, [activeKeybindLayer]: {} };
                  if (currentDeviceScopeKey) {
                    try {
                      localStorage.setItem(`sparklink_custom_key_mappings_${currentDeviceScopeKey}`, JSON.stringify(next));
                    } catch (err) {}
                  }
                  return next;
                });
              }}
            />
          )}
          {activeTab === 'advanced' && (
            <AdvancedTab
              deviceScopeKey={currentDeviceScopeKey}
              socdKeys={socdKeys}
              onSocdKeysChange={handleSocdKeysChange}
              layout={ACTIVE_LAYOUT}
              selectedKeyFromApp={Array.from(selectedKeys)[selectedKeys.size - 1] || null}
              lastVirtualKeyClick={lastAdvancedKeyClick}
              onConfiguredKeysChange={(list) => {
                setConfiguredHigherKeys(list);
                if (currentDeviceScopeKey) {
                  try {
                    localStorage.setItem(`sparklink_configured_higher_keys_${currentDeviceScopeKey}`, JSON.stringify(list));
                  } catch (e) {}
                }
              }}
              hwKeyCoords={hwKeyCoords}
              findHwCoords={findHwCoords}
            />
          )}
          {activeTab === 'macro' && (
            <MacroTab />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab 
              pollingRate={pollingRate} 
              onPollingRateChange={setPollingRate} 
              deviceProfile={deviceProfile}
              onOpenUsb3Prompt={() => setShowUsb3DriverModal(true)}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              pollingRate={pollingRate} 
              onPollingRateChange={setPollingRate} 
              deviceProfile={deviceProfile}
              hardwareInfo={hardwareInfo}
              hardwareFeatures={hardwareFeatures}
              device={device}
              onOpenDevLab={() => setShowDevLabModal(true)}
            />
          )}
          {activeTab === 'profiles' && (
            <ProfileManagerTab 
              deviceScope={currentDeviceScopeKey}
              activeBoardSlot={activeBoardSlot}
              onSwitchBoardSlot={handleSwitchBoardSlot}
              currentKeyboardParams={{
                actuationPoint,
                rtEnabled,
                rtPress: rtPressPrecision === '0.001mm' ? 0.001 : rtPressPrecision === '0.005mm' ? 0.005 : parseFloat(rtPressPrecision) || 0.01,
                rtRelease: rtReleasePrecision === '0.001mm' ? 0.001 : rtReleasePrecision === '0.005mm' ? 0.005 : parseFloat(rtReleasePrecision) || 0.01,
                initialDeadzone: deadzone,
                bottomDeadzone,
                shakeFilter,
                pollingRate,
                furyMode,
                currentAxis
              }}
              onApplyProfileToHardware={handleApplyProfileToHardware}
              isConnected={isConnected}
              deviceProfile={deviceProfile}
              slotAliases={boardSlotAliases}
              onRenameSlot={handleRenameBoardSlot}
              slotRemarks={boardSlotRemarks}
              onUpdateSlotRemark={handleUpdateSlotRemark}
            />
          )}

          {/* 触发设置分支：轴体设置 (截屏 1, 2, 3，平铺式子页面) */}
          {activeTab === 'trigger' && triggerSubTab === 'switch' && (
            <SwitchSettingTab
              currentAxis={currentAxis}
              selectedKeysCount={selectedKeys.size}
              keyCount={KEY_COUNT}
              allAxes={axisList}
              primaryAxisKeyword={deviceProfile?.defaultAxis || '磁玉'}
              primaryAxisBadge={deviceProfile?.id === 'dv63' ? 'DV63默认' : (deviceProfile?.id === 'es68' ? 'ES68默认' : '常用轴体')}
              onSelectAxis={(sw) => {
                setCurrentAxis(sw);
                axisService.applyAxisToKeyboard(sw);
                if (actuationPoint > sw.travel) setActuationPoint(sw.travel);
                if (selectedKeys.size > 0) {
                  const updated = { ...perKeySwitches };
                  selectedKeys.forEach(id => {
                    updated[id] = sw.name;
                  });
                  setPerKeySwitches(updated);
                } else {
                  const updated = {};
                  ACTIVE_LAYOUT.forEach(r => r.forEach(k => {
                    updated[k.id] = sw.name;
                  }));
                  setPerKeySwitches(updated);
                }
              }}
            />
          )}

          {/* 触发设置分支：死区设置 */}
          {activeTab === 'trigger' && triggerSubTab === 'deadzone' && (
            <DeadzoneSettingTab
              initialDeadzone={deadzone}
              bottomDeadzone={bottomDeadzone}
              shakeFilter={shakeFilter}
              antiGhosting={antiGhosting}
              onAntiGhostingChange={handleAntiGhostingChange}
              selectedKeysCount={selectedKeys.size}
              onDeadzoneChange={(d) => {
                setDeadzone(d.initialDeadzone);
                setBottomDeadzone(d.bottomDeadzone);
                setShakeFilter(d.shakeFilter);
              }}
            />
          )}

          {/* 触发设置分支：默认触发设置 (AP + RT) */}
          {activeTab === 'trigger' && triggerSubTab === 'trigger' && (
            <div className="panel-operation panel-operation-bottom flex-1">
              <div className="operation-columns">
              
              {/* 1. 设置触发行程 (AP) - 紧凑高完成度无滚动条布局 */}
              <div 
                className="col flex flex-col justify-between"
                style={{ flex: '1.3 1 0', minWidth: '310px' }}
                onPointerDownCapture={() => setParamPreviewMode('ap')}
              >
                <div className="flex flex-col flex-1 min-h-0">
                  {/* 顶部标题栏 */}
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <div>
                      <h3 className="text-[13px] font-bold text-[var(--text-primary)] flex items-center">
                        <Crosshair className="w-4 h-4 mr-1 text-[var(--info-color)]" />
                        设置触发行程 (AP)
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">为所选按键设置物理触发点</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--info-color)] bg-[var(--primary-04)] px-2.5 py-0.5 rounded border border-[var(--primary-15)]">
                      {actuationPoint.toFixed(2)} mm
                    </span>
                  </div>

                  {/* 轴体快捷切换与校准行 (参考图一：选择轴体 [下拉] + 校准按钮) */}
                  <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 mb-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] shrink-0">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-xs text-[var(--text-secondary)] shrink-0 font-medium">选择轴体:</span>
                      <button
                        type="button"
                        onClick={() => setTriggerSubTab('switch')}
                        className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--primary-color)] flex items-center gap-1 truncate cursor-pointer transition"
                        title="点击展开全量轴体选择"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] shrink-0"></span>
                        <span className="truncate max-w-[110px]">{currentAxis.name}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-normal shrink-0">▾</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setParamPreviewMode('ap');
                          setActuationPoint(currentAxis.recommendedAP || 0.40);
                          addToast({ message: `已恢复推荐触发行程: ${currentAxis.recommendedAP || 0.40}mm`, type: 'info' });
                        }}
                        className="text-xs px-2.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-[var(--text-secondary)] font-medium transition cursor-pointer"
                        title="恢复推荐触发行程"
                      >
                        恢复推荐
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCalibrateModal(true)}
                        className="text-xs px-2.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-[var(--text-secondary)] font-medium transition cursor-pointer flex items-center"
                        title="开启键盘全键霍尔电压与行程极值校准"
                      >
                        <RotateCcw className="w-3 h-3 mr-1 text-[var(--info-color)]" />
                        校准
                      </button>
                    </div>
                  </div>

                  {/* 轴体剖面图 + 竖向行程滑块 + 可拖动/可键盘输入数值标签 (116px 黄金比例，完全消除重叠并1:1对齐官方UI) */}
                  <div className="flex-1 flex flex-col justify-between px-3 pt-2 pb-2 bg-[var(--bg-tertiary)] rounded-[8px] border border-[var(--border-color)] overflow-hidden min-h-[146px]">
                    <div className="flex items-center justify-between mb-1 shrink-0">
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">行程范围</span>
                      <span className="text-xs text-[var(--text-secondary)] font-mono">
                        {minActuationPoint.toFixed(minActuationPoint < 0.01 ? 3 : 2)} ~ {currentAxis.maxTravel.toFixed(2)}mm
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center my-auto py-1">
                      <VerticalTravelSlider
                        value={actuationPoint}
                        max={currentAxis.maxTravel}
                        min={minActuationPoint}
                        step={activeActuationStep}
                        height={116}
                        showSwitchIllustration={true}
                        ariaLabel={`${currentAxis.name} 触发行程`}
                        onChange={(v) => {
                          setParamPreviewMode('ap');
                          setActuationPoint(v);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 底部提示文本 (留足安全间距，彻底杜绝重叠) */}
                <div className="mt-2 pt-1 flex items-center justify-between text-xs font-medium shrink-0 select-none">
                  {selectedKeys.size > 0 ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      已生效 (已选 {selectedKeys.size} 键)
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center">
                      未选按键 (拖动仅手感预览，选中后生效)
                    </span>
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedKeys.size === 0) {
                        addToast({ message: '请先在上方键盘选中需要恢复推荐行程的按键！', type: 'info' });
                        return;
                      }
                      setParamPreviewMode('ap');
                      const recAP = currentAxis.recommendedAP || 0.40;
                      setActuationPoint(recAP);
                      writePerformanceToKeys({ normalPress: recAP, rtFirstTouch: recAP }, '推荐触发行程');
                    }} 
                    className="text-xs text-[var(--info-color)] font-semibold hover:underline cursor-pointer"
                  >
                    恢复推荐 ({currentAxis.recommendedAP || 0.40}mm)
                  </button>
                </div>
              </div>

              {/* 2. 快速触发 (RT) */}
              <div 
                className="col flex flex-col"
                onPointerDownCapture={() => setParamPreviewMode('rt')}
              >
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center">
                        <Zap className="w-3.5 h-3.5 mr-1.5 text-[var(--info-color)]" />
                        快速触发 (RT) 动态重置
                      </h3>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={rtEnabled} 
                        onChange={(e) => {
                          setParamPreviewMode('rt');
                          setRtEnabled(e.target.checked);
                        }} 
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>

                  {/* 输入调节区：撑满剩余高度并居中自适应，消除空洞且防重叠。未开启 RT 时整体禁用并置灰 */}
                  {/* 输入调节区：紧凑流式排布，彻底消除重叠。未开启 RT 时整体禁用并置灰 */}
                  <div className={`flex flex-col gap-2 py-0.5 transition-opacity ${!rtEnabled ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-[8px] border border-[var(--border-color)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[12px] font-semibold ${!rtEnabled ? 'text-[var(--text-disabled)]' : 'text-[var(--text-secondary)]'}`}>
                          按下灵敏度 (触发点)
                        </span>
                        <InlineNumberBadge
                          value={rtPress}
                          disabled={!rtEnabled}
                          onChange={(v) => {
                            if (!rtEnabled) return;
                            setParamPreviewMode('rt');
                            setRtPress(v);
                            addToast({ message: `按下灵敏度已设为 ${v} mm`, type: 'success' });
                          }}
                          min={minRtPress}
                          max={2.0}
                          precision={minRtPress < 0.01 ? 3 : (minRtPress < 0.1 ? 2 : 1)}
                          unit="mm"
                          badgeClass="text-emerald-600 bg-emerald-50 border-emerald-200"
                        />
                      </div>
                      <input 
                        type="range"
                        disabled={!rtEnabled}
                        min={minRtPress}
                        max="2.0"
                        step={activePressStep}
                        value={rtPress}
                        onChange={(e) => {
                          setParamPreviewMode('rt');
                          setRtPress(parseFloat(e.target.value));
                        }}
                        className={`w-full h-1.5 rounded-lg transition-all ${
                          !rtEnabled 
                            ? 'opacity-35 cursor-not-allowed bg-gray-200 dark:bg-zinc-700' 
                            : 'accent-emerald-500 cursor-pointer bg-[var(--primary-15)]'
                        }`}
                      />
                      <div className="flex justify-between text-[10px] font-mono text-[var(--text-disabled)] mt-0.5">
                        <span>{minRtPress.toFixed(minRtPress < 0.01 ? 3 : (minRtPress < 0.1 ? 2 : 1))}mm</span>
                        <span>2.000mm</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[var(--bg-tertiary)] rounded-[8px] border border-[var(--border-color)]">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[12px] font-semibold ${!rtEnabled ? 'text-[var(--text-disabled)]' : 'text-[var(--text-secondary)]'}`}>
                          抬起灵敏度 (急停重置)
                        </span>
                        <InlineNumberBadge
                          value={rtRelease}
                          disabled={!rtEnabled}
                          onChange={(v) => {
                            if (!rtEnabled) return;
                            setParamPreviewMode('rt');
                            setRtRelease(v);
                            addToast({ message: `抬起灵敏度已设为 ${v} mm`, type: 'success' });
                          }}
                          min={minRtRelease}
                          max={2.0}
                          precision={minRtRelease < 0.01 ? 3 : (minRtRelease < 0.1 ? 2 : 1)}
                          unit="mm"
                          badgeClass="text-[var(--info-color)] bg-[var(--primary-04)] border-[var(--primary-15)]"
                        />
                      </div>
                      <input 
                        type="range"
                        disabled={!rtEnabled}
                        min={minRtRelease}
                        max="2.0"
                        step={activeReleaseStep}
                        value={rtRelease}
                        onChange={(e) => {
                          setParamPreviewMode('rt');
                          setRtRelease(parseFloat(e.target.value));
                        }}
                        className={`w-full h-1.5 rounded-lg transition-all ${
                          !rtEnabled 
                            ? 'opacity-35 cursor-not-allowed bg-gray-200 dark:bg-zinc-700' 
                            : 'accent-[var(--info-color)] cursor-pointer bg-[var(--primary-15)]'
                        }`}
                      />
                      <div className="flex justify-between text-[10px] font-mono text-[var(--text-disabled)] mt-0.5">
                        <span>{minRtRelease.toFixed(minRtRelease < 0.01 ? 3 : (minRtRelease < 0.1 ? 2 : 1))}mm</span>
                        <span>2.000mm</span>
                      </div>
                    </div>

                    {/* 连续快速触发 —— AE64-MAX 专属（0.04 固件起支持） */}
                    {canContinuousRt && (
                      <div className={`px-2.5 py-1.5 bg-[var(--bg-tertiary)] rounded-[8px] border border-[var(--border-color)] flex items-center justify-between gap-2 transition-opacity ${!rtEnabled ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] truncate">连续快速触发</span>
                            <span
                              className="text-[9.5px] font-mono text-[var(--info-color)] bg-[var(--primary-04)] px-1 py-0.2 rounded border border-[var(--primary-15)] shrink-0 whitespace-nowrap"
                              title={`AE64-MAX 需升级到 ${CONTINUOUS_RT_MIN_FIRMWARE} 及以上固件；当前发行版 SDK 尚未开放该协议字段`}
                            >
                              固件 ≥ {CONTINUOUS_RT_MIN_FIRMWARE}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-[var(--text-disabled)] block truncate mt-0.5">
                            RT 行程中也支持连续快速触发
                          </span>
                        </div>
                        <label className={`relative inline-flex items-center shrink-0 ${!rtEnabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            disabled={!rtEnabled}
                            checked={continuousRt}
                            onChange={(e) => {
                              setParamPreviewMode('rt');
                              setContinuousRt(e.target.checked);
                            }}
                            aria-label="连续快速触发"
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部提示文本 (带细微顶边线，杜绝与上方卡片重合) */}
                <div className="mt-auto pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-2 text-xs font-medium shrink-0 select-none">
                  <span className={`text-xs font-bold flex items-center truncate ${
                    rtEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-disabled)]'
                  }`}>
                    {rtEnabled && <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />}
                    {rtEnabled 
                      ? (selectedKeys.size > 0 ? `快速触发 (RT) 已生效 (${selectedKeys.size}键)` : '快速触发 (RT) 就绪 (未选按键)') 
                      : '快速触发 (RT) 已关闭'}
                  </span>
                  {canContinuousRt ? (
                    <span
                      className={`shrink-0 font-semibold text-xs ${rtEnabled && continuousRt ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-disabled)]'}`}
                    >
                      {continuousRt ? '连续RT已开启' : '连续RT已关闭'}
                    </span>
                  ) : (
                    <span className={`font-mono text-xs ${rtEnabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-disabled)]'}`}>
                      {rtEnabled ? '动态重置已就绪' : '未开启'}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. 高级设置 (100% 对齐用户图二 media_1791893177332_3893908a.png：跳转死区设置专属页 + 狂暴模式2.0与RT精度单选) */}
              <div className="col flex flex-col justify-between">
                <div className="flex flex-col flex-1 min-h-0 space-y-1">
                  {/* 标题 */}
                  <div className="shrink-0 mb-0.5">
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)]">
                      高级设置
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">
                      自定义按键的死区与灵敏度精度
                    </p>
                  </div>

                  <div className="border-t border-[var(--border-color)] shrink-0" />

                  {/* 第一项：死区设置 (点击整行或右侧按钮直接跳转至死区专属设置页面) */}
                  <div 
                    onClick={() => setTriggerSubTab('deadzone')}
                    className="flex items-center justify-between py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer transition group shrink-0"
                    title="点击跳转至死区专属设置页面"
                  >
                    <span className="text-[13px] font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition">
                      死区设置
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTriggerSubTab('deadzone');
                      }}
                      className="flex items-center space-x-1.5 text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--primary-color)] px-2.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] group-hover:border-[var(--primary-color)]/30 transition shadow-2xs cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>设置</span>
                    </button>
                  </div>

                  <div className="border-t border-[var(--border-color)] shrink-0" />

                  {/* 第二项：狂暴模式2.0 与 RT 精度单选组 (完全对齐图二) */}
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-0.5 shrink-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-[13px] font-bold text-[var(--text-primary)]">狂暴模式2.0</span>
                        <div className="relative group/tip cursor-pointer">
                          <HelpCircle className="w-3.5 h-3.5 text-[var(--text-disabled)] hover:text-[var(--text-secondary)]" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:block z-50 w-52 p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl text-xs text-[var(--text-secondary)] leading-relaxed pointer-events-none">
                            开启后提供 0.001mm 极限微行程采样，发挥霍尔传感极致性能。
                          </div>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={furyMode} 
                          onChange={(e) => {
                            setFuryMode(e.target.checked);
                            addToast({
                              message: e.target.checked ? '狂暴模式2.0 已开启，已激活 0.001mm 极限采样！' : '狂暴模式2.0 已关闭，恢复标准精度。',
                              type: e.target.checked ? 'success' : 'info',
                            });
                          }} 
                          className="sr-only peer" 
                        />
                        <div className="w-8 h-4.5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                      </label>
                    </div>

                    <p className="text-[11px] leading-tight text-[var(--text-secondary)] mb-1 shrink-0">
                      开启后提供极限灵敏度调节。建议更换轴体后执行手动校准
                    </p>

                    {/* RT按下精度单选组 */}
                    <div className="mb-1 shrink-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">RT按下精度</span>
                        {!furyMode && (
                          <span className="text-[10px] text-amber-500 font-medium">开启狂暴模式解锁极限</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {[
                          { val: '0.1mm', isUltra: false },
                          { val: '0.01mm', isUltra: false },
                          { val: '0.005mm', isUltra: true },
                          { val: '0.001mm', isUltra: true },
                        ].map(({ val: prec, isUltra }) => {
                          const isSelected = rtPressPrecision === prec;
                          const isDisabled = isUltra && !furyMode;
                          return (
                            <label 
                              key={prec}
                              className={`flex items-center space-x-1 select-none transition ${
                                isDisabled 
                                  ? 'opacity-35 cursor-not-allowed' 
                                  : 'cursor-pointer hover:text-[var(--primary-color)]'
                              }`}
                              title={isDisabled ? '需打开狂暴模式解锁 0.005mm / 0.001mm 极限精度' : ''}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition ${
                                isSelected 
                                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' 
                                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--primary-color)]/50'
                              }`}>
                                {isSelected ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                ) : null}
                              </div>
                              <input
                                type="radio"
                                name="rtPressPrecision"
                                value={prec}
                                disabled={isDisabled}
                                checked={isSelected}
                                onChange={() => {
                                  if (isDisabled) return;
                                  setRtPressPrecision(prec);
                                  addToast({ message: `RT按下精度已设为 ${prec}`, type: 'success' });
                                }}
                                className="sr-only"
                              />
                              <span className={`text-[11px] font-mono truncate ${
                                isSelected 
                                  ? 'font-bold text-[var(--text-primary)]' 
                                  : isDisabled 
                                  ? 'text-[var(--text-disabled)]' 
                                  : 'text-[var(--text-secondary)]'
                              }`}>
                                {prec}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* RT释放精度单选组 */}
                    <div className="mb-0.5 shrink-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">RT释放精度</span>
                        {!furyMode && (
                          <span className="text-[10px] text-amber-500 font-medium">开启狂暴模式解锁极限</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {[
                          { val: '0.1mm', isUltra: false },
                          { val: '0.01mm', isUltra: false },
                          { val: '0.005mm', isUltra: true },
                          { val: '0.001mm', isUltra: true },
                        ].map(({ val: prec, isUltra }) => {
                          const isSelected = rtReleasePrecision === prec;
                          const isDisabled = isUltra && !furyMode;
                          return (
                            <label 
                              key={prec}
                              className={`flex items-center space-x-1 select-none transition ${
                                isDisabled 
                                  ? 'opacity-35 cursor-not-allowed' 
                                  : 'cursor-pointer hover:text-[var(--primary-color)]'
                              }`}
                              title={isDisabled ? '需打开狂暴模式解锁 0.005mm / 0.001mm 极限精度' : ''}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition ${
                                isSelected 
                                  ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' 
                                  : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--primary-color)]/50'
                              }`}>
                                {isSelected ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                ) : null}
                              </div>
                              <input
                                type="radio"
                                name="rtReleasePrecision"
                                value={prec}
                                disabled={isDisabled}
                                checked={isSelected}
                                onChange={() => {
                                  if (isDisabled) return;
                                  setRtReleasePrecision(prec);
                                  addToast({ message: `RT释放精度已设为 ${prec}`, type: 'success' });
                                }}
                                className="sr-only"
                              />
                              <span className={`text-[11px] font-mono truncate ${
                                isSelected 
                                  ? 'font-bold text-[var(--text-primary)]' 
                                  : isDisabled 
                                  ? 'text-[var(--text-disabled)]' 
                                  : 'text-[var(--text-secondary)]'
                              }`}>
                                {prec}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-color)]/70 shrink-0 my-0.5" />

                  {/* 第三项：防自显开关 (移动至高级设置内，与硬件固件消抖优化实时同步，严格对齐图一与图二) */}
                  <div className="flex items-center justify-between py-1 shrink-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[13px] font-bold text-[var(--text-primary)]">防自显开关</span>
                      {/* 提示 ? 按钮及官方说明气泡 */}
                      <div 
                        className="relative group/anti flex items-center"
                        onMouseEnter={() => setShowAntiGhostingTip(true)}
                        onMouseLeave={() => setShowAntiGhostingTip(false)}
                      >
                        <button
                          type="button"
                          data-anti-ghosting-info="true"
                          onClick={() => setShowAntiGhostingTip((prev) => !prev)}
                          className="w-4 h-4 rounded-full bg-[#0052ef] text-white text-[11px] flex items-center justify-center font-bold cursor-pointer select-none shadow-xs border-0 p-0"
                          title="点击或悬浮查看防自显说明"
                        >
                          ?
                        </button>
                        {/* 向上弹出的官方气泡提示 */}
                        <div 
                          data-anti-ghosting-tooltip="true" 
                          className={`absolute left-[-20px] bottom-full mb-2 z-50 w-64 p-2.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 leading-relaxed ${
                            showAntiGhostingTip ? 'block pointer-events-auto' : 'hidden group-hover/anti:block pointer-events-none'
                          }`}
                        >
                          关闭后极限精度下可能会出现按键自显的问题，请谨慎关闭，掉电后会重置为开启状态
                          <div className="absolute top-full left-6 border-4 border-transparent border-t-white dark:border-t-zinc-900"></div>
                        </div>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={antiGhosting !== false}
                        onChange={(e) => handleAntiGhostingChange(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-[38px] h-[20px] rounded-full transition-colors duration-200 relative flex items-center ${
                        antiGhosting !== false ? 'bg-[#0052ef]' : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}>
                        {/* 开启时的对勾标识 (严格对齐图一) */}
                        <span className={`absolute left-1.5 text-white text-[10px] font-black leading-none transition-opacity duration-200 ${
                          antiGhosting !== false ? 'opacity-100' : 'opacity-0'
                        }`}>
                          ✓
                        </span>
                        {/* 滑块圆钮 */}
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-[3px] ${
                          antiGhosting !== false ? 'left-[21px]' : 'left-[3px]'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>

                {/* 底部提示文本 (带细微顶边线，杜绝与上方卡片重合，对齐 Card 1 和 Card 2) */}
                <div className="mt-auto pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium shrink-0 select-none">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    {selectedKeys.size > 0 ? `高级参数与精度已生效 (${selectedKeys.size}键)` : '高级参数与精度已就绪'}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">
                    {furyMode ? '狂暴模式激活' : '标准采样'}
                  </span>
                </div>
              </div>

              </div>
            </div>
          )}

        </main>
      </div>
      )}
      </ErrorBoundary>

      {/* 底部极简状态条 (融合进背景，与窗口底色浑然一体) */}
      {currentView === 'device' && (
        <footer className="h-7 bg-[var(--bg-primary)] border-t border-[var(--border-color)]/50 px-4 flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium min-w-0 overflow-hidden select-none">
          <div className="flex items-center space-x-3 min-w-0 truncate">
            <span className="flex items-center truncate">
              <span className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></span>
              <span className="truncate font-semibold text-[var(--text-primary)]">{isConnected ? `${chipDeviceName} · USB 已连接` : '等待 USB 设备连接'}</span>
            </span>
            <span className="shrink-0 text-[var(--text-quaternary)]">|</span>
            <span className="truncate text-[var(--text-tertiary)]">{getLayoutDisplayName(ACTIVE_LAYOUT)} ({KEY_COUNT}K)</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0 ml-3">
            <span className="text-[var(--text-tertiary)]">
              回报率: <span className="font-mono font-bold text-[var(--text-primary)]">{pollingRate}Hz</span> ({(1000 / pollingRate).toFixed(3)}ms)
              {pollingRate === deviceProfile?.maxPollingRate && (
                <span className="ml-1 text-amber-600 dark:text-amber-400 font-bold">[最高]</span>
              )}
            </span>
            <span className="text-[var(--text-quaternary)]">•</span>
            <span className="text-[var(--info-color)] font-semibold">星闪悦动驱动</span>
          </div>
        </footer>
      )}

      {/* 轴体校准独立视窗 */}
      <CalibrationModal
        isOpen={showCalibrateModal}
        onClose={() => setShowCalibrateModal(false)}
        currentAxis={currentAxis}
        perKeySwitches={perKeySwitches}
        axisList={axisList}
        layout={ACTIVE_LAYOUT}
        theme={theme}
        hwKeyCoords={hwKeyCoords}
        findHwCoords={findHwCoords}
      />

      {/* 全局设置弹窗 (完全还原迈从 图一/图二/图三) */}
      <GlobalSettingsModal 
        isOpen={showGlobalSettings}
        onClose={() => setShowGlobalSettings(false)}
        initialSection={globalSettingsSection}
        onOpenDevLab={() => {
          setShowGlobalSettings(false);
          setShowDevLabModal(true);
        }}
      />

      {/* 硬件出厂参数与完整 SN 码模态详情框 (支持所有星闪键盘直读) */}
      <HardwareParamsModal
        isOpen={showHwInfoModal}
        onClose={() => setShowHwInfoModal(false)}
        deviceProfile={deviceProfile}
        hardwareInfo={hardwareInfo}
        hardwareFeatures={hardwareFeatures}
        device={device}
        pollingRate={pollingRate}
      />

      {/* 添加与识别星闪设备模态窗口 (支持系统HID弹窗授权 + 全生态设备库分类手动识别未兼容PCB) */}
      <AddDeviceModal
        isOpen={showAddDeviceModal}
        onClose={() => setShowAddDeviceModal(false)}
        discoveredDevices={discoveredDevicesList}
        activeDevice={device}
        deviceProfile={deviceProfile}
        isConnected={isConnected}
        onSelectManualProfile={handleSelectManualProfile}
        onDeviceConnected={refreshAuthorizedDevices}
      />

      {/* 开发者硬件实验室与动态适配后台 */}
      <DevLabModal
        isOpen={showDevLabModal}
        onClose={() => setShowDevLabModal(false)}
        isLiveHwLightingSync={isLiveHwLightingSync}
        onToggleLiveHwLightingSync={handleToggleLiveHwLightingSync}
      />

      {/* 高回报率 USB 3.0 驱动提示弹窗 (仅在进入支持 32k 的键盘详情页时呈现，主菜单绝不提示) */}
      <Usb3DriverPromptModal
        isOpen={showUsb3DriverModal && currentView === 'device'}
        onClose={() => setShowUsb3DriverModal(false)}
        onNeverRemind={handleNeverRemindUsb3Driver}
        onDownload={handleDownloadUsb3Driver}
      />

      {/* 鼠标悬浮性能全参数悬浮卡片 (对齐软件风格，彻底替代原生浏览器黑框白底悬浮窗；高级按键模式下禁用悬浮避免遮挡) */}
      {hoveredKeyTooltip && hoveredKeyTooltip.rect && activeTab !== 'advanced' && (
        (() => {
          const rect = hoveredKeyTooltip.rect;
          const tooltipWidth = 290;
          let tooltipX = rect.left + rect.width / 2;
          tooltipX = Math.max(tooltipWidth / 2 + 16, Math.min(window.innerWidth - tooltipWidth / 2 - 16, tooltipX));
          const placeAbove = rect.top > 310;
          const tooltipY = placeAbove ? rect.top - 10 : rect.bottom + 10;

          return (
            <div
              style={{
                position: 'fixed',
                left: `${tooltipX}px`,
                top: `${tooltipY}px`,
                transform: placeAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                zIndex: 99999,
                pointerEvents: 'none',
              }}
              className="w-[290px] bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md rounded-[8px] p-3.5 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl text-xs select-none transition-all duration-75 text-[var(--text-primary)] animate-in fade-in zoom-in-95"
            >
              {/* 顶部标题栏：按键名称 + 轴体微标 + 状态徽章 */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border-color)]/70">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center font-mono font-bold text-sm text-[var(--text-primary)] shadow-2xs">
                    {hoveredKeyTooltip.keyLabel}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-[13.5px] leading-tight text-[var(--text-primary)]">
                      按键 {hoveredKeyTooltip.keyLabel}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono leading-none mt-0.5 font-medium">
                      {hoveredKeyTooltip.keyId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hoveredKeyTooltip.higherKeyBadge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#0062FF] text-white shadow-2xs leading-none">
                      {hoveredKeyTooltip.higherKeyBadge}
                    </span>
                  )}
                  {activeTab === 'trigger' ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      hoveredKeyTooltip.effectiveRtOn
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20'
                    }`}>
                      {hoveredKeyTooltip.effectiveRtOn ? 'RT 开启' : 'RT 关闭'}
                    </span>
                  ) : activeTab === 'keybinds' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary-04)] text-[var(--info-color)] border border-[var(--primary-15)]">
                      {hoveredKeyTooltip.isKeyReplaced ? '已改键' : hoveredKeyTooltip.isKeySwapped ? '已换位' : hoveredKeyTooltip.isPassThrough ? '透传键' : '出厂默认'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary-04)] text-[var(--info-color)] border border-[var(--primary-15)]">
                      标准键位
                    </span>
                  )}
                </div>
              </div>

              {/* 性能全参数网格 (满足用户：触发、死区、轴体三个界面均显示按键全套性能参数) */}
              {activeTab === 'trigger' ? (
                <div className="flex flex-col gap-1.5">
                  {/* 1. 当前轴体 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">当前轴体</span>
                    <span className="font-bold text-[var(--text-primary)] truncate max-w-[170px]">
                      {hoveredKeyTooltip.assignedSwitch}
                    </span>
                  </div>

                  {/* 高级按键专属配置项 (如果按键配置了高级键在悬浮窗里也显示) */}
                  {hoveredKeyTooltip.higherKeyBadge && (
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#0062FF]/10 border border-[#0062FF]/25 my-0.5">
                      <span className="text-[#0062FF] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF]"></span>
                        高级按键
                      </span>
                      <span className="font-bold text-[#0062FF] flex items-center gap-1.5 font-mono">
                        <span className="px-1.5 py-[0.5px] rounded bg-[#0062FF] text-white text-[10px] font-black">
                          {hoveredKeyTooltip.higherKeyBadge}
                        </span>
                        <span className="text-xs">
                          {hoveredKeyTooltip.higherKeyBadge === 'DKS' ? '动态键程' :
                           hoveredKeyTooltip.higherKeyBadge === 'RS' ? '动态行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'SOCD' ? '对冲覆盖' :
                           hoveredKeyTooltip.higherKeyBadge === 'TGL' ? '单键开关' :
                           hoveredKeyTooltip.higherKeyBadge === 'END' ? '急停锁定' :
                           hoveredKeyTooltip.higherKeyBadge === 'MPT' ? '多重行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'MT' ? '双击长按' :
                           hoveredKeyTooltip.higherKeyItem?.name || '已生效'}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* 2. 触发行程 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">触发行程 (AP)</span>
                    <span className="font-mono font-bold text-[var(--info-color)]">
                      {hoveredKeyTooltip.effectiveAP.toFixed(2)} mm
                    </span>
                  </div>

                  {/* 3. 快速触发 (RT 类型与开启状态) */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">快速触发 (RT)</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {hoveredKeyTooltip.effectiveRtOn
                        ? (hoveredKeyTooltip.canContinuousRt && hoveredKeyTooltip.continuousRt ? '已开启 (连续RT)' : '已开启 (标准RT)')
                        : '未开启'}
                    </span>
                  </div>

                  {/* 4. RT 参数 (双精度按压/抬起灵敏度) */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">RT 按压灵敏度</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {hoveredKeyTooltip.effectiveRtPress.toFixed(3)} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">RT 抬起灵敏度</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {hoveredKeyTooltip.effectiveRtRelease.toFixed(3)} mm
                    </span>
                  </div>

                  {/* 5. 死区范围 (顶部/底部双精度) */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">死区设置 (顶/底)</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      顶 <span className="text-rose-500 font-bold">{hoveredKeyTooltip.effectiveTopDeadzone.toFixed(3)}</span> / 底 <span className="text-amber-500 font-bold">{hoveredKeyTooltip.effectiveBottomDeadzone.toFixed(3)}</span> mm
                    </span>
                  </div>

                  {/* 6. 按键消抖滤波 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">按键消抖</span>
                    <span className={`font-semibold ${hoveredKeyTooltip.shakeFilter ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-disabled)]'}`}>
                      {hoveredKeyTooltip.shakeFilter ? '极速硬件滤波 (已开启)' : '已关闭'}
                    </span>
                  </div>

                  {/* 7. 狂暴模式 */}
                  <div className="flex items-center justify-between text-xs pt-1 mt-0.5 border-t border-[var(--border-color)]/70">
                    <span className="text-[var(--text-secondary)] font-medium">狂暴响应</span>
                    <span className="font-bold text-rose-500 font-mono">
                      {hoveredKeyTooltip.furyMode ? '8000Hz 极速' : '标准回报'}
                    </span>
                  </div>
                </div>
              ) : activeTab === 'keybinds' ? (
                /* 改键配置层级视图下的悬浮窗 */
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">当前层级</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {{ win_default: 'Win Base', win_fn: 'Win Fn', mac_default: 'Mac Base', mac_fn: 'Mac Fn' }[hoveredKeyTooltip.activeKeybindLayer] || 'Win Base'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">映射按键</span>
                    <span className="font-mono font-bold text-[var(--info-color)]">
                      {hoveredKeyTooltip.displayLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">出厂原键</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {hoveredKeyTooltip.keyLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">当前轴体</span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                      {hoveredKeyTooltip.assignedSwitch}
                    </span>
                  </div>
                  {hoveredKeyTooltip.higherKeyBadge && (
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#0062FF]/10 border border-[#0062FF]/25 my-0.5">
                      <span className="text-[#0062FF] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF]"></span>
                        高级按键
                      </span>
                      <span className="font-bold text-[#0062FF] flex items-center gap-1.5 font-mono">
                        <span className="px-1.5 py-[0.5px] rounded bg-[#0062FF] text-white text-[10px] font-black">
                          {hoveredKeyTooltip.higherKeyBadge}
                        </span>
                        <span className="text-xs">
                          {hoveredKeyTooltip.higherKeyBadge === 'DKS' ? '动态键程' :
                           hoveredKeyTooltip.higherKeyBadge === 'RS' ? '动态行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'SOCD' ? '对冲覆盖' :
                           hoveredKeyTooltip.higherKeyBadge === 'TGL' ? '单键开关' :
                           hoveredKeyTooltip.higherKeyBadge === 'END' ? '急停锁定' :
                           hoveredKeyTooltip.higherKeyBadge === 'MPT' ? '多重行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'MT' ? '双击长按' :
                           hoveredKeyTooltip.higherKeyItem?.name || '已生效'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* 其它页面 (如高级按键、性能、快捷指令等)：显示简洁的标准键位信息与当前轴体 */
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">标准键位</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {hoveredKeyTooltip.keyLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">当前轴体</span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                      {hoveredKeyTooltip.assignedSwitch}
                    </span>
                  </div>
                  {hoveredKeyTooltip.higherKeyBadge && (
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#0062FF]/10 border border-[#0062FF]/25 my-0.5">
                      <span className="text-[#0062FF] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0062FF]"></span>
                        高级按键
                      </span>
                      <span className="font-bold text-[#0062FF] flex items-center gap-1.5 font-mono">
                        <span className="px-1.5 py-[0.5px] rounded bg-[#0062FF] text-white text-[10px] font-black">
                          {hoveredKeyTooltip.higherKeyBadge}
                        </span>
                        <span className="text-xs">
                          {hoveredKeyTooltip.higherKeyBadge === 'DKS' ? '动态键程' :
                           hoveredKeyTooltip.higherKeyBadge === 'RS' ? '动态行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'SOCD' ? '对冲覆盖' :
                           hoveredKeyTooltip.higherKeyBadge === 'TGL' ? '单键开关' :
                           hoveredKeyTooltip.higherKeyBadge === 'END' ? '急停锁定' :
                           hoveredKeyTooltip.higherKeyBadge === 'MPT' ? '多重行程' :
                           hoveredKeyTooltip.higherKeyBadge === 'MT' ? '双击长按' :
                           hoveredKeyTooltip.higherKeyItem?.name || '已生效'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* 方案管理集合按钮悬浮窗 (Hover Popover 快捷切换板载与本地配置) */}
      {showProfileHoverMenu && (
        <div 
          className="fixed w-80 bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-2xl shadow-2xl border border-[var(--border-color)] p-3.5 z-[9999] animate-fadeIn select-none pointer-events-auto"
          style={{ 
            top: hoverPopoverPos.top, 
            left: hoverPopoverPos.left,
            filter: 'drop-shadow(0 14px 32px rgba(0,0,0,0.18))'
          }}
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          {/* 顶栏标题 */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--info-color)]" />
              <span className="text-xs font-bold text-[var(--text-primary)]">快捷切换板载配置</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold border border-emerald-500/20">
              硬件即时生效
            </span>
          </div>

          {/* 4 档板载硬件槽位列表 */}
          <div className="space-y-1.5">
            {[
              { key: 'Config1', defaultName: '配置一' },
              { key: 'Config2', defaultName: '配置二' },
              { key: 'Config3', defaultName: '配置三' },
              { key: 'Config4', defaultName: '配置四' },
            ].map((p, idx) => {
              const active = activeBoardSlot === p.key;
              const alias = boardSlotAliases[p.key] || p.defaultName;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitchBoardSlot(p.key);
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    active
                      ? 'border-[var(--info-color)] bg-[var(--primary-04)] text-[var(--info-color)] font-bold shadow-2xs ring-1 ring-[var(--info-color)]/30'
                      : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--primary-25)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-5 h-5 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                      active ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-xs truncate font-medium">{alias}</span>
                  </div>
                  {active ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-[11px] text-[var(--text-disabled)] font-mono hover:text-[var(--info-color)]">切换</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 底栏进入配置管理中心 */}
          <div className="mt-2.5 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => {
                setShowProfileHoverMenu(false);
                handleTabChange('profiles');
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-[var(--primary-color)] hover:opacity-90 text-[var(--text-inverse-100)] text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <span>进入配置方案管理中心</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

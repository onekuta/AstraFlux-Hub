import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  Usb, 
  Sparkles, 
  Keyboard, 
  Mouse, 
  Gamepad2, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Layers,
  Zap,
  Radio
} from 'lucide-react';
import { 
  ECOSYSTEM_CATEGORIES, 
  SPARKLINK_ECOSYSTEM_PRODUCTS,
  findMatchedEcosystemProduct,
} from '../constants/sparklinkEcosystem';
import { keyboardService } from '../services/keyboardService';
import { useToast } from './ToastProvider';
import { DEVICE_PROFILES } from '../constants/deviceProfiles';
import HidDevicePickerModal from './HidDevicePickerModal';

export default function AddDeviceModal({
  isOpen = false,
  onClose,
  discoveredDevices = [],
  activeDevice = null,
  deviceProfile = null,
  isConnected = false,
  onSelectManualProfile,
  onDeviceConnected,
}) {
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHidDevice, setSelectedHidDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [liveHidList, setLiveHidList] = useState([]);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [displayCount, setDisplayCount] = useState(60);

  // 刷新当前电脑系统层面的 HID 设备列表 (allowAll=true 包含未录入的自制/第三方 PCB)
  const refreshLiveHidDevices = async () => {
    setIsScanning(true);
    try {
      const list = await keyboardService.listAuthorizedDevices(true);
      const combined = [...(list || [])];

      // 若当前驱动已连接物理键盘，但列表尚未包含，自动补充避免显示 0 台
      if (isConnected && activeDevice) {
        const vid = activeDevice.vendorId || deviceProfile?.vendorId || 0x1ca6;
        const pid = activeDevice.productId || deviceProfile?.productId || 0x7a02;
        const exists = combined.some(d => d.vendorId === vid && d.productId === pid);
        if (!exists) {
          combined.unshift({
            id: `${vid}:${pid}`,
            vendorId: vid,
            productId: pid,
            displayName: activeDevice.productName || deviceProfile?.name || '星闪悦动磁轴键盘',
            productName: activeDevice.productName || deviceProfile?.name || '星闪悦动磁轴键盘',
            isOfficial: true,
            isCurrentActive: true,
            hidDevice: activeDevice,
          });
        }
      }

      setLiveHidList(combined);
      if (combined.length > 0 && !selectedHidDevice) {
        setSelectedHidDevice(combined[0]);
      }
    } catch (e) {
      console.warn('获取已授权设备失败:', e);
    } finally {
      setTimeout(() => setIsScanning(false), 400);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshLiveHidDevices();
    }
  }, [isOpen, isConnected, activeDevice]);

  // 点击「拉起系统 HID 授权选择设备」：打开专属的设备选择窗口，并在后台执行原生 HID 探测
  const handleOpenPicker = async () => {
    setShowPickerModal(true);
    try {
      // 在后台静默触发一次原生 HID 探测以激活底层枚举
      keyboardService.requestPermission(true).then((ok) => {
        if (ok) {
          refreshLiveHidDevices();
        }
      }).catch(() => {});
    } catch (e) {}
  };

  // 用户在设备选择窗口中确认了某个硬件
  const handlePickerConfirmDevice = async (chosenDevice) => {
    // 放入 liveHidList
    setLiveHidList((prev) => {
      const exists = prev.some(
        (d) => d.vendorId === chosenDevice.vendorId && d.productId === chosenDevice.productId
      );
      if (!exists) {
        return [chosenDevice, ...prev];
      }
      return prev;
    });

    setSelectedHidDevice(chosenDevice);

    // 检查此硬件是否属于已经建库的官方/生态方案：如果是，直接自动对应默认方案连接并添加至主页！
    const matched = findMatchedEcosystemProduct(
      chosenDevice.vendorId,
      chosenDevice.productId,
      chosenDevice.productName || chosenDevice.name || chosenDevice.displayName
    );
    if (matched) {
      handleApplyDefaultScheme(chosenDevice, matched);
      return;
    }

    addToast({
      message: `设备授权成功！已选定硬件：【${chosenDevice.name || chosenDevice.displayName || 'USB HID 键盘'}】`,
      type: 'success',
    });

    // 尝试握手连接
    try {
      if (chosenDevice.hidDevice) {
        await keyboardService.autoConnect(chosenDevice.hidDevice);
      }
      if (onDeviceConnected) {
        onDeviceConnected();
      }
    } catch (e) {
      console.warn('连接选中设备失败:', e);
    }
  };

  // 核心：已建库方案直接应用默认档案连接并添加至主页，无需手动去右侧翻找绑定！
  const handleApplyDefaultScheme = (dev, matchedProd) => {
    const prod = matchedProd || findMatchedEcosystemProduct(
      dev.vendorId,
      dev.productId,
      dev.productName || dev.displayName
    );

    if (prod) {
      const baseProfile = DEVICE_PROFILES[prod.profileId] || DEVICE_PROFILES.ES68;
      const finalProfile = {
        ...baseProfile,
        id: prod.id,
        model: prod.model,
        name: prod.name,
        shortName: prod.name,
        layout: prod.layout || baseProfile.layout,
        layoutName: prod.layoutName || baseProfile.layoutName,
        maxPollingRate: prod.maxPollingRate || baseProfile.maxPollingRate,
        vendorId: dev.vendorId || prod.numericVid || baseProfile.vendorId,
        productId: dev.productId || prod.numericPid || baseProfile.productId,
        boundHidDevice: dev.hidDevice || dev,
      };

      if (onSelectManualProfile) {
        onSelectManualProfile(finalProfile, dev.hidDevice || dev);
      }
      if (onDeviceConnected) {
        onDeviceConnected();
      }
      addToast({
        message: `已自动匹配默认方案：【${prod.name}】，立即连接并添加至主页！`,
        type: 'success',
      });
      onClose();
    } else {
      const baseProfile = dev.profile || DEVICE_PROFILES.ES68;
      const finalProfile = {
        ...baseProfile,
        name: dev.productName || dev.displayName || baseProfile.name,
        shortName: dev.displayName || baseProfile.shortName,
        vendorId: dev.vendorId || baseProfile.vendorId,
        productId: dev.productId || baseProfile.productId,
        boundHidDevice: dev.hidDevice || dev,
      };

      if (onSelectManualProfile) {
        onSelectManualProfile(finalProfile, dev.hidDevice || dev);
      }
      if (onDeviceConnected) {
        onDeviceConnected();
      }
      addToast({
        message: `已自动对应默认方案：【${finalProfile.name}】，立即连接并添加至主页！`,
        type: 'success',
      });
      onClose();
    }
  };

  // 手动挑选生态库产品并应用为当前设备档案 (支持无物理连接时的预选载入，或对未兼容 PCB 一键强制绑定)
  const handleApplyProfile = (product) => {
    const baseProfile = DEVICE_PROFILES[product.profileId] || DEVICE_PROFILES.ES68;
    const isPreselect = !selectedHidDevice;
    const manualProfile = {
      ...baseProfile,
      id: product.id,
      model: product.model,
      name: product.name,
      shortName: product.name,
      layout: product.layout || baseProfile.layout,
      layoutName: product.layoutName || baseProfile.layoutName,
      maxPollingRate: product.maxPollingRate || baseProfile.maxPollingRate,
      vendorId: selectedHidDevice?.vendorId || product.numericVid || baseProfile.vendorId,
      productId: selectedHidDevice?.productId || product.numericPid || baseProfile.productId,
      isManualOverridden: !isPreselect,
      isPreselected: isPreselect,
      boundHidDevice: selectedHidDevice?.hidDevice || selectedHidDevice || null,
    };

    if (onSelectManualProfile) {
      onSelectManualProfile(manualProfile, selectedHidDevice?.hidDevice || selectedHidDevice || null);
    }

    addToast({
      message: isPreselect
        ? `已成功预选方案：【${product.name}】，立即载入驱动主页！`
        : `已成功手动识别绑定：【${product.name}】，立即载入驱动！`,
      type: 'success',
    });
    onClose();
  };

  // 过滤生态库产品
  const filteredProducts = useMemo(() => {
    return SPARKLINK_ECOSYSTEM_PRODUCTS.filter((prod) => {
      const matchCategory = activeCategory === 'all' || prod.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.model.toLowerCase().includes(q) ||
        prod.vid.toLowerCase().includes(q) ||
        prod.pid.toLowerCase().includes(q) ||
        prod.layoutName.toLowerCase().includes(q) ||
        (prod.description && prod.description.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    setDisplayCount(60);
  }, [activeCategory, searchQuery]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  // 计算各分类计数
  const categoryCounts = useMemo(() => {
    const map = { all: SPARKLINK_ECOSYSTEM_PRODUCTS.length };
    ECOSYSTEM_CATEGORIES.forEach((c) => {
      if (c.id !== 'all') {
        map[c.id] = SPARKLINK_ECOSYSTEM_PRODUCTS.filter((p) => p.category === c.id).length;
      }
    });
    return map;
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md select-none p-4 animate-in fade-in duration-150">
        <div className="bg-[var(--bg-secondary)] w-full max-w-6xl h-[88vh] rounded-[10px] border border-[var(--border-color)]/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* ── 顶部栏 ── */}
          <div className="h-16 px-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-[8px] bg-[var(--info-color)]/10 text-[var(--info-color)] flex items-center justify-center font-bold border border-[var(--info-color)]/20 shadow-xs">
                <Usb className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-extrabold font-title modal-title text-[var(--text-primary)]">添加与识别星闪设备</h2>
                  <span className="text-[11px] font-mono font-bold text-[var(--info-color)] bg-[var(--primary-04)] px-2.5 py-0.5 rounded-[6px] border border-[var(--primary-15)]">
                    NearLink SDK V2 全生态支持
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  即时扫描 USB HID 设备 · 官方星闪全生态设备库 · 支持未做过兼容的自定义 / 第三方 PCB 手动选择识别
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[var(--border-color)] hover:bg-[var(--primary-09)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
              title="关闭弹窗"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── 主体双栏区域 ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ◄ 左栏：即时扫描与系统已检测设备 (Live HID Devices) ► */}
            <div className="w-[360px] border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-tertiary)]/35 p-4 shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Usb className="w-4 h-4 text-[var(--info-color)]" />
                  <span>系统已检测设备</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-[6px] bg-[var(--primary-09)] text-[var(--info-color)] font-mono font-bold">
                    {liveHidList.length}
                  </span>
                </span>
                <button
                  onClick={refreshLiveHidDevices}
                  disabled={isScanning}
                  className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--info-color)] flex items-center space-x-1 cursor-pointer transition"
                  title="重新扫描已接入的 USB 设备"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>刷新列表</span>
                </button>
              </div>

              {/* 拉起系统原生授权窗口大按钮 (点击打开选择设备独立窗口) */}
              <button
                onClick={handleOpenPicker}
                className="w-full py-2.5 px-3 mb-3 rounded-[8px] bg-[var(--info-color)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition"
                title="点击弹出 USB HID 设备选择窗口，勾选你的硬件授权"
              >
                <Plus className="w-4 h-4" />
                <span>拉起系统 HID 授权选择设备</span>
              </button>

              {/* 已接入设备列表 */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {liveHidList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-[8px] flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                    <Usb className="w-8 h-8 opacity-40 mb-2.5" />
                    <div className="text-xs font-bold text-[var(--text-secondary)]">暂未检测到已授权设备</div>
                    <div className="text-[11px] text-[var(--text-disabled)] mt-1.5 leading-relaxed">
                      请插入键盘 USB 线缆，并点击上方「拉起系统 HID 授权选择设备」按钮。
                      <br />
                      （自制 / 未兼容 PCB 亦可在此授权接入）
                    </div>
                  </div>
                ) : (
                  liveHidList.map((dev, idx) => {
                    const isSelected = selectedHidDevice === dev || (
                      selectedHidDevice &&
                      selectedHidDevice.vendorId === dev.vendorId &&
                      selectedHidDevice.productId === dev.productId
                    );
                    const hexVid = '0x' + (dev.vendorId || 0).toString(16).toUpperCase();
                    const hexPid = '0x' + (dev.productId || 0).toString(16).toUpperCase();
                    const name = dev.productName || dev.displayName || dev.name || `USB HID 外设 #${idx + 1}`;
                    const matchedProduct = findMatchedEcosystemProduct(dev.vendorId, dev.productId, dev.productName || dev.displayName);
                    const isAlreadyCataloged = !!matchedProduct || dev.isOfficial || dev.vendorId === 0x1ca6 || dev.vendorId === 7334;
                    const schemeTitle = matchedProduct?.name || dev.displayName || dev.productName || '官方默认方案';

                    return (
                      <div
                        key={dev.id || idx}
                        onClick={() => setSelectedHidDevice(dev)}
                        className={`p-3 rounded-[8px] border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                          isSelected
                            ? 'border-[var(--info-color)] bg-[var(--bg-secondary)] shadow-sm ring-1 ring-[var(--info-color)]/30'
                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]" title={name}>
                            {name}
                          </span>
                          {dev.isCurrentActive ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20 shrink-0">
                              当前连接
                            </span>
                          ) : isAlreadyCataloged ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-bold border border-blue-500/20 shrink-0">
                              官方方案
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-500/10 text-slate-500 font-bold border border-slate-500/20 shrink-0">
                              第三方键盘
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                          <span>VID: {hexVid}</span>
                          <span>PID: {hexPid}</span>
                        </div>

                        {/* 如果是已经建库的方案：绝对不要用户再去右侧手动选择绑定，提供直接一键连接添加至主页按钮！ */}
                        {isAlreadyCataloged ? (
                          <div className="pt-2 flex flex-col gap-1.5 border-t border-[var(--border-color)]/60">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                已匹配官方方案
                              </span>
                              <span className="text-[10px] text-[var(--text-tertiary)] truncate max-w-[130px]" title={schemeTitle}>
                                {schemeTitle}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyDefaultScheme(dev, matchedProduct);
                              }}
                              className="w-full py-1.5 px-3 rounded-xl bg-[var(--info-color)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs cursor-pointer transition"
                              title="已建库方案无需在右侧手动挑选，直接连接并添加至主页"
                            >
                              <span>直接连接并添加至主页 ➔</span>
                            </button>
                          </div>
                        ) : isSelected ? (
                          <div className="pt-1.5 text-[10.5px] text-[var(--info-color)] font-semibold flex items-center justify-between border-t border-[var(--border-color)]/60">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              已选中此第三方硬件
                            </span>
                            <span className="text-[10px]">在右侧挑选方案一键绑定 ➔</span>
                          </div>
                        ) : (
                          <div className="pt-1 text-[10px] text-[var(--text-disabled)] text-right">
                            点击选中后在右侧挑选方案
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* 底部重要说明 */}
              <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] text-[10.5px] text-[var(--text-tertiary)] flex items-start space-x-1.5 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  💡 <b>说明</b>：已建库键盘点击卡片上的「直接连接并添加至主页」即可自动载入默认方案；仅第三方未入库键盘才需在右侧挑选方案手动识别绑定。
                </span>
              </div>
            </div>

            {/* ► 右栏：官方星闪方案设备生态库 (分类选择手动识别 / 离线方案预选) ◄ */}
            <div className="flex-1 flex flex-col p-5 bg-[var(--bg-secondary)] overflow-hidden">
              
              {/* 提示条：如果左侧已选中设备，提示用户匹配；如果未选中设备，提示方案预选模式 */}
              {selectedHidDevice ? (() => {
                const selMatched = findMatchedEcosystemProduct(
                  selectedHidDevice.vendorId,
                  selectedHidDevice.productId,
                  selectedHidDevice.productName || selectedHidDevice.displayName || selectedHidDevice.name
                );
                const selIsCataloged = !!selMatched || selectedHidDevice.isOfficial || selectedHidDevice.vendorId === 0x1ca6 || selectedHidDevice.vendorId === 7334;

                return (
                  <div className={`mb-3.5 px-3.5 py-2 rounded-[8px] border flex items-center justify-between shrink-0 ${
                    selIsCataloged
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[var(--info-color)]/8 border-[var(--info-color)]/25'
                  }`}>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`w-2 h-2 rounded-[6px] ${selIsCataloged ? 'bg-emerald-500' : 'bg-[var(--info-color)]'} animate-pulse`} />
                      <span className="text-[var(--text-secondary)]">
                        当前选定硬件：
                        <strong className="text-[var(--text-primary)] font-bold ml-1">
                          {selectedHidDevice.productName || selectedHidDevice.displayName || selectedHidDevice.name}
                        </strong>
                        <span className="font-mono text-[11px] text-[var(--text-tertiary)] ml-1.5">
                          (0x{(selectedHidDevice.vendorId || 0).toString(16).toUpperCase()}:0x{(selectedHidDevice.productId || 0).toString(16).toUpperCase()})
                        </span>
                      </span>
                    </div>
                    {selIsCataloged ? (
                      <button
                        type="button"
                        onClick={() => handleApplyDefaultScheme(selectedHidDevice, selMatched)}
                        className="px-3 py-1 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition"
                      >
                        <span>已自动匹配【{selMatched?.name || '官方方案'}】，点击直接添加至主页 ➔</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[var(--info-color)] flex items-center gap-1">
                        未入库第三方键盘：请在下方挑选方案一键绑定
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })() : (
                <div className="mb-3.5 px-3.5 py-2.5 rounded-[8px] border border-[var(--info-color)]/30 bg-[var(--info-color)]/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--info-color)] shrink-0 animate-ping" />
                    <span className="text-[var(--text-primary)] font-medium">
                      <strong>方案预选窗口</strong>：未建立物理连接时，可直接在下方预选任意星闪键盘方案，提前载入驱动主页预览键位配列、配置灯效与性能参数。
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[var(--info-color)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-[6px] border border-[var(--info-color)]/20 shrink-0">
                    离线预选模式
                  </span>
                </div>
              )}

              {/* 搜索与分类胶囊 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3.5 shrink-0">
                {/* 分类胶囊 */}
                <div className="flex items-center space-x-1 bg-[var(--bg-tertiary)] p-1 rounded-[8px] border border-[var(--border-color)] overflow-x-auto max-w-full">
                  {ECOSYSTEM_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                          activeCategory === cat.id
                            ? 'bg-[var(--info-color)] text-white shadow-xs'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--primary-09)]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1 py-0.1 rounded-[4px] font-mono ${
                          activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[var(--primary-09)] text-[var(--text-disabled)]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 搜索框 */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" />
                  <input
                    type="text"
                    placeholder="搜索型号、品牌或 VID:PID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[8px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none focus:border-[var(--info-color)] transition"
                  />
                </div>
              </div>

              {/* 产品生态网格列表 */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pr-1">
                {visibleProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 hover:bg-[var(--bg-tertiary)]/90 hover:border-[var(--info-color)] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* 头部型号与品牌 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] font-bold text-[var(--info-color)] tracking-wider block truncate">
                            {prod.brand}
                          </span>
                          <h4 className="text-xs font-black text-[var(--text-primary)] mt-0.5 truncate" title={prod.name}>
                            {prod.name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold shrink-0">
                          {prod.layoutName}
                        </span>
                      </div>

                      {/* 简述与芯片规格 */}
                      <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 leading-snug mb-2.5">
                        {prod.description}
                      </p>

                      {/* 特性标签 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {prod.features.slice(0, 3).map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[9.5px] px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-secondary)] text-[var(--text-disabled)] font-medium border border-[var(--border-color)]/70"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 底部 VID:PID 与识别/预选按钮 */}
                    <div className="pt-2 border-t border-[var(--border-color)]/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                        {prod.vid}:{prod.pid}
                      </span>
                      <button
                        onClick={() => handleApplyProfile(prod)}
                        className={`px-3 py-1 rounded-[8px] text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs ${
                          selectedHidDevice
                            ? 'bg-[var(--info-color)] text-white hover:opacity-90'
                            : 'bg-[var(--bg-secondary)] hover:bg-[var(--info-color)] hover:text-white text-[var(--text-primary)] border border-[var(--border-color)]'
                        }`}
                        title={
                          selectedHidDevice
                            ? `将硬件【${selectedHidDevice.displayName || selectedHidDevice.name}】绑定为【${prod.name}】并载入驱动`
                            : `未建立物理连接时，预选【${prod.name}】方案并载入驱动主页预览体验`
                        }
                      >
                        <span>{selectedHidDevice ? '绑定并进入驱动' : '预选此方案 ➔'}</span>
                        {selectedHidDevice && <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredProducts.length > displayCount && (
                  <div className="col-span-full py-2.5 flex justify-center">
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 60)}
                      className="px-6 py-2 text-xs font-bold rounded-[8px] bg-[var(--bg-tertiary)] hover:bg-[var(--info-color)] hover:text-white text-[var(--text-secondary)] border border-[var(--border-color)] transition-all cursor-pointer shadow-xs"
                    >
                      加载更多认证外设 (剩余 {filteredProducts.length - displayCount} 款)...
                    </button>
                  </div>
                )}
              </div>

              {/* 底部状态条 */}
              <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-tertiary)] shrink-0">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>官方全量 564 款星闪外设描述符已集成 · 兼容任意未录入第三方客制化 PCB</span>
                </span>
                <span className="font-mono text-[11px]">
                  当前显示 {filteredProducts.length} 款星闪外设型号
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 独立的「选择 USB HID 设备」系统授权浮层对话框 */}
      <HidDevicePickerModal
        isOpen={showPickerModal}
        onClose={() => setShowPickerModal(false)}
        onConfirmDevice={handlePickerConfirmDevice}
        activeDevice={activeDevice}
        deviceProfile={deviceProfile}
      />
    </>
  );
}

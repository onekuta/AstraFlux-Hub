import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Usb, 
  Search, 
  RefreshCw, 
  Check, 
  Cpu, 
  Keyboard, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Sliders, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SPARKLINK_VIDS, SPARKLINK_PRIMARY_VIDS, isOfficialSparklinkDevice } from '../constants/deviceProfiles';
import { keyboardService } from '../services/keyboardService';

/**
 * 独立的「选择 USB HID 设备」授权弹窗 (Device Picker Modal)
 * 解决 Electron/WebHID 环境下静默授权缺少用户交互界面问题，
 * 1:1 提供对齐 Chrome 原生标准的硬件设备选择窗口与状态指示。
 */
export default function HidDevicePickerModal({
  isOpen = false,
  onClose,
  onConfirmDevice,
  activeDevice = null,
  deviceProfile = null,
}) {
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // 扫描与汇聚系统中当前所有真实可用的 HID 设备
  const scanAllHidDevices = async () => {
    setIsRefreshing(true);
    try {
      const resultDevices = [];
      const seenKeys = new Set();

      const isKeyboardCandidate = (dev) => {
        if (!dev) return false;
        const rawName = (dev.productName || '').toLowerCase();
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
        const isOfficial = isOfficialSparklinkDevice(dev.vendorId, dev.productId) || SPARKLINK_PRIMARY_VIDS.includes(dev.vendorId);
        if (isOfficial) return true;
        const collections = dev.collections || [];
        if (collections.length > 0) {
          const hasKeyboardUsage = collections.some(
            (c) =>
              (c.usagePage === 1 && c.usage === 6) ||
              c.usagePage === 0xffb0 ||
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
      };

      // 1. 从 WebHID 原生接口拉取已授权的硬件集合
      if (typeof navigator !== 'undefined' && navigator.hid) {
        try {
          const rawWebHid = await navigator.hid.getDevices();
          if (Array.isArray(rawWebHid)) {
            rawWebHid.forEach((dev) => {
              if (!isKeyboardCandidate(dev)) return;
              const vid = dev.vendorId;
              const pid = dev.productId;
              const key = `${vid}:${pid}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                const rawName = (dev.productName || '').replace(/\0/g, '').trim();
                const isOfficial = isOfficialSparklinkDevice(vid, pid) || SPARKLINK_PRIMARY_VIDS.includes(vid);
                const hexVid = '0x' + (vid || 0).toString(16).toUpperCase();
                const hexPid = '0x' + (pid || 0).toString(16).toUpperCase();
                resultDevices.push({
                  id: key,
                  hidDevice: dev,
                  vendorId: vid,
                  productId: pid,
                  name: rawName || (isOfficial ? '星闪无线复合键盘' : `未录入键盘 (${hexVid}:${hexPid})`),
                  productName: rawName,
                  serialNumber: dev.serialNumber || '',
                  interfaceCount: dev.collections?.length || 1,
                  hasVendorCollection: dev.collections?.some((c) => c.usagePage === 0xffb0 || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff)),
                  isOfficial,
                  source: 'webhid',
                });
              }
            });
          }
        } catch (e) {
          console.warn('读取 navigator.hid.getDevices 失败:', e);
        }
      }

      // 2. 从主进程获取最近一次 session 捕获到的底层 HID 设备列表
      if (window.electronAPI && typeof window.electronAPI.getScannedHidDevices === 'function') {
        try {
          const ipcList = await window.electronAPI.getScannedHidDevices();
          if (Array.isArray(ipcList)) {
            ipcList.forEach((dev) => {
              if (!isKeyboardCandidate(dev)) return;
              const vid = dev.vendorId;
              const pid = dev.productId;
              const key = `${vid}:${pid}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                const rawName = (dev.productName || '').replace(/\0/g, '').trim();
                const isOfficial = isOfficialSparklinkDevice(vid, pid) || SPARKLINK_PRIMARY_VIDS.includes(vid);
                const hexVid = '0x' + (vid || 0).toString(16).toUpperCase();
                const hexPid = '0x' + (pid || 0).toString(16).toUpperCase();
                resultDevices.push({
                  id: key,
                  hidDevice: dev,
                  vendorId: vid,
                  productId: pid,
                  name: rawName || (isOfficial ? '星闪无线复合键盘' : `未录入键盘 (${hexVid}:${hexPid})`),
                  productName: rawName,
                  serialNumber: dev.serialNumber || '',
                  interfaceCount: dev.collections?.length || 1,
                  hasVendorCollection: dev.collections?.some((c) => c.usagePage === 0xffb0 || (c.usagePage >= 0xff00 && c.usagePage <= 0xffff)),
                  isOfficial,
                  source: 'system',
                });
              }
            });
          }
        } catch (e) {
          console.warn('读取 electronAPI.getScannedHidDevices 失败:', e);
        }
      }

      // 3. 将当前已连接的键盘兜底纳入
      if (activeDevice) {
        const vid = activeDevice.vendorId || (deviceProfile ? deviceProfile.vendorId : 0x1ca6);
        const pid = activeDevice.productId || (deviceProfile ? deviceProfile.productId : 0x7a02);
        const key = `${vid}:${pid}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          resultDevices.unshift({
            id: key,
            hidDevice: activeDevice,
            vendorId: vid,
            productId: pid,
            name: activeDevice.productName || deviceProfile?.name || '星闪悦动磁轴键盘',
            productName: activeDevice.productName,
            serialNumber: activeDevice.serialNumber || '',
            interfaceCount: 3,
            hasVendorCollection: true,
            isOfficial: true,
            isCurrentActive: true,
            source: 'active',
          });
        }
      }

      setDeviceList(resultDevices);

      // 默认选中第一台，或优先选中星闪官方/当前活跃设备
      if (!selectedDevice && resultDevices.length > 0) {
        const preferred = resultDevices.find((d) => d.isCurrentActive) ||
          resultDevices.find((d) => d.isOfficial) ||
          resultDevices[0];
        setSelectedDevice(preferred);
      }
    } catch (err) {
      console.error('扫描 HID 设备列表出错:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scanAllHidDevices();
    }
  }, [isOpen]);

  // 监听来自 Electron 主进程的实时 HID 设备探测事件
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.onHidDevicesScanned === 'function') {
      const cleanup = window.electronAPI.onHidDevicesScanned(() => {
        if (isOpen) scanAllHidDevices();
      });
      return cleanup;
    }
  }, [isOpen]);

  // 过滤展示列表
  const filteredList = useMemo(() => {
    if (!searchFilter.trim()) return deviceList;
    const q = searchFilter.toLowerCase().trim();
    return deviceList.filter((dev) => {
      const name = (dev.name || '').toLowerCase();
      const hexVid = '0x' + (dev.vendorId || 0).toString(16).toLowerCase();
      const hexPid = '0x' + (dev.productId || 0).toString(16).toLowerCase();
      return name.includes(q) || hexVid.includes(q) || hexPid.includes(q);
    });
  }, [deviceList, searchFilter]);

  // 确认连接并授权
  const handleConfirm = () => {
    if (!selectedDevice) return;
    if (onConfirmDevice) {
      onConfirmDevice(selectedDevice);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-secondary)] w-full max-w-xl rounded-[10px] border border-[var(--border-color)]/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* 顶部标题栏 */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)]/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--info-color)]/10 text-[var(--info-color)] flex items-center justify-center border border-[var(--info-color)]/25 shadow-xs">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  选择 USB HID 设备
                </h3>
                <span className="text-[10px] font-mono font-bold text-[var(--info-color)] bg-[var(--info-color)]/10 px-2 py-0.5 rounded-[6px] border border-[var(--info-color)]/20">
                  系统硬件探测
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                星闪悦动驱动想要连接到你的 HID 设备，请勾选硬件并授权
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--border-color)] hover:bg-[var(--primary-09)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center justify-center transition cursor-pointer"
            title="关闭选择窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 搜索与工具栏 */}
        <div className="px-6 py-3 border-b border-[var(--border-color)]/70 bg-[var(--bg-primary)]/40 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" />
            <input
              type="text"
              placeholder="快速过滤设备名称、VID 或 PID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-disabled)] outline-none focus:border-[var(--info-color)] transition"
            />
          </div>

          <button
            onClick={scanAllHidDevices}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--text-secondary)] hover:text-[var(--info-color)] transition cursor-pointer disabled:opacity-60 shrink-0"
            title="重新扫描系统 USB HID 设备"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '扫描中...' : '刷新硬件'}</span>
          </button>
        </div>

        {/* 设备列表展示区 */}
        <div className="p-6 max-h-[360px] min-h-[220px] overflow-y-auto space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[8px] flex flex-col items-center justify-center text-[var(--text-tertiary)]">
              <Usb className="w-10 h-10 opacity-30 mb-2" />
              <div className="text-xs font-bold text-[var(--text-secondary)]">未找到匹配的 USB HID 硬件</div>
              <div className="text-[11px] text-[var(--text-disabled)] mt-1">
                请确认键盘 USB 线缆或星闪适配器已紧固插入电脑，并点击右上角「刷新硬件」
              </div>
            </div>
          ) : (
            filteredList.map((dev) => {
              const isSelected = selectedDevice && (
                selectedDevice.id === dev.id ||
                (selectedDevice.vendorId === dev.vendorId && selectedDevice.productId === dev.productId)
              );
              const hexVid = '0x' + (dev.vendorId || 0).toString(16).toUpperCase();
              const hexPid = '0x' + (dev.productId || 0).toString(16).toUpperCase();

              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-3.5 rounded-[8px] border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[var(--info-color)] bg-[var(--info-color)]/8 shadow-sm ring-2 ring-[var(--info-color)]/20'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]/70 hover:border-[var(--border-color)]/80'
                  }`}
                >
                  {/* 左侧：硬件图标 */}
                  <div className={`w-11 h-11 rounded-[8px] flex items-center justify-center shrink-0 border transition ${
                    isSelected 
                      ? 'bg-[var(--info-color)] text-white border-[var(--info-color)] shadow-sm' 
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]'
                  }`}>
                    {dev.hasVendorCollection ? (
                      <Cpu className="w-5 h-5" />
                    ) : (
                      <Keyboard className="w-5 h-5" />
                    )}
                  </div>

                  {/* 中间：设备信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-[var(--text-primary)] truncate" title={dev.name}>
                        {dev.name}
                      </span>
                      {dev.isCurrentActive && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-[6px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 shrink-0">
                          当前连接
                        </span>
                      )}
                      {dev.isOfficial ? (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-[6px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/25 shrink-0">
                          官方方案
                        </span>
                      ) : (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-[6px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25 shrink-0">
                          客制化 PCB
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 mt-1 text-[11px] font-mono text-[var(--text-tertiary)]">
                      <span>VID: <strong className="text-[var(--text-secondary)]">{hexVid}</strong></span>
                      <span>PID: <strong className="text-[var(--text-secondary)]">{hexPid}</strong></span>
                      {dev.hasVendorCollection && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                          ⚡ 包含 0xFFB0 通道
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右侧：单选按钮指示器 */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'border-[var(--info-color)] bg-[var(--info-color)] text-white'
                      : 'border-[var(--border-color)] bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部操作区 */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-[var(--text-tertiary)]">
            <Info className="w-3.5 h-3.5 text-[var(--info-color)] shrink-0" />
            <span>选中设备后点击「连接并授权」，即可完成物理硬件绑定</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] transition cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDevice}
              className="px-5 py-2 rounded-[8px] text-xs font-bold bg-[var(--info-color)] text-white hover:opacity-90 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>连接并授权</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

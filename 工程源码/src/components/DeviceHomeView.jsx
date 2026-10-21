import React from 'react';
import {
  Plus,
  CheckCircle2,
  ArrowRight,
  Cable,
  Zap,
  Keyboard,
  ChevronRight,
} from 'lucide-react';
import { useToast } from './ToastProvider';
import kutazeAvatar from '../assets/avatar_kutaze.png';

// 主页设备管理中心 (多设备平铺：一台设备一张卡，未授权设备不展示)
export default function DeviceHomeView({
  isConnected = false,
  devices = [],
  activeDevice = null,
  deviceName = '键盘',
  deviceLabel = 'USB 极速有线磁轴',
  maxRate = 8000,
  isScanning = false,
  onRefreshDevices,
  onConnectDevice,
  onConnectSpecific,
  onEnterDevice,
  onOpenGlobalSettings,
}) {
  const { addToast } = useToast();

  const isActive = (dev) =>
    (isConnected &&
      ((activeDevice && dev.vendorId === activeDevice.vendorId && dev.productId === activeDevice.productId) ||
       (activeDevice && dev.id && activeDevice.id && dev.id === activeDevice.id) ||
       (devices.length === 1 && isConnected))) ||
    dev.connected;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] select-none overflow-y-auto">

      {/* 顶部欢迎区 */}
      <div className="px-10 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-title text-[var(--text-primary)] tracking-tight flex items-center space-x-2.5">
              <span>我的设备</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--primary-color)] text-[var(--text-inverse-100)] font-mono font-bold">
                SparkLink
              </span>
            </h1>
            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1.5">
              {devices.length > 0
                ? `星闪低时延互联技术驱动 · 已连接 ${devices.length} 台星闪方案外设`
                : '星闪低时延互联技术驱动 · 暂无已连接设备，请插入 USB 线连接键盘'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onRefreshDevices?.();
                addToast({ message: '正在自主检索已连接的星闪设备...', type: 'info' });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--text-secondary)] hover:text-[var(--info-color)] transition cursor-pointer shadow-2xs"
              title="点击立即重新检索当前电脑连接的所有 USB HID 外设"
            >
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{isScanning ? '正在检索设备...' : '检索连接设备'}</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-[var(--text-disabled)]">
              <span className="font-medium text-[var(--text-disabled)]">自主监听运行中</span>
            </div>
          </div>
        </div>
      </div>

      {/* 多设备平铺网格：一台设备一张卡，互不覆盖 */}
      <div className="flex-1 px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">

          {devices.map((dev, idx) => {
            const active = isActive(dev);
            // 归一化后的设备对象自带档案；兼容尚未归一化的裸 HIDDevice
            const shortModel =
              dev.displayName || dev.productName || dev.profile?.name || `星闪设备 #${idx + 1}`;
            const devMaxRate = dev.maxRate ?? dev.profile?.maxPollingRate ?? maxRate;
            const devLayout = dev.layoutName || dev.profile?.layoutName;
            const devConn = dev.connectionLabel || dev.profile?.connectionLabel || 'USB 极速有线';

            // 严格清理配列描述中的“如/例如”说明（例如：“左移64配列 (如 AE64/DV63)” -> “左移64配列”）
            const cleanLayout = (devLayout || '')
              .replace(/[\(（][^()（）]*?(如|例如)[^()（）]*?[\)）]/g, '')
              .trim();

            // 提取品牌与型号（实现换行：第一行品牌名，第二行型号，彻底解决挤压截断问题）
            let brandName = dev.brand || dev.profile?.brand || dev.profile?.brandName || '';
            let modelName = dev.model || dev.profile?.model || dev.shortName || dev.profile?.shortName || '';

            // 如果没有独立 brand / model，从 shortModel 中智能拆解或推断
            if (!brandName) {
              if (/江湾|Everglide/i.test(shortModel)) brandName = '江湾 Everglide';
              else if (/前行者|EWEADN/i.test(shortModel)) brandName = '前行者 EWEADN';
              else if (/VICTKONG|DV63/i.test(shortModel)) brandName = 'VICTKONG';
              else if (/迈从|MCHOSE/i.test(shortModel)) brandName = '迈从 MCHOSE';
              else if (/瓦尔基里|Valkyrie/i.test(shortModel)) brandName = '瓦尔基里';
              else if (/iMK/i.test(shortModel)) brandName = 'iMK 工作室';
              else brandName = '星闪客制化';
            }

            if (!modelName) {
              modelName = shortModel;
            }

            // 若型号文本包含了品牌名，移除品牌名前缀，避免重复显示如“江湾 Everglide 江湾 AE64-MAX”
            if (brandName && modelName.startsWith(brandName)) {
              modelName = modelName.slice(brandName.length).trim();
            } else if (brandName && modelName.includes(brandName)) {
              modelName = modelName.replace(brandName, '').trim();
            }
            if (!modelName) {
              modelName = shortModel;
            }

            return (
              <div
                key={dev.id || `${dev.vendorId}-${dev.productId}`}
                onClick={() => {
                  if (active || dev.connected || isConnected) {
                    onEnterDevice?.();
                  } else {
                    onConnectSpecific?.(dev);
                    addToast({ message: `正在连接 ${modelName} ...`, type: 'info' });
                  }
                }}
                className={`group relative bg-[var(--bg-secondary)] rounded-[10px] p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  active
                    ? 'border-[var(--border-color)] shadow-xl shadow-[var(--shadow-color)]'
                    : 'border-[var(--border-color)]/80 hover:border-[var(--border-color)] hover:shadow-xl hover:shadow-[var(--shadow-color-light)]'
                }`}
              >
                <div className="absolute right-4 top-4 text-[42px] font-black font-title text-[var(--primary-09)] select-none pointer-events-none tracking-tighter opacity-70 group-hover:text-[var(--primary-15)] transition">
                  SparkLink
                </div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                    {/* 左侧：第一行品牌名 + 配列标签，第二行产品型号（自动换行，防挤压，字号适度放大且字体清晰锐利） */}
                    <div className="min-w-0 flex-1">
                      {/* 第一行：产品的品牌名 + 配列标签 */}
                      <div className="flex items-center space-x-2.5 mb-2 flex-wrap gap-y-1">
                        <span className="text-[13.5px] font-bold text-[var(--primary-color)] tracking-wide uppercase">
                          {brandName}
                        </span>
                        {cleanLayout && (
                          <span className="shrink-0 px-2.5 py-0.5 rounded-[5px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[12px] font-semibold text-[var(--text-secondary)]">
                            {cleanLayout}
                          </span>
                        )}
                      </div>

                      {/* 第二行：产品型号 (字号增大至 18~20px，清晰易读，坚决不截断) */}
                      <div className="flex items-center space-x-2">
                        <Keyboard className="w-5 h-5 text-[var(--info-color)] shrink-0" />
                        <h3 className="text-lg sm:text-xl font-bold font-title device-card-name tracking-tight text-[var(--text-primary)] leading-snug break-words">
                          {modelName}
                        </h3>
                      </div>
                    </div>

                    {/* 右侧：进入驱动 / 立即连接 按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (active || dev.connected || isConnected) {
                          onEnterDevice?.();
                        } else {
                          onConnectSpecific?.(dev);
                          addToast({ message: `正在连接 ${modelName} ...`, type: 'info' });
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded-[8px] font-bold transition flex items-center space-x-1 shrink-0 mt-0.5 ${
                        active
                          ? 'bg-[var(--primary-color)] text-[var(--text-inverse-100)]'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--primary-25)] hover:border-[var(--border-color)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>进入驱动</span>
                        </>
                      ) : (
                        <>
                          <span>立即连接</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* 键盘插画 (自适应浅色微蓝与深色科技灰，杜绝纯黑死块) */}
                  <div className="py-8 flex flex-col items-center justify-center relative z-10">
                    <div className={`w-48 h-28 rounded-[8px] border flex flex-col items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 ${
                      active
                        ? 'bg-blue-50/80 dark:bg-zinc-800/80 border-blue-200 dark:border-zinc-700'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-color)]'
                    }`}>
                      <svg
                        className={`w-24 h-20 transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-tertiary)]'}`}
                        viewBox="0 0 100 70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="8" y="16" width="84" height="48" rx="8" />
                        <path d="M50 16 V6 H35" />
                        <rect x="18" y="24" width="8" height="6" rx="1.5" />
                        <rect x="30" y="24" width="8" height="6" rx="1.5" />
                        <rect x="42" y="24" width="8" height="6" rx="1.5" />
                        <rect x="54" y="24" width="8" height="6" rx="1.5" />
                        <rect x="66" y="24" width="8" height="6" rx="1.5" />
                        <rect x="74" y="24" width="8" height="6" rx="1.5" />
                        <rect x="18" y="34" width="8" height="6" rx="1.5" />
                        <rect x="30" y="34" width="8" height="6" rx="1.5" />
                        <rect x="42" y="34" width="8" height="6" rx="1.5" />
                        <rect x="54" y="34" width="8" height="6" rx="1.5" />
                        <rect x="66" y="34" width="8" height="6" rx="1.5" />
                        <rect x="74" y="34" width="8" height="6" rx="1.5" />
                        <rect x="30" y="44" width="40" height="6" rx="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 底部参数 */}
                <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-disabled)] relative z-10 gap-2 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap min-w-0">
                    <span className="flex items-center space-x-1 font-mono font-bold text-[var(--text-tertiary)] shrink-0">
                      <Cable className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
                      <span>{devConn}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono text-[var(--text-tertiary)] font-bold shrink-0">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{devMaxRate}Hz</span>
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] font-semibold truncate shrink-0" title={`VID: 0x${dev.vendorId?.toString(16)} PID: 0x${dev.productId?.toString(16)}`}>
                      0x{dev.vendorId?.toString(16)}:0x{dev.productId?.toString(16)}
                    </span>
                  </div>

                  <div className={`flex items-center space-x-1.5 font-bold group-hover:translate-x-1 transition-transform shrink-0 ml-auto pl-2 ${
                    active ? 'text-emerald-500 dark:text-emerald-400' : 'text-[var(--text-tertiary)]'
                  }`}>
                    {active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />}
                    <span>{active ? '已连接' : '未激活'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* 添加设备卡片 */}
          <div
            onClick={onConnectDevice}
            className="group bg-[var(--bg-secondary)]/60 hover:bg-[var(--bg-secondary)] rounded-[10px] p-6 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--info-color)] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[290px] text-center"
            title="点击打开添加与识别设备弹窗，扫描 USB HID 外设并可手动在星闪生态库中匹配档案"
          >
            <div className="w-14 h-14 rounded-[8px] bg-[var(--bg-tertiary)] group-hover:bg-[var(--info-color)] group-hover:text-white border border-[var(--border-color)] group-hover:border-[var(--info-color)] flex items-center justify-center text-[var(--text-tertiary)] transition-all duration-300 mb-4 shadow-xs">
              <Plus className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold font-title text-[var(--text-primary)] group-hover:text-[var(--info-color)] transition tracking-wide">
              添加设备
            </h4>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[220px] leading-relaxed">
              通过 USB 接入星闪方案磁轴键盘 / 自制 PCB / 外设生态库手动识别
            </p>
          </div>

        </div>

        {/* 空状态提示 */}
        {devices.length === 0 && (
          <div className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
            尚未检测到已授权设备 · 点击「添加设备」并选择你的键盘完成首次配对
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <footer className="px-10 py-4 border-t border-[var(--border-color)]/70 bg-transparent flex flex-col sm:flex-row items-center justify-between text-[12px] text-[var(--text-tertiary)]">
        <div className="flex items-center space-x-2">
          <span>温馨提示：</span>
          <span>推荐在 Windows / macOS 主流操作系统下使用本开源驱动客户端访问与配置</span>
        </div>
        <div className="mt-1 sm:mt-0 flex items-center space-x-2 font-mono text-[11px]">
          <img 
            src={kutazeAvatar} 
            alt="乐禾泽" 
            className="w-4 h-4 rounded-full border border-[var(--border-color)] object-cover shadow-xs" 
          />
          <span>Copyright © 2026</span>
          <button
            type="button"
            onClick={() => {
              if (typeof onOpenGlobalSettings === 'function') {
                onOpenGlobalSettings('about');
              } else if (window.electronAPI && typeof window.electronAPI.openExternalUrl === 'function') {
                window.electronAPI.openExternalUrl('https://github.com/Kutaze/AstraFlux-Hub');
              } else {
                window.open('https://github.com/Kutaze/AstraFlux-Hub', '_blank', 'noopener,noreferrer');
              }
            }}
            className="font-bold text-[var(--text-secondary)] hover:text-[var(--info-color)] hover:underline transition cursor-pointer"
            title="查看开发者 乐禾泽 (Kutaze) 主页与软件信息"
          >
            乐禾泽 (Kutaze)
          </button>
          <span>· 个人独立开发者开源项目 · 基于星闪 NearLink 规范</span>
        </div>
      </footer>

    </div>
  );
}

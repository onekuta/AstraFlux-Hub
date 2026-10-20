import React, { useState, useEffect } from 'react';
import {
  Settings2,
  Clock,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  DownloadCloud,
  Power,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from './ToastProvider';
import { keyboardService } from '../services/keyboardService';
import { updaterService } from '../services/updaterService';
import { checkKeyboardFirmwareUpdate, VENDOR_FIRMWARE_CHANNELS } from '../services/firmwareService';

export default function SettingsTab({ 
  deviceProfile, 
  firmwareVersion = 'V1.0.0',
  hardwareInfo = null,
  hardwareFeatures = null,
  device = null,
  onOpenDevLab = () => {},
}) {
  const { addToast } = useToast();

  // 设备维护
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // 键盘硬件固件升级 (官方通道与原厂源)
  const [isCheckingFw, setIsCheckingFw] = useState(false);
  const [fwCheckResult, setFwCheckResult] = useState(null);

  // 7次点击进入开发者后台
  const [devClickCount, setDevClickCount] = useState(0);

  const shortName = deviceProfile?.shortName || '设备';

  // 检查键盘硬件底层固件 (向官方 api.sparklinkplayjoy.com 查询)
  const handleCheckFirmware = async () => {
    setIsCheckingFw(true);
    setFwCheckResult(null);
    try {
      const vId = device?.vendorId || deviceProfile?.vendorId || 0x1ca6;
      const pId = device?.productId || deviceProfile?.productId || 0x1c24;
      const bId = hardwareInfo?.boardId || '0';
      const curVer = hardwareInfo?.appVersion || firmwareVersion || '0.1.0';

      const res = await checkKeyboardFirmwareUpdate({
        vendorId: vId,
        productId: pId,
        boardId: bId,
        currentFirmwareVersion: curVer,
      });

      setFwCheckResult(res);
      if (res.hasUpdate) {
        addToast({
          message: `发现官方硬件固件新版本 ${res.latestVersion}！`,
          type: 'info',
        });
      } else if (res.success) {
        addToast({
          message: res.message || '当前键盘硬件固件已是最新版本！',
          type: 'success',
        });
      } else {
        addToast({
          message: `官方固件查询反馈: ${res.message}`,
          type: 'warning',
        });
      }
    } catch (err) {
      addToast({ message: `检查固件异常: ${err.message}`, type: 'error' });
    } finally {
      setIsCheckingFw(false);
    }
  };

  // 点击版本触发开发者后台 (连续点击 7 次)
  const handleVersionClick = () => {
    const nextCount = devClickCount + 1;
    setDevClickCount(nextCount);
    if (nextCount >= 7) {
      setDevClickCount(0);
      addToast({ message: '已触发开发者模式，正在打开硬件实验室后台...', type: 'info' });
      onOpenDevLab();
    } else if (nextCount >= 3) {
      addToast({ message: `再点击 ${7 - nextCount} 次进入开发者后台`, type: 'info' });
    }
  };

  // 恢复出厂
  const handleRestoreFactory = async () => {
    setIsRestoring(true);
    try {
      await keyboardService.finishCalibration();
      const ok = await keyboardService.restoreFactory('All');
      addToast({
        message: ok 
          ? `已成功下发出厂复位指令，${shortName} 所有参数已重置为出厂预设！` 
          : `已尝试重置，若无法完全恢复请拔下 USB 重新插上。`,
        type: ok ? 'success' : 'warning',
      });
    } catch (e) {
      addToast({ message: '执行恢复出厂失败，请检查设备连接。', type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  // 急救恢复
  const handleEmergencyRecovery = async () => {
    setIsRecovering(true);
    try {
      await keyboardService.emergencyInputRecovery();
      addToast({
        message: '急救完成：已强制退出校准挂起状态，触发行程已复位为 0.40mm！请测试打字。',
        type: 'success',
      });
    } catch (e) {
      addToast({ message: '急救执行异常，请重新插拔键盘 USB 线缆。', type: 'warning' });
    } finally {
      setIsRecovering(false);
    }
  };

  // 软重启
  const handleRestartDevice = async () => {
    setIsRestarting(true);
    try {
      const lastVendorId = keyboardService.device?.vendorId;
      const lastProductId = keyboardService.device?.productId;
      const lastProductName = keyboardService.device?.productName;

      await keyboardService.finishCalibration();
      if (keyboardService.sdk && typeof keyboardService.sdk.highPollingRateReset === 'function') {
        await keyboardService.sdk.highPollingRateReset().catch(() => {});
      }
      addToast({ message: `正在软重启 ${shortName} 键盘主控并重新初始化...`, type: 'info' });
      if (typeof keyboardService.handleRateChangeResetSequence === 'function') {
        keyboardService.handleRateChangeResetSequence({
          vendorId: lastVendorId,
          productId: lastProductId,
          productName: lastProductName
        });
      }
    } catch (e) {
      // ignore
    } finally {
      setTimeout(() => setIsRestarting(false), 1600);
    }
  };

  return (
    <div className="panel-operation flex-1">
      <div className="operation-columns">

        {/* 左列：键盘硬件底层固件 (IAP/DFU) */}
        <div className="col space-y-4">

          {/* 键盘硬件底层固件升级 (IAP/DFU) */}
          <div className="section-box p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="section-title flex items-center text-sm font-bold text-[var(--text-primary)] shrink-0">
                <Cpu className="w-4 h-4 mr-1.5 text-[var(--info-color)] shrink-0" />
                <span>键盘硬件固件升级</span>
              </h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 whitespace-nowrap shrink-0">
                主控固件: {hardwareInfo?.appVersion || firmwareVersion}
              </span>
            </div>

            {/* 固件来源与权威声明 */}
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>固件来源声明与安全通道</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                硬件底层固件由<strong className="text-[var(--text-primary)] font-bold">品牌原厂及星闪官方团队</strong>维护并数字签名。本开源驱动仅提供官方云端通道 (<code className="text-[var(--info-color)] font-mono font-bold">api.sparklinkplayjoy.com</code>) 校验与下载，严禁刷入非原厂未知二进制文件以防设备变砖。
              </p>
              <div className="pt-2 border-t border-[var(--border-color)]/60 text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <span>💡 温馨建议：固件更新建议优先前往键盘品牌原厂官网或官方技术支持中心获取并更新，以确保获得针对该型号的最佳稳定性与专属调校特性。</span>
              </div>
            </div>

            {/* 当前硬件参数信息 */}
            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 p-3 rounded-lg border border-[var(--border-color)]/60 font-medium">
              <div className="truncate">型号: <span className="text-[var(--text-primary)] font-bold" title={device?.productName || deviceProfile?.name || '星闪键盘'}>{device?.productName || deviceProfile?.name || '星闪键盘'}</span></div>
              <div className="truncate">主板 ID: <span className="text-[var(--text-primary)] font-mono font-bold">{hardwareInfo?.boardId || '0'}</span></div>
              <div className="truncate">PCB 版本: <span className="text-[var(--text-primary)] font-semibold">{hardwareInfo?.pcbVersion || '标准版'}</span></div>
              <div className="truncate">VID:PID: <span className="text-[var(--text-primary)] font-mono font-bold">0x{((device?.vendorId || deviceProfile?.vendorId || 0x1ca6)).toString(16).toUpperCase()} : 0x{((device?.productId || deviceProfile?.productId || 0x1c24)).toString(16).toUpperCase()}</span></div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleCheckFirmware}
                disabled={isCheckingFw}
                className="btn btn-primary text-xs flex items-center space-x-1.5 py-1.5 px-3.5 disabled:opacity-60 cursor-pointer shadow-sm font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingFw ? 'animate-spin' : ''}`} />
                <span>{isCheckingFw ? '正在查询官方固件源...' : '检查官方硬件固件'}</span>
              </button>
            </div>

            {/* 固件查询反馈卡片 */}
            {fwCheckResult && (
              <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-secondary)]">官方查询结果：</span>
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">来源: {fwCheckResult.sourceName}</span>
                </div>

                {fwCheckResult.hasUpdate ? (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1.5">
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>发现官方新固件: {fwCheckResult.latestVersion}</span>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] font-mono">{fwCheckResult.releaseDate}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {fwCheckResult.changelog}
                    </div>
                    {fwCheckResult.firmwareUrl && (
                      <div className="pt-1">
                        <a
                          href={fwCheckResult.firmwareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary text-xs inline-flex items-center space-x-1 py-1 px-3.5 font-bold"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>下载官方固件包 (.bin)</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="font-bold">{fwCheckResult.message}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        当前主控正在运行出厂稳定版本。若需特殊测试固件，可前往下方品牌原厂支持中心。
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 品牌原厂固件渠道快捷入口 */}
            <div className="pt-2 border-t border-[var(--border-color)]/60">
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                硬件原厂固件支持中心：
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_FIRMWARE_CHANNELS.map((ch, idx) => (
                  <a
                    key={idx}
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--primary-09)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition inline-flex items-center space-x-1 cursor-pointer"
                    title={ch.desc}
                  >
                    <span>{ch.brand}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ))}
              </div>
            </div>

            {/* 升级安全警示 */}
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400/90 leading-relaxed font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>刷写安全警告：</strong>硬件固件刷写耗时约 1-2 分钟。刷写期间务必保持 USB 有线连接稳固，切勿拔出线缆或关机断电，否则将破坏 Bootloader 导致键盘无法启动。
              </span>
            </div>
          </div>

        </div>

        {/* 右列：设备维护与重置 */}
        <div className="col space-y-4">
          <div className="section-box p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
            <div className="section-head">
              <h3 className="section-title flex items-center text-sm font-bold text-[var(--text-primary)]">
                <Settings2 className="w-4 h-4 mr-1.5 text-[var(--info-color)]" />
                设备维护与应急重置
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleEmergencyRecovery}
                disabled={isRecovering}
                className="w-full p-3 rounded-xl border border-amber-300 bg-amber-500/10 hover:bg-amber-500/15 text-left transition text-amber-600 dark:text-amber-400 cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center space-x-1.5 font-bold text-[13px]">
                  <RotateCcw className="w-4 h-4 text-amber-500" />
                  <span>{isRecovering ? '正在急救恢复中...' : '按键无法输入急救 (解除校准锁定 / 恢复触发行程)'}</span>
                </div>
                <div className="text-xs text-amber-700/80 dark:text-amber-300/90 mt-1 leading-relaxed">
                  若打字无反应或误入锁死模式，点此一键释放锁定并恢复推荐键程 (0.40mm)
                </div>
              </button>

              <button
                onClick={handleRestoreFactory}
                disabled={isRestoring}
                className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left transition text-rose-700 cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center space-x-1.5 font-bold text-[13px]">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>{isRestoring ? '正在复位中...' : '恢复出厂设置'}</span>
                </div>
                <div className="text-xs text-rose-600/90 mt-1 leading-relaxed">清空板载 Flash，复位全部性能与映射为官方出厂预设</div>
              </button>

              <button
                onClick={handleRestartDevice}
                disabled={isRestarting}
                className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:bg-[var(--primary-09)] text-left transition text-[var(--text-secondary)] cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center space-x-1.5 font-bold text-[13px]">
                  <Power className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>{isRestarting ? '正在重启...' : '软重启键盘主控'}</span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1 leading-relaxed">软复位主控芯片并重新加载 USB 枚举</div>
              </button>
            </div>
          </div>

          {/* 当前设备硬件出厂档案与 SN */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between font-bold text-sm text-[var(--text-primary)]">
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-[var(--info-color)]" />
                <span>当前设备出厂硬件参数与 SN</span>
              </div>
              {hardwareInfo?.sn && (
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(hardwareInfo.sn);
                    addToast({ message: '硬件出厂 SN 码已复制到剪贴板！', type: 'success' });
                  }}
                  className="text-xs px-2.5 py-0.5 rounded bg-[var(--primary-04)] hover:bg-[var(--primary-09)] text-[var(--info-color)] font-bold transition cursor-pointer"
                >
                  复制 SN
                </button>
              )}
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div>型号：<span className="text-[var(--text-primary)] font-bold">{device?.productName || deviceProfile?.name || '星闪键盘'}</span></div>
              <div className="flex items-center space-x-1">
                <span>硬件 SN：</span>
                <span className="font-mono text-[var(--info-color)] font-bold truncate select-all">{hardwareInfo?.sn || device?.serialNumber || '—'}</span>
              </div>
              <div>主控程序版本：<span className="font-mono text-[var(--text-primary)] font-bold">{hardwareInfo?.appVersion || firmwareVersion}</span></div>
              <div>PCB 硬件版本：<span className="font-mono text-[var(--text-primary)] font-semibold">{hardwareInfo?.pcbVersion || '—'}</span></div>
              <div>硬件主板 ID：<span className="font-mono text-[var(--text-primary)] font-semibold">{hardwareInfo?.boardId || '—'}</span></div>
              <div>配列规格：<span className="text-[var(--text-primary)] font-medium">{deviceProfile?.layoutName || '—'} ({deviceProfile?.layout === '68keys' ? 68 : 64} 键)</span></div>
              <div>通信接口：<span className="text-[var(--text-primary)] font-medium">{deviceProfile?.connectionLabel || 'USB 2.0 / 3.0 高速模式'}</span></div>
              <div>回报率上限：<span className="font-mono text-[var(--text-primary)] font-semibold">{deviceProfile?.maxPollingRate ? `${deviceProfile.maxPollingRate} Hz (0.125ms)` : '8000 Hz'}</span></div>
            </div>
          </div>

          {/* 驱动版本与开发者隐藏彩蛋入口 */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] select-none">
            <span
              onClick={handleVersionClick}
              className="hover:text-[var(--info-color)] transition cursor-pointer font-mono font-medium"
              title="连续点击 7 次进入开发者后台"
            >
              驱动版本: V{updaterService.getCurrentAppVersion()} (开源发布版)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.__openGlobalSettings) {
                    window.__openGlobalSettings('updates');
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--info-color)]/10 hover:bg-[var(--info-color)]/20 text-[var(--info-color)] font-bold transition flex items-center space-x-1 cursor-pointer"
                title="软件与外设适配库更新已迁移至软件设置，点此直达"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>软件与适配库更新</span>
              </button>
              <button
                onClick={onOpenDevLab}
                className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer font-mono font-semibold"
                title="开发者硬件实验室 (快捷键 Ctrl+Alt+Shift+D)"
              >
                DevLab
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

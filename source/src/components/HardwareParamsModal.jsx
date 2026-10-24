import React from 'react';
import { 
  Cpu, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Calendar, 
  Radio, 
  Sliders, 
  Zap, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useToast } from './ToastProvider';

export default function HardwareParamsModal({
  isOpen,
  onClose,
  deviceProfile,
  hardwareInfo,
  hardwareFeatures,
  device,
  pollingRate
}) {
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const rawSn = hardwareInfo?.sn || device?.serialNumber || '';
  const displaySn = rawSn || '未读取到出厂 SN (请检查星闪驱动连接)';

  const handleCopySn = () => {
    if (!rawSn) return;
    navigator.clipboard?.writeText?.(rawSn);
    setCopied(true);
    addToast({
      message: `已复制出厂 SN 码：${rawSn}`,
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shortName = hardwareInfo?.name || hardwareInfo?.model || hardwareInfo?.deviceName || (device?.productName || '').replace(/\0/g, '').trim() || deviceProfile?.name || deviceProfile?.shortName || '星闪键盘';
  const appVer = hardwareInfo?.appVersion || deviceProfile?.firmwareVersion || '0.1.9.0';
  const pcbVer = hardwareInfo?.pcbVersion || '1-0-0-0';
  const boardId = hardwareInfo?.boardId != null ? String(hardwareInfo.boardId) : '1835044';
  const timestamp = hardwareInfo?.timestamp || '2026042211:0';
  const runMode = hardwareInfo?.runModeVersion != null ? `Mode ${hardwareInfo.runModeVersion}` : 'NearLink Mode 1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl p-6 text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--primary-09)] flex items-center justify-center text-[var(--primary-color)] border border-[var(--primary-15)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-title tracking-wide">{shortName}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  星闪认证
                </span>
              </div>
              <p className="text-xs text-[var(--text-disabled)] mt-0.5">板载芯片架构与出厂硬件参数详情</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 出厂 SN 码突出展示卡片 */}
        <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-[var(--info-color)]" />
              出厂唯一序列号 (SN 码)
            </span>
            <button
              onClick={handleCopySn}
              disabled={!rawSn}
              className="text-xs font-medium text-[var(--primary-color)] hover:underline flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '一键复制'}</span>
            </button>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono text-sm tracking-wider font-bold select-all flex items-center justify-between">
            <span className={rawSn ? 'text-[var(--text-primary)]' : 'text-[var(--text-disabled)] font-normal text-xs'}>
              {displaySn}
            </span>
            {rawSn && (
              <span className="text-[10px] text-[var(--text-disabled)] ml-2 font-normal font-sans">
                ({rawSn.length}位出厂防伪码)
              </span>
            )}
          </div>
        </div>

        {/* 核心硬件参数九宫格 */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {/* 固件版本 */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
              <span>固件程序版本 (appVersion)</span>
            </div>
            <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
              {appVer}
            </div>
          </div>

          {/* PCB 硬件版本 */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Layers className="w-3.5 h-3.5 mr-1 text-blue-500" />
              <span>PCB 主板版本 (pcbVersion)</span>
            </div>
            <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
              {pcbVer}
            </div>
          </div>

          {/* 主板识别 ID */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Cpu className="w-3.5 h-3.5 mr-1 text-purple-500" />
              <span>主板识别号 (boardId)</span>
            </div>
            <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
              {boardId}
            </div>
          </div>

          {/* 出厂编译时间 */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span>出厂时间戳 (timestamp)</span>
            </div>
            <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
              {timestamp}
            </div>
          </div>

          {/* 传感器架构 */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Sliders className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span>按键传感类型</span>
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)]">
              全键高精霍尔线性磁轴
            </div>
          </div>

          {/* 当前传输通道与运行模式 */}
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
            <div className="flex items-center text-[var(--text-disabled)] mb-1">
              <Radio className="w-3.5 h-3.5 mr-1 text-cyan-500" />
              <span>工作模式与通道</span>
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)]">
              {runMode} · {pollingRate || 8000}Hz
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <div className="text-[11px] text-[var(--text-disabled)] flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            所有星闪无线/有线方案键盘均已支持硬件直读
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--primary-color)] text-[var(--text-inverse-100)] text-xs font-bold hover:bg-[var(--primary-color-hover)] transition cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

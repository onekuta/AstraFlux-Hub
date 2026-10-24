import React from 'react';

/**
 * 星闪 USB 3.0 / 高回报率专用驱动提示模态弹窗
 * 100% 还原星闪官网与用户截图：当检测到 USB 3.0 设备或 16K/32K 高回报率设备首次插入时弹出驱动安装提示
 */
export default function Usb3DriverPromptModal({
  isOpen,
  onClose,
  onNeverRemind,
  onDownload
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-4 select-none">
      {/* 模态弹窗主体 (自适应浅色与深色主题，彻底与软件主题保持 100% 一致配色) */}
      <div 
        className="w-full max-w-[500px] bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-[12px] shadow-2xl border border-[var(--border-color)] p-6 relative transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* 头部标题与关闭按钮 */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <span className="text-amber-500 text-base">⚠️</span>
            <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
              驱动安装提示
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            title="关闭"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 提示正文 (100% 官方原文与截图一致) */}
        <div className="py-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          检测到您的设备支持超高回报率硬件方案。若要开启 16KHz 或 32KHz 极速回报率，请下载安装专用的 USB 3.0 驱动，并使用原装或高品质 USB 3.0 数据线。安装后请重新插拔设备即可自动生效。
        </div>

        {/* 底部按钮栏 (右对齐：不再提醒 + 下载USB3.0驱动) */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onNeverRemind}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors cursor-pointer"
          >
            不再提醒
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)] transition shadow-xs cursor-pointer flex items-center space-x-1.5"
          >
            <span>下载 USB 3.0 驱动</span>
          </button>
        </div>
      </div>
    </div>
  );
}

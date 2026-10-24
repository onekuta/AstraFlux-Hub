import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'success', duration = 2000 }) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => {
      // 过滤掉同名完全相同的重复提示，避免多重连点时屏幕出现大量重叠气泡
      const filtered = prev.filter((t) => t.message !== message);
      const next = [...filtered, { id, message, type }];
      // 保持至多 2 个气泡排队，绝不大面积遮挡键盘操作区
      return next.slice(-2);
    });

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* 顶部中央气泡通知容器 (统一现代极简 UI，替换系统原生二次确认窗) */}
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center space-y-2 pointer-events-none select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-2 rounded-[8px] shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] border-[var(--border-color)] ${
              toast.type === 'success'
                ? 'shadow-emerald-500/10'
                : toast.type === 'warning'
                ? 'shadow-amber-500/10'
                : 'shadow-blue-500/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}

            <span className="text-xs font-bold font-sans tracking-wide">
              {toast.message}
            </span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] ml-1 p-0.5 rounded-full hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: ({ message }) => console.log(message)
    };
  }
  return context;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { LanguageProvider } from './i18n/LanguageContext';

// 全局未捕获异常与 Promise 拒绝监听，自动落盘本地日志
window.addEventListener('error', (event) => {
  try {
    if (window.electronAPI?.logError) {
      window.electronAPI.logError({
        source: 'Window:onerror',
        message: event.message || '未知前端脚本错误',
        stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
      });
    }
  } catch (e) {}
});

window.addEventListener('unhandledrejection', (event) => {
  try {
    if (window.electronAPI?.logError) {
      const reason = event.reason;
      window.electronAPI.logError({
        source: 'Window:unhandledrejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : '',
      });
    }
  } catch (e) {}
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

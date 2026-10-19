import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

/**
 * 星闪驱动全局与模块级错误边界守护组件
 * 彻底防止任何未捕获组件异常导致 Electron 客户端整页白屏死机
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SparkLink ErrorBoundary 捕获到组件异常]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleBackHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onBackHome) {
      this.props.onBackHome();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'home');
      window.location.href = url.toString();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[420px] h-full w-full p-8 text-center bg-[var(--bg-primary)] text-[var(--text-primary)] select-none">
          <div className="w-16 h-16 rounded-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/5">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black font-title tracking-wide mb-2 text-[var(--text-primary)]">
            驱动功能视图遇到了临时异常
          </h2>

          <p className="text-xs text-[var(--text-tertiary)] max-w-md mb-6 leading-relaxed">
            设备通信或组件状态已由守护系统自动隔离拦截，防止软件崩溃白屏。您可以尝试重新加载或返回主页。
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg mb-6 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-left font-mono text-[11px] text-[var(--text-disabled)] overflow-x-auto max-h-28">
              <span className="text-rose-400 font-bold">{this.state.error.name}: </span>
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={this.handleReset}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--primary-color)] text-[var(--text-inverse-100)] hover:brightness-110 transition cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新载入驱动</span>
            </button>

            <button
              onClick={this.handleBackHome}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--text-secondary)] hover:text-[var(--info-color)] transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>返回设备管理主页</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

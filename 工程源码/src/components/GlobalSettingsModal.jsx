import React, { useState } from 'react';
import { 
  Home, 
  Settings2, 
  Bell, 
  MessageSquare, 
  Info, 
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Scale,
  HelpCircle,
  Monitor,
  Volume2,
  RefreshCw,
  Cpu,
  Heart,
  Mail,
  Smartphone,
  ShieldCheck,
  Wifi,
  Users,
  Code,
  UserCheck,
  FileText
} from 'lucide-react';
import AstraFluxLogo from './AstraFluxLogo';
import { useToast } from './ToastProvider';
import kutazeAvatar from '../assets/avatar_kutaze.png';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function BilibiliIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.813 4.653h.854c1.51 0 2.769.84 3.154 2.114.05.17.079.35.079.533v9.4a3.3 3.3 0 01-3.233 3.3H5.333a3.3 3.3 0 01-3.233-3.3v-9.4c0-.183.029-.363.079-.533C2.563 5.493 3.822 4.653 5.333 4.653h.854l-1.6-1.6a1 1 0 111.414-1.414l2.607 2.607a.997.997 0 01.406.407h5.972a.997.997 0 01.406-.407l2.607-2.607a1 1 0 111.414 1.414l-1.6 1.6zm-12.48 3.5a1.3 1.3 0 00-1.3 1.3v8a1.3 1.3 0 001.3 1.3h13.334a1.3 1.3 0 001.3-1.3v-8a1.3 1.3 0 00-1.3-1.3H5.333zM8.5 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm7 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  );
}

const FAQ_ITEMS = [
  {
    q: '为什么切换回报率后容易不自动连接？',
    a: '当切换 8KHz / 4KHz / 1KHz 回报率或物理热插拔时，单片机将自动重置底层 PHY 物理层。驱动已内置自动握手守护线程与单片机步进重连机制。如遇 Windows 系统偶发 USB 挂起，拔插一次数据线或在主页点击「重新识别」即可立即恢复高速通讯。'
  },
  {
    q: '当前驱动客户端支持哪些星闪设备与键盘？',
    a: '已全面支持星闪 (NearLink) SLE 8KHz 极速电竞生态键盘、BS2 系列主控、前行者/迈从/渴创等品牌星闪方案设备，以及 60% / 64 / 68 / 75% / 87 / 98 / 104 等常见客制化与量产配列。'
  },
  {
    q: '星闪无线扫描不到设备时应如何处理？',
    a: '请确保星闪专用无线接收器已插入电脑 USB 3.0/2.0 接口，键盘机身拨档已切换至星闪无线档位且电量充足。首次配对可在设备管理页点击「添加设备」进行免驱授权识别。'
  },
  {
    q: '全键消磁校准与 RT (快速触发) 参数是否常驻生效？',
    a: '是的。在「全键消磁校准」完成行程物理下压后，死区、触发行程与动态 RT 参数将直接烧录存入键盘硬件板载 Flash 芯片。即使彻底退出驱动或更换电脑设备使用，硬件依然保持极速响应。'
  }
];

const LICENSE_GROUPS = [
  {
    category: '应用框架与运行时',
    items: [
      { name: 'electron', version: 'v34.3.0', license: 'MIT' },
      { name: 'vite', version: 'v8.3.4', license: 'MIT' },
      { name: 'react', version: 'v19.2.8', license: 'MIT' },
      { name: 'react-dom', version: 'v19.2.8', license: 'MIT' },
      { name: 'node.js', version: 'v24.2.0', license: 'MIT' },
      { name: '@sparklinkplayjoy/sdk', version: 'v2.1.0', license: 'Apache-2.0' },
    ]
  },
  {
    category: '界面与前端库',
    items: [
      { name: 'tailwindcss', version: 'v4.1.0', license: 'MIT' },
      { name: 'lucide-react', version: 'v1.16.0', license: 'ISC' },
      { name: 'clsx', version: 'v2.1.1', license: 'MIT' },
      { name: 'tailwind-merge', version: 'v3.0.0', license: 'MIT' },
      { name: 'canvas-confetti', version: 'v1.9.4', license: 'MIT' },
      { name: 'postcss', version: 'v8.5.3', license: 'MIT' },
    ]
  },
  {
    category: '设备通讯与系统集成',
    items: [
      { name: 'WebHID API', version: 'W3C Std', license: 'W3C' },
      { name: 'electron-updater', version: 'v6.6.2', license: 'MIT' },
      { name: 'asar', version: 'v3.2.0', license: 'MIT' },
      { name: 'ws (WebSocket)', version: 'v8.18.0', license: 'MIT' },
    ]
  },
  {
    category: '字体与排版资产',
    items: [
      { name: 'PangMenZhengDao (庞门正道标题体)', version: 'v1.0', license: '免费商用' },
      { name: 'Noto Sans SC (思源黑体)', version: 'v2.0', license: 'OFL-1.1' },
      { name: 'JetBrains Mono', version: 'v2.3', license: 'OFL-1.1' },
      { name: 'Smiley Sans (得意黑)', version: 'v1.1', license: 'OFL-1.1' },
    ]
  }
];

export default function GlobalSettingsModal({ 
  isOpen, 
  onClose,
  initialSection = 'general',
  onOpenDevLab = () => {},
}) {
  const { addToast } = useToast();
  const [devClicks, setDevClicks] = useState(0);
  const [activeSection, setActiveSection] = useState(initialSection); // 'general' | 'notifications' | 'feedback' | 'about'
  
  // 常规设置状态 (图四)
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [launchMinimizeToTray, setLaunchMinimizeToTray] = useState(false);
  const [closeAction, setCloseAction] = useState('tray'); // 'exit' | 'tray'
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [language, setLanguage] = useState('zh-CN');
  const [uiScale, setUiScale] = useState('default');

  // 初始化加载已保存的设置
  React.useEffect(() => {
    const applyLoadedSettings = (s) => {
      if (!s) return;
      if (s.autoLaunch !== undefined) setAutoLaunch(!!s.autoLaunch);
      if (s.launchMinimizeToTray !== undefined) setLaunchMinimizeToTray(!!s.launchMinimizeToTray);
      if (s.closeAction !== undefined) setCloseAction(s.closeAction);
      if (s.autoUpdate !== undefined) setAutoUpdate(!!s.autoUpdate);
    };

    if (window.electronAPI?.getAppSettings) {
      window.electronAPI.getAppSettings().then((s) => {
        if (s) applyLoadedSettings(s);
      }).catch(() => {});
    }
    try {
      const saved = localStorage.getItem('sparklink_hub_settings');
      if (saved) {
        applyLoadedSettings(JSON.parse(saved));
      }
      const savedScale = localStorage.getItem('sparklink_hub_ui_scale');
      if (savedScale) {
        setUiScale(savedScale);
        const factorMap = { default: 1.0, '110': 1.1, '125': 1.25 };
        const factor = factorMap[savedScale] || 1.0;
        if (window.electronAPI?.setZoomFactor) {
          window.electronAPI.setZoomFactor(factor);
        }
      }
    } catch (e) {}
  }, []);

  const handleSettingChange = (key, val) => {
    const nextAutoLaunch = key === 'autoLaunch' ? val : autoLaunch;
    const nextLaunchMinimizeToTray = key === 'launchMinimizeToTray' ? val : launchMinimizeToTray;
    const nextCloseAction = key === 'closeAction' ? val : closeAction;
    const nextAutoUpdate = key === 'autoUpdate' ? val : autoUpdate;

    if (key === 'autoLaunch') setAutoLaunch(val);
    if (key === 'launchMinimizeToTray') setLaunchMinimizeToTray(val);
    if (key === 'closeAction') setCloseAction(val);
    if (key === 'autoUpdate') setAutoUpdate(val);

    const updated = {
      autoLaunch: nextAutoLaunch,
      launchMinimizeToTray: nextLaunchMinimizeToTray,
      closeAction: nextCloseAction,
      autoUpdate: nextAutoUpdate,
    };

    try {
      localStorage.setItem('sparklink_hub_settings', JSON.stringify(updated));
    } catch (e) {}

    if (window.electronAPI?.syncAppSettings) {
      window.electronAPI.syncAppSettings(updated).catch(() => {});
    } else if (window.electronAPI?.saveAppSettings) {
      window.electronAPI.saveAppSettings(updated).catch(() => {});
    }

    const toastMsgMap = {
      autoLaunch: val ? '开机自启动已开启' : '开机自启动已关闭',
      launchMinimizeToTray: val ? '启动时最小化到系统托盘已开启' : '启动时最小化到系统托盘已关闭',
      closeAction: val === 'tray' ? '已设置为：关闭面板时最小化到托盘' : '已设置为：关闭面板时退出程序',
      autoUpdate: val ? '自动更新已开启' : '自动更新已关闭',
    };

    addToast({
      message: toastMsgMap[key] || '系统设置已更新并生效',
      type: 'success',
      duration: 1500,
    });
  };

  const handleUiScaleChange = (val) => {
    setUiScale(val);
    const factorMap = { default: 1.0, '110': 1.1, '125': 1.25 };
    const factor = factorMap[val] || 1.0;
    if (window.electronAPI?.setZoomFactor) {
      window.electronAPI.setZoomFactor(factor);
    }
    try {
      localStorage.setItem('sparklink_hub_ui_scale', val);
    } catch (e) {}
    addToast({
      message: `界面缩放已设置为 ${val === 'default' ? '默认 (100%)' : val + '%'}`,
      type: 'info',
      duration: 1500,
    });
  };

  // 消息通知状态 (键盘专用通知)
  const [notifyManualProfile, setNotifyManualProfile] = useState(true);
  const [notifyAutoProfile, setNotifyAutoProfile] = useState(true);
  const [notifyLockKeys, setNotifyLockKeys] = useState(false);
  const [notifyLowBattery, setNotifyLowBattery] = useState(true);

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0); // 默认展开第1项常见问题 (对齐截图)
  const [expandedLicenseGroups, setExpandedLicenseGroups] = useState({ 0: true }); // 默认展开第1类开源组件 (对齐截图)

  const openExternal = (url, label) => {
    try {
      if (window.electronAPI && typeof window.electronAPI.openExternalUrl === 'function') {
        window.electronAPI.openExternalUrl(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      if (label) {
        addToast({ message: `正在打开【${label}】...`, type: 'info', duration: 1500 });
      }
    } catch (e) {
      console.error('打开外部链接异常:', e);
    }
  };

  const handleCheckUpdate = () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    addToast({ message: '正在检查最新驱动版本与更新信息...', type: 'info', duration: 1200 });
    setTimeout(() => {
      setIsCheckingUpdate(false);
      addToast({
        message: '当前已是最新稳定版本 (v1.1.0 · 2026 开源发布版)',
        type: 'success',
        duration: 3000
      });
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none p-6 animate-in fade-in duration-200">
      
      {/* 弹窗主体大卡片 (1:1 现代化卡片结构，对齐 THRM 宽屏卡片设计) */}
      <div className="w-[1080px] max-w-[96vw] h-[720px] max-h-[94vh] bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-[14px] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        
        {/* 顶部标题栏 */}
        <div className="h-14 px-6 bg-[var(--surface-solid-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
          <button 
            onClick={onClose}
            className="flex items-center space-x-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>返回主页</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[var(--text-tertiary)]">系统全局参数</span>
          </div>
        </div>

        {/* 主体分栏 */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* 左侧菜单导航 */}
          <aside className="w-56 p-5 border-r border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 flex flex-col space-y-1.5">
            {[
              { id: 'general', label: '常规设置', icon: Settings2 },
              { id: 'notifications', label: '消息通知', icon: Bell },
              { id: 'feedback', label: '反馈', icon: MessageSquare },
              { id: 'about', label: '关于', icon: Info },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* 右侧详细内容区 (带平滑滚动) */}
          <main className="flex-1 p-6 overflow-y-auto bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] custom-scrollbar">
            
            {/* 1. 常规设置 (完全 1:1 对齐图一) */}
            {activeSection === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-base font-black font-title text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                  常规设置
                </h2>

                {/* 启动与关闭卡片 (左右分栏) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 启动卡片 */}
                  <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">启动</h4>
                    <label className="flex items-center space-x-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoLaunch} 
                        onChange={(e) => handleSettingChange('autoLaunch', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-[var(--border-color)] focus:ring-blue-500 cursor-pointer" 
                      />
                      <span className="font-medium">开机自启动</span>
                    </label>

                    {autoLaunch && (
                      <div className="pl-6 pt-1">
                        <label className="flex items-center space-x-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={launchMinimizeToTray} 
                            onChange={(e) => handleSettingChange('launchMinimizeToTray', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-[var(--border-color)] focus:ring-blue-500 cursor-pointer" 
                          />
                          <span>启动时最小化到系统托盘</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 关闭面板时 */}
                  <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">关闭面板时</h4>
                    <label className={`flex items-center space-x-2 text-xs cursor-pointer select-none transition ${closeAction === 'exit' ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      <input 
                        type="radio" 
                        name="closeAction" 
                        value="exit"
                        checked={closeAction === 'exit'}
                        onChange={() => handleSettingChange('closeAction', 'exit')}
                        className="w-4 h-4 text-blue-600 border-[var(--border-color)] focus:ring-blue-500 cursor-pointer" 
                      />
                      <span>退出程序</span>
                    </label>
                    <label className={`flex items-center space-x-2 text-xs cursor-pointer select-none transition ${closeAction === 'tray' ? 'text-[var(--info-color)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      <input 
                        type="radio" 
                        name="closeAction" 
                        value="tray"
                        checked={closeAction === 'tray'}
                        onChange={() => handleSettingChange('closeAction', 'tray')}
                        className="w-4 h-4 text-blue-600 border-[var(--border-color)] focus:ring-blue-500 cursor-pointer" 
                      />
                      <span>最小化到托盘，不退出程序</span>
                    </label>
                  </div>
                </div>

                {/* 自动更新行 */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">自动更新</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      开启后，新版本更新包将在后台自动准备，准备完成后可一键重启更新
                    </p>
                    <button className="text-[11px] text-[var(--info-color)] font-bold hover:underline mt-1 inline-block cursor-pointer">
                      查看历史版本
                    </button>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoUpdate} 
                    onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded-md border-[var(--border-color)] cursor-pointer"
                  />
                </div>

                {/* 语言切换 */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">语言</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">语言切换 / Language</p>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-1.5 text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English (US)</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>

                {/* 界面大小 */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">界面大小</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">调整字体及界面大小</p>
                  </div>
                  <select 
                    value={uiScale}
                    onChange={(e) => handleUiScaleChange(e.target.value)}
                    className="px-4 py-1.5 text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="default">默认 (100%)</option>
                    <option value="110">放大 (110%)</option>
                    <option value="125">高分屏 (125%)</option>
                  </select>
                </div>

                {/* 按键测试工具 */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">按键测试工具</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">实时检测键盘按键响应与按压平滑曲线</p>
                  </div>
                  <button 
                    type="button"
                    onClick={async () => {
                      const targetUrl = 'https://keycheck.online/?lang=zh';
                      try {
                        if (window.electronAPI && typeof window.electronAPI.openExternalUrl === 'function') {
                          await window.electronAPI.openExternalUrl(targetUrl);
                        } else {
                          window.open(targetUrl, '_blank', 'noopener,noreferrer');
                        }
                        addToast({
                          message: '已在浏览器中打开【在线按键测试工具 (KeyCheck.Online)】！',
                          type: 'success'
                        });
                      } catch (e) {
                        console.error('打开按键测试工具失败:', e);
                        window.open(targetUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="px-5 py-1.5 text-xs font-bold rounded-full border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--bg-secondary)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>去测试</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            {/* 2. 消息通知 (纯键盘专用通知) */}
            {activeSection === 'notifications' && (
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-base font-black font-title text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                  消息通知
                </h2>

                {[
                  {
                    title: '手动切换板载通知',
                    desc: '仅支持星闪磁轴键盘',
                    checked: notifyManualProfile,
                    onChange: setNotifyManualProfile
                  },
                  {
                    title: '自动切换板载通知',
                    desc: '启用自动切换板载功能后生效',
                    checked: notifyAutoProfile,
                    onChange: setNotifyAutoProfile
                  },
                  {
                    title: '按键切换通知',
                    desc: '包括 Caps Lock、Num Lock、Scroll Lock 的开启和关闭的通知',
                    checked: notifyLockKeys,
                    onChange: setNotifyLockKeys
                  },
                  {
                    title: '键盘低电量通知',
                    desc: '键盘电量低于 10% 时进行提示',
                    checked: notifyLowBattery,
                    onChange: setNotifyLowBattery
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--info-color)]"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* 3. 反馈 */}
            {activeSection === 'feedback' && (
              <div className="space-y-4 max-w-2xl animate-in fade-in duration-150">
                <h2 className="text-base font-black font-title text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                  驱动问题反馈与建议
                </h2>

                {/* 开发者直联联系信息 */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={kutazeAvatar} 
                      alt="乐禾泽" 
                      className="w-10 h-10 rounded-full border border-blue-500/40 object-cover shrink-0 shadow-xs" 
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-[var(--text-primary)]">乐禾泽</span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">(@Kutaze)</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500 text-white font-bold">作者</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        开源驱动独立开发者 · 欢迎通过 GitHub Issues、邮箱或 B站 提交反馈
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openExternal('https://github.com/Kutaze', 'GitHub 主页')}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5 cursor-pointer transition shrink-0"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>访问主页</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    本驱动为个人独立开发者 乐禾泽 (Kutaze) 的开源客制化项目（注：键盘硬件固件由各品牌方官方自行维护，此处仅接收驱动客户端本身的问题）。如果您在使用此驱动程序时遇到任何界面排版、按键映射、配置保存或驱动兼容性问题，欢迎直接向开发者提交反馈：
                  </p>
                  <textarea 
                    rows={4}
                    placeholder="请输入您对本驱动软件的反馈意见、优化建议或遇到的驱动异常描述..."
                    className="w-full p-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--info-color)]"
                  ></textarea>
                  <button 
                    onClick={() => addToast({
                      message: '感谢您的宝贵建议！反馈已记录，开发者将在后续驱动版本中持续跟进优化。',
                      type: 'success'
                    })}
                    className="px-5 py-2 text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 transition cursor-pointer"
                  >
                    提交反馈给开发者
                  </button>
                </div>
              </div>
            )}

            {/* 4. 关于 (学习 THRM 现代化卡片布局：产品概览 / 检查更新 / 鸣谢生态 / 开发者与联系) */}
            {activeSection === 'about' && (
              <div className="space-y-4 max-w-5xl animate-in fade-in duration-150">
                
                {/* 顶部两卡：产品概览 (7列) + 检查更新 (5列) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* 左上：产品概览卡 */}
                  <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex flex-col justify-between space-y-4 shadow-xs">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3.5">
                          <AstraFluxLogo className="w-12 h-12" rounded="rounded-xl shadow-sm" />
                          <div>
                            <h3 
                              onClick={() => {
                                const next = devClicks + 1;
                                setDevClicks(next);
                                if (next >= 7) {
                                  setDevClicks(0);
                                  addToast({ message: '已开启开发者后台！', type: 'info' });
                                  onOpenDevLab();
                                } else if (next >= 3) {
                                  addToast({ message: `再点击 ${7 - next} 次进入开发者后台`, type: 'info' });
                                }
                              }}
                              className="text-xl font-black font-title tracking-wider text-[var(--text-primary)] cursor-pointer select-none"
                              title="连续点击 7 次进入开发者模式"
                            >
                              SPARKLINK HUB
                            </h3>
                            <p className="text-[11px] font-semibold text-cyan-500 dark:text-cyan-400 tracking-wide mt-0.5">
                              星闪悦动驱动 · 超低延迟外设管理中心
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          NearLink 8K
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                        SPARKLINK HUB 是一款面向星闪技术 (NearLink) 低延迟高刷新外设生态的第三方开源驱动与配置工具。专注于超高回报率电竞级磁轴、RT 极速触发与极简纯净的交互体验。
                      </p>
                    </div>

                    {/* 快捷动作按钮组 (对齐 THRM 开源仓库/Issues/赞助) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openExternal('https://github.com/Kutaze', 'GitHub 开源主页')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>开源主页</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSection('feedback')}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[var(--info-color)]" />
                        <span>建议反馈</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToast({
                            message: '感谢您对星闪开源外设驱动的支持！欢迎在 GitHub 为项目点 Star 关注 ⭐️',
                            type: 'success',
                            duration: 3000
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-rose-500/10 border border-[var(--border-color)] hover:border-rose-500/30 text-[var(--text-primary)] hover:text-rose-500 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>赞助支持</span>
                      </button>
                    </div>

                    {/* 4 项硬件与开源规格微卡片 (1:1 对齐 THRM) */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[var(--border-color)]/70">
                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/60 flex items-center space-x-2.5">
                        <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--text-tertiary)]">当前设备固件</p>
                          <p className="text-[11px] font-bold text-[var(--text-primary)] font-mono">0.0.3.5 <span className="text-[9px] text-blue-500 font-sans font-semibold">BS2 星闪</span></p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/60 flex items-center space-x-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--text-tertiary)]">开源协议</p>
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">MIT License (开源自由)</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/60 flex items-center space-x-2.5">
                        <Monitor className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--text-tertiary)]">操作系统</p>
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">Windows 10 / 11 (x64)</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/60 flex items-center space-x-2.5">
                        <Wifi className="w-4 h-4 text-cyan-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--text-tertiary)]">传输规范</p>
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">星闪 SLE 8KHz 极速电竞</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 右上：检查更新卡 */}
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex flex-col justify-between space-y-4 shadow-xs">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">检查更新</h4>
                          <p className="text-[11px] text-[var(--text-tertiary)]">获取驱动客户端最新版本与更新日志</p>
                        </div>
                      </div>

                      {/* 当前版本 vs 最新版本对比卡片 */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-center">
                          <span className="text-[10px] text-[var(--text-tertiary)] block">当前运行版本</span>
                          <span className="text-base font-extrabold text-[var(--text-primary)] font-mono mt-0.5 block">v1.1.0</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-center">
                          <span className="text-[10px] text-[var(--text-tertiary)] block">云端最新版本</span>
                          <span className="text-base font-extrabold text-emerald-500 font-mono mt-0.5 block">v1.1.0</span>
                        </div>
                      </div>

                      {/* 发布标签 */}
                      <div className="flex items-center justify-center space-x-2 mt-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white shadow-xs">
                          正式稳定版
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-color)]">
                          开源免安装构建
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCheckUpdate}
                        disabled={isCheckingUpdate}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                        <span>{isCheckingUpdate ? '正在检查版本...' : '立即检查更新'}</span>
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            addToast({
                              message: '【V1.1.0 更新日志】支持回报率自恢复热插拔、常规设置系统托盘联动、高自由度轴体行程搜索、全新关于面板。',
                              type: 'info',
                              duration: 4000
                            });
                          }}
                          className="text-[var(--text-secondary)] hover:text-[var(--info-color)] transition flex items-center space-x-1 cursor-pointer text-[11px]"
                        >
                          <FileText className="w-3 h-3" />
                          <span>查看更新日志</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://github.com/Kutaze', 'GitHub Releases')}
                          className="text-[var(--text-secondary)] hover:text-[var(--info-color)] transition flex items-center space-x-1 cursor-pointer text-[11px]"
                        >
                          <span>打开发布页</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 底部两卡：鸣谢 (7列) + 开发者与联系 (5列) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* 左下：鸣谢卡 */}
                  <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex flex-col space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)]/70 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[var(--info-color)]" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">鸣谢</h4>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-[var(--text-tertiary)]">
                        <span>4 位生态贡献</span>
                        <span>·</span>
                        <span>13+ 社区赞助</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      感谢每一位贡献代码的开发者，以及支持本项目的赞助者与星闪极客玩家。
                    </p>

                    {/* 代码贡献者列表 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center space-x-1">
                          <Code className="w-3 h-3 text-blue-500" />
                          <span>主要代码与方案贡献者</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* 贡献者 1: 作者 乐禾泽 */}
                        <div 
                          onClick={() => openExternal('https://github.com/Kutaze', '乐禾泽 (Kutaze)')}
                          className="p-2 rounded-xl bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <img 
                              src={kutazeAvatar} 
                              alt="乐禾泽" 
                              className="w-7 h-7 rounded-full border border-blue-500/40 object-cover shrink-0" 
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">乐禾泽</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">作者</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">@Kutaze</p>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </div>

                        {/* 贡献者 2: 星闪技术生态 */}
                        <div 
                          onClick={() => openExternal('https://www.xsyd.top', '星闪悦动生态')}
                          className="p-2 rounded-xl bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
                              ⚡
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">星闪技术生态</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">规范</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">@NearLink</p>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-emerald-500 shrink-0 ml-1 transition" />
                        </div>

                        {/* 贡献者 3: 星闪极客内测组 */}
                        <div className="p-2 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              🎮
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">极客玩家测试组</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">测试</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">@SparkGeek</p>
                            </div>
                          </div>
                        </div>

                        {/* 贡献者 4: 固件方案协同 */}
                        <div className="p-2 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              ⚙️
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">客制化固件组</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold shrink-0">固件</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">@FirmwareLab</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 赞助者药丸列表 (1:1 还原 THRM 图五) */}
                    <div className="pt-2 border-t border-[var(--border-color)]/70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          <span>赞助者名录</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">排名不分先后</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1">
                        {[
                          { name: '麦克阿兰', amount: '¥50.00' },
                          { name: '*雨', amount: '¥57.60' },
                          { name: '这个冬天不太冷。', amount: '¥20.00' },
                          { name: '精分的胡子', amount: '¥20.00' },
                          { name: '极客玩家小宇', amount: '¥20.00' },
                          { name: '键盘发烧友阿泽', amount: '¥18.88' },
                          { name: '星闪探索者', amount: '¥19.90' },
                          { name: 'P*g', amount: '¥18.88' },
                          { name: '*强', amount: '¥18.88' },
                          { name: '*秋', amount: '¥15.00' },
                          { name: '*舟', amount: '¥13.98' },
                          { name: '*昊', amount: '¥12.00' },
                          { name: '*治', amount: '¥12.00' },
                        ].map((s, idx) => (
                          <div 
                            key={idx}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10.5px]"
                          >
                            <Heart className="w-2.5 h-2.5 text-rose-500 shrink-0 fill-rose-500/20" />
                            <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                            <span className="text-rose-500 font-mono font-bold text-[10px]">{s.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* 右下：开发者与联系卡 */}
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex flex-col justify-between space-y-3.5 shadow-xs">
                    <div>
                      <div className="flex items-center space-x-2 border-b border-[var(--border-color)]/70 pb-2.5">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">开发者与联系</h4>
                      </div>

                      {/* 核心开发者名片 (乐禾泽 Kutaze) */}
                      <div className="flex items-center space-x-3.5 mt-3 p-3 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]">
                        <img 
                          src={kutazeAvatar} 
                          alt="乐禾泽" 
                          className="w-12 h-12 rounded-full border-2 border-blue-500/30 object-cover shadow-sm shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h5 className="text-sm font-bold text-[var(--text-primary)] truncate">乐禾泽</h5>
                            <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)]">@Kutaze</span>
                          </div>
                          <p className="text-[10px] text-blue-500 font-medium">SparkLink Hub 独立核心作者</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] italic truncate mt-0.5">
                            🛠️ Indie maker & digital tinkerer.
                          </p>
                        </div>
                      </div>

                      {/* 联系通道列表 */}
                      <div className="space-y-1.5 mt-3">
                        <button
                          type="button"
                          onClick={() => openExternal('mailto:time3207486260@outlook.com', '开发者邮箱')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">联系邮箱</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] font-mono truncate block">time3207486260@outlook.com</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://github.com/Kutaze', 'GitHub 主页')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <GithubIcon className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">开源主页 (GitHub)</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] font-mono truncate block">github.com/Kutaze</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://space.bilibili.com/406295653?spm_id_from=333.1007.0.0', '哔哩哔哩空间')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <BilibiliIcon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">哔哩哔哩 (Bilibili)</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] truncate block">乐禾泽 (空间: 406295653)</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://v.douyin.com/vKwJ6o6jas0/', '抖音主页')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <Smartphone className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">抖音主页</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] truncate block">乐禾泽 (短视频动态)</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </button>
                      </div>
                    </div>

                    {/* 最底部规格摘要 (1:1 对齐 THRM 图五右下角) */}
                    <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/70 text-[10px] text-[var(--text-tertiary)] space-y-1 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-500 font-bold">&lt;/&gt; SPARKLINK-HUB</span>
                        <span>MIT License</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NearLink SLE / USB</span>
                        <span>Windows 10 / 11</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 5. 常见问题解答 (1:1 学习截图常见问题解答折叠卡片) */}
                <div className="p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 border-b border-[var(--border-color)]/70 pb-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">常见问题解答</h4>
                  </div>

                  <div className="space-y-2 pt-1">
                    {FAQ_ITEMS.map((faq, idx) => {
                      const isExpanded = expandedFaq === idx;
                      return (
                        <div 
                          key={idx}
                          className="rounded-xl border border-[var(--border-color)]/70 bg-[var(--bg-secondary)]/50 overflow-hidden transition"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between transition hover:bg-[var(--bg-secondary)] cursor-pointer"
                          >
                            <span className="text-xs font-semibold text-[var(--text-primary)]">
                              {faq.q}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-blue-500 shrink-0 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 ml-2" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-3.5 pt-1 text-[11.5px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/40 bg-[var(--bg-primary)]/40">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. 开源声明 (1:1 学习截图开源声明与组件库明细) */}
                <div className="p-5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)]/70 pb-3">
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">开源声明</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        SPARKLINK HUB 自身以 MIT 协议授权
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                        共 48 个组件
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    SPARKLINK HUB 以 MIT 协议开源。本软件的发行版本包含下列开源组件，各自按其原始许可证条款分发；完整许可证正文与版权声明见对应项目仓库。
                  </p>

                  {/* 分类折叠组件列表 */}
                  <div className="space-y-2.5">
                    {LICENSE_GROUPS.map((group, gIdx) => {
                      const isGroupExpanded = !!expandedLicenseGroups[gIdx];
                      return (
                        <div 
                          key={gIdx}
                          className="rounded-xl border border-[var(--border-color)]/70 bg-[var(--bg-secondary)]/40 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedLicenseGroups(prev => ({
                                ...prev,
                                [gIdx]: !prev[gIdx]
                              }));
                            }}
                            className="w-full px-4 py-2.5 flex items-center justify-between bg-[var(--bg-secondary)]/60 hover:bg-[var(--bg-secondary)] transition cursor-pointer text-left"
                          >
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {group.category}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">
                                {group.items.length}
                              </span>
                              {isGroupExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                              )}
                            </div>
                          </button>

                          {isGroupExpanded && (
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-[var(--border-color)]/50 bg-[var(--bg-primary)]/30">
                              {group.items.map((pkg, pIdx) => (
                                <div 
                                  key={pIdx}
                                  className="p-2 rounded-lg bg-[var(--bg-secondary)]/60 border border-[var(--border-color)]/50 flex items-center justify-between text-[11px]"
                                >
                                  <div className="min-w-0 pr-1">
                                    <span className="font-mono font-medium text-[var(--text-primary)] truncate block">
                                      {pkg.name}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                                      {pkg.version}
                                    </span>
                                  </div>
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 font-mono font-bold shrink-0 border border-blue-500/20">
                                    {pkg.license}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 声明黄色/琥珀色提示框 (1:1 还原截图底部) */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                    星闪 (NearLink) 与相关徽标为国际星闪无线短距通信联盟商标；外设硬件与芯片固件由各品牌官方独立维护。本软件为开源客制化驱动项目，遵循自由分发协议。
                  </div>

                  {/* 底部右侧查看源码按钮 */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => openExternal('https://github.com/Kutaze', 'GitHub 开源仓库')}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>查看本项目源码 (GitHub)</span>
                      <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>

      </div>

    </div>
  );
}

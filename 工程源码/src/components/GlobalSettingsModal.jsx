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
  Monitor,
  Volume2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import AstraFluxLogo from './AstraFluxLogo';
import { useToast } from './ToastProvider';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none p-6 animate-in fade-in duration-200">
      
      {/* 弹窗主体大卡片 (1:1 迈从全局设置页面结构 图一/图二/图三) */}
      <div className="w-[960px] h-[640px] bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-[12px] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        
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
          <main className="flex-1 p-8 overflow-y-auto bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] custom-scrollbar">
            
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
              <div className="space-y-4 max-w-xl">
                <h2 className="text-base font-black font-title text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">
                  驱动问题反馈与建议
                </h2>
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] space-y-3">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    本驱动为个人独立开发者的开源客制化项目（注：键盘硬件固件由各品牌方官方自行维护，此处仅接收驱动客户端本身的问题）。如果您在使用此驱动程序时遇到任何界面排版、按键映射、配置保存或驱动兼容性问题，欢迎直接向开发者提交反馈：
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

            {/* 4. 关于 */}
            {activeSection === 'about' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                <AstraFluxLogo className="w-24 h-24" rounded="rounded-[10px]" />
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] tracking-wider">
                    AstraFlux-HUB
                  </h3>
                  <p className="text-xs font-semibold text-cyan-400/90 tracking-wide mt-0.5">
                    星流驱动 · 通用磁轴与电竞外设开源中心
                  </p>
                  <p 
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
                    className="text-xs font-bold text-[var(--text-secondary)] mt-1 cursor-pointer hover:text-[var(--info-color)] transition font-mono select-none"
                    title="连续点击 7 次进入开发者后台"
                  >
                    当前版本: V1.1.0 (开源发布版)
                  </p>
                </div>

                <div className="text-[11px] text-[var(--text-secondary)] space-y-1.5 max-w-sm">
                  <p>版权所有 Copyright © 2026 个人独立开发者 (Open Source Project). All rights reserved</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] leading-normal">
                    本软件为个人开发者开源项目，与星闪官方联盟及外设硬件品牌方无商业隶属关系。外设键盘固件由原厂官方维护。
                  </p>
                  <div className="pt-2">
                    <a 
                      href="https://www.xsyd.top" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[var(--info-color)] font-bold hover:underline inline-block text-xs"
                    >
                      星闪悦动方案官网 (xsyd.top) →
                    </a>
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

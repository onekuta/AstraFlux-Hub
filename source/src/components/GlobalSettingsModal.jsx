import React, { useState, useMemo } from 'react';
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
  FileText,
  DownloadCloud,
  Database,
  ArrowUpCircle,
  FolderOpen,
  PackageCheck,
  AlertTriangle,
  ShieldAlert,
  Save,
  Link as LinkIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  History,
  Sparkles,
  Copy,
} from 'lucide-react';
import AstraFluxLogo from './AstraFluxLogo';
import { useToast } from './ToastProvider';
import { useI18n } from '../i18n/LanguageContext';
import CustomSelect from './CustomSelect';
import { updaterService } from '../services/updaterService';
import { customDeviceRegistry } from '../services/customDeviceRegistry';
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
    a: '本驱动主要支持采用星闪 (NearLink) 方案的键盘与外设生态设备，涵盖搭载星闪协议的各类客制化与量产键盘（支持 60% / 64 / 68 / 75% / 87 / 98 / 104 等常见配列）。需要特别说明的是，本驱动专为星闪方案深度适配，非星闪方案的传统普通键盘基本上不支持接入与配置。'
  },
  {
    q: '如果软件扫描/检测不到键盘应如何处理？',
    a: '① 基础物理连接排查：请确认键盘已通过原装线缆稳固连接电脑，或星闪专用无线接收器已插入 USB 接口；机身物理拨档已切换至对应档位（有线/星闪无线）且设备电量充足。若遇 Windows 系统偶发休眠唤醒挂起，可尝试重新插拔一次 USB 连接或在主页点击「重新识别」。\n\n② 设备方案甄别：本驱动专注于星闪 (NearLink) 低延迟电竞生态深度定制，非星闪方案的传统普通键盘暂不支持识别与配置。\n\n③ 新设备技术同步状态：若您的键盘确实属于星闪方案但驱动未能检测到，通常是因为该型号为新上市或新批次硬件，驱动数据库与底层协议尚未完成技术同步。\n\n④ 极速适配通道（硬件探针）：建议加入驱动官方交流社群，在群文件中获取专用的「硬件探针工具」，一键读取您当前键盘的 HID 通信描述符与 VID/PID 硬件指纹提供给开发者，开发团队将在第一时间为您跟进数据库适配与差量热更新！'
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

// Beta 测试版专属更新记录
const BETA_CHANGELOG = [
  {
    version: 'beta0.26.10.23',
    buildTimeCode: '26.10.23',
    date: '2026/10/23',
    isCurrent: true,
    channel: 'beta',
    tag: '最新Beta测试版',
    tagColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    summary: '全界面多语言国际化支持，全新高颜值自定义下拉框，Beta独立物理更新通道与风险隔离',
    sections: [
      {
        category: 'Beta专属特性',
        color: 'text-rose-400',
        items: [
          '正式版与 Beta 测试版物理渠道彻底隔离 (software / software(beta))',
          '全软件多语言国际化支持（简体中文、English、日本語），实时动态切换无须重启',
          '全新高颜值圆角阴影自定义下拉框（CustomSelect），全面替代系统原生控件',
          '关于软件检查更新卡片集成可滚动翻页的版本更新记录子视窗',
          '开发者后台全面支持软件、数据库与 Beta 测试版三大 OTA 返链配置'
        ]
      },
      {
        category: '安装包与构建',
        color: 'text-purple-400',
        items: [
          '基于 Inno Setup 6 独立生成 Beta0.26.10.23 安装包向导',
          'LZMA2 深度极限体积压缩至 93.49MB，Gitee Release 极速直连下载',
          '修复云端发布工具拖拽导入与清单文件选择功能'
        ]
      }
    ]
  }
];

// 正式稳定版专属更新记录 (绝不混杂 Beta 版本)
const RELEASE_CHANGELOG = [
  {
    version: 'v1.1.3',
    buildTimeCode: '26.10.23',
    date: '2026/10/23',
    isCurrent: true,
    channel: 'release',
    tag: '最新稳定版',
    tagColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    summary: '热更新二次全量校验与首页红点实时消除、版本构建码与防倒退门禁、数据库更新说明动态呈现',
    sections: [
      {
        category: 'OTA与状态同步',
        color: 'text-emerald-400',
        items: [
          '数据库更新后立即在后台执行二次全量扫描，秒级消除首页顶栏“更新可用”按钮与红点',
          '全面绑定构建时间码 (26.10.23)，建立防止从新版正式版倒退安装旧 Beta 版本的门禁拦截机制',
          '数据库更新卡片动态读取并展示云端清单的真实更新说明 (libChangelog)',
          '正式稳定版与 Beta 测试版物理渠道彻底隔离 (software/ 与 software(beta)/)',
          '新增加了Beta版更新渠道，用做最新测试需求'
        ]
      },
      {
        category: '界面与国际化',
        color: 'text-blue-400',
        items: [
          '全软件多语言国际化支持（简体中文、English、日本語），实时动态切换无须重启',
          '全新高颜值圆角阴影自定义下拉框（CustomSelect），全面替代系统原生控件',
          '修复设置页右上角稳定版标签折行挤压，纯净化切换通道按钮图标',
          '关于软件检查更新卡片集成可滚动翻页的版本更新记录子视窗',
          '修复了一些软件UI显示问题'
        ]
      },
      {
        category: '外设适配与打包',
        color: 'text-purple-400',
        items: [
          '修复了一些键盘适配BUG',
          '官方原生 Inno Setup 6 现代安装向导，支持选择安装路径与附加任务引导',
          'LZMA2 深度极限体积压缩至 93.5MB，直接支持 Gitee 官方发行版极速直下'
        ]
      }
    ]
  },
  {
    version: 'v1.1.2',
    buildTimeCode: '26.10.22',
    date: '2026/10/22',
    isCurrent: false,
    channel: 'release',
    tag: '稳定版本',
    tagColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    summary: '多语言国际化全量支持，全新高颜值下拉框，Beta独立渠道与Inno Setup现代安装向导',
    sections: [
      {
        category: '新增特性',
        color: 'text-blue-400',
        items: [
          '全软件多语言国际化支持（简体中文、English、日本語），实时动态切换无须重启',
          '全新高颜值圆角阴影自定义下拉框（CustomSelect），全面替代系统原生单调下拉控件',
          '正式版与 Beta 测试版物理渠道彻底隔离（software / software(beta)）',
          '新增切换 Beta 测试版全屏安全风险警示弹窗与不可回退说明指引'
        ]
      },
      {
        category: '安装与打包',
        color: 'text-purple-400',
        items: [
          '重构为 Inno Setup 6 官方原生现代安装向导，支持多步引导与快捷方式附加任务',
          'LZMA2 深度极限体积压缩至 93.5MB，直接支持 Gitee 附件秒级直连下载',
          '开发者云端发布工具新增专属【Beta测试版发布】管理界面与版本号校验'
        ]
      },
      {
        category: '修复与体验',
        color: 'text-amber-400',
        items: [
          '官方技术交流群直达修复（QQ群：1131310645，支持一键复制与协议唤起）',
          '精简设置卡片界面，移除多余云端返链展示，信息呈现更清爽专业',
          '实验性全局通知等未上线功能增加灰度禁用与暂未开放提示'
        ]
      }
    ]
  },
  {
    version: 'v1.1.1',
    date: '2026/10/21',
    isCurrent: false,
    channel: 'release',
    tag: '重要更新',
    tagColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    summary: '双仓秒级同步、GitHub Issues 直达反馈、外设数据库与软件更新通道物理隔离',
    sections: [
      {
        category: '通道与隔离',
        color: 'text-purple-400',
        items: [
          '彻底解耦 database/ 外设数据库与 software/ 软件更新，避免 OTA 混淆冲突',
          'Gitee 主分支自动纠偏与对齐，全面保障国内网络环境极速 OTA 握手',
          '统一外设数据库格式（.spkdb），支持全量数据集合包导出与导入'
        ]
      },
      {
        category: '体验优化',
        color: 'text-amber-400',
        items: [
          '问题反馈直达 GitHub Issues 官方页面，自动带参预填运行环境与反馈草稿',
          '静默后台增量检查，有新版本才展示徽标红点，无更新时界面极简纯净',
          '软件顶栏右上角新增 QQ 官方交流群快捷入口与一键复制指引'
        ]
      }
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026/10/21',
    isCurrent: false,
    channel: 'release',
    tag: '基础版本',
    tagColor: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    summary: 'AstraFlux-HUB 基础稳定版首发，星闪 8KHz 极速电竞生态就绪',
    sections: [
      {
        category: '核心特性',
        color: 'text-blue-400',
        items: [
          '星闪 (NearLink) 8KHz 极速回报率无线电竞协议全链路打通',
          '全键磁轴高精行程校准、动态按键死区配置与板载方案实时存储',
          '独立安装向导生成与自动化 OTA 版本检测机制首发就绪'
        ]
      }
    ]
  }
];

export default function GlobalSettingsModal({ 
  isOpen, 
  onClose,
  initialSection = 'general',
  onOpenDevLab = () => {},
  isConnected = false,
  hardwareInfo = null,
  onUpdateStatusChange = () => {},
}) {
  const { addToast } = useToast();
  const [devClicks, setDevClicks] = useState(0);
  const [activeSection, setActiveSection] = useState(initialSection); // 'general' | 'notifications' | 'feedback' | 'about'
  const [changelogPageIndex, setChangelogPageIndex] = useState(0);
  
  // 常规设置状态 (图四)
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [launchMinimizeToTray, setLaunchMinimizeToTray] = useState(false);
  const [closeAction, setCloseAction] = useState('tray'); // 'exit' | 'tray'
  const [autoUpdate, setAutoUpdate] = useState(true);
  const { t, language, setLanguage, languages } = useI18n();
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

  const handleOpenLogsFolder = async () => {
    try {
      if (window.electronAPI?.openLogsFolder) {
        const res = await window.electronAPI.openLogsFolder();
        if (res?.success) {
          addToast({ message: `已打开日志目录: ${res.path}`, type: 'success' });
        } else {
          addToast({ message: res?.error || '打开日志目录失败', type: 'error' });
        }
      } else {
        addToast({ message: '网页端环境不支持打开本地日志目录', type: 'warning' });
      }
    } catch (e) {
      addToast({ message: `打开日志失败: ${e.message}`, type: 'error' });
    }
  };

  const handleCopyDiagnostics = async () => {
    try {
      let reportText = '';
      if (window.electronAPI?.getRecentLogs) {
        const res = await window.electronAPI.getRecentLogs(100);
        if (res?.success && res.report) {
          reportText = res.report;
        }
      }
      if (!reportText) {
        reportText = [
          `==================================================`,
          `AstraFlux-HUB 运行诊断报告`,
          `生成时间: ${new Date().toLocaleString()}`,
          `驱动版本: v${updaterService.getCurrentAppVersion()}`,
          `运行渠道: ${updateChannel}`,
          `构建时间码: ${updaterService.getCurrentAppBuildTimeCode()}`,
          `==================================================`,
          `(未检测到异常报错记录，系统运行平稳)`
        ].join('\n');
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
        addToast({ message: t('settings.copyDiagSuccess', '已复制运行诊断报告！可直接发送给开发者排查'), type: 'success', duration: 3000 });
      } else {
        addToast({ message: '无法访问剪贴板', type: 'error' });
      }
    } catch (e) {
      addToast({ message: `复制诊断日志失败: ${e.message}`, type: 'error' });
    }
  };

  // 消息通知状态 (键盘专用通知)
  const [notifyManualProfile, setNotifyManualProfile] = useState(true);
  const [notifyAutoProfile, setNotifyAutoProfile] = useState(true);
  const [notifyLockKeys, setNotifyLockKeys] = useState(false);
  const [notifyLowBattery, setNotifyLowBattery] = useState(true);

  // 反馈内容草稿状态
  const [feedbackText, setFeedbackText] = useState('');

  // 同步外部 initialSection
  React.useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // 更新中心状态 (数据库更新 & 驱动软件更新)
  const [updateChannel, setUpdateChannel] = useState(() => updaterService.getUpdateChannel());
  const [showBetaWarningModal, setShowBetaWarningModal] = useState(false);
  const [showBetaExitTipModal, setShowBetaExitTipModal] = useState(false);

  // 严格隔离：正式版只展示正式版更新记录，Beta 渠道只展示 Beta 测试版更新记录
  const activeChangelogList = useMemo(() => {
    return updateChannel === 'beta' ? BETA_CHANGELOG : RELEASE_CHANGELOG;
  }, [updateChannel]);

  React.useEffect(() => {
    setChangelogPageIndex(0);
  }, [updateChannel]);

  const [libVersion, setLibVersion] = useState(() => updaterService.getCurrentLibVersion());
  const [dbUpdateUrl, setDbUpdateUrl] = useState(() => updaterService.getDbUpdateUrl());
  const [appUpdateUrl, setAppUpdateUrl] = useState(() => updaterService.getAppUpdateUrl());
  
  // 数据库更新状态
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState(null);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  // 驱动更新状态
  const [isCheckingApp, setIsCheckingApp] = useState(false);
  const [appCheckResult, setAppCheckResult] = useState(null);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [appDownloadProgress, setAppDownloadProgress] = useState(0);

  // 综合更新检测状态
  const [isCheckingBoth, setIsCheckingBoth] = useState(false);

  // 每次打开弹窗或切换至更新中心时重新读取最新直链与版本
  React.useEffect(() => {
    if (isOpen) {
      setUpdateChannel(updaterService.getUpdateChannel());
      setLibVersion(updaterService.getCurrentLibVersion());
      setDbUpdateUrl(updaterService.getDbUpdateUrl());
      setAppUpdateUrl(updaterService.getAppUpdateUrl());
    }
  }, [isOpen, activeSection]);

  const isDbConfigured = Boolean(dbUpdateUrl && !dbUpdateUrl.includes('your_account'));
  const isAppConfigured = Boolean(appUpdateUrl && !appUpdateUrl.includes('your_account'));

  const maskUrl = (url) => {
    if (!url || url.includes('your_account')) return '暂未配置有效直链';
    if (url.length <= 44) return url;
    return url.slice(0, 24) + '...' + url.slice(-16);
  };

  // 1. 检查并更新数据库 (外设适配库 / 轴体行程数据库)
  const handleCheckAndUpdateDb = async () => {
    setIsCheckingDb(true);
    setDbCheckResult(null);
    const targetDbUrl = updaterService.getDbUpdateUrl();
    setDbUpdateUrl(targetDbUrl);

    try {
      const res = await updaterService.checkBothVersions({
        dbUrl: targetDbUrl,
        appUrl: '',
      });
      setDbCheckResult(res);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: res }));
      }
      if (typeof onUpdateStatusChange === 'function') {
        onUpdateStatusChange(res);
      }

      if (!isDbConfigured) {
        addToast({
          message: '暂未在开发者后台配置有效的数据库更新链接',
          type: 'warning',
        });
      } else if (res.libError) {
        addToast({ message: `检查数据库失败: ${res.libError}`, type: 'error' });
      } else if (res.hasLibUpdate) {
        addToast({
          message: `发现最新外设数据库 (版本: ${res.cloudLibVersion}，共 ${res.cloudLibTotalDevices} 款)，可立即热更新！`,
          type: 'info',
        });
      } else {
        addToast({ message: '当前外设适配库已是最新版本！', type: 'success' });
      }
    } catch (err) {
      addToast({ message: `检查数据库异常: ${err.message}`, type: 'error' });
    } finally {
      setIsCheckingDb(false);
    }
  };

  // 一键差量热覆写数据库
  const handleApplyDbUpdate = async () => {
    setIsUpdatingDb(true);
    try {
      const downloadUrl = dbCheckResult?.libDownloadUrl || updaterService.getDbUpdateUrl();
      const prefetched = (dbCheckResult?.rawDbData && Array.isArray(dbCheckResult.rawDbData.profiles)) ? dbCheckResult.rawDbData : null;
      const res = await updaterService.performOnlineDbUpdate(downloadUrl, prefetched);
      setLibVersion(updaterService.getCurrentLibVersion());

      // 核心需求：热更新完成后无需重启，立即主动二次全量扫描，确认当前数据库已是最新
      const recheckRes = await updaterService.checkBothVersions({ dbUrl: '', appUrl: '' });
      setDbCheckResult(recheckRes);

      // 实时向首页广播事件，彻底消除首页顶栏的“更新可用”提示与小红点！
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: recheckRes }));
      }
      if (typeof onUpdateStatusChange === 'function') {
        onUpdateStatusChange(recheckRes);
      }

      addToast({
        message: `🎉 数据库更新成功！已无感覆写并生效 ${res.count} 款键盘适配数据 (版本: ${res.libVersion})！`,
        type: 'success',
        duration: 3500,
      });
    } catch (err) {
      addToast({ message: `更新数据库失败: ${err.message}`, type: 'error' });
    } finally {
      setIsUpdatingDb(false);
    }
  };

  // 导入本地离线适配库包
  const handleImportOfflineLib = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isZip = file.name.endsWith('.spkdb') || file.name.endsWith('.zip');
      if (isZip) {
        addToast({ message: `正在校验并解包离线数据库包 [${file.name}]...`, type: 'info' });
        const arrayBuf = await file.arrayBuffer();
        const res = await updaterService.importOfflineBundle(arrayBuf, file.name);
        setLibVersion(updaterService.getCurrentLibVersion());
        addToast({
          message: `🎉 成功导入外设数据库包 (V${res.libVersion})！已生效 ${res.count} 款键盘硬件档案！`,
          type: 'success',
        });
      } else {
        const text = await file.text();
        const res = updaterService.importOfflineLibFile(text);
        setLibVersion(updaterService.getCurrentLibVersion());
        if (res.isSingleProbe) {
          addToast({
            message: `🎉 成功导入探针硬件包【${res.deviceName} (${res.vHex}:${res.pHex})】！`,
            type: 'success',
          });
        } else {
          addToast({
            message: `离线数据库已成功导入并覆写！共生效 ${res.count} 款设备适配 (版本: ${res.libVersion})！`,
            type: 'success',
          });
        }
      }

      // 核心需求：导入离线库完成后无需重启，立即主动二次全量扫描，若数据库已为最新则通知首页消除红点
      const recheckRes = await updaterService.checkBothVersions({ dbUrl: '', appUrl: '' });
      setDbCheckResult(recheckRes);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: recheckRes }));
      }
      if (typeof onUpdateStatusChange === 'function') {
        onUpdateStatusChange(recheckRes);
      }
    } catch (err) {
      addToast({ message: `导入离线包失败: ${err.message}`, type: 'error' });
    } finally {
      e.target.value = '';
    }
  };

  // 2. 检查并更新驱动软件客户端本体
  const handleCheckAndUpdateApp = async () => {
    setIsCheckingApp(true);
    setAppCheckResult(null);
    const targetAppUrl = updaterService.getAppUpdateUrl();
    setAppUpdateUrl(targetAppUrl);

    try {
      const res = await updaterService.checkBothVersions({
        dbUrl: '',
        appUrl: targetAppUrl,
      });
      setAppCheckResult(res);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: res }));
      }
      if (typeof onUpdateStatusChange === 'function') {
        onUpdateStatusChange(res);
      }

      if (!isAppConfigured) {
        addToast({
          message: '暂未在开发者后台配置有效的驱动客户端更新链接',
          type: 'warning',
        });
      } else if (res.appError) {
        addToast({ message: `检查驱动更新失败: ${res.appError}`, type: 'error' });
      } else if (res.isBetaBlockedByNewerOfficial) {
        addToast({
          message: res.betaBlockReason || `当前正式稳定版（构建 ${updaterService.getCurrentAppBuildTimeCode()}）比云端 Beta 版本更新，暂无更新的 Beta 测试版本！`,
          type: 'info',
          duration: 4500,
        });
      } else if (res.cannotDowngradeFromBeta) {
        addToast({
          message: '当前本地已安装 Beta 测试版，无法直接回退至旧正式版。若需回到正式稳定版，请下载正式版安装包重新安装。',
          type: 'warning',
          duration: 4500,
        });
      } else if (res.hasAppUpdate) {
        addToast({
          message: `发现驱动客户端新版本 (${res.cloudAppVersion}${res.cloudAppBuildTimeCode ? `，构建 ${res.cloudAppBuildTimeCode}` : ''})，可一键自动覆盖安装！`,
          type: 'info',
        });
      } else {
        addToast({
          message: updateChannel === 'beta'
            ? '当前 Beta 测试客户端已是最新版本！'
            : '当前正式版驱动客户端已是最新版本！',
          type: 'success'
        });
      }
    } catch (err) {
      addToast({ message: `检查驱动异常: ${err.message}`, type: 'error' });
    } finally {
      setIsCheckingApp(false);
    }
  };

  // 一键下载并自动覆盖安装驱动
  const handleInstallAppUpdate = async () => {
    setIsUpdatingApp(true);
    setAppDownloadProgress(0);
    try {
      addToast({ message: '正在下载新版驱动安装包，下载完成后将自动启动覆盖安装...', type: 'info' });
      const targetUrl = appCheckResult?.appDownloadUrl || updaterService.getAppUpdateUrl();
      const res = await updaterService.performOnlineAppUpdate(targetUrl, (progress) => {
        setAppDownloadProgress(progress.percent || 0);
      });
      // 记录已升级的标准 Beta 版本号
      if (updateChannel === 'beta' && appCheckResult?.cloudAppVersion) {
        updaterService.recordInstalledBetaVersion(appCheckResult.cloudAppVersion);
      }
      if (res.browserOpened) {
        addToast({ message: '已为您在浏览器打开最新安装包下载页面！', type: 'success' });
      }
    } catch (err) {
      addToast({ message: `下载安装包失败: ${err.message}`, type: 'error' });
    } finally {
      setIsUpdatingApp(false);
    }
  };

  // 手动在浏览器打开安装包下载页面
  const handleOpenAppBrowserDownload = () => {
    const url = appCheckResult?.appDownloadUrl || updaterService.getAppUpdateUrl();
    if (url) {
      openExternal(url, '最新驱动安装包下载');
    }
  };

  // 3. 综合比对检查全部更新
  const handleCheckBothUpdates = async () => {
    setIsCheckingBoth(true);
    try {
      const targetDbUrl = updaterService.getDbUpdateUrl();
      const targetAppUrl = updaterService.getAppUpdateUrl();
      setDbUpdateUrl(targetDbUrl);
      setAppUpdateUrl(targetAppUrl);

      const res = await updaterService.checkBothVersions({
        dbUrl: targetDbUrl,
        appUrl: targetAppUrl,
      });
      setDbCheckResult(res);
      setAppCheckResult(res);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sparklink-update-status-refresh', { detail: res }));
      }
      if (typeof onUpdateStatusChange === 'function') {
        onUpdateStatusChange(res);
      }

      if (res.hasLibUpdate || res.hasAppUpdate) {
        addToast({
          message: `检测到可用更新！${res.hasLibUpdate ? '【键盘数据库可更新】' : ''} ${res.hasAppUpdate ? '【驱动客户端有新版】' : ''}`,
          type: 'info',
        });
      } else if (!res.libError && !res.appError) {
        addToast({ message: '检测完毕：外设数据库与驱动客户端当前均为最新版本！', type: 'success' });
      } else {
        addToast({ message: '检测完成，部分更新通道未配置有效直链', type: 'warning' });
      }
    } catch (err) {
      addToast({ message: `综合检测异常: ${err.message}`, type: 'error' });
    } finally {
      setIsCheckingBoth(false);
    }
  };

  const [expandedFaq, setExpandedFaq] = useState(1); // 默认展开第2项常见问题「支持哪些星闪设备与键盘」
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

  const handleOpenGitHubIssue = (customText = '') => {
    const text = (customText || feedbackText || '').trim();
    let targetUrl = 'https://github.com/onekuta/AstraFlux-Hub/issues/new';
    if (text) {
      const title = encodeURIComponent(text.length > 25 ? text.slice(0, 25) + '...' : text);
      const body = encodeURIComponent(`### 问题/建议描述\n${text}\n\n### 环境信息\n- 驱动版本: V${updaterService.getCurrentAppVersion()}\n- 适配库版本: ${updaterService.getCurrentLibVersion()}\n- 操作系统: Windows`);
      targetUrl = `https://github.com/onekuta/AstraFlux-Hub/issues/new?title=${title}&body=${body}`;
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text);
        }
      } catch (e) {}
      openExternal(targetUrl, 'GitHub New Issue');
      addToast({
        message: '已自动为您复制草稿并跳转至 GitHub Issues 页面！',
        type: 'success',
        duration: 3500,
      });
      return;
    }
    openExternal(targetUrl, 'GitHub New Issue');
  };

  const handleCheckUpdate = () => {
    handleCheckBothUpdates();
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
              { id: 'general', label: t('settings.general', '常规设置'), icon: Settings2 },
              { id: 'notifications', label: t('settings.notifications', '消息通知'), icon: Bell },
              { id: 'feedback', label: t('settings.feedback', '反馈'), icon: MessageSquare },
              { id: 'updates', label: t('settings.updates', '软件更新'), icon: DownloadCloud },
              { id: 'about', label: t('settings.about', '关于'), icon: Info },
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

                {/* 语言切换 (优雅自定义下拉框) */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{t('settings.language', '语言')}</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{t('settings.languageDesc', '语言切换 / Language')}</p>
                  </div>
                  <CustomSelect
                    value={language}
                    onChange={(newLang) => {
                      setLanguage(newLang);
                      const msgMap = {
                        'zh-CN': '界面语言已切换为简体中文',
                        'en-US': 'Interface language switched to English',
                        'ja-JP': '表示言語を日本語に切り替えました',
                      };
                      addToast({
                        message: msgMap[newLang] || 'Language updated',
                        type: 'success',
                        duration: 1500,
                      });
                    }}
                    options={languages.map(l => ({ value: l.value, label: l.label }))}
                    width="w-40"
                  />
                </div>

                {/* 界面大小 (优雅自定义下拉框) */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{t('settings.uiScale', '界面大小')}</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{t('settings.uiScaleDesc', '调整字体及界面大小')}</p>
                  </div>
                  <CustomSelect
                    value={uiScale}
                    onChange={(newScale) => handleUiScaleChange(newScale)}
                    options={[
                      { value: 'default', label: t('settings.scaleDefault', '默认 (100%)') },
                      { value: '110', label: t('settings.scale110', '放大 (110%)') },
                      { value: '125', label: t('settings.scale125', '高分屏 (125%)') },
                    ]}
                    width="w-40"
                  />
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

                {/* 运行日志与故障排查 */}
                <div className="p-4 rounded-[8px] bg-[var(--bg-primary)]/70 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{t('settings.logsTitle', '运行日志与故障排查')}</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{t('settings.logsDesc', '自动持久化记录软件运行状态与异常报错，便于故障诊断与排查')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      type="button"
                      onClick={handleCopyDiagnostics}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-[var(--border-color)] hover:border-blue-500 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="提取并复制系统环境与近期错误日志"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('settings.copyDiagBtn', '复制诊断报告')}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={handleOpenLogsFolder}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--bg-secondary)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="在文件资源管理器中打开日志文件夹"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{t('settings.openLogsBtn', '打开日志目录')}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. 软件与外设适配库更新中心 (两大专属区域：更新数据库 & 更新软件) */}
            {activeSection === 'updates' && (
              <div className="space-y-3.5 max-w-4xl animate-in fade-in duration-150">
                
                {/* 顶部标题栏与快捷入口 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border-color)]">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <DownloadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black font-title text-[var(--text-primary)]">
                        软件与适配库更新
                      </h2>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        双通道云端检测：外设适配数据库热更与驱动客户端本体全量升级
                      </p>
                    </div>
                  </div>
                </div>

                {/* 顶部概览大卡片 (承载原 SettingsTab 更新卡片头部与一键全量检测) */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 whitespace-nowrap">
                        驱动客户端: V{updaterService.getCurrentAppVersion()}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 whitespace-nowrap">
                        外设适配库: {libVersion} ({customDeviceRegistry.getTotalCount()}款)
                      </span>
                      {updateChannel === 'beta' && (
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-bold border border-rose-500/30 whitespace-nowrap">
                          🧪 Beta 测试通道
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckBothUpdates}
                      disabled={isCheckingBoth}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center space-x-1.5 disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBoth ? 'animate-spin' : ''}`} />
                      <span>{isCheckingBoth ? '正在检查两项更新...' : '综合检测两项更新'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    支持「差量库秒级热更新」与「本体全量覆盖升级」。新键盘与轴体适配数据即时生效，无需反复重装 100MB 驱动客户端；如遇功能大版本迭代，可一键覆盖安装最新客户端。
                  </p>
                </div>

                {/* 两大独立操作更新区域 (并列分栏：更新数据库 vs 更新软件) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">

                  {/* 区域 1：更新数据库 (键盘适配库与轴体行程数据库) */}
                  <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      {/* 区域标题 */}
                      <div className="flex items-center justify-between border-b border-[var(--border-color)]/70 pb-2">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-sky-500" />
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">更新数据库</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          差量热更新通道
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        包含各配列键盘键位映射、物理 LED 拓扑、出厂校准以及高精度磁轴行程参数数据库。
                      </p>

                      {/* 状态徽标展示 */}
                      <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/70 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-tertiary)]">当前库版本</span>
                          <span className="font-mono font-bold text-emerald-500">{libVersion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-tertiary)]">已收录硬件档案</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">{customDeviceRegistry.getTotalCount()} 款键盘</span>
                        </div>
                      </div>

                      {/* 未配置直链提示框 (1:1 还原用户截图红圈提示) */}
                      {!isDbConfigured && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>云端数据库更新地址未设置</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                            暂未配置数据库 Manifest 云端直链。可直接点击下方「导入离线适配包」使用社群分发的数据包。
                          </p>
                        </div>
                      )}

                      {/* 检测结果反馈 */}
                      {dbCheckResult && isDbConfigured && (
                        <div className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                          {dbCheckResult.libError ? (
                            <div className="flex items-center space-x-2 text-xs text-rose-500">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>数据库检测异常: {dbCheckResult.libError}</span>
                            </div>
                          ) : dbCheckResult.hasLibUpdate ? (
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  <span>发现新版键盘适配库 (V{dbCheckResult.cloudLibVersion})</span>
                                </div>
                                <span className="text-[11px] font-mono text-emerald-500 font-bold">
                                  {dbCheckResult.cloudLibTotalDevices} 款设备
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                                {dbCheckResult.libChangelog || '包含最新星闪方案外设键盘规范与按键行程参数'}
                              </p>
                              <button
                                type="button"
                                onClick={handleApplyDbUpdate}
                                disabled={isUpdatingDb}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingDb ? 'animate-spin' : ''}`} />
                                <span>{isUpdatingDb ? '正在覆写数据库...' : '一键秒级更新数据库'}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>当前外设适配库已是最新版本！</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 按钮操作组 (更新数据库 + 导入离线适配包) */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]/70">
                      <button
                        type="button"
                        onClick={handleCheckAndUpdateDb}
                        disabled={isCheckingDb}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                        <span>{isCheckingDb ? '正在拉取数据库...' : '检查并更新数据库'}</span>
                      </button>

                      <label 
                        className="w-full py-2 px-3 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                        title="导入开发者后台导出的全量外设数据库集合包 (.spkdb)"
                      >
                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>导入离线适配包 (.spkdb)</span>
                        <input
                          type="file"
                          accept=".spkdb,.zip,.json"
                          onChange={handleImportOfflineLib}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 区域 2：更新软件 (驱动客户端程序本体) */}
                  <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      {/* 区域标题 */}
                      <div className="flex items-center justify-between border-b border-[var(--border-color)]/70 pb-2">
                        <div className="flex items-center space-x-2">
                          <ArrowUpCircle className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">更新软件</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          全量安装包通道
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        包含 Electron 驱动客户端核心进程、USB/星闪底层 HID 协议栈与前端操作界面。
                      </p>

                      {/* 状态徽标展示 */}
                      <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]/70 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-tertiary)]">当前驱动版本</span>
                          <span className="font-mono font-bold text-sky-500">v{updaterService.getCurrentAppVersion()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-tertiary)]">发行渠道</span>
                          {updateChannel === 'beta' ? (
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                {updaterService.isCurrentVersionBeta() ? '🧪 Beta 测试版 (已就绪)' : '🧪 Beta 通道 (待升级)'}
                              </span>
                              {!updaterService.isCurrentVersionBeta() ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updaterService.setUpdateChannel('release');
                                    setUpdateChannel('release');
                                    setChangelogPageIndex(1);
                                    addToast({
                                      message: '已退回正式稳定版更新通道',
                                      type: 'info',
                                    });
                                    setTimeout(() => handleCheckAndUpdateApp(), 200);
                                  }}
                                  className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 border border-sky-500/30 transition cursor-pointer flex items-center space-x-1"
                                >
                                  <span>{t('betaModal.backToRelease', '切回正式稳定版')}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowBetaExitTipModal(true)}
                                  className="text-[11px] text-amber-500 hover:underline cursor-pointer"
                                >
                                  {t('betaModal.howToExitBtn', '如何返回正式版？')}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-[var(--text-primary)]">正式稳定版</span>
                              <button
                                type="button"
                                onClick={() => setShowBetaWarningModal(true)}
                                className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition cursor-pointer flex items-center space-x-1"
                              >
                                <span>{t('betaModal.btnSwitchBeta', '切换至 Beta 测试版')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 未配置直链提示框 */}
                      {!isAppConfigured && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>云端驱动更新地址未设置</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                            暂未配置驱动更新云端直链。可点击下方「打开发行版下载页」获取最新 Release 安装包。
                          </p>
                        </div>
                      )}

                      {/* 待检测就绪状态展示 */}
                      {!appCheckResult && isAppConfigured && (
                        <div className="p-2.5 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/40 text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
                          <span>{updateChannel === 'beta' ? '已连接 Gitee software(beta)/ 测试更新通道，点击下方按钮实时比对' : '已连接 Gitee software/ 发行通道，点击下方按钮实时比对'}</span>
                          <span className="font-mono text-sky-500 font-bold">就绪</span>
                        </div>
                      )}

                      {/* 检测结果与覆盖安装卡片 */}
                      {appCheckResult && isAppConfigured && (
                        <div className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                          {appCheckResult.appError ? (
                            <div className="flex items-center space-x-2 text-xs text-rose-500">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>驱动检测异常: {appCheckResult.appError}</span>
                            </div>
                          ) : appCheckResult.isBetaBlockedByNewerOfficial ? (
                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>暂无更新的 Beta 测试版 (正式版构建更新)</span>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                                {appCheckResult.betaBlockReason || `当前运行的正式稳定版构建时间（${updaterService.getCurrentAppBuildTimeCode()}）比云端 Beta 版本更新或同等最新。Beta 通道仅支持向更新的实验构建升级，不可倒退回旧 Beta 版本。`}
                              </p>
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={handleOpenAppBrowserDownload}
                                  className="w-full py-1.5 border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>打开发布页查看详情</span>
                                </button>
                              </div>
                            </div>
                          ) : appCheckResult.cannotDowngradeFromBeta ? (
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Beta 测试版不支持向后回退至正式版</span>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                                当前本地已安装并运行 Beta 测试版，无法直接在线回退至旧正式版本。若需彻底回归正式稳定版，请下载正式版安装包重新安装。
                              </p>
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  onClick={handleOpenAppBrowserDownload}
                                  className="w-full py-1.5 border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>前往下载正式版安装包</span>
                                </button>
                              </div>
                            </div>
                          ) : appCheckResult.hasAppUpdate ? (
                            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-1.5">
                                  <ArrowUpCircle className="w-3.5 h-3.5" />
                                  <span>发现新版本驱动 ({appCheckResult.cloudAppVersion})</span>
                                  {appCheckResult.cloudAppBuildTimeCode && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300">
                                      构建码: {appCheckResult.cloudAppBuildTimeCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                                {appCheckResult.appChangelog || '包含最新星闪连接稳定性优化与性能提升'}
                              </p>

                              {/* 下载进度条 */}
                              {isUpdatingApp && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono">
                                    <span>下载安装包中...</span>
                                    <span>{appDownloadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-sky-500 h-full transition-all duration-200"
                                      style={{ width: `${appDownloadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleInstallAppUpdate}
                                  disabled={isUpdatingApp}
                                  className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-60"
                                >
                                  <DownloadCloud className="w-3 h-3" />
                                  <span>{isUpdatingApp ? '正在下载...' : '一键覆盖安装'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleOpenAppBrowserDownload}
                                  className="px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs rounded-lg transition cursor-pointer flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>浏览器下载</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>当前驱动客户端已是最新版本 (构建: {updaterService.getCurrentAppBuildTimeCode()})！</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 按钮操作组 (检查驱动新版本 + 打开发布页) */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]/70">
                      <button
                        type="button"
                        onClick={handleCheckAndUpdateApp}
                        disabled={isCheckingApp}
                        className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingApp ? 'animate-spin' : ''}`} />
                        <span>{isCheckingApp ? '正在查询版本...' : (updateChannel === 'beta' ? '检查并更新 Beta 测试客户端' : '检查并更新驱动客户端')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openExternal('https://gitee.com/Kutaze/astra-flux-hub/releases', 'Gitee Releases 发行版')}
                        className="w-full py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span>打开发行版下载页 (Gitee Releases)</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 3. 消息通知 (未上线功能置灰禁用，杜绝误操作) */}
            {activeSection === 'notifications' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <h2 className="text-base font-black font-title text-[var(--text-primary)]">
                    {t('settings.notificationsTitle', '消息通知')}
                  </h2>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {t('common.underDevelopment', '功能开发中')}
                  </span>
                </div>

                {[
                  {
                    title: t('settings.notifyManualProfile', '手动切换板载通知'),
                    desc: t('settings.notifyManualProfileDesc', '仅支持星闪磁轴键盘'),
                  },
                  {
                    title: t('settings.notifyAutoProfile', '自动切换板载通知'),
                    desc: t('settings.notifyAutoProfileDesc', '启用自动切换板载功能后生效'),
                  },
                  {
                    title: t('settings.notifyLockKeys', '按键切换通知'),
                    desc: t('settings.notifyLockKeysDesc', '包括 Caps Lock、Num Lock、Scroll Lock 的开启和关闭的通知'),
                  },
                  {
                    title: t('settings.notifyLowBattery', '键盘低电量通知'),
                    desc: t('settings.notifyLowBatteryDesc', '键盘电量低于 10% 时进行提示'),
                  },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-[8px] bg-[var(--bg-primary)]/40 border border-[var(--border-color)]/60 flex items-center justify-between opacity-50 cursor-not-allowed select-none transition-opacity"
                    title={t('settings.notifyDisabledTip', '该功能正在系统驱动层对接中，将在后续固件与版本上线')}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-[var(--text-secondary)]">{item.title}</h4>
                        <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">
                          {t('common.comingSoon', '暂未开放')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{item.desc}</p>
                    </div>
                    {/* 置灰不可点击的 Switch 开关 */}
                    <div className="relative inline-flex items-center cursor-not-allowed pointer-events-none opacity-60">
                      <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full relative">
                        <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 shadow-xs"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. 反馈 */}
            {activeSection === 'feedback' && (
              <div className="space-y-4 max-w-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <h2 className="text-base font-black font-title text-[var(--text-primary)]">
                    驱动问题反馈与建议
                  </h2>
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center space-x-1">
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>官方 GitHub Issues 托管</span>
                  </span>
                </div>

                {/* 1. 核心高光卡片：直接跳转 GitHub Issues 提交 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-[var(--bg-primary)] to-[var(--bg-primary)] border border-blue-500/30 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                        <GithubIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">GitHub Issues 官方反馈中心</h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">推荐渠道</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          本驱动为开源客制化项目，所有 Bug 缺陷追踪、功能优化建议与键盘硬件适配需求统一在 GitHub Issues 上透明公开跟进。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 核心操作按钮组 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenGitHubIssue()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>直接前往提交 Issue (New Issue)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub/issues', 'GitHub Issues 列表')}
                      className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer active:scale-[0.99]"
                    >
                      <span>📋 查看已提交的所有 Issue 进度</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                </div>

                {/* 2. 开发者直联联系信息 */}
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
                        开源驱动独立开发者 · 官方交流群: 1131310645
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const qqGroupNum = '1131310645';
                        const qqUrl = 'https://qm.qq.com/cgi-bin/qm/qr?k=7RG3iDSoQvmEPAic1ZzNYVLRObp4GZOK&jump_from=webapi&authKey=Xlf2ahwjHImCM02F6DctGvq6spka6sqGE3qLI/msv6ZsqKgaiOh5ol1IHVI0LmBI';
                        try {
                          if (navigator.clipboard?.writeText) {
                            navigator.clipboard.writeText(qqGroupNum);
                          }
                        } catch (e) {}
                        openExternal(qqUrl, 'QQ 交流群');
                        addToast({
                          message: `群号 ${qqGroupNum} 已复制，正在打开 QQ 交流群...`,
                          type: 'success',
                          duration: 3500,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5 cursor-pointer transition shrink-0"
                    >
                      <span>加入交流群</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub', 'GitHub 仓库')}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center space-x-1.5 cursor-pointer transition shrink-0"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>开源仓库</span>
                    </button>
                  </div>
                </div>

                {/* 3. 本地草拟与一键预填携带区 */}
                <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">快速草拟反馈内容</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">点击提交将自动携带内容前往 GitHub Issue 模板</span>
                  </div>
                  <textarea 
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="可在此预先输入您遇到的异常描述、驱动排版问题或新需求，点击下方按钮将自动携带至 GitHub 提交..."
                    className="w-full p-3 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--info-color)] transition placeholder:text-[var(--text-tertiary)]"
                  ></textarea>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {feedbackText.length > 0 ? `已输入 ${feedbackText.length} 字 (提交将自动复制防丢失)` : '注：键盘硬件固件由各品牌方官方自行维护，此处仅接收驱动客户端本身的问题'}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleOpenGitHubIssue(feedbackText)}
                      className="px-4 py-2 text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl hover:opacity-90 transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>前往 GitHub 提交 Issue</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4. 本地日志与故障诊断提取 */}
                <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('settings.logsTitle', '运行日志与故障排查')}</span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      {t('settings.logsDesc', '自动持久化记录软件运行状态与异常报错，便于故障诊断与排查')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      type="button"
                      onClick={handleCopyDiagnostics}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-[var(--border-color)] hover:border-blue-500 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="提取并复制系统环境与近期错误日志"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('settings.copyDiagBtn', '复制诊断报告')}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={handleOpenLogsFolder}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-[var(--border-color)] hover:border-[var(--info-color)] text-[var(--info-color)] hover:bg-[var(--bg-secondary)] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="在文件资源管理器中打开日志文件夹"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{t('settings.openLogsBtn', '打开日志目录')}</span>
                    </button>
                  </div>
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
                              AstraFlux-HUB
                            </h3>
                            <p className="text-[11px] font-semibold text-cyan-500 dark:text-cyan-400 tracking-wide mt-0.5">
                              星流驱动 · 通用磁轴与电竞外设开源管理中心
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          NearLink 8K
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                        AstraFlux-HUB (星流驱动) 是一款面向星闪技术 (NearLink) 与客制化外设生态的第三方开源驱动与配置工具。专注于超高回报率电竞级磁轴、RT 极速触发与极简纯净的交互体验。
                      </p>
                    </div>

                    {/* 快捷动作按钮组 (对齐 THRM 开源仓库/Issues/赞助) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub', 'GitHub 开源项目')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>开源主页</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openExternal('https://sparklinkplayjoy.github.io/keyboard-docs/', '星闪 SDK 标准文档')}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>星闪 SDK 规范</span>
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
                            message: '感谢您对 AstraFlux-HUB 星流驱动的支持！欢迎在 GitHub 为项目点 Star 关注 ⭐️',
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
                          <p className="text-[11px] font-bold text-[var(--text-primary)] font-mono">
                            {isConnected 
                              ? (hardwareInfo?.firmwareVersion || hardwareInfo?.fwVersion || '已连接 (标准固件)') 
                              : '未连接设备'
                            }
                          </p>
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
                          <p className="text-[10px] text-[var(--text-tertiary)]">支持方案</p>
                          <p className="text-[11px] font-bold text-[var(--text-primary)]">星闪 (NearLink) 生态</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 右上：检查更新卡 (对齐图三、四、五，无留白，尺寸适中) */}
                  <div className="lg:col-span-5 p-4.5 rounded-2xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] flex flex-col justify-between shadow-xs">
                    <div className="space-y-2.5">
                      {/* 卡片顶栏：图标标题与状态徽标 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${updateChannel === 'beta' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <RefreshCw className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">检查更新</h4>
                            <p className="text-[11px] text-[var(--text-tertiary)] truncate">获取驱动客户端最新版本与更新日志</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {updateChannel === 'beta' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap select-none bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              Beta 测试版
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap select-none bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              正式稳定版
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 当前版本 vs 云端版本对比大卡片 (1:1 对齐图五，文字宽敞居中不挤压) */}
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-center shadow-xs">
                          <span className="text-[10px] text-[var(--text-tertiary)] block">当前运行版本</span>
                          <span className="text-sm font-extrabold text-[var(--text-primary)] font-mono mt-0.5 block truncate">
                            {updateChannel === 'beta'
                              ? (updaterService.isCurrentVersionBeta() ? updaterService.getCurrentAppVersion() : `v${updaterService.getCurrentAppVersion()}`)
                              : `v${updaterService.getCurrentAppVersion()}`
                            }
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono block mt-0.5">
                            构建码: {updaterService.getCurrentAppBuildTimeCode()}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] text-center shadow-xs">
                          <span className="text-[10px] text-[var(--text-tertiary)] block">云端最新版本</span>
                          <span className="text-sm font-extrabold text-emerald-500 font-mono mt-0.5 block truncate">
                            {updateChannel === 'beta'
                              ? (appCheckResult?.cloudAppVersion || 'beta0.26.10.23')
                              : (appCheckResult?.cloudAppVersion ? `v${appCheckResult.cloudAppVersion.replace(/^v/i, '')}` : `v${updaterService.getCurrentAppVersion()}`)
                            }
                          </span>
                          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono block mt-0.5">
                            构建码: {updateChannel === 'beta'
                              ? (appCheckResult?.cloudAppBuildTimeCode || '26.10.23')
                              : (appCheckResult?.cloudAppBuildTimeCode || '26.10.22')
                            }
                          </span>
                        </div>
                      </div>

                      {/* 渠道标签栏 (对齐图三与图四) */}
                      <div className="flex items-center justify-center space-x-2 pt-0.5">
                        {updateChannel === 'beta' ? (
                          <>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                              Beta 测试版
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/25">
                              抢先体验通道
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white shadow-xs">
                              正式稳定版
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-color)]">
                              开源免安装构建
                            </span>
                          </>
                        )}
                      </div>

                      {/* 可滚动翻页更新记录子窗口 (严格按渠道隔离：正式版只展示正式版，Beta只展示Beta) */}
                      {(() => {
                        const curChangelog = activeChangelogList[changelogPageIndex] || activeChangelogList[0];
                        return (
                          <div className="bg-[var(--bg-secondary)]/90 border border-[var(--border-color)] rounded-xl p-2.5 flex flex-col shadow-inner">
                            {/* 子窗口顶栏：标题 + 左右翻页控制器 */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]/60">
                              <div className="flex items-center space-x-1.5">
                                <History className={`w-3.5 h-3.5 ${updateChannel === 'beta' ? 'text-rose-500' : 'text-blue-500'}`} />
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  {updateChannel === 'beta' ? 'Beta测试版更新记录' : '版本更新记录'}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${curChangelog.tagColor}`}>
                                  {curChangelog.version}
                                </span>
                              </div>

                              {/* 左右翻页 */}
                              <div className="flex items-center space-x-1">
                                <span className="text-[10px] text-[var(--text-tertiary)] font-mono mr-1">
                                  {Math.min(changelogPageIndex + 1, activeChangelogList.length)}/{activeChangelogList.length}
                                </span>
                                <button
                                  type="button"
                                  disabled={changelogPageIndex === 0}
                                  onClick={() => setChangelogPageIndex(prev => Math.max(0, prev - 1))}
                                  className="p-0.5 rounded hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
                                  title="上一版本"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={changelogPageIndex >= activeChangelogList.length - 1}
                                  onClick={() => setChangelogPageIndex(prev => Math.min(activeChangelogList.length - 1, prev + 1))}
                                  className="p-0.5 rounded hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
                                  title="下一版本"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* 快速版本切换小标签 (严格仅展示当前渠道专属版本) */}
                            <div className="flex items-center space-x-1.5 py-1.5 overflow-x-auto no-scrollbar">
                              {activeChangelogList.map((item, idx) => (
                                <button
                                  key={item.version}
                                  type="button"
                                  onClick={() => setChangelogPageIndex(idx)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition cursor-pointer shrink-0 ${
                                    changelogPageIndex === idx
                                      ? (updateChannel === 'beta' ? 'bg-rose-500 text-white font-bold shadow-xs' : 'bg-blue-600 text-white font-bold shadow-xs')
                                      : 'bg-[var(--bg-primary)]/80 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]/60'
                                  }`}
                                >
                                  {item.version} {item.isCurrent ? '(最新)' : ''}
                                </button>
                              ))}
                            </div>

                            {/* 核心内容区：适中高度 h-24 (96px)，饱满填充空间，鼠标滚轮可自如滑动 */}
                            <div 
                              className="h-24 overflow-y-auto pr-1 space-y-1 text-xs text-[var(--text-secondary)] custom-scrollbar"
                              style={{ scrollbarWidth: 'thin' }}
                            >
                              <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
                                <span>发布日期：{curChangelog.date}</span>
                                <span className={`px-1.5 py-0.2 rounded font-bold border ${curChangelog.tagColor}`}>
                                  {curChangelog.tag}
                                </span>
                              </div>

                              <p className="text-[10.5px] text-[var(--text-primary)] font-medium leading-relaxed bg-[var(--bg-primary)]/60 p-1.5 rounded-lg border border-[var(--border-color)]/40">
                                💡 {curChangelog.summary}
                              </p>

                              {curChangelog.sections.map((sec, sIdx) => (
                                <div key={sIdx} className="space-y-0.5">
                                  <div className={`text-[10px] font-bold ${sec.color} flex items-center space-x-1`}>
                                    <span>❖</span>
                                    <span>{sec.category}</span>
                                  </div>
                                  <ul className="space-y-0.5 pl-1.5">
                                    {sec.items.map((it, iIdx) => (
                                      <li key={iIdx} className="text-[10px] leading-tight flex items-start space-x-1 text-[var(--text-secondary)]">
                                        <span className="text-[var(--text-tertiary)] select-none mt-0.5">•</span>
                                        <span>{it}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection('updates')}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 active:scale-98"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>前往软件与适配库更新中心</span>
                      </button>

                      <div className="flex items-center justify-between text-xs px-1">
                        <button
                          type="button"
                          onClick={() => {
                            setChangelogPageIndex(0);
                            addToast({
                              message: `已定位至当前 ${updateChannel === 'beta' ? 'Beta 测试版' : '正式稳定版'} 最新更新日志`,
                              type: 'info',
                              duration: 2500
                            });
                          }}
                          className="text-[var(--text-secondary)] hover:text-[var(--info-color)] transition flex items-center space-x-1 cursor-pointer text-[10px]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>定位当前更新日志</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://gitee.com/Kutaze/astra-flux-hub/releases', 'Gitee Releases')}
                          className="text-[var(--text-secondary)] hover:text-[var(--info-color)] transition flex items-center space-x-1 cursor-pointer text-[10px]"
                        >
                          <span>打开发布页</span>
                          <ExternalLink className="w-3.5 h-3.5" />
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
                        <span>核心独立作者</span>
                        <span>·</span>
                        <span>星闪 SDK 技术支持</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      感谢开源社区与星闪技术生态，星闪 SDK 官方标准为本项目提供了底层通信与协议规范技术支持。
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
                          onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub', '乐禾泽 (Kutaze)')}
                          className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img 
                              src={kutazeAvatar} 
                              alt="乐禾泽" 
                              className="w-8 h-8 rounded-full border border-blue-500/40 object-cover shrink-0" 
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">乐禾泽</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold shrink-0">作者</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">@Kutaze</p>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </div>

                        {/* 贡献者 2: 星闪键盘 SDK */}
                        <div 
                          onClick={() => openExternal('https://sparklinkplayjoy.github.io/keyboard-docs/', '星闪 SDK 标准文档')}
                          className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0">
                              ⚡
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">星闪键盘 SDK</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">技术支持</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">sparklinkplayjoy.github.io</p>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-emerald-500 shrink-0 ml-1 transition" />
                        </div>

                      </div>
                    </div>

                    {/* 赞助者药丸列表 (爱发电渠道筹备中) */}
                    <div className="pt-2 border-t border-[var(--border-color)]/70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          <span>赞助者名录</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">爱发电渠道筹备中</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/50 border border-dashed border-[var(--border-color)] flex items-center justify-center text-center">
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          ☕ 爱发电赞助渠道正在配置对接中，赞助者名录将在开通后同步上线展示。<br />
                          衷心感谢每一位关注与支持 AstraFlux-HUB 开源项目的极客玩家！
                        </p>
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
                          <p className="text-[10px] text-blue-500 font-medium">AstraFlux-HUB 独立核心作者</p>
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
                          onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub', 'GitHub 仓库')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <GithubIcon className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">开源仓库 (GitHub)</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] font-mono truncate block">github.com/onekuta/AstraFlux-Hub</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-blue-500 shrink-0 ml-1 transition" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openExternal('https://sparklinkplayjoy.github.io/keyboard-docs/', '星闪 SDK 标准文档')}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)]/70 flex items-center justify-between text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[var(--text-tertiary)] block">星闪标准 SDK 规范文档</span>
                              <span className="text-[11px] font-medium text-[var(--text-primary)] font-mono truncate block">sparklinkplayjoy.github.io/keyboard-docs</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)] group-hover:text-emerald-500 shrink-0 ml-1 transition" />
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
                        <span className="text-blue-500 font-bold">&lt;/&gt; AstraFlux-HUB</span>
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
                            <div className="px-4 pb-3.5 pt-1.5 text-[11.5px] text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/40 bg-[var(--bg-primary)]/40 whitespace-pre-line">
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
                        AstraFlux-HUB 自身以 MIT 协议授权
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                        共 48 个组件
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    AstraFlux-HUB 以 MIT 协议开源。本软件的发行版本包含下列开源组件，各自按其原始许可证条款分发；完整许可证正文与版权声明见对应项目仓库。
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
                      onClick={() => openExternal('https://github.com/onekuta/AstraFlux-Hub', 'GitHub 开源仓库')}
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

      {/* Beta 切换高危警示弹窗 (完全对齐用户要求：红色警示按钮、不可软件内回退、需卸载重装正式版) */}
      {showBetaWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--bg-primary)] border border-rose-500/40 rounded-2xl p-6 shadow-2xl shadow-rose-950/40 space-y-4">
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                  {t('betaModal.warningTitle', '切换至 Beta 测试更新通道')}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {t('betaModal.warningSub', '请仔细阅读以下前沿测试通道使用与回退规则')}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-[var(--text-secondary)] space-y-2.5 leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <p>
                  <strong className="text-[var(--text-primary)]">{t('betaModal.risk1Title', '测试版本说明')}：</strong>
                  {t('betaModal.risk1Desc', 'Beta 版本为前沿实验测试版本，功能不一定完全正常，可能包含未知的按键逻辑异常、偶发 Bug 或界面卡顿。')}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <p>
                  <strong className="text-rose-500 font-bold">{t('betaModal.risk2Title', '无法软件内回退')}：</strong>
                  <span className="underline font-bold text-rose-500">{t('betaModal.risk2Desc', '测试版本升级后只能继续升级测试版，不能软件内回退！')}</span>
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <p>
                  <strong className="text-[var(--text-primary)]">{t('betaModal.risk3Title', '恢复正式版方式')}：</strong>
                  {t('betaModal.risk3Desc', '如果想切换成正式版，请完全卸载当前测试版软件，进入网站或发布页重新下载安装正式版。')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBetaWarningModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-xs font-bold text-[var(--text-secondary)] transition cursor-pointer"
              >
                {t('betaModal.cancelBtn', '取消')}
              </button>
              <button
                type="button"
                onClick={() => {
                  updaterService.setUpdateChannel('beta');
                  setUpdateChannel('beta');
                  setChangelogPageIndex(0);
                  setShowBetaWarningModal(false);
                  addToast({
                    message: '⚠️ 已切换至 Beta 测试更新通道！正在查询云端测试版...',
                    type: 'warning',
                    duration: 3000,
                  });
                  setTimeout(() => {
                    handleCheckAndUpdateApp();
                  }, 200);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-600/30 flex items-center space-x-1.5"
              >
                <span>{t('betaModal.confirmBtn', '我确认进入 beta 测试版')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Beta 切回正式版指引弹窗 */}
      {showBetaExitTipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[var(--bg-primary)] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Info className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  {updaterService.isCurrentVersionBeta()
                    ? t('betaModal.betaTipTitle', '如何退回正式稳定版？')
                    : '如何退回正式稳定版？'}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {updaterService.isCurrentVersionBeta()
                    ? t('betaModal.howToExitBtn', 'Beta 测试版回退指引')
                    : '如何返回正式版？'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
              <p>
                {updaterService.isCurrentVersionBeta()
                  ? t('betaModal.betaTipDesc', '由于 Beta 测试版的配置与内核协议向前递进，无法在客户端内直接一键降级。若需要恢复正式版，请先卸载驱动程序，然后前往官网或 GitHub 下载正式版安装包重新安装即可。')
                  : '由于 Beta 测试版的配置与内核协议向前递进，无法在客户端内直接一键降级。若需要恢复正式版，请先卸载驱动程序，然后前往官网或 GitHub 下载正式版安装包重新安装即可。'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {!updaterService.isCurrentVersionBeta() ? (
                <button
                  type="button"
                  onClick={() => {
                    updaterService.setUpdateChannel('release');
                    setUpdateChannel('release');
                    setChangelogPageIndex(1);
                    setShowBetaExitTipModal(false);
                    addToast({
                      message: '已退回正式稳定版更新通道',
                      type: 'info',
                    });
                    setTimeout(() => handleCheckAndUpdateApp(), 200);
                  }}
                  className="text-xs text-[var(--text-secondary)] hover:text-blue-500 underline cursor-pointer font-medium"
                >
                  保持当前正式版
                </button>
              ) : (
                <span className="text-[11px] text-[var(--text-tertiary)] opacity-60 select-none">
                  需卸载后重装正式版
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowBetaExitTipModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {t('betaModal.gotIt', '我知道了')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

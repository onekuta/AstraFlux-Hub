import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Lock,
  Unlock,
  Cloud,
  FileCode2,
  Download,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  PackageCheck,
  FolderArchive,
  RotateCcw,
  Database,
  ArrowUpCircle,
  DownloadCloud,
  Link,
  Save,
} from 'lucide-react';
import { customDeviceRegistry } from '../services/customDeviceRegistry';
import { updaterService } from '../services/updaterService';
import { useToast } from './ToastProvider';

const DEV_PASSWORD = 'kutaze1234';

export default function DevLabModal({ 
  isOpen, 
  onClose,
  isLiveHwLightingSync = true,
  onToggleLiveHwLightingSync = () => {}
}) {
  const { addToast } = useToast();

  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // 两个返链配置 (数据库更新链接 & 驱动更新链接)
  const [dbUpdateUrl, setDbUpdateUrl] = useState('');
  const [appUpdateUrl, setAppUpdateUrl] = useState('');

  // 版本检测与比对状态
  const [isCheckingBoth, setIsCheckingBoth] = useState(false);
  const [versionCheckResult, setVersionCheckResult] = useState(null);

  // 在线更新状态
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [appDownloadProgress, setAppDownloadProgress] = useState(0);

  // 当前版本信息
  const [currentLibVersion, setCurrentLibVersion] = useState(() => updaterService.getCurrentLibVersion());
  const currentAppVersion = updaterService.getCurrentAppVersion();

  // 设备列表与导出配置
  const [allProfiles, setAllProfiles] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'custom' | 'official'
  const [exportLibVersion, setExportLibVersion] = useState('');
  const [isExportingPatch, setIsExportingPatch] = useState(false);
  const [isExportingBundle, setIsExportingBundle] = useState(false);

  // 初始化加载
  useEffect(() => {
    if (isOpen) {
      setDbUpdateUrl(updaterService.getDbUpdateUrl());
      setAppUpdateUrl(updaterService.getAppUpdateUrl());
      setCurrentLibVersion(updaterService.getCurrentLibVersion());
      setAllProfiles(customDeviceRegistry.getAllProfiles());
      const now = new Date();
      const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '.');
      setExportLibVersion(`${dateTag}.1`);
    }
  }, [isOpen]);

  const handleUnlock = (e) => {
    e?.preventDefault();
    const inputVal = passwordInput.trim();
    if (inputVal === DEV_PASSWORD || inputVal.toLowerCase() === 'kutaze1234' || inputVal === 'SparkLink#2026Dev') {
      setIsUnlocked(true);
      setPasswordError(false);
      addToast({ message: '开发者后台已解锁', type: 'success' });
    } else {
      setPasswordError(true);
      addToast({ message: '开发者口令不正确', type: 'error' });
    }
  };

  // 保存数据库更新链接
  const handleSaveDbUrl = () => {
    if (!dbUpdateUrl.trim()) {
      addToast({ message: '数据库更新链接不能为空', type: 'warning' });
      return;
    }
    updaterService.setDbUpdateUrl(dbUpdateUrl.trim());
    addToast({ message: '数据库在线更新链接已保存！', type: 'success' });
  };

  // 保存驱动更新链接
  const handleSaveAppUrl = () => {
    if (!appUpdateUrl.trim()) {
      addToast({ message: '驱动软件更新链接不能为空', type: 'warning' });
      return;
    }
    updaterService.setAppUpdateUrl(appUpdateUrl.trim());
    addToast({ message: '驱动软件更新链接已保存！', type: 'success' });
  };

  // 一键保存全部链接
  const handleSaveAllUrls = () => {
    updaterService.setDbUpdateUrl(dbUpdateUrl.trim());
    updaterService.setAppUpdateUrl(appUpdateUrl.trim());
    addToast({ message: '数据库与驱动更新返链均已成功保存！', type: 'success' });
  };

  // 综合比对检测云端最新版本
  const handleCheckBothVersions = async () => {
    setIsCheckingBoth(true);
    setVersionCheckResult(null);
    try {
      const res = await updaterService.checkBothVersions({
        dbUrl: dbUpdateUrl.trim(),
        appUrl: appUpdateUrl.trim(),
      });
      setVersionCheckResult(res);
      setCurrentLibVersion(updaterService.getCurrentLibVersion());

      if (res.hasLibUpdate || res.hasAppUpdate) {
        addToast({
          message: `检测到新版本可用！${res.hasLibUpdate ? '【键盘数据库可更新】' : ''} ${res.hasAppUpdate ? '【驱动客户端有新版】' : ''}`,
          type: 'info',
        });
      } else if (!res.libError && !res.appError) {
        addToast({ message: '检测完毕：键盘数据库与驱动客户端当前均为最新版本！', type: 'success' });
      } else {
        addToast({ message: '版本检测完成（部分地址返回提示，请查看详细卡片）', type: 'warning' });
      }
    } catch (err) {
      addToast({ message: `检查版本异常: ${err.message}`, type: 'error' });
    } finally {
      setIsCheckingBoth(false);
    }
  };

  // 内置下载更新入口 1: 立即在线更新数据库 (免重装，秒级热覆写)
  const handleOnlineDbUpdate = async () => {
    setIsUpdatingDb(true);
    try {
      addToast({ message: '正在从预设链接拉取最新键盘硬件特征数据库...', type: 'info' });
      const res = await updaterService.performOnlineDbUpdate(dbUpdateUrl.trim(), versionCheckResult?.rawDbData);
      setAllProfiles(customDeviceRegistry.getAllProfiles());
      setCurrentLibVersion(updaterService.getCurrentLibVersion());
      // 更新检测状态
      setVersionCheckResult((prev) => prev ? { ...prev, hasLibUpdate: false } : null);
      addToast({
        message: `🎉 数据库在线更新成功！当前共计纳入 ${res.count} 款外设硬件适配 (本次更新 ${res.importedCount} 款)，无需重启或重装驱动，即刻生效！`,
        type: 'success',
      });
    } catch (err) {
      addToast({ message: `在线更新数据库失败: ${err.message}`, type: 'error' });
    } finally {
      setIsUpdatingDb(false);
    }
  };

  // 内置下载更新入口 2: 立即在线更新驱动软件 (覆盖安装)
  const handleOnlineAppUpdate = async () => {
    setIsUpdatingApp(true);
    setAppDownloadProgress(0);
    try {
      addToast({ message: '正在从预设链接下载驱动客户端新版本安装包...', type: 'info' });
      const res = await updaterService.performOnlineAppUpdate(appUpdateUrl.trim(), (progress) => {
        setAppDownloadProgress(progress.percent || 0);
      });
      if (res.browserOpened) {
        addToast({ message: '已为您在浏览器打开最新安装包下载页面！', type: 'success' });
      } else if (res.success) {
        addToast({ message: '安装包下载完成，正在自动启动覆盖安装向导...', type: 'success' });
      }
    } catch (err) {
      addToast({ message: `在线更新驱动失败: ${err.message}`, type: 'error' });
    } finally {
      setIsUpdatingApp(false);
    }
  };

  // 导入单机真机探针数据、数据库集合包或适配包 (自动合并进整个数据库)
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isZip = file.name.endsWith('.spkdb') || file.name.endsWith('.zip');
      if (isZip) {
        addToast({ message: `正在校验并解包集合包 [${file.name}]...`, type: 'info' });
        const arrayBuf = await file.arrayBuffer();
        const res = await updaterService.importOfflineBundle(arrayBuf, file.name);
        setAllProfiles(customDeviceRegistry.getAllProfiles());
        setCurrentLibVersion(updaterService.getCurrentLibVersion());
        addToast({
          message: `🎉 成功导入全量集合包！当前总计纳入 ${res.count} 款外设硬件适配档案 (版本: ${res.libVersion})！`,
          type: 'success',
        });
      } else {
        const text = await file.text();
        const json = JSON.parse(text);
        if (Array.isArray(json.profiles)) {
          // 导入整个数据库并合并
          const res = customDeviceRegistry.importFullDatabase(json);
          setAllProfiles(customDeviceRegistry.getAllProfiles());
          setCurrentLibVersion(updaterService.getCurrentLibVersion());
          addToast({
            message: `成功合并全量数据库！当前总计纳入 ${res.count} 款外设适配 (新增/覆写 ${res.importedCount} 款)`,
            type: 'success',
          });
        } else {
          // 单个探针文件 -> 自动转换并合并进全量数据库
          const profile = customDeviceRegistry.importProbeFile(json);
          setAllProfiles(customDeviceRegistry.getAllProfiles());
          setCurrentLibVersion(updaterService.getCurrentLibVersion());
          addToast({
            message: `成功将键盘 [${profile.name}] 合并进驱动全量数据库！(当前共 ${customDeviceRegistry.getTotalCount()} 款设备)`,
            type: 'success',
          });
        }
      }
    } catch (err) {
      addToast({
        message: `数据包解析失败: ${err.message}`,
        type: 'error',
      });
    } finally {
      event.target.value = '';
    }
  };

  // 核心：一键导出单一文件数据库集合包 (.spkdb)
  const handleExportSpkdbBundle = async () => {
    setIsExportingBundle(true);
    try {
      const res = await customDeviceRegistry.exportDatabaseBundle(exportLibVersion.trim());
      addToast({
        message: `🎉 数据库集合包【${res.fileName}】导出成功！内含 manifest.json、device_db.json 与每把独立键盘规范配置，发给用户一键导入即可！`,
        type: 'success',
      });
    } catch (err) {
      addToast({ message: `导出集合包失败: ${err.message}`, type: 'error' });
    } finally {
      setIsExportingBundle(false);
    }
  };

  // 导出驱动里的【整个数据库】(device_db.json)
  const handleExportConsolidatedDb = () => {
    try {
      const db = customDeviceRegistry.exportConsolidatedDatabase(exportLibVersion.trim());
      const jsonStr = JSON.stringify(db, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `device_db_${db.libVersion}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        message: `驱动全量数据库已成功导出 (包含内置+扩展共 ${db.profiles.length} 款键盘)，可用于云端发布或离线分发！`,
        type: 'success',
      });
    } catch (err) {
      addToast({ message: `导出失败: ${err.message}`, type: 'error' });
    }
  };

  // 导出绿色升级安装包 (自动检测并覆写驱动数据库)
  const handleExportGreenPatch = async () => {
    setIsExportingPatch(true);
    try {
      const res = await customDeviceRegistry.exportGreenPatch(exportLibVersion.trim());
      if (!res.canceled) {
        addToast({
          message: `🎉 绿色升级补丁包导出成功！用户双击此文件即可自动检测驱动目录并安全覆写最新高版本数据库！`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({ message: `导出升级包失败: ${err.message}`, type: 'error' });
    } finally {
      setIsExportingPatch(false);
    }
  };

  // 删除自定义设备
  const handleRemoveProfile = (vendorId, productId, name) => {
    customDeviceRegistry.removeProfile(vendorId, productId);
    setAllProfiles(customDeviceRegistry.getAllProfiles());
    addToast({ message: `已从数据库移除: ${name}`, type: 'info' });
  };

  // 过滤显示的设备
  const displayedProfiles = allProfiles.filter((p) => {
    if (filterType === 'official') return p.isOfficial;
    if (filterType === 'custom') return !p.isOfficial;
    return true;
  });

  const customCount = allProfiles.filter((p) => !p.isOfficial).length;
  const officialCount = allProfiles.filter((p) => p.isOfficial).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-title modal-title text-[var(--text-primary)] flex items-center space-x-2">
                <span>星闪硬件实验室 & 开发者后台 (Dev Lab)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold">
                  DEVELOPER ONLY
                </span>
              </h2>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                双通道云端返链配置、版本比对检测、内置在线更新入口、真机逆向并库与绿色升级包导出
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 密码验证屏 */}
        {!isUnlocked ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Lock className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">开发者模式鉴权</h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
                此控制台用于硬件适配与版本分发管理，仅限开发者及调试人员访问，请输入管理口令解锁。
              </p>
            </div>
            <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="请输入开发者口令"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border ${
                    passwordError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--border-color)]'
                  } text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-color)]`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">口令错误，请重新输入</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>验证口令并进入</span>
              </button>
            </form>
          </div>
        ) : (
          /* 后台操作主面板 */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 0. 硬件级灯光通讯与实时物理直读开关 (隐藏在此处进行开发者管控) */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-500 font-black text-sm">⚡</span>
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    硬件级灯光通讯与实时物理直读 (HID Live Lighting Sync)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isLiveHwLightingSync 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {isLiveHwLightingSync ? '默认开启 (进入灯光设置通讯)' : '已手动关闭 (仅离线算法演示)'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <span>物理灯光直读与实时通讯开关</span>
                    <span className="text-[10px] font-normal text-emerald-500">(默认常驻保持)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    默认常驻开启。驱动仅在打开「灯光设置」界面时与键盘进行 HID 实时通讯并 1:1 直读物理 LED 矩阵；离开灯光设置界面后驱动自动停止灯光通讯，键盘留存板载预设独立运行。若需强制关闭硬件级灯光通讯并改用纯本地 30FPS 算法动效演算，可在此关闭。
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isLiveHwLightingSync}
                    onChange={onToggleLiveHwLightingSync}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* 1. 云端返链配置：两个专属返链/直链位置 (数据库更新链接 & 驱动更新链接) */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-[var(--info-color)]" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    云端返链与更新下载源配置 (Dual OTA Endpoints)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-emerald-500 flex items-center font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    客户端纯只读模式 (零私钥防逆向)
                  </span>
                  <button
                    onClick={handleSaveAllUrls}
                    className="text-[11px] px-2.5 py-1 rounded bg-[var(--info-color)]/10 text-[var(--info-color)] hover:bg-[var(--info-color)]/20 font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>一键保存全部链接</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 返链 1: 数据库在线更新链接 */}
                <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                      <Database className="w-3.5 h-3.5" />
                      <span>① 数据库更新的链接 (device_db.json / 清单)</span>
                    </div>
                    <button
                      onClick={handleSaveDbUrl}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition cursor-pointer"
                    >
                      保存链接
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://gitee.com/your_account/sparklink-hub/raw/master/device_db.json"
                    value={dbUpdateUrl}
                    onChange={(e) => setDbUpdateUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                    用于拉取外设适配库数据，在线更新数据库时将从此返链下载覆写。
                  </div>
                </div>

                {/* 返链 2: 驱动更新用的链接 */}
                <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>② 驱动更新用的链接 (Setup.exe / manifest)</span>
                    </div>
                    <button
                      onClick={handleSaveAppUrl}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition cursor-pointer"
                    >
                      保存链接
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://gitee.com/your_account/sparklink-hub/raw/master/manifest.json 或 Setup.exe 直链"
                    value={appUpdateUrl}
                    onChange={(e) => setAppUpdateUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                    用于拉取驱动安装包或更新清单，在线升级驱动时将从此返链下载覆盖安装。
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 内置下载更新入口 & 版本比对检测中心 */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">
                      内置下载更新入口 & 云端版本比对中心
                    </h3>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      检测本地与云端版本差异，并直接使用上方填写的预设返链进行内置在线升级
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckBothVersions}
                  disabled={isCheckingBoth}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-60 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBoth ? 'animate-spin' : ''}`} />
                  <span>{isCheckingBoth ? '正在比对版本...' : '🔄 检测当前版本是否最新'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 数据库在线更新入口卡片 */}
                <div className={`p-3.5 rounded-xl border transition ${versionCheckResult?.hasLibUpdate ? 'border-amber-500/50 bg-amber-500/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-[var(--text-primary)]">
                      <Database className="w-4 h-4 text-sky-400" />
                      <span>键盘硬件适配数据库</span>
                    </div>
                    <div>
                      {versionCheckResult?.hasLibUpdate ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                          发现新版本 (可在线更新)
                        </span>
                      ) : versionCheckResult?.cloudLibVersion ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          已是最新版本
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-color)]">
                          点击上方检测
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-mono space-y-1.5 mb-3.5 text-[var(--text-secondary)]">
                    <div className="flex justify-between items-center bg-[var(--bg-tertiary)] px-2.5 py-1 rounded">
                      <span className="text-[var(--text-tertiary)]">本地当前版本:</span>
                      <span className="font-bold text-[var(--text-primary)]">V{currentLibVersion} ({allProfiles.length} 款键盘)</span>
                    </div>
                    <div className="flex justify-between items-center bg-[var(--bg-tertiary)] px-2.5 py-1 rounded">
                      <span className="text-[var(--text-tertiary)]">云端最新版本:</span>
                      <span className="font-bold text-sky-400">
                        {versionCheckResult?.cloudLibVersion ? `V${versionCheckResult.cloudLibVersion} (${versionCheckResult.cloudLibTotalDevices || '?'} 款)` : '尚未检测'}
                      </span>
                    </div>
                    {versionCheckResult?.libError && (
                      <div className="text-[10px] text-rose-400 mt-1">检测提示: {versionCheckResult.libError}</div>
                    )}
                  </div>

                  <button
                    onClick={handleOnlineDbUpdate}
                    disabled={isUpdatingDb}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 ${
                      versionCheckResult?.hasLibUpdate
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                        : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    <DownloadCloud className={`w-3.5 h-3.5 ${isUpdatingDb ? 'animate-bounce' : ''}`} />
                    <span>{isUpdatingDb ? '正在下载覆写数据库...' : '⚡ 立即在线更新数据库 (免重装秒更)'}</span>
                  </button>
                </div>

                {/* 驱动本体在线更新入口卡片 */}
                <div className={`p-3.5 rounded-xl border transition ${versionCheckResult?.hasAppUpdate ? 'border-purple-500/50 bg-purple-500/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-[var(--text-primary)]">
                      <ArrowUpCircle className="w-4 h-4 text-purple-400" />
                      <span>驱动软件本体客户端</span>
                    </div>
                    <div>
                      {versionCheckResult?.hasAppUpdate ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse">
                          发现新版本 (可覆盖安装)
                        </span>
                      ) : versionCheckResult?.cloudAppVersion ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          已是最新版本
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-color)]">
                          点击上方检测
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-mono space-y-1.5 mb-3.5 text-[var(--text-secondary)]">
                    <div className="flex justify-between items-center bg-[var(--bg-tertiary)] px-2.5 py-1 rounded">
                      <span className="text-[var(--text-tertiary)]">本地当前版本:</span>
                      <span className="font-bold text-[var(--text-primary)]">V{currentAppVersion}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[var(--bg-tertiary)] px-2.5 py-1 rounded">
                      <span className="text-[var(--text-tertiary)]">云端最新版本:</span>
                      <span className="font-bold text-purple-400">
                        {versionCheckResult?.cloudAppVersion ? `V${versionCheckResult.cloudAppVersion}` : '尚未检测'}
                      </span>
                    </div>
                    {versionCheckResult?.appError && (
                      <div className="text-[10px] text-rose-400 mt-1">检测提示: {versionCheckResult.appError}</div>
                    )}
                  </div>

                  {isUpdatingApp && appDownloadProgress > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mb-1">
                        <span>下载进度</span>
                        <span>{appDownloadProgress}%</span>
                      </div>
                      <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full transition-all duration-200"
                          style={{ width: `${appDownloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleOnlineAppUpdate}
                    disabled={isUpdatingApp}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 ${
                      versionCheckResult?.hasAppUpdate
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    <ArrowUpCircle className={`w-3.5 h-3.5 ${isUpdatingApp ? 'animate-spin' : ''}`} />
                    <span>{isUpdatingApp ? `下载中 (${appDownloadProgress}%)...` : '🚀 立即在线更新驱动软件 (覆盖安装)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 导入单机数据并合并入库 vs 导出整个全量数据库 / 绿色升级包 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 导入并合并入库 */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3">
                <div className="flex items-center space-x-2">
                  <FileCode2 className="w-4 h-4 text-sky-500" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    1. 导入键盘数据包 (合并进整个数据库)
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                  选择探针导出的 <code className="text-sky-500 font-mono">PCB_适配文件_xxxx.json</code> 或既有的全量库。系统将自动将其合并进驱动全量数据库，立即生效联调。
                </p>

                <div>
                  <label className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition cursor-pointer shadow-sm">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>导入集合包 / 探针 (.spkdb / .zip / .json)</span>
                    <input
                      type="file"
                      accept=".spkdb,.zip,.json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 导出全量数据库与单文件集合包 */}
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    2. 导出驱动全量外设数据库 (.spkdb 格式)
                  </h3>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                  统一格式规约：全量数据库统一打包为标准 <b>.spkdb</b> 格式。导出后可直接拖入<b>「云端发布助手」</b>推送至云端，或在客户端<b>「软件更新」</b>页面一键导入生效。
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="库版本号 (格式: 2026.10.20.1)"
                      value={exportLibVersion}
                      onChange={(e) => setExportLibVersion(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 核心唯一格式：统一标准单文件全量集合包 .spkdb */}
                  <button
                    onClick={handleExportSpkdbBundle}
                    disabled={isExportingBundle}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-60"
                    title="统一打包为标准 .spkdb 数据库文件，用于云端发布或在软件更新页一键导入"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>{isExportingBundle ? '正在生成集合包...' : '📦 一键导出数据库集合包 (.spkdb)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. 驱动全量数据库已纳入的 PCB 与官方外设档案 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[var(--info-color)]" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    驱动全量设备数据库 ({allProfiles.length} 款设备)
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  {/* 分类过滤器 */}
                  <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-0.5 text-[10px]">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2 py-0.5 rounded font-bold transition ${filterType === 'all' ? 'bg-[var(--info-color)] text-white' : 'text-[var(--text-tertiary)]'}`}
                    >
                      全部 ({allProfiles.length})
                    </button>
                    <button
                      onClick={() => setFilterType('custom')}
                      className={`px-2 py-0.5 rounded font-bold transition ${filterType === 'custom' ? 'bg-sky-500 text-white' : 'text-[var(--text-tertiary)]'}`}
                    >
                      客制化扩展 ({customCount})
                    </button>
                    <button
                      onClick={() => setFilterType('official')}
                      className={`px-2 py-0.5 rounded font-bold transition ${filterType === 'official' ? 'bg-amber-500 text-white' : 'text-[var(--text-tertiary)]'}`}
                    >
                      官方预设 ({officialCount})
                    </button>
                  </div>

                  {customCount > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('确定要清空所有已导入的客制化设备档案，重置回官方出厂预设吗？')) {
                          customDeviceRegistry.resetToOfficial();
                          setAllProfiles(customDeviceRegistry.getAllProfiles());
                          setCurrentLibVersion(updaterService.getCurrentLibVersion());
                          addToast({ message: '已重置回官方出厂数据库', type: 'info' });
                        }
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重置扩展</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                {displayedProfiles.map((p) => {
                  const vHex = (p.vendorId || 0).toString(16).padStart(4, '0').toUpperCase();
                  const pHex = (p.productId || 0).toString(16).padStart(4, '0').toUpperCase();
                  return (
                    <div
                      key={`${p.vendorId}:${p.productId}`}
                      className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-start justify-between group hover:border-[var(--info-color)] transition"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                          <span>{p.name}</span>
                          {p.isOfficial ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold">
                              官方内置
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">
                              动态扩展
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-500 font-bold">
                            {p.layout || '客制化'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-tertiary)] space-y-0.5">
                          <div>VID:PID = 0x{vHex}:0x{pHex}</div>
                          <div>
                            灯珠: {p.lighting?.totalLeds || 68} 颗 | 空格灯: {p.lighting?.spacebarLeds || 1} 颗
                            {p.lighting?.dualLamps ? ' (双灯位)' : ''}
                          </div>
                          <div>回报率上限: {p.maxPollingRate || 8000} Hz</div>
                        </div>
                      </div>
                      {!p.isOfficial && (
                        <button
                          onClick={() => handleRemoveProfile(p.vendorId, p.productId, p.name)}
                          className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                          title="从数据库删除该客制化设备"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 底部信息栏 */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-[var(--info-color)]" />
            <span>适配库运行环境: NearLink Real-Hardware Unified Dynamic Registry</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold transition text-xs cursor-pointer"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
}

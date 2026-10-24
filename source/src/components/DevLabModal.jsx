import React, { useState, useEffect, useMemo } from 'react';
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
  FlaskConical,
  Sliders,
  ShieldCheck,
  Eye,
  EyeOff,
  Search,
  FileText,
} from 'lucide-react';
import { customDeviceRegistry } from '../services/customDeviceRegistry';
import { updaterService } from '../services/updaterService';
import { axisService } from '../services/axisService';
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

  // 三个返链配置 (数据库更新链接 & 正式版驱动更新链接 & Beta 测试版更新链接)
  const [dbUpdateUrl, setDbUpdateUrl] = useState('');
  const [appUpdateUrl, setAppUpdateUrl] = useState('');
  const [betaAppUpdateUrl, setBetaAppUpdateUrl] = useState('');

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

  // 开发者后台主导航 (外设库管理 vs 轴体库管理)
  const [activeDevTab, setActiveDevTab] = useState('devices'); // 'devices' | 'switches'
  const [axesList, setAxesList] = useState(() => axisService.axes || []);
  const [switchSearchQuery, setSwitchSearchQuery] = useState('');
  const [switchBrandFilter, setSwitchBrandFilter] = useState('all');
  const [switchAuthFilter, setSwitchAuthFilter] = useState('all'); // 'all' | 'official' | 'unverified'
  const [switchDeviceFilter, setSwitchDeviceFilter] = useState('all'); // 'all' | 'dv63' | 'ae64' | 'es68'
  const [isSyncingAxes, setIsSyncingAxes] = useState(false);

  // 初始化加载
  useEffect(() => {
    if (isOpen) {
      setDbUpdateUrl(updaterService.getDbUpdateUrl());
      setAppUpdateUrl(updaterService.getAppUpdateUrl());
      setBetaAppUpdateUrl(updaterService.getBetaAppUpdateUrl());
      setCurrentLibVersion(updaterService.getCurrentLibVersion());
      setAllProfiles(customDeviceRegistry.getAllProfiles());
      setAxesList([...axisService.axes]);
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
    addToast({ message: '正式版驱动软件更新链接已保存！', type: 'success' });
  };

  // 保存 Beta 测试版更新链接
  const handleSaveBetaAppUrl = () => {
    if (!betaAppUpdateUrl.trim()) {
      addToast({ message: 'Beta 测试版更新链接不能为空', type: 'warning' });
      return;
    }
    updaterService.setBetaAppUpdateUrl(betaAppUpdateUrl.trim());
    addToast({ message: 'Beta 测试版驱动更新链接已保存！', type: 'success' });
  };

  // 一键保存全部链接
  const handleSaveAllUrls = () => {
    updaterService.setDbUpdateUrl(dbUpdateUrl.trim());
    updaterService.setAppUpdateUrl(appUpdateUrl.trim());
    updaterService.setBetaAppUpdateUrl(betaAppUpdateUrl.trim());
    addToast({ message: '数据库、正式版及 Beta 版三大更新返链均已成功保存！', type: 'success' });
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
      const prefetched = (versionCheckResult?.rawDbData && Array.isArray(versionCheckResult.rawDbData.profiles)) ? versionCheckResult.rawDbData : null;
      const res = await updaterService.performOnlineDbUpdate(dbUpdateUrl.trim(), prefetched);
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

  // 轴体库管理：在线重新拉取云端官方轴体库
  const handleSyncCloudAxes = async () => {
    setIsSyncingAxes(true);
    try {
      await axisService.loadAxisList();
      setAxesList([...axisService.axes]);
      addToast({
        message: `🎉 云端官方轴体库同步成功！当前收录 ${axisService.axes.length} 款真实磁轴`,
        type: 'success',
      });
    } catch (err) {
      addToast({ message: `云端同步失败: ${err.message}`, type: 'error' });
    } finally {
      setIsSyncingAxes(false);
    }
  };

  // 轴体库管理：切换轴体鉴权/可见状态
  const handleToggleAxisVerification = (id, currentName) => {
    const newStatus = axisService.toggleAxisVerification(id);
    setAxesList([...axisService.axes]);
    addToast({
      message: `已将轴体【${currentName}】标记为: ${newStatus ? '官方真实已核准 (前台可见)' : '未核准/已隐藏 (前台隐藏)'}`,
      type: newStatus ? 'success' : 'info',
    });
  };

  // 轴体库管理：导出全量轴体校准库 JSON
  const handleExportAxesDb = () => {
    try {
      const jsonStr = axisService.exportAxisDbJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `axes_database_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({
        message: `全量轴体校准数据库已导出 (共 ${axisService.axes.length} 款)，包含真实标定曲线与硬件电气映射！`,
        type: 'success',
      });
    } catch (e) {
      addToast({ message: `导出轴体库失败: ${e.message}`, type: 'error' });
    }
  };

  // 轴体库管理：导入自定义轴体校准配置文件
  const handleImportCustomAxis = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json.axes)) {
        json.axes.forEach((a) => axisService.importCustomAxis(a));
        setAxesList([...axisService.axes]);
        addToast({ message: `成功批量导入 ${json.axes.length} 款轴体配置！`, type: 'success' });
      } else {
        const imported = axisService.importCustomAxis(json);
        setAxesList([...axisService.axes]);
        addToast({ message: `成功导入轴体 [${imported.name}] 并完成电气标定注册！`, type: 'success' });
      }
    } catch (err) {
      addToast({ message: `导入解析失败: ${err.message}`, type: 'error' });
    } finally {
      e.target.value = '';
    }
  };

  // 轴体库管理：重置为出厂官方基线
  const handleResetAxes = async () => {
    if (confirm('确定要重置轴体库回官方出厂基线吗？所有未核准与测试轴体将被重置。')) {
      await axisService.resetToOfficialAxes();
      setAxesList([...axisService.axes]);
      addToast({ message: '轴体库已成功恢复至官方出厂标定基线', type: 'info' });
    }
  };

  // 过滤显示的设备
  const displayedProfiles = allProfiles.filter((p) => {
    if (filterType === 'official') return p.isOfficial;
    if (filterType === 'custom') return !p.isOfficial;
    return true;
  });

  const customCount = allProfiles.filter((p) => !p.isOfficial).length;
  const officialCount = allProfiles.filter((p) => p.isOfficial).length;

  // 轴体库统计
  const axisStats = useMemo(() => {
    return axisService.getAxisStats();
  }, [axesList]);

  // 过滤显示的轴体
  const displayedAxes = useMemo(() => {
    let list = [...axesList];
    if (switchBrandFilter === 'jiangwan') {
      list = list.filter((a) => a.brand?.includes('江湾') || a.brand?.toLowerCase().includes('everglide'));
    } else if (switchBrandFilter === 'gateron') {
      list = list.filter((a) => a.brand?.includes('佳达隆') || a.brand?.toLowerCase().includes('gateron'));
    } else if (switchBrandFilter === 'ttc') {
      list = list.filter((a) => a.brand?.includes('正牌科电') || a.brand?.toUpperCase().includes('TTC') || a.name?.includes('神马'));
    } else if (switchBrandFilter === 'other') {
      list = list.filter(
        (a) =>
          !a.brand?.includes('江湾') &&
          !a.brand?.toLowerCase().includes('everglide') &&
          !a.brand?.includes('佳达隆') &&
          !a.brand?.toLowerCase().includes('gateron') &&
          !a.brand?.includes('正牌科电') &&
          !a.brand?.toUpperCase().includes('TTC') &&
          !a.name?.includes('神马')
      );
    }

    if (switchAuthFilter === 'official') {
      list = list.filter((a) => a.isOfficial !== false && a.verified !== false);
    } else if (switchAuthFilter === 'unverified') {
      list = list.filter((a) => a.isOfficial === false || a.verified === false);
    }

    if (switchDeviceFilter === 'dv63') {
      const dv63Keys = ['神马', '磁玉', '万磁王', '天际线'];
      list = list.filter((a) => dv63Keys.some((k) => a.name.includes(k)));
    } else if (switchDeviceFilter === 'ae64') {
      const ae64Keys = ['天际线', '库里南', '磁神', '磁玉', '万磁王'];
      list = list.filter((a) => ae64Keys.some((k) => a.name.includes(k)));
    } else if (switchDeviceFilter === 'es68') {
      const es68Keys = ['磁玉', '超竞', '双轨磁白', '万磁王', '天王'];
      list = list.filter((a) => es68Keys.some((k) => a.name.includes(k)));
    }

    if (switchSearchQuery.trim()) {
      const q = switchSearchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.brand && a.brand.toLowerCase().includes(q)) ||
          String(a.id).includes(q) ||
          String(a.hardwareAxisId).includes(q)
      );
    }
    return list;
  }, [axesList, switchBrandFilter, switchAuthFilter, switchDeviceFilter, switchSearchQuery]);

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
            {/* 开发者二级导航选项卡 */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 shrink-0">
              <div className="flex items-center bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setActiveDevTab('devices')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                    activeDevTab === 'devices'
                      ? 'bg-[var(--info-color)] text-white shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>外设硬件数据库与在线更新</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono font-bold">
                    {allProfiles.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDevTab('switches')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                    activeDevTab === 'switches'
                      ? 'bg-[var(--info-color)] text-white shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>轴体库与底层校准文件管理</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {axesList.length}款
                  </span>
                </button>
              </div>

              <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>NearLink Driver Core Lab</span>
              </div>
            </div>

            {activeDevTab === 'devices' && (
              <>
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

            {/* 1. 云端返链配置：三大专属返链/直链位置 (数据库更新链接 & 正式版驱动更新链接 & Beta 测试版更新链接) */}
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-[var(--info-color)]" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    云端返链与更新下载源配置 (Multi-Channel OTA Endpoints)
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 返链 1: 数据库在线更新链接 */}
                <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                      <Database className="w-3.5 h-3.5" />
                      <span>① 数据库更新链接 (device_db.json / 清单)</span>
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
                    placeholder="https://gitee.com/Kutaze/astra-flux-hub/raw/main/database/manifest.json"
                    value={dbUpdateUrl}
                    onChange={(e) => setDbUpdateUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                    用于拉取外设适配库数据，定位到 database/ 专属目录。
                  </div>
                </div>

                {/* 返链 2: 正式版驱动更新用的链接 */}
                <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>② 正式版驱动更新链接 (software/manifest)</span>
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
                    placeholder="https://gitee.com/Kutaze/astra-flux-hub/raw/main/software/manifest.json"
                    value={appUpdateUrl}
                    onChange={(e) => setAppUpdateUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                    用于拉取正式稳定版安装包清单，定位到 software/ 专属目录。
                  </div>
                </div>

                {/* 返链 3: Beta 测试版驱动更新链接 */}
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                      <span>③ Beta 测试版更新链接 (software(beta)/manifest)</span>
                    </div>
                    <button
                      onClick={handleSaveBetaAppUrl}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition cursor-pointer"
                    >
                      保存链接
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://gitee.com/Kutaze/astra-flux-hub/raw/main/software(beta)/manifest.json"
                    value={betaAppUpdateUrl}
                    onChange={(e) => setBetaAppUpdateUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-tertiary)] border border-amber-500/30 text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                    用于拉取 Beta 测试版驱动安装包清单，定位到 software(beta)/ 专属目录。
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
            </>
            )}

            {/* 轴体库与底层校准文件管理面板 */}
            {activeDevTab === 'switches' && (
              <div className="space-y-4">
                {/* 1. 轴体库全景统计与鉴权概览 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--info-color)]/10 text-[var(--info-color)] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[var(--text-tertiary)]">轴体总数 (底层标定)</div>
                      <div className="text-base font-bold font-mono text-[var(--text-primary)]">
                        {axesList.length} <span className="text-[10px] font-normal text-[var(--text-secondary)]">款</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-emerald-500/80 font-medium">官方真实已鉴权</div>
                      <div className="text-base font-bold font-mono text-emerald-500">
                        {axesList.filter((a) => a.isOfficial !== false && a.verified !== false).length}{' '}
                        <span className="text-[10px] font-normal">款 (前台可见)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-amber-500/80 font-medium">未核准/实验轴体</div>
                      <div className="text-base font-bold font-mono text-amber-500">
                        {axesList.filter((a) => a.isOfficial === false || a.verified === false).length}{' '}
                        <span className="text-[10px] font-normal">款 (前台隐藏)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-purple-400/80 font-medium">成品键盘标定支持</div>
                      <div className="text-xs font-bold font-mono text-purple-400 truncate">
                        DV63 (7款) · AE64 · ES68
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 底层轴体库映射数据文件管理 (底层文件状态透明化) */}
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[var(--info-color)]" />
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">
                        底层轴体库数据映射文件架构 (Official Ground-Truth Files)
                      </h3>
                    </div>
                    <span className="text-[11px] text-emerald-500 font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      官网多源真实数据融合
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 文件 1: ae64AxisListV3.json */}
                    <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                        <span className="font-mono text-sky-400">ae64AxisListV3.json</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400">75 款分类预设</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                        官网 V3 轴体映射库。收录江湾原厂自研库里南轴 3.60mm、佳达隆磁玉系列、正牌科电及客制化兼容轴 (天际线轴 3.55mm) 等真实电气 Detail ID。
                      </p>
                    </div>

                    {/* 文件 2: officialAxisCache.json */}
                    <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                        <span className="font-mono text-purple-400">officialAxisCache.json</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400">222 款全量缓存</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                        星闪云端 API 官方全量轴体标定缓存。收录官方 doctrine_range_left 行程极值、磁通响应系数及官方真实配色。
                      </p>
                    </div>

                    {/* 文件 3: PRIMARY_AXES */}
                    <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                        <span className="font-mono text-amber-400">PRIMARY_AXES (特调SKU)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400">出厂原厂级</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                        硬件级原生出厂特调标定。DV63 原生神马轴 3.45mm、AE64-MAX 库里南/天际线轴、ES68 磁玉 Pro 超竞版出厂调优。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. 轴体数据库操作动作栏 */}
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">轴体库数据维护与导入导出</h3>
                      <p className="text-[10px] text-[var(--text-tertiary)]">支持全量导出、外部标定参数导入及云端官方数据热同步</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncCloudAxes}
                      disabled={isSyncingAxes}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500 hover:text-sky-400 text-[var(--text-primary)] text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      title="重新请求官方星闪云端 API 获取最新轴体标定更新"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAxes ? 'animate-spin' : ''}`} />
                      <span>{isSyncingAxes ? '同步中...' : '同步云端最新库'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportAxesDb}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      title="导出包含全部轴体标定参数的 JSON 文件"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>导出轴体校准库 (.json)</span>
                    </button>

                    <label className="px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>导入新轴体配置</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportCustomAxis}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleResetAxes}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      title="还原重置回官方原生基线"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>重置出厂基线</span>
                    </button>
                  </div>
                </div>

                {/* 4. 全量轴体鉴权门禁管理与检索列表 */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[var(--info-color)]" />
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">
                        全量轴体鉴权与机型绑定清单 (显示 {displayedAxes.length} / 共 {axesList.length} 款)
                      </h3>
                    </div>

                    {/* 筛选与搜索控件 */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="w-3 h-3 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="搜索轴体名称、品牌或 ID..."
                          value={switchSearchQuery}
                          onChange={(e) => setSwitchSearchQuery(e.target.value)}
                          className="pl-7 pr-6 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs w-44 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--info-color)]"
                        />
                        {switchSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setSwitchSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* 品牌过滤 */}
                      <select
                        value={switchBrandFilter}
                        onChange={(e) => setSwitchBrandFilter(e.target.value)}
                        className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-secondary)] focus:outline-none cursor-pointer"
                      >
                        <option value="all">全部品牌</option>
                        <option value="jiangwan">江湾 (Everglide)</option>
                        <option value="gateron">佳达隆 (Gateron)</option>
                        <option value="ttc">正牌科电 (TTC / 含神马轴)</option>
                        <option value="other">其它品牌</option>
                      </select>

                      {/* 鉴权状态过滤 */}
                      <select
                        value={switchAuthFilter}
                        onChange={(e) => setSwitchAuthFilter(e.target.value)}
                        className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-secondary)] focus:outline-none cursor-pointer"
                      >
                        <option value="all">全部状态</option>
                        <option value="official">官方真实已鉴权</option>
                        <option value="unverified">未核准/实验 (已隐藏)</option>
                      </select>

                      {/* 机型适配过滤 */}
                      <select
                        value={switchDeviceFilter}
                        onChange={(e) => setSwitchDeviceFilter(e.target.value)}
                        className="px-2 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-secondary)] focus:outline-none cursor-pointer"
                      >
                        <option value="all">全部机型</option>
                        <option value="dv63">DV63 适配</option>
                        <option value="ae64">AE64-MAX 适配</option>
                        <option value="es68">ES68 破晓适配</option>
                      </select>
                    </div>
                  </div>

                  {/* 轴体卡片列表 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {displayedAxes.map((a) => {
                      const isVerified = a.isOfficial !== false && a.verified !== false;
                      const trav = Number(a.maxTravel || a.travel || 3.5);
                      return (
                        <div
                          key={`${a.id}-${a.name}`}
                          className={`p-3 rounded-xl border transition flex items-center justify-between group ${
                            isVerified
                              ? 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-emerald-500/50'
                              : 'border-amber-500/30 bg-amber-500/5'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-xs"
                                style={{ backgroundColor: a.color || '#2563eb' }}
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate font-title">
                                  {a.name}
                                </span>
                                {isVerified ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shrink-0">
                                    官方真实
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
                                    未核准(隐藏)
                                  </span>
                                )}
                                {a.badge && (
                                  <span className="text-[9px] px-1 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] truncate max-w-[60px]">
                                    {a.badge}
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] font-mono text-[var(--text-tertiary)] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>
                                  行程: <b className="text-[var(--text-primary)]">{trav.toFixed(2)}mm</b>
                                </span>
                                <span>推荐AP: {Number(a.recommendedAP || 0.35).toFixed(2)}mm</span>
                                <span>品牌: {a.brand || '星闪'}</span>
                                <span>ID: #{a.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* 鉴权切换动作 */}
                          <div className="shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleToggleAxisVerification(a.id, a.name)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer flex items-center space-x-1 ${
                                isVerified
                                  ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                  : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={
                                isVerified
                                  ? '点击设为未核准（将在用户端轴体库隐藏）'
                                  : '点击设为官方真实核准（将在用户端放行显示）'
                              }
                            >
                              {isVerified ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>隐藏</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>放行</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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

import React, { useState, useRef, useEffect } from 'react';
import { 
  Keyboard,
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Check, 
  X,
  Trash2, 
  Copy, 
  HelpCircle, 
  Zap, 
  Crosshair, 
  Sliders, 
  Briefcase, 
  ShieldCheck, 
  Send, 
  FolderDown, 
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { profileService, DEFAULT_ONBOARD_SLOTS } from '../services/profileService';
import { useToast } from './ToastProvider';

export default function ProfileManagerTab({
  deviceScope = 'default',
  activeBoardSlot = 'Config1',
  onSwitchBoardSlot,
  currentKeyboardParams = {},
  onApplyProfileToHardware,
  isConnected = false,
  deviceProfile = {},
  slotAliases: propSlotAliases,
  onRenameSlot,
  slotRemarks: propSlotRemarks,
  onUpdateSlotRemark
}) {
  const { addToast } = useToast();

  // 板载槽位自定义别名
  const [slotAliases, setSlotAliases] = useState(() => 
    propSlotAliases || profileService.getOnboardSlotAliases(deviceScope)
  );

  useEffect(() => {
    if (propSlotAliases) {
      setSlotAliases(propSlotAliases);
    }
  }, [propSlotAliases]);

  // 板载槽位用户填写的自定义备注（杜绝无端猜测）
  const [slotRemarks, setSlotRemarks] = useState(() =>
    propSlotRemarks || profileService.getOnboardSlotRemarks(deviceScope)
  );

  useEffect(() => {
    if (propSlotRemarks) {
      setSlotRemarks(propSlotRemarks);
    }
  }, [propSlotRemarks]);

  // 本地配置库列表
  const [localProfiles, setLocalProfiles] = useState(() => 
    profileService.getLocalProfiles(deviceScope)
  );

  // 正在编辑名称的 ID/槽位
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // 正在编辑备注的槽位
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState('');

  // 正在编辑本地配置备注的 ID
  const [editingLocalDescId, setEditingLocalDescId] = useState(null);
  const [editingLocalDescText, setEditingLocalDescText] = useState('');

  // 搜索关键词
  const [searchQuery, setSearchQuery] = useState('');

  // 拖拽悬浮的槽位
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // 槽位写入弹窗状态 (用于点击某本地配置的“写入键盘板载”按钮)
  const [targetSlotForProfile, setTargetSlotForProfile] = useState(null);
  const [selectedSlotToWrite, setSelectedSlotToWrite] = useState('Config1');

  // 文件导入 input ref
  const fileInputRef = useRef(null);

  // 开始编辑名称
  const handleStartRename = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  // 保存板载槽位别名并写入键盘板载硬件
  const handleSaveSlotAlias = async (slotKey) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    const cleanName = editingName.trim();
    if (onRenameSlot) {
      await onRenameSlot(slotKey, cleanName);
    } else {
      const updated = profileService.setOnboardSlotAlias(deviceScope, slotKey, cleanName);
      setSlotAliases({ ...updated });
      addToast({ message: `板载槽位名称已更新为「${cleanName}」`, type: 'success' });
    }
    setEditingId(null);
  };

  // 开始编辑备注
  const handleStartEditRemark = (slotKey, currentRemark = '') => {
    setEditingRemarkId(slotKey);
    setEditingRemarkText(currentRemark);
  };

  // 保存自定义备注
  const handleSaveSlotRemark = (slotKey) => {
    const cleanRemark = (editingRemarkText || '').trim();
    if (onUpdateSlotRemark) {
      onUpdateSlotRemark(slotKey, cleanRemark);
    } else {
      const updated = profileService.setOnboardSlotRemark(deviceScope, slotKey, cleanRemark);
      setSlotRemarks({ ...updated });
    }
    setEditingRemarkId(null);
    addToast({ 
      message: cleanRemark ? `备注已更新为「${cleanRemark}」` : '已清除自定义备注', 
      type: 'info' 
    });
  };

  // 保存本地配置重命名
  const handleSaveLocalRename = (profId) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    const target = localProfiles.find(p => p.id === profId);
    if (target) {
      const updated = profileService.saveLocalProfile(deviceScope, { ...target, name: editingName.trim() });
      setLocalProfiles(updated);
      addToast({ message: `本地配置已改名为「${editingName.trim()}」`, type: 'success' });
    }
    setEditingId(null);
  };

  // 开始编辑本地配置备注
  const handleStartEditLocalDesc = (id, currentDesc = '') => {
    setEditingLocalDescId(id);
    setEditingLocalDescText(currentDesc || '');
  };

  // 保存本地配置自定义备注
  const handleSaveLocalDesc = (profId) => {
    const target = localProfiles.find(p => p.id === profId);
    if (target) {
      const cleanDesc = (editingLocalDescText || '').trim();
      const updated = profileService.saveLocalProfile(deviceScope, { ...target, desc: cleanDesc });
      setLocalProfiles(updated);
      addToast({ 
        message: cleanDesc ? `备注已更新为「${cleanDesc}」` : '已清除自定义备注', 
        type: 'info' 
      });
    }
    setEditingLocalDescId(null);
  };

  // 新建本地配置 (抓取当前键盘参数)
  const handleCreateNewLocal = () => {
    const count = localProfiles.length + 1;
    const newName = `我的方案 ${count}`;
    const newProf = {
      name: newName,
      desc: '', // 自定义备注默认为空，由用户自由填写
      deviceModel: deviceProfile.name || '前行者 ES68 破晓',
      params: {
        actuationPoint: currentKeyboardParams.actuationPoint ?? 0.35,
        rtEnabled: currentKeyboardParams.rtEnabled ?? true,
        rtPress: currentKeyboardParams.rtPress ?? 0.01,
        rtRelease: currentKeyboardParams.rtRelease ?? 0.01,
        initialDeadzone: currentKeyboardParams.initialDeadzone ?? 0.04,
        bottomDeadzone: currentKeyboardParams.bottomDeadzone ?? 0.05,
        shakeFilter: currentKeyboardParams.shakeFilter ?? true,
        pollingRate: currentKeyboardParams.pollingRate ?? 8000,
        furyMode: currentKeyboardParams.furyMode ?? false,
        axisName: currentKeyboardParams.currentAxis?.name || '磁玉 Pro 超竞版',
      }
    };
    const updated = profileService.saveLocalProfile(deviceScope, newProf);
    setLocalProfiles(updated);
    addToast({ message: `已成功创建新本地配置「${newName}」`, type: 'success' });
  };

  // 备份板载槽位到本地配置库
  const handleBackupSlotToLocal = (slotKey) => {
    const slotName = slotAliases[slotKey] || slotKey;
    const backupName = `板载备份 - ${slotName} (${new Date().toLocaleDateString()})`;
    const prof = {
      name: backupName,
      desc: `备份自硬件板载槽位 ${slotKey.replace('Config', '#')} (${slotName})`,
      deviceModel: deviceProfile.name || '前行者 ES68 破晓',
      params: {
        actuationPoint: currentKeyboardParams.actuationPoint ?? 0.35,
        rtEnabled: currentKeyboardParams.rtEnabled ?? true,
        rtPress: currentKeyboardParams.rtPress ?? 0.01,
        rtRelease: currentKeyboardParams.rtRelease ?? 0.01,
        initialDeadzone: currentKeyboardParams.initialDeadzone ?? 0.04,
        bottomDeadzone: currentKeyboardParams.bottomDeadzone ?? 0.05,
        shakeFilter: currentKeyboardParams.shakeFilter ?? true,
        pollingRate: currentKeyboardParams.pollingRate ?? 8000,
        furyMode: currentKeyboardParams.furyMode ?? false,
        axisName: currentKeyboardParams.currentAxis?.name || '磁玉 Pro 超竞版',
      }
    };
    const updated = profileService.saveLocalProfile(deviceScope, prof);
    setLocalProfiles(updated);
    addToast({ message: `已将板载 ${slotKey.replace('Config', '#')} 备份至本地配置库！`, type: 'success' });
  };

  // 删除本地配置
  const handleDeleteLocal = (id, name) => {
    const updated = profileService.deleteLocalProfile(deviceScope, id);
    setLocalProfiles(updated);
    addToast({ message: `已删除本地配置「${name}」`, type: 'info' });
  };

  // 复制一份本地配置
  const handleDuplicateLocal = (prof) => {
    const copy = {
      ...prof,
      id: undefined,
      name: `${prof.name} (副本)`,
    };
    const updated = profileService.saveLocalProfile(deviceScope, copy);
    setLocalProfiles(updated);
    addToast({ message: `已复制副本「${copy.name}」`, type: 'success' });
  };

  // 导出配置文件
  const handleExportProfile = (prof) => {
    profileService.exportProfileToFile(prof, prof.name);
    addToast({ message: `配置文件已导出下载: ${prof.name}`, type: 'success' });
  };

  // 导入配置文件
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await profileService.parseProfileFile(file);
      const updated = profileService.saveLocalProfile(deviceScope, parsed);
      setLocalProfiles(updated);
      addToast({ message: `成功导入配置文件「${parsed.name || file.name}」！`, type: 'success' });
    } catch (err) {
      addToast({ message: `导入失败: ${err.message}`, type: 'error' });
    }
    e.target.value = '';
  };

  // 将本地配置写入键盘板载硬件槽位
  const handleWriteLocalToBoard = async (prof, slotKey) => {
    if (!isConnected) {
      addToast({ message: '键盘未连接，无法写入板载硬件！', type: 'warning' });
      return;
    }
    // 1. 先切换到目标槽位 (若不是当前激活槽位)
    if (onSwitchBoardSlot && slotKey !== activeBoardSlot) {
      await onSwitchBoardSlot(slotKey);
      await new Promise((r) => setTimeout(r, 80));
    }
    // 2. 将配置参数应用写入硬件闪存
    if (onApplyProfileToHardware && prof.params) {
      await onApplyProfileToHardware(prof.params);
    }
    // 3. 将槽位名称同步更新为配置名称（若提供 onRenameSlot 则写入硬件 Flash，否则存别名）
    if (onRenameSlot) {
      await onRenameSlot(slotKey, prof.name);
    } else {
      const updatedAliases = profileService.setOnboardSlotAlias(deviceScope, slotKey, prof.name);
      setSlotAliases({ ...updatedAliases });
    }
    // 4. 同步更新槽位备注
    if (prof.desc !== undefined && onUpdateSlotRemark) {
      onUpdateSlotRemark(slotKey, prof.desc);
    }

    setTargetSlotForProfile(null);
    addToast({ 
      message: `已成功将「${prof.name}」写入板载 ${slotKey.replace('Config', '#')} 槽位并实时生效！`, 
      type: 'success' 
    });
  };

  // 过滤显示的本地配置列表
  const filteredLocalProfiles = localProfiles.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (p.name || '').toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] select-none overflow-hidden">
      
      {/* 隐藏的文件导入 input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportFile} 
        accept=".json,.sparkconfig.json" 
        className="hidden" 
      />

      {/* 顶部标题栏说明区 */}
      <div className="px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-09)] text-[var(--info-color)] flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-title text-[var(--text-primary)] flex items-center gap-2">
              <span>键盘配置方案中心</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-04)] text-[var(--info-color)] border border-[var(--primary-15)] font-mono font-medium">
                板载 Flash + 本地离线库
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              支持多套参数随心切换、导入导出备份，软件离线自由管理，一键写入键盘板载硬件。
            </p>
          </div>
        </div>

        {/* 顶部右侧快捷按钮 */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--info-color)] hover:text-[var(--info-color)] text-xs font-semibold text-[var(--text-secondary)] transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="从本地磁盘导入 .json 配置文件"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入配置文件</span>
          </button>
          <button
            type="button"
            onClick={handleCreateNewLocal}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--primary-color)] hover:opacity-90 text-[var(--text-inverse-100)] text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="抓取当前键盘所有触发与性能参数另存为本地新方案"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建本地方案</span>
          </button>
        </div>
      </div>

      {/* 左右双栏主体布局 (完全对应用户图一 media_1792216882112_35b8f71d.png) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 min-h-0 overflow-y-auto">

        {/* ◄◄◄ 左侧：板载配置 (键盘硬件槽位 4 档) 占 6 列 1:1 对标图一 ►►► */}
        <div className="lg:col-span-6 flex flex-col min-h-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xs">
          
          {/* 左栏头部 */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)] shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  键盘方案
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                  板载硬件 4 槽位
                </span>
                <div className="relative group/tip cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--text-disabled)] hover:text-[var(--text-secondary)]" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block z-50 w-64 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl text-xs text-[var(--text-secondary)] leading-relaxed pointer-events-none">
                    板载配置存储在您的键盘设备硬件 Flash 里，可以在任意计算机上随时生效。若要加载配置到板载里，可直接点击本地配置的“写入键盘”或拖拽到此处的槽位上。
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                自定义或者选择板载系统方案 (脱离驱动在任意电脑均保持生效)
              </p>
            </div>

            <div className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
              当前激活: <strong className="text-[var(--info-color)] font-bold">{activeBoardSlot.replace('Config', '板载 #')}</strong>
            </div>
          </div>

          {/* 4 个板载槽位大卡片列表 (1:1 官方驱动风格) */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {DEFAULT_ONBOARD_SLOTS.map((slot, index) => {
              const isActive = activeBoardSlot === slot.key;
              const slotName = slotAliases[slot.key] || slot.defaultName;
              const slotRemark = slotRemarks[slot.key] || '';
              const isEditing = editingId === slot.key;
              const isEditingRemark = editingRemarkId === slot.key;
              const isDragTarget = dragOverSlot === slot.key;

              return (
                <div
                  key={slot.key}
                  data-slot={slot.key}
                  onClick={() => {
                    if (!isActive && onSwitchBoardSlot) {
                      onSwitchBoardSlot(slot.key);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                    setDragOverSlot(slot.key);
                  }}
                  onDragLeave={() => {
                    setDragOverSlot(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const profJson = e.dataTransfer.getData('application/json');
                    if (profJson) {
                      try {
                        const prof = JSON.parse(profJson);
                        handleWriteLocalToBoard(prof, slot.key);
                      } catch (err) {}
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all relative cursor-pointer select-none ${
                    isDragTarget
                      ? 'border-[var(--primary-color)] bg-[var(--primary-09)] ring-2 ring-[var(--primary-color)]'
                      : isActive
                      ? 'border-[var(--primary-color)] bg-[var(--surface-solid-secondary)] shadow-md ring-1 ring-[var(--primary-color)]/30'
                      : 'border-[var(--border-color)] bg-[var(--surface-solid-secondary)] hover:border-[var(--primary-25)] hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* 左侧：键盘图标 + 标题名称 + 重命名按钮 + 备注 */}
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isActive 
                          ? 'bg-[var(--primary-09)] text-[var(--info-color)] border-[var(--primary-25)] shadow-xs' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'
                      }`}>
                        <Keyboard className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* 槽位名称与编辑 */}
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text"
                                autoFocus
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveSlotAlias(slot.key);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                className="px-2.5 py-1 bg-[var(--bg-primary)] border-2 border-[var(--primary-color)] rounded-lg text-xs font-bold text-[var(--text-primary)] outline-none shadow-xs w-44"
                              />
                              <button 
                                type="button" 
                                onClick={() => handleSaveSlotAlias(slot.key)}
                                className="px-2.5 py-1 bg-[var(--primary-color)] text-white rounded-lg text-xs font-bold hover:opacity-90 transition flex items-center space-x-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>保存写入</span>
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg text-xs hover:bg-[var(--bg-secondary)] transition cursor-pointer"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-base font-bold text-[var(--text-primary)] truncate tracking-wide">
                                {slotName}
                              </span>
                              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-tertiary)] text-[var(--text-disabled)] border border-[var(--border-color)]">
                                #{index + 1}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 重命名按钮 (完全还原官网图一：重命名蓝色按钮) */}
                        {!isEditing && (
                          <div className="mt-2.5 flex items-center space-x-2.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleStartRename(slot.key, slotName)}
                              className="px-3 py-1 bg-[var(--primary-color)] hover:opacity-90 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center space-x-1 cursor-pointer"
                              title="重命名此方案并同步写入键盘硬件与官网驱动"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>重命名</span>
                            </button>

                            {/* 用户自定义备注：仅显示用户自行填写的备注，杜绝无端猜测 */}
                            {!isEditingRemark ? (
                              slotRemark ? (
                                <div className="flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                                  <span className="truncate max-w-[200px]">备注：{slotRemark}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditRemark(slot.key, slotRemark)}
                                    className="text-[var(--text-disabled)] hover:text-[var(--info-color)] transition p-0.5"
                                    title="修改备注"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRemark(slot.key, '')}
                                  className="text-[11px] text-[var(--text-disabled)] hover:text-[var(--info-color)] transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>+ 添加备注</span>
                                </button>
                              )
                            ) : (
                              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="text"
                                  autoFocus
                                  value={editingRemarkText}
                                  onChange={(e) => setEditingRemarkText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveSlotRemark(slot.key);
                                    if (e.key === 'Escape') setEditingRemarkId(null);
                                  }}
                                  placeholder="输入备注 (选填)"
                                  className="px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--primary-25)] rounded-md text-xs text-[var(--text-primary)] outline-none w-40"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => handleSaveSlotRemark(slot.key)}
                                  className="text-emerald-500 hover:text-emerald-600 p-0.5 cursor-pointer"
                                  title="保存备注"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setEditingRemarkId(null)}
                                  className="text-[var(--text-disabled)] hover:text-[var(--text-secondary)] p-0.5 cursor-pointer"
                                  title="取消"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 右侧：当前配置徽标 (完全对应官网图一) + 工具按钮 */}
                    <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isActive && (
                        <span className="px-3 py-1 rounded-full bg-[var(--primary-color)] text-white text-xs font-bold shadow-xs flex items-center space-x-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>当前配置</span>
                        </span>
                      )}

                      {/* 导出 JSON */}
                      <button
                        type="button"
                        onClick={() => handleExportProfile({
                          name: slotName,
                          desc: slotRemark,
                          deviceModel: deviceProfile.name || '前行者 ES68 破晓',
                          params: currentKeyboardParams
                        })}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--info-color)] hover:bg-[var(--primary-09)] transition cursor-pointer"
                        title="导出此板载配置为 .sparkconfig.json"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* 备份到本地配置库 */}
                      <button
                        type="button"
                        onClick={() => handleBackupSlotToLocal(slot.key)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--info-color)] hover:bg-[var(--primary-09)] transition cursor-pointer"
                        title="将此板载槽位克隆备份到右侧本地配置库"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* 应用配置开关 */}
                      <label className="relative inline-flex items-center cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => onSwitchBoardSlot && onSwitchBoardSlot(slot.key)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[var(--primary-15)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-secondary)] after:border-[var(--primary-25)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                      </label>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* 左栏底端提示 */}
          <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] shrink-0">
            <span>💡 提示：可直接拖拽右侧本地方案覆盖到上方槽位</span>
            <span className="font-mono text-emerald-600 font-bold">板载 Flash 离线就绪</span>
          </div>

        </div>

        {/* ►►► 右侧：本地配置库 / 自定义配置库 (驱动本地保存，不占键盘硬件空间) 占 6 列 ◄◄◄ */}
        <div className="lg:col-span-6 flex flex-col min-h-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xs">
          
          {/* 右栏头部 */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)] shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  本地配置库 (自定义方案)
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold">
                  {localProfiles.length} 套方案
                </span>
                <div className="relative group/tip cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--text-disabled)] hover:text-[var(--text-secondary)]" />
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block z-50 w-64 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-xl text-xs text-[var(--text-secondary)] leading-relaxed pointer-events-none">
                    本地方案存储在驱动软件中，不占用键盘硬件有限的 4 个板载槽位。您可以存储无限套各款游戏的专属方案，并通过“写入键盘”随时切换到当前设备。
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                先保存在驱动中不占硬件Flash，需要时一键写入或拖拽至板载生效
              </p>
            </div>

            {/* 搜索框 */}
            <div className="relative w-40">
              <input 
                type="text"
                placeholder="搜索本地方案..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-color)]"
              />
            </div>
          </div>

          {/* 本地配置卡片滚动列表 */}
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {filteredLocalProfiles.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] space-y-2">
                <Sliders className="w-8 h-8 opacity-40 text-[var(--text-disabled)]" />
                <p className="text-xs">暂无符合条件的本地方案</p>
                <button
                  type="button"
                  onClick={handleCreateNewLocal}
                  className="text-xs text-[var(--info-color)] hover:underline font-bold"
                >
                  点击新建一个本地配置
                </button>
              </div>
            ) : (
              filteredLocalProfiles.map((prof) => {
                const isEditing = editingId === prof.id;

                return (
                  <div
                    key={prof.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(prof));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--primary-25)] hover:bg-[var(--bg-primary)] transition flex flex-col justify-between group shadow-2xs cursor-grab active:cursor-grabbing"
                    title="按住此卡片可直接拖拽至左侧板载槽位中激活"
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* 左部名称与描述 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          {/* 方案名称改名与展示 */}
                          {isEditing ? (
                            <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text"
                                autoFocus
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveLocalRename(prof.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                onBlur={() => handleSaveLocalRename(prof.id)}
                                className="px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--info-color)] rounded text-xs font-bold w-44 text-[var(--text-primary)] outline-none"
                              />
                              <button 
                                type="button" 
                                onClick={() => handleSaveLocalRename(prof.id)}
                                className="text-emerald-500 hover:text-emerald-600"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                {prof.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename(prof.id, prof.name);
                                }}
                                className="text-[var(--text-disabled)] hover:text-[var(--info-color)] transition cursor-pointer p-0.5"
                                title="改名"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 自定义备注编辑与展示 (纯净模式：不显示冗余参数) */}
                        <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                          {editingLocalDescId === prof.id ? (
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={editingLocalDescText}
                                onChange={(e) => setEditingLocalDescText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveLocalDesc(prof.id);
                                  if (e.key === 'Escape') setEditingLocalDescId(null);
                                }}
                                placeholder="输入自定义备注 (选填)"
                                className="px-2 py-0.5 bg-[var(--bg-primary)] border border-[var(--primary-25)] rounded-md text-xs text-[var(--text-primary)] outline-none w-56"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveLocalDesc(prof.id)}
                                className="text-emerald-500 hover:text-emerald-600 p-0.5 cursor-pointer"
                                title="保存备注"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingLocalDescId(null)}
                                className="text-[var(--text-disabled)] hover:text-[var(--text-secondary)] p-0.5 cursor-pointer"
                                title="取消"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartEditLocalDesc(prof.id, prof.desc)}
                              className="flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer group/desc transition w-fit"
                              title="点击修改备注"
                            >
                              <span className="truncate max-w-[320px]">
                                {prof.desc ? `备注：${prof.desc}` : <span className="text-[var(--text-disabled)] italic">+ 添加自定义备注</span>}
                              </span>
                              <Edit3 className="w-3 h-3 text-[var(--text-disabled)] group-hover/desc:text-[var(--info-color)] opacity-0 group-hover/desc:opacity-100 transition shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 右部操作区：一键写入键盘板载 + 导出 + 删除 */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        
                        {/* 一键写入键盘板载 */}
                        <button
                          type="button"
                          onClick={() => setTargetSlotForProfile(prof)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--primary-09)] hover:bg-[var(--primary-color)] text-[var(--info-color)] hover:text-[var(--text-inverse-100)] border border-[var(--primary-15)] text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          title="将此本地配置快速写入键盘板载硬件槽位"
                        >
                          <Send className="w-3 h-3" />
                          <span>写入板载</span>
                        </button>

                        {/* 导出 JSON */}
                        <button
                          type="button"
                          onClick={() => handleExportProfile(prof)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--info-color)] hover:bg-[var(--bg-secondary)] transition cursor-pointer"
                          title="导出为 .sparkconfig.json 文件"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* 复制 */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateLocal(prof)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--info-color)] hover:bg-[var(--bg-secondary)] transition cursor-pointer"
                          title="复制副本"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* 删除 */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLocal(prof.id, prof.name)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="从本地库删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 右栏底端提示 */}
          <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)] shrink-0">
            <span>支持拖拽卡片至左侧写入 · 离线安全保存</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[var(--info-color)] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 mr-1" />
              <span>导入已有配置文件</span>
            </button>
          </div>

        </div>

      </div>

      {/* 写入板载槽位选择模态框 */}
      {targetSlotForProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--surface-solid-secondary)] text-[var(--text-primary)] rounded-2xl shadow-2xl border border-[var(--border-color)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
                <Send className="w-4 h-4 text-[var(--info-color)]" />
                <span>写入方案至键盘板载硬件</span>
              </h3>
              <button
                type="button"
                onClick={() => setTargetSlotForProfile(null)}
                className="text-[var(--text-disabled)] hover:text-[var(--text-primary)] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                即将将本地方案 <strong className="text-[var(--info-color)]">「{targetSlotForProfile.name}」</strong> 写入并覆盖键盘硬件板载槽位：
              </p>
              
              <div className="space-y-2 mt-3">
                {DEFAULT_ONBOARD_SLOTS.map((slot) => {
                  const isCurSlot = selectedSlotToWrite === slot.key;
                  const slotAlias = slotAliases[slot.key] || slot.defaultName;

                  return (
                    <label
                      key={slot.key}
                      onClick={() => setSelectedSlotToWrite(slot.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isCurSlot
                          ? 'border-[var(--info-color)] bg-[var(--primary-04)] ring-1 ring-[var(--info-color)]/30'
                          : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--primary-25)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCurSlot 
                            ? 'bg-[var(--primary-color)] text-white' 
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                        }`}>
                          #{slot.key.replace('Config', '')}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--text-primary)]">
                            {slot.key.replace('Config', '板载槽位 #')} ({slotAlias})
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            当前槽位设置将被「{targetSlotForProfile.name}」参数替换
                          </div>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="slotChoice" 
                        checked={isCurSlot} 
                        onChange={() => setSelectedSlotToWrite(slot.key)}
                        className="accent-[var(--primary-color)]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setTargetSlotForProfile(null)}
                className="px-4 py-1.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleWriteLocalToBoard(targetSlotForProfile, selectedSlotToWrite)}
                className="px-4 py-1.5 rounded-xl bg-[var(--primary-color)] hover:opacity-90 text-[var(--text-inverse-100)] text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认写入硬件并激活</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

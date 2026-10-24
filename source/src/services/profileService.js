/**
 * profileService.js
 * 
 * 键盘方案与配置管理服务：
 * 1. 板载槽位 (Config1~Config4) 别名自定义与本地元数据存储
 * 2. 软件本地配置库 (未写入硬件的独立离线方案)
 * 3. 导入/导出 .sparkconfig.json 配置文件
 * 4. 本地配置一键写入/替换板载硬件配置
 */

const STORAGE_PREFIX = 'sparklink_profiles_';
const ONBOARD_ALIAS_PREFIX = 'sparklink_onboard_aliases_';
const ONBOARD_REMARKS_PREFIX = 'sparklink_onboard_remarks_';
const PROFILE_SETTINGS_PREFIX = 'sparklink_profile_snapshots_';

const OLD_GUESSED_NAMES = ['竞技 FPS', '极速敲击', '日常办公', '自定义'];

export const DEFAULT_ONBOARD_SLOTS = [
  { key: 'Config1', defaultName: '配置一', index: 0, desc: '' },
  { key: 'Config2', defaultName: '配置二', index: 1, desc: '' },
  { key: 'Config3', defaultName: '配置三', index: 2, desc: '' },
  { key: 'Config4', defaultName: '配置四', index: 3, desc: '' },
];

export const profileService = {
  /**
   * 默认单槽位全量配置快照生成器
   */
  defaultSnapshotForSlot(slotKey) {
    const isSlot3 = slotKey === 'Config3';
    return {
      performance: {
        actuationPoint: isSlot3 ? 1.00 : 0.35,
        rtEnabled: !isSlot3,
        rtPress: isSlot3 ? 0.20 : 0.01,
        rtRelease: isSlot3 ? 0.20 : 0.01,
        deadzone: 0.04,
        bottomDeadzone: 0.05,
        shakeFilter: true,
        antiGhosting: true,
        furyMode: false,
        continuousRt: true,
        pollingRate: isSlot3 ? 1000 : 8000,
        perKeyPerformances: {},
      },
      lighting: {
        isLightingOn: true,
        lightingMode: 1,
        selectStaticColor: 0,
        lightingBrightness: 75,
        lightingSpeed: 50,
        lightingDirection: 0,
        currentLightingColor: '#0284C7',
        customKeyColors: {},
      },
      higherKeys: {
        configuredHigherKeys: [],
        socdKeys: { keyA: null, keyB: null },
      },
      keyMappings: {
        win_default: {},
        win_fn: {},
        mac_default: {},
        mac_fn: {},
      },
    };
  },

  /**
   * 获取设备的 4 槽位完整设置独立绑定存储库
   */
  getProfileSettingsStore(deviceScope = 'default') {
    const slots = ['Config1', 'Config2', 'Config3', 'Config4'];
    let store = {};
    try {
      const raw = localStorage.getItem(`${PROFILE_SETTINGS_PREFIX}${deviceScope}`);
      if (raw) {
        store = JSON.parse(raw) || {};
      }
    } catch (e) {
      console.warn('读取配置绑定存储失败:', e);
    }
    slots.forEach(k => {
      if (!store[k]) {
        store[k] = this.defaultSnapshotForSlot(k);
      }
    });
    return store;
  },

  /**
   * 保存设备的 4 槽位设置绑定存储库
   */
  saveProfileSettingsStore(deviceScope, store) {
    try {
      localStorage.setItem(`${PROFILE_SETTINGS_PREFIX}${deviceScope}`, JSON.stringify(store));
    } catch (e) {
      console.error('保存配置绑定存储失败:', e);
    }
  },

  /**
   * 获取指定设备的板载槽位自定义别名
   */
  getOnboardSlotAliases(deviceScope = 'default') {
    const defaults = {
      Config1: '配置一',
      Config2: '配置二',
      Config3: '配置三',
      Config4: '配置四',
    };
    try {
      const raw = localStorage.getItem(`${ONBOARD_ALIAS_PREFIX}${deviceScope}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const res = { ...defaults };
          ['Config1', 'Config2', 'Config3', 'Config4'].forEach((k) => {
            if (parsed[k] && !OLD_GUESSED_NAMES.includes(parsed[k])) {
              res[k] = parsed[k];
            }
          });
          return res;
        }
      }
    } catch (e) {
      console.warn('Failed to parse onboard aliases:', e);
    }
    return defaults;
  },

  /**
   * 批量保存板载槽位别名
   */
  saveOnboardSlotAliases(deviceScope, aliases) {
    try {
      localStorage.setItem(`${ONBOARD_ALIAS_PREFIX}${deviceScope}`, JSON.stringify(aliases));
    } catch (e) {
      console.error('Failed to save onboard aliases:', e);
    }
  },

  /**
   * 设置单个板载槽位别名
   */
  setOnboardSlotAlias(deviceScope, slotKey, name) {
    const current = this.getOnboardSlotAliases(deviceScope);
    const num = slotKey.replace('Config', '');
    current[slotKey] = name.trim() || `配置 ${num}`;
    this.saveOnboardSlotAliases(deviceScope, current);
    return current;
  },

  /**
   * 获取指定设备的板载槽位用户自定义备注（杜绝无端猜测，仅显示用户自行填写的备注）
   */
  getOnboardSlotRemarks(deviceScope = 'default') {
    const defaults = {
      Config1: '',
      Config2: '',
      Config3: '',
      Config4: '',
    };
    try {
      const raw = localStorage.getItem(`${ONBOARD_REMARKS_PREFIX}${deviceScope}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...defaults, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse onboard remarks:', e);
    }
    return defaults;
  },

  /**
   * 设置单个板载槽位自定义备注
   */
  setOnboardSlotRemark(deviceScope, slotKey, remark) {
    const current = this.getOnboardSlotRemarks(deviceScope);
    current[slotKey] = (remark || '').trim();
    try {
      localStorage.setItem(`${ONBOARD_REMARKS_PREFIX}${deviceScope}`, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save onboard remark:', e);
    }
    return current;
  },

  /**
   * 获取本地离线配置库列表
   */
  getLocalProfiles(deviceScope = 'default') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${deviceScope}`);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch (e) {
      console.warn('Failed to parse local profiles:', e);
    }

    // 默认内置的常用本地电竞推荐模版（离线开箱即用）
    const defaults = [
      {
        id: 'tpl_cs2_rt',
        name: 'CS2 职业急停特调 (RT 0.01mm)',
        isPreset: true,
        desc: '瓦罗兰特 / CS2 急停特调：AP 0.35mm，RT 按下 0.01mm，释放 0.01mm，顶部死区 0.02mm',
        updatedAt: Date.now() - 86400000 * 2,
        params: {
          actuationPoint: 0.35,
          rtEnabled: true,
          rtPress: 0.01,
          rtRelease: 0.01,
          initialDeadzone: 0.02,
          bottomDeadzone: 0.04,
          shakeFilter: true,
          pollingRate: 8000,
          furyMode: true,
          axisName: '磁玉 Pro 超竞版',
        }
      },
      {
        id: 'tpl_val_comp',
        name: '无畏契约 破晓超敏特调',
        isPreset: true,
        desc: '极限灵敏：AP 0.20mm，RT 0.005mm，8000Hz 极速轮询',
        updatedAt: Date.now() - 86400000 * 5,
        params: {
          actuationPoint: 0.20,
          rtEnabled: true,
          rtPress: 0.005,
          rtRelease: 0.005,
          initialDeadzone: 0.01,
          bottomDeadzone: 0.03,
          shakeFilter: true,
          pollingRate: 8000,
          furyMode: true,
          axisName: '磁玉 Pro',
        }
      },
      {
        id: 'tpl_daily_typing',
        name: '日常防误触打字办公',
        isPreset: true,
        desc: '舒适办公：AP 1.50mm，关闭 RT 避免轻触误输入，1000Hz 节能低功耗',
        updatedAt: Date.now() - 86400000 * 10,
        params: {
          actuationPoint: 1.50,
          rtEnabled: false,
          rtPress: 0.20,
          rtRelease: 0.20,
          initialDeadzone: 0.08,
          bottomDeadzone: 0.08,
          shakeFilter: true,
          pollingRate: 1000,
          furyMode: false,
          axisName: '磁玉 Pro',
        }
      }
    ];

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${deviceScope}`, JSON.stringify(defaults));
    } catch (e) {}

    return defaults;
  },

  /**
   * 保存或更新本地配置
   */
  saveLocalProfile(deviceScope, profile) {
    const list = this.getLocalProfiles(deviceScope);
    const now = Date.now();
    let updatedList;

    if (profile.id) {
      const idx = list.findIndex(p => p.id === profile.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...profile, updatedAt: now };
        updatedList = [...list];
      } else {
        updatedList = [{ ...profile, id: profile.id, updatedAt: now }, ...list];
      }
    } else {
      const newProf = {
        ...profile,
        id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        updatedAt: now,
      };
      updatedList = [newProf, ...list];
    }

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${deviceScope}`, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save local profiles:', e);
    }
    return updatedList;
  },

  /**
   * 删除本地配置
   */
  deleteLocalProfile(deviceScope, id) {
    const list = this.getLocalProfiles(deviceScope);
    const filtered = list.filter(p => p.id !== id);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${deviceScope}`, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete profile:', e);
    }
    return filtered;
  },

  /**
   * 导出配置文件为 .sparkconfig.json
   */
  exportProfileToFile(profile, defaultName = '键盘配置方案') {
    const exportData = {
      format: 'SPARKLINK_KEYBOARD_PROFILE',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      profile: {
        name: profile.name || defaultName,
        desc: profile.desc || '',
        deviceModel: profile.deviceModel || '前行者 ES68 破晓',
        params: profile.params || {},
        customKeyMappings: profile.customKeyMappings || {},
        advancedKeys: profile.advancedKeys || [],
        lightingConfig: profile.lightingConfig || {}
      }
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (profile.name || defaultName).replace(/[/\\?%*:|"<>]/g, '_');
    link.download = `${safeName}_${new Date().toISOString().slice(0, 10)}.sparkconfig.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * 从文件解析配置 JSON 对象
   */
  parseProfileFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.profile) {
            resolve(parsed.profile);
          } else if (parsed.name && parsed.params) {
            resolve(parsed);
          } else {
            // 兼容其他格式（如纯参数字典）
            resolve({
              name: file.name.replace(/\.[^/.]+$/, ''),
              params: parsed
            });
          }
        } catch (err) {
          reject(new Error('配置文件格式错误，无法解析为有效的 JSON'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }
};

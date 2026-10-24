// 星闪悦动轴体库与校准服务
// 针对 VICTKONG DV63 磁轴键盘及星闪官方轴体 SKU 校准体系
import { keyboardService } from './keyboardService.js';
import cachedAxes from '../constants/officialAxisCache.json' with { type: 'json' };
import ae64AxisListV3 from '../constants/ae64AxisListV3.json' with { type: 'json' };

// 核心出厂与推荐磁轴校准 SKU (针对不同键盘部署原生出厂轴体，公模/客制化默认搭载磁玉 Pro)
const RAW_PRIMARY_AXES = [
  {
    id: 788,
    hardwareAxisId: 788,
    axisV2Id: 12608,
    axisRangeMax: 3550,
    axisCoefficient: 18600,
    name: '天际线轴',
    shortName: '天际线',
    brand: '其它品牌',
    maxTravel: 3.55,
    driveRange: 3.35,
    deadzone: 0.20,
    color: '#4dd1f9',
    badge: '高导光柱',
    recommendedAP: 0.35,
    description: '天际线磁轴，高导光柱，极速回弹，3.55mm 黄金行程 (官方 V3 归类于其它客制化兼容轴)。',
  },
  {
    id: 1219,
    hardwareAxisId: 1219,
    axisV2Id: 19504,
    axisRangeMax: 3600,
    axisCoefficient: 19456,
    name: '库里南轴',
    shortName: '库里南',
    brand: '江湾 (Everglide)',
    maxTravel: 3.60,
    driveRange: 3.40,
    deadzone: 0.20,
    color: '#eaeaea',
    badge: '江湾原厂自研',
    recommendedAP: 0.40,
    description: '江湾原厂自研库里南磁轴 (江湾唯一原厂自制旗舰磁轴)，双轨超顺滑，HiFi 敲击音。',
  },
  {
    id: 1002,
    hardwareAxisId: 102,
    axisV2Id: 1632,
    axisRangeMax: 3450,
    axisCoefficient: 20000,
    name: '神马轴',
    shortName: '神马',
    brand: '正牌科电 (TTC)',
    maxTravel: 3.45,
    driveRange: 3.25,
    deadzone: 0.20,
    color: '#2563eb',
    badge: 'TTC原厂标配',
    recommendedAP: 0.35,
    description: 'TTC 正牌科电神马磁轴 (VICTKONG DV63 原厂出厂标配)，初始高磁通，手感清脆顺滑，支持 0.001mm 极限响应。',
  },
  {
    id: 258,
    hardwareAxisId: 258,
    axisV2Id: 4128,
    axisRangeMax: 3390,
    axisCoefficient: 20000,
    name: '磁玉 Pro',
    shortName: '磁玉Pro',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.39,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#70cb9a',
    badge: '佳达隆标配',
    recommendedAP: 0.40,
    description: '佳达隆原厂磁玉 Pro 磁轴，双轨结构，高透光上盖，顺滑低抖，出色的 HiFi 声音表现。',
  },
  {
    id: 1003,
    hardwareAxisId: 258,
    axisV2Id: 4128,
    axisRangeMax: 3390,
    axisCoefficient: 20000,
    name: '磁玉 Pro 超竞版',
    shortName: '磁玉超竞',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.39,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#3b82f6',
    badge: '超竞特调',
    recommendedAP: 0.35,
    description: '佳达隆特调定制超竞版磁轴，双轨结构，高频电竞调校，极速触发。',
  },
  {
    id: 257,
    hardwareAxisId: 257,
    axisV2Id: 4112,
    axisRangeMax: 3430,
    axisCoefficient: 22800,
    name: '磁玉轴',
    shortName: '磁玉',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.43,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a04444',
    badge: '经典HiFi',
    recommendedAP: 0.40,
    description: '全POM材质，顺滑度极高，经典声音表现。',
  },
  {
    id: 259,
    hardwareAxisId: 259,
    axisV2Id: 4144,
    axisRangeMax: 3400,
    axisCoefficient: 19000,
    name: '磁玉 Gaming',
    shortName: '磁玉Gaming',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.40,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a7e1d6',
    badge: '电竞强化',
    recommendedAP: 0.35,
    description: '聚光大通孔，触发行程短，回弹跟手迅速。',
  },
  {
    id: 3,
    hardwareAxisId: 3,
    axisV2Id: 48,
    axisRangeMax: 3500,
    axisCoefficient: 20000,
    name: 'TTC 万磁王',
    shortName: '万磁王',
    brand: 'TTC',
    maxTravel: 3.50,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#5f3873',
    badge: '极速响应',
    recommendedAP: 0.30,
    description: '聚光镜大通孔设计，初始磁通量高，RT 响应极佳。',
  },
  {
    id: 2,
    hardwareAxisId: 2,
    axisV2Id: 32,
    axisRangeMax: 3400,
    axisCoefficient: 20000,
    name: 'TTC 万磁王 RGB',
    shortName: '万磁王RGB',
    brand: 'TTC',
    maxTravel: 3.40,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a04444',
    badge: 'RGB聚光',
    recommendedAP: 0.30,
    description: '全透聚光柱设计，灯光效果拔群。',
  },
  {
    id: 8,
    hardwareAxisId: 8,
    axisV2Id: 128,
    axisRangeMax: 4000,
    axisCoefficient: 20000,
    name: '佳达隆双轨磁白轴',
    shortName: '双轨磁白',
    brand: '佳达隆 (GATERON)',
    maxTravel: 4.00,
    driveRange: 3.80,
    deadzone: 0.20,
    color: '#c45353',
    badge: '经典电竞',
    recommendedAP: 0.35,
    description: '双轨导向结构，4.0mm 舒适触发行程，手感顺滑。',
  },
];

export const PRIMARY_AXES = RAW_PRIMARY_AXES.map((a) => ({
  ...a,
  travel: a.maxTravel,
  isOfficial: true,
  verified: true,
}));

// 向后兼容 DV63 引用
export const DV63_PRIMARY_AXES = PRIMARY_AXES;

/**
 * 依据连接的键盘机型精准匹配对应的出厂默认轴体（联网实测核准）：
 * 1. AE64-MAX (江湾) -> 天际线轴 (3.55mm 江湾原厂出厂标配，axisV2Id: 12608)
 * 2. VICTKONG DV63 -> 神马轴 (3.45mm 原厂出厂标配)
 * 3. ES68 (前行者破晓) -> 佳达隆磁玉 Pro 超竞版 (3.50mm 官方特调定制超竞版出厂标配)
 * 4. 公模键盘 / 客制化 PCB -> 默认天际线轴或磁玉 Pro
 */
export function getDefaultAxisForProfile(profile) {
  const pId = (profile?.id || '').toLowerCase();
  const model = (profile?.model || '').toLowerCase();
  const defName = profile?.defaultAxis;
  if (defName) {
    const matched = PRIMARY_AXES.find(a => a.name === defName);
    if (matched) return matched;
  }
  if (pId.includes('ae64') || model.includes('ae64')) {
    return PRIMARY_AXES.find(a => a.name === '天际线轴') || PRIMARY_AXES[0];
  }
  if (pId === 'dv63' || model.includes('dv63')) {
    return PRIMARY_AXES.find(a => a.name === '神马轴') || PRIMARY_AXES[2];
  }
  if (pId === 'es68' || model.includes('es68')) {
    return PRIMARY_AXES.find(a => a.name === '磁玉 Pro 超竞版') || PRIMARY_AXES[3];
  }
  return PRIMARY_AXES.find(a => a.name === '天际线轴') || PRIMARY_AXES.find(a => a.name === '磁玉 Pro') || PRIMARY_AXES[0];
}

// 规范化轴体归一化名称（去除空格、大小写、后缀“轴”，用于精准去重）
export function getAxisCanonicalKey(name) {
  if (!name) return '';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/轴$/, '');
}

/**
 * 依据硬件 Esc/Space 键底层上报的电气性能结构实时解密真实轴体：
 * 实测：AE64-MAX 固件返回 { axis: 0, axisV2Id: 12608, axisRangeMax: 3550, axisCoefficient: 18600 }
 * 对应官网 V3 轴体库: detailId 12608 -> 天际线轴 (3.55mm, 其它品牌客制化兼容轴)
 * 江湾原厂自研轴体: 库里南轴 (axisV2Id: 19504, 3.60mm, 江湾唯一原厂自制旗舰磁轴)
 * 佳达隆磁玉Pro: axisV2Id: 4128, axisRangeMax: 3390, axisCoefficient: 20000
 * 佳达隆磁玉轴: axisV2Id: 4112, axisRangeMax: 3430, axisCoefficient: 22800
 */
export function resolveAxisByHardwarePerf(perf, profile, candidateList = null) {
  if (!perf) return getDefaultAxisForProfile(profile);

  const list = Array.isArray(candidateList) && candidateList.length > 0 ? candidateList : PRIMARY_AXES;

  // 1. 优先根据硬件上报的真实 axisV2Id 精准匹配
  const v2Id = Number(perf.axisV2Id);
  if (v2Id && v2Id > 0) {
    if (v2Id === 12608 || v2Id === 13472) {
      const match = list.find(a => a.name === '天际线轴');
      if (match) return match;
    }
    if (v2Id === 19504) {
      const match = list.find(a => a.name === '库里南轴');
      if (match) return match;
    }
    if (v2Id === 4128) {
      const match = list.find(a => a.name === '磁玉 Pro' || a.name === '磁玉Pro');
      if (match) return match;
    }
    if (v2Id === 4112) {
      const match = list.find(a => a.name === '磁玉轴');
      if (match) return match;
    }
    const foundV2 = list.find(a => Number(a.axisV2Id) === v2Id);
    if (foundV2) return foundV2;

    const baseId = Math.floor(v2Id / 16);
    const foundById = list.find(a => Number(a.id) === baseId || Number(a.hardwareAxisId) === baseId);
    if (foundById) return foundById;
  }

  // 2. 根据硬件上报的真实行程极限 axisRangeMax 精准匹配 (3550 -> 3.55mm 天际线轴)
  const rangeMax = Number(perf.axisRangeMax);
  if (rangeMax && rangeMax > 0) {
    if (rangeMax === 3550 || rangeMax === 3500) {
      const match = list.find(a => a.name === '天际线轴');
      if (match) return match;
    }
    if (rangeMax === 3600) {
      const match = list.find(a => a.name === '库里南轴');
      if (match) return match;
    }
    if (rangeMax === 3390) {
      const match = list.find(a => a.name === '磁玉 Pro' || a.name === '磁玉Pro');
      if (match) return match;
    }
    if (rangeMax === 3430) {
      const match = list.find(a => a.name === '磁玉轴');
      if (match) return match;
    }
    if (rangeMax === 3450) {
      const match = list.find(a => a.name === '神马轴');
      if (match) return match;
    }
    const foundByRange = list.find(a => Number(a.axisRangeMax) === rangeMax);
    if (foundByRange) return foundByRange;
  }

  // 3. 根据硬件 axis id 匹配 (v1 模式)
  if (perf.axis !== undefined && perf.axis !== null && perf.axis > 0) {
    const foundAxis = list.find(a => a.hardwareAxisId === perf.axis || a.id === perf.axis);
    if (foundAxis) return foundAxis;
  }

  // 4. 回退到设备机型默认
  return getDefaultAxisForProfile(profile);
}

class AxisService {
  constructor() {
    this.axes = [...PRIMARY_AXES];
    this.isLoaded = false;
    this.isLoading = false;
    this.activeAxis = PRIMARY_AXES[0];
    // 构造阶段依据官方 V3 认证库严格构建（绝不引入未经认证的杂质轴体）
    this.rebuildAxes(ae64AxisListV3, null);
  }

  resolveAxisByHardwarePerf(perf, profile) {
    return resolveAxisByHardwarePerf(perf, profile, this.axes);
  }

  // 核心官方轴体重构器：以官方 ae64AxisListV3 (75款) 为严格鉴权基准
  // 品牌精确划分：江湾 (1款: 库里南轴), 佳达隆 (30款), 正牌科电 (19款), 其它品牌 (25款)
  // 每款轴体均包含官方真实 axis_range_max 行程与 axis_coefficient 磁通量电气参数
  rebuildAxes(v3Categories = ae64AxisListV3, cloudList = null) {
    const unifiedList = [];
    const seenKeys = new Map();

    // 1. 优先融入官方 V3 分类轴体库 (优先保留官方 aixsDetail 真实电气参数与分类)
    if (Array.isArray(v3Categories)) {
      v3Categories.forEach((cat) => {
        if (!Array.isArray(cat?.list)) return;
        cat.list.forEach((raw) => {
          if (!raw || raw.axis_id === undefined) return;
          const k = getAxisCanonicalKey(raw.axis_name);
          const detail = raw.aixsDetail?.[0] || {};
          const detailId = detail.axis_id ?? (Number(raw.axis_id) << 4);
          const rangeMax = Number(detail.axis_range_max || raw.axis_range_max || 3550);
          const coeff = Number(detail.axis_coefficient || 20000);
          const maxTravel = Number((rangeMax / 1000).toFixed(2));
          const driveRange = Number((Math.max(1000, rangeMax - 200) / 1000).toFixed(2));
          const imgUrl = raw.image_url && raw.image_url !== '#' ? raw.image_url : null;
          const brandName = cat.type_name === '江湾' ? '江湾 (Everglide)' : (cat.type_name === '其它' ? '其它品牌' : (cat.type_name || raw.brand || '星闪校准'));

          const newItem = {
            id: Number(raw.axis_id),
            hardwareAxisId: Number(raw.axis_id),
            axisV2Id: detailId,
            axisRangeMax: rangeMax,
            axisCoefficient: coeff,
            name: raw.axis_name,
            shortName: raw.axis_name,
            brand: brandName,
            maxTravel,
            travel: maxTravel,
            driveRange,
            deadzone: 0.20,
            color: raw.axis_color ? (raw.axis_color.startsWith('#') ? raw.axis_color : '#' + raw.axis_color) : '#4dd1f9',
            imageUrl: imgUrl,
            badge: brandName.includes('江湾') ? '江湾原厂自研' : (brandName.includes('TTC') ? 'TTC原厂' : '官方认证'),
            recommendedAP: 0.35,
            isOfficial: true,
            verified: true,
            description: `${brandName} ${raw.axis_name} 磁轴，行程 ${maxTravel}mm (官方 V3 校准)`
          };

          // 匹配 PRIMARY_AXES 中出厂定制的增强描述或推荐 AP
          const primaryMatch = PRIMARY_AXES.find(p => getAxisCanonicalKey(p.name) === k);
          if (primaryMatch) {
            newItem.badge = primaryMatch.badge || newItem.badge;
            newItem.recommendedAP = primaryMatch.recommendedAP || newItem.recommendedAP;
            if (primaryMatch.description) newItem.description = primaryMatch.description;
            if (primaryMatch.color) newItem.color = primaryMatch.color;
          }

          seenKeys.set(k, newItem);
          unifiedList.push(newItem);
        });
      });
    }

    // 2. 仅在显式传入特定设备扩展 cloudList 时才按键追加 (杜绝无限制全局混入)
    if (Array.isArray(cloudList) && cloudList.length > 0) {
      cloudList.forEach((raw) => {
        if (!raw || raw.axis_id === undefined) return;
        const k = getAxisCanonicalKey(raw.axis_name);
        const imgUrl = raw.image_url && raw.image_url !== '#' ? raw.image_url : null;

        if (seenKeys.has(k)) {
          const existing = seenKeys.get(k);
          if (!existing.imageUrl && imgUrl) existing.imageUrl = imgUrl;
        } else {
          const id = Number(raw.axis_id);
          const maxTravel = parseFloat(raw.doctrine_range_left || raw.drive_range || 3.50);
          const driveRange = parseFloat(raw.drive_range || raw.doctrine_range_left || 3.30);
          const deadzone = parseFloat(raw.doctrine_range_right || 0.20);
          const safeTravel = maxTravel > 0 ? maxTravel : 3.50;
          const brand = raw.factory_name || raw.brand || (typeof raw.axi_brands === 'object' ? raw.axi_brands?.brand_name_cn : '') || '其它品牌';
          const newItem = {
            id,
            hardwareAxisId: id,
            axisV2Id: id << 4,
            axisRangeMax: Math.round(safeTravel * 1000),
            axisCoefficient: 20000,
            name: raw.axis_name,
            shortName: raw.axis_name,
            brand,
            maxTravel: safeTravel,
            travel: safeTravel,
            driveRange: driveRange > 0 ? driveRange : safeTravel,
            deadzone,
            color: raw.axis_color ? (raw.axis_color.startsWith('#') ? raw.axis_color : '#' + raw.axis_color) : '#2563eb',
            imageUrl: imgUrl,
            badge: raw.factory_name ? `${raw.factory_name}原厂` : '星闪校准',
            recommendedAP: 0.40,
            description: `${brand} ${raw.axis_name} 磁轴，行程 ${safeTravel}mm (有效行程 ${driveRange}mm)`,
            isOfficial: true,
            verified: true,
          };
          seenKeys.set(k, newItem);
          unifiedList.push(newItem);
        }
      });
    }

    this.axes = unifiedList;
    return this.axes;
  }

  // 获取完整轴体校准列表（严格采用官方 75 款认证轴体库）
  async loadAxisList() {
    if (this.isLoaded) return this.axes;
    this.isLoading = true;

    // 直接加载官方 V3 认证 75 款轴体库（江湾 1款，佳达隆 30款，正牌科电 19款，其它 25款）
    this.rebuildAxes(ae64AxisListV3, null);
    this.isLoaded = true;
    this.isLoading = false;
    return this.axes;
  }

  // 针对已连接键盘动态拉取官方 V3 分类轴体库 (若键盘提供 boardId / vid / pid)
  async loadAxisListV3({ boardId, vid, pid }) {
    if (!boardId && !vid && !pid) return this.axes;
    try {
      const bId = String(boardId || '').includes('0x')
        ? String(boardId).replace('0x', '').padStart(8, '0')
        : Number(boardId || 0).toString(16).padStart(8, '0');
      const v = typeof vid === 'number' ? vid.toString(16).padStart(4, '0') : String(vid || '').padStart(4, '0');
      const p = typeof pid === 'number' ? pid.toString(16).padStart(4, '0') : String(pid || '').padStart(4, '0');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = `https://api.sparklinkplayjoy.com/api/v1/getAxisListV3?board_id=${bId}&vid=${v}&pid=${p}&t=${Date.now()}`;
      
      const resp = await fetch(url, {
        headers: {
          'Xs-API-Key': '860DE3DB584158536BC89030D8640E29',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const json = await resp.json();
        if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
          console.log('[AxisService] 成功从星闪云端拉取当前键盘专有 V3 轴体库:', json.data.length, '个分类');
          this.rebuildAxes(json.data, cachedAxes);
          return this.axes;
        }
      }
    } catch (err) {
      console.warn('[AxisService] 键盘专有 V3 轴体库拉取略过:', err);
    }
    return this.axes;
  }

  mergeV3Axes(v3Categories) {
    return this.rebuildAxes(v3Categories, cachedAxes);
  }

  mergeCloudAxes(cloudList) {
    return this.rebuildAxes(ae64AxisListV3, cloudList);
  }

  // 获取全部轴体（默认过滤掉未鉴权/未核准的实验轴体，实现鉴权门禁）
  getAllAxes(includeUnverified = false) {
    if (includeUnverified) return this.axes;
    return this.axes.filter((a) => a.verified !== false && a.isOfficial !== false);
  }

  // 依据当前键盘 Profile 过滤其硬件适配的轴体库
  // 成品键盘（如 DV63、ES68、AE64-MAX）出厂固件针对特定轴体标定，读取并限制显示其对应支持列表
  // 若键盘未做限制（客制化/开源PCB），或用户选择强制浏览全库，则放行全部已鉴权轴体
  getSupportedAxesForProfile(profile, forceAll = false) {
    const verifiedAxes = this.getAllAxes(false);
    if (forceAll) return verifiedAxes;
    const supported = profile?.supportedSwitches;
    if (Array.isArray(supported) && supported.length > 0) {
      const supSet = new Set(supported.map((s) => s.toLowerCase().replace(/\s+/g, '')));
      const matched = verifiedAxes.filter((a) => {
        const n = (a.name || '').toLowerCase().replace(/\s+/g, '');
        const sn = (a.shortName || '').toLowerCase().replace(/\s+/g, '');
        if (supSet.has(n) || supSet.has(sn)) return true;
        return supported.some((key) => {
          const cleanKey = key.toLowerCase().replace(/\s+/g, '');
          return n.includes(cleanKey) || cleanKey.includes(n);
        });
      });
      if (matched.length > 0) return matched;
    }
    return verifiedAxes;
  }

  // 轴体库全景统计与鉴权分析
  getAxisStats() {
    const total = this.axes.length;
    const official = this.axes.filter((a) => a.isOfficial !== false && a.verified !== false).length;
    const unverified = total - official;
    const brands = {};
    this.axes.forEach((a) => {
      const b = a.brand || '其它';
      brands[b] = (brands[b] || 0) + 1;
    });
    return {
      total,
      official,
      unverified,
      brands,
      sources: [
        {
          name: 'ae64AxisListV3.json',
          desc: '官网 V3 轴体映射库 (分品牌分类)',
          count: Array.isArray(ae64AxisListV3) ? ae64AxisListV3.reduce((s, c) => s + (c.list?.length || 0), 0) : 0,
        },
        {
          name: 'officialAxisCache.json',
          desc: '星闪云端 API 全量轴体缓存 (真实官方鉴权)',
          count: Array.isArray(cachedAxes) ? cachedAxes.length : 0,
        },
        {
          name: 'PRIMARY_AXES',
          desc: '出厂硬件特调与推荐标配 SKU',
          count: PRIMARY_AXES.length,
        },
      ],
    };
  }

  // 切换单个轴体的鉴权/可见状态 (开发者管理面板)
  toggleAxisVerification(id) {
    const axis = this.axes.find((a) => a.id === id);
    if (axis) {
      const current = axis.verified !== false && axis.isOfficial !== false;
      axis.verified = !current;
      axis.isOfficial = !current;
      return axis.verified;
    }
    return false;
  }

  // 导出全量轴体数据库 JSON
  exportAxisDbJson() {
    return JSON.stringify(
      {
        version: '2026.10.24',
        exportedAt: new Date().toISOString(),
        total: this.axes.length,
        officialCount: this.axes.filter((a) => a.verified !== false).length,
        axes: this.axes,
      },
      null,
      2
    );
  }

  // 导入自定义新轴体校准配置
  importCustomAxis(axisData) {
    if (!axisData || !axisData.name) throw new Error('无效的轴体数据：缺少名称');
    const id = axisData.id || Math.max(...this.axes.map((a) => a.id), 2000) + 1;
    const maxTravel = parseFloat(axisData.maxTravel || axisData.travel || 3.5);
    const newAxis = {
      id,
      hardwareAxisId: axisData.hardwareAxisId || id,
      name: axisData.name,
      shortName: axisData.shortName || axisData.name,
      brand: axisData.brand || '客制化/第三方',
      maxTravel,
      travel: maxTravel,
      driveRange: parseFloat(axisData.driveRange || maxTravel - 0.2),
      deadzone: parseFloat(axisData.deadzone || 0.2),
      color: axisData.color || '#3b82f6',
      badge: axisData.badge || '自定义标定',
      recommendedAP: parseFloat(axisData.recommendedAP || 0.35),
      isOfficial: !!axisData.isOfficial,
      verified: !!axisData.verified,
      description: axisData.description || `自定义磁轴 ${axisData.name}`,
    };
    const existingIdx = this.axes.findIndex((a) => a.id === id || a.name === axisData.name);
    if (existingIdx >= 0) {
      this.axes[existingIdx] = newAxis;
    } else {
      this.axes.push(newAxis);
    }
    return newAxis;
  }

  // 重置回官方出厂基线
  resetToOfficialAxes() {
    this.isLoaded = false;
    this.axes = [...PRIMARY_AXES];
    return this.loadAxisList();
  }

  // 根据轴体名称获取配置
  getAxisByName(name) {
    if (!name) return DV63_PRIMARY_AXES[0];
    const norm = name.toLowerCase().replace(/\s+/g, '');
    return this.axes.find((a) => a.name === name || a.name.toLowerCase().replace(/\s+/g, '') === norm) || DV63_PRIMARY_AXES[0];
  }

  // 根据 ID 获取配置
  getAxisById(id) {
    return this.axes.find((a) => a.id === id || a.hardwareAxisId === id) || DV63_PRIMARY_AXES[0];
  }

  // 将选中的轴体下发到硬件并保存
  async applyAxisToKeyboard(axis, profile = null) {
    if (!axis) return { success: false, reason: 'missing_axis' };

    // 严苛库存隔离安全门禁：当键盘启用了 isolateSwitches，严禁将未适配的异构轴体写入固件，避免轴体映射乱码或固件崩溃
    if (profile && profile.isolateSwitches && Array.isArray(profile.supportedSwitches)) {
      const allowed = profile.supportedSwitches.some((name) => {
        const cleanName = name.toLowerCase().replace(/\s+/g, '');
        const targetName = (axis.name || '').toLowerCase().replace(/\s+/g, '');
        const targetShort = (axis.shortName || '').toLowerCase().replace(/\s+/g, '');
        return cleanName === targetName || cleanName === targetShort || targetName.includes(cleanName) || cleanName.includes(targetName);
      });
      if (!allowed) {
        console.warn(`[AxisService] 键盘【${profile.model || profile.name}】已启用库存严格隔离，已安全拦截写入不支持轴体: ${axis.name}`);
        throw new Error(`当前键盘(${profile.shortName || profile.model})出厂硬件不支持【${axis.name}】，写入会导致轴体识别错乱或固件异常，已安全拦截！`);
      }
    }

    this.activeAxis = axis;
    if (keyboardService.connected) {
      try {
        const hwId = axis.hardwareAxisId ?? (axis.id <= 255 ? axis.id : 1);
        await keyboardService.setDefaultAxis(hwId);
        console.log(`[AxisService] 已同步默认轴体到键盘: ${axis.name} (硬件ID: ${hwId})`);
        return { success: true, hwId };
      } catch (e) {
        console.warn('[AxisService] 同步到键盘硬件略过:', e);
        return { success: false, error: e.message };
      }
    }
    return { success: true, offline: true };
  }

  /**
   * 硬件板载轴体探针引擎 (PCB Axis Probe)
   * 穿透连接的键盘底层，实时读取硬件固件中烧录的轴体表 (getAxisList, getDefaultAxis, 按键电气寄存器)
   * 并全自动与官方 75 款/220+ 款轴体库比对映射，生成支持列表与专属配置 JSON
   */
  async probePcbSupportedAxes(service = keyboardService, profile = null) {
    const probeReport = {
      timestamp: new Date().toISOString(),
      connected: !!service?.connected,
      deviceModel: profile?.model || profile?.name || '未知键盘',
      rawList: [],
      rawDefault: null,
      escPerformance: null,
      resolvedSwitches: [],
      supportedSwitchNames: [],
      unmatchedCount: 0,
      codeSnippet: '',
    };

    if (!service || !service.connected) {
      probeReport.error = '键盘未连接，无法执行硬件探针';
      return probeReport;
    }

    try {
      // 1. 获取硬件板载支持轴体列表 (官方 SDK ServiceKeyboard.getAxisList)
      if (typeof service.getAxisList === 'function') {
        const axisListRes = await service.getAxisList();
        if (axisListRes) {
          const rawItems = Array.isArray(axisListRes) 
            ? axisListRes 
            : (axisListRes.axisList || axisListRes.list || []);
          // 过滤掉硬件固件填充的 0 (占位字节)
          probeReport.rawList = rawItems.filter((id) => typeof id === 'number' ? id > 0 : !!id);
          probeReport.hasAxisSetting = axisListRes.hasAxisSetting ?? (probeReport.rawList.length > 0);
          probeReport.isV3Protocol = probeReport.rawList.length === 0;
        }
      }

      // 2. 获取当前固件默认轴体
      if (typeof service.getDefaultAxis === 'function') {
        const defRes = await service.getDefaultAxis();
        if (defRes !== undefined && defRes !== null) {
          probeReport.rawDefault = typeof defRes === 'object' ? (defRes.id ?? defRes.value) : defRes;
        }
      }

      // 3. 读取 Esc (Row 1, Col 0) 的硬件电气寄存器参数
      if (typeof service.getPerformance === 'function') {
        try {
          const escPerf = await service.getPerformance(1, 0);
          if (escPerf) {
            probeReport.escPerformance = {
              axis: escPerf.axis,
              axisV2Id: escPerf.axisV2Id,
              axisRangeMax: escPerf.axisRangeMax,
              axisCoefficient: escPerf.axisCoefficient,
              ap: escPerf.normalPress,
              rt: escPerf.rtFirstTouch,
            };
          }
        } catch (e) {
          console.warn('[AxisService Probe] 读取 Esc 键电气参数跳过:', e);
        }
      }

      // 4. 解析与映射轴体表
      const resolved = [];
      const seenNames = new Set();

      // 先加入 Esc 键识别出的真实轴体 (若有)
      if (probeReport.escPerformance) {
        const fromPerf = this.resolveAxisByHardwarePerf(probeReport.escPerformance, profile);
        if (fromPerf && fromPerf.name && !seenNames.has(fromPerf.name)) {
          seenNames.add(fromPerf.name);
          resolved.push({ ...fromPerf, source: 'hardware_esc_active' });
        }
      }

      // 遍历硬件返回的 rawList
      probeReport.rawList.forEach((item) => {
        const rawId = typeof item === 'object' ? (item.id ?? item.axis_id ?? item.value) : item;
        const matched = this.getAxisById(rawId) || this.axes.find((a) => a.hardwareAxisId === rawId || a.id === rawId);
        if (matched) {
          if (!seenNames.has(matched.name)) {
            seenNames.add(matched.name);
            resolved.push({ ...matched, rawId, source: 'pcb_axis_table' });
          }
        } else {
          probeReport.unmatchedCount++;
          const placeholderName = `板载磁轴 #${rawId}`;
          if (!seenNames.has(placeholderName)) {
            seenNames.add(placeholderName);
            resolved.push({
              id: rawId,
              hardwareAxisId: rawId,
              name: placeholderName,
              brand: '板载未收录',
              travel: 3.50,
              maxTravel: 3.50,
              badge: '硬件上报',
              source: 'pcb_raw_unknown',
            });
          }
        }
      });

      probeReport.resolvedSwitches = resolved;
      probeReport.supportedSwitchNames = resolved.map((s) => s.name);

      // 5. 生成可直接复制或导出的配置代码片段
      probeReport.codeSnippet = JSON.stringify(
        {
          model: profile?.model || 'KEYBOARD',
          probedAt: probeReport.timestamp,
          defaultAxis: resolved[0]?.name || '神马轴',
          isolateSwitches: true,
          supportedSwitches: probeReport.supportedSwitchNames,
          hardwareAxisIds: probeReport.rawList,
        },
        null,
        2
      );

      return probeReport;
    } catch (err) {
      console.error('[AxisService Probe] 执行板载探针失败:', err);
      probeReport.error = err.message;
      return probeReport;
    }
  }
}

export const axisService = new AxisService();

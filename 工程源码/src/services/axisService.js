// 星闪悦动轴体库与校准服务
// 针对 VICTKONG DV63 磁轴键盘及星闪官方轴体 SKU 校准体系
import { keyboardService } from './keyboardService.js';
import cachedAxes from '../constants/officialAxisCache.json' with { type: 'json' };
import ae64AxisListV3 from '../constants/ae64AxisListV3.json' with { type: 'json' };

// 核心出厂与推荐磁轴校准 SKU (针对不同键盘部署原生出厂轴体，公模/客制化默认搭载磁玉 Pro)
export const PRIMARY_AXES = [
  {
    id: 788,
    hardwareAxisId: 788,
    axisV2Id: 12608,
    name: '天际线轴',
    shortName: '天际线',
    brand: '江湾 (Everglide)',
    maxTravel: 3.55,
    driveRange: 3.35,
    deadzone: 0.20,
    color: '#4dd1f9',
    badge: 'AE64-MAX标配',
    recommendedAP: 0.35,
    axisCoefficient: 1.0,
    description: 'AE64-MAX 原厂标配江湾天际线磁轴，高导光柱，极速回弹，3.55mm 黄金行程。',
  },
  {
    id: 1219,
    hardwareAxisId: 1219,
    axisV2Id: 19504,
    name: '库里南轴',
    shortName: '库里南',
    brand: '江湾 (Everglide)',
    maxTravel: 3.60,
    driveRange: 3.40,
    deadzone: 0.20,
    color: '#eaeaea',
    badge: '江湾原厂',
    recommendedAP: 0.40,
    axisCoefficient: 1.0,
    description: '江湾库里南磁轴，双轨超顺滑，HiFi 敲击音。',
  },
  {
    id: 1002,
    hardwareAxisId: 102,
    name: '神马轴',
    shortName: '神马',
    brand: '星闪标配 (Shenma)',
    maxTravel: 3.45,
    driveRange: 3.25,
    deadzone: 0.20,
    color: '#2563eb',
    badge: 'VICTKONG DV63出厂标配',
    recommendedAP: 0.35,
    axisCoefficient: 1.0,
    description: 'VICTKONG DV63 原厂出厂标配磁轴，初始磁通量高，手感清脆顺滑，支持 0.001mm 极限响应。',
  },
  {
    id: 1,
    hardwareAxisId: 1,
    name: '磁玉 Pro',
    shortName: '磁玉Pro',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.50,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#70cb9a',
    badge: '佳达隆原厂标配',
    recommendedAP: 0.40,
    axisCoefficient: 1.0,
    description: '佳达隆原厂磁玉 Pro 磁轴，双轨结构，高透光上盖，3.5mm 顺滑低抖，出色的 HiFi 声音表现。',
  },
  {
    id: 1003,
    hardwareAxisId: 1,
    name: '磁玉 Pro 超竞版',
    shortName: '磁玉超竞',
    brand: '前行者 × 佳达隆',
    maxTravel: 3.50,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#3b82f6',
    badge: 'ES68定制超竞',
    recommendedAP: 0.35,
    axisCoefficient: 1.0,
    description: '前行者 ES68 破晓联合佳达隆特调定制超竞版，高频电竞调校，极速触发。',
  },
  {
    id: 18,
    hardwareAxisId: 18,
    name: '磁玉轴',
    shortName: '磁玉',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.30,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a04444',
    badge: '经典HiFi',
    recommendedAP: 0.40,
    axisCoefficient: 1.0,
    description: '全POM材质，顺滑度极高，经典声音表现。',
  },
  {
    id: 4,
    hardwareAxisId: 4,
    name: '磁玉 Gaming',
    shortName: '磁玉Gaming',
    brand: '佳达隆 (GATERON)',
    maxTravel: 3.50,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a7e1d6',
    badge: '电竞强化',
    recommendedAP: 0.35,
    axisCoefficient: 1.0,
    description: '聚光大通孔，触发行程短，回弹跟手迅速。',
  },
  {
    id: 3,
    hardwareAxisId: 3,
    name: 'TTC 万磁王',
    shortName: '万磁王',
    brand: 'TTC',
    maxTravel: 3.50,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#5f3873',
    badge: '极速响应',
    recommendedAP: 0.30,
    axisCoefficient: 1.0,
    description: '聚光镜大通孔设计，初始磁通量高，RT 响应极佳。',
  },
  {
    id: 2,
    hardwareAxisId: 2,
    name: 'TTC 万磁王 RGB',
    shortName: '万磁王RGB',
    brand: 'TTC',
    maxTravel: 3.40,
    driveRange: 3.30,
    deadzone: 0.20,
    color: '#a04444',
    badge: 'RGB聚光',
    recommendedAP: 0.30,
    axisCoefficient: 1.0,
    description: '全透聚光柱设计，灯光效果拔群。',
  },
  {
    id: 8,
    hardwareAxisId: 8,
    name: '佳达隆双轨磁白轴',
    shortName: '双轨磁白',
    brand: '佳达隆 (GATERON)',
    maxTravel: 4.00,
    driveRange: 3.80,
    deadzone: 0.20,
    color: '#c45353',
    badge: '经典电竞',
    recommendedAP: 0.35,
    axisCoefficient: 1.0,
    description: '双轨导向结构，4.0mm 舒适触发行程，手感顺滑。',
  },
  {
    id: 1001,
    hardwareAxisId: 101,
    name: '极岳泰定制磁轴',
    shortName: '极岳泰',
    brand: '极岳泰 (JYT)',
    maxTravel: 3.60,
    driveRange: 3.40,
    deadzone: 0.20,
    color: '#0284c7',
    badge: '深度调校',
    recommendedAP: 0.40,
    axisCoefficient: 1.0,
    description: '行程线性稳定，具备 0.001mm 灵敏度支持。',
  },
];

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

/**
 * 依据硬件 Esc/Space 键底层上报的电气性能结构实时解密真实轴体：
 * 实测：AE64-MAX 固件返回 { axis: 0, axisV2Id: 12608, axisRangeMax: 3550, axisCoefficient: 18600 }
 * 对应官网 V3 轴体库: detailId 12608 -> 天际线轴 (3.55mm, 江湾)
 */
export function resolveAxisByHardwarePerf(perf, profile) {
  if (!perf) return getDefaultAxisForProfile(profile);

  // 1. 优先根据硬件上报的真实 axisV2Id 精准匹配
  const v2Id = perf.axisV2Id;
  if (v2Id) {
    if (v2Id === 12608) {
      return PRIMARY_AXES.find(a => a.name === '天际线轴') || PRIMARY_AXES[0];
    }
    if (v2Id === 19504) {
      return PRIMARY_AXES.find(a => a.name === '库里南轴') || PRIMARY_AXES[1];
    }
    const foundV2 = PRIMARY_AXES.find(a => a.axisV2Id === v2Id);
    if (foundV2) return foundV2;
  }

  // 2. 根据硬件上报的真实行程极限 axisRangeMax 精准匹配 (3550 -> 3.55mm 天际线轴)
  if (perf.axisRangeMax === 3550) {
    return PRIMARY_AXES.find(a => a.name === '天际线轴') || PRIMARY_AXES[0];
  }
  if (perf.axisRangeMax === 3600) {
    return PRIMARY_AXES.find(a => a.name === '库里南轴') || PRIMARY_AXES[1];
  }
  if (perf.axisRangeMax === 3450) {
    return PRIMARY_AXES.find(a => a.name === '神马轴') || PRIMARY_AXES[2];
  }

  // 3. 根据硬件 axis id 匹配
  if (perf.axis !== undefined && perf.axis !== null && perf.axis > 0) {
    const foundAxis = PRIMARY_AXES.find(a => a.hardwareAxisId === perf.axis || a.id === perf.axis);
    if (foundAxis) return foundAxis;
  }

  // 4. 回退到设备机型默认
  return getDefaultAxisForProfile(profile);
}

class AxisService {
  constructor() {
    this.axes = [...DV63_PRIMARY_AXES];
    this.isLoaded = false;
    this.isLoading = false;
    this.activeAxis = DV63_PRIMARY_AXES[0];
  }

  resolveAxisByHardwarePerf(perf, profile) {
    return resolveAxisByHardwarePerf(perf, profile);
  }

  // 获取完整轴体校准列表（优先星闪云端 API，离线时回退到缓存）
  async loadAxisList() {
    if (this.isLoaded) return this.axes;
    this.isLoading = true;

    // 1. 优先载入官网 V3 最新轴体库 (包含 AE64-MAX 江湾天际线轴 3.55mm 及各品牌分类)
    if (Array.isArray(ae64AxisListV3) && ae64AxisListV3.length > 0) {
      this.mergeV3Axes(ae64AxisListV3);
    }

    try {
      // 尝试向星闪官方 API 动态拉取最新校准库
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch('https://api.sparklinkplayjoy.com/api/v1/getAxisList', {
        headers: {
          'Xs-API-Key': '860DE3DB584158536BC89030D8640E29',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json.code === 200 && Array.isArray(json.data)) {
          this.mergeCloudAxes(json.data);
          this.isLoaded = true;
          this.isLoading = false;
          return this.axes;
        }
      }
    } catch (err) {
      console.warn('[AxisService] 云端轴体库拉取超时或离线，采用本地官方缓存库:', err);
    }

    // 回退到本地缓存库
    if (Array.isArray(cachedAxes) && cachedAxes.length > 0) {
      this.mergeCloudAxes(cachedAxes);
    }

    this.isLoaded = true;
    this.isLoading = false;
    return this.axes;
  }

  mergeV3Axes(v3Categories) {
    if (!Array.isArray(v3Categories)) return;
    const v3Map = new Map();
    v3Categories.forEach((cat) => {
      if (!Array.isArray(cat?.list)) return;
      cat.list.forEach((raw) => {
        if (!raw || raw.axis_id === undefined) return;
        const id = Number(raw.axis_id);
        const name = raw.axis_name || `磁轴 #${id}`;
        const maxTravel = Number(((raw.axis_range_max || 3550) / 1000).toFixed(2));
        const driveRange = Number((Math.max(1000, (raw.axis_range_max || 3550) - 200) / 1000).toFixed(2));
        const detailId = raw.aixsDetail?.[0]?.axis_id;
        const coeff = raw.aixsDetail?.[0]?.axis_coefficient;
        v3Map.set(id, {
          id,
          hardwareAxisId: id,
          axisV2Id: detailId,
          axisRangeMax: raw.axis_range_max,
          axisCoefficient: coeff,
          name,
          shortName: name,
          brand: cat.type_name || raw.brand || '星闪校准',
          maxTravel,
          driveRange,
          deadzone: 0.20,
          color: raw.axis_color ? (raw.axis_color.startsWith('#') ? raw.axis_color : '#' + raw.axis_color) : '#4dd1f9',
          imageUrl: raw.image_url && raw.image_url !== '#' ? raw.image_url : null,
          badge: id === 788 ? 'AE64-MAX标配' : (cat.type_name ? `${cat.type_name}原厂` : '星闪校准'),
          recommendedAP: 0.35,
          description: `${cat.type_name || ''} ${name} 磁轴，行程 ${maxTravel}mm (官方 V3 校准)`
        });
      });
    });

    const featuredList = PRIMARY_AXES.map((f) => {
      const m = v3Map.get(f.id) || (f.axisV2Id ? Array.from(v3Map.values()).find(x => x.axisV2Id === f.axisV2Id) : null);
      if (m) {
        return {
          ...f,
          maxTravel: f.maxTravel || m.maxTravel,
          driveRange: f.driveRange || m.driveRange,
          axisV2Id: f.axisV2Id || m.axisV2Id,
          axisRangeMax: f.axisRangeMax || m.axisRangeMax,
          axisCoefficient: f.axisCoefficient || m.axisCoefficient,
        };
      }
      return { ...f };
    });

    const finalAxes = [...featuredList];
    const includedIds = new Set(finalAxes.map(a => a.id));
    v3Map.forEach((item, id) => {
      if (!includedIds.has(id)) {
        finalAxes.push(item);
        includedIds.add(id);
      }
    });

    this.axes = finalAxes;
  }

  mergeCloudAxes(cloudList) {
    if (!Array.isArray(cloudList)) return;

    // 1. 建立官方云端轴体字典 (通过 axis_id 唯一确权)
    const officialMap = new Map();
    cloudList.forEach((raw) => {
      if (!raw || raw.axis_id === undefined) return;
      const id = Number(raw.axis_id);
      const name = raw.axis_name || `磁轴 #${id}`;
      const maxTravel = parseFloat(raw.doctrine_range_left || raw.drive_range || 3.50);
      const driveRange = parseFloat(raw.drive_range || raw.doctrine_range_left || 3.30);
      const deadzone = parseFloat(raw.doctrine_range_right || 0.20);
      const brand = raw.factory_name || raw.brand || (typeof raw.axi_brands === 'object' ? raw.axi_brands?.brand_name_cn : '') || '其他';
      const color = raw.axis_color ? (raw.axis_color.startsWith('#') ? raw.axis_color : '#' + raw.axis_color) : '#2563eb';
      const imageUrl = raw.image_url && raw.image_url !== '#' ? raw.image_url : null;

      officialMap.set(id, {
        id,
        name,
        shortName: name,
        brand,
        maxTravel: maxTravel > 0 ? maxTravel : 3.50,
        driveRange: driveRange > 0 ? driveRange : maxTravel,
        deadzone,
        color,
        imageUrl,
        badge: raw.factory_name ? `${raw.factory_name}原厂` : '星闪校准',
        recommendedAP: 0.40,
        axisCoefficient: 1.0,
        description: `${brand} ${name} 磁轴，行程 ${maxTravel}mm (有效行程 ${driveRange}mm)`,
        isOfficial: true,
      });
    });

    // 2. 将核心特调预设与官方数据深度联动融合
    // 对于 ID 在官方库中存在的（如 ID 1 磁玉 Pro, ID 3 万磁王等），补全官方真实 imageUrl, color 等属性
    const featuredList = PRIMARY_AXES.map((featured) => {
      const officialMatch = officialMap.get(featured.hardwareAxisId ?? featured.id);
      if (officialMatch) {
        return {
          ...featured,
          maxTravel: featured.maxTravel || officialMatch.maxTravel,
          driveRange: featured.driveRange || officialMatch.driveRange,
          deadzone: featured.deadzone || officialMatch.deadzone,
          imageUrl: featured.imageUrl || officialMatch.imageUrl,
          color: featured.color || officialMatch.color,
        };
      }
      return { ...featured };
    });

    // 3. 构建全量平铺列表：先放核心推荐轴体，再按 ID 顺序追加其余全部官方云端校准轴体
    const finalAxes = [...featuredList];
    const includedIds = new Set(finalAxes.map((a) => a.id));

    // 按 axis_id 升序排列追加其余轴体
    const sortedOfficial = Array.from(officialMap.values()).sort((a, b) => a.id - b.id);
    sortedOfficial.forEach((item) => {
      if (!includedIds.has(item.id)) {
        finalAxes.push(item);
        includedIds.add(item.id);
      }
    });

    this.axes = finalAxes;
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
  async applyAxisToKeyboard(axis) {
    this.activeAxis = axis;
    if (keyboardService.connected) {
      try {
        const hwId = axis.hardwareAxisId ?? (axis.id <= 255 ? axis.id : 1);
        await keyboardService.setDefaultAxis(hwId);
        console.log(`[AxisService] 已同步默认轴体到键盘: ${axis.name} (硬件ID: ${hwId})`);
      } catch (e) {
        console.warn('[AxisService] 同步到键盘硬件略过:', e);
      }
    }
  }
}

export const axisService = new AxisService();

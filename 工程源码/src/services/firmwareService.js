/**
 * 键盘硬件固件服务中心 (Firmware Service)
 * 职责：
 * 1. 抓取与查询星闪官方云端固件分发接口 (api.sparklinkplayjoy.com)
 * 2. 匹配当前连接键盘的 Board ID / VID / PID，获取官方最新固件包与更新日志
 * 3. 严格标注固件来源：明确硬件固件归属各品牌原厂及星闪官方团队
 * 4. 提供官方固件下载通道与原厂技术支持跳转入口
 */

const OFFICIAL_API_BASE = 'https://api.sparklinkplayjoy.com/api/v1';
const OFFICIAL_API_KEY = '860DE3DB584158536BC89030D8640E29';

// 官方原厂固件渠道与支持门户 (供用户备用手动下载)
export const VENDOR_FIRMWARE_CHANNELS = [
  {
    brand: '前行者 EWEADN',
    models: 'ES68 / ES87 / DK63 / DK68',
    portalName: '前行者服务支持与产品中心',
    url: 'https://www.eweadn.cn/home/index.html',
    desc: '官方提供 ES68 等产品出厂驱动、固件升级包与售后工具',
  },
  {
    brand: '江湾 Everglide',
    models: 'AE64-MAX / SU64 / SU68',
    portalName: '江湾双子星固件通道',
    url: 'https://www.xsyd.top',
    desc: '双子星方案客制化 PCB 原厂固件、连续 RT (0.04+) 固件通道',
  },
  {
    brand: '星闪悦动官方',
    models: '公版全系星闪磁轴键盘',
    portalName: '星闪悦动 Web 驱动与固件云',
    url: 'https://www.xsyd.top',
    desc: '星闪 0xFFB0 协议方案商官方云端固件维护节点',
  },
];

/**
 * 比较两个版本号字符串 (支持 V1.0.0, 0.1.9, 0.04 等格式)
 * 返回值: 1 (v1 > v2), -1 (v1 < v2), 0 (相等)
 */
export function compareFirmwareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const clean = (s) =>
    String(s)
      .trim()
      .replace(/^v/i, '')
      .split(/[\.-]/)
      .map((part) => {
        const num = parseInt(part, 10);
        return isNaN(num) ? 0 : num;
      });

  const parts1 = clean(v1);
  const parts2 = clean(v2);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

/**
 * 联网检查当前键盘是否有可用的官方硬件固件
 * 调用官方已逆向的接口: GET /api/v1/getKeyboardFirmware?board_id={board_id}&vid={vid}&pid={pid}
 */
export async function checkKeyboardFirmwareUpdate({
  vendorId = null,
  productId = null,
  boardId = null,
  currentFirmwareVersion = '0.1.0',
}) {
  const vDec = Number(vendorId) || 7334; // 默认 0x1CA6
  const pDec = Number(productId) || 7204; // 默认 0x1C24 (ES68)
  const bId = boardId != null && String(boardId).trim() !== '' ? String(boardId).trim() : '0';

  const params = new URLSearchParams({
    board_id: bId,
    vid: String(vDec),
    pid: String(pDec),
  });

  const apiUrl = `${OFFICIAL_API_BASE}/getKeyboardFirmware?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Xs-API-Key': OFFICIAL_API_KEY,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP 状态码 ${res.status}`);
    }

    const json = await res.json();

    // 官方响应规范：
    // code: 200 -> 成功查到固件列表 [{ version, url, changelog, md5, ... }]
    // code: 415 -> 固件未上传 (官方服务器暂无该板型新固件)
    // code: 422 -> 缺少必要参数
    if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
      const latest = json.data[0];
      const latestVer = latest.version || latest.appVersion || '最新稳定版';
      const hasUpdate = compareFirmwareVersions(latestVer, currentFirmwareVersion) > 0;

      return {
        success: true,
        hasUpdate,
        currentVersion: currentFirmwareVersion,
        latestVersion: latestVer,
        firmwareUrl: latest.url || latest.downloadUrl || null,
        changelog: latest.changelog || latest.notes || '包含主控逻辑优化与星闪传输稳定性提升',
        md5: latest.md5 || null,
        releaseDate: latest.created_at || latest.releaseDate || '近期',
        sourceName: '星闪悦动官方服务器 (api.sparklinkplayjoy.com)',
        message: hasUpdate ? `检测到新固件 ${latestVer}` : '当前固件已是官方最新版本',
      };
    } else if (json.code === 415 || (Array.isArray(json.data) && json.data.length === 0)) {
      return {
        success: true,
        hasUpdate: false,
        currentVersion: currentFirmwareVersion,
        latestVersion: currentFirmwareVersion,
        firmwareUrl: null,
        sourceName: '星闪悦动官方服务器 (api.sparklinkplayjoy.com)',
        message: '当前型号在官方分发源暂无新固件推送（当前固件已是稳定版本）',
      };
    } else {
      return {
        success: false,
        hasUpdate: false,
        currentVersion: currentFirmwareVersion,
        sourceName: '星闪悦动官方服务器 (api.sparklinkplayjoy.com)',
        message: json.msg || '查询官方固件失败',
      };
    }
  } catch (err) {
    return {
      success: false,
      hasUpdate: false,
      currentVersion: currentFirmwareVersion,
      sourceName: '星闪悦动官方服务器 (api.sparklinkplayjoy.com)',
      error: err.message,
      message: `无法连接官方固件服务器: ${err.message}`,
    };
  }
}

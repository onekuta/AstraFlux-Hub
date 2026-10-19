/**
 * 星闪客制化键盘 PCB 探针适配数据转换器
 * 将探针导出的真实硬件 JSON 映射为驱动原生设备档案与放行条目
 * 保证无损保留硬件探针采集的全部高精拓扑（物理矩阵 physicalKeys、170灯珠拓扑、5灯空格、双灯位、轴体行程曲线）
 */

export function translateProbeJsonToProfile(probeData) {
  if (!probeData || typeof probeData !== 'object') {
    throw new Error('无效的适配数据结构');
  }

  const fp = probeData.hardwareFingerprint || {};
  const isSparklinkMeta = probeData.meta?.isSparklinkDevice === true || probeData.meta?.verificationStatus === 'VERIFIED_SPARKLINK_PLAYJOY';
  const isSparklinkVid = fp.vendorIdDec === 7334 || (typeof fp.vendorIdHex === 'string' && fp.vendorIdHex.toLowerCase() === '0x1ca6');
  const hasSparklinkHid = Array.isArray(probeData.hidInterfaces) && probeData.hidInterfaces.some(
    i => i.usagePage === 0xFFB0 || i.usagePage === 65456 || (typeof i.usagePageHex === 'string' && i.usagePageHex.toLowerCase() === '0xffb0')
  );

  // 1. 严格安全门禁：必须是通过星闪官方方案认证的探针文件或拥有星闪 0x1CA6 / 0xFFB0 硬件指纹
  if (!isSparklinkMeta && !isSparklinkVid && !hasSparklinkHid) {
    throw new Error('【拒绝导入】该文件未通过星闪 0xFFB0 官方通信协议握手认证，禁止导入主驱动！');
  }
  const prof = probeData.deviceProfile || {};
  const light = probeData.lightingTopology || {};
  const mat = probeData.matrixLayout || {};
  const perf = probeData.performanceSpec || {};
  const ax = probeData.axisAndCalibration || {};

  const vHex = fp.vendorIdHex || ('0x' + (fp.vendorIdDec || 0x1ca6).toString(16).toUpperCase());
  const pHex = fp.productIdHex || ('0x' + (fp.productIdDec || 0x300d).toString(16).toUpperCase());
  const cleanId = prof.id || `pcb_${vHex.replace('0X', '').toLowerCase()}_${pHex.replace('0X', '').toLowerCase()}`;

  // 品牌提取：优先读取探针显式 brandName / brand / meta.brandName
  const explicitBrand = fp.brandName || fp.brand || (prof.brand !== '星闪悦动' ? prof.brand : null) || (prof.brandName !== '星闪悦动' ? prof.brandName : null) || probeData.meta?.brandName;
  let finalBrand = explicitBrand || null;

  if (!finalBrand || finalBrand === '星闪悦动' || finalBrand === '未知') {
    if ((fp.productName && fp.productName.includes('AE64')) || (prof.name && prof.name.includes('AE64'))) {
      finalBrand = '江湾 Everglide';
    } else if (fp.productName && fp.productName.includes('ES68')) {
      finalBrand = '前行者 EWEADN';
    } else if (fp.productName && fp.productName.includes('DV63')) {
      finalBrand = 'VICTKONG';
    } else if (fp.productName && fp.productName.includes('MCHOSE')) {
      finalBrand = '迈从 MCHOSE';
    } else if (fp.productName && fp.productName.includes('VK')) {
      finalBrand = '瓦尔基里 Valkyrie';
    } else {
      finalBrand = '客制化';
    }
  }

  // 同步写回数据结构，确保上层统一
  fp.brandName = finalBrand;
  fp.brand = finalBrand;
  prof.brand = finalBrand;
  prof.brandName = finalBrand;

  const deviceName = prof.name || (finalBrand && !fp.productName?.includes(finalBrand) ? `${finalBrand} ${fp.productName || '键盘'}` : (fp.productName || '星闪磁轴键盘'));

  // 连续快速触发判定：AE64 或固件 ≥ 0.04
  const isContinuousRt = !!prof.features?.continuousRt || 
    (fp.chipInfo?.appVersion && parseFloat(fp.chipInfo.appVersion) >= 0.04) ||
    (fp.productName && fp.productName.includes('AE64'));

  // 2. 映射为驱动原生设备档案结构 (全量高保真，绝不丢弃任何细节)
  const runtimeProfile = {
    // 快速索引字段
    id: cleanId,
    brand: finalBrand,
    model: prof.model || fp.productName || '客制化键盘',
    name: deviceName,
    shortName: prof.shortName || fp.productName || '客制化',
    type: 'keyboard',
    layout: prof.layout || mat.layoutCategory || '64keys',
    layoutName: (prof.layoutName || mat.layoutName || '左移64配列').replace(/[\(（][^()（）]*?(如|例如)[^()（）]*?[\)）]/g, '').trim(),
    totalKeyCount: prof.totalKeyCount || mat.totalKeys || 64,
    vendorId: fp.vendorIdDec,
    productId: fp.productIdDec,
    vendorIdHex: vHex,
    productIdHex: pHex,
    connectionType: 'wired',
    connectionLabel: prof.connectionLabel || 'USB 极速有线',
    isWired: true,
    hasBattery: false,
    maxPollingRate: perf.maxPollingRate || 8000,
    hardRateCeiling: perf.hardwareRateCeiling || 8000,
    supportedPollingRates: perf.supportedPollingRates || [250, 500, 1000, 2000, 4000, 8000],
    defaultPollingRate: perf.defaultPollingRate || 8000,
    minActuationPoint: perf.rtPrecisionMm || 0.001,
    defaultAxis: ax.defaultAxis?.name || prof.defaultAxis || '磁玉 Pro',
    isOfficial: false,
    importedAt: new Date().toISOString(),

    // ★★★ 核心高保真无损存储：完整保留探针逆向采样的全量硬件数据结构 ★★★
    meta: probeData.meta || {},
    hardwareFingerprint: fp,
    matrixLayout: mat,
    lightingTopology: light,
    performanceSpec: perf,
    axisAndCalibration: ax,
    deviceProfile: prof,
    rawSnapshot: probeData.rawSnapshot || {},

    // 驱动各模块直接读取的高层拓扑
    lighting: (() => {
      const isAe = (deviceName || '').toUpperCase().includes('AE64');
      const isEs = (deviceName || '').toUpperCase().includes('ES68');
      const keyCount = mat.totalKeys || prof.totalKeyCount || 64;
      const need5SpaceLamps = light.spaceLamps?.hasIndependentSpaceLamps || keyCount <= 68 || isAe || isEs;

      const resolvedSpaceLamps = {
        hasIndependentSpaceLamps: need5SpaceLamps,
        count: need5SpaceLamps ? 5 : (light.spaceLamps?.count || 1),
        coordinates: (need5SpaceLamps && (!light.spaceLamps?.coordinates || light.spaceLamps.coordinates.length < 5))
          ? [
              { index: 1, row: 5, col: 4, desc: '空格灯珠 1' },
              { index: 2, row: 5, col: 5, desc: '空格灯珠 2' },
              { index: 3, row: 5, col: 6, desc: '空格灯珠 3' },
              { index: 4, row: 5, col: 7, desc: '空格灯珠 4' },
              { index: 5, row: 5, col: 8, desc: '空格灯珠 5' },
            ]
          : (light.spaceLamps?.coordinates || [{ index: 1, row: 5, col: 6 }]).map(c => ({
              ...c,
              row: Math.round(Number(c.row)),
              col: Math.round(Number(c.col)),
            })),
      };

      const resolvedStrip = light.stripLighting?.hasStrip || isAe || isEs ? {
        hasStrip: true,
        stripCols: light.stripLighting?.stripCols || (isAe ? 17 : isEs ? 26 : 26),
        stripRows: light.stripLighting?.stripRows || (isAe ? 2 : 1),
        totalStripLeds: light.stripLighting?.totalStripLeds || (isAe ? 34 : isEs ? 26 : 26),
      } : (light.stripLighting || null);

      return {
        totalLeds: light.totalLeds || keyCount,
        mainMatrixLeds: light.mainMatrixLeds || keyCount,
        spacebarLeds: resolvedSpaceLamps.count,
        spaceLedsEditable: resolvedSpaceLamps.hasIndependentSpaceLamps,
        dualLamps: !!light.isDoubleLighting,
        lampStructure: light.lampStructure || (light.isDoubleLighting ? '上下双灯位 (上灯+下灯)' : '常规单灯位'),
        lightingAreas: light.lightingAreas || [],
        spaceLamps: resolvedSpaceLamps,
        stripLighting: resolvedStrip,
        decorateLighting: resolvedStrip,
        supportedEffects: light.supportedEffects || ['Static', 'Breathing', 'Neon', 'Wave', 'Ripple', 'SingleLight', 'Flash', 'Raindrop', 'CustomMatrix'],
        boardLightingSnapshot: light.boardLightingSnapshot || null,
      };
    })(),
    switchAndCalibration: {
      defaultAxis: ax.defaultAxis?.name || prof.defaultAxis || '佳达隆磁玉 Pro',
      supportedAxes: Array.isArray(ax.boardAxisSkuList) && ax.boardAxisSkuList.length > 0 
        ? ax.boardAxisSkuList.map((a) => a.name || a)
        : ['佳达隆磁玉 Pro', '凯华知夏磁轴', '双子星自研马轴'],
      travelRangeMm: perf.travelRangeMm || 4.0,
      deadzoneMm: perf.deadzoneMm || 0.02,
      minActuationMm: perf.rtPrecisionMm || 0.001,
      currentCalibration: ax.currentCalibrationStatus || { precisionMm: perf.rtPrecisionMm || 0.001 },
      currentRouteData: ax.currentRouteData || [],
      currentADCSamples: ax.currentADCSamples || [],
    },
    performance: {
      maxPollingRate: perf.maxPollingRate || 8000,
      hardRateCeiling: perf.hardwareRateCeiling || 8000,
      supportedPollingRates: perf.supportedPollingRates || [250, 500, 1000, 2000, 4000, 8000],
      rtPrecisionMm: perf.rtPrecisionMm || 0.001,
      continuousRt: isContinuousRt,
      socdSupport: true,
      furyMode: true,
      dksSupport: true,
      mptSupport: true,
    },
    features: {
      magneticAxis: true,
      rtSupport: true,
      socdSupport: true,
      dksSupport: true,
      mptSupport: true,
      furyMode: true,
      rgbLighting: true,
      hallCalibration: true,
      continuousRt: isContinuousRt,
      doubleLighting: !!light.isDoubleLighting,
      stripLighting: !!light.stripLighting?.hasStrip,
      shakeOptimization: perf.shakeOptimizationSwitch === 1,
      spaceMultiLamp: !!light.spaceLamps?.hasIndependentSpaceLamps,
    },
    _hardwareDetails: {
      boardId: fp.chipInfo?.boardId,
      appVersion: fp.chipInfo?.appVersion,
      pcbVersion: fp.chipInfo?.pcbVersion,
      lampStructure: light.lampStructure || (light.isDoubleLighting ? '上下双灯位 (上灯+下灯)' : '常规单灯位'),
      totalLeds: light.totalLeds || mat.totalKeys || 64,
      mainMatrixLeds: light.mainMatrixLeds || mat.totalKeys || 64,
      spaceLamps: light.spaceLamps || {},
      stripLighting: light.stripLighting || {},
      lightingAreas: light.lightingAreas || [],
      physicalKeys: (mat.physicalKeys || []).map(k => ({
        ...k,
        row: Math.round(Number(k.row)),
        col: Math.round(Number(k.col)),
      })),
      boardAxisSkuList: ax.boardAxisSkuList || [],
      currentRouteData: ax.currentRouteData || [],
      importedAt: new Date().toISOString(),
    },
  };

  const runtimeDeviceEntry = {
    vendorId: fp.vendorIdDec,
    productId: fp.productIdDec,
    usagePage: 65456, // 0xFFB0
    usage: 1,
  };

  return { runtimeProfile, runtimeDeviceEntry };
}

// 星闪云端发布助手 - 渲染进程双窗口管理系统

let currentDbData = null;
let currentAppFile = null;
let currentConfig = null;
let activeView = 'db'; // 'db' | 'app'

// 基础元素
const btnMinimize = document.getElementById('btn-minimize');
const btnClose = document.getElementById('btn-close');
const btnSplitWindow = document.getElementById('btn-split-window');
const tabBtnDb = document.getElementById('tab-btn-db');
const tabBtnApp = document.getElementById('tab-btn-app');
const viewDb = document.getElementById('view-db');
const viewApp = document.getElementById('view-app');

// 云端状态与抽屉
const repoStatusBadge = document.getElementById('repo-status-badge');
const repoNameText = document.getElementById('repo-name-text');
const btnToggleDrawer = document.getElementById('btn-toggle-drawer');
const cloudDrawer = document.getElementById('cloud-drawer');
const giteeOwner = document.getElementById('gitee-owner');
const giteeRepo = document.getElementById('gitee-repo');
const giteeBranch = document.getElementById('gitee-branch');
const giteeToken = document.getElementById('gitee-token');
const toggleTokenView = document.getElementById('toggle-token-view');
const btnTestConnection = document.getElementById('btn-test-connection');
const btnSaveCloudCfg = document.getElementById('btn-save-cloud-cfg');

// 【窗口一：键盘数据库】元素
const dbDropZone = document.getElementById('db-drop-zone');
const pkgInfoCard = document.getElementById('pkg-info-card');
const pkgFilename = document.getElementById('pkg-filename');
const pkgDevCount = document.getElementById('pkg-dev-count');
const pkgVersionTag = document.getElementById('pkg-version-tag');
const deviceList = document.getElementById('device-list');
const libVersionInput = document.getElementById('lib-version-input');
const btnRefreshLibVer = document.getElementById('btn-refresh-lib-ver');
const dbChangelogInput = document.getElementById('db-changelog-input');
const btnPublishDb = document.getElementById('btn-publish-db');
const btnExportBundle = document.getElementById('btn-export-bundle');
const btnExportDbLocal = document.getElementById('btn-export-db-local');
const btnExportPatchLocal = document.getElementById('btn-export-patch-local');

// 【窗口二：软件版本更新】元素
const appDropZone = document.getElementById('app-drop-zone');
const appFileCard = document.getElementById('app-file-card');
const appFilename = document.getElementById('app-filename');
const appFilesize = document.getElementById('app-filesize');
const appFilepath = document.getElementById('app-filepath');
const appDownloadUrl = document.getElementById('app-download-url');
const btnTestAppUrl = document.getElementById('btn-test-app-url');
const appVersionInput = document.getElementById('app-version-input');
const appForceSelect = document.getElementById('app-force-select');
const appChangelogInput = document.getElementById('app-changelog-input');
const btnPublishApp = document.getElementById('btn-publish-app');
const btnExportAppLocal = document.getElementById('btn-export-app-local');

// 控制台与成果
const terminalBox = document.getElementById('terminal-box');
const resultBanner = document.getElementById('result-banner');
const resultTitle = document.getElementById('result-title');
const manifestUrlText = document.getElementById('manifest-url-text');
const btnCopyManifest = document.getElementById('btn-copy-manifest');

// 1. 窗口基本操作
btnMinimize.addEventListener('click', () => window.publisherAPI.minimize());
btnClose.addEventListener('click', () => window.publisherAPI.close());

// 独立双窗口模式
btnSplitWindow.addEventListener('click', () => {
  const otherView = activeView === 'db' ? 'app' : 'db';
  window.publisherAPI.openSecondaryWindow(otherView);
  appendLog('info', `已在独立新窗口打开【${otherView === 'db' ? '键盘数据库推送' : '软件版本更新推送'}】窗口！`);
});

// 2. 双视图切换
function switchView(viewName) {
  activeView = viewName;
  if (viewName === 'db') {
    tabBtnDb.classList.add('active');
    tabBtnApp.classList.remove('active');
    viewDb.style.display = 'grid';
    viewApp.style.display = 'none';
  } else {
    tabBtnApp.classList.add('active');
    tabBtnDb.classList.remove('active');
    viewApp.style.display = 'grid';
    viewDb.style.display = 'none';
  }
}

tabBtnDb.addEventListener('click', () => switchView('db'));
tabBtnApp.addEventListener('click', () => switchView('app'));

// 3. 实时日志系统
function appendLog(type, text, time = null) {
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  const t = time || new Date().toLocaleTimeString();
  logItem.innerHTML = `
    <span class="log-time">[${t}]</span>
    <span class="log-${type}">${text}</span>
  `;
  terminalBox.appendChild(logItem);
  terminalBox.scrollTop = terminalBox.scrollHeight;
}

window.publisherAPI.onPublishLog((log) => {
  appendLog(log.type, log.text, log.time);
});

// 4. 初始化加载配置
async function init() {
  currentConfig = await window.publisherAPI.loadConfig();

  // 根据 URL 查询参数选择初始视图
  const qs = new URLSearchParams(window.location.search);
  const initialView = qs.get('view') || 'db';
  switchView(initialView);

  // 载入 Gitee 配置
  if (currentConfig.gitee) {
    giteeOwner.value = currentConfig.gitee.owner || '';
    giteeRepo.value = currentConfig.gitee.repo || 'sparklink-hub-releases';
    giteeBranch.value = currentConfig.gitee.branch || 'master';
    giteeToken.value = currentConfig.gitee.accessToken || '';

    updateRepoStatusPill();
  }

  // 载入驱动发布默认参数
  if (currentConfig.appRelease) {
    appVersionInput.value = currentConfig.appRelease.appVersion || '1.1.0';
    appDownloadUrl.value = currentConfig.appRelease.appDownloadUrl || '';
    appChangelogInput.value = currentConfig.appRelease.changelog || '1. 优化星闪高速回报率与低延迟稳定性\n2. 修复多设备切换偶发断连\n3. 新增客制化 PCB 动态加载扩展框架';
  }

  // 载入适配库发布默认参数
  if (currentConfig.dbRelease?.changelog) {
    dbChangelogInput.value = currentConfig.dbRelease.changelog;
  }
  generateNewLibVersion();

  // 载入本地默认键盘数据库 (来自 device_database/ 或 device_db.json)
  try {
    const dbRes = await window.publisherAPI.loadDefaultDatabase();
    if (dbRes?.success && dbRes.dbData?.profiles?.length > 0) {
      loadPackageData('本地硬件库 (device_database/)', dbRes.dbData);
      appendLog('success', `已自动载入本地统一标准硬件数据库: 共 ${dbRes.dbData.profiles.length} 款外设键盘/PCB`);
    }
  } catch (err) {
    console.warn('自动载入本地硬件库失败:', err);
  }
}

function updateRepoStatusPill() {
  const owner = giteeOwner.value.trim();
  const repo = giteeRepo.value.trim();
  if (owner && repo && giteeToken.value.trim()) {
    repoStatusBadge.className = 'badge-status connected';
    repoStatusBadge.textContent = 'Gitee 已配置';
    repoNameText.textContent = `${owner}/${repo}`;
  } else {
    repoStatusBadge.className = 'badge-status warning';
    repoStatusBadge.textContent = '未配置密钥';
    repoNameText.textContent = '点击右侧配置填写 Gitee Token';
  }
}

function generateNewLibVersion() {
  const now = new Date();
  const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '.');
  libVersionInput.value = `${dateTag}.1`;
}
btnRefreshLibVer.addEventListener('click', generateNewLibVersion);

// 5. 抽屉式配置展示与保存
btnToggleDrawer.addEventListener('click', () => {
  const isHidden = cloudDrawer.style.display === 'none' || !cloudDrawer.style.display;
  cloudDrawer.style.display = isHidden ? 'block' : 'none';
});

toggleTokenView.addEventListener('click', () => {
  if (giteeToken.type === 'password') {
    giteeToken.type = 'text';
    toggleTokenView.textContent = '隐藏';
  } else {
    giteeToken.type = 'password';
    toggleTokenView.textContent = '显示';
  }
});

btnSaveCloudCfg.addEventListener('click', async () => {
  const cfgToSave = {
    platform: 'gitee',
    gitee: {
      owner: giteeOwner.value.trim(),
      repo: giteeRepo.value.trim(),
      branch: giteeBranch.value.trim() || 'master',
      accessToken: giteeToken.value.trim(),
    },
  };
  await window.publisherAPI.saveConfig(cfgToSave);
  currentConfig = { ...currentConfig, ...cfgToSave };
  updateRepoStatusPill();
  cloudDrawer.style.display = 'none';
  appendLog('success', '云端仓库配置已成功保存！');
});

btnTestConnection.addEventListener('click', async () => {
  const cfg = {
    gitee: {
      owner: giteeOwner.value.trim(),
      repo: giteeRepo.value.trim(),
      accessToken: giteeToken.value.trim(),
    },
  };
  btnTestConnection.disabled = true;
  appendLog('info', `正在验证 Gitee 仓库: ${cfg.gitee.owner}/${cfg.gitee.repo} ...`);

  const res = await window.publisherAPI.testCloudConnection(cfg);
  btnTestConnection.disabled = false;

  if (res.success) {
    appendLog('success', `✓ Gitee 连接成功！仓库名: ${res.repoName} (${res.isPrivate ? '私有仓库' : '公开仓库'})`);
    if (res.isPrivate) {
      appendLog('warning', `⚠️ 提示：若用于分发客户端更新，请务必在 Gitee 将该仓库设为【公开】！`);
    }
  } else {
    appendLog('error', `✕ 连接失败: ${res.error}`);
  }
});

// =========================================================================
// 6. 【窗口一】：键盘数据库数据包导入与解析
// =========================================================================
function loadPackageData(fileName, data) {
  let normalizedDb = null;

  if (Array.isArray(data.profiles)) {
    normalizedDb = data;
    appendLog('success', `[全量数据库已加载] 包含 ${data.profiles.length} 款键盘硬件配置`);
  } else if (data.meta?.isSparklinkDevice || data.hardwareFingerprint || data.matrixLayout) {
    // ★★★ 探针硬件采集包高精高保真解析并无损合入 ★★★
    const fp = data.hardwareFingerprint || {};
    const prof = data.deviceProfile || {};
    const light = data.lightingTopology || {};
    const mat = data.matrixLayout || {};
    const perf = data.performanceSpec || {};
    const ax = data.axisAndCalibration || {};

    const vHex = fp.vendorIdHex || ('0x' + (fp.vendorIdDec || 0x1ca6).toString(16).toUpperCase());
    const pHex = fp.productIdHex || ('0x' + (fp.productIdDec || 0x300d).toString(16).toUpperCase());

    const explicitBrand = fp.brandName || fp.brand || (prof.brand !== '星闪悦动' ? prof.brand : null) || (prof.brandName !== '星闪悦动' ? prof.brandName : null) || data.meta?.brandName;
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
      } else {
        finalBrand = '客制化';
      }
    }

    fp.brandName = finalBrand;
    fp.brand = finalBrand;
    prof.brand = finalBrand;
    prof.brandName = finalBrand;

    const devName = prof.name || (finalBrand && !fp.productName?.includes(finalBrand) ? `${finalBrand} ${fp.productName || '键盘'}` : (fp.productName || '星闪磁轴键盘'));

    const fullProfile = {
      id: prof.id || `pcb_${vHex.replace('0X', '').toLowerCase()}_${pHex.replace('0X', '').toLowerCase()}`,
      vendorId: fp.vendorIdDec || 7334,
      productId: fp.productIdDec || 12301,
      vendorIdHex: vHex,
      productIdHex: pHex,
      brand: finalBrand,
      brandName: finalBrand,
      model: prof.model || fp.productName || '客制化',
      name: devName,
      shortName: prof.shortName || fp.productName || '客制化',
      layout: prof.layout || mat.layoutCategory || '64keys',
      layoutName: prof.layoutName || mat.layoutName || '左移64配列',
      totalKeyCount: prof.totalKeyCount || mat.totalKeys || 64,
      isOfficial: false,
      maxPollingRate: perf.maxPollingRate || 8000,
      hardRateCeiling: perf.hardwareRateCeiling || 8000,
      supportedPollingRates: perf.supportedPollingRates || [250, 500, 1000, 2000, 4000, 8000],
      defaultPollingRate: perf.defaultPollingRate || 8000,
      minActuationPoint: perf.rtPrecisionMm || 0.001,
      defaultAxis: ax.defaultAxis?.name || prof.defaultAxis || '佳达隆磁玉 Pro',

      // 全量探针原始数据高保真无损保存
      meta: data.meta,
      hardwareFingerprint: fp,
      matrixLayout: mat,
      lightingTopology: light,
      performanceSpec: perf,
      axisAndCalibration: ax,
      deviceProfile: prof,
      rawSnapshot: data.rawSnapshot,

      lighting: {
        totalLeds: light.totalLeds || mat.totalKeys || 64,
        mainMatrixLeds: light.mainMatrixLeds || mat.totalKeys || 64,
        spacebarLeds: light.spaceLamps?.count || (light.spaceLamps?.hasIndependentSpaceLamps ? 5 : 1),
        spaceLedsEditable: !!light.spaceLamps?.hasIndependentSpaceLamps,
        dualLamps: !!light.isDoubleLighting,
        lampStructure: light.lampStructure || (light.isDoubleLighting ? '上下双灯位 (上灯+下灯)' : '常规单灯位'),
        lightingAreas: light.lightingAreas || [],
        spaceLamps: light.spaceLamps || {},
        stripLighting: light.stripLighting || null,
        decorateLighting: light.stripLighting || null,
        supportedEffects: light.supportedEffects || ['Static', 'Breathing', 'Neon', 'Wave', 'Ripple', 'SingleLight', 'Flash', 'Raindrop', 'CustomMatrix'],
      },
      switchAndCalibration: {
        defaultAxis: ax.defaultAxis?.name || prof.defaultAxis || '佳达隆磁玉 Pro',
        supportedAxes: ax.boardAxisSkuList?.map(a => a.name) || ['佳达隆磁玉 Pro', '凯华知夏磁轴', '双子星自研马轴'],
        travelRangeMm: perf.travelRangeMm || 4.0,
        deadzoneMm: 0.02,
        minActuationMm: perf.rtPrecisionMm || 0.001,
        currentCalibration: ax.currentCalibrationStatus || { precisionMm: perf.rtPrecisionMm || 0.001 },
      },
      performance: {
        maxPollingRate: perf.maxPollingRate || 8000,
        hardRateCeiling: perf.hardwareRateCeiling || 8000,
        supportedPollingRates: perf.supportedPollingRates || [250, 500, 1000, 2000, 4000, 8000],
        rtPrecisionMm: perf.rtPrecisionMm || 0.001,
        continuousRt: true,
        socdSupport: true,
        furyMode: true,
      },
      features: {
        magneticAxis: true,
        rtSupport: true,
        socdSupport: true,
        continuousRt: true,
        doubleLighting: !!light.isDoubleLighting,
        spaceMultiLamp: !!light.spaceLamps?.hasIndependentSpaceLamps,
        furyMode: true,
        rgbLighting: true,
        hallCalibration: true,
      }
    };

    let mergedProfiles = [fullProfile];
    if (currentDbData?.profiles && Array.isArray(currentDbData.profiles)) {
      const existing = currentDbData.profiles.filter(p => !(p.vendorId === fullProfile.vendorId && p.productId === fullProfile.productId));
      mergedProfiles = [...existing, fullProfile];
      appendLog('info', `已与既有数据库合并 (现有 ${mergedProfiles.length} 款设备)`);
    }

    normalizedDb = {
      libVersion: currentDbData?.libVersion || generateNewLibVersion(),
      exportedAt: new Date().toISOString(),
      generator: 'SparkLink PlayJoy Cloud Publisher (高保真探针合入版)',
      description: '星闪与双子星方案磁轴外设产品库与硬件拓扑全量数据库（包含配列、灯珠、上下双灯、轴体、校准与性能规格）',
      totalDevices: mergedProfiles.length,
      profiles: mergedProfiles,
    };

    appendLog('success', `[探针解析成功] 识别到星闪探针硬件包: ${devName} (${vHex}:${pHex})！包含 ${mat.totalKeys || 64} 键物理矩阵、${light.totalLeds || 64} 颗灯珠！`);
  } else {
    appendLog('error', `文件解析失败: ${fileName} 不是合法的星闪探针硬件包或数据库格式！`);
    return;
  }

  currentDbData = normalizedDb;
  const count = currentDbData.profiles.length;

  pkgFilename.textContent = fileName;
  pkgDevCount.textContent = `${count} 款设备`;
  pkgVersionTag.textContent = `包含适配版本: ${currentDbData.libVersion || '动态生成'}`;
  pkgInfoCard.style.display = 'block';

  deviceList.innerHTML = '';
  currentDbData.profiles.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'device-item';
    const vHex = (p.hardwareFingerprint?.vendorIdHex || p.vendorIdHex || (p.vendorId ? '0x' + (p.vendorId).toString(16) : '0x1CA6')).toUpperCase();
    const pHex = (p.hardwareFingerprint?.productIdHex || p.productIdHex || (p.productId ? '0x' + (p.productId).toString(16) : '0x300D')).toUpperCase();
    const brand = p.hardwareFingerprint?.brandName || p.deviceProfile?.brand || p.brand || '';
    const model = p.deviceProfile?.model || p.model || p.shortName || '';
    const nameDisplay = brand && model && !model.includes(brand) ? `${brand} · ${model}` : (p.name || '客制化键盘');
    const layout = p.matrixLayout?.layoutName || p.deviceProfile?.layoutName || p.layout || '标准配列';
    const keyCount = p.matrixLayout?.totalKeys || p.deviceProfile?.totalKeyCount || p.totalKeyCount || 64;
    const leds = p.lightingTopology?.totalLeds || p.lighting?.totalLeds || keyCount;
    const spaceLeds = p.lightingTopology?.spaceLamps?.count || p.lighting?.spacebarLeds || 1;
    const isDual = !!(p.lightingTopology?.isDoubleLighting || p.lighting?.dualLamps);

    item.innerHTML = `
      <div class="device-header" style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:600; color:#f8fafc;">${nameDisplay}</span>
        <span class="device-tag">${vHex}:${pHex}</span>
      </div>
      <div class="device-meta" style="font-size:12px; color:#94a3b8; margin-top:4px;">
        配列: ${layout} (${keyCount}键) | 灯珠: ${leds}颗 (空格${spaceLeds}灯${isDual ? '/上下双灯' : ''})
      </div>
    `;
    deviceList.appendChild(item);
  });

  if (!dbChangelogInput.value.trim() || dbChangelogInput.value.includes('新增')) {
    dbChangelogInput.value = `新增适配 ${count} 款星闪方案外设 PCB，支持高频回报率与磁轴快速触发`;
  }

  btnPublishDb.disabled = false;
  btnExportBundle.disabled = false;
  btnExportDbLocal.disabled = false;
  btnExportPatchLocal.disabled = false;
  appendLog('success', `成功载入键盘适配包: ${fileName} (共 ${count} 款硬件配置)`);
}

dbDropZone.addEventListener('click', async () => {
  const res = await window.publisherAPI.selectPackageFile();
  if (!res.canceled && res.data) {
    loadPackageData(res.fileName, res.data);
  } else if (res.error) {
    appendLog('error', `读取文件失败: ${res.error}`);
  }
});

dbDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dbDropZone.classList.add('dragover');
});
dbDropZone.addEventListener('dragleave', () => dbDropZone.classList.remove('dragover'));
dbDropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dbDropZone.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;

  try {
    const arrayBuf = await file.arrayBuffer();
    const res = await window.publisherAPI.parseDroppedPackageBuffer(file.name, Array.from(new Uint8Array(arrayBuf)));
    if (res.success && res.data) {
      loadPackageData(file.name, res.data);
    } else {
      appendLog('error', `解析数据包失败: ${res.error || '文件格式不支持'}`);
    }
  } catch (err) {
    appendLog('error', `读取拖拽文件失败: ${err.message}`);
  }
});

// 【窗口一】：一键同步键盘数据库到云端
btnPublishDb.addEventListener('click', async () => {
  if (!currentDbData) {
    appendLog('warning', '请先在左侧导入适配数据包！');
    return;
  }

  const cfg = {
    platform: 'gitee',
    gitee: {
      owner: giteeOwner.value.trim(),
      repo: giteeRepo.value.trim(),
      branch: giteeBranch.value.trim() || 'master',
      accessToken: giteeToken.value.trim(),
    },
  };

  if (!cfg.gitee.owner || !cfg.gitee.repo || !cfg.gitee.accessToken) {
    appendLog('error', '请先点击右上角「云端仓库与私人令牌配置」填写 Gitee 空间名与 Token！');
    cloudDrawer.style.display = 'block';
    return;
  }

  btnPublishDb.disabled = true;
  btnExportBundle.disabled = true;
  btnExportDbLocal.disabled = true;
  btnExportPatchLocal.disabled = true;
  resultBanner.style.display = 'none';

  const res = await window.publisherAPI.publishLibUpdate({
    platform: 'gitee',
    config: cfg,
    dbData: currentDbData,
    libVersion: libVersionInput.value.trim(),
    changelog: dbChangelogInput.value.trim(),
  });

  btnPublishDb.disabled = false;
  btnExportBundle.disabled = false;
  btnExportDbLocal.disabled = false;
  btnExportPatchLocal.disabled = false;

  if (res.success) {
    resultTitle.textContent = `键盘适配库 (${res.libVersion}) 发布成功！全国用户已可秒级无感热更新！`;
    manifestUrlText.textContent = res.manifestUrl;
    resultBanner.style.display = 'block';
    btnCopyManifest.onclick = () => {
      navigator.clipboard?.writeText(res.manifestUrl);
      appendLog('success', '已将 Manifest 直链复制到剪贴板！');
    };
  }
});

// 【窗口一】：一键导出单文件数据库集合包 (.spkdb)
btnExportBundle.addEventListener('click', async () => {
  if (!currentDbData) return;
  btnExportBundle.disabled = true;
  appendLog('info', '================================================');
  appendLog('info', `正在将当前全量硬件数据 (${currentDbData.profiles?.length || 0} 款外设) 打包为单一集合包 (.spkdb)...`);

  const res = await window.publisherAPI.exportSpkdbBundle({
    dbData: currentDbData,
    libVersion: libVersionInput.value.trim(),
    changelog: dbChangelogInput.value.trim(),
  });
  btnExportBundle.disabled = false;

  if (!res.canceled) {
    appendLog('success', `🎉 单文件数据库集合包已成功生成并保存！`);
    appendLog('info', `文件路径: ${res.filePath}`);
    appendLog('info', `包含版本: V${res.libVersion} (总计 ${res.totalDevices} 款键盘硬件档案)`);
    appendLog('info', `✨ 您可直接将此单一文件发到群里或网盘，用户直接在驱动中点击「导入离线集合包」即可秒级更新！`);
  }
});

// 【窗口一】：导出本地设备库
btnExportDbLocal.addEventListener('click', async () => {
  if (!currentDbData) return;
  const cfg = {
    gitee: { owner: giteeOwner.value.trim(), repo: giteeRepo.value.trim() },
    appRelease: { appVersion: appVersionInput.value.trim(), changelog: '' },
  };
  const res = await window.publisherAPI.exportLocalPackage({
    dbData: currentDbData,
    libVersion: libVersionInput.value.trim(),
    changelog: dbChangelogInput.value.trim(),
    appDownloadUrl: appDownloadUrl.value.trim(),
    appVersion: appVersionInput.value.trim(),
    config: cfg,
  });

  if (!res.canceled) {
    appendLog('success', `本地设备库已成功导出至: ${res.targetDir}`);
    appendLog('info', `包含 device_db.json 与 manifest.json，您可手动上传至 123云盘/蓝奏云/OSS。`);
  }
});

// 【窗口一】：导出绿色免安装升级补丁 (.bat)
btnExportPatchLocal.addEventListener('click', async () => {
  if (!currentDbData) return;
  const res = await window.publisherAPI.exportGreenPatch({
    dbData: currentDbData,
    libVersion: libVersionInput.value.trim(),
  });

  if (!res.canceled) {
    appendLog('success', `🎉 绿色免安装升级补丁与全量数据库已成功导出！`);
    appendLog('info', `补丁文件: ${res.batPath}`);
    appendLog('info', `数据库文件: ${res.jsonPath}`);
    appendLog('info', `用户下载后只需双击运行该 .bat 脚本，即可自动检测驱动存储目录并安全覆写最新硬件库！`);
  }
});

// =========================================================================
// 7. 【窗口二】：驱动客户端安装包选择与校验
// =========================================================================
appDropZone.addEventListener('click', async () => {
  const res = await window.publisherAPI.selectInstallerFile();
  if (!res.canceled && res.filePath) {
    currentAppFile = res;
    appFilename.textContent = res.fileName;
    appFilesize.textContent = res.sizeFormatted;
    appFilepath.textContent = res.filePath;
    appFileCard.style.display = 'block';

    appendLog('success', `已选取安装包: ${res.fileName} (大小: ${res.sizeFormatted})`);

    // 若未填直链，自动根据仓库与版本生成推荐直链模板
    if (!appDownloadUrl.value.trim()) {
      const owner = giteeOwner.value.trim() || 'your_username';
      const repo = giteeRepo.value.trim() || 'sparklink-hub-releases';
      const ver = appVersionInput.value.trim() || '1.4.0';
      appDownloadUrl.value = `https://gitee.com/${owner}/${repo}/releases/download/v${ver}/${res.fileName}`;
    }
  }
});

btnTestAppUrl.addEventListener('click', async () => {
  const url = appDownloadUrl.value.trim();
  if (!url) {
    appendLog('warning', '请先填写安装包下载直链！');
    return;
  }

  btnTestAppUrl.disabled = true;
  appendLog('info', `正在测试安装包下载直链可用性: ${url} ...`);

  const res = await window.publisherAPI.testUrlReachability(url);
  btnTestAppUrl.disabled = false;

  if (res.reachable) {
    appendLog('success', `✓ 下载直链连通正常 (HTTP ${res.statusCode}, 远端体积: ${res.sizeFormatted})`);
  } else {
    appendLog('warning', `⚠️ 直链暂不可直接 HEAD/GET 下载 (原因: ${res.error || res.statusCode})。请确认网盘是否设置了防盗链或链接过期。`);
  }
});

// 【窗口二】：一键推送驱动软件更新到云端
btnPublishApp.addEventListener('click', async () => {
  const targetVer = appVersionInput.value.trim();
  const downloadUrl = appDownloadUrl.value.trim();
  const changelog = appChangelogInput.value.trim();
  const forceUpdate = appForceSelect.value === 'true';

  if (!targetVer) {
    appendLog('error', '请填写待发布的驱动新版本号！');
    return;
  }
  if (!downloadUrl) {
    appendLog('error', '请填写新版驱动安装包的下载直链！');
    return;
  }

  const cfg = {
    platform: 'gitee',
    gitee: {
      owner: giteeOwner.value.trim(),
      repo: giteeRepo.value.trim(),
      branch: giteeBranch.value.trim() || 'master',
      accessToken: giteeToken.value.trim(),
    },
    appRelease: {
      appVersion: targetVer,
      appDownloadUrl: downloadUrl,
      changelog,
      forceUpdate,
      fileSize: currentAppFile?.sizeFormatted || '',
    },
  };

  if (!cfg.gitee.owner || !cfg.gitee.repo || !cfg.gitee.accessToken) {
    appendLog('error', '请先在右上角「云端仓库与私人令牌配置」填写 Gitee 空间名与 Token！');
    cloudDrawer.style.display = 'block';
    return;
  }

  btnPublishApp.disabled = true;
  btnExportAppLocal.disabled = true;
  resultBanner.style.display = 'none';

  const res = await window.publisherAPI.publishAppUpdate({
    platform: 'gitee',
    config: cfg,
    appVersion: targetVer,
    appDownloadUrl: downloadUrl,
    changelog,
    forceUpdate,
    fileSize: currentAppFile?.sizeFormatted || '',
  });

  btnPublishApp.disabled = false;
  btnExportAppLocal.disabled = false;

  if (res.success) {
    resultTitle.textContent = `驱动客户端 V${res.appVersion} 发布成功！全国用户打开客户端将即刻弹出升级通知！`;
    manifestUrlText.textContent = res.manifestUrl;
    resultBanner.style.display = 'block';
    btnCopyManifest.onclick = () => {
      navigator.clipboard?.writeText(res.manifestUrl);
      appendLog('success', '已将 Manifest 直链复制到剪贴板！');
    };
  }
});

// 【窗口二】：导出清单
btnExportAppLocal.addEventListener('click', async () => {
  const cfg = {
    gitee: { owner: giteeOwner.value.trim(), repo: giteeRepo.value.trim() },
    appRelease: {
      appVersion: appVersionInput.value.trim(),
      changelog: appChangelogInput.value.trim(),
    },
  };
  const res = await window.publisherAPI.exportLocalPackage({
    dbData: currentDbData,
    libVersion: libVersionInput.value.trim(),
    changelog: dbChangelogInput.value.trim(),
    appDownloadUrl: appDownloadUrl.value.trim(),
    appVersion: appVersionInput.value.trim(),
    config: cfg,
  });

  if (!res.canceled) {
    appendLog('success', `最新 manifest.json 清单已导出至: ${res.targetDir}`);
  }
});

// 启动
init();

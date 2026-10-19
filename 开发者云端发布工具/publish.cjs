/**
 * 星闪悦动驱动 - 开发者云端发布脚本 (Node.js 绿色独立版)
 * 
 * 作用：
 * 1. 本脚本独立存放于开发者本地电脑，绝对禁止打包进分发给普通用户的客户端安装包中；
 * 2. 开发者在客户端 DevLab 调试并导出全量适配库 (device_db.json) 后，运行此脚本；
 * 3. 自动计算设备数量、时间戳，生成 manifest.json 清单；
 * 4. 支持【自动推送模式】：通过 Gitee / GitHub REST API 一键上传/更新文件到云端公开仓；
 * 5. 支持【本地分发模式】：输出到 dist_cloud/ 目录，便于手动上传至 123云盘/蓝奏云/OSS/个人服务器。
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_FILE = path.join(__dirname, 'config.json');
const EXAMPLE_CONFIG_FILE = path.join(__dirname, 'config.example.json');
const DIST_DIR = path.join(__dirname, 'dist_cloud');

console.log('======================================================');
console.log('      星闪悦动驱动 - 开发者设备库云端发布助手       ');
console.log('======================================================\n');

// 1. 读取或初始化配置
let config = null;
if (!fs.existsSync(CONFIG_FILE)) {
  if (fs.existsSync(EXAMPLE_CONFIG_FILE)) {
    fs.copyFileSync(EXAMPLE_CONFIG_FILE, CONFIG_FILE);
    console.log('[提示] 已为您自动生成本地私密配置文件: config.json');
    console.log('[提示] 如果需要自动化一键推送到 Gitee，请编辑 config.json 填入您的 Gitee Token。\n');
  } else {
    console.error('[错误] 未找到配置文件模板！');
    process.exit(1);
  }
}

try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
} catch (e) {
  console.error('[错误] 读取 config.json 失败:', e.message);
  process.exit(1);
}

// 2. 寻找待发布的 device_db.json
const searchDeviceDb = () => {
  // 优先级 1: 当前目录下的 device_db.json
  const localDb = path.join(__dirname, 'device_db.json');
  if (fs.existsSync(localDb)) return localDb;

  // 优先级 2: 当前目录下任意 device_db_*.json (如从浏览器 DevLab 导出的带版本后缀的文件)
  const files = fs.readdirSync(__dirname);
  const found = files.find(f => f.startsWith('device_db') && f.endsWith('.json'));
  if (found) return path.join(__dirname, found);

  // 优先级 3: 检查下载文件夹
  try {
    const userHome = process.env.USERPROFILE || process.env.HOME;
    if (userHome) {
      const downloads = path.join(userHome, 'Downloads');
      if (fs.existsSync(downloads)) {
        const dFiles = fs.readdirSync(downloads);
        const dFound = dFiles
          .filter(f => f.startsWith('device_db') && f.endsWith('.json'))
          .sort((a, b) => {
            return fs.statSync(path.join(downloads, b)).mtimeMs - fs.statSync(path.join(downloads, a)).mtimeMs;
          })[0];
        if (dFound) return path.join(downloads, dFound);
      }
    }
  } catch (e) {}

  return null;
};

const dbFilePath = searchDeviceDb();
if (!dbFilePath) {
  console.log('[待办] 未在当前目录或下载文件夹中找到待发布的 device_db.json 文件！');
  console.log('请先在星闪驱动客户端【设置页】点击版本7次打开「开发者后台 (DevLab)」，');
  console.log('点击「导出全量适配库」，将导出的 json 文件放入本工具目录下，然后再次运行本脚本。\n');
  process.exit(1);
}

console.log(`[1/3] 找到待发布的设备库文件: ${path.basename(dbFilePath)}`);
let dbData = null;
try {
  dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
} catch (e) {
  console.error('[错误] 解析设备库 JSON 失败:', e.message);
  process.exit(1);
}

const totalDevices = Array.isArray(dbData.profiles) ? dbData.profiles.length : 0;
const now = new Date();
const dateTag = now.toISOString().slice(0, 10).replace(/-/g, '.');
const libVersion = dbData.libVersion || `${dateTag}.1`;

console.log(`      - 适配库版本: ${libVersion}`);
console.log(`      - 包含硬件适配数量: ${totalDevices} 款键盘/PCB`);

// 3. 构建发布目录与 manifest.json
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

const targetDbPath = path.join(DIST_DIR, 'device_db.json');
fs.writeFileSync(targetDbPath, JSON.stringify(dbData, null, 2), 'utf-8');

// 计算下载直链
let libDownloadUrl = '';
let manifestDownloadUrl = '';

if (config.gitee && config.gitee.owner && config.gitee.owner !== 'your_gitee_username') {
  const g = config.gitee;
  const rawBase = g.rawBaseUrl || `https://gitee.com/${g.owner}/${g.repo}/raw/${g.branch || 'master'}`;
  libDownloadUrl = `${rawBase}/device_db.json`;
  manifestDownloadUrl = `${rawBase}/manifest.json`;
} else if (config.github && config.github.owner && config.github.owner !== 'your_github_username') {
  const gh = config.github;
  libDownloadUrl = `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch || 'main'}/device_db.json`;
  manifestDownloadUrl = `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${gh.branch || 'main'}/manifest.json`;
} else {
  libDownloadUrl = 'https://your-domain-or-cloud-drive.com/device_db.json';
  manifestDownloadUrl = 'https://your-domain-or-cloud-drive.com/manifest.json';
}

const manifest = {
  libVersion,
  libDownloadUrl,
  totalDevices,
  libChangelog: `新增适配 ${totalDevices} 款星闪方案外设 PCB，支持高频回报率与磁轴快速触发`,
  appVersion: config.appRelease?.appVersion || '1.3.0',
  appDownloadUrl: config.appRelease?.appDownloadUrl || '',
  appChangelog: config.appRelease?.changelog || '优化连接稳定性与客制化键盘即时热识别',
  updatedAt: now.toISOString(),
};

const targetManifestPath = path.join(DIST_DIR, 'manifest.json');
fs.writeFileSync(targetManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[2/3] 已生成发布包到 dist_cloud/ 目录:`);
console.log(`      - ${targetManifestPath}`);
console.log(`      - ${targetDbPath}\n`);

// 4. 判断是否一键推送到 Gitee
const hasGiteeToken = config.gitee?.accessToken &&
  !config.gitee.accessToken.includes('填入') &&
  config.gitee.owner &&
  config.gitee.owner !== 'your_gitee_username';

if (!hasGiteeToken) {
  console.log('[3/3] 当前为【离线 / 自建云盘分发模式】');
  console.log('------------------------------------------------------');
  console.log('您可以将 dist_cloud/ 文件夹内的文件直接上传至:');
  console.log('  1. 123云盘 / 蓝奏云 / 阿里云OSS / 腾讯云COS 等国内免费网盘/对象存储；');
  console.log('  2. 或者将 device_db.json 直接在 QQ 群或发给用户，让用户在客户端点击「导入离线适配库」；');
  console.log('  3. 若您在 Gitee 创建了公开仓库并获取了 Personal Access Token，');
  console.log('     在 config.json 中填入即可开启「全自动一键发布到 Gitee」！');
  console.log('------------------------------------------------------\n');
  process.exit(0);
}

// 自动上传到 Gitee
console.log('[3/3] 正在通过 Gitee API 自动推送至云端公开仓库...');

const pushToGitee = (fileName, fileContent) => {
  return new Promise((resolve, reject) => {
    const g = config.gitee;
    const pathEncoded = encodeURIComponent(fileName);
    const getPath = `/api/v5/repos/${g.owner}/${g.repo}/contents/${pathEncoded}?access_token=${g.accessToken}&ref=${g.branch || 'master'}`;

    // 先查询文件是否存在以获取 sha
    const getReq = https.request({
      hostname: 'gitee.com',
      port: 443,
      path: getPath,
      method: 'GET',
      headers: { 'User-Agent': 'SparkLink-Publisher' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let sha = null;
        if (res.statusCode === 200) {
          try {
            const info = JSON.parse(body);
            sha = info.sha;
          } catch (e) {}
        }

        // 执行 PUT 上传/更新
        const payload = {
          access_token: g.accessToken,
          content: Buffer.from(fileContent).toString('base64'),
          message: `Update ${fileName} via SparkLink Publisher (${libVersion})`,
          branch: g.branch || 'master',
        };
        if (sha) payload.sha = sha;

        const payloadStr = JSON.stringify(payload);
        const putReq = https.request({
          hostname: 'gitee.com',
          port: 443,
          path: `/api/v5/repos/${g.owner}/${g.repo}/contents/${pathEncoded}`,
          method: sha ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadStr),
            'User-Agent': 'SparkLink-Publisher',
          }
        }, (putRes) => {
          let putBody = '';
          putRes.on('data', chunk => putBody += chunk);
          putRes.on('end', () => {
            if (putRes.statusCode >= 200 && putRes.statusCode < 300) {
              resolve(true);
            } else {
              reject(new Error(`Gitee API 返回 HTTP ${putRes.statusCode}: ${putBody}`));
            }
          });
        });

        putReq.on('error', reject);
        putReq.write(payloadStr);
        putReq.end();
      });
    });

    getReq.on('error', reject);
    getReq.end();
  });
};

(async () => {
  try {
    const dbContent = fs.readFileSync(targetDbPath, 'utf-8');
    const manifestContent = fs.readFileSync(targetManifestPath, 'utf-8');

    process.stdout.write('  -> 上传 device_db.json ... ');
    await pushToGitee('device_db.json', dbContent);
    console.log('✓ 完成');

    process.stdout.write('  -> 上传 manifest.json ... ');
    await pushToGitee('manifest.json', manifestContent);
    console.log('✓ 完成\n');

    console.log('======================================================');
    console.log('          🎉 全量设备适配库已成功发布到云端！          ');
    console.log('======================================================');
    console.log('\n请将下方【云端更新直链】复制并填入驱动程序的「开发者后台 (DevLab)」中：');
    console.log(`\n👉 ${manifestDownloadUrl}\n`);
    console.log('全国用户点击驱动「检查云端更新」即可无感秒级完成适配，无需重新安装客户端！\n');
  } catch (err) {
    console.error('\n[错误] 推送至 Gitee 失败:', err.message);
    console.log('[提示] 您的发布文件已保存在 dist_cloud/ 文件夹中，您仍可手动上传。');
  }
})();

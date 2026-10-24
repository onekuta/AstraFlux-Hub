const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCESS_TOKEN = '33d0785503ae9d65d80a59766521c23f';
const OWNER = 'kutaze';
const REPO = 'astra-flux-hub';
const TAG = 'v1.1.3';
const RELEASE_NAME = 'AstraFlux-HUB V1.1.3 正式发布 (官方 Inno Setup 向导版)';

const ROOT_DIR = path.resolve(__dirname, '../..');
const SETUP_EXE_PATH = path.resolve(ROOT_DIR, '安装包/正式版/V1.1.3/AstraFlux-HUB_Setup_v1.1.3.exe');
const MANIFEST_PATH = path.resolve(ROOT_DIR, '安装包/正式版/V1.1.3/manifest.json');
const CHANGELOG_PATH = path.resolve(ROOT_DIR, '安装包/正式版/V1.1.3/更新日志.md');

const RELEASE_BODY = `### 🚀 AstraFlux-HUB (星流驱动) V1.1.3 正式发布

#### 📦 安装包国内高速直连下载：
* ⚡ **[👉 点击通过 Gitee 官方发行版极速直连下载](https://gitee.com/Kutaze/astra-flux-hub/releases/download/v1.1.3/AstraFlux-HUB_Setup_v1.1.3.exe)**
* 🌐 **[GitHub Releases 镜像下载](https://github.com/onekuta/AstraFlux-Hub/releases/download/v1.1.3/AstraFlux-HUB_Setup_v1.1.3.exe)**
* 🐧 **QQ 官方交流群**：**1131310645**（群文件已同步上传 \`AstraFlux-HUB_Setup_v1.1.3.exe\`）

---

#### 📝 本次改动摘要 (Changelog)：
1. 数据库更新后自动执行二次全量扫描
2. 全面绑定标准版本构建时间码 (26.10.23)，建立防止从新版正式版倒退安装旧 Beta 版本的安全门禁
3. 全软件多语言国际化支持（简体中文、English、日本語）
4. 全新高颜值自定义下拉框（CustomSelect），修复设置页右上角标签折行与界面细节
5. 数据库更新卡片动态展示云端更新日志说明 (libChangelog)
6. 修复了一些键盘适配BUG
7. 新增加了Beta版更新渠道，用做最新测试需求
8. 修复了一些软件UI显示问题

---

- **安装包文件名**：\`AstraFlux-HUB_Setup_v1.1.3.exe\` (93.50 MB)
- **构建代码**：\`26.10.23\`
- **SHA-256 校验码**：\`bc371c234caa4e2fb104b3a38ff1dd3dcd6edfb185691016f2ea90d44260b5f9\`
`;

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function updateFileOnGitee(filePathOnRepo, contentBuffer, commitMessage) {
  const pathEncoded = filePathOnRepo.split('/').map(encodeURIComponent).join('/');
  const getUrl = `https://gitee.com/api/v5/repos/${OWNER}/${REPO}/contents/${pathEncoded}?access_token=${ACCESS_TOKEN}&ref=main`;
  
  const getRes = await request(getUrl);
  const sha = (getRes.status === 200 && getRes.data && getRes.data.sha) ? getRes.data.sha : null;
  
  const payload = {
    access_token: ACCESS_TOKEN,
    content: Buffer.from(contentBuffer).toString('base64'),
    message: commitMessage,
    branch: 'main'
  };
  if (sha) payload.sha = sha;

  const payloadStr = JSON.stringify(payload);
  const putUrl = `https://gitee.com/api/v5/repos/${OWNER}/${REPO}/contents/${pathEncoded}`;
  const putRes = await request(putUrl, {
    method: sha ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadStr),
      'User-Agent': 'AstraFlux-Publisher'
    }
  }, payloadStr);

  if (putRes.status >= 200 && putRes.status < 300) {
    console.log(`      ✓ 成功同步云端文件: ${filePathOnRepo}`);
  } else {
    throw new Error(`同步 ${filePathOnRepo} 失败: HTTP ${putRes.status}: ${JSON.stringify(putRes.data)}`);
  }
}

async function main() {
  console.log('========================================================');
  console.log('      AstraFlux-HUB Gitee 官方发行版与清单极速推送流水线      ');
  console.log('========================================================\n');

  // 1. 同步软件清单 software/manifest.json 与 software/更新日志.md
  console.log('[1/4] 正在推送 software/manifest.json 与 更新日志.md 到 Gitee main 分支...');
  const manifestBuf = fs.readFileSync(MANIFEST_PATH);
  await updateFileOnGitee('software/manifest.json', manifestBuf, 'Release: AstraFlux-HUB v1.1.3 manifest update');

  if (fs.existsSync(CHANGELOG_PATH)) {
    const changelogBuf = fs.readFileSync(CHANGELOG_PATH);
    await updateFileOnGitee('software/更新日志.md', changelogBuf, 'Release: AstraFlux-HUB v1.1.3 changelog update');
  }

  // 2. 检查或创建 Gitee Release
  console.log(`\n[2/4] 正在查询或创建 Gitee Release: ${TAG} ...`);
  const listRes = await request(`https://gitee.com/api/v5/repos/${OWNER}/${REPO}/releases?access_token=${ACCESS_TOKEN}`);
  let release = null;
  if (Array.isArray(listRes.data)) {
    release = listRes.data.find(r => r.tag_name === TAG);
  }

  if (!release) {
    const postData = JSON.stringify({
      access_token: ACCESS_TOKEN,
      tag_name: TAG,
      name: RELEASE_NAME,
      body: RELEASE_BODY,
      target_commitish: 'main'
    });

    const createRes = await request(`https://gitee.com/api/v5/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AstraFlux-Publisher'
      }
    }, postData);

    if (createRes.status === 201 || (createRes.data && createRes.data.id)) {
      release = createRes.data;
      console.log(`      ✓ 成功创建 Release (ID: ${release.id})`);
    } else {
      throw new Error(`创建 Release 失败: ${JSON.stringify(createRes.data)}`);
    }
  } else {
    console.log(`      ✓ 发现已存在的 Release (ID: ${release.id})，正在更新内容...`);
    const patchData = JSON.stringify({
      access_token: ACCESS_TOKEN,
      tag_name: TAG,
      name: RELEASE_NAME,
      body: RELEASE_BODY
    });
    await request(`https://gitee.com/api/v5/repos/${OWNER}/${REPO}/releases/${release.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patchData),
        'User-Agent': 'AstraFlux-Publisher'
      }
    }, patchData);
    console.log(`      ✓ Release 信息更新成功`);
  }

  // 3. 检查附件
  console.log(`\n[3/4] 检查 Release 附件 ...`);
  const attachRes = await request(`https://gitee.com/api/v5/repos/${OWNER}/${REPO}/releases/${release.id}/attach_files?access_token=${ACCESS_TOKEN}`);
  const fileName = path.basename(SETUP_EXE_PATH);
  const existingAttach = Array.isArray(attachRes.data) ? attachRes.data.find(a => a.name === fileName) : null;

  if (existingAttach) {
    console.log(`      ✓ 附件已存在且无需重复上传:`);
    console.log(`        下载直链: ${existingAttach.browser_download_url}`);
  } else {
    // 4. 上传安装包至 Release 附件
    console.log(`\n[4/4] 正在上传 93.5MB 安装包至 Release 附件: ${fileName} ...`);
    if (!fs.existsSync(SETUP_EXE_PATH)) {
      throw new Error(`未找到安装包本体: ${SETUP_EXE_PATH}`);
    }

    const fileStats = fs.statSync(SETUP_EXE_PATH);
    const sizeMb = (fileStats.size / 1024 / 1024).toFixed(2);
    console.log(`      正在传输 ${sizeMb} MB，请耐心等待 ...`);

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const crlf = '\r\n';

    const headerPart = Buffer.from(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"${crlf}` +
      `Content-Type: application/octet-stream${crlf}${crlf}`
    );

    const footerPart = Buffer.from(
      `${crlf}--${boundary}--${crlf}`
    );

    const totalLength = headerPart.length + fileStats.size + footerPart.length;

    const uploadOptions = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength,
        'User-Agent': 'AstraFlux-Publisher'
      }
    };

    const uploadUrl = `https://gitee.com/api/v5/repos/${OWNER}/${REPO}/releases/${release.id}/attach_files?access_token=${ACCESS_TOKEN}`;

    await new Promise((resolve, reject) => {
      let uploadedBytes = 0;
      let lastPercent = 0;

      const req = https.request(uploadUrl, uploadOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\n      ✓ 安装包上传成功 (HTTP ${res.statusCode})`);
            try {
              const attachData = JSON.parse(data);
              console.log(`        下载直链: ${attachData.browser_download_url}`);
            } catch {}
            resolve();
          } else {
            reject(new Error(`上传附件失败: HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);

      req.write(headerPart);
      const fileStream = fs.createReadStream(SETUP_EXE_PATH);
      fileStream.on('data', chunk => {
        req.write(chunk);
        uploadedBytes += chunk.length;
        const percent = Math.floor((uploadedBytes / fileStats.size) * 100);
        if (percent >= lastPercent + 10) {
          lastPercent = percent;
          process.stdout.write(`      [上传进度] ${percent}% (${(uploadedBytes / 1024 / 1024).toFixed(1)} / ${sizeMb} MB)\r`);
        }
      });
      fileStream.on('end', () => {
        req.write(footerPart);
        req.end();
        console.log(`\n      数据传输完毕，等待 Gitee 服务端完成校验存储...`);
      });
    });
  }

  console.log('\n========================================================');
  console.log('🎉 AstraFlux-HUB V1.1.3 正式版已成功推送到 Gitee 发布页！');
  console.log(`🌐 发行版页面: https://gitee.com/${OWNER}/${REPO}/releases/tag/${TAG}`);
  console.log(`📦 下载直链: https://gitee.com/${OWNER}/${REPO}/releases/download/${TAG}/${fileName}`);
  console.log('========================================================\n');
}

main().catch(err => {
  console.error('[推送过程发生错误]', err);
  process.exit(1);
});

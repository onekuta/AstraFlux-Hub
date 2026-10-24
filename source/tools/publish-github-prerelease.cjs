const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'onekuta';
const REPO = 'AstraFlux-Hub';
const TAG = 'beta0.26.10.25';
const RELEASE_NAME = 'AstraFlux-HUB Beta 0.26.10.25';
const CHANGELOG_PATH = path.resolve(__dirname, '../../software(beta)/更新日志.md');
const ASSET_PATH = path.resolve(__dirname, '../../installers/beta/beta0.26.10.25/AstraFlux-HUB_Setup_beta0.26.10.25.exe');

async function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function main() {
  console.log(`Checking existing release for tag ${TAG}...`);
  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

  // 1. Check if release already exists
  const checkRes = await request(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'NodeJS',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  let releaseId;
  let uploadUrl;

  if (checkRes.status === 200 && checkRes.data?.id) {
    console.log(`Release exists with ID ${checkRes.data.id}. Updating...`);
    releaseId = checkRes.data.id;
    uploadUrl = checkRes.data.upload_url;

    // Update release with prerelease: true
    const updateRes = await request(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}`, {
      method: 'PATCH',
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, {
      tag_name: TAG,
      name: RELEASE_NAME,
      body: changelog,
      prerelease: true,
      draft: false
    });
    console.log(`Updated release status: ${updateRes.status}`);
  } else {
    console.log(`Creating new release with prerelease: true...`);
    const createRes = await request(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST',
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, {
      tag_name: TAG,
      name: RELEASE_NAME,
      body: changelog,
      prerelease: true,
      draft: false
    });

    if (createRes.status !== 201) {
      console.error(`Failed to create release:`, createRes);
      process.exit(1);
    }
    releaseId = createRes.data.id;
    uploadUrl = createRes.data.upload_url;
    console.log(`Successfully created release ID ${releaseId} (prerelease: true)!`);
  }

  // 2. Upload asset
  if (fs.existsSync(ASSET_PATH)) {
    const assetName = path.basename(ASSET_PATH);
    const assetStats = fs.statSync(ASSET_PATH);
    console.log(`Uploading asset ${assetName} (${(assetStats.size / 1024 / 1024).toFixed(2)} MB)...`);

    // Clean raw upload_url (remove {?name,label})
    const cleanUploadUrl = uploadUrl.split('{')[0] + `?name=${encodeURIComponent(assetName)}`;
    
    // Check if asset already exists in release
    const assetsRes = await request(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${releaseId}/assets`, {
      method: 'GET',
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (assetsRes.status === 200 && Array.isArray(assetsRes.data)) {
      const existing = assetsRes.data.find(a => a.name === assetName);
      if (existing) {
        console.log(`Deleting existing asset ${existing.id}...`);
        await request(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${existing.id}`, {
          method: 'DELETE',
          headers: {
            'User-Agent': 'NodeJS',
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
      }
    }

    // Stream upload
    const fileStream = fs.createReadStream(ASSET_PATH);
    const parsedUrl = new URL(cleanUploadUrl);

    const uploadPromise = new Promise((resolve, reject) => {
      const req = https.request({
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'User-Agent': 'NodeJS',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': assetStats.size,
          'Accept': 'application/vnd.github.v3+json'
        }
      }, (res) => {
        let resData = '';
        res.on('data', c => resData += c);
        res.on('end', () => {
          console.log(`Upload completed with status ${res.statusCode}`);
          resolve({ status: res.statusCode, raw: resData });
        });
      });
      req.on('error', reject);
      fileStream.pipe(req);
    });

    await uploadPromise;
    console.log(`🎉 Asset uploaded successfully!`);
  } else {
    console.warn(`Asset file not found at ${ASSET_PATH}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

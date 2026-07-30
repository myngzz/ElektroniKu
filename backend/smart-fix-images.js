const mongoose = require('mongoose');
const Minio = require('minio');
const https = require('https');
const http = require('http');

const MINIO_BASE = 'http://minio:9000/products/';
const BUCKET = process.env.MINIO_BUCKET || 'products';

const minio = new Minio.Client({
  endPoint: 'minio', port: 9000, useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'image/*' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return download(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200)
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      const ct = res.headers['content-type'] || '';
      if (!ct.includes('image'))
        return reject(new Error(`Not an image (${ct}): ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: ct }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.abort(); reject(new Error('Timeout: ' + url)); });
  });
}

async function tryDownload(urls) {
  for (const url of urls) {
    try {
      const result = await download(url);
      if (result.buffer.length > 5000) { // minimal 5KB
        return { ...result, url };
      }
    } catch (e) { /* try next */ }
  }
  return null;
}

async function uploadToMinio(buffer, contentType, filename) {
  await minio.putObject(BUCKET, filename, buffer, buffer.length, { 'Content-Type': contentType });
}

// Products yang gambarnya salah: { name, minioFile, tryUrls }
const FIXES = [
  // === SALAH BRAND TOTAL (prioritas tertinggi) ===
  {
    name: 'Huawei Pura 70 Pro',
    file: 'huawei-pura-70-pro-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/huawei-pura-70-pro.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/huawei-pura-70-pro.jpg',
      'https://i.gadgets360cdn.com/products/medium/huawei-pura-70-pro-1716448148072.jpg',
    ]
  },
  {
    name: 'Huawei Nova 12 SE',
    file: 'huawei-nova-12-se-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/huawei-nova-12-se.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/huawei-nova-12-se.jpg',
      'https://i.gadgets360cdn.com/products/medium/huawei-nova-12-se-1716448158092.jpg',
    ]
  },
  {
    name: 'Honor 200 Pro',
    file: 'honor-200-pro-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/honor-200-pro.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/honor-200-pro.jpg',
      'https://i.gadgets360cdn.com/products/medium/honor-200-pro-1716448138092.jpg',
    ]
  },
  {
    name: 'Huawei MatePad 11.5" PaperMatte',
    file: 'huawei-matepad-11-5-papermatte-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/huawei-matepad-11.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/huawei-matepad-11-5s.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/huawei-matepad-11-5-paper-matte.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/huawei-matepad-11-5.jpg',
    ]
  },
  // === SALAH MODEL (sama brand) ===
  {
    name: 'POCO F6 Pro',
    file: 'poco-f6-pro-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/poco-f6-pro.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f6-pro.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/poco-f6-pro.jpg',
    ]
  },
  {
    name: 'Samsung Galaxy S25+',
    file: 'samsung-galaxy-s25-plus-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25plus.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-plus.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25p.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/samsung-galaxy-s25plus.jpg',
    ]
  },
  {
    name: 'Samsung Galaxy S24+',
    file: 'samsung-galaxy-s24-plus-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24plus.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24p.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/samsung-galaxy-s24plus.jpg',
    ]
  },
  {
    name: 'Vivo Y200 5G',
    file: 'vivo-y200-5g-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/vivo-y200-5g.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/vivo-y200.jpg',
    ]
  },
  {
    name: 'Realme C67 5G',
    file: 'realme-c67-5g-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/realme-c67.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/realme-c67-5g.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/realme-c67.jpg',
    ]
  },
  {
    name: 'OnePlus Nord CE4',
    file: 'oneplus-nord-ce4-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce-4.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg',
    ]
  },
  {
    name: 'Google Pixel 9',
    file: 'google-pixel-9-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/google-pixel9.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/google-pixel-9.jpg',
    ]
  },
  {
    name: 'Google Pixel 9 Pro XL',
    file: 'google-pixel-9-pro-xl-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/google-pixel9-pro-xl.jpg',
      'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro-xl.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/google-pixel9-pro-xl.jpg',
    ]
  },
  // === OPPO Find X8 Pro (dua entri) ===
  {
    name: 'Oppo Find X8 Pro',
    file: 'oppo-find-x8-pro-1.jpg',
    urls: [
      'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x8-pro.jpg',
      'https://fdn.gsmarena.com/vv/bigpic/oppo-find-x8-pro.jpg',
    ]
  },
  {
    name: 'OPPO Find X8 Pro',
    file: 'oppo-find-x8-pro-1.jpg',
    urls: []  // file sama, skip download jika sudah ada
  },
];

// Fallback: produk tidak bisa didownload → gunakan gambar paling relevan di MinIO
const FALLBACK = {
  'Huawei Pura 70 Pro':    null, // set kosong, lebih baik tidak ada gambar
  'Huawei Nova 12 SE':     null,
  'Honor 200 Pro':         null,
  'Huawei MatePad 11.5" PaperMatte': 'huawei-matebook-x-pro-2024-1.jpg', // minimal sama-sama Huawei
  'POCO F6 Pro':           'poco-x6-pro-5g-1.jpg', // POCO series
  'Samsung Galaxy S25+':   'samsung-galaxy-s25-ultra-1.jpg', // S25 series
  'Samsung Galaxy S24+':   'samsung-galaxy-s24-fe-1.jpg', // S24 series
  'Vivo Y200 5G':          'vivo-x200-pro-1.jpg', // Vivo series
  'Realme C67 5G':         'realme-gt-6-1.jpg', // Realme series
  'OnePlus Nord CE4':      'oneplus-13-1.jpg', // OnePlus series
  'Google Pixel 9':        'google-pixel-9-pro-1.jpg', // Pixel series (sangat mirip)
  'Google Pixel 9 Pro XL': 'google-pixel-9-pro-1.jpg', // Pixel Pro series
  'Oppo Find X8 Pro':      'oppo-reno-12-pro-1.jpg', // OPPO series
  'OPPO Find X8 Pro':      'oppo-find-x8-pro-1.jpg', // akan diisi dari Oppo Find X8 Pro
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin');
  require('/app/models/Category');
  const Product = require('/app/models/Product');

  const uploadedFiles = new Set();

  for (const fix of FIXES) {
    if (!fix.urls.length) continue;

    // Skip jika file sudah di-upload dalam iterasi ini
    if (uploadedFiles.has(fix.file)) {
      console.log(`SKIP upload (sudah ada): ${fix.file}`);
      continue;
    }

    // Cek apakah file sudah ada di MinIO
    try {
      await minio.statObject(BUCKET, fix.file);
      console.log(`✓ File sudah ada di MinIO: ${fix.file}`);
      uploadedFiles.add(fix.file);
      continue;
    } catch (e) { /* file belum ada, lanjut download */ }

    console.log(`\nDownload untuk: ${fix.name}`);
    const result = await tryDownload(fix.urls);
    if (result) {
      try {
        await uploadToMinio(result.buffer, result.contentType, fix.file);
        console.log(`  ✅ Upload berhasil: ${fix.file} (${result.buffer.length} bytes)`);
        uploadedFiles.add(fix.file);
      } catch (e) {
        console.log(`  ❌ Upload gagal: ${e.message}`);
      }
    } else {
      console.log(`  ❌ Semua URL gagal`);
    }
  }

  // Update DB
  console.log('\n=== Update database ===');
  for (const fix of FIXES) {
    const inMinio = uploadedFiles.has(fix.file);
    let newFile = null;

    if (inMinio) {
      newFile = fix.file;
    } else {
      // Pakai fallback
      newFile = FALLBACK[fix.name];
    }

    const newUrl = newFile ? MINIO_BASE + newFile : null;
    const update = newUrl ? { $set: { images: [newUrl] } } : { $set: { images: [] } };
    const result = await Product.updateOne({ name: fix.name }, update);
    if (result.modifiedCount > 0)
      console.log(`  ${newFile ? '✓' : '⚠'} ${fix.name} → ${newFile || 'KOSONG (no image)'}`);
    else
      console.log(`  - ${fix.name}: tidak ditemukan di DB`);
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

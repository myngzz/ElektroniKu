/**
 * Download semua gambar produk dari URL eksternal → upload ke MinIO
 * Lalu update URL di MongoDB ke MinIO path
 * Usage: node migrate-images-to-minio.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Minio = require('minio');
const https = require('https');
const http = require('http');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku?authSource=admin';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT) || 9000;
const MINIO_ACCESS = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET = process.env.MINIO_SECRET_KEY || 'minioadmin123';
const BUCKET = process.env.MINIO_BUCKET || 'products';

const minio = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: false,
  accessKey: MINIO_ACCESS,
  secretKey: MINIO_SECRET,
});

// Download URL ke buffer
function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/jpeg' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Buat filename MinIO dari nama produk
function toFilename(productName, index) {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + `-${index + 1}.jpg`;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  // Pastikan bucket ada
  const exists = await minio.bucketExists(BUCKET);
  if (!exists) await minio.makeBucket(BUCKET);
  console.log(`✅ MinIO bucket '${BUCKET}' ready\n`);

  const products = await Product.find({ isActive: true });
  let updated = 0, failed = 0;

  for (const product of products) {
    if (!product.images?.length) continue;

    const newImages = [];

    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];

      // Skip jika sudah di MinIO (localhost:9000 atau /products/ path)
      if (url.includes('localhost:9000') || url.includes('minio:9000')) {
        newImages.push(url);
        continue;
      }

      const filename = toFilename(product.name, i);

      try {
        process.stdout.write(`  ⬇  ${product.name} [${i + 1}]... `);
        const { buffer, contentType } = await download(url);
        const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : 'jpg';
        const finalName = filename.replace(/\.jpg$/, `.${ext}`);

        await minio.putObject(BUCKET, finalName, buffer, buffer.length, {
          'Content-Type': contentType,
          'x-amz-acl': 'public-read',
        });

        newImages.push(`http://localhost:9000/${BUCKET}/${finalName}`);
        console.log(`✅ ${finalName}`);
      } catch (err) {
        console.log(`❌ ${err.message}`);
        newImages.push(url); // tetap pakai URL lama jika gagal
        failed++;
      }
    }

    product.images = newImages;
    await product.save();
    updated++;
  }

  console.log(`\n════════════════════════════════`);
  console.log(`Selesai: ${updated} produk diproses`);
  console.log(`Gagal download: ${failed} gambar`);
  console.log(`MinIO URL: http://localhost:9000/${BUCKET}/`);

  await mongoose.disconnect();
}

run().catch(console.error);

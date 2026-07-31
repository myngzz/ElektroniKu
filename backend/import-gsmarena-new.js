/**
 * Import HP terbaru (gsmarena-new-products.json) + unduh foto asli dari CDN.
 * Usage (dalam container backend): node import-gsmarena-new.js
 */
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Minio = require('minio');
const Category = require('./models/Category');
const Product = require('./models/Product');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});
const BUCKET = process.env.MINIO_BUCKET || 'products';
const PUBLIC_MINIO_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36';
const DELAY_MS = 250;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80); }

async function download(url, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
      if (res.status === 429) { await sleep(5000); continue; }
      if (!res.ok) return null;
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      return buf.length > 500 ? { buf, type } : null;
    } catch { await sleep(1000); }
  }
  return null;
}

async function run() {
  try {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/gsmarena-new-products.json`, 'utf8'));
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log(`✅ MongoDB terhubung. ${data.length} HP baru di dataset.`);

    const cat = await Category.findOne({ slug: 'smartphone' });
    if (!cat) throw new Error("Kategori 'smartphone' tidak ditemukan");

    const existing = new Set((await Product.find({}, 'name').lean()).map((p) => p.name.toLowerCase()));
    const fresh = data.filter((d) => !existing.has(d.name.toLowerCase()));
    console.log(`🆕 ${fresh.length} HP baru (${data.length - fresh.length} sudah ada, dilewati).`);

    let created = 0, noImg = 0;
    for (const d of fresh) {
      // Fallback: sebagian slug bigpic tidak memakai sufiks -5g/-global
      const candidates = [d.image];
      for (const suffix of ['-5g-global.jpg', '-global.jpg', '-5g.jpg']) {
        if (d.image.includes(suffix)) candidates.push(d.image.replace(suffix, '.jpg'));
      }
      let img = null;
      for (const url of candidates) {
        img = await download(url);
        if (img) break;
      }
      if (!img) { noImg++; await sleep(DELAY_MS); continue; }

      const objName = `new-${slugify(d.name)}.jpg`;
      await minioClient.putObject(BUCKET, objName, img.buf, img.buf.length, { 'Content-Type': img.type });

      await Product.create({
        name: d.name, brand: d.brand, category: cat._id,
        price: d.price, stock: Math.floor(Math.random() * 80) + 5,
        images: [`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`],
        description: d.description, specifications: d.specs,
        isFeatured: d.year >= 2025 && Math.random() < 0.15,
        tags: ['smartphone', 'gsmarena', 'terbaru', d.brand.toLowerCase(), `tahun-${d.year}`],
        isActive: true,
        metaTitle: `${d.name} - Harga & Spesifikasi`,
        metaDescription: d.description.slice(0, 160),
      });
      created++;
      process.stdout.write(`\r📱 ${created}/${fresh.length} HP terbaru diimport (${noImg} gambar gagal)...`);
      await sleep(DELAY_MS);
    }

    const total = await Product.countDocuments();
    console.log(`\n✅ Selesai! ${created} HP terbaru diimport, ${noImg} dilewati (gambar gagal). Total: ${total} produk.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

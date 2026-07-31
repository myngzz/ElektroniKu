/**
 * Import Smart TV asli dari dataset Amazon 2023 (amazon-tvs.json)
 * + unduh foto asli dari CDN Amazon ke MinIO.
 * Usage (dalam container backend): node import-amazon-tvs.js
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
const PUBLIC_MINIO_URL = process.env.MINIO_PUBLIC_URL || ''; // kosong = URL relatif via proxy nginx
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36';
const DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 500 ? { buf, type } : null;
  } catch { return null; }
}

async function run() {
  try {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/amazon-tvs.json`, 'utf8'));
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log(`✅ MongoDB terhubung. ${data.length} TV di dataset.`);

    const cat = await Category.findOne({ slug: 'smart-tv' });
    if (!cat) throw new Error("Kategori 'smart-tv' tidak ditemukan");

    const existing = new Set((await Product.find({}, 'name').lean()).map((p) => p.name.toLowerCase()));
    const fresh = data.filter((d) => !existing.has(d.name.toLowerCase()));
    console.log(`🆕 ${fresh.length} TV baru (${data.length - fresh.length} sudah ada, dilewati).`);

    let created = 0, noImg = 0;
    for (const d of fresh) {
      const urls = [];
      for (let i = 0; i < Math.min(d.images.length, 3); i++) {
        const img = await download(d.images[i]);
        if (img) {
          const ext = img.type.includes('png') ? 'png' : 'jpg';
          const objName = `tv-${d.asin}-${i}.${ext}`;
          await minioClient.putObject(BUCKET, objName, img.buf, img.buf.length, { 'Content-Type': img.type });
          urls.push(`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`);
        }
      }
      if (!urls.length) { noImg++; await sleep(DELAY_MS); continue; }

      await Product.create({
        name: d.name, brand: d.brand, category: cat._id,
        price: d.price, stock: Math.floor(Math.random() * 40) + 3,
        images: urls,
        description: d.description, specifications: d.specs,
        tags: d.tags, isActive: true,
        isFeatured: d.rating_count > 10000 && Math.random() < 0.3,
        avgRating: d.rating || 0, reviewCount: d.rating_count || 0,
        metaTitle: `${d.name.slice(0, 140)} - Harga & Spesifikasi`,
        metaDescription: d.description.slice(0, 160),
      });
      created++;
      if (created % 10 === 0) process.stdout.write(`\r📺 ${created}/${fresh.length} diimport (${noImg} gambar gagal)...`);
      await sleep(DELAY_MS);
    }

    const total = await Product.countDocuments();
    console.log(`\n✅ Selesai! ${created} TV diimport, ${noImg} dilewati (gambar gagal). Total: ${total} produk.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

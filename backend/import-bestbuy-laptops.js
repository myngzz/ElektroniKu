/**
 * Import laptop asli dari dataset Best Buy (bestbuy-laptops.json) + unduh foto asli.
 * URL gambar mati (pola /pac/) dicoba ulang lewat CDN pisces berbasis SKU.
 * Usage (dalam container backend): node import-bestbuy-laptops.js
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

function candidateUrls(d) {
  const sku = String(d.sku);
  return [
    d.image,
    `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${sku.slice(0, 4)}/${sku}_sa.jpg`,
  ];
}

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
    const data = JSON.parse(fs.readFileSync(`${__dirname}/bestbuy-laptops.json`, 'utf8'));
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log(`✅ MongoDB terhubung. ${data.length} laptop di dataset.`);

    const cat = await Category.findOne({ slug: 'laptop' });
    if (!cat) throw new Error("Kategori 'laptop' tidak ditemukan");

    const existing = new Set((await Product.find({}, 'name').lean()).map((p) => p.name.toLowerCase()));
    const fresh = data.filter((d) => !existing.has(d.name.toLowerCase()));
    console.log(`🆕 ${fresh.length} laptop baru (${data.length - fresh.length} dilewati).`);

    let created = 0, noImg = 0;
    for (const d of fresh) {
      let img = null;
      for (const url of candidateUrls(d)) {
        img = await download(url);
        if (img) break;
      }
      if (!img) { noImg++; await sleep(DELAY_MS); continue; }

      const ext = img.type.includes('png') ? 'png' : 'jpg';
      const objName = `bb-${d.sku}-${slugify(d.brand)}.${ext}`;
      await minioClient.putObject(BUCKET, objName, img.buf, img.buf.length, { 'Content-Type': img.type });

      await Product.create({
        name: d.name, brand: d.brand, category: cat._id,
        price: d.price, stock: Math.floor(Math.random() * 60) + 3,
        images: [`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`],
        description: d.description, specifications: d.specs,
        tags: d.tags, isActive: true,
        metaTitle: `${d.name.slice(0, 140)} - Harga & Spesifikasi`,
        metaDescription: d.description.slice(0, 160),
      });
      created++;
      process.stdout.write(`\r💻 ${created}/${fresh.length} laptop diimport (${noImg} tanpa gambar valid, dilewati)...`);
      await sleep(DELAY_MS);
    }

    const total = await Product.countDocuments();
    console.log(`\n✅ Selesai! ${created} laptop asli diimport, ${noImg} dilewati (gambar mati). Total: ${total} produk.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

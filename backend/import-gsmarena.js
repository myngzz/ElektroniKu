/**
 * Import produk dari dataset GSMArena (gsmarena-products.json) ke MongoDB.
 * Usage (dalam container backend): node import-gsmarena.js
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

const BRAND_THEME = {
  samsung: ['#1428A0', '#0070C0'], apple: ['#1c1c1e', '#3a3a3c'],
  xiaomi: ['#FF6900', '#E30000'], oppo: ['#1A1A2E', '#16213E'],
  vivo: ['#415FFF', '#0B21A8'], realme: ['#FFD700', '#FF8C00'],
  huawei: ['#CF0A2C', '#8A0016'], honor: ['#00B3FF', '#0066CC'],
  motorola: ['#0076CE', '#004A8F'], infinix: ['#C10707', '#8A0000'],
  tecno: ['#3B82F6', '#1D4ED8'], nokia: ['#005AFF', '#003DB3'],
  lg: ['#A50034', '#6B0022'], sony: ['#000000', '#333333'],
  oneplus: ['#F5010C', '#A30000'], asus: ['#00539C', '#003060'],
  zte: ['#004891', '#00285A'], lenovo: ['#E2231A', '#4B4B4B'],
  default: ['#334155', '#0F172A'],
};

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function makeSVG({ bg1, bg2, brand, label }) {
  const short = label.length > 28 ? label.slice(0, 28) + '…' : label;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect x="60" y="60" width="680" height="480" fill="rgba(255,255,255,0.08)" rx="24"/>
  <text x="400" y="240" font-size="130" text-anchor="middle" dominant-baseline="middle">📱</text>
  <text x="400" y="355" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">${esc(brand.toUpperCase())}</text>
  <text x="400" y="400" font-family="system-ui,sans-serif" font-size="22" font-weight="500" fill="white" text-anchor="middle">${esc(short)}</text>
</svg>`);
}

async function run() {
  try {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/gsmarena-products.json`, 'utf8'));
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log(`✅ MongoDB terhubung. ${data.length} produk di dataset.`);

    const cat = await Category.findOne({ slug: 'smartphone' });
    if (!cat) throw new Error("Kategori 'smartphone' tidak ditemukan");

    const existing = new Set((await Product.find({}, 'name').lean()).map((p) => p.name.toLowerCase()));
    const fresh = data.filter((d) => !existing.has(d.name.toLowerCase()));
    console.log(`🆕 ${fresh.length} produk baru (${data.length - fresh.length} sudah ada, dilewati).`);

    const BATCH = 50;
    let created = 0;
    for (let i = 0; i < fresh.length; i += BATCH) {
      const batch = fresh.slice(i, i + BATCH);
      const docs = await Promise.all(
        batch.map(async (d) => {
          const theme = BRAND_THEME[d.brand.toLowerCase()] || BRAND_THEME.default;
          const objName = `gsm-${slugify(d.name)}-1.svg`;
          const buf = makeSVG({ bg1: theme[0], bg2: theme[1], brand: d.brand, label: d.name });
          await minioClient.putObject(BUCKET, objName, buf, buf.length, { 'Content-Type': 'image/svg+xml' });
          return {
            name: d.name, brand: d.brand, category: cat._id,
            price: d.price, stock: Math.floor(Math.random() * 80) + 5,
            images: [`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`],
            description: d.description, specifications: d.specs,
            tags: ['smartphone', 'gsmarena', d.brand.toLowerCase(), `tahun-${d.year}`],
            isActive: true,
            metaTitle: `${d.name} - Harga & Spesifikasi`,
            metaDescription: d.description.slice(0, 160),
          };
        })
      );
      await Product.insertMany(docs, { ordered: false });
      created += docs.length;
      process.stdout.write(`\r🚀 ${created}/${fresh.length} produk diimport...`);
    }

    const total = await Product.countDocuments();
    console.log(`\n✅ Selesai! ${created} produk GSMArena diimport. Total: ${total} produk di DB`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

/**
 * Ganti gambar SVG generate dengan foto produk asli dari CDN GSMArena.
 * Unduh dengan rate limit sopan, simpan ke MinIO, update field images produk.
 * Usage (dalam container backend): node fetch-real-images.js
 */
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Minio = require('minio');
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
const DELAY_MS = 250; // rate limit sopan antar unduhan

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

async function download(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
      if (res.status === 429) { await sleep(5000); continue; }
      if (!res.ok) return null;
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) return null;
      return { buf: Buffer.from(await res.arrayBuffer()), type };
    } catch { await sleep(1000); }
  }
  return null;
}

async function run() {
  try {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/gsmarena-products.json`, 'utf8'));
    const imageByName = new Map(
      data.filter((d) => d.image).map((d) => [d.name.toLowerCase(), d.image])
    );

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log(`✅ MongoDB terhubung. ${imageByName.size} URL gambar tersedia di dataset.`);

    // Produk GSMArena yang masih pakai gambar SVG generate
    const targets = await Product.find({
      tags: 'gsmarena',
      images: { $elemMatch: { $regex: '\\.svg$' } },
    }, 'name images').lean();
    console.log(`🎯 ${targets.length} produk perlu diganti gambarnya.`);

    let ok = 0, miss = 0, fail = 0;
    for (const p of targets) {
      const url = imageByName.get(p.name.toLowerCase());
      if (!url) { miss++; continue; }

      const img = await download(url);
      if (!img) { fail++; process.stdout.write(`\n⚠️  Gagal unduh: ${p.name}`); await sleep(DELAY_MS); continue; }

      const ext = img.type.includes('png') ? 'png' : 'jpg';
      const objName = `real-${slugify(p.name)}.${ext}`;
      await minioClient.putObject(BUCKET, objName, img.buf, img.buf.length, { 'Content-Type': img.type });
      await Product.updateOne(
        { _id: p._id },
        { $set: { images: [`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`] } }
      );
      ok++;
      process.stdout.write(`\r🖼️  ${ok}/${targets.length} gambar asli terpasang...`);
      await sleep(DELAY_MS);
    }

    console.log(`\n✅ Selesai! ${ok} diganti foto asli, ${miss} tanpa URL, ${fail} gagal unduh.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

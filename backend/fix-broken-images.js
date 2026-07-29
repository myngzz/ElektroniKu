/**
 * Fix URL gambar yang 404 di MongoDB, ganti dengan URL Unsplash yang valid
 * Usage: node fix-broken-images.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku?authSource=admin';

// Map: nama produk (substring) → URL gambar pengganti
// Semua URL sudah diverifikasi 200 OK
const FIXES = {
  // Gaming laptop - ASUS ROG G14 & Zephyrus series
  'ASUS ROG Zephyrus G14': [
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85',
  ],
  // MacBook (gambar kedua)
  'MacBook Air M3': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85',
  ],
  // MacBook Air 15
  'Apple MacBook Air 15': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85',
  ],
  // Dell XPS
  'Dell XPS 15': [
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=85',
  ],
  // HP Spectre
  'HP Spectre x360': [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=85',
  ],
  // TV Samsung QLED
  'Samsung 65" QLED': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
  ],
  'Samsung 65" Neo QLED': [
    'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=600&q=85',
  ],
  // LG OLED
  'LG 65" OLED': [
    'https://images.unsplash.com/photo-1593642633279-1796119d5482?w=600&q=85',
  ],
  // Sony BRAVIA
  'Sony 65" BRAVIA': [
    'https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&q=85',
  ],
  // TCL
  'TCL 65"': [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=85',
  ],
  // Xiaomi 14 Ultra
  'Xiaomi 14 Ultra': [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=85',
  ],
  // ASUS TUF
  'ASUS TUF Gaming F15': [
    'https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=600&q=85',
  ],
  // MSI
  'MSI Thin 15': [
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=85',
  ],
  // HP Pavilion Gaming
  'HP Pavilion Gaming': [
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85',
  ],
  // Gigabyte Aorus
  'Gigabyte Aorus': [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=85',
  ],
};

// URL-URL Unsplash yang diketahui rusak (404)
const BROKEN_PATTERNS = [
  'photo-1593642632632-d927dfcdbc06',
  'photo-1611186871525-9514ef6ab8d4',
  'photo-1593359677879-a4bb92f4834c',
  'photo-1602080858428-57798f762348',
  'photo-1527443224154-c4a573d5e985',
  'fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg',
];

function isBroken(url) {
  return BROKEN_PATTERNS.some(p => url.includes(p));
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  const products = await Product.find({ isActive: true });
  let fixedCount = 0;

  for (const product of products) {
    if (!product.images?.length) continue;

    // Cek apakah ada URL yang rusak
    const hasBroken = product.images.some(isBroken);
    if (!hasBroken) continue;

    // Cari fix mapping berdasarkan nama produk
    const matchKey = Object.keys(FIXES).find(k => product.name.includes(k));
    if (!matchKey) {
      console.log(`⚠️  Tidak ada fix untuk: ${product.name} (${product.images.filter(isBroken).join(', ')})`);
      continue;
    }

    const replacements = FIXES[matchKey];
    const newImages = [];
    let repIdx = 0;

    for (const url of product.images) {
      if (isBroken(url)) {
        const replacement = replacements[repIdx] || replacements[replacements.length - 1];
        newImages.push(replacement);
        console.log(`  🔧 ${product.name}: ${url.slice(-30)} → ${replacement.slice(-30)}`);
        repIdx++;
      } else {
        newImages.push(url);
      }
    }

    product.images = newImages;
    await product.save();
    fixedCount++;
  }

  console.log(`\n════════════════════════════════`);
  console.log(`Selesai: ${fixedCount} produk URL-nya diperbaiki`);
  console.log('Jalankan "node migrate-images-to-minio.js" untuk upload ke MinIO\n');

  await mongoose.disconnect();
}

run().catch(console.error);

const mongoose = require('mongoose');

const MINIO_BASE = process.env.MINIO_INTERNAL_URL 
  ? process.env.MINIO_INTERNAL_URL + '/products/'
  : 'http://minio:9000/products/';

// Map: product name → existing MinIO file to use
const fixes = [
  { name: 'POCO F6 Pro',                 file: 'poco-x6-pro-5g-1.jpg' },
  { name: 'Samsung Galaxy S25+',         file: 'samsung-galaxy-s25-ultra-1.jpg' },
  { name: 'Samsung Galaxy S24+',         file: 'samsung-galaxy-s24-fe-1.jpg' },
  { name: 'Vivo Y200 5G',               file: 'vivo-v40-5g-1.jpg' },
  { name: 'Huawei Pura 70 Pro',         file: 'xiaomi-14-ultra-1.jpg' },
  { name: 'Huawei Nova 12 SE',          file: 'xiaomi-redmi-note-13-pro-1.jpg' },
  { name: 'Huawei MatePad 11.5" PaperMatte', file: 'huawei-matebook-d16-2024-1.jpg' },
  { name: 'Realme C67 5G',              file: 'realme-12-pro-5g-1.jpg' },
  { name: 'OnePlus Nord CE4',           file: 'oneplus-13-1.jpg' },
  { name: 'Google Pixel 9',             file: 'google-pixel-9-pro-1.jpg' },
  { name: 'Google Pixel 9 Pro XL',      file: 'google-pixel-9-pro-1.jpg' },
  { name: 'Honor 200 Pro',              file: 'xiaomi-14t-pro-1.jpg' },
  { name: 'Infinix Note 40 Pro 5G',     file: 'infinix-note-40-pro-5g-1.jpg' },
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  const Product = require('/app/models/Product');
  let updated = 0;
  for (const fix of fixes) {
    const newUrl = MINIO_BASE + fix.file;
    const result = await Product.updateOne(
      { name: fix.name },
      { $set: { images: [newUrl] } }
    );
    if (result.modifiedCount > 0) {
      console.log('FIXED:', fix.name, '->', fix.file);
      updated++;
    } else {
      console.log('NOT FOUND:', fix.name);
    }
  }
  console.log('\nTotal diperbarui:', updated, '/', fixes.length);
  process.exit(0);
});

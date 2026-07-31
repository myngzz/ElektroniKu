/**
 * Backfill reviewCount produk Amazon dari rating_count dataset.
 * Usage (dalam container backend): node backfill-review-counts.js
 */
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
  let updated = 0;
  for (const file of ['amazon-headphones.json', 'amazon-cameras.json', 'amazon-tvs.json']) {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/${file}`, 'utf8'));
    const ops = data
      .filter((d) => d.rating_count > 0)
      .map((d) => ({
        updateOne: {
          filter: { name: d.name, reviewCount: 0 },
          update: { $set: { reviewCount: d.rating_count } },
        },
      }));
    const res = await Product.bulkWrite(ops, { ordered: false });
    updated += res.modifiedCount;
    console.log(`${file}: ${res.modifiedCount} produk diperbarui`);
  }
  console.log(`✅ Total ${updated} produk diisi reviewCount.`);
  await mongoose.connection.close();
}

run().catch((e) => { console.error('❌', e.message); process.exit(1); });

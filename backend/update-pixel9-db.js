const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin');
  const db = mongoose.connection.db;

  const updates = [
    {
      name: /^Google Pixel 9$/,
      images: ['http://minio:9000/products/google-pixel-9-1.jpg']
    },
    {
      name: /^Google Pixel 9 Pro$/,
      images: ['http://minio:9000/products/google-pixel-9-pro-1.jpg']
    },
    {
      name: /^Google Pixel 9 Pro XL$/,
      images: ['http://minio:9000/products/google-pixel-9-pro-xl-1.jpg']
    },
  ];

  for (const u of updates) {
    const res = await db.collection('products').updateOne({ name: u.name }, { $set: { images: u.images } });
    console.log(`${u.name} -> modified: ${res.modifiedCount}, images: ${u.images[0]}`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);

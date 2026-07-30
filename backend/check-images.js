const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  const Product = require('/app/models/Product');
  const prods = await Product.find({}, 'name images brand').lean();
  console.log('Total produk:', prods.length);
  let count = 0;
  for (const p of prods) {
    const hasImg = p.images && p.images.length > 0 && p.images.some(img => img && img !== '');
    if (!hasImg) {
      console.log('KOSONG:', p.brand, '|', p.name);
      count++;
    } else {
      console.log('ADA:', p.images[0].substring(0,40));
    }
  }
  console.log('Total kosong:', count);
  process.exit(0);
});

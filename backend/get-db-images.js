const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  const Product = require('/app/models/Product');
  const prods = await Product.find({}, 'name brand images').lean();
  for (const p of prods) {
    const img = p.images && p.images[0];
    const fn = img ? (img.split('/products/')[1] || img.split('/').pop()) : 'NONE';
    console.log(fn + '|||' + p.brand + '|||' + p.name);
  }
  process.exit(0);
});

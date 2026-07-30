const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  require('/app/models/Category');
  const Product = require('/app/models/Product');
  const prods = await Product.find({}, 'name brand category images').populate('category', 'name').lean();
  for (const p of prods) {
    const img = p.images && p.images[0];
    const fn = img ? (img.split('/products/')[1] || img.split('/').pop()) : 'NONE';
    console.log(JSON.stringify({ name: p.name, brand: p.brand, cat: p.category?.name, img: fn }));
  }
  process.exit(0);
});

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  const Product = require('/app/models/Product');
  const prods = await Product.find({}, 'name images brand').lean();
  for (const p of prods) {
    if (p.images && p.images[0]) {
      const filename = p.images[0].split('/products/')[1];
      if (filename) process.stdout.write(filename + '\n');
    }
  }
  process.exit(0);
});

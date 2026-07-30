const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/elektroniku?authSource=admin').then(async () => {
  const Product = require('/app/models/Product');
  const prods = await Product.find({}, 'name brand images').lean();
  
  // Get all MinIO files
  const minioFiles = new Set(fs.readdirSync('/data/products').filter(f => !f.startsWith('.')));
  
  const results = { broken: [], svg: [], ok: 0 };
  
  for (const p of prods) {
    const img = p.images && p.images[0];
    if (!img) { results.broken.push({ name: p.name, brand: p.brand, img: 'NONE' }); continue; }
    const filename = img.split('/products/')[1] || img.split('/').pop();
    if (!filename) { results.broken.push({ name: p.name, brand: p.brand, img }); continue; }
    if (filename.endsWith('.svg')) { results.svg.push({ name: p.name, brand: p.brand, filename }); continue; }
    if (!minioFiles.has(filename)) { results.broken.push({ name: p.name, brand: p.brand, img: filename }); continue; }
    results.ok++;
  }
  
  console.log('OK:', results.ok, '| Broken:', results.broken.length, '| SVG placeholder:', results.svg.length);
  if (results.broken.length) { console.log('\nBROKEN:'); results.broken.forEach(p => console.log(' ', p.brand, '|', p.name, '|', p.img)); }
  if (results.svg.length) { console.log('\nSVG:'); results.svg.forEach(p => console.log(' ', p.brand, '|', p.name, '|', p.filename)); }
  
  // Files in MinIO not referenced by any product
  const usedFiles = new Set(prods.map(p => p.images && p.images[0] && (p.images[0].split('/products/')[1] || p.images[0].split('/').pop())).filter(Boolean));
  const unused = [...minioFiles].filter(f => !usedFiles.has(f) && !f.endsWith('.svg'));
  console.log('\nFile MinIO tidak dipakai produk manapun:', unused.length);
  unused.slice(0,20).forEach(f => console.log(' ', f));
  
  process.exit(0);
});

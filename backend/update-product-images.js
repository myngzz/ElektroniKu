/**
 * Update product images to real product photos
 * Phones: GSMArena CDN | Laptops/Audio/Camera/TV: Unsplash curated photos
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku?authSource=admin';

// Real product image URLs mapped by product name substring
const IMAGE_MAP = [
  // ── Smartphones ─────────────────────────────────────────────────────────────
  { match: 'Samsung Galaxy Z Fold6',     urls: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg'] },
  { match: 'Samsung Galaxy Z Flip6',     urls: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip6.jpg'] },
  { match: 'Samsung Galaxy A55',         urls: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg'] },
  { match: 'Samsung Galaxy A35',         urls: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg'] },
  { match: 'Samsung Galaxy S25 Ultra',   urls: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=85', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=85'] },
  { match: 'Samsung Galaxy S24 Ultra',   urls: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=85'] },
  { match: 'Samsung Galaxy S24 FE',      urls: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85'] },
  { match: 'iPhone 16 Pro Max',          urls: ['https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg'] },
  { match: 'iPhone 15 Pro Max',          urls: ['https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg'] },
  { match: 'iPhone SE',                  urls: ['https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg'] },
  { match: 'Xiaomi 14T Pro',             urls: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t-pro.jpg'] },
  { match: 'Xiaomi 14 Ultra',            urls: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg'] },
  { match: 'Redmi Note 13 Pro',          urls: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg'] },
  { match: 'Redmi 12C',                  urls: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-12c.jpg'] },
  { match: 'POCO X6 Pro',               urls: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg'] },
  { match: 'POCO M6 Pro',               urls: ['https://fdn2.gsmarena.com/vv/bigpic/poco-m6-pro.jpg'] },
  { match: 'Realme GT 6',               urls: ['https://fdn2.gsmarena.com/vv/bigpic/realme-gt6.jpg'] },
  { match: 'OPPO Reno 12',              urls: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=85'] },
  { match: 'Oppo Find X8',              urls: ['https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x8-pro.jpg'] },
  { match: 'Vivo X200',                 urls: ['https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg'] },
  { match: 'Vivo V30',                  urls: ['https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg'] },
  { match: 'Google Pixel 9',            urls: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=85'] },
  { match: 'OnePlus 13',                urls: ['https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg'] },
  { match: 'Motorola Edge 50',          urls: ['https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg'] },
  { match: 'Nokia G60',                 urls: ['https://fdn2.gsmarena.com/vv/bigpic/nokia-g60-5g.jpg'] },
  { match: 'Infinix Note 40',           urls: ['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=85'] },
  { match: 'Tecno',                     urls: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85'] },

  // ── Laptops ──────────────────────────────────────────────────────────────────
  { match: 'MacBook Air M3',            urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85', 'https://images.unsplash.com/photo-1611186871525-9514ef6ab8d4?w=600&q=85'] },
  { match: 'MacBook Air 15',            urls: ['https://images.unsplash.com/photo-1611186871525-9514ef6ab8d4?w=600&q=85'] },
  { match: 'MacBook Pro',               urls: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=85'] },
  { match: 'ROG Zephyrus G16',          urls: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'] },
  { match: 'ROG Zephyrus G14',          urls: ['https://images.unsplash.com/photo-1593642632632-d927dfcdbc06?w=600&q=85'] },
  { match: 'TUF Gaming',               urls: ['https://images.unsplash.com/photo-1527443224154-c4a573d5e985?w=600&q=85'] },
  { match: 'Zenbook',                   urls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85'] },
  { match: 'Vivobook',                  urls: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=85'] },
  { match: 'Legion 5',                  urls: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'] },
  { match: 'IdeaPad',                   urls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85'] },
  { match: 'ThinkPad',                  urls: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=85'] },
  { match: 'MSI Thin',                  urls: ['https://images.unsplash.com/photo-1593642632632-d927dfcdbc06?w=600&q=85'] },
  { match: 'Dell XPS',                  urls: ['https://images.unsplash.com/photo-1602080858428-57798f762348?w=600&q=85'] },
  { match: 'Dell Inspiron',             urls: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=85'] },
  { match: 'HP Pavilion Gaming',        urls: ['https://images.unsplash.com/photo-1527443224154-c4a573d5e985?w=600&q=85'] },
  { match: 'HP EliteBook',              urls: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=85'] },
  { match: 'HP Spectre',                urls: ['https://images.unsplash.com/photo-1611186871525-9514ef6ab8d4?w=600&q=85'] },
  { match: 'Surface Laptop',            urls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85'] },
  { match: 'Razer Blade',               urls: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'] },
  { match: 'Aorus',                     urls: ['https://images.unsplash.com/photo-1593642632632-d927dfcdbc06?w=600&q=85'] },
  { match: 'Galaxy Book',               urls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85'] },
  { match: 'Acer Nitro',                urls: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'] },

  // ── Headphones ───────────────────────────────────────────────────────────────
  { match: 'Sony WH-1000XM6',           urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=85'] },
  { match: 'Sony WH-1000XM5',           urls: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=85'] },
  { match: 'Bose QuietComfort',         urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85'] },
  { match: 'AirPods Pro',               urls: ['https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=85'] },
  { match: 'JBL Live Pro',              urls: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=85'] },
  { match: 'Sennheiser Momentum',       urls: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=85'] },

  // ── Cameras ──────────────────────────────────────────────────────────────────
  { match: 'Sony Alpha A7',             urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=85', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=85'] },
  { match: 'Sony ZV-E10',               urls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=85'] },
  { match: 'Canon EOS',                 urls: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=85'] },
  { match: 'Fujifilm',                  urls: ['https://images.unsplash.com/photo-1480365501497-199581be0e66?w=600&q=85'] },
  { match: 'GoPro',                     urls: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&q=85'] },

  // ── Smart TVs ────────────────────────────────────────────────────────────────
  { match: 'Samsung',                   urls: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=85'] },
  { match: 'LG',                        urls: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=85'] },
  { match: 'Sony BRAVIA',               urls: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=85'] },
  { match: 'TCL',                       urls: ['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=85'] },
];

function findImages(productName) {
  for (const entry of IMAGE_MAP) {
    if (productName.toLowerCase().includes(entry.match.toLowerCase())) {
      return entry.urls;
    }
  }
  return null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const images = findImages(product.name);
    if (images) {
      product.images = images;
      await product.save();
      console.log(`✅ ${product.name}`);
      updated++;
    } else {
      console.log(`⚠️  No match: ${product.name}`);
    }
  }

  console.log(`\nDone: ${updated}/${products.length} produk diupdate`);
  await mongoose.disconnect();
}

run().catch(console.error);

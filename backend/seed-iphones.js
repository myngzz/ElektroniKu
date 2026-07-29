/**
 * Seed semua model iPhone: 16/15/14/13/12 series + SE
 * Usage: node seed-iphones.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku?authSource=admin';

// GSMArena CDN — slug yang sudah terverifikasi 200
const GSMARENA = (slug) => `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`;
const UNSPLASH  = (id)   => `https://images.unsplash.com/photo-${id}?w=600&q=85`;

const IPHONES = [
  // ── iPhone 16 series ────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 16 Pro',
    brand: 'Apple',
    price: 18999000, originalPrice: 20499000,
    images: [GSMARENA('apple-iphone-16-pro')],
    isFeatured: true, stock: 50,
    specifications: {
      os: 'iOS 18', cpu: 'Apple A18 Pro (3nm)', ram: '8', storage: '128',
      display: '6.3" Super Retina XDR OLED 2622x1206 120Hz ProMotion',
      camera: '48MP Fusion + 48MP UltraWide + 12MP 5x Telephoto', battery: '3582',
      weight: '199', charging: '30W MagSafe, 25W MagSafe, 15W Qi2',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C 3.0',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 16 Pro hadir dengan chip A18 Pro 3nm, kamera 48MP Fusion baru, Camera Control fisik, dan layar 6.3" Super Retina XDR 120Hz ProMotion. Mendukung Apple Intelligence.',
    tags: ['apple', 'iphone', 'iphone16', 'pro', '5g', 'ios18'],
  },
  {
    name: 'Apple iPhone 16 Plus',
    brand: 'Apple',
    price: 14999000, originalPrice: 16499000,
    images: [GSMARENA('apple-iphone-16-plus')],
    isFeatured: false, stock: 45,
    specifications: {
      os: 'iOS 18', cpu: 'Apple A18 (3nm)', ram: '8', storage: '128',
      display: '6.7" Super Retina XDR OLED 2796x1290 60Hz',
      camera: '48MP Fusion + 12MP UltraWide', battery: '4674',
      weight: '203', charging: '25W MagSafe, 15W Qi2',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 16 Plus menawarkan layar besar 6.7" dengan baterai tahan lama 4674 mAh, chip A18, dan kamera 48MP. Pilihan terbaik untuk yang butuh layar lega dan baterai panjang.',
    tags: ['apple', 'iphone', 'iphone16', 'plus', '5g', 'ios18'],
  },
  {
    name: 'Apple iPhone 16',
    brand: 'Apple',
    price: 12999000, originalPrice: 14499000,
    images: [GSMARENA('apple-iphone-16')],
    isFeatured: false, stock: 60,
    specifications: {
      os: 'iOS 18', cpu: 'Apple A18 (3nm)', ram: '8', storage: '128',
      display: '6.1" Super Retina XDR OLED 2556x1179 60Hz',
      camera: '48MP Fusion + 12MP UltraWide', battery: '3561',
      weight: '170', charging: '25W MagSafe, 15W Qi2',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, USB-C',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 16 — entry point terbaru Apple dengan chip A18 3nm, Camera Control, Action Button, USB-C, dan kamera 48MP. Mendukung Apple Intelligence.',
    tags: ['apple', 'iphone', 'iphone16', '5g', 'ios18'],
  },

  // ── iPhone 15 series ────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 15 Pro',
    brand: 'Apple',
    price: 17499000, originalPrice: 19999000,
    images: [GSMARENA('apple-iphone-15-pro')],
    isFeatured: false, stock: 40,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A17 Pro (3nm)', ram: '8', storage: '128',
      display: '6.1" Super Retina XDR OLED 2556x1179 120Hz ProMotion',
      camera: '48MP main + 12MP UltraWide + 12MP 3x Telephoto', battery: '3274',
      weight: '187', charging: '27W MagSafe, USB-C',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C 3.0',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 15 Pro dengan chip A17 Pro 3nm pertama di dunia, titanium body, Action Button, USB-C 3.0, dan kamera 48MP dengan Tetrahedral Lens.',
    tags: ['apple', 'iphone', 'iphone15', 'pro', '5g', 'titanium'],
  },
  {
    name: 'Apple iPhone 15 Plus',
    brand: 'Apple',
    price: 13999000, originalPrice: 15999000,
    images: [UNSPLASH('1591337676887-a217a6970a8a')],
    isFeatured: false, stock: 35,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A16 Bionic (4nm)', ram: '6', storage: '128',
      display: '6.7" Super Retina XDR OLED 2796x1290 60Hz',
      camera: '48MP main + 12MP UltraWide', battery: '4383',
      weight: '201', charging: '20W MagSafe, USB-C',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, USB-C',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 15 Plus menghadirkan Dynamic Island, USB-C, kamera 48MP, dan baterai jumbo 4383 mAh dalam form factor 6.7" yang tipis.',
    tags: ['apple', 'iphone', 'iphone15', 'plus', '5g'],
  },
  {
    name: 'Apple iPhone 15',
    brand: 'Apple',
    price: 11999000, originalPrice: 13499000,
    images: [GSMARENA('apple-iphone-15')],
    isFeatured: false, stock: 55,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A16 Bionic (4nm)', ram: '6', storage: '128',
      display: '6.1" Super Retina XDR OLED 2556x1179 60Hz',
      camera: '48MP main + 12MP UltraWide', battery: '3349',
      weight: '171', charging: '20W MagSafe, USB-C',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, USB-C',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 15 dengan Dynamic Island, USB-C, kamera 48MP, dan chip A16 Bionic. Upgrade signifikan dengan desain yang lebih tipis dan ringan.',
    tags: ['apple', 'iphone', 'iphone15', '5g', 'usbc'],
  },

  // ── iPhone 14 series ────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 14 Pro Max',
    brand: 'Apple',
    price: 15999000, originalPrice: 19999000,
    images: [UNSPLASH('1591337676887-a217a6970a8a')],
    isFeatured: false, stock: 30,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A16 Bionic (4nm)', ram: '6', storage: '128',
      display: '6.7" Super Retina XDR OLED 2796x1290 120Hz ProMotion Always-On',
      camera: '48MP main + 12MP UltraWide + 12MP 3x Telephoto', battery: '4323',
      weight: '240', charging: '27W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 14 Pro Max hadir dengan Dynamic Island (pertama kali), Always-On Display, kamera 48MP pertama di iPhone, dan chip A16 Bionic.',
    tags: ['apple', 'iphone', 'iphone14', 'promax', '5g', 'dynamic-island'],
  },
  {
    name: 'Apple iPhone 14 Pro',
    brand: 'Apple',
    price: 13999000, originalPrice: 17999000,
    images: [GSMARENA('apple-iphone-14-pro')],
    isFeatured: false, stock: 35,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A16 Bionic (4nm)', ram: '6', storage: '128',
      display: '6.1" Super Retina XDR OLED 2556x1179 120Hz ProMotion Always-On',
      camera: '48MP main + 12MP UltraWide + 12MP 3x Telephoto', battery: '3200',
      weight: '206', charging: '27W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 14 Pro dengan Dynamic Island, Always-On Display 6.1", kamera 48MP revolusioner, dan chip A16 Bionic yang kencang.',
    tags: ['apple', 'iphone', 'iphone14', 'pro', '5g'],
  },
  {
    name: 'Apple iPhone 14 Plus',
    brand: 'Apple',
    price: 11499000, originalPrice: 14999000,
    images: [GSMARENA('apple-iphone-14-plus')],
    isFeatured: false, stock: 40,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A15 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.7" Super Retina XDR OLED 2778x1284 60Hz',
      camera: '12MP main + 12MP UltraWide', battery: '4325',
      weight: '203', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 14 Plus dengan layar besar 6.7", baterai tahan lama 4325 mAh, chip A15 Bionic, dan Emergency SOS via Satellite.',
    tags: ['apple', 'iphone', 'iphone14', 'plus', '5g'],
  },
  {
    name: 'Apple iPhone 14',
    brand: 'Apple',
    price: 10499000, originalPrice: 13499000,
    images: [GSMARENA('apple-iphone-14')],
    isFeatured: false, stock: 45,
    specifications: {
      os: 'iOS 17', cpu: 'Apple A15 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.1" Super Retina XDR OLED 2532x1170 60Hz',
      camera: '12MP main + 12MP UltraWide', battery: '3279',
      weight: '172', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 14 dengan chip A15 Bionic, mode aksi kamera, deteksi kecelakaan, dan Emergency SOS via Satellite. Andalan Apple yang masih relevan.',
    tags: ['apple', 'iphone', 'iphone14', '5g'],
  },

  // ── iPhone 13 series ────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 13 Pro Max',
    brand: 'Apple',
    price: 12999000, originalPrice: 17999000,
    images: [GSMARENA('apple-iphone-13-pro-max')],
    isFeatured: false, stock: 25,
    specifications: {
      os: 'iOS 16', cpu: 'Apple A15 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.7" Super Retina XDR OLED 2778x1284 120Hz ProMotion',
      camera: '12MP main + 12MP UltraWide + 12MP 3x Telephoto', battery: '4352',
      weight: '238', charging: '27W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 13 Pro Max — layar ProMotion 120Hz pertama di iPhone, kamera macro, baterai terbesar, dan ProRes video.',
    tags: ['apple', 'iphone', 'iphone13', 'promax', '5g'],
  },
  {
    name: 'Apple iPhone 13 Pro',
    brand: 'Apple',
    price: 10999000, originalPrice: 15999000,
    images: [GSMARENA('apple-iphone-13-pro')],
    isFeatured: false, stock: 30,
    specifications: {
      os: 'iOS 16', cpu: 'Apple A15 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.1" Super Retina XDR OLED 2532x1170 120Hz ProMotion',
      camera: '12MP main + 12MP UltraWide + 12MP 3x Telephoto', battery: '3095',
      weight: '204', charging: '27W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 13 Pro dengan ProMotion 120Hz, kamera telephoto 3x, macro photography, ProRes video 4K, dan chip A15 Bionic.',
    tags: ['apple', 'iphone', 'iphone13', 'pro', '5g'],
  },
  {
    name: 'Apple iPhone 13',
    brand: 'Apple',
    price: 8999000, originalPrice: 12999000,
    images: [GSMARENA('apple-iphone-13')],
    isFeatured: false, stock: 40,
    specifications: {
      os: 'iOS 16', cpu: 'Apple A15 Bionic (5nm)', ram: '4', storage: '128',
      display: '6.1" Super Retina XDR OLED 2532x1170 60Hz',
      camera: '12MP main + 12MP UltraWide', battery: '3227',
      weight: '174', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 13 dengan notch lebih kecil, chip A15 Bionic, Cinematic Mode video, dan baterai 18% lebih besar dari iPhone 12.',
    tags: ['apple', 'iphone', 'iphone13', '5g'],
  },
  {
    name: 'Apple iPhone 13 mini',
    brand: 'Apple',
    price: 7499000, originalPrice: 10999000,
    images: [GSMARENA('apple-iphone-13-mini')],
    isFeatured: false, stock: 20,
    specifications: {
      os: 'iOS 16', cpu: 'Apple A15 Bionic (5nm)', ram: '4', storage: '128',
      display: '5.4" Super Retina XDR OLED 2340x1080 60Hz',
      camera: '12MP main + 12MP UltraWide', battery: '2438',
      weight: '141', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 13 mini — smartphone 5G terkecil dengan chip A15 Bionic. Pilihan sempurna untuk pengguna yang lebih suka one-hand use.',
    tags: ['apple', 'iphone', 'iphone13', 'mini', '5g', 'compact'],
  },

  // ── iPhone 12 series ────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone 12 Pro Max',
    brand: 'Apple',
    price: 9999000, originalPrice: 15999000,
    images: [GSMARENA('apple-iphone-12-pro-max')],
    isFeatured: false, stock: 20,
    specifications: {
      os: 'iOS 15', cpu: 'Apple A14 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.7" Super Retina XDR OLED 2778x1284 60Hz',
      camera: '12MP main + 12MP UltraWide + 12MP 2.5x Telephoto', battery: '3687',
      weight: '228', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 12 Pro Max dengan OLED 6.7", sensor-shift OIS pertama di iPhone, LiDAR Scanner, dan 5G. Flagship Apple tahun 2020.',
    tags: ['apple', 'iphone', 'iphone12', 'promax', '5g', 'magsafe'],
  },
  {
    name: 'Apple iPhone 12 Pro',
    brand: 'Apple',
    price: 8499000, originalPrice: 13999000,
    images: [GSMARENA('apple-iphone-12-pro')],
    isFeatured: false, stock: 25,
    specifications: {
      os: 'iOS 15', cpu: 'Apple A14 Bionic (5nm)', ram: '6', storage: '128',
      display: '6.1" Super Retina XDR OLED 2532x1170 60Hz',
      camera: '12MP main + 12MP UltraWide + 12MP 2x Telephoto', battery: '2815',
      weight: '189', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 12 Pro dengan LiDAR Scanner, stainless steel body, kamera triple-lens, dan 5G. Performa flagship yang masih kencang.',
    tags: ['apple', 'iphone', 'iphone12', 'pro', '5g', 'lidar'],
  },
  {
    name: 'Apple iPhone 12',
    brand: 'Apple',
    price: 7499000, originalPrice: 10999000,
    images: [GSMARENA('apple-iphone-12')],
    isFeatured: false, stock: 30,
    specifications: {
      os: 'iOS 15', cpu: 'Apple A14 Bionic (5nm)', ram: '4', storage: '64',
      display: '6.1" Super Retina XDR OLED 2532x1170 60Hz',
      camera: '12MP main + 12MP UltraWide', battery: '2815',
      weight: '164', charging: '20W MagSafe, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone 12 — pertama dengan desain flat edge baru, OLED display, chip A14 Bionic 5nm, dan MagSafe. Harga sudah sangat terjangkau.',
    tags: ['apple', 'iphone', 'iphone12', '5g', 'magsafe', 'oled'],
  },

  // ── iPhone SE ───────────────────────────────────────────────────────────────
  {
    name: 'Apple iPhone SE (2022)',
    brand: 'Apple',
    price: 6499000, originalPrice: 7999000,
    images: [GSMARENA('apple-iphone-se-2022')],
    isFeatured: false, stock: 35,
    specifications: {
      os: 'iOS 15', cpu: 'Apple A15 Bionic (5nm)', ram: '4', storage: '64',
      display: '4.7" Retina HD IPS 1334x750 60Hz',
      camera: '12MP main (single)', battery: '2018',
      weight: '144', charging: '20W, Lightning',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC, Lightning',
      network: '5G', sim: 'Nano-SIM + eSIM',
    },
    description: 'iPhone SE 2022 (gen 3) — iPhone 5G paling terjangkau dari Apple. Chip A15 Bionic dalam body 4.7" klasik dengan Touch ID. Pilihan entry-level Apple.',
    tags: ['apple', 'iphone', 'se', 'iphonese', '5g', 'compact', 'budget'],
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  const smartphoneCat = await Category.findOne({ slug: 'smartphone' });
  if (!smartphoneCat) throw new Error('Kategori smartphone tidak ditemukan!');

  let added = 0, skipped = 0;

  for (const data of IPHONES) {
    const exists = await Product.findOne({ name: data.name });
    if (exists) {
      console.log(`⏭  Skip (sudah ada): ${data.name}`);
      skipped++;
      continue;
    }

    await Product.create({
      ...data,
      category: smartphoneCat._id,
      isActive: true,
      metaTitle: `${data.name} - Harga & Spesifikasi`,
      metaDescription: data.description.slice(0, 160),
    });

    console.log(`✅ ${data.name} — Rp ${data.price.toLocaleString('id')}`);
    added++;
  }

  console.log(`\nSelesai: ${added} ditambahkan, ${skipped} di-skip`);
  await mongoose.disconnect();
}

run().catch(console.error);

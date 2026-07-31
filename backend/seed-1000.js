/**
 * Seed massal: generate 1000 produk sintetis di semua kategori.
 * Usage (dalam container backend): node seed-1000.js [jumlah]
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Minio = require('minio');
const Category = require('./models/Category');
const Product = require('./models/Product');

const TARGET = parseInt(process.argv[2], 10) || 1000;

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});
const BUCKET = process.env.MINIO_BUCKET || 'products';
// URL publik yang dipakai browser (konsisten dengan produk yang sudah ada)
const PUBLIC_MINIO_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

// ─── Data pools per kategori ────────────────────────────────
const CATALOG = {
  smartphone: {
    icon: '📱',
    brands: {
      Samsung: { series: ['Galaxy A', 'Galaxy M', 'Galaxy F', 'Galaxy S', 'Galaxy Note'], bg: ['#1428A0', '#0070C0'] },
      Xiaomi: { series: ['Redmi Note', 'Redmi', 'Mi', 'Poco X', 'Poco F'], bg: ['#FF6900', '#E30000'] },
      Oppo: { series: ['Reno', 'A', 'Find X', 'F'], bg: ['#1A1A2E', '#16213E'] },
      Vivo: { series: ['V', 'Y', 'X', 'T'], bg: ['#415FFF', '#0B21A8'] },
      Realme: { series: ['Narzo', 'C', 'GT Neo', 'Number'], bg: ['#FFD700', '#FF8C00'] },
      Infinix: { series: ['Note', 'Hot', 'Zero', 'Smart'], bg: ['#C10707', '#8A0000'] },
      Tecno: { series: ['Spark', 'Camon', 'Pova', 'Phantom'], bg: ['#3B82F6', '#1D4ED8'] },
      Motorola: { series: ['Moto G', 'Moto E', 'Edge'], bg: ['#0076CE', '#004A8F'] },
      Nokia: { series: ['G', 'X', 'C'], bg: ['#005AFF', '#003DB3'] },
      Honor: { series: ['Magic', 'X', 'Play'], bg: ['#00B3FF', '#0066CC'] },
    },
    variants: ['', 'Pro', 'Pro+', 'Lite', '5G', 'Pro 5G', 'Max', 'Ultra', 'SE', 'Prime'],
    price: [900000, 18000000],
    specs: (r) => ({
      cpu: pick(r, ['Snapdragon 8 Gen 3', 'Snapdragon 7s Gen 2', 'Dimensity 9300', 'Dimensity 7050', 'Helio G99', 'Exynos 1480', 'Unisoc T612']),
      ram: pick(r, ['4', '6', '8', '12', '16']),
      storage: pick(r, ['64', '128', '256', '512']),
      battery: pick(r, ['4500', '5000', '5500', '6000']),
      display: pick(r, ['6.5" IPS LCD 90Hz', '6.6" AMOLED 120Hz', '6.7" AMOLED 144Hz', '6.4" OLED 60Hz']),
      camera: pick(r, ['50', '64', '108', '200', '13']),
      os: pick(r, ['Android 14', 'Android 15']),
      network: pick(r, ['4G LTE', '5G']),
      nfc: pick(r, ['Ya', 'Tidak']),
    }),
    tags: ['smartphone', 'android', 'hp'],
  },
  laptop: {
    icon: '💻',
    brands: {
      Asus: { series: ['VivoBook', 'ZenBook', 'ROG Strix', 'TUF Gaming', 'ExpertBook'], bg: ['#00539C', '#003060'] },
      Lenovo: { series: ['IdeaPad', 'ThinkPad', 'Legion', 'Yoga', 'LOQ'], bg: ['#E2231A', '#4B4B4B'] },
      HP: { series: ['Pavilion', 'Victus', 'Omen', 'EliteBook', 'Envy'], bg: ['#0096D6', '#005A8B'] },
      Dell: { series: ['Inspiron', 'XPS', 'Latitude', 'Vostro', 'G'], bg: ['#007DB8', '#004C97'] },
      Acer: { series: ['Aspire', 'Nitro', 'Predator', 'Swift', 'TravelMate'], bg: ['#83B81A', '#4E7211'] },
      MSI: { series: ['Modern', 'Katana', 'Stealth', 'Cyborg', 'Prestige'], bg: ['#CC0000', '#8B0000'] },
      Gigabyte: { series: ['Aero', 'Aorus', 'G'], bg: ['#E31837', '#9B0000'] },
      Huawei: { series: ['MateBook D', 'MateBook X'], bg: ['#CF0A2C', '#8A0016'] },
    },
    variants: ['', 'Slim', 'Pro', 'Air', 'Plus', 'OLED', 'Gaming', 'Studio', '2-in-1'],
    price: [4500000, 45000000],
    specs: (r) => ({
      cpu: pick(r, ['Intel Core i3-1315U', 'Intel Core i5-13420H', 'Intel Core i7-13700H', 'Intel Core Ultra 7 155H', 'AMD Ryzen 5 7530U', 'AMD Ryzen 7 7840HS', 'AMD Ryzen 9 8945HS']),
      ram: pick(r, ['8', '16', '32']),
      storage: pick(r, ['256', '512', '1024']),
      gpu: pick(r, ['Intel Iris Xe', 'RTX 4050 6GB', 'RTX 4060 8GB', 'RTX 4070 8GB', 'AMD Radeon 780M']),
      display: pick(r, ['14" FHD IPS', '15.6" FHD 144Hz', '16" QHD+ 165Hz', '14" 2.8K OLED 90Hz']),
      battery: pick(r, ['42Wh', '56Wh', '70Wh', '90Wh']),
      os: 'Windows 11',
      weight: pick(r, ['1.2kg', '1.4kg', '1.8kg', '2.2kg', '2.5kg']),
    }),
    tags: ['laptop', 'notebook', 'komputer'],
  },
  headphone: {
    icon: '🎧',
    brands: {
      Sony: { series: ['WH-CH', 'WF-C', 'WH-XB', 'WF-LS'], bg: ['#000000', '#333333'] },
      JBL: { series: ['Tune', 'Live', 'Wave', 'Endurance'], bg: ['#FF3300', '#B22400'] },
      Soundcore: { series: ['Life Q', 'Liberty', 'Space Q', 'P'], bg: ['#00A9E0', '#00688B'] },
      Edifier: { series: ['W', 'X', 'NeoBuds'], bg: ['#8B0000', '#4A0000'] },
      Sennheiser: { series: ['HD', 'Momentum', 'Accentum'], bg: ['#0F0F0F', '#4B4B4B'] },
      Baseus: { series: ['Bowie', 'Encok', 'AeQur'], bg: ['#2D2D2D', '#5A5A5A'] },
      Havit: { series: ['H', 'Fuxi', 'TW'], bg: ['#6C2BD9', '#3B1478'] },
      Logitech: { series: ['G', 'Zone', 'H'], bg: ['#00B8FC', '#0072A3'] },
    },
    variants: ['', 'ANC', 'Pro', 'Wireless', 'BT', 'Gaming', 'Sport', 'Mini'],
    price: [150000, 6500000],
    specs: (r) => ({
      type: pick(r, ['Over-ear', 'On-ear', 'TWS In-ear', 'Neckband']),
      driver: pick(r, ['10mm', '13mm', '40mm', '50mm']),
      battery: pick(r, ['20 jam', '30 jam', '40 jam', '8+24 jam (case)']),
      anc: pick(r, ['Ya', 'Tidak']),
      bluetooth: pick(r, ['5.0', '5.2', '5.3', '5.4']),
      codec: pick(r, ['SBC/AAC', 'SBC/AAC/LDAC', 'SBC/AAC/aptX']),
      mic: 'Ya',
    }),
    tags: ['headphone', 'earphone', 'audio', 'tws'],
  },
  kamera: {
    icon: '📷',
    brands: {
      Canon: { series: ['EOS R', 'EOS M', 'PowerShot', 'IXUS'], bg: ['#BC0024', '#7A0017'] },
      Nikon: { series: ['Z', 'D', 'Coolpix'], bg: ['#FFE100', '#B29D00'] },
      Sony: { series: ['Alpha A', 'ZV-E', 'ZV-1', 'RX'], bg: ['#000000', '#FF6600'] },
      Fujifilm: { series: ['X-T', 'X-S', 'X-E', 'Instax'], bg: ['#00594F', '#00332C'] },
      Panasonic: { series: ['Lumix G', 'Lumix S'], bg: ['#0041C0', '#002269'] },
      GoPro: { series: ['Hero', 'Max'], bg: ['#00A8E0', '#005B7A'] },
      DJI: { series: ['Osmo Pocket', 'Osmo Action'], bg: ['#4A4A4A', '#1A1A1A'] },
      Olympus: { series: ['OM-D E-M', 'Pen E-P'], bg: ['#003DA5', '#002059'] },
    },
    variants: ['', 'Mark II', 'Mark III', 'Kit', 'Body Only', 'II', 'Pro', 'Bundle'],
    price: [2500000, 60000000],
    specs: (r) => ({
      sensor: pick(r, ['APS-C 24MP', 'Full-Frame 33MP', 'Micro 4/3 20MP', '1" 20MP', 'Full-Frame 61MP']),
      video: pick(r, ['4K 30fps', '4K 60fps', '6K 30fps', '8K 30fps', 'FHD 120fps']),
      mount: pick(r, ['RF', 'Z', 'E', 'X', 'MFT', 'Fixed']),
      stabilization: pick(r, ['IBIS 5-axis', 'Digital', 'Optical', 'Tidak']),
      screen: pick(r, ['3" Flip Touchscreen', '3" Tilting', '2.36M-dot EVF']),
      wifi: 'Ya',
      weight: pick(r, ['350g', '480g', '610g', '750g']),
    }),
    tags: ['kamera', 'camera', 'fotografi', 'mirrorless'],
  },
  'smart-tv': {
    icon: '📺',
    brands: {
      Samsung: { series: ['Crystal UHD CU', 'Neo QLED QN', 'QLED Q', 'The Frame LS'], bg: ['#1428A0', '#0070C0'] },
      LG: { series: ['UR', 'OLED C', 'OLED B', 'NanoCell NANO', 'QNED'], bg: ['#A50034', '#6B0022'] },
      Sony: { series: ['Bravia X', 'Bravia XR A', 'Bravia W'], bg: ['#000000', '#333333'] },
      TCL: { series: ['C', 'P', 'A'], bg: ['#E60012', '#99000C'] },
      Hisense: { series: ['U', 'A', 'E'], bg: ['#00A6A0', '#006B67'] },
      Polytron: { series: ['PLD', 'Cinemax Soundbar PLD'], bg: ['#0057A8', '#003463'] },
      Xiaomi: { series: ['TV A', 'TV Q', 'TV Max'], bg: ['#FF6900', '#E30000'] },
      Coocaa: { series: ['S', 'Y', 'CT'], bg: ['#FF6F00', '#B24E00'] },
    },
    variants: ['', '4K', 'UHD', 'Google TV', 'Android TV', 'HDR', 'Smart', 'Pro'],
    price: [1800000, 35000000],
    specs: (r) => ({
      screen_size: pick(r, ['32"', '43"', '50"', '55"', '65"', '75"']),
      resolution: pick(r, ['HD Ready', 'FHD', '4K UHD', '8K']),
      panel: pick(r, ['LED', 'QLED', 'OLED', 'Mini LED', 'NanoCell']),
      refresh_rate: pick(r, ['60Hz', '120Hz', '144Hz']),
      os: pick(r, ['Google TV', 'Android TV', 'Tizen', 'webOS']),
      hdr: pick(r, ['HDR10', 'HDR10+', 'Dolby Vision', 'Tidak']),
      speaker: pick(r, ['20W', '30W', '40W', '60W Dolby Atmos']),
      hdmi: pick(r, ['2', '3', '4']),
    }),
    tags: ['tv', 'smart-tv', 'televisi'],
  },
};

// ─── Util ───────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
function randInt(r, min, max) { return Math.floor(r() * (max - min + 1)) + min; }
function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function makeSVG({ bg1, bg2, icon, brand, label }) {
  const short = label.length > 28 ? label.slice(0, 28) + '…' : label;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${bg1}"/><stop offset="100%" style="stop-color:${bg2}"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect x="60" y="60" width="680" height="480" fill="rgba(255,255,255,0.08)" rx="24"/>
  <text x="400" y="240" font-size="130" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="400" y="355" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">${brand.toUpperCase()}</text>
  <text x="400" y="400" font-family="system-ui,sans-serif" font-size="22" font-weight="500" fill="white" text-anchor="middle">${short}</text>
</svg>`);
}

const DESC = {
  smartphone: (n, s) => `${n} hadir dengan chipset ${s.cpu}, RAM ${s.ram}GB, dan penyimpanan ${s.storage}GB. Layar ${s.display} memanjakan mata, ditenagai baterai ${s.battery}mAh dan kamera utama ${s.camera}MP untuk menemani aktivitas harian Anda.`,
  laptop: (n, s) => `${n} ditenagai ${s.cpu} dengan RAM ${s.ram}GB dan SSD ${s.storage}GB. GPU ${s.gpu} serta layar ${s.display} menjadikannya andalan untuk kerja maupun hiburan.`,
  headphone: (n, s) => `${n} tipe ${s.type} dengan driver ${s.driver} menghadirkan audio jernih. Baterai tahan ${s.battery}, Bluetooth ${s.bluetooth}, ANC: ${s.anc}.`,
  kamera: (n, s) => `${n} dibekali sensor ${s.sensor} dengan kemampuan video ${s.video}. Stabilisasi ${s.stabilization} membantu hasil foto dan video tetap tajam.`,
  'smart-tv': (n, s) => `${n} dengan layar ${s.screen_size} ${s.resolution} panel ${s.panel} ${s.refresh_rate}. Berjalan di ${s.os} dengan dukungan ${s.hdr} dan speaker ${s.speaker}.`,
};

// ─── Generate definisi produk unik ──────────────────────────
function generateDefs(target, existingNames) {
  const r = mulberry32(20260731);
  const catSlugs = Object.keys(CATALOG);
  const used = new Set(existingNames.map((n) => n.toLowerCase()));
  const defs = [];
  let guard = 0;
  while (defs.length < target && guard < target * 50) {
    guard++;
    const catSlug = catSlugs[defs.length % catSlugs.length];
    const cat = CATALOG[catSlug];
    const brandNames = Object.keys(cat.brands);
    const brand = pick(r, brandNames);
    const bInfo = cat.brands[brand];
    const series = pick(r, bInfo.series);
    const num = randInt(r, 1, 99);
    const variant = pick(r, cat.variants);
    const name = `${brand} ${series}${series.endsWith(' ') ? '' : ' '}${num}${variant ? ' ' + variant : ''}`.replace(/\s+/g, ' ').trim();
    if (used.has(name.toLowerCase())) continue;
    used.add(name.toLowerCase());

    const specs = cat.specs(r);
    const price = Math.round(randInt(r, cat.price[0], cat.price[1]) / 10000) * 10000;
    const hasDiscount = r() < 0.45;
    defs.push({
      name, brand, catSlug,
      slug: slugify(name),
      price,
      originalPrice: hasDiscount ? Math.round((price * (1 + r() * 0.35)) / 10000) * 10000 : undefined,
      stock: randInt(r, 0, 150),
      isFeatured: r() < 0.03,
      specs,
      theme: { bg1: bInfo.bg[0], bg2: bInfo.bg[1], icon: cat.icon },
      description: DESC[catSlug](name, specs),
      tags: [...cat.tags, brand.toLowerCase()],
    });
  }
  return defs;
}

// ─── Main ───────────────────────────────────────────────────
async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elektroniku');
    console.log('✅ MongoDB terhubung');

    const categories = await Category.find({});
    const catMap = {};
    for (const c of categories) catMap[c.slug] = c._id;

    const existingNames = (await Product.find({}, 'name').lean()).map((p) => p.name);
    console.log(`📦 Produk saat ini: ${existingNames.length}. Target tambahan: ${TARGET}`);

    const defs = generateDefs(TARGET, existingNames).filter((d) => catMap[d.catSlug]);
    console.log(`🧬 ${defs.length} definisi produk unik dibuat. Upload gambar + insert...`);

    const BATCH = 50;
    let created = 0;
    for (let i = 0; i < defs.length; i += BATCH) {
      const batch = defs.slice(i, i + BATCH);
      // Upload 1 gambar SVG per produk secara paralel per batch
      const docs = await Promise.all(
        batch.map(async (def) => {
          const buf = makeSVG({ ...def.theme, brand: def.brand, label: def.name });
          const objName = `${def.slug}-1.svg`;
          await minioClient.putObject(BUCKET, objName, buf, buf.length, { 'Content-Type': 'image/svg+xml' });
          return {
            name: def.name, brand: def.brand, category: catMap[def.catSlug],
            price: def.price, originalPrice: def.originalPrice,
            stock: def.stock, images: [`${PUBLIC_MINIO_URL}/${BUCKET}/${objName}`],
            isFeatured: def.isFeatured, description: def.description,
            specifications: def.specs, tags: def.tags, isActive: true,
            metaTitle: `${def.name} - Harga & Spesifikasi`,
            metaDescription: def.description.slice(0, 160),
          };
        })
      );
      await Product.insertMany(docs, { ordered: false });
      created += docs.length;
      process.stdout.write(`\r🚀 ${created}/${defs.length} produk dibuat...`);
    }

    const total = await Product.countDocuments();
    console.log(`\n✅ Selesai! ${created} produk baru ditambahkan. Total: ${total} produk di DB`);

    const byCategory = await Product.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    for (const g of byCategory) console.log(`  ${g._id}: ${g.count} produk`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();

/**
 * Seed produk lengkap dengan spesifikasi detail dan gambar ke MinIO
 * Usage: node seed-products.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Minio = require('minio');

const Category = require('./models/Category');
const Product = require('./models/Product');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET = process.env.MINIO_BUCKET || 'products';
const MINIO_URL = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;

// ─── SVG Image Generator ───────────────────────────────────────────────────────

function makeSVG({ bg1, bg2, icon, brand, label, width = 800, height = 600 }) {
  const short = label.length > 28 ? label.slice(0, 28) + '…' : label;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1}"/>
      <stop offset="100%" style="stop-color:${bg2}"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" rx="0"/>
  <rect x="60" y="60" width="${width-120}" height="${height-120}" fill="rgba(255,255,255,0.08)" rx="24"/>
  <text x="${width/2}" y="${height/2 - 60}" font-size="130" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="${width/2}" y="${height/2 + 55}" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">${brand.toUpperCase()}</text>
  <text x="${width/2}" y="${height/2 + 100}" font-family="system-ui,sans-serif" font-size="22" font-weight="500" fill="white" text-anchor="middle">${short}</text>
</svg>`);
}

async function uploadSVG(filename, svgBuffer) {
  await minioClient.putObject(BUCKET, filename, svgBuffer, svgBuffer.length, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=31536000',
  });
  return `${MINIO_URL}/${BUCKET}/${filename}`;
}

async function uploadProductImages(slug, variants) {
  const urls = [];
  for (let i = 0; i < variants.length; i++) {
    const filename = `${slug}-${i + 1}.svg`;
    const url = await uploadSVG(filename, variants[i]);
    urls.push(url);
    process.stdout.write(`  📤 ${filename}\n`);
  }
  return urls;
}

// ─── Theme presets ─────────────────────────────────────────────────────────────
const themes = {
  samsung:  { bg1: '#1428A0', bg2: '#0070C0' },
  apple:    { bg1: '#1c1c1e', bg2: '#3a3a3c' },
  xiaomi:   { bg1: '#FF6900', bg2: '#E30000' },
  oppo:     { bg1: '#1A1A2E', bg2: '#16213E' },
  google:   { bg1: '#4285F4', bg2: '#34A853' },
  vivo:     { bg1: '#415FFF', bg2: '#0B21A8' },
  realme:   { bg1: '#FFD700', bg2: '#FF8C00' },
  asus:     { bg1: '#00539C', bg2: '#EEA47F' },
  lenovo:   { bg1: '#E2231A', bg2: '#4B4B4B' },
  dell:     { bg1: '#007DB8', bg2: '#004C97' },
  hp:       { bg1: '#0096D6', bg2: '#005A8B' },
  acer:     { bg1: '#83B81A', bg2: '#005B00' },
  sony:     { bg1: '#1A1A1A', bg2: '#373737' },
  bose:     { bg1: '#2C2C2C', bg2: '#444' },
  jbl:      { bg1: '#F94F0C', bg2: '#C03A09' },
  sennheiser: { bg1: '#222', bg2: '#4a4a4a' },
  canon:    { bg1: '#CE1126', bg2: '#8B0000' },
  fujifilm: { bg1: '#FF0000', bg2: '#8B0000' },
  gopro:    { bg1: '#00ADEF', bg2: '#0076A3' },
  lg:       { bg1: '#A50034', bg2: '#C5003E' },
  tcl:      { bg1: '#1C4B9C', bg2: '#0F2F6D' },
};

// ─── Product Data ─────────────────────────────────────────────────────────────

const productDefs = [
  // ══════════════════════════════════════════════════════════
  //  SMARTPHONE
  // ══════════════════════════════════════════════════════════
  {
    slug: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    price: 22999000, originalPrice: 24999000, stock: 25,
    isFeatured: true,
    categorySlug: 'smartphone',
    tags: ['flagship', 'android', '5g', 'stylus', 's-pen', 'samsung'],
    description: 'Samsung Galaxy S25 Ultra adalah flagship terbaru Samsung dengan desain titanium premium, S Pen terintegrasi, dan Galaxy AI yang ditingkatkan. Dilengkapi chip Snapdragon 8 Elite terbaru dan kamera 200MP yang luar biasa.',
    specs: { cpu: 'Snapdragon 8 Elite', ram: '12', storage: '256', battery: '5000', display: '6.9" QHD+ 120Hz AMOLED', camera: '200', os: 'Android 15 / One UI 7', network: '5G', 'charging': '45W Fast Charging', 'dimensions': '162.8 x 77.6 x 8.2 mm', 'weight': '218g', 'color': 'Titanium Silverblue', 'water_resistance': 'IP68', 'front_camera': '12MP', 'nfc': 'Ya', 'stylus': 'S Pen terintegrasi' },
    theme: { ...themes.samsung, icon: '📱' },
  },
  {
    slug: 'iphone-16-pro-max',
    name: 'Apple iPhone 16 Pro Max',
    brand: 'Apple',
    price: 24999000, originalPrice: 26999000, stock: 20,
    isFeatured: true,
    categorySlug: 'smartphone',
    tags: ['flagship', 'ios', '5g', 'apple', 'iphone', 'titanium'],
    description: 'iPhone 16 Pro Max hadir dengan chip A18 Pro terbaru, kamera 48MP dengan optical zoom 5x, layar 6.9" Super Retina XDR ProMotion 120Hz, dan fitur Apple Intelligence AI. Bodi titanium grade 5 yang ringan namun kokoh.',
    specs: { cpu: 'Apple A18 Pro (3nm)', ram: '8', storage: '256', battery: '4685', display: '6.9" Super Retina XDR 120Hz', camera: '48', os: 'iOS 18', network: '5G', 'charging': '27W MagSafe', 'dimensions': '163 x 77.6 x 8.3 mm', 'weight': '227g', 'color': 'Black Titanium', 'water_resistance': 'IP68 6m', 'front_camera': '12MP TrueDepth', 'nfc': 'Ya', 'chip': 'Apple A18 Pro' },
    theme: { ...themes.apple, icon: '📱' },
  },
  {
    slug: 'xiaomi-14t-pro',
    name: 'Xiaomi 14T Pro',
    brand: 'Xiaomi',
    price: 8999000, originalPrice: 9999000, stock: 40,
    isFeatured: true,
    categorySlug: 'smartphone',
    tags: ['xiaomi', 'android', '5g', 'leica', 'fast-charging'],
    description: 'Xiaomi 14T Pro menghadirkan kamera Leica optics, pengisian daya 120W HyperCharge super cepat, dan layar AMOLED 144Hz. Didukung MediaTek Dimensity 9300+ dengan performa gaming tinggi.',
    specs: { cpu: 'MediaTek Dimensity 9300+', ram: '12', storage: '256', battery: '5000', display: '6.67" AMOLED 144Hz 1.5K', camera: '50', os: 'Android 14 / HyperOS', network: '5G', 'charging': '120W HyperCharge + 50W wireless', 'dimensions': '160.4 x 75.1 x 8.39 mm', 'weight': '209g', 'color': 'Titan Black', 'water_resistance': 'IP68', 'front_camera': '32MP', 'nfc': 'Ya', 'partnership': 'Leica Optics' },
    theme: { ...themes.xiaomi, icon: '📱' },
  },
  {
    slug: 'oppo-find-x8-pro',
    name: 'Oppo Find X8 Pro',
    brand: 'Oppo',
    price: 14999000, originalPrice: 16999000, stock: 15,
    isFeatured: false,
    categorySlug: 'smartphone',
    tags: ['oppo', 'android', '5g', 'hasselblad', 'periskop'],
    description: 'Oppo Find X8 Pro hadir dengan kamera periskop Hasselblad, chip MediaTek Dimensity 9400 terbaru, pengisian 80W SuperVOOC, dan baterai 5910mAh yang tahan lama seharian penuh.',
    specs: { cpu: 'MediaTek Dimensity 9400', ram: '16', storage: '256', battery: '5910', display: '6.78" AMOLED 120Hz 2K', camera: '50', os: 'Android 15 / ColorOS 15', network: '5G', 'charging': '80W SuperVOOC + 50W wireless', 'dimensions': '162.9 x 76.5 x 8.92 mm', 'weight': '218g', 'color': 'Space Black', 'water_resistance': 'IP69', 'front_camera': '32MP', 'nfc': 'Ya', 'partnership': 'Hasselblad Camera' },
    theme: { ...themes.oppo, icon: '📱' },
  },
  {
    slug: 'google-pixel-9-pro',
    name: 'Google Pixel 9 Pro',
    brand: 'Google',
    price: 15999000, originalPrice: null, stock: 18,
    isFeatured: false,
    categorySlug: 'smartphone',
    tags: ['google', 'pixel', 'android', '5g', 'ai', 'gemini'],
    description: 'Google Pixel 9 Pro adalah smartphone AI paling canggih dengan Gemini AI terintegrasi, chip Tensor G4 buatan Google, kamera computational photography terbaik, dan 7 tahun update OS dan keamanan.',
    specs: { cpu: 'Google Tensor G4', ram: '16', storage: '128', battery: '4700', display: '6.3" LTPO OLED 120Hz 2K', camera: '50', os: 'Android 15', network: '5G', 'charging': '27W wired + 21W wireless', 'dimensions': '152.8 x 72 x 8.5 mm', 'weight': '199g', 'color': 'Porcelain', 'water_resistance': 'IP68', 'front_camera': '10.5MP', 'nfc': 'Ya', 'ai_chip': 'Titan M3 security' },
    theme: { ...themes.google, icon: '📱' },
  },
  {
    slug: 'samsung-galaxy-a55',
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung',
    price: 5499000, originalPrice: 5999000, stock: 60,
    isFeatured: false,
    categorySlug: 'smartphone',
    tags: ['samsung', 'midrange', 'android', '5g', 'galaxy-a'],
    description: 'Samsung Galaxy A55 5G adalah pilihan mid-range terbaik dengan layar Super AMOLED 120Hz, kamera 50MP OIS, baterai 5000mAh, dan prosesor Exynos 1480. Hadir dengan bodi premium glass dan sertifikasi IP67.',
    specs: { cpu: 'Exynos 1480 (4nm)', ram: '8', storage: '128', battery: '5000', display: '6.6" Super AMOLED 120Hz FHD+', camera: '50', os: 'Android 14 / One UI 6.1', network: '5G', 'charging': '25W Fast Charging', 'dimensions': '161.1 x 77.4 x 8.2 mm', 'weight': '213g', 'color': 'Awesome Navy', 'water_resistance': 'IP67', 'front_camera': '32MP', 'nfc': 'Ya', 'ois': 'Optical Image Stabilization' },
    theme: { ...themes.samsung, icon: '📱' },
  },
  {
    slug: 'vivo-x200-pro',
    name: 'Vivo X200 Pro',
    brand: 'Vivo',
    price: 11999000, originalPrice: 13499000, stock: 22,
    isFeatured: false,
    categorySlug: 'smartphone',
    tags: ['vivo', 'android', '5g', 'zeiss', 'portrait'],
    description: 'Vivo X200 Pro dilengkapi kamera portrait ZEISS dengan telephoto 200MP, chip Dimensity 9400, baterai 6000mAh dengan pengisian BlueVolt 90W, dan layar LTPO AMOLED 1.5K 120Hz yang menawan.',
    specs: { cpu: 'MediaTek Dimensity 9400', ram: '16', storage: '256', battery: '6000', display: '6.67" LTPO AMOLED 120Hz 1.5K', camera: '50', os: 'Android 15 / OriginOS 5', network: '5G', 'charging': '90W BlueVolt + 30W wireless', 'dimensions': '163.2 x 76.9 x 8.19 mm', 'weight': '229g', 'color': 'Titanium Grey', 'water_resistance': 'IP69', 'front_camera': '32MP', 'nfc': 'Ya', 'partnership': 'ZEISS Camera System', 'telephoto': '200MP periscope telephoto' },
    theme: { ...themes.vivo, icon: '📱' },
  },

  // ══════════════════════════════════════════════════════════
  //  LAPTOP
  // ══════════════════════════════════════════════════════════
  {
    slug: 'asus-rog-zephyrus-g16',
    name: 'ASUS ROG Zephyrus G16 2024',
    brand: 'ASUS',
    price: 29999000, originalPrice: 32999000, stock: 10,
    isFeatured: true,
    categorySlug: 'laptop',
    tags: ['gaming', 'laptop', 'nvidia', 'rtx', 'asus', 'rog'],
    description: 'ASUS ROG Zephyrus G16 adalah laptop gaming premium tipis dengan Intel Core Ultra 9, NVIDIA RTX 4090 Laptop, layar OLED 240Hz 2.5K, dan desain AniMe Matrix LED yang ikonik. Performa gaming terdepan dalam chassis tipis.',
    specs: { cpu: 'Intel Core Ultra 9 185H', ram: '32', storage: '1000', gpu: 'NVIDIA GeForce RTX 4090 Laptop 16GB', display: '16" OLED 2.5K 240Hz', battery: '90', weight: '1.95', os: 'Windows 11 Pro', 'cooling': 'Tri-fan system dengan liquid metal', 'keyboard': 'Backlit per-key RGB', 'ports': 'Thunderbolt 4 x2, USB-A x2, HDMI 2.1, SD card', 'wifi': 'Wi-Fi 7', 'ram_type': 'LPDDR5X', 'storage_type': 'PCIe 4.0 NVMe SSD' },
    theme: { ...themes.asus, icon: '💻' },
  },
  {
    slug: 'apple-macbook-air-m3',
    name: 'Apple MacBook Air 15" M3',
    brand: 'Apple',
    price: 18999000, originalPrice: null, stock: 15,
    isFeatured: true,
    categorySlug: 'laptop',
    tags: ['apple', 'macbook', 'macos', 'ultra-thin', 'm3'],
    description: 'MacBook Air 15" M3 adalah laptop tipis terbaik dengan chip M3 revolusioner, layar Liquid Retina 15.3", baterai 18 jam, dan desain fanless yang senyap. Performa exceptional untuk kerja kreatif dan produktivitas.',
    specs: { cpu: 'Apple M3 (8-core CPU, 10-core GPU)', ram: '16', storage: '512', gpu: 'Apple M3 10-core GPU terintegrasi', display: '15.3" Liquid Retina 2880x1864 500 nits', battery: '66.5', weight: '1.51', os: 'macOS Sonoma', 'cooling': 'Passive cooling (fanless)', 'keyboard': 'Magic Keyboard dengan Touch ID', 'ports': 'Thunderbolt 3 x2, MagSafe 3, 3.5mm jack', 'wifi': 'Wi-Fi 6E', 'ram_type': 'Unified Memory LPDDR5', 'storage_type': 'Apple SSD NVMe' },
    theme: { ...themes.apple, icon: '💻' },
  },
  {
    slug: 'lenovo-thinkpad-x1-carbon-gen12',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    price: 25999000, originalPrice: 28999000, stock: 8,
    isFeatured: false,
    categorySlug: 'laptop',
    tags: ['business', 'laptop', 'lenovo', 'thinkpad', 'ultrabook'],
    description: 'ThinkPad X1 Carbon Gen 12 adalah laptop bisnis paling ringan dan tangguh. Bersertifikasi MIL-SPEC, layar IPS 2.8K OLED opsional, keyboard TrackPoint legendaris, dan keamanan enterprise-grade.',
    specs: { cpu: 'Intel Core Ultra 7 165U', ram: '32', storage: '1000', gpu: 'Intel Arc Graphics terintegrasi', display: '14" IPS 2.8K 120Hz / OLED opsional', battery: '57', weight: '1.12', os: 'Windows 11 Pro', 'cooling': 'Dual fan intelligent cooling', 'keyboard': 'TrackPoint + backlit', 'ports': 'Thunderbolt 4 x2, USB-A x2, HDMI 2.1, 4G LTE opsional', 'wifi': 'Wi-Fi 7', 'ram_type': 'LPDDR5', 'mil_spec': 'MIL-STD-810H (13 uji ketahanan)' },
    theme: { ...themes.lenovo, icon: '💻' },
  },
  {
    slug: 'dell-xps-15-9530',
    name: 'Dell XPS 15 9530',
    brand: 'Dell',
    price: 26999000, originalPrice: 29999000, stock: 7,
    isFeatured: false,
    categorySlug: 'laptop',
    tags: ['dell', 'xps', 'laptop', 'creator', 'oled'],
    description: 'Dell XPS 15 adalah laptop premium untuk kreator konten dengan layar OLED 3.5K touchscreen yang memukau, Intel Core i9-13900H, NVIDIA RTX 4070, dan chassis aluminium tipis berdesain elegan.',
    specs: { cpu: 'Intel Core i9-13900H (14-core)', ram: '32', storage: '1000', gpu: 'NVIDIA GeForce RTX 4070 8GB', display: '15.6" OLED 3.5K 120Hz touchscreen', battery: '86', weight: '1.86', os: 'Windows 11 Home', 'cooling': 'Quad-fan thermal system', 'keyboard': 'Backlit dengan fingerprint', 'ports': 'Thunderbolt 4 x2, USB-C, SD card, 3.5mm', 'wifi': 'Wi-Fi 6E', 'ram_type': 'DDR5 4800MHz', 'storage_type': 'PCIe 4.0 NVMe' },
    theme: { ...themes.dell, icon: '💻' },
  },
  {
    slug: 'hp-spectre-x360-14',
    name: 'HP Spectre x360 14" 2-in-1',
    brand: 'HP',
    price: 22999000, originalPrice: 24999000, stock: 12,
    isFeatured: false,
    categorySlug: 'laptop',
    tags: ['hp', 'spectre', '2in1', 'laptop', 'convertible', 'touchscreen'],
    description: 'HP Spectre x360 14 adalah laptop 2-in-1 premium dengan layar OLED 2.8K sentuh 120Hz, stylus MPP2.0 aktif, Intel Core Ultra 7, dan desain 360° yang memungkinkan mode laptop, tablet, tenda, dan stand.',
    specs: { cpu: 'Intel Core Ultra 7 165U', ram: '32', storage: '1000', gpu: 'Intel Arc Graphics terintegrasi', display: '14" OLED 2.8K 120Hz touchscreen 360°', battery: '66', weight: '1.41', os: 'Windows 11 Home', 'cooling': 'Dual fan', 'keyboard': 'Backlit premium', 'ports': 'Thunderbolt 4 x2, USB-A, microSD, 3.5mm', 'wifi': 'Wi-Fi 6E', 'stylus': 'HP Active Pen MPP 2.0 (included)', 'hinge': '360° convertible' },
    theme: { ...themes.hp, icon: '💻' },
  },
  {
    slug: 'acer-nitro-v-15',
    name: 'Acer Nitro V 15 ANV15-51',
    brand: 'Acer',
    price: 10999000, originalPrice: 12999000, stock: 35,
    isFeatured: false,
    categorySlug: 'laptop',
    tags: ['acer', 'nitro', 'gaming', 'laptop', 'rtx', 'budget-gaming'],
    description: 'Acer Nitro V 15 adalah laptop gaming entry-level terbaik dengan RTX 4060, Intel Core i7-13620H, layar IPS 165Hz FHD, dan harga terjangkau. Pilihan sempurna untuk gamer yang ingin performa tinggi tanpa menguras kantong.',
    specs: { cpu: 'Intel Core i7-13620H (10-core)', ram: '16', storage: '512', gpu: 'NVIDIA GeForce RTX 4060 Laptop 8GB', display: '15.6" IPS FHD 165Hz 3ms', battery: '57.5', weight: '2.5', os: 'Windows 11 Home', 'cooling': 'Dual fan + 4 heat pipes', 'keyboard': 'Nitro Sense backlit WASD', 'ports': 'USB-C 3.2, USB-A x3, HDMI 2.1, RJ45', 'wifi': 'Wi-Fi 6', 'ram_type': 'DDR5 16GB', 'storage_type': 'PCIe 4.0 NVMe' },
    theme: { ...themes.acer, icon: '💻' },
  },

  // ══════════════════════════════════════════════════════════
  //  HEADPHONE & EARPHONE
  // ══════════════════════════════════════════════════════════
  {
    slug: 'sony-wh-1000xm6',
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    price: 4999000, originalPrice: 5499000, stock: 30,
    isFeatured: true,
    categorySlug: 'headphone',
    tags: ['sony', 'headphone', 'anc', 'wireless', 'over-ear', 'noise-cancelling'],
    description: 'Sony WH-1000XM6 adalah headphone ANC over-ear terbaik di kelasnya dengan LDAC Hi-Res Audio, AI ANC yang diperkuat, masa pakai baterai 30 jam, pelipatan Multipoint untuk 2 perangkat, dan kenyamanan premium seharian.',
    specs: { driver: '40mm', frequency: '4Hz - 40kHz', 'impedance': '48Ω', 'sensitivity': '102dB/mW', 'battery': '30', 'charging': 'USB-C (10 menit = 5 jam)', 'connection': 'Bluetooth 5.3 + 3.5mm', 'anc': 'AI Adaptive ANC generasi terbaru', 'codec': 'LDAC, AAC, SBC', 'weight': '254g', 'multipoint': '2 perangkat simultan', 'voice_assistant': 'Google, Alexa, Siri' },
    theme: { ...themes.sony, icon: '🎧' },
  },
  {
    slug: 'airpods-pro-2nd-gen',
    name: 'Apple AirPods Pro (2nd Generation)',
    brand: 'Apple',
    price: 3999000, originalPrice: null, stock: 45,
    isFeatured: true,
    categorySlug: 'headphone',
    tags: ['apple', 'airpods', 'tws', 'anc', 'earphone', 'h2-chip'],
    description: 'AirPods Pro Generasi 2 hadir dengan chip H2 revolusioner, ANC 2x lebih kuat, Transparency mode adaptif, Personalized Spatial Audio, hingga 6 jam baterai + 30 jam dengan case MagSafe.',
    specs: { driver: 'Custom Apple', frequency: '20Hz - 20kHz', 'impedance': 'N/A', 'sensitivity': 'N/A', 'battery': '6', 'charging': 'MagSafe / Lightning / USB-C', 'connection': 'Bluetooth 5.3 (H2 chip)', 'anc': 'Active Noise Cancellation 2x lebih kuat', 'codec': 'AAC, SBC', 'weight': '5.3g per bud', 'case_battery': '30 jam total dengan case', 'water_resistance': 'IPX4', 'spatial_audio': 'Personalized Spatial Audio' },
    theme: { ...themes.apple, icon: '🎧' },
  },
  {
    slug: 'bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra Headphones',
    brand: 'Bose',
    price: 5499000, originalPrice: 5999000, stock: 18,
    isFeatured: false,
    categorySlug: 'headphone',
    tags: ['bose', 'headphone', 'anc', 'wireless', 'over-ear', 'immersive-audio'],
    description: 'Bose QuietComfort Ultra menghadirkan teknologi Immersive Audio yang revolusioner, ANC terdepan dengan CustomTune adaptif, hingga 24 jam baterai, dan kenyamanan Bose yang tak tertandingi untuk perjalanan panjang.',
    specs: { driver: 'Custom TriPort', frequency: '10Hz - 22kHz', 'impedance': '35Ω', 'sensitivity': '99dB/mW', 'battery': '24', 'charging': 'USB-C (15 menit = 3 jam)', 'connection': 'Bluetooth 5.3 + 2.5mm', 'anc': 'CustomTune Adaptive ANC', 'codec': 'AAC, SBC, aptX Adaptive', 'weight': '250g', 'multipoint': '2 perangkat simultan', 'immersive': 'Bose Immersive Audio' },
    theme: { ...themes.bose, icon: '🎧' },
  },
  {
    slug: 'jbl-live-pro-2-tws',
    name: 'JBL Live Pro 2 TWS',
    brand: 'JBL',
    price: 1499000, originalPrice: 1799000, stock: 55,
    isFeatured: false,
    categorySlug: 'headphone',
    tags: ['jbl', 'tws', 'earphone', 'anc', 'wireless'],
    description: 'JBL Live Pro 2 TWS menghadirkan kualitas suara JBL signature dengan ANC 6 mikrofon, Ambient Aware, 40 jam total baterai, pengisian cepat 10 menit, dan gaya hidup aktif dengan sertifikasi IPX5.',
    specs: { driver: '11mm', frequency: '20Hz - 20kHz', 'impedance': 'N/A', 'sensitivity': 'N/A', 'battery': '10', 'charging': 'USB-C + wireless charging', 'connection': 'Bluetooth 5.3', 'anc': 'True Adaptive ANC 6 mikrofon', 'codec': 'AAC, SBC', 'weight': '7g per bud', 'case_battery': '40 jam dengan case', 'water_resistance': 'IPX5', 'spatial_audio': 'JBL Head Tracking' },
    theme: { ...themes.jbl, icon: '🎧' },
  },
  {
    slug: 'sennheiser-momentum-4-wireless',
    name: 'Sennheiser Momentum 4 Wireless',
    brand: 'Sennheiser',
    price: 4499000, originalPrice: 4999000, stock: 20,
    isFeatured: false,
    categorySlug: 'headphone',
    tags: ['sennheiser', 'headphone', 'anc', 'hi-res', 'audiophile'],
    description: 'Sennheiser Momentum 4 Wireless adalah headphone audiophile dengan kualitas suara Hi-Res Audio terbaik kelasnya, baterai luar biasa 60 jam, ANC adaptif, dan desain lipat premium untuk mobilitas tinggi.',
    specs: { driver: '42mm', frequency: '6Hz - 22kHz', 'impedance': '18Ω', 'sensitivity': '113dB/mW', 'battery': '60', 'charging': 'USB-C (fast charging)', 'connection': 'Bluetooth 5.2 + 3.5mm', 'anc': 'Adaptive Noise Cancellation', 'codec': 'AAC, SBC, aptX, aptX Adaptive', 'weight': '293g', 'multipoint': '2 perangkat simultan', 'hi_res': 'Hi-Res Audio certified' },
    theme: { ...themes.sennheiser, icon: '🎧' },
  },

  // ══════════════════════════════════════════════════════════
  //  KAMERA
  // ══════════════════════════════════════════════════════════
  {
    slug: 'sony-zv-e10-ii',
    name: 'Sony ZV-E10 II (Mirrorless)',
    brand: 'Sony',
    price: 11999000, originalPrice: 13499000, stock: 15,
    isFeatured: true,
    categorySlug: 'kamera',
    tags: ['sony', 'mirrorless', 'kamera', 'vlog', 'aps-c', 'content-creator'],
    description: 'Sony ZV-E10 II adalah kamera mirrorless APS-C ideal untuk vlogger dan content creator dengan sensor 26MP generasi baru, autofokus real-time AI, video 4K 60fps, layar sentuh flip, dan mikrofon direktional bawaan.',
    specs: { sensor: 'APS-C CMOS 26MP Exmor R generasi baru', 'lens_mount': 'Sony E-mount', 'video': '4K 60fps / 1080p 120fps', 'autofocus': 'AI Real-time Tracking AF', 'iso': '100-51200', 'shutter': '1/4000 - 30s mekanik', 'stabilization': 'SteadyShot + in-body', 'screen': '3" vari-angle touchscreen', 'battery': 'NP-FZ100 (310 shots)', 'connectivity': 'WiFi, Bluetooth, USB-C', 'weight': '291g', 'dimensions': '122 x 69 x 59 mm' },
    theme: { ...themes.sony, icon: '📷' },
  },
  {
    slug: 'canon-eos-r10',
    name: 'Canon EOS R10 (Mirrorless)',
    brand: 'Canon',
    price: 12999000, originalPrice: 14499000, stock: 12,
    isFeatured: false,
    categorySlug: 'kamera',
    tags: ['canon', 'mirrorless', 'kamera', 'aps-c', 'entry-level'],
    description: 'Canon EOS R10 adalah kamera mirrorless entry-level terlengkap dengan sensor 24.2MP APS-C, DIGIC X, autofokus Dual Pixel CMOS AF II dengan pelacakan subjek, burst 15fps, dan video 4K 30fps.',
    specs: { sensor: 'APS-C CMOS 24.2MP', 'lens_mount': 'Canon RF-S / RF mount', 'video': '4K 30fps (crop) / 1080p 120fps', 'autofocus': 'Dual Pixel CMOS AF II (651 area)', 'iso': '100-32000', 'shutter': '1/4000 mekanik', 'stabilization': 'Koreksi digital', 'screen': '3" vari-angle touchscreen', 'battery': 'LP-E17 (430 shots)', 'connectivity': 'WiFi, Bluetooth, USB-C', 'weight': '382g', 'burst': '15fps dengan AF/AE' },
    theme: { ...themes.canon, icon: '📷' },
  },
  {
    slug: 'fujifilm-x-m5',
    name: 'Fujifilm X-M5 Mirrorless',
    brand: 'Fujifilm',
    price: 10999000, originalPrice: 11999000, stock: 18,
    isFeatured: false,
    categorySlug: 'kamera',
    tags: ['fujifilm', 'mirrorless', 'kamera', 'film-simulation', 'retro', 'vlog'],
    description: 'Fujifilm X-M5 adalah kamera mirrorless paling kompak dengan 26.1MP X-Trans CMOS 5 HR, 20 Film Simulation termasuk Bleach Bypass baru, video 6.2K 30fps, IBIS 7-stop, dan desain retro yang menawan.',
    specs: { sensor: 'APS-C X-Trans CMOS 5 HR 26.1MP', 'lens_mount': 'Fujifilm X-mount', 'video': '6.2K 30fps / 4K 60fps', 'autofocus': 'AI Subject Tracking AF', 'iso': '160-12800', 'shutter': '1/4000 mekanik', 'stabilization': 'IBIS 7-stop', 'screen': '3" vari-angle touchscreen', 'battery': 'NP-W126S (470 shots)', 'connectivity': 'WiFi, Bluetooth, USB-C', 'weight': '355g', 'film_sim': '20 Film Simulation preset' },
    theme: { ...themes.fujifilm, icon: '📷' },
  },
  {
    slug: 'gopro-hero13-black',
    name: 'GoPro Hero 13 Black',
    brand: 'GoPro',
    price: 6999000, originalPrice: 7499000, stock: 25,
    isFeatured: false,
    categorySlug: 'kamera',
    tags: ['gopro', 'action-camera', 'waterproof', 'extreme', '4k'],
    description: 'GoPro Hero 13 Black adalah action camera paling canggih dengan sensor baru, HyperSmooth 6.0, lensa austakeable, video 5.3K 60fps + HDR, tahan air 10m, dan mode Night Lapse yang ditingkatkan.',
    specs: { sensor: '1/1.9" CMOS 27MP', 'lens_mount': 'Max Lens Mod 2.0 (opsional)', 'video': '5.3K 60fps, 4K 120fps, 2.7K 240fps', 'autofocus': 'HyperSmooth 6.0 + AutoBoost', 'iso': '100-6400', 'shutter': '1/2000 - 30s', 'stabilization': 'HyperSmooth 6.0', 'screen': '2.27" touchscreen depan + belakang 1.4"', 'battery': '1720mAh (70 menit 5.3K)', 'connectivity': 'WiFi 6, Bluetooth 5.0, USB-C', 'weight': '154g', 'water_resistance': 'Waterproof 10m tanpa housing' },
    theme: { ...themes.gopro, icon: '📷' },
  },

  // ══════════════════════════════════════════════════════════
  //  SMART TV
  // ══════════════════════════════════════════════════════════
  {
    slug: 'samsung-neo-qled-8k-65',
    name: 'Samsung 65" Neo QLED 8K QN800D',
    brand: 'Samsung',
    price: 35999000, originalPrice: 39999000, stock: 5,
    isFeatured: true,
    categorySlug: 'smart-tv',
    tags: ['samsung', 'smart-tv', '8k', 'qled', 'neo', 'premium'],
    description: 'Samsung Neo QLED 8K QN800D adalah puncak teknologi TV dengan resolusi 8K nyata, Quantum Mini LED, prosesor NQ8 AI Gen3, dan Dolby Atmos. Performa gambar terbaik dengan AI upscaling 8K untuk semua konten.',
    specs: { display_size: '65 inch', resolution: '8K Ultra HD 7680x4320', panel: 'Quantum Mini LED', hdr: 'Quantum HDR 8K, Dolby Vision, HLG', processor: 'NQ8 AI Gen3 Processor', os: 'Tizen OS 8.0', 'refresh_rate': '144Hz', audio: 'Dolby Atmos 6.2.4 channel 70W', 'ports': 'HDMI 2.1 x4, USB x2, Optical', 'connectivity': 'WiFi 6E, Bluetooth 5.2, AirPlay 2', 'smart_features': 'SmartThings hub, Gaming Hub, Samsung Gaming', 'dimensions': '1439.5 x 909.5 x 39.9 mm' },
    theme: { ...themes.samsung, icon: '📺' },
  },
  {
    slug: 'lg-oled-c4-65',
    name: 'LG 65" OLED evo C4 TV',
    brand: 'LG',
    price: 28999000, originalPrice: 32999000, stock: 8,
    isFeatured: true,
    categorySlug: 'smart-tv',
    tags: ['lg', 'smart-tv', 'oled', '4k', 'gaming', 'c4'],
    description: 'LG OLED C4 adalah OLED TV terbaik untuk gaming dengan processor α9 AI Gen7, Dolby Vision IQ, HDMI 2.1 untuk 4K 144Hz gaming, dan panel OLED evo self-lit pixels yang menghasilkan hitam sempurna.',
    specs: { display_size: '65 inch', resolution: '4K Ultra HD 3840x2160', panel: 'OLED evo self-lit', hdr: 'Dolby Vision IQ, HDR10, HLG, FILMMAKER MODE', processor: 'α9 AI Gen7 Processor 4K', os: 'webOS 24', 'refresh_rate': '144Hz OLED', audio: 'Dolby Atmos 2.2 channel 60W', 'ports': 'HDMI 2.1 x4 (48Gbps), USB x3', 'connectivity': 'WiFi 6, Bluetooth 5.0, AirPlay 2', 'gaming': 'G-Sync, FreeSync Premium, 4K 144Hz', 'dimensions': '1442.6 x 882.2 x 47.7 mm' },
    theme: { ...themes.lg, icon: '📺' },
  },
  {
    slug: 'sony-bravia-9-65',
    name: 'Sony 65" BRAVIA 9 Mini LED TV',
    brand: 'Sony',
    price: 32999000, originalPrice: 36999000, stock: 6,
    isFeatured: false,
    categorySlug: 'smart-tv',
    tags: ['sony', 'smart-tv', 'mini-led', '4k', 'bravia', 'google-tv'],
    description: 'Sony BRAVIA 9 adalah TV Mini LED terbaik Sony dengan TRILUMINOS MAX, XR Backlight Master Drive dengan 1000+ zona dimming, processor XR dengan AI, dan Google TV terintegrasi dengan Netflix, Spotify, YouTube.',
    specs: { display_size: '65 inch', resolution: '4K Ultra HD 3840x2160', panel: 'Mini LED TRILUMINOS MAX', hdr: 'Dolby Vision, HDR10, HLG', processor: 'XR Cognitive Processor', os: 'Google TV', 'refresh_rate': '120Hz XR Motion Clarity', audio: 'Dolby Atmos 2.2 channel 60W Acoustic Multi-Audio', 'ports': 'HDMI 2.1 x2, HDMI 2.0 x2, USB x2', 'connectivity': 'WiFi 6, Bluetooth 5.0, Chromecast built-in', 'gaming': 'ALLM Auto Low Latency Mode', 'dimensions': '1445 x 900 x 78 mm', 'backlights': '1000+ local dimming zones' },
    theme: { ...themes.sony, icon: '📺' },
  },
  {
    slug: 'tcl-qm891g-65',
    name: 'TCL 65" QM891G QLED Mini LED 4K',
    brand: 'TCL',
    price: 15999000, originalPrice: 17999000, stock: 20,
    isFeatured: false,
    categorySlug: 'smart-tv',
    tags: ['tcl', 'smart-tv', 'qled', 'mini-led', '4k', 'value'],
    description: 'TCL QM891G adalah pilihan terbaik value-for-money TV Mini LED QLED dengan 1000 nits kecerahan, Google TV, panel 144Hz, dan dukungan gaming lengkap dengan harga terjangkau dibanding merek premium.',
    specs: { display_size: '65 inch', resolution: '4K Ultra HD 3840x2160', panel: 'QD-Mini LED QLED', hdr: 'Dolby Vision, HDR10, HDR10+, HLG', processor: 'AiPQ Gen3 Processor', os: 'Google TV', 'refresh_rate': '144Hz VRR', audio: 'Dolby Atmos 2.1 channel 40W', 'ports': 'HDMI 2.1 x2, HDMI 2.0 x2, USB x2', 'connectivity': 'WiFi 6, Bluetooth 5.0, Chromecast', 'gaming': 'ALLM, VRR, AMD FreeSync Premium', 'dimensions': '1443 x 876 x 73 mm', 'brightness': '1000 nits peak' },
    theme: { ...themes.tcl, icon: '📺' },
  },
];

// ─── Seed Logic ───────────────────────────────────────────────────────────────

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB terhubung');

    // Pastikan MinIO bucket ada dan public
    const bucketExists = await minioClient.bucketExists(BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET, 'us-east-1');
      const policy = JSON.stringify({ Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }] });
      await minioClient.setBucketPolicy(BUCKET, policy);
      console.log('✅ MinIO bucket dibuat');
    } else {
      console.log('✅ MinIO bucket tersedia');
    }

    const categories = await Category.find({});
    const catMap = {};
    for (const c of categories) catMap[c.slug] = c._id;

    console.log(`\n📂 Kategori ditemukan: ${Object.keys(catMap).join(', ')}\n`);

    let created = 0;
    let skipped = 0;

    for (const def of productDefs) {
      const existing = await Product.findOne({ name: def.name });
      if (existing) {
        console.log(`⏭️  Skip (sudah ada): ${def.name}`);
        skipped++;
        continue;
      }

      const catId = catMap[def.categorySlug];
      if (!catId) {
        console.warn(`⚠️  Kategori '${def.categorySlug}' tidak ditemukan, skip.`);
        continue;
      }

      console.log(`\n🔧 Membuat: ${def.name}`);

      // Upload 2 gambar per produk (tampak depan + samping)
      const angleLabels = ['Front View', 'Side View'];
      const angleBg = [
        { bg1: def.theme.bg1, bg2: def.theme.bg2 },
        { bg1: def.theme.bg2, bg2: def.theme.bg1 },
      ];

      const images = await uploadProductImages(def.slug, [
        makeSVG({ ...angleBg[0], icon: def.theme.icon, brand: def.brand, label: def.name }),
        makeSVG({ ...angleBg[1], icon: def.theme.icon, brand: def.brand, label: angleLabels[1] }),
      ]);

      const product = await Product.create({
        name: def.name,
        brand: def.brand,
        category: catId,
        price: def.price,
        originalPrice: def.originalPrice || undefined,
        stock: def.stock,
        images,
        isFeatured: def.isFeatured,
        description: def.description,
        specifications: new Map(Object.entries(def.specs)),
        tags: def.tags,
        isActive: true,
        metaTitle: `${def.name} - Harga & Spesifikasi`,
        metaDescription: def.description.slice(0, 160),
      });

      console.log(`  ✅ Tersimpan: ${product.name} (${product._id})`);
      console.log(`  💰 Harga: Rp ${def.price.toLocaleString('id-ID')}`);
      console.log(`  🖼️  Gambar: ${images.length} file di MinIO`);
      created++;
    }

    console.log(`\n${'─'.repeat(55)}`);
    console.log(`✅ Selesai! ${created} produk baru dibuat, ${skipped} dilewati.`);
    console.log(`📦 Total produk di DB: ${await Product.countDocuments()}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();

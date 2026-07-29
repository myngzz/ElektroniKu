/**
 * Seed tambahan: semua HP dan Laptop populer
 * Usage: node seed-more-products.js
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

function makeSVG({ bg1, bg2, icon, brand, label }) {
  const short = label.length > 28 ? label.slice(0, 28) + '…' : label;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg1}"/>
      <stop offset="100%" style="stop-color:${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect x="60" y="60" width="680" height="480" fill="rgba(255,255,255,0.08)" rx="24"/>
  <text x="400" y="240" font-size="130" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="400" y="355" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">${brand.toUpperCase()}</text>
  <text x="400" y="400" font-family="system-ui,sans-serif" font-size="22" font-weight="500" fill="white" text-anchor="middle">${short}</text>
</svg>`);
}

async function uploadImg(slug, idx, svgBuf) {
  const name = `${slug}-${idx}.svg`;
  await minioClient.putObject(BUCKET, name, svgBuf, svgBuf.length, { 'Content-Type': 'image/svg+xml' });
  return `${MINIO_URL}/${BUCKET}/${name}`;
}

const T = {
  samsung:   { bg1: '#1428A0', bg2: '#0070C0' },
  apple:     { bg1: '#1c1c1e', bg2: '#3a3a3c' },
  xiaomi:    { bg1: '#FF6900', bg2: '#E30000' },
  poco:      { bg1: '#F5C518', bg2: '#C8A000' },
  oppo:      { bg1: '#1A1A2E', bg2: '#16213E' },
  realme:    { bg1: '#FFD700', bg2: '#FF8C00' },
  vivo:      { bg1: '#415FFF', bg2: '#0B21A8' },
  motorola:  { bg1: '#0076CE', bg2: '#004A8F' },
  oneplus:   { bg1: '#F5010C', bg2: '#A30000' },
  nokia:     { bg1: '#005AFF', bg2: '#003DB3' },
  infinix:   { bg1: '#C10707', bg2: '#8A0000' },
  tecno:     { bg1: '#3B82F6', bg2: '#1D4ED8' },
  asus:      { bg1: '#00539C', bg2: '#EEA47F' },
  lenovo:    { bg1: '#E2231A', bg2: '#4B4B4B' },
  dell:      { bg1: '#007DB8', bg2: '#004C97' },
  hp:        { bg1: '#0096D6', bg2: '#005A8B' },
  msi:       { bg1: '#CC0000', bg2: '#8B0000' },
  razer:     { bg1: '#00FF41', bg2: '#007A1E' },
  gigabyte:  { bg1: '#E31837', bg2: '#9B0000' },
  microsoft: { bg1: '#F25022', bg2: '#7FBA00' },
  samsung_b: { bg1: '#1428A0', bg2: '#0070C0' },
};

const products = [
  // ══════════════════════════════════════════════════════════
  //  SMARTPHONE TAMBAHAN
  // ══════════════════════════════════════════════════════════
  {
    slug: 'samsung-galaxy-s24-fe',
    name: 'Samsung Galaxy S24 FE',
    brand: 'Samsung', price: 7999000, originalPrice: 8999000, stock: 45,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['samsung', 'fan-edition', 'android', '5g', 'exynos'],
    description: 'Samsung Galaxy S24 FE adalah Fan Edition dari Galaxy S24 series yang menghadirkan fitur flagship dengan harga lebih terjangkau. Hadir dengan Exynos 2500, layar Dynamic AMOLED 6.7" 120Hz, dan kamera 50MP AI.',
    specs: { cpu: 'Exynos 2500 (3nm)', ram: '8', storage: '128', battery: '4700', display: '6.7" Dynamic AMOLED 2X 120Hz FHD+', camera: '50', os: 'Android 14 / One UI 6.1', network: '5G', charging: '25W Fast Charging', dimensions: '162.1 x 77.3 x 8.0 mm', weight: '213g', water_resistance: 'IP68', front_camera: '10MP', nfc: 'Ya' },
    theme: { ...T.samsung, icon: '📱' },
  },
  {
    slug: 'samsung-galaxy-z-fold6',
    name: 'Samsung Galaxy Z Fold6',
    brand: 'Samsung', price: 31999000, originalPrice: 34999000, stock: 10,
    isFeatured: true, categorySlug: 'smartphone',
    tags: ['samsung', 'foldable', 'android', '5g', 'fold', 'premium'],
    description: 'Samsung Galaxy Z Fold6 adalah smartphone lipat terdepan dengan layar cover 6.3" dan layar dalam 7.6" Flex Window, Snapdragon 8 Gen 3, S Pen opsional, Galaxy AI on-device, dan desain titanium yang lebih tipis.',
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12', storage: '256', battery: '4400', display: '7.6" Foldable AMOLED 120Hz (main) + 6.3" cover', camera: '50', os: 'Android 14 / One UI 6.1.1', network: '5G', charging: '25W wired + 15W wireless', dimensions: '68.1 x 132.6 x 12.1 mm (folded)', weight: '239g', water_resistance: 'IPX8', front_camera: '10MP cover + 4MP under-display', nfc: 'Ya', hinge: 'Armor Aluminum Flexlock hinge' },
    theme: { ...T.samsung, icon: '📱' },
  },
  {
    slug: 'samsung-galaxy-z-flip6',
    name: 'Samsung Galaxy Z Flip6',
    brand: 'Samsung', price: 16999000, originalPrice: 18499000, stock: 18,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['samsung', 'foldable', 'android', '5g', 'flip', 'compact'],
    description: 'Samsung Galaxy Z Flip6 adalah flip phone lipat terkompak dengan Snapdragon 8 Gen 3, FlexWindow 3.4" lebih besar untuk widget & notifikasi, kamera 50MP dengan AI, dan baterai 4000mAh lebih besar.',
    specs: { cpu: 'Snapdragon 8 Gen 3', ram: '12', storage: '256', battery: '4000', display: '6.7" FHD+ Dynamic AMOLED 120Hz (main) + 3.4" FlexWindow', camera: '50', os: 'Android 14 / One UI 6.1.1', network: '5G', charging: '25W wired + 15W wireless', dimensions: '85.1 x 71.9 x 14.9 mm (folded)', weight: '187g', water_resistance: 'IPX8', front_camera: '10MP', nfc: 'Ya', hinge: 'Flex Hinge Armor Aluminum' },
    theme: { ...T.samsung, icon: '📱' },
  },
  {
    slug: 'xiaomi-redmi-note-13-pro-plus',
    name: 'Xiaomi Redmi Note 13 Pro+',
    brand: 'Xiaomi', price: 4999000, originalPrice: 5499000, stock: 70,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['xiaomi', 'redmi', 'midrange', 'android', '5g', 'fast-charging'],
    description: 'Xiaomi Redmi Note 13 Pro+ menghadirkan kamera 200MP flagship, pengisian 120W HyperCharge dalam 19 menit, layar AMOLED 1.5K 120Hz, IP68, dan chip MediaTek Dimensity 7200 Ultra untuk mid-range terkuat.',
    specs: { cpu: 'MediaTek Dimensity 7200 Ultra', ram: '12', storage: '256', battery: '5000', display: '6.67" AMOLED 1.5K 120Hz 1800 nits', camera: '200', os: 'Android 13 / HyperOS', network: '5G', charging: '120W HyperCharge (full in 19 menit)', dimensions: '161.4 x 74.2 x 8.9 mm', weight: '204g', water_resistance: 'IP68', front_camera: '16MP', nfc: 'Ya', ois: 'OIS optical stabilization' },
    theme: { ...T.xiaomi, icon: '📱' },
  },
  {
    slug: 'xiaomi-redmi-12c',
    name: 'Xiaomi Redmi 12C',
    brand: 'Xiaomi', price: 1799000, originalPrice: 1999000, stock: 120,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['xiaomi', 'redmi', 'budget', 'android', 'entry-level'],
    description: 'Xiaomi Redmi 12C adalah smartphone entry-level terjangkau dengan baterai jumbo 5000mAh, layar HD+ 6.71", kamera 50MP, dan chip MediaTek Helio G85 yang cukup untuk kebutuhan sehari-hari.',
    specs: { cpu: 'MediaTek Helio G85', ram: '4', storage: '64', battery: '5000', display: '6.71" HD+ LCD 60Hz', camera: '50', os: 'Android 12 / MIUI 13', network: '4G LTE', charging: '10W', dimensions: '168.8 x 76.4 x 8.77 mm', weight: '192g', water_resistance: 'Splash resistant', front_camera: '5MP', nfc: 'Tidak' },
    theme: { ...T.xiaomi, icon: '📱' },
  },
  {
    slug: 'poco-x6-pro',
    name: 'POCO X6 Pro 5G',
    brand: 'POCO', price: 4299000, originalPrice: 4999000, stock: 55,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['poco', 'xiaomi', 'gaming', 'android', '5g', 'dimensity'],
    description: 'POCO X6 Pro hadir dengan MediaTek Dimensity 8300 Ultra untuk performa gaming gahar, layar AMOLED 120Hz 1.5K Dolby Vision, kamera 64MP OIS, dan pengisian 67W. Nilai terbaik untuk gamer.',
    specs: { cpu: 'MediaTek Dimensity 8300 Ultra (4nm)', ram: '12', storage: '256', battery: '5000', display: '6.67" AMOLED 1.5K 120Hz Dolby Vision', camera: '64', os: 'Android 14 / HyperOS', network: '5G', charging: '67W Turbo Charging', dimensions: '160.5 x 74.3 x 8.26 mm', weight: '186g', water_resistance: 'IP54', front_camera: '16MP', nfc: 'Ya', ois: 'OIS stabilization' },
    theme: { ...T.poco, icon: '📱' },
  },
  {
    slug: 'realme-gt-6',
    name: 'Realme GT 6',
    brand: 'Realme', price: 6999000, originalPrice: 7999000, stock: 35,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['realme', 'android', '5g', 'snapdragon', 'gaming'],
    description: 'Realme GT 6 adalah smartphone gaming dengan Snapdragon 8s Gen 3, layar AMOLED 6.78" 120Hz Aqua Touch untuk penggunaan basah, pengisian SuperVOOC 120W, dan sistem pendingin tiga lapis untuk gaming marathon.',
    specs: { cpu: 'Snapdragon 8s Gen 3 (4nm)', ram: '12', storage: '256', battery: '5500', display: '6.78" AMOLED 120Hz 2780x1264 4500 nits', camera: '50', os: 'Android 14 / realme UI 5.0', network: '5G', charging: '120W SuperVOOC', dimensions: '161.6 x 75.1 x 8.0 mm', weight: '199g', water_resistance: 'IP65', front_camera: '32MP', nfc: 'Ya', aqua_touch: 'Aqua Touch wet-hand operation' },
    theme: { ...T.realme, icon: '📱' },
  },
  {
    slug: 'oppo-reno-12-pro',
    name: 'OPPO Reno 12 Pro',
    brand: 'Oppo', price: 6499000, originalPrice: 6999000, stock: 40,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['oppo', 'reno', 'android', '5g', 'portrait', 'ai'],
    description: 'OPPO Reno 12 Pro menghadirkan kamera portrait AI terdepan dengan AI Eraser 2.0, chip MediaTek Dimensity 7300 Energy, layar AMOLED 120Hz, baterai 5000mAh dengan pengisian 80W SuperVOOC, dan desain vegan leather yang elegan.',
    specs: { cpu: 'MediaTek Dimensity 7300 Energy (4nm)', ram: '12', storage: '256', battery: '5000', display: '6.7" AMOLED 120Hz FHD+ 1000 nits', camera: '50', os: 'Android 14 / ColorOS 14.1', network: '5G', charging: '80W SuperVOOC', dimensions: '161.5 x 74.8 x 7.34 mm', weight: '180g', water_resistance: 'IP65', front_camera: '50MP', nfc: 'Ya', back_material: 'Vegan leather' },
    theme: { ...T.oppo, icon: '📱' },
  },
  {
    slug: 'vivo-v30-pro',
    name: 'Vivo V30 Pro 5G',
    brand: 'Vivo', price: 7999000, originalPrice: 8999000, stock: 30,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['vivo', 'android', '5g', 'zeiss', 'portrait', 'aura-light'],
    description: 'Vivo V30 Pro 5G menggabungkan kamera ZEISS portrait terdepan dengan Aura Light System 3.0, layar AMOLED 3D Curved 120Hz, chip Snapdragon 7 Gen 3, dan baterai 5000mAh dengan FlashCharge 80W.',
    specs: { cpu: 'Snapdragon 7 Gen 3 (4nm)', ram: '12', storage: '256', battery: '5000', display: '6.78" AMOLED 3D Curved 120Hz FHD+', camera: '50', os: 'Android 14 / OriginOS 4', network: '5G', charging: '80W FlashCharge', dimensions: '164.4 x 75.0 x 7.46 mm', weight: '186g', water_resistance: 'IP64', front_camera: '50MP', nfc: 'Ya', partnership: 'ZEISS T* Optics', aura_light: 'Aura Light System 3.0' },
    theme: { ...T.vivo, icon: '📱' },
  },
  {
    slug: 'oneplus-13',
    name: 'OnePlus 13',
    brand: 'OnePlus', price: 14999000, originalPrice: 15999000, stock: 20,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['oneplus', 'android', '5g', 'hasselblad', 'snapdragon', 'fast-charging'],
    description: 'OnePlus 13 hadir dengan Snapdragon 8 Elite, kamera Hasselblad terkalibrasi, layar AMOLED 6.82" LTPO 1-120Hz 4500 nits, baterai 6000mAh TITAN terbesar, dan pengisian 100W SUPERVOOC ultra-cepat.',
    specs: { cpu: 'Snapdragon 8 Elite (3nm)', ram: '16', storage: '512', battery: '6000', display: '6.82" LTPO AMOLED 1-120Hz 2K 4500 nits', camera: '50', os: 'Android 15 / OxygenOS 15', network: '5G', charging: '100W SUPERVOOC + 50W wireless', dimensions: '162.9 x 76.5 x 8.9 mm', weight: '210g', water_resistance: 'IP69', front_camera: '32MP', nfc: 'Ya', partnership: 'Hasselblad Pro Camera', ram_type: 'LPDDR5T' },
    theme: { bg1: '#F5010C', bg2: '#A30000', icon: '📱' },
  },
  {
    slug: 'motorola-edge-50-pro',
    name: 'Motorola Edge 50 Pro',
    brand: 'Motorola', price: 5999000, originalPrice: 6499000, stock: 28,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['motorola', 'android', '5g', 'clean-android', 'oled'],
    description: 'Motorola Edge 50 Pro menghadirkan Android hampir murni dengan Snapdragon 7 Gen 3, layar pOLED 144Hz, pengisian 125W TurboPower super cepat (4 menit = 9 jam), dan kamera 50MP dengan OIS.',
    specs: { cpu: 'Snapdragon 7 Gen 3 (4nm)', ram: '12', storage: '256', battery: '4500', display: '6.7" pOLED 144Hz FHD+ HDR10+', camera: '50', os: 'Android 14 near-stock', network: '5G', charging: '125W TurboPower (4 menit = 9 jam)', dimensions: '161.2 x 73.0 x 8.2 mm', weight: '186g', water_resistance: 'IP68', front_camera: '50MP', nfc: 'Ya', ois: 'Optical Image Stabilization', back_material: 'Vegan leather wood texture' },
    theme: { ...T.motorola, icon: '📱' },
  },
  {
    slug: 'infinix-note-40-pro',
    name: 'Infinix Note 40 Pro+ 5G',
    brand: 'Infinix', price: 3299000, originalPrice: 3799000, stock: 60,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['infinix', 'budget', 'android', '5g', 'magnetic-charging'],
    description: 'Infinix Note 40 Pro+ 5G adalah smartphone budget terlengkap dengan MagCharge 20W wireless, kamera 108MP, chip Dimensity 7020, layar AMOLED 120Hz, dan baterai 4600mAh dengan pengisian 68W.',
    specs: { cpu: 'MediaTek Dimensity 7020 (6nm)', ram: '12', storage: '256', battery: '4600', display: '6.78" AMOLED 120Hz FHD+', camera: '108', os: 'Android 14 / XOS 14', network: '5G', charging: '68W All-Round FastCharge + 20W MagCharge', dimensions: '163.6 x 76.0 x 7.99 mm', weight: '188g', water_resistance: 'IP54', front_camera: '16MP', nfc: 'Ya', mag_charge: 'MagCharge 20W wireless' },
    theme: { ...T.infinix, icon: '📱' },
  },
  {
    slug: 'tecno-phantom-v-fold2',
    name: 'Tecno Phantom V Fold2 5G',
    brand: 'Tecno', price: 13999000, originalPrice: 15499000, stock: 8,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['tecno', 'foldable', 'android', '5g', 'fold', 'value'],
    description: 'Tecno Phantom V Fold2 5G adalah smartphone lipat terjangkau dengan layar dalam 7.85" dan layar luar 6.42", chip Dimensity 9000+, kamera 50MP Hasselblad, dan baterai 5750mAh dengan pengisian 45W.',
    specs: { cpu: 'MediaTek Dimensity 9000+ (4nm)', ram: '12', storage: '512', battery: '5750', display: '7.85" LTPO AMOLED 120Hz (main) + 6.42" cover', camera: '50', os: 'Android 14 / HiOS 14', network: '5G', charging: '45W wired + 15W wireless', dimensions: '80.8 x 158.6 x 11.4 mm (folded)', weight: '255g', water_resistance: 'IPX4', front_camera: '32MP', nfc: 'Ya', partnership: 'Hasselblad Colour Calibration' },
    theme: { ...T.tecno, icon: '📱' },
  },
  {
    slug: 'nokia-g60-5g',
    name: 'Nokia G60 5G',
    brand: 'Nokia', price: 3499000, originalPrice: 3999000, stock: 35,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['nokia', 'android', '5g', 'clean-android', 'durable', 'budget'],
    description: 'Nokia G60 5G menawarkan Android terbaru 3 tahun update, bodi daur ulang 100% dari plastik daur ulang, Snapdragon 695 5G yang efisien, baterai 4500mAh, dan ketahanan tinggi untuk pengguna aktif.',
    specs: { cpu: 'Snapdragon 695 5G (6nm)', ram: '6', storage: '128', battery: '4500', display: '6.58" IPS LCD 120Hz FHD+', camera: '50', os: 'Android 12 (update 3 tahun)', network: '5G', charging: '20W', dimensions: '166.7 x 75.9 x 8.59 mm', weight: '190g', water_resistance: 'IP52', front_camera: '8MP', nfc: 'Ya', eco: '100% recycled material' },
    theme: { ...T.nokia, icon: '📱' },
  },
  {
    slug: 'samsung-galaxy-a35',
    name: 'Samsung Galaxy A35 5G',
    brand: 'Samsung', price: 4299000, originalPrice: 4799000, stock: 80,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['samsung', 'galaxy-a', 'midrange', 'android', '5g'],
    description: 'Samsung Galaxy A35 5G adalah mid-range solid dengan layar Super AMOLED 120Hz, chip Exynos 1380, triple kamera 50+8+5MP, baterai 5000mAh, IP67, dan 4 tahun update OS dari Samsung.',
    specs: { cpu: 'Exynos 1380 (5nm)', ram: '8', storage: '128', battery: '5000', display: '6.6" Super AMOLED 120Hz FHD+', camera: '50', os: 'Android 14 / One UI 6.1', network: '5G', charging: '25W Fast Charging', dimensions: '161.7 x 78.0 x 8.2 mm', weight: '210g', water_resistance: 'IP67', front_camera: '13MP', nfc: 'Ya', os_update: '4 tahun update OS' },
    theme: { ...T.samsung, icon: '📱' },
  },
  {
    slug: 'xiaomi-poco-m6-pro',
    name: 'POCO M6 Pro 5G',
    brand: 'POCO', price: 2599000, originalPrice: 2999000, stock: 95,
    isFeatured: false, categorySlug: 'smartphone',
    tags: ['poco', 'xiaomi', 'budget', 'android', '5g', 'entry-level'],
    description: 'POCO M6 Pro 5G adalah pilihan budget 5G terbaik dengan chip Dimensity 6080, layar IPS 90Hz FHD+, kamera 64MP, baterai 5000mAh 18W, dan harga yang sangat terjangkau.',
    specs: { cpu: 'MediaTek Dimensity 6080 (6nm)', ram: '8', storage: '256', battery: '5000', display: '6.67" IPS LCD 90Hz FHD+', camera: '64', os: 'Android 13 / HyperOS', network: '5G', charging: '18W', dimensions: '166.0 x 76.3 x 8.3 mm', weight: '204g', water_resistance: 'IP53', front_camera: '16MP', nfc: 'Tidak' },
    theme: { ...T.poco, icon: '📱' },
  },

  // ══════════════════════════════════════════════════════════
  //  LAPTOP TAMBAHAN
  // ══════════════════════════════════════════════════════════
  {
    slug: 'asus-tuf-gaming-f15',
    name: 'ASUS TUF Gaming F15 FX507',
    brand: 'ASUS', price: 13999000, originalPrice: 15999000, stock: 25,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['asus', 'tuf', 'gaming', 'laptop', 'rtx', 'value-gaming'],
    description: 'ASUS TUF Gaming F15 adalah laptop gaming tahan banting dengan sertifikasi MIL-SPEC, Intel Core i7-13620H, RTX 4070 Laptop, layar IPS 144Hz, dan sistem pendingin ROG untuk gaming marathon.',
    specs: { cpu: 'Intel Core i7-13620H (10-core)', ram: '16', storage: '512', gpu: 'NVIDIA GeForce RTX 4070 Laptop 8GB', display: '15.6" IPS FHD 144Hz 3ms 100% sRGB', battery: '90', weight: '2.2', os: 'Windows 11 Home', cooling: 'Dual fan + 4 heat pipes ROG', keyboard: 'Backlit WASD per-zone RGB', ports: 'Thunderbolt 4, USB-A x2, HDMI 2.1, RJ45, SD', wifi: 'Wi-Fi 6', mil_spec: 'MIL-STD-810H certified' },
    theme: { ...T.asus, icon: '💻' },
  },
  {
    slug: 'lenovo-legion-5-pro',
    name: 'Lenovo Legion 5 Pro Gen 8',
    brand: 'Lenovo', price: 23999000, originalPrice: 26999000, stock: 12,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['lenovo', 'legion', 'gaming', 'laptop', 'rtx', 'amd'],
    description: 'Lenovo Legion 5 Pro Gen 8 adalah laptop gaming premium dengan AMD Ryzen 9 7945HX, RTX 4070 Ti Laptop, layar IPS 2560x1600 165Hz 100% sRGB, sistem pendingin Legion Coldfront 5.0, dan desain industrial yang kokoh.',
    specs: { cpu: 'AMD Ryzen 9 7945HX (16-core)', ram: '32', storage: '1000', gpu: 'NVIDIA GeForce RTX 4070 Ti Laptop 12GB', display: '16" IPS WQXGA 2560x1600 165Hz 100% sRGB', battery: '80', weight: '2.4', os: 'Windows 11 Home', cooling: 'Legion Coldfront 5.0 dual fan', keyboard: 'TrueStrike backlit full-size numpad', ports: 'Thunderbolt 4 x2, USB-A x4, HDMI 2.1, RJ45', wifi: 'Wi-Fi 6E', ram_type: 'DDR5 4800MHz' },
    theme: { ...T.lenovo, icon: '💻' },
  },
  {
    slug: 'asus-zenbook-14-oled',
    name: 'ASUS Zenbook 14 OLED UX3405',
    brand: 'ASUS', price: 17999000, originalPrice: 19999000, stock: 20,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['asus', 'zenbook', 'oled', 'ultrabook', 'creator', 'thin'],
    description: 'ASUS Zenbook 14 OLED adalah ultrabook premium tipis dengan Intel Core Ultra 9 185H, layar OLED 2.8K 120Hz 100% DCI-P3, Intel Arc Graphics, dan chassis aluminium hanya 1.2 kg. Ideal untuk kreator konten.',
    specs: { cpu: 'Intel Core Ultra 9 185H (16-core)', ram: '32', storage: '1000', gpu: 'Intel Arc Graphics terintegrasi', display: '14" OLED 2.8K 2880x1800 120Hz 100% DCI-P3', battery: '75', weight: '1.2', os: 'Windows 11 Pro', cooling: 'IceCool thermal system', keyboard: 'Backlit dengan fingerprint', ports: 'Thunderbolt 4 x2, USB-A x2, HDMI, SD reader', wifi: 'Wi-Fi 6E', oled_cert: 'OLED 100% DCI-P3 PANTONE certified' },
    theme: { ...T.asus, icon: '💻' },
  },
  {
    slug: 'lenovo-ideapad-slim-5',
    name: 'Lenovo IdeaPad Slim 5i Gen 9',
    brand: 'Lenovo', price: 9999000, originalPrice: 11499000, stock: 40,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['lenovo', 'ideapad', 'everyday', 'laptop', 'intel', 'value'],
    description: 'Lenovo IdeaPad Slim 5i Gen 9 adalah laptop everyday terbaik dengan Intel Core Ultra 5, layar IPS 14" 300 nits, SSD PCIe 4.0, baterai 60Wh yang tahan lama, dan harga value yang kompetitif.',
    specs: { cpu: 'Intel Core Ultra 5 125U', ram: '16', storage: '512', gpu: 'Intel Graphics terintegrasi', display: '14" IPS FHD 300 nits 100% sRGB', battery: '60', weight: '1.46', os: 'Windows 11 Home', cooling: 'Single fan', keyboard: 'Backlit chicklet', ports: 'Thunderbolt 4, USB-A x2, HDMI, SD reader, 3.5mm', wifi: 'Wi-Fi 6', ram_type: 'LPDDR5 terintegrasi' },
    theme: { ...T.lenovo, icon: '💻' },
  },
  {
    slug: 'msi-thin-15-b12u',
    name: 'MSI Thin 15 B12U Gaming',
    brand: 'MSI', price: 11999000, originalPrice: 13499000, stock: 22,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['msi', 'gaming', 'laptop', 'rtx', 'thin', 'budget-gaming'],
    description: 'MSI Thin 15 adalah laptop gaming slim terjangkau dengan RTX 4060, Intel Core i7-12650H, layar IPS 144Hz FHD, dan chassis tipis hanya 1.86 kg. Performa gaming serius dalam form factor tipis.',
    specs: { cpu: 'Intel Core i7-12650H (10-core)', ram: '16', storage: '512', gpu: 'NVIDIA GeForce RTX 4060 Laptop 8GB', display: '15.6" IPS FHD 144Hz 45% NTSC', battery: '52.4', weight: '1.86', os: 'Windows 11 Home', cooling: 'Cooler Boost 5 dual fan', keyboard: 'SteelSeries backlit', ports: 'USB-C 3.2, USB-A x3, HDMI 2.0b, RJ45', wifi: 'Wi-Fi 6E', ram_type: 'DDR4 3200MHz' },
    theme: { ...T.msi, icon: '💻' },
  },
  {
    slug: 'dell-inspiron-15-3530',
    name: 'Dell Inspiron 15 3530',
    brand: 'Dell', price: 8499000, originalPrice: 9499000, stock: 35,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['dell', 'inspiron', 'everyday', 'laptop', 'value', 'student'],
    description: 'Dell Inspiron 15 3530 adalah laptop all-around untuk pelajar dan profesional dengan Intel Core i5-1335U, layar IPS Anti-Glare 120Hz, SSD PCIe, baterai 54Wh, dan dukungan upgrade mudah.',
    specs: { cpu: 'Intel Core i5-1335U (10-core)', ram: '16', storage: '512', gpu: 'Intel Iris Xe Graphics', display: '15.6" IPS FHD 120Hz Anti-Glare', battery: '54', weight: '1.69', os: 'Windows 11 Home', cooling: 'Single fan', keyboard: 'Backlit', ports: 'USB-C, USB-A x2, HDMI 1.4, SD reader, RJ45', wifi: 'Wi-Fi 6', ram_type: 'DDR4 3200MHz upgradeable' },
    theme: { ...T.dell, icon: '💻' },
  },
  {
    slug: 'hp-pavilion-gaming-15',
    name: 'HP Pavilion Gaming 15-dk2038TX',
    brand: 'HP', price: 12499000, originalPrice: 13999000, stock: 18,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['hp', 'pavilion', 'gaming', 'laptop', 'rtx', 'value'],
    description: 'HP Pavilion Gaming 15 adalah laptop gaming entry-level solid dengan Intel Core i7-11370H, RTX 3050 Ti, layar IPS 144Hz, dan desain gaming modern. Pilihan gaming terjangkau dari HP.',
    specs: { cpu: 'Intel Core i7-11370H (4-core)', ram: '16', storage: '512', gpu: 'NVIDIA GeForce RTX 3050 Ti 4GB', display: '15.6" IPS FHD 144Hz', battery: '52.5', weight: '2.23', os: 'Windows 11 Home', cooling: 'Dual fan', keyboard: 'Backlit WASD', ports: 'USB-C, USB-A x3, HDMI 2.0, SD reader', wifi: 'Wi-Fi 6', ram_type: 'DDR4 8GB x2' },
    theme: { ...T.hp, icon: '💻' },
  },
  {
    slug: 'microsoft-surface-laptop-5',
    name: 'Microsoft Surface Laptop 5 13.5"',
    brand: 'Microsoft', price: 19999000, originalPrice: 21999000, stock: 10,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['microsoft', 'surface', 'ultrabook', 'windows', 'premium', 'touchscreen'],
    description: 'Microsoft Surface Laptop 5 adalah ultrabook premium dengan layar PixelSense Touch 2256x1504, Intel Core i7-1265U, desain alcantara/aluminium elegan, Thunderbolt 4, dan Windows Hello face unlock.',
    specs: { cpu: 'Intel Core i7-1265U (10-core)', ram: '16', storage: '512', gpu: 'Intel Iris Xe Graphics', display: '13.5" PixelSense Touch 2256x1504 120Hz', battery: '47.4', weight: '1.29', os: 'Windows 11 Home', cooling: 'Passive/active hybrid', keyboard: 'Alcantara fabric backlit', ports: 'Thunderbolt 4, USB-A, Surface Connect, 3.5mm', wifi: 'Wi-Fi 6', hello: 'Windows Hello Face + Fingerprint' },
    theme: { ...T.microsoft, icon: '💻' },
  },
  {
    slug: 'razer-blade-15',
    name: 'Razer Blade 15 (2024)',
    brand: 'Razer', price: 39999000, originalPrice: 43999000, stock: 5,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['razer', 'gaming', 'laptop', 'rtx', 'premium', 'oled'],
    description: 'Razer Blade 15 2024 adalah laptop gaming premium paling tipis dengan Intel Core i9-14900HX, RTX 4080 Laptop, layar OLED 2K 240Hz, chassis CNC aluminium hitam matte, dan Razer Chroma RGB per-key.',
    specs: { cpu: 'Intel Core i9-14900HX (24-core)', ram: '32', storage: '1000', gpu: 'NVIDIA GeForce RTX 4080 Laptop 12GB', display: '15.6" OLED QHD 2560x1440 240Hz 100% DCI-P3', battery: '80', weight: '2.01', os: 'Windows 11 Pro', cooling: 'Vapor chamber cooling', keyboard: 'Razer Chroma RGB per-key backlit', ports: 'Thunderbolt 4 x4, USB-A x2, SD, HDMI 2.1', wifi: 'Wi-Fi 6E', chassis: 'CNC Aluminum anodized matte black' },
    theme: { ...T.razer, icon: '💻' },
  },
  {
    slug: 'gigabyte-aorus-15x',
    name: 'Gigabyte Aorus 15X AXF',
    brand: 'Gigabyte', price: 29999000, originalPrice: 32999000, stock: 8,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['gigabyte', 'aorus', 'gaming', 'laptop', 'rtx', 'amd', 'esports'],
    description: 'Gigabyte Aorus 15X adalah laptop gaming esports dengan AMD Ryzen 9 7945HX, RTX 4080, layar AMOLED 2K 165Hz 100% DCI-P3, DTS:X Ultra audio, dan sistem pendingin Windforce Infinity 4 fan.',
    specs: { cpu: 'AMD Ryzen 9 7945HX (16-core)', ram: '32', storage: '2000', gpu: 'NVIDIA GeForce RTX 4080 Laptop 12GB', display: '15.6" AMOLED QHD 2560x1440 165Hz 100% DCI-P3', battery: '99', weight: '2.3', os: 'Windows 11 Pro', cooling: 'Windforce Infinity 4 fan system', keyboard: 'Per-key RGB backlit', ports: 'Thunderbolt 4, USB-A x3, HDMI 2.1, SD, RJ45', wifi: 'Wi-Fi 6E', ram_type: 'DDR5 5600MHz' },
    theme: { ...T.gigabyte, icon: '💻' },
  },
  {
    slug: 'hp-elitebook-840-g10',
    name: 'HP EliteBook 840 G10',
    brand: 'HP', price: 24999000, originalPrice: 27999000, stock: 8,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['hp', 'elitebook', 'business', 'laptop', 'ultrabook', 'enterprise'],
    description: 'HP EliteBook 840 G10 adalah laptop bisnis enterprise-grade dengan Intel vPro, HP Wolf Security, sertifikasi MIL-SPEC, layar Sure View Reflect anti-spy opsional, dan HP Sure Start BIOS recovery.',
    specs: { cpu: 'Intel Core i7-1360P vPro (12-core)', ram: '32', storage: '1000', gpu: 'Intel Iris Xe Graphics', display: '14" IPS FHD 1000 nits + Sure View opsional', battery: '51', weight: '1.37', os: 'Windows 11 Pro', cooling: 'Dual fan', keyboard: 'Backlit spill-resistant', ports: 'Thunderbolt 4 x2, USB-A x2, HDMI 2.0, SD, RJ45', wifi: 'Wi-Fi 6E', security: 'HP Wolf Security, vPro, TPM 2.0, IR camera', mil_spec: 'MIL-STD-810H' },
    theme: { ...T.hp, icon: '💻' },
  },
  {
    slug: 'samsung-galaxy-book4-pro',
    name: 'Samsung Galaxy Book4 Pro 14"',
    brand: 'Samsung', price: 21999000, originalPrice: 23999000, stock: 12,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['samsung', 'galaxy-book', 'amoled', 'ultrabook', 'intel-arc'],
    description: 'Samsung Galaxy Book4 Pro hadir dengan layar Dynamic AMOLED 2X 120Hz 3K ultra-cemerlang, Intel Core Ultra 7 155H, Intel Arc Graphics, terintegrasi penuh ekosistem Galaxy lewat Galaxy AI, dan chassis tipis 1.24 kg.',
    specs: { cpu: 'Intel Core Ultra 7 155H (16-core)', ram: '16', storage: '512', gpu: 'Intel Arc Graphics', display: '14" Dynamic AMOLED 2X 2880x1800 120Hz 500 nits', battery: '63', weight: '1.24', os: 'Windows 11 Home', cooling: 'Single fan', keyboard: 'Backlit premium', ports: 'Thunderbolt 4 x2, USB-A, HDMI 2.0, microSD', wifi: 'Wi-Fi 6E', galaxy_ai: 'Galaxy AI ecosystem integration' },
    theme: { ...T.samsung_b, icon: '💻' },
  },
  {
    slug: 'asus-vivobook-16x-oled',
    name: 'ASUS Vivobook 16X OLED M3606',
    brand: 'ASUS', price: 13999000, originalPrice: 15499000, stock: 30,
    isFeatured: false, categorySlug: 'laptop',
    tags: ['asus', 'vivobook', 'oled', 'laptop', 'amd', 'creator'],
    description: 'ASUS Vivobook 16X OLED menghadirkan layar OLED 16" 3.2K 120Hz dengan 100% DCI-P3 PANTONE certified, AMD Ryzen 7 7745HX, NVIDIA RTX 4060, dan harga mid-range. Pilihan terbaik kreator dengan budget terbatas.',
    specs: { cpu: 'AMD Ryzen 7 7745HX (8-core)', ram: '16', storage: '512', gpu: 'NVIDIA GeForce RTX 4060 Laptop 8GB', display: '16" OLED 3.2K 3200x2000 120Hz 100% DCI-P3', battery: '96', weight: '1.88', os: 'Windows 11 Home', cooling: 'IceCool+ thermal', keyboard: 'Backlit', ports: 'USB-C, USB-A x3, HDMI 2.0b, SD reader', wifi: 'Wi-Fi 6E', oled_cert: 'PANTONE Validated, TÜV Rheinland' },
    theme: { ...T.asus, icon: '💻' },
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB terhubung');

    const categories = await Category.find({});
    const catMap = {};
    for (const c of categories) catMap[c.slug] = c._id;

    let created = 0, skipped = 0;

    for (const def of products) {
      const exists = await Product.findOne({ name: def.name });
      if (exists) { process.stdout.write(`⏭️  Skip: ${def.name}\n`); skipped++; continue; }

      const catId = catMap[def.categorySlug];
      if (!catId) { console.warn(`⚠️  Kategori '${def.categorySlug}' tidak ada, skip.`); continue; }

      process.stdout.write(`🔧 ${def.name} ... `);

      const icon = def.theme.icon;
      const imgUrls = await Promise.all([1, 2].map(async (i) => {
        const flip = i === 2 ? { bg1: def.theme.bg2, bg2: def.theme.bg1 } : def.theme;
        const buf = makeSVG({ ...flip, icon, brand: def.brand, label: def.name });
        return uploadImg(def.slug, i, buf);
      }));

      await Product.create({
        name: def.name, brand: def.brand, category: catId,
        price: def.price, originalPrice: def.originalPrice || undefined,
        stock: def.stock, images: imgUrls, isFeatured: def.isFeatured,
        description: def.description,
        specifications: new Map(Object.entries(def.specs)),
        tags: def.tags, isActive: true,
        metaTitle: `${def.name} - Harga & Spesifikasi`,
        metaDescription: def.description.slice(0, 160),
      });

      process.stdout.write(`✅ Rp ${def.price.toLocaleString('id-ID')}\n`);
      created++;
    }

    const total = await Product.countDocuments();
    const byCategory = await Product.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log(`\n${'─'.repeat(55)}`);
    console.log(`✅ Selesai! ${created} produk baru, ${skipped} dilewati.`);
    console.log(`📦 Total: ${total} produk di DB`);
    console.log('\nPer kategori:');
    for (const g of byCategory) console.log(`  ${g._id}: ${g.count} produk`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();

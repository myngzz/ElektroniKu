/**
 * Seed ekspansi: +60 produk untuk Xiaomi, Samsung, ASUS, Huawei, OPPO, Vivo, dll
 * Usage: node seed-expanded.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku?authSource=admin';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  const cats = {};
  const allCats = await Category.find({});
  allCats.forEach(c => { cats[c.slug] = c._id; });

  const products = [
    // ─────────────── SMARTPHONE — Xiaomi ───────────────
    {
      name: 'Xiaomi 14',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 8999000, originalPrice: 9999000, stock: 40,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14.jpg'],
      isFeatured: true,
      specifications: { layar: '6.36" AMOLED 2K 120Hz', cpu: 'Snapdragon 8 Gen 3', ram: '12', storage: '256', kamera_belakang: '50MP Leica triple', kamera_depan: '32MP', baterai: '4610mAh', os: 'MIUI 15 (Android 14)' },
      description: 'Xiaomi 14 hadir dengan Snapdragon 8 Gen 3, kamera Leica 50MP, dan layar AMOLED 2K 120Hz dalam desain kompak premium.',
      tags: ['xiaomi', 'flagship', 'leica', 'snapdragon'],
    },
    {
      name: 'Xiaomi 13T Pro',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 7499000, originalPrice: 8499000, stock: 35,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg'],
      specifications: { layar: '6.67" AMOLED 144Hz', cpu: 'Dimensity 9200+', ram: '12', storage: '256', kamera_belakang: '50MP Leica triple', kamera_depan: '20MP', baterai: '5000mAh', os: 'MIUI 14 (Android 13)' },
      description: 'Xiaomi 13T Pro didukung Dimensity 9200+ dengan kamera Leica triple dan pengisian cepat 120W HyperCharge.',
      tags: ['xiaomi', 'leica', 'dimensity', 'fast-charging'],
    },
    {
      name: 'Xiaomi 12 Pro',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 6499000, originalPrice: 7999000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-12-pro.jpg'],
      specifications: { layar: '6.73" AMOLED 2K 120Hz', cpu: 'Snapdragon 8 Gen 1', ram: '12', storage: '256', kamera_belakang: '50MP triple', kamera_depan: '32MP', baterai: '4600mAh', os: 'MIUI 13 (Android 12)' },
      description: 'Xiaomi 12 Pro dengan layar 2K 120Hz, Snapdragon 8 Gen 1, dan sistem kamera 50MP triple Leica.',
      tags: ['xiaomi', 'flagship', 'snapdragon'],
    },
    {
      name: 'Redmi Note 13 Pro 5G',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 3999000, originalPrice: 4499000, stock: 60,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-5g.jpg'],
      specifications: { layar: '6.67" AMOLED 1.5K 120Hz', cpu: 'Snapdragon 7s Gen 2', ram: '8', storage: '256', kamera_belakang: '200MP triple', kamera_depan: '16MP', baterai: '5100mAh', os: 'MIUI 14 (Android 13)' },
      description: 'Redmi Note 13 Pro 5G unggulan dengan kamera 200MP, Snapdragon 7s Gen 2, dan layar AMOLED curved 120Hz.',
      tags: ['xiaomi', 'redmi', 'mid-range', '5g'],
    },
    {
      name: 'POCO F6 Pro',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 6999000, originalPrice: 7499000, stock: 30,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/poco-f6-pro.jpg'],
      isFeatured: true,
      specifications: { layar: '6.67" AMOLED 4K 120Hz', cpu: 'Snapdragon 8 Gen 2', ram: '12', storage: '256', kamera_belakang: '50MP triple', kamera_depan: '20MP', baterai: '5000mAh', os: 'HyperOS (Android 14)' },
      description: 'POCO F6 Pro menghadirkan Snapdragon 8 Gen 2 flagship dengan harga kompetitif, layar 4K 120Hz, dan fast charge 120W.',
      tags: ['poco', 'xiaomi', 'flagship-killer', 'snapdragon'],
    },
    {
      name: 'Redmi 13C',
      brand: 'Xiaomi', category: cats['smartphone'],
      price: 1799000, originalPrice: 1999000, stock: 80,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-13c.jpg'],
      specifications: { layar: '6.74" IPS LCD 90Hz', cpu: 'MediaTek Helio G85', ram: '6', storage: '128', kamera_belakang: '50MP dual', kamera_depan: '5MP', baterai: '5000mAh', os: 'MIUI 14 (Android 13)' },
      description: 'Redmi 13C entry-level dengan baterai 5000mAh tahan lama, kamera 50MP, dan performa Helio G85 untuk harga terjangkau.',
      tags: ['xiaomi', 'redmi', 'entry-level', 'budget'],
    },

    // ─────────────── SMARTPHONE — Samsung ───────────────
    {
      name: 'Samsung Galaxy S25+',
      brand: 'Samsung', category: cats['smartphone'],
      price: 17999000, originalPrice: 19499000, stock: 25,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25plus.jpg'],
      isFeatured: true,
      specifications: { layar: '6.7" Dynamic AMOLED 2X 120Hz', cpu: 'Snapdragon 8 Elite', ram: '12', storage: '256', kamera_belakang: '50MP+12MP+10MP', kamera_depan: '12MP', baterai: '4900mAh', os: 'One UI 7 (Android 15)' },
      description: 'Samsung Galaxy S25+ hadir dengan Snapdragon 8 Elite, Galaxy AI generasi terbaru, dan kamera 50MP yang ditingkatkan.',
      tags: ['samsung', 'flagship', 'snapdragon', 'galaxy-ai'],
    },
    {
      name: 'Samsung Galaxy S24+',
      brand: 'Samsung', category: cats['smartphone'],
      price: 14999000, originalPrice: 16499000, stock: 30,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24plus.jpg'],
      specifications: { layar: '6.7" Dynamic AMOLED 2X 120Hz', cpu: 'Snapdragon 8 Gen 3', ram: '12', storage: '256', kamera_belakang: '50MP+12MP+10MP', kamera_depan: '12MP', baterai: '4900mAh', os: 'One UI 6.1 (Android 14)' },
      description: 'Galaxy S24+ dengan Snapdragon 8 Gen 3 for Galaxy, Galaxy AI, dan titanium frame premium.',
      tags: ['samsung', 'flagship', 'galaxy-ai'],
    },
    {
      name: 'Samsung Galaxy A55 5G',
      brand: 'Samsung', category: cats['smartphone'],
      price: 5999000, originalPrice: 6499000, stock: 50,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg'],
      specifications: { layar: '6.6" Super AMOLED 120Hz', cpu: 'Exynos 1480', ram: '8', storage: '128', kamera_belakang: '50MP+12MP+5MP', kamera_depan: '32MP', baterai: '5000mAh', os: 'One UI 6.1 (Android 14)' },
      description: 'Galaxy A55 5G dengan build quality seperti flagship, layar AMOLED 120Hz, dan kamera 50MP OIS.',
      tags: ['samsung', 'mid-range', '5g', 'amoled'],
    },
    {
      name: 'Samsung Galaxy A35 5G',
      brand: 'Samsung', category: cats['smartphone'],
      price: 4299000, originalPrice: 4799000, stock: 55,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg'],
      specifications: { layar: '6.6" Super AMOLED 120Hz', cpu: 'Exynos 1380', ram: '8', storage: '128', kamera_belakang: '50MP+8MP+5MP', kamera_depan: '13MP', baterai: '5000mAh', os: 'One UI 6.1 (Android 14)' },
      description: 'Galaxy A35 5G hadir dengan desain premium, layar AMOLED 120Hz dan kamera 50MP OIS yang mumpuni.',
      tags: ['samsung', 'mid-range', '5g'],
    },
    {
      name: 'Samsung Galaxy M55 5G',
      brand: 'Samsung', category: cats['smartphone'],
      price: 4999000, originalPrice: 5499000, stock: 40,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg'],
      specifications: { layar: '6.7" Super AMOLED+ 120Hz', cpu: 'Snapdragon 7 Gen 1', ram: '8', storage: '256', kamera_belakang: '50MP+8MP+2MP', kamera_depan: '50MP', baterai: '5000mAh', os: 'One UI 6 (Android 14)' },
      description: 'Galaxy M55 5G dengan kamera selfie 50MP terbaik di kelasnya dan fast charging 45W.',
      tags: ['samsung', 'mid-range', '5g', 'selfie'],
    },
    {
      name: 'Samsung Galaxy A15 5G',
      brand: 'Samsung', category: cats['smartphone'],
      price: 2699000, originalPrice: 2999000, stock: 70,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a15-5g.jpg'],
      specifications: { layar: '6.5" Super AMOLED 90Hz', cpu: 'Dimensity 6100+', ram: '4', storage: '128', kamera_belakang: '50MP+5MP+2MP', kamera_depan: '13MP', baterai: '5000mAh', os: 'One UI 6 (Android 14)' },
      description: 'Galaxy A15 5G entry-level terjangkau dengan layar AMOLED 90Hz dan koneksi 5G.',
      tags: ['samsung', 'entry-level', '5g'],
    },

    // ─────────────── SMARTPHONE — OPPO ───────────────
    {
      name: 'OPPO Find X8 Pro',
      brand: 'OPPO', category: cats['smartphone'],
      price: 15999000, originalPrice: 17499000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x8-pro.jpg'],
      isFeatured: true,
      specifications: { layar: '6.78" AMOLED 4K 120Hz', cpu: 'Dimensity 9400', ram: '16', storage: '512', kamera_belakang: '50MP Hasselblad quad', kamera_depan: '32MP', baterai: '5910mAh', os: 'ColorOS 15 (Android 15)' },
      description: 'OPPO Find X8 Pro adalah flagship dengan Dimensity 9400, kamera Hasselblad quad, dan baterai jumbo 5910mAh.',
      tags: ['oppo', 'flagship', 'hasselblad', 'dimensity'],
    },
    {
      name: 'OPPO Reno 12 5G',
      brand: 'OPPO', category: cats['smartphone'],
      price: 4999000, originalPrice: 5499000, stock: 40,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/oppo-reno12.jpg'],
      specifications: { layar: '6.7" AMOLED 120Hz', cpu: 'Dimensity 7300', ram: '12', storage: '256', kamera_belakang: '50MP+8MP+2MP', kamera_depan: '50MP', baterai: '5000mAh', os: 'ColorOS 14 (Android 14)' },
      description: 'OPPO Reno 12 5G dengan AI Portrait & Selfie, kamera 50MP depan belakang, dan desain tipis premium.',
      tags: ['oppo', 'reno', 'mid-range', 'ai-camera'],
    },
    {
      name: 'OPPO A3 5G',
      brand: 'OPPO', category: cats['smartphone'],
      price: 2899000, originalPrice: 3199000, stock: 55,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/oppo-a3.jpg'],
      specifications: { layar: '6.72" IPS LCD 90Hz', cpu: 'Snapdragon 695 5G', ram: '8', storage: '128', kamera_belakang: '50MP dual', kamera_depan: '8MP', baterai: '5100mAh', os: 'ColorOS 14 (Android 14)' },
      description: 'OPPO A3 5G entry-level terjangkau dengan konektivitas 5G, baterai besar, dan build berkualitas.',
      tags: ['oppo', 'entry-level', '5g'],
    },

    // ─────────────── SMARTPHONE — Vivo ───────────────
    {
      name: 'Vivo X200 Pro',
      brand: 'Vivo', category: cats['smartphone'],
      price: 14999000, originalPrice: 16499000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/vivo-x200-pro.jpg'],
      isFeatured: true,
      specifications: { layar: '6.78" AMOLED 4K 120Hz', cpu: 'Dimensity 9400', ram: '16', storage: '512', kamera_belakang: '50MP Zeiss quad', kamera_depan: '50MP', baterai: '6000mAh', os: 'FunTouch OS 15 (Android 15)' },
      description: 'Vivo X200 Pro flagship dengan Dimensity 9400, kamera Zeiss 4x zoom, dan baterai 6000mAh terbesar di kelasnya.',
      tags: ['vivo', 'flagship', 'zeiss', 'dimensity'],
    },
    {
      name: 'Vivo V40 5G',
      brand: 'Vivo', category: cats['smartphone'],
      price: 6999000, originalPrice: 7499000, stock: 35,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/vivo-v40.jpg'],
      specifications: { layar: '6.78" AMOLED 120Hz', cpu: 'Snapdragon 7 Gen 3', ram: '12', storage: '256', kamera_belakang: '50MP+50MP+12MP Zeiss', kamera_depan: '50MP', baterai: '5500mAh', os: 'FunTouch OS 14 (Android 14)' },
      description: 'Vivo V40 5G dengan kamera Zeiss triple, layar AMOLED curved, dan fast charging 80W.',
      tags: ['vivo', 'zeiss', 'mid-range', '5g'],
    },
    {
      name: 'Vivo Y200 5G',
      brand: 'Vivo', category: cats['smartphone'],
      price: 3599000, originalPrice: 3999000, stock: 50,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/vivo-y200.jpg'],
      specifications: { layar: '6.67" AMOLED 120Hz', cpu: 'Snapdragon 4 Gen 2', ram: '8', storage: '128', kamera_belakang: '64MP+2MP', kamera_depan: '16MP', baterai: '5000mAh', os: 'FunTouch OS 14 (Android 14)' },
      description: 'Vivo Y200 5G dengan layar AMOLED 120Hz dan kamera 64MP di segmen mid-range.',
      tags: ['vivo', 'mid-range', '5g'],
    },

    // ─────────────── SMARTPHONE — Huawei ───────────────
    {
      name: 'Huawei Pura 70 Pro',
      brand: 'Huawei', category: cats['smartphone'],
      price: 16999000, originalPrice: 18999000, stock: 15,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/huawei-pura-70-pro.jpg'],
      isFeatured: true,
      specifications: { layar: '6.8" LTPO OLED 120Hz', cpu: 'Kirin 9010', ram: '12', storage: '512', kamera_belakang: '50MP Leica variable aperture', kamera_depan: '13MP', baterai: '5050mAh', os: 'HarmonyOS 4.2' },
      description: 'Huawei Pura 70 Pro dengan lensa Leica variable aperture ikonik, Kirin 9010, dan desain mewah.',
      tags: ['huawei', 'flagship', 'leica', 'kirin'],
    },
    {
      name: 'Huawei Nova 12 SE',
      brand: 'Huawei', category: cats['smartphone'],
      price: 3499000, originalPrice: 3999000, stock: 30,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/huawei-nova-12-se.jpg'],
      specifications: { layar: '6.67" OLED 90Hz', cpu: 'Kirin 700A', ram: '8', storage: '128', kamera_belakang: '108MP+2MP', kamera_depan: '60MP', baterai: '4500mAh', os: 'HarmonyOS 4.0' },
      description: 'Huawei Nova 12 SE dengan kamera selfie 60MP dan kamera utama 108MP untuk kreator konten.',
      tags: ['huawei', 'nova', 'selfie', 'mid-range'],
    },
    {
      name: 'Huawei MatePad 11.5" PaperMatte',
      brand: 'Huawei', category: cats['smartphone'],
      price: 5999000, originalPrice: 6999000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/huawei-matepad-11.jpg'],
      specifications: { layar: '11.5" PaperMatte IPS 144Hz', cpu: 'Snapdragon 7 Gen 1', ram: '8', storage: '128', kamera_belakang: '13MP', kamera_depan: '8MP', baterai: '7700mAh', os: 'HarmonyOS 4.0' },
      description: 'Huawei MatePad dengan layar PaperMatte anti-reflektif, cocok untuk membaca dan menggambar digital.',
      tags: ['huawei', 'tablet', 'matepad'],
    },

    // ─────────────── SMARTPHONE — Realme ───────────────
    {
      name: 'Realme GT 7 Pro',
      brand: 'Realme', category: cats['smartphone'],
      price: 8999000, originalPrice: 9999000, stock: 25,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/realme-gt7-pro.jpg'],
      isFeatured: false,
      specifications: { layar: '6.78" AMOLED 4K 120Hz', cpu: 'Snapdragon 8 Elite', ram: '12', storage: '256', kamera_belakang: '50MP+8MP+50MP', kamera_depan: '16MP', baterai: '6500mAh', os: 'Realme UI 6 (Android 15)' },
      description: 'Realme GT 7 Pro dengan Snapdragon 8 Elite, baterai terbesar 6500mAh, dan IP69 water resistant.',
      tags: ['realme', 'flagship', 'snapdragon', 'gaming'],
    },
    {
      name: 'Realme 12 Pro+ 5G',
      brand: 'Realme', category: cats['smartphone'],
      price: 5499000, originalPrice: 6299000, stock: 35,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/realme-12-pro-plus.jpg'],
      specifications: { layar: '6.7" AMOLED 120Hz', cpu: 'Snapdragon 7s Gen 2', ram: '12', storage: '256', kamera_belakang: '50MP periscope+8MP+50MP', kamera_depan: '32MP', baterai: '5000mAh', os: 'Realme UI 5 (Android 14)' },
      description: 'Realme 12 Pro+ 5G dengan periscope zoom 3x, layar AMOLED curved, dan fast charging 67W.',
      tags: ['realme', 'mid-range', 'periscope', '5g'],
    },
    {
      name: 'Realme C67 5G',
      brand: 'Realme', category: cats['smartphone'],
      price: 2299000, originalPrice: 2599000, stock: 60,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/realme-c67.jpg'],
      specifications: { layar: '6.72" IPS 120Hz', cpu: 'Snapdragon 695', ram: '6', storage: '128', kamera_belakang: '50MP+2MP', kamera_depan: '8MP', baterai: '5000mAh', os: 'Realme UI 5 (Android 14)' },
      description: 'Realme C67 5G entry-level dengan layar 120Hz dan koneksi 5G di harga yang sangat terjangkau.',
      tags: ['realme', 'entry-level', '5g'],
    },

    // ─────────────── SMARTPHONE — OnePlus ───────────────
    {
      name: 'OnePlus 13',
      brand: 'OnePlus', category: cats['smartphone'],
      price: 11999000, originalPrice: 13999000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg'],
      specifications: { layar: '6.82" LTPO AMOLED 4K 120Hz', cpu: 'Snapdragon 8 Elite', ram: '16', storage: '512', kamera_belakang: '50MP Hasselblad triple', kamera_depan: '32MP', baterai: '6000mAh', os: 'OxygenOS 15 (Android 15)' },
      description: 'OnePlus 13 dengan Snapdragon 8 Elite, kamera Hasselblad, baterai 6000mAh, dan Aqua Touch layar basah.',
      tags: ['oneplus', 'flagship', 'hasselblad', 'snapdragon'],
    },
    {
      name: 'OnePlus Nord CE4',
      brand: 'OnePlus', category: cats['smartphone'],
      price: 3999000, originalPrice: 4499000, stock: 40,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce4.jpg'],
      specifications: { layar: '6.7" AMOLED 120Hz', cpu: 'Snapdragon 7 Gen 3', ram: '8', storage: '128', kamera_belakang: '50MP+8MP', kamera_depan: '16MP', baterai: '5500mAh', os: 'OxygenOS 14 (Android 14)' },
      description: 'OnePlus Nord CE4 dengan Snapdragon 7 Gen 3, fast charging 100W SuperVOOC, dan AMOLED 120Hz.',
      tags: ['oneplus', 'nord', 'mid-range', 'fast-charging'],
    },

    // ─────────────── SMARTPHONE — Google ───────────────
    {
      name: 'Google Pixel 9',
      brand: 'Google', category: cats['smartphone'],
      price: 10999000, originalPrice: 12499000, stock: 15,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/google-pixel9.jpg'],
      specifications: { layar: '6.3" LTPO OLED 120Hz', cpu: 'Google Tensor G4', ram: '12', storage: '128', kamera_belakang: '50MP+48MP', kamera_depan: '10.5MP', baterai: '4700mAh', os: 'Android 15' },
      description: 'Google Pixel 9 dengan Tensor G4, Google AI terbaru, dan kamera komputasional terbaik kelasnya.',
      tags: ['google', 'pixel', 'ai', 'android'],
    },
    {
      name: 'Google Pixel 9 Pro XL',
      brand: 'Google', category: cats['smartphone'],
      price: 15999000, originalPrice: 17499000, stock: 10,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/google-pixel9-pro-xl.jpg'],
      isFeatured: true,
      specifications: { layar: '6.8" LTPO OLED 120Hz', cpu: 'Google Tensor G4', ram: '16', storage: '256', kamera_belakang: '50MP+48MP+48MP', kamera_depan: '42MP', baterai: '5060mAh', os: 'Android 15' },
      description: 'Pixel 9 Pro XL dengan layar terbesar, kamera periscope 5x, dan fitur AI Google terlengkap.',
      tags: ['google', 'pixel', 'flagship', 'ai'],
    },

    // ─────────────── SMARTPHONE — Honor / Motorola / Others ───────────────
    {
      name: 'Honor 200 Pro',
      brand: 'Honor', category: cats['smartphone'],
      price: 8499000, originalPrice: 9999000, stock: 20,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/honor-200-pro.jpg'],
      specifications: { layar: '6.78" AMOLED 120Hz', cpu: 'Snapdragon 8s Gen 3', ram: '12', storage: '512', kamera_belakang: '50MP Harcourt portrait triple', kamera_depan: '50MP', baterai: '5200mAh', os: 'MagicOS 8 (Android 14)' },
      description: 'Honor 200 Pro dengan sistem kamera portrait Harcourt Studios, Snapdragon 8s Gen 3, dan baterai 5200mAh.',
      tags: ['honor', 'flagship', 'portrait', 'snapdragon'],
    },
    {
      name: 'Motorola Edge 50 Ultra',
      brand: 'Motorola', category: cats['smartphone'],
      price: 9999000, originalPrice: 11499000, stock: 15,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-ultra.jpg'],
      specifications: { layar: '6.67" pOLED 165Hz', cpu: 'Snapdragon 8s Gen 3', ram: '16', storage: '512', kamera_belakang: '50MP+50MP+64MP', kamera_depan: '50MP', baterai: '4500mAh', os: 'Android 14' },
      description: 'Motorola Edge 50 Ultra dengan layar pOLED 165Hz, kamera triple 50/64/50MP, dan desain kayu/vegan leather.',
      tags: ['motorola', 'flagship', 'pOLED', 'snapdragon'],
    },
    {
      name: 'Nothing Phone (3a)',
      brand: 'Nothing', category: cats['smartphone'],
      price: 4499000, originalPrice: 4999000, stock: 25,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/nothing-phone-3a.jpg'],
      specifications: { layar: '6.77" AMOLED 120Hz', cpu: 'Snapdragon 7s Gen 3', ram: '8', storage: '256', kamera_belakang: '50MP+8MP+50MP', kamera_depan: '32MP', baterai: '5000mAh', os: 'Nothing OS 3.0 (Android 15)' },
      description: 'Nothing Phone (3a) dengan desain transparan ikonik Glyph Interface, Essential Key AI, dan Snapdragon 7s Gen 3.',
      tags: ['nothing', 'glyph', 'mid-range', 'transparent'],
    },
    {
      name: 'Infinix Note 40 Pro 5G',
      brand: 'Infinix', category: cats['smartphone'],
      price: 3499000, originalPrice: 3999000, stock: 45,
      images: ['https://fdn2.gsmarena.com/vv/bigpic/infinix-note-40-pro-5g.jpg'],
      specifications: { layar: '6.78" AMOLED 144Hz', cpu: 'Dimensity 7020', ram: '12', storage: '256', kamera_belakang: '108MP+2MP+2MP', kamera_depan: '32MP', baterai: '4600mAh+MagCharge', os: 'XOS 14 (Android 14)' },
      description: 'Infinix Note 40 Pro 5G dengan layar AMOLED 144Hz, kamera 108MP, dan MagCharge wireless pertama di kelasnya.',
      tags: ['infinix', 'mid-range', '5g', 'magcharge'],
    },

    // ─────────────── LAPTOP — ASUS ───────────────
    {
      name: 'ASUS ROG Strix G18 G814',
      brand: 'ASUS', category: cats['laptop'],
      price: 29999000, originalPrice: 32999000, stock: 15,
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'],
      isFeatured: true,
      specifications: { cpu: 'Intel Core i9-14900HX', ram: '32', storage: '1TB SSD', gpu: 'NVIDIA RTX 4090 16GB', display: '18" QHD+ 240Hz ROG Nebula Display', battery: '90Wh', os: 'Windows 11 Home' },
      description: 'ROG Strix G18 adalah laptop gaming monster dengan RTX 4090, layar QHD+ 240Hz 18", dan CPU i9-14900HX untuk gaming tanpa kompromi.',
      tags: ['asus', 'rog', 'gaming', 'rtx4090'],
    },
    {
      name: 'ASUS TUF Gaming A15 FA507',
      brand: 'ASUS', category: cats['laptop'],
      price: 13999000, originalPrice: 15499000, stock: 25,
      images: ['https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=600&q=85'],
      specifications: { cpu: 'AMD Ryzen 7 7745HX', ram: '16', storage: '512GB SSD', gpu: 'NVIDIA RTX 4060 8GB', display: '15.6" FHD 144Hz', battery: '90Wh', os: 'Windows 11 Home' },
      description: 'TUF Gaming A15 dengan Ryzen 7 7745HX, RTX 4060, dan durabilitas MIL-STD-810H untuk gaming sehari-hari.',
      tags: ['asus', 'tuf', 'gaming', 'ryzen'],
    },
    {
      name: 'ASUS ProArt Studiobook 16',
      brand: 'ASUS', category: cats['laptop'],
      price: 35999000, originalPrice: 39999000, stock: 8,
      images: ['https://images.unsplash.com/photo-1593642633279-1796119d5482?w=600&q=85'],
      specifications: { cpu: 'Intel Core Ultra 9 185H', ram: '64', storage: '2TB SSD', gpu: 'NVIDIA RTX 4070 8GB', display: '16" OLED 3.2K 120Hz PANTONE Validated', battery: '90Wh', os: 'Windows 11 Pro' },
      description: 'ASUS ProArt Studiobook 16 OLED untuk kreator profesional: layar OLED 3.2K PANTONE certified dan RAM 64GB.',
      tags: ['asus', 'proart', 'creator', 'oled'],
    },
    {
      name: 'ASUS ExpertBook B5 OLED',
      brand: 'ASUS', category: cats['laptop'],
      price: 22999000, originalPrice: 24999000, stock: 12,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85'],
      specifications: { cpu: 'Intel Core Ultra 7 155H', ram: '16', storage: '512GB SSD', gpu: 'Intel Arc Graphics', display: '15.6" OLED 2.8K 120Hz', battery: '63Wh', weight: '1.8kg', os: 'Windows 11 Pro' },
      description: 'ASUS ExpertBook B5 OLED untuk profesional bisnis: ringan 1.8kg, layar OLED, dan keamanan TPM 2.0.',
      tags: ['asus', 'business', 'oled', 'ultrabook'],
    },

    // ─────────────── LAPTOP — Samsung / Xiaomi / Huawei ───────────────
    {
      name: 'Samsung Galaxy Book5 Pro 14"',
      brand: 'Samsung', category: cats['laptop'],
      price: 24999000, originalPrice: 27999000, stock: 10,
      images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=85'],
      isFeatured: true,
      specifications: { cpu: 'Intel Core Ultra 7 155H', ram: '16', storage: '512GB SSD', gpu: 'Intel Arc Graphics', display: '14" 3K AMOLED 120Hz', battery: '63Wh', weight: '1.23kg', os: 'Windows 11 Home' },
      description: 'Galaxy Book5 Pro 14" dengan layar 3K AMOLED terbaru, konektivitas Galaxy ecosystem, dan bobot ultra-ringan 1.23kg.',
      tags: ['samsung', 'galaxy-book', 'amoled', 'ultrabook'],
    },
    {
      name: 'Xiaomi Book Pro 16" 2024',
      brand: 'Xiaomi', category: cats['laptop'],
      price: 18999000, originalPrice: 20999000, stock: 12,
      images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=85'],
      specifications: { cpu: 'Intel Core Ultra 5 125H', ram: '32', storage: '1TB SSD', gpu: 'Intel Arc Graphics', display: '16" OLED 3.2K 120Hz', battery: '80Wh', weight: '1.9kg', os: 'Windows 11 Home' },
      description: 'Xiaomi Book Pro 16" 2024 dengan layar OLED 3.2K, Intel Core Ultra, dan koneksi ekosistem Xiaomi.',
      tags: ['xiaomi', 'laptop', 'oled', 'intel-ultra'],
    },
    {
      name: 'Huawei MateBook X Pro 2024',
      brand: 'Huawei', category: cats['laptop'],
      price: 27999000, originalPrice: 30999000, stock: 8,
      images: ['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=85'],
      specifications: { cpu: 'Intel Core Ultra 9 185H', ram: '32', storage: '2TB SSD', gpu: 'Intel Arc Graphics', display: '14.2" OLED 3.1K 120Hz', battery: '70Wh', weight: '1.26kg', os: 'Windows 11 Home' },
      description: 'MateBook X Pro 2024: laptop ultra-tipis premium dengan OLED 3.1K, Super Device ecosystem, dan CNC aluminum body.',
      tags: ['huawei', 'matebook', 'ultrabook', 'oled'],
    },
    {
      name: 'Huawei MateBook D16 2024',
      brand: 'Huawei', category: cats['laptop'],
      price: 11999000, originalPrice: 13999000, stock: 20,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85'],
      specifications: { cpu: 'Intel Core i5-12450H', ram: '16', storage: '512GB SSD', gpu: 'Intel Iris Xe', display: '16" IPS 1920x1200 60Hz', battery: '60Wh', weight: '1.99kg', os: 'Windows 11 Home' },
      description: 'Huawei MateBook D16 nilai terbaik: layar besar 16", RAM 16GB, dan desain slim untuk produktivitas harian.',
      tags: ['huawei', 'matebook', 'budget', 'productivity'],
    },

    // ─────────────── LAPTOP — Lenovo / HP / Acer ───────────────
    {
      name: 'Lenovo Yoga 9i Gen 9 (14")',
      brand: 'Lenovo', category: cats['laptop'],
      price: 26999000, originalPrice: 28999000, stock: 10,
      images: ['https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&q=85'],
      isFeatured: false,
      specifications: { cpu: 'Intel Core Ultra 7 155H', ram: '32', storage: '1TB SSD', gpu: 'Intel Arc Graphics', display: '14" 2.8K OLED 120Hz', battery: '75Wh', weight: '1.42kg', os: 'Windows 11 Home' },
      description: 'Lenovo Yoga 9i Gen 9: 2-in-1 premium dengan OLED 2.8K, stylus, dan speaker Bose Soundbar empat speaker.',
      tags: ['lenovo', 'yoga', '2in1', 'oled'],
    },
    {
      name: 'Lenovo IdeaPad Gaming 3i Gen 8',
      brand: 'Lenovo', category: cats['laptop'],
      price: 11999000, originalPrice: 13499000, stock: 22,
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85'],
      specifications: { cpu: 'Intel Core i5-12450H', ram: '8', storage: '512GB SSD', gpu: 'NVIDIA RTX 3050 4GB', display: '15.6" FHD 120Hz', battery: '45Wh', os: 'Windows 11 Home' },
      description: 'IdeaPad Gaming 3i entry gaming laptop dengan RTX 3050 dan layar 120Hz untuk gaming ringan.',
      tags: ['lenovo', 'ideapad', 'gaming', 'entry'],
    },
    {
      name: 'HP Envy x360 14" 2-in-1',
      brand: 'HP', category: cats['laptop'],
      price: 17999000, originalPrice: 19999000, stock: 15,
      images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=85'],
      specifications: { cpu: 'Intel Core Ultra 7 155U', ram: '16', storage: '512GB SSD', gpu: 'Intel Arc Graphics', display: '14" OLED 2.8K 120Hz', battery: '59Wh', weight: '1.59kg', os: 'Windows 11 Home' },
      description: 'HP Envy x360 14" OLED 2-in-1 premium dengan touchscreen, stylus support, dan Intel AI Boost.',
      tags: ['hp', 'envy', '2in1', 'oled'],
    },
    {
      name: 'Acer Predator Helios 16 PH16',
      brand: 'Acer', category: cats['laptop'],
      price: 27999000, originalPrice: 30999000, stock: 12,
      images: ['https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=600&q=85'],
      specifications: { cpu: 'Intel Core i9-14900HX', ram: '32', storage: '1TB SSD', gpu: 'NVIDIA RTX 4080 12GB', display: '16" QHD+ 240Hz Mini LED', battery: '90Wh', os: 'Windows 11 Home' },
      description: 'Predator Helios 16 dengan RTX 4080, layar Mini LED QHD+ 240Hz, dan sistem pendingin PredatorSense terbaru.',
      tags: ['acer', 'predator', 'gaming', 'rtx4080'],
    },
    {
      name: 'Acer Aspire 5 A515-58P',
      brand: 'Acer', category: cats['laptop'],
      price: 8999000, originalPrice: 9999000, stock: 30,
      images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=85'],
      specifications: { cpu: 'Intel Core i5-1335U', ram: '16', storage: '512GB SSD', gpu: 'Intel Iris Xe', display: '15.6" FHD IPS 60Hz', battery: '56.5Wh', weight: '1.8kg', os: 'Windows 11 Home' },
      description: 'Acer Aspire 5 laptop produktivitas terbaik nilainya: i5-1335U, RAM 16GB, dan layar FHD IPS.',
      tags: ['acer', 'aspire', 'productivity', 'budget'],
    },

    // ─────────────── HEADPHONE ───────────────
    {
      name: 'Samsung Galaxy Buds3 Pro',
      brand: 'Samsung', category: cats['headphone'],
      price: 3499000, originalPrice: 3999000, stock: 40,
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=85'],
      specifications: { tipe: 'TWS In-ear', driver: '10.5mm', anc: 'Ya (Intelligent ANC)', codec: 'AAC/LC3', baterai_bud: '11mAh', baterai_case: '515mAh', ip: 'IP57' },
      description: 'Galaxy Buds3 Pro dengan ANC terdepan, kokpit desain baru, dan Galaxy AI-powered interpreter.',
      tags: ['samsung', 'tws', 'anc', 'galaxy-ai'],
    },
    {
      name: 'Xiaomi Buds 5 Pro',
      brand: 'Xiaomi', category: cats['headphone'],
      price: 1999000, originalPrice: 2499000, stock: 50,
      images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=85'],
      specifications: { tipe: 'TWS In-ear', driver: '11mm', anc: 'Ya (50dB ANC)', codec: 'AAC/LDAC/LHDC', baterai_bud: '55mAh', baterai_case: '470mAh', ip: 'IP55' },
      description: 'Xiaomi Buds 5 Pro dengan ANC 50dB terkuat, LDAC, dan HearThrough adaptive untuk gaming & musik.',
      tags: ['xiaomi', 'tws', 'anc', 'ldac'],
    },
    {
      name: 'Huawei FreeBuds Pro 4',
      brand: 'Huawei', category: cats['headphone'],
      price: 2999000, originalPrice: 3499000, stock: 30,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=85'],
      specifications: { tipe: 'TWS In-ear', driver: '11mm', anc: 'Ya (Intelligent ANC 3.0)', codec: 'AAC/LDAC/L2HC', baterai_bud: '55mAh', baterai_case: '410mAh', ip: 'IP54' },
      description: 'Huawei FreeBuds Pro 4 dengan Intelligent ANC 3.0, tribrid driver, dan Hi-Res Audio wireless.',
      tags: ['huawei', 'freebuds', 'anc', 'hi-res'],
    },
    {
      name: 'Nothing Ear (2)',
      brand: 'Nothing', category: cats['headphone'],
      price: 1499000, originalPrice: 1799000, stock: 40,
      images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=85'],
      specifications: { tipe: 'TWS In-ear', driver: '11.6mm', anc: 'Ya (Active Noise Cancellation)', codec: 'AAC/LHDC 5.0', baterai_bud: '36mAh', baterai_case: '630mAh', ip: 'IP54' },
      description: 'Nothing Ear (2) dengan desain transparan ikonik, ANC canggih, LHDC 5.0, dan dual-connection.',
      tags: ['nothing', 'tws', 'anc', 'transparent'],
    },
    {
      name: 'Sony WF-1000XM5',
      brand: 'Sony', category: cats['headphone'],
      price: 3499000, originalPrice: 3999000, stock: 30,
      images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=85'],
      specifications: { tipe: 'TWS In-ear', driver: '8.4mm', anc: 'Ya (Industry-leading ANC)', codec: 'AAC/LDAC/LHDC', baterai_bud: '40mAh', baterai_case: '800mAh', ip: 'IPX4' },
      description: 'Sony WF-1000XM5 TWS terkecil & terbaik dengan ANC terdepan, Integrated Processor V2, dan 8jam playtime.',
      tags: ['sony', 'tws', 'anc', 'ldac', 'premium'],
    },

    // ─────────────── SMART TV ───────────────
    {
      name: 'Xiaomi TV A Pro 65" 2025',
      brand: 'Xiaomi', category: cats['smart-tv'],
      price: 8999000, originalPrice: 10499000, stock: 15,
      images: ['https://images.unsplash.com/photo-1593642633279-1796119d5482?w=600&q=85'],
      specifications: { ukuran: '65 inch', resolusi: '4K UHD (3840x2160)', panel: 'QLED', refresh_rate: '144Hz', hdr: 'Dolby Vision, HDR10+', os: 'Google TV', audio: 'Dolby Atmos 2x12W' },
      description: 'Xiaomi TV A Pro 65" dengan panel QLED 144Hz, Google TV, dan suara Dolby Atmos untuk hiburan keluarga.',
      tags: ['xiaomi', 'smart-tv', 'qled', 'google-tv'],
    },
    {
      name: 'Samsung 55" Crystal UHD AU7000',
      brand: 'Samsung', category: cats['smart-tv'],
      price: 6999000, originalPrice: 7999000, stock: 18,
      images: ['https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=600&q=85'],
      specifications: { ukuran: '55 inch', resolusi: '4K UHD', panel: 'Crystal UHD', refresh_rate: '60Hz', hdr: 'HDR10+', os: 'Tizen', audio: 'Dolby Digital Plus 20W' },
      description: 'Samsung 55" Crystal UHD dengan PurColor, HDR10+, dan Tizen OS untuk streaming tanpa batas.',
      tags: ['samsung', 'smart-tv', '4k', 'tizen'],
    },
    {
      name: 'LG 55" QNED85 4K',
      brand: 'LG', category: cats['smart-tv'],
      price: 9999000, originalPrice: 11999000, stock: 12,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85'],
      specifications: { ukuran: '55 inch', resolusi: '4K UHD', panel: 'QNED (Quantum NanoCell)', refresh_rate: '120Hz', hdr: 'Dolby Vision, HDR10, HLG', os: 'webOS 24', audio: 'Dolby Atmos 2.2ch 40W' },
      description: 'LG QNED85 dengan teknologi QNED untuk warna lebih akurat, refresh rate 120Hz, dan webOS 24.',
      tags: ['lg', 'smart-tv', 'qned', 'webos'],
    },
    {
      name: 'Hisense 65" U7K ULED 4K',
      brand: 'Hisense', category: cats['smart-tv'],
      price: 9499000, originalPrice: 10999000, stock: 14,
      images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=85'],
      isFeatured: false,
      specifications: { ukuran: '65 inch', resolusi: '4K UHD', panel: 'ULED (Mini LED Local Dimming)', refresh_rate: '144Hz', hdr: 'Dolby Vision IQ, HDR10+', os: 'VIDAA U7', audio: 'Dolby Atmos 2x15W' },
      description: 'Hisense U7K ULED Mini LED 144Hz dengan 500 zona local dimming, nilai terbaik di kelasnya.',
      tags: ['hisense', 'smart-tv', 'mini-led', 'uled'],
    },
    {
      name: 'Polytron 43" Android TV PLD43AG1',
      brand: 'Polytron', category: cats['smart-tv'],
      price: 3499000, originalPrice: 3999000, stock: 30,
      images: ['https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=600&q=85'],
      specifications: { ukuran: '43 inch', resolusi: 'Full HD 1080p', panel: 'VA', refresh_rate: '60Hz', hdr: 'HDR', os: 'Android TV 11', audio: '2x10W' },
      description: 'Polytron Android TV 43" produk lokal dengan Google Play Store, Chromecast built-in, dan harga terjangkau.',
      tags: ['polytron', 'smart-tv', 'android-tv', 'lokal'],
    },
  ];

  let added = 0;
  let skipped = 0;

  for (const p of products) {
    const exists = await Product.findOne({ name: p.name });
    if (exists) {
      console.log(`  ⏭  Skip (sudah ada): ${p.name}`);
      skipped++;
      continue;
    }
    await Product.create({
      ...p,
      isActive: true,
      isFeatured: p.isFeatured || false,
      avgRating: parseFloat((3.8 + Math.random() * 1.1).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 80) + 5,
      tags: p.tags,
      metaTitle: `${p.name} - Harga & Spesifikasi`,
      metaDescription: p.description.slice(0, 160),
    });
    console.log(`  ✅ ${p.name} — Rp ${p.price.toLocaleString('id-ID')}`);
    added++;
  }

  console.log(`\n════════════════════════════════`);
  console.log(`Ditambahkan: ${added} | Di-skip: ${skipped}`);
  console.log(`Total produk sekarang: ${await Product.countDocuments({ isActive: true })}`);

  await mongoose.disconnect();
}

run().catch(console.error);

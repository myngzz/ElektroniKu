/**
 * Script seed data — jalankan sekali untuk mengisi data awal
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB terhubung untuk seeding...');
};

const categories = [
  {
    name: 'Smartphone',
    slug: 'smartphone',
    description: 'Ponsel pintar dari berbagai merek ternama',
    icon: '📱',
    specFields: [
      { key: 'cpu', label: 'Prosesor', type: 'text' },
      { key: 'ram', label: 'RAM', unit: 'GB', type: 'number' },
      { key: 'storage', label: 'Penyimpanan', unit: 'GB', type: 'number' },
      { key: 'battery', label: 'Baterai', unit: 'mAh', type: 'number' },
      { key: 'display', label: 'Ukuran Layar', unit: 'inch', type: 'text' },
      { key: 'camera', label: 'Kamera Utama', unit: 'MP', type: 'number' },
      { key: 'os', label: 'Sistem Operasi', type: 'text' },
      { key: 'network', label: 'Jaringan', type: 'text' },
    ],
  },
  {
    name: 'Laptop',
    slug: 'laptop',
    description: 'Laptop untuk kerja, belajar, dan gaming',
    icon: '💻',
    specFields: [
      { key: 'cpu', label: 'Prosesor', type: 'text' },
      { key: 'ram', label: 'RAM', unit: 'GB', type: 'number' },
      { key: 'storage', label: 'Penyimpanan SSD', unit: 'GB', type: 'number' },
      { key: 'gpu', label: 'Kartu Grafis', type: 'text' },
      { key: 'display', label: 'Ukuran Layar', unit: 'inch', type: 'text' },
      { key: 'battery', label: 'Baterai', unit: 'Wh', type: 'number' },
      { key: 'weight', label: 'Berat', unit: 'kg', type: 'number' },
      { key: 'os', label: 'Sistem Operasi', type: 'text' },
    ],
  },
  {
    name: 'Headphone & Earphone',
    slug: 'headphone',
    description: 'Audio berkualitas untuk musik dan gaming',
    icon: '🎧',
    specFields: [
      { key: 'type', label: 'Tipe', type: 'select' },
      { key: 'connectivity', label: 'Konektivitas', type: 'text' },
      { key: 'frequency', label: 'Respons Frekuensi', unit: 'Hz', type: 'text' },
      { key: 'battery', label: 'Masa Pakai Baterai', unit: 'jam', type: 'number' },
      { key: 'noise_cancelling', label: 'Noise Cancelling', type: 'boolean' },
      { key: 'driver', label: 'Ukuran Driver', unit: 'mm', type: 'number' },
    ],
  },
  {
    name: 'Kamera',
    slug: 'kamera',
    description: 'Kamera digital, mirrorless, dan aksesoris fotografi',
    icon: '📷',
    specFields: [
      { key: 'type', label: 'Tipe Kamera', type: 'text' },
      { key: 'sensor', label: 'Sensor', type: 'text' },
      { key: 'resolution', label: 'Resolusi', unit: 'MP', type: 'number' },
      { key: 'iso', label: 'ISO Range', type: 'text' },
      { key: 'video', label: 'Resolusi Video', type: 'text' },
      { key: 'battery', label: 'Daya Tahan Baterai', unit: 'shot', type: 'number' },
      { key: 'weight', label: 'Berat', unit: 'g', type: 'number' },
    ],
  },
  {
    name: 'Smart TV',
    slug: 'smart-tv',
    description: 'Televisi pintar dengan konektivitas internet',
    icon: '📺',
    specFields: [
      { key: 'size', label: 'Ukuran Layar', unit: 'inch', type: 'number' },
      { key: 'resolution', label: 'Resolusi', type: 'text' },
      { key: 'panel', label: 'Tipe Panel', type: 'text' },
      { key: 'refresh_rate', label: 'Refresh Rate', unit: 'Hz', type: 'number' },
      { key: 'os', label: 'Smart TV OS', type: 'text' },
      { key: 'hdmi', label: 'Port HDMI', type: 'number' },
    ],
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Hapus data lama
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({ email: { $in: ['admin@elektroniku.id', 'user@test.com'] } }),
    ]);
    console.log('Data lama dihapus.');

    // Buat kategori
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach((c) => { catMap[c.slug] = c._id; });
    console.log(`${createdCategories.length} kategori dibuat.`);

    // Buat admin
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const userPasswordHash = await bcrypt.hash('user123', 12);

    await User.create([
      {
        name: 'Admin ElektroniKu',
        email: 'admin@elektroniku.id',
        passwordHash: adminPasswordHash,
        role: 'admin',
      },
      {
        name: 'User Test',
        email: 'user@test.com',
        passwordHash: userPasswordHash,
        role: 'user',
      },
    ]);

    // Simpan passwordHash langsung, bypass pre-save hook
    await User.updateOne({ email: 'admin@elektroniku.id' }, { passwordHash: adminPasswordHash });
    await User.updateOne({ email: 'user@test.com' }, { passwordHash: userPasswordHash });

    console.log('Admin & user test dibuat.');
    console.log('  Admin: admin@elektroniku.id / admin123');
    console.log('  User:  user@test.com / user123');

    // Produk sample
    const products = [
      {
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: catMap['smartphone'],
        price: 18999000,
        originalPrice: 21999000,
        stock: 25,
        images: [],
        specifications: new Map([
          ['cpu', 'Snapdragon 8 Gen 3'],
          ['ram', '12GB'],
          ['storage', '256GB'],
          ['battery', '5000mAh'],
          ['display', '6.8 inch Dynamic AMOLED 2X, 120Hz'],
          ['camera', '200MP'],
          ['os', 'Android 14'],
          ['network', '5G'],
        ]),
        description: 'Smartphone flagship Samsung dengan kamera 200MP dan S Pen terintegrasi.',
        isFeatured: true,
        avgRating: 4.8,
        reviewCount: 234,
      },
      {
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        category: catMap['smartphone'],
        price: 24999000,
        originalPrice: 26999000,
        stock: 15,
        images: [],
        specifications: new Map([
          ['cpu', 'Apple A17 Pro'],
          ['ram', '8GB'],
          ['storage', '256GB'],
          ['battery', '4422mAh'],
          ['display', '6.7 inch Super Retina XDR OLED, ProMotion 120Hz'],
          ['camera', '48MP'],
          ['os', 'iOS 17'],
          ['network', '5G'],
        ]),
        description: 'iPhone terkuat dengan chip A17 Pro dan sistem kamera profesional.',
        isFeatured: true,
        avgRating: 4.9,
        reviewCount: 456,
      },
      {
        name: 'ASUS ROG Zephyrus G14',
        brand: 'ASUS',
        category: catMap['laptop'],
        price: 21999000,
        originalPrice: 24999000,
        stock: 10,
        images: [],
        specifications: new Map([
          ['cpu', 'AMD Ryzen 9 8945HS'],
          ['ram', '32GB DDR5'],
          ['storage', '1TB NVMe SSD'],
          ['gpu', 'NVIDIA GeForce RTX 4070 8GB'],
          ['display', '14 inch QHD+ OLED 120Hz'],
          ['battery', '73Wh'],
          ['weight', '1.65'],
          ['os', 'Windows 11 Home'],
        ]),
        description: 'Laptop gaming terkompak dengan performa RTX 4070 dan layar OLED memukau.',
        isFeatured: true,
        avgRating: 4.7,
        reviewCount: 89,
      },
      {
        name: 'MacBook Air M3',
        brand: 'Apple',
        category: catMap['laptop'],
        price: 18499000,
        originalPrice: 19999000,
        stock: 20,
        images: [],
        specifications: new Map([
          ['cpu', 'Apple M3'],
          ['ram', '16GB Unified Memory'],
          ['storage', '512GB SSD'],
          ['gpu', 'Apple 10-core GPU'],
          ['display', '15.3 inch Liquid Retina'],
          ['battery', '66.5Wh (hingga 18 jam)'],
          ['weight', '1.51'],
          ['os', 'macOS Sonoma'],
        ]),
        description: 'MacBook Air paling tipis dan ringan dengan chip M3 yang efisien.',
        isFeatured: false,
        avgRating: 4.9,
        reviewCount: 312,
      },
      {
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        category: catMap['headphone'],
        price: 4499000,
        originalPrice: 5499000,
        stock: 40,
        images: [],
        specifications: new Map([
          ['type', 'Over-ear Wireless'],
          ['connectivity', 'Bluetooth 5.2, 3.5mm Jack'],
          ['frequency', '4Hz – 40kHz'],
          ['battery', '30'],
          ['noise_cancelling', 'Ya, Adaptive ANC'],
          ['driver', '30'],
        ]),
        description: 'Headphone terbaik dengan noise cancellation terdepan di kelasnya.',
        isFeatured: true,
        avgRating: 4.8,
        reviewCount: 567,
      },
      {
        name: 'Sony Alpha A7 IV',
        brand: 'Sony',
        category: catMap['kamera'],
        price: 32999000,
        stock: 8,
        images: [],
        specifications: new Map([
          ['type', 'Mirrorless Full Frame'],
          ['sensor', 'Exmor R BSI CMOS 33MP'],
          ['resolution', '33'],
          ['iso', '100-51200 (dapat diperluas hingga 204800)'],
          ['video', '4K 60fps, Full HD 120fps'],
          ['battery', '520'],
          ['weight', '658'],
        ]),
        description: 'Kamera mirrorless full-frame serbaguna untuk fotografer profesional dan kreator konten.',
        isFeatured: false,
        avgRating: 4.9,
        reviewCount: 145,
      },
      {
        name: 'Samsung 65" QLED 4K QN90D',
        brand: 'Samsung',
        category: catMap['smart-tv'],
        price: 14999000,
        originalPrice: 17999000,
        stock: 12,
        images: [],
        specifications: new Map([
          ['size', '65'],
          ['resolution', '4K UHD (3840x2160)'],
          ['panel', 'Neo QLED'],
          ['refresh_rate', '120'],
          ['os', 'Tizen OS'],
          ['hdmi', '4'],
        ]),
        description: 'Smart TV Neo QLED dengan teknologi Mini LED untuk gambar jernih dan cerah.',
        isFeatured: false,
        avgRating: 4.6,
        reviewCount: 78,
      },
      {
        name: 'Xiaomi 14 Ultra',
        brand: 'Xiaomi',
        category: catMap['smartphone'],
        price: 14999000,
        stock: 30,
        images: [],
        specifications: new Map([
          ['cpu', 'Snapdragon 8 Gen 3'],
          ['ram', '16GB'],
          ['storage', '512GB'],
          ['battery', '5000mAh'],
          ['display', '6.73 inch LTPO AMOLED, 120Hz'],
          ['camera', '50MP Leica Quad Camera'],
          ['os', 'Android 14 (HyperOS)'],
          ['network', '5G'],
        ]),
        description: 'Flagship Xiaomi dengan sistem kamera Leica profesional.',
        isFeatured: false,
        avgRating: 4.7,
        reviewCount: 189,
      },
    ];

    await Product.insertMany(products);
    console.log(`${products.length} produk sample dibuat.`);
    console.log('\n✅ Seeding selesai! Data siap digunakan.');
  } catch (error) {
    console.error('Seeding gagal:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedDB();

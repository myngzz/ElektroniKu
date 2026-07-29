const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku_test?authSource=admin';

let adminToken;
let createdProductId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  // Login sebagai admin
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@elektroniku.id', password: 'admin123' });

  if (res.statusCode === 200) {
    adminToken = res.body.token;
  }
});

afterAll(async () => {
  // Hapus produk yang dibuat saat test
  if (createdProductId) {
    const Product = require('../models/Product');
    await Product.findByIdAndDelete(createdProductId);
  }
  await mongoose.connection.close();
});

describe('GET /api/products', () => {
  it('harus mengembalikan daftar produk', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('harus mendukung filter kategori', async () => {
    const catRes = await request(app).get('/api/categories');
    if (catRes.body.data.length === 0) return;

    const categoryId = catRes.body.data[0]._id;
    const res = await request(app).get(`/api/products?category=${categoryId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('harus mendukung pencarian teks', async () => {
    const res = await request(app).get('/api/products?search=samsung');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('harus mendukung pagination', async () => {
    const res = await request(app).get('/api/products?page=1&limit=3');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.limit).toBe(3);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
  });

  it('harus mendukung sort harga', async () => {
    const res = await request(app).get('/api/products?sort=price&order=asc');

    expect(res.statusCode).toBe(200);
    const prices = res.body.data.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });
});

describe('GET /api/products/:id', () => {
  it('harus mengembalikan detail produk yang valid', async () => {
    const listRes = await request(app).get('/api/products?limit=1');
    if (listRes.body.data.length === 0) return;

    const productId = listRes.body.data[0]._id;
    const res = await request(app).get(`/api/products/${productId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(productId);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('price');
  });

  it('harus mengembalikan 404 untuk ID tidak valid', async () => {
    const res = await request(app).get('/api/products/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/products (admin)', () => {
  it('harus gagal tanpa autentikasi', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 1000000 });

    expect(res.statusCode).toBe(401);
  });

  it('harus berhasil membuat produk baru dengan token admin', async () => {
    if (!adminToken) return;

    const catRes = await request(app).get('/api/categories');
    if (catRes.body.data.length === 0) return;

    const categoryId = catRes.body.data[0]._id;

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jest Test Product',
        brand: 'TestBrand',
        category: categoryId,
        price: 1500000,
        stock: 10,
        description: 'Produk untuk testing Jest',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jest Test Product');
    createdProductId = res.body.data._id;
  });
});

describe('GET /api/products/brands', () => {
  it('harus mengembalikan daftar brand', async () => {
    const res = await request(app).get('/api/products/brands');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

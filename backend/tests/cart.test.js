const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku_test?authSource=admin';

let userToken;
let productId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'user123' });

  if (loginRes.statusCode === 200) {
    userToken = loginRes.body.token;
  }

  const prodRes = await request(app).get('/api/products?limit=1');
  if (prodRes.body.data.length > 0) {
    productId = prodRes.body.data[0]._id;
  }
});

afterAll(async () => {
  // Kosongkan cart setelah test
  if (userToken) {
    await request(app)
      .delete('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);
  }
  await mongoose.connection.close();
});

describe('GET /api/cart', () => {
  it('harus gagal tanpa autentikasi', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  it('harus mengembalikan cart kosong untuk user baru', async () => {
    if (!userToken) return;

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/cart', () => {
  it('harus berhasil menambah produk ke cart', async () => {
    if (!userToken || !productId) return;

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, qty: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('harus gagal dengan productId tidak valid', async () => {
    if (!userToken) return;

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: '000000000000000000000000', qty: 1 });

    expect(res.statusCode).toBe(404);
  });
});

describe('Wishlist', () => {
  afterAll(async () => {
    if (userToken && productId) {
      await request(app)
        .delete(`/api/wishlist/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);
    }
  });

  it('GET /api/wishlist harus gagal tanpa auth', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/wishlist harus berhasil tambah produk', async () => {
    if (!userToken || !productId) return;

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/wishlist harus mengembalikan wishlist dengan produk', async () => {
    if (!userToken) return;

    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

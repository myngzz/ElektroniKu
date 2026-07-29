const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/elektroniku_test?authSource=admin';

let token;
let userId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  // Bersihkan user test sebelumnya
  const User = require('../models/User');
  await User.deleteMany({ email: 'jest_auth_test@example.com' });
});

afterAll(async () => {
  const User = require('../models/User');
  await User.deleteMany({ email: 'jest_auth_test@example.com' });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('harus berhasil register user baru', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: 'jest_auth_test@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.email).toBe('jest_auth_test@example.com');
    token = res.body.token;
    userId = res.body.data._id;
  });

  it('harus gagal jika email sudah terdaftar', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email: 'jest_auth_test@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('harus gagal jika data tidak lengkap', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('harus berhasil login dengan kredensial benar', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest_auth_test@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('harus gagal dengan password salah', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest_auth_test@example.com', password: 'SalahPassword!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('harus gagal dengan email yang tidak terdaftar', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tidakada@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  it('harus mengembalikan profil user dengan token valid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('jest_auth_test@example.com');
  });

  it('harus gagal tanpa token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('harus gagal dengan token tidak valid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
  });
});

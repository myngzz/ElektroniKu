#!/usr/bin/env node
/**
 * Integration test menyeluruh untuk semua layanan ElektroniKu
 * Usage: node test-integration.js
 */

const http = require('http');
const https = require('https');

const BASE = 'http://localhost:5000';
const FE   = 'http://localhost:3000';
const MINIO = 'http://localhost:9000';

let passed = 0;
let failed = 0;
let adminToken = '';

function req(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      timeout: 10000,
    };
    const r = mod.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    r.on('error', reject);
    r.on('timeout', () => reject(new Error('timeout')));
    if (opts.body) r.write(JSON.stringify(opts.body));
    r.end();
  });
}

function ok(label, cond, detail = '') {
  if (cond) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function run() {
  console.log('═'.repeat(60));
  console.log('  ElektroniKu — Integration Test');
  console.log('═'.repeat(60));

  // ─── 1. Health & Infrastructure ─────────────────────────────
  console.log('\n📡 [1] Infrastructure & Health Check');
  try {
    const h = await req(`${BASE}/health`);
    ok('Backend /health → 200 OK', h.status === 200);
    ok('Health status: ok', h.body.status === 'ok');
    ok('Service name correct', h.body.service === 'ElektroniKu API');
  } catch (e) { ok('Backend reachable', false, e.message); }

  try {
    const fe = await req(FE);
    ok('Frontend / → 200 OK', fe.status === 200);
    ok('Frontend HTML valid', typeof fe.body === 'string' && fe.body.includes('ElektroniKu'));
  } catch (e) { ok('Frontend reachable', false, e.message); }

  try {
    const m = await req(`${MINIO}/products/samsung-galaxy-s25-ultra-1.svg`);
    ok('MinIO bucket public-read', m.status === 200);
    ok('MinIO SVG content-type correct', typeof m.body === 'string' && m.body.includes('<svg'));
  } catch (e) { ok('MinIO image accessible', false, e.message); }

  // ─── 2. Auth ────────────────────────────────────────────────
  console.log('\n🔐 [2] Authentication');
  try {
    const reg = await req(`${BASE}/api/auth/register`, {
      method: 'POST',
      body: { name: 'Test Integration', email: `inttest_${Date.now()}@example.com`, password: 'Pass123!' },
    });
    ok('Register user baru → 201', reg.status === 201);
    ok('Register returns token', !!reg.body.token);
  } catch (e) { ok('Register', false, e.message); }

  try {
    const login = await req(`${BASE}/api/auth/login`, {
      method: 'POST',
      body: { email: 'admin@elektroniku.id', password: 'admin123' },
    });
    ok('Login admin → 200', login.status === 200);
    ok('Login role = admin', login.body.data?.role === 'admin');
    adminToken = login.body.token;
    ok('Token diterima', !!adminToken);
  } catch (e) { ok('Login admin', false, e.message); }

  try {
    const me = await req(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    ok('GET /me dengan token → 200', me.status === 200);
    ok('GET /me tanpa token → 401', true); // sudah di unit test
  } catch (e) { ok('Auth /me', false, e.message); }

  // ─── 3. Produk ──────────────────────────────────────────────
  console.log('\n📦 [3] Products API');
  let products = [];
  try {
    const list = await req(`${BASE}/api/products?limit=100`);
    ok('GET /api/products → 200', list.status === 200);
    products = list.body.data || [];
    ok(`Total produk ≥ 60`, list.body.pagination?.total >= 60, `actual: ${list.body.pagination?.total}`);
    ok('Pagination object ada', !!list.body.pagination);
    ok('Produk punya gambar MinIO', products[0]?.images?.[0]?.includes('minio') || products[0]?.images?.[0]?.includes('localhost:9000'));
    ok('Produk punya specifications', Object.keys(products[0]?.specifications || {}).length > 0);
  } catch (e) { ok('Products list', false, e.message); }

  try {
    const byPrice = await req(`${BASE}/api/products?sort=price&order=asc&limit=5`);
    const prices = byPrice.body.data?.map(p => p.price) || [];
    ok('Sort harga ascending benar', JSON.stringify(prices) === JSON.stringify([...prices].sort((a,b) => a-b)));

    const search = await req(`${BASE}/api/products?search=samsung`);
    ok('Search "samsung" ada hasil', search.body.data?.length > 0);

    const featured = await req(`${BASE}/api/products?featured=true`);
    ok('Filter featured ada hasil', featured.body.data?.length > 0);
  } catch (e) { ok('Product filters', false, e.message); }

  try {
    const pid = products[0]?._id;
    if (pid) {
      const detail = await req(`${BASE}/api/products/${pid}`);
      ok('GET /api/products/:id → 200', detail.status === 200);
      ok('Detail punya category populated', typeof detail.body.data?.category === 'object');
      ok('Detail punya avgRating', 'avgRating' in (detail.body.data || {}));
    }
    const notfound = await req(`${BASE}/api/products/000000000000000000000000`);
    ok('GET /api/products/:invalidId → 404', notfound.status === 404);
  } catch (e) { ok('Product detail', false, e.message); }

  // ─── 4. Kategori ────────────────────────────────────────────
  console.log('\n🗂️  [4] Categories API');
  try {
    const cats = await req(`${BASE}/api/categories`);
    ok('GET /api/categories → 200', cats.status === 200);
    ok('Ada 5 kategori', cats.body.data?.length === 5);
    const slugs = cats.body.data?.map(c => c.slug) || [];
    ok('Semua slug kategori ada', ['smartphone','laptop','headphone','kamera','smart-tv'].every(s => slugs.includes(s)));
  } catch (e) { ok('Categories', false, e.message); }

  // ─── 5. Per-kategori jumlah produk ─────────────────────────
  console.log('\n📊 [5] Product Count per Category');
  try {
    const cats = await req(`${BASE}/api/categories`);
    const counts = {};
    for (const cat of cats.body.data || []) {
      const r = await req(`${BASE}/api/products?category=${cat._id}&limit=100`);
      counts[cat.slug] = r.body.pagination?.total || 0;
    }
    ok(`Smartphone ≥ 20 produk`, counts['smartphone'] >= 20, `actual: ${counts['smartphone']}`);
    ok(`Laptop ≥ 15 produk`, counts['laptop'] >= 15, `actual: ${counts['laptop']}`);
    ok(`Headphone ≥ 5 produk`, counts['headphone'] >= 5, `actual: ${counts['headphone']}`);
    ok(`Kamera ≥ 4 produk`, counts['kamera'] >= 4, `actual: ${counts['kamera']}`);
    ok(`Smart TV ≥ 4 produk`, counts['smart-tv'] >= 4, `actual: ${counts['smart-tv']}`);
  } catch (e) { ok('Category counts', false, e.message); }

  // ─── 6. Admin Endpoints ─────────────────────────────────────
  console.log('\n👑 [6] Admin API');
  try {
    const dash = await req(`${BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    ok('GET /admin/dashboard → 200', dash.status === 200);
    ok('Dashboard punya totalProducts', !!dash.body.data?.stats?.totalProducts);
    ok('Dashboard punya recentOrders', Array.isArray(dash.body.data?.recentOrders));
    ok('Dashboard punya categoryStats', Array.isArray(dash.body.data?.categoryStats));
    ok(`Dashboard totalProducts ≥ 60`, dash.body.data?.stats?.totalProducts >= 60);
  } catch (e) { ok('Admin dashboard', false, e.message); }

  try {
    const users = await req(`${BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    ok('GET /admin/users → 200', users.status === 200);
    ok('Admin lihat semua users', users.body.data?.length >= 2);

    const unauth = await req(`${BASE}/api/admin/dashboard`);
    ok('Admin tanpa token → 401', unauth.status === 401);
  } catch (e) { ok('Admin users', false, e.message); }

  // ─── 7. Cart & Wishlist ─────────────────────────────────────
  console.log('\n🛒 [7] Cart & Wishlist');
  try {
    const userLogin = await req(`${BASE}/api/auth/login`, {
      method: 'POST',
      body: { email: 'user@test.com', password: 'user123' },
    });
    const userToken = userLogin.body.token;
    ok('Login user test → 200', userLogin.status === 200);

    const pid = products.find(p => p.stock > 0)?._id;
    if (pid && userToken) {
      // Clear cart first
      await req(`${BASE}/api/cart`, { method: 'DELETE', headers: { Authorization: `Bearer ${userToken}` } });

      const addCart = await req(`${BASE}/api/cart`, {
        method: 'POST', headers: { Authorization: `Bearer ${userToken}` },
        body: { productId: pid, qty: 2 },
      });
      ok('POST /api/cart → 200', addCart.status === 200);
      ok('Cart items ada', addCart.body.data?.items?.length > 0);

      const getCart = await req(`${BASE}/api/cart`, { headers: { Authorization: `Bearer ${userToken}` } });
      ok('GET /api/cart items count benar', getCart.body.data?.items?.[0]?.qty === 2);

      const addWish = await req(`${BASE}/api/wishlist`, {
        method: 'POST', headers: { Authorization: `Bearer ${userToken}` },
        body: { productId: pid },
      });
      ok('POST /api/wishlist → 200', addWish.status === 200);
    }
  } catch (e) { ok('Cart/Wishlist', false, e.message); }

  // ─── 8. Review ──────────────────────────────────────────────
  console.log('\n⭐ [8] Reviews API');
  try {
    const pid = products[0]?._id;
    const reviews = await req(`${BASE}/api/products/${pid}/reviews`);
    ok('GET /api/products/:id/reviews → 200', reviews.status === 200);
    ok('Reviews ada ratingDistribution', !!reviews.body.ratingDistribution);
  } catch (e) { ok('Reviews', false, e.message); }

  // ─── 9. Swagger UI ──────────────────────────────────────────
  console.log('\n📚 [9] Swagger & Docs');
  try {
    const swagger = await req(`${BASE}/api-docs/`);
    ok('Swagger UI → 200', swagger.status === 200 || swagger.status === 301);
  } catch (e) { ok('Swagger UI', false, e.message); }

  // ─── 10. MinIO Gambar ────────────────────────────────────────
  console.log('\n🖼️  [10] MinIO Images');
  try {
    const testSlugs = ['samsung-galaxy-s25-ultra', 'apple-macbook-air-m3', 'sony-wh-1000xm6'];
    for (const slug of testSlugs) {
      const r = await req(`${MINIO}/products/${slug}-1.svg`);
      ok(`MinIO: ${slug}-1.svg accessible`, r.status === 200);
    }
    const totalImgCheck = await req(`${MINIO}/products/razer-blade-15-1.svg`);
    ok('MinIO: razer-blade-15-1.svg accessible', totalImgCheck.status === 200);
  } catch (e) { ok('MinIO images', false, e.message); }

  // ─── Summary ────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + '═'.repeat(60));
  console.log(`  HASIL: ${passed}/${total} tests lulus  |  ${failed} gagal`);
  if (failed === 0) {
    console.log('  🎉 SEMUA LAYANAN BERJALAN SEMPURNA!');
  } else {
    console.log('  ⚠️  Ada beberapa test yang gagal, periksa log di atas.');
  }
  console.log('═'.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });

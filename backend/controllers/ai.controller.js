  const { generateWithRetry } = require('../services/ollama.service');
const { getCache, setCache } = require('../services/cache.service');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const logger = require('../services/logger.service');

const AI_CACHE_TTL = 60 * 60 * 2; // 2 jam

// ===== Retrieval produk yang akurat untuk konteks AI =====
const STOPWORDS = new Set([
  'yang', 'untuk', 'dengan', 'atau', 'dan', 'saya', 'aku', 'mau', 'ingin', 'cari',
  'carikan', 'rekomendasi', 'rekomendasikan', 'tolong', 'dong', 'apa', 'apakah',
  'bagus', 'terbaik', 'bagusnya', 'murah', 'mahal', 'harga', 'budget', 'dibawah',
  'bawah', 'diatas', 'atas', 'sekitar', 'juta', 'jutaan', 'ribu', 'ribuan', 'rp',
  'di', 'ke', 'dari', 'ada', 'punya', 'buat', 'untukku', 'produk', 'barang', 'beli',
  'the', 'best', 'for', 'with', 'and',
]);

const CATEGORY_HINTS = [
  [/smartphone|handphone|\bhp\b|ponsel|iphone|android|galaxy|pixel/i, 'smartphone'],
  [/laptop|notebook|macbook|chromebook|ultrabook/i, 'laptop'],
  [/headphone|earphone|earbuds?|\btws\b|headset|airpods/i, 'headphone'],
  [/kamera|camera|dslr|mirrorless|gopro|action ?cam|camcorder/i, 'kamera'],
  [/smart ?tv|televisi|\btv\b|\boled\b|\bqled\b/i, 'smart-tv'],
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parsePriceIDR(text) {
  const toIDR = (num, unit) => {
    const n = parseFloat(String(num).replace(',', '.'));
    if (Number.isNaN(n)) return null;
    return /juta|jt/i.test(unit || '') ? n * 1e6 : /ribu|rb/i.test(unit || '') ? n * 1e3 : n;
  };
  const out = {};
  let m = text.match(/(?:di ?bawah|kurang dari|maksimal|max(?:imum)?|budget)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb)?/i);
  if (m) out.maxPrice = toIDR(m[1], m[2]);
  m = text.match(/(?:di ?atas|lebih dari|minimal|min(?:imum)?)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb)?/i);
  if (m) out.minPrice = toIDR(m[1], m[2]);
  // "5 jutaan" tanpa kata kunci arah dianggap batas atas
  if (!out.maxPrice && !out.minPrice) {
    m = text.match(/(\d+(?:[.,]\d+)?)\s*juta(?:an)?/i);
    if (m) out.maxPrice = toIDR(m[1], 'juta') * 1.2;
  }
  return out;
}

function keywordsOf(text) {
  return String(text).toLowerCase().split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9+-]/g, ''))
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .slice(0, 10);
}

// Kata jenis produk (earbuds, laptop, tv, ...) adalah sinyal kategori,
// bukan bagian dari nama produk — jangan diwajibkan saat AND-match.
const isTypeWord = (w) => CATEGORY_HINTS.some(([rx]) => rx.test(w));

/**
 * Retrieval hibrida: filter kategori+harga, lalu AND-match nama/brand,
 * fallback text-score, terakhir produk terpopuler dalam filter.
 */
async function findRelevantProducts(message, { limit = 5, select = 'name brand price category images specifications avgRating' } = {}) {
  const base = { isActive: true };
  const catHint = CATEGORY_HINTS.find(([rx]) => rx.test(message));
  if (catHint) {
    const cat = await Category.findOne({ slug: catHint[1] }).lean();
    if (cat) base.category = cat._id;
  }
  const { maxPrice, minPrice } = parsePriceIDR(message);
  if (maxPrice) base.price = { ...(base.price || {}), $lte: maxPrice };
  if (minPrice) base.price = { ...(base.price || {}), $gte: minPrice };

  const words = keywordsOf(message);
  const andWords = words.filter((w) => !isTypeWord(w));
  const q = (f, sort, proj) => Product.find(f, proj).sort(sort).limit(limit)
    .populate('category', 'name slug').select(select).lean();

  if (andWords.length) {
    const andFilter = {
      ...base,
      $and: andWords.map((w) => {
        const rx = new RegExp(escapeRegex(w), 'i');
        return { $or: [{ name: rx }, { brand: rx }] };
      }),
    };
    const hits = await q(andFilter, { avgRating: -1, reviewCount: -1 });
    if (hits.length) return hits;
  }
  if (words.length) {
    try {
      const textHits = await q(
        { ...base, $text: { $search: words.join(' ') } },
        { score: { $meta: 'textScore' } },
        { score: { $meta: 'textScore' } }
      );
      if (textHits.length) return textHits;
    } catch (_) { /* text index tidak tersedia */ }
  }
  return q(base, { avgRating: -1, reviewCount: -1 });
}

/**
 * @desc    AI Assistant - jawab pertanyaan tentang produk
 * @route   POST /api/ai/assistant
 */
const aiAssistant = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
  }

  const cacheKey = `ai:assistant:${Buffer.from(message.trim().toLowerCase()).toString('base64').slice(0, 64)}`;

  try {
    // Cek cache dulu
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Ambil produk yang relevan dari database (max 5)
    let products = [];
    try {
      products = await findRelevantProducts(message, { limit: 5 });
    } catch (_) {
      products = await Product.find({ isActive: true })
        .sort({ avgRating: -1 })
        .limit(5)
        .populate('category', 'name')
        .select('name brand price category specifications avgRating')
        .lean();
    }

    // Buat konteks produk
    const productContext = products.length > 0
      ? products.map((p) => {
          const specs = p.specifications instanceof Map
            ? Object.fromEntries(p.specifications)
            : (p.specifications || {});
          return `- ${p.name} (${p.brand}, ${p.category?.name || 'Elektronik'}): Rp${p.price?.toLocaleString('id-ID')}, Rating: ${p.avgRating}/5, Spesifikasi: ${JSON.stringify(specs)}`;
        }).join('\n')
      : 'Tidak ada produk tersedia saat ini.';

    const prompt = `Kamu adalah asisten belanja ElektroniKu yang membantu pelanggan memilih produk elektronik.

Data produk yang tersedia:
${productContext}

Pertanyaan pelanggan: ${message}

Jawab dengan bahasa Indonesia yang ramah, informatif, dan natural. HANYA rekomendasikan produk dari data di atas — jangan mengarang produk atau spesifikasi lain. Jika pelanggan menyebut batas harga, pastikan rekomendasimu sesuai batas itu. Jika data tidak cukup, sampaikan dengan sopan. Jangan menyebutkan bahwa kamu AI language model.`;

    const answer = await generateWithRetry(prompt, { maxTokens: 800 });

    const result = {
      answer,
      relatedProducts: products.map((p) => ({
        _id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        avgRating: p.avgRating,
        image: p.images?.[0],
      })),
    };

    await setCache(cacheKey, result, AI_CACHE_TTL);
    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    logger.error(`aiAssistant error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: `Layanan AI sedang tidak tersedia: ${error.message}`,
    });
  }
};

/**
 * @desc    AI Auto-Generate deskripsi produk dari spesifikasi
 * @route   POST /api/ai/generate-description
 */
const generateDescription = async (req, res) => {
  const { productId, specs, productName, brand, category } = req.body;

  if (!productId && !specs) {
    return res.status(400).json({ success: false, message: 'productId atau specs wajib diisi' });
  }

  try {
    let specsData = specs;
    let name = productName;
    let brandName = brand;
    let categoryName = category;

    if (productId) {
      const product = await Product.findById(productId).populate('category', 'name');
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }
      specsData = product.specifications instanceof Map
        ? Object.fromEntries(product.specifications)
        : (product.specifications || {});
      name = product.name;
      brandName = product.brand;
      categoryName = product.category?.name;
    }

    const cacheKey = `ai:description:${productId || Buffer.from(JSON.stringify(specsData)).toString('base64').slice(0, 40)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const prompt = `Kamu adalah copywriter produk elektronik profesional untuk toko online ElektroniKu.

Buat deskripsi produk yang menarik, informatif, dan persuasif dalam Bahasa Indonesia untuk:
Produk: ${name || 'Produk Elektronik'}
Brand: ${brandName || '-'}
Kategori: ${categoryName || 'Elektronik'}
Spesifikasi: ${JSON.stringify(specsData, null, 2)}

Syarat deskripsi:
- Panjang 150-250 kata
- Mulai dengan kalimat pembuka yang menarik
- Highlight fitur-fitur unggulan
- Sebutkan keunggulan dari spesifikasi tersebut
- Akhiri dengan ajakan untuk membeli
- Gunakan bahasa yang natural dan tidak terlalu teknis

Langsung tulis deskripsinya tanpa perlu pengantar atau penjelasan:`;

    const description = await generateWithRetry(prompt, { maxTokens: 500 });

    const result = { description };

    // Simpan ke produk jika productId disediakan
    if (productId) {
      await Product.findByIdAndUpdate(productId, { aiGeneratedDescription: description });
    }

    await setCache(cacheKey, result, AI_CACHE_TTL);
    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    logger.error(`generateDescription error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: `Layanan AI sedang tidak tersedia: ${error.message}`,
    });
  }
};

/**
 * @desc    AI Perbandingan produk
 * @route   POST /api/ai/compare
 */
const compareProducts = async (req, res) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
    return res.status(400).json({ success: false, message: 'Pilih 2-3 produk untuk dibandingkan' });
  }

  const cacheKey = `ai:compare:${productIds.sort().join(',')}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: true })
      .populate('category', 'name')
      .select('name brand price category specifications avgRating reviewCount images description')
      .lean();

    if (products.length < 2) {
      return res.status(404).json({ success: false, message: 'Satu atau lebih produk tidak ditemukan' });
    }

    const productDetails = products.map((p) => {
      const specs = p.specifications instanceof Map
        ? Object.fromEntries(p.specifications)
        : (p.specifications || {});
      return `${p.name} (${p.brand}):
  Harga: Rp${p.price?.toLocaleString('id-ID')}
  Rating: ${p.avgRating}/5 (${p.reviewCount} ulasan)
  Kategori: ${p.category?.name}
  Spesifikasi: ${JSON.stringify(specs)}`;
    }).join('\n\n');

    const prompt = `Kamu adalah ahli elektronik yang membantu pelanggan memilih produk terbaik.

Bandingkan produk-produk berikut secara objektif:

${productDetails}

Buat perbandingan yang mencakup:
1. **Ringkasan Singkat** setiap produk (1-2 kalimat)
2. **Kelebihan** masing-masing produk (3 poin)
3. **Kekurangan** masing-masing produk (2 poin)
4. **Rekomendasi**: produk mana yang cocok untuk siapa (misalnya: untuk gamer, untuk profesional, untuk penggunaan sehari-hari)
5. **Kesimpulan** pilihan terbaik berdasarkan nilai uang (value for money)

Gunakan Bahasa Indonesia yang mudah dipahami. Gunakan format yang jelas dengan heading.`;

    const comparison = await generateWithRetry(prompt, { maxTokens: 1200 });

    const result = {
      comparison,
      products: products.map((p) => ({
        _id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        avgRating: p.avgRating,
        image: p.images?.[0],
      })),
    };

    await setCache(cacheKey, result, AI_CACHE_TTL);
    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    logger.error(`compareProducts error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: `Layanan AI sedang tidak tersedia: ${error.message}`,
    });
  }
};

/**
 * @desc    AI Smart Search — cari produk berdasarkan bahasa natural
 * @route   POST /api/ai/smart-search
 */
const smartSearch = async (req, res) => {
  const { query } = req.body;

  if (!query?.trim()) {
    return res.status(400).json({ success: false, message: 'Query pencarian tidak boleh kosong' });
  }

  const cacheKey = `ai:smartsearch:${Buffer.from(query.trim().toLowerCase()).toString('base64').slice(0, 64)}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Minta AI untuk mengekstrak filter dari query natural
    const extractPrompt = `Analisis query pencarian produk elektronik berikut dan ekstrak informasi filter dalam format JSON.

Query: "${query}"

Kembalikan JSON dengan format:
{
  "keywords": ["kata kunci pencarian"],
  "category": "nama kategori jika ada (smartphone/laptop/kamera/headphone/tv/tablet/gaming/audio/null)",
  "maxPrice": angka harga maksimum jika disebutkan atau null,
  "minPrice": angka harga minimum jika ada atau null,
  "brands": ["nama brand jika disebutkan"],
  "features": ["fitur yang dicari"],
  "useCase": "kegunaan/tujuan produk"
}

Hanya kembalikan JSON, tidak ada teks lain:`;

    let filters = {};
    try {
      const filterJson = await generateWithRetry(extractPrompt, { maxTokens: 300 });
      // Extract JSON dari respons
      const jsonMatch = filterJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        filters = JSON.parse(jsonMatch[0]);
      }
    } catch (_) {
      // Fallback ke pencarian teks biasa
      filters = { keywords: query.split(' ') };
    }

    // Bangun query MongoDB berdasarkan filter yang diekstrak
    const mongoFilter = { isActive: true };
    const CATEGORY_SLUG_MAP = {
      smartphone: 'smartphone', hp: 'smartphone', laptop: 'laptop',
      kamera: 'kamera', camera: 'kamera', headphone: 'headphone',
      audio: 'headphone', earphone: 'headphone', tv: 'smart-tv', 'smart-tv': 'smart-tv',
    };
    const slug = CATEGORY_SLUG_MAP[String(filters.category || '').toLowerCase()];
    if (slug) {
      const cat = await Category.findOne({ slug }).lean();
      if (cat) mongoFilter.category = cat._id;
    }
    if (filters.maxPrice) mongoFilter.price = { ...mongoFilter.price, $lte: filters.maxPrice };
    if (filters.minPrice) mongoFilter.price = { ...mongoFilter.price, $gte: filters.minPrice };
    if (filters.brands?.length > 0) {
      mongoFilter.brand = { $in: filters.brands.map((b) => new RegExp(escapeRegex(b), 'i')) };
    }

    // Cari dengan AND-match nama/brand dulu, fallback ke text-score
    const kw = keywordsOf((filters.keywords || []).join(' '));
    const andKw = kw.filter((w) => !isTypeWord(w));
    let products = [];
    if (andKw.length) {
      products = await Product.find({
        ...mongoFilter,
        $and: andKw.map((w) => {
          const rx = new RegExp(escapeRegex(w), 'i');
          return { $or: [{ name: rx }, { brand: rx }] };
        }),
      })
        .sort({ avgRating: -1, reviewCount: -1 })
        .limit(10)
        .populate('category', 'name')
        .select('name brand price category images avgRating specifications')
        .lean();

      if (!products.length) {
        try {
          products = await Product.find(
            { ...mongoFilter, $text: { $search: kw.join(' ') } },
            { score: { $meta: 'textScore' } }
          )
            .sort({ score: { $meta: 'textScore' } })
            .limit(10)
            .populate('category', 'name')
            .select('name brand price category images avgRating specifications')
            .lean();
        } catch (_) { /* abaikan */ }
      }
    }
    if (!products.length) {
      products = await Product.find(mongoFilter)
        .sort({ avgRating: -1 })
        .limit(10)
        .populate('category', 'name')
        .select('name brand price category images avgRating specifications')
        .lean();
    }

    const result = {
      products,
      extractedFilters: filters,
      total: products.length,
    };

    await setCache(cacheKey, result, 30 * 60); // Cache 30 menit untuk smart search
    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    logger.error(`smartSearch error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: `Layanan AI sedang tidak tersedia: ${error.message}`,
    });
  }
};

/**
 * @desc    AI Review Summarizer — rangkum semua ulasan produk
 * @route   POST /api/ai/summarize-reviews
 */
const summarizeReviews = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId wajib diisi' });
  }

  const cacheKey = `ai:reviews:${productId}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const product = await Product.findById(productId).select('name brand');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const reviews = await Review.find({ product: productId, isApproved: true })
      .select('rating comment')
      .limit(50)
      .lean();

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: 'Belum ada ulasan untuk produk ini.',
          positives: [],
          negatives: [],
          recommendation: 'Jadilah yang pertama memberikan ulasan!',
        },
        cached: false,
      });
    }

    const reviewText = reviews
      .map((r) => `Rating ${r.rating}/5: ${r.comment}`)
      .join('\n');

    const prompt = `Kamu adalah analis ulasan produk. Rangkum ulasan-ulasan berikut untuk produk "${product.name}" (${product.brand}).

Ulasan (${reviews.length} ulasan):
${reviewText}

Buat ringkasan dalam format JSON:
{
  "summary": "ringkasan keseluruhan dalam 2-3 kalimat",
  "positives": ["poin positif utama 1", "poin positif 2", "poin positif 3"],
  "negatives": ["keluhan utama 1", "keluhan 2"],
  "recommendation": "rekomendasi singkat: layak beli atau tidak dan untuk siapa",
  "sentimentScore": angka antara 0-10 berdasarkan sentimen keseluruhan
}

Hanya kembalikan JSON, tidak ada teks lain:`;

    let summaryData;
    try {
      const raw = await generateWithRetry(prompt, { maxTokens: 600 });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: raw };
    } catch (_) {
      summaryData = { summary: 'Gagal membuat ringkasan AI.', positives: [], negatives: [] };
    }

    const result = {
      ...summaryData,
      reviewCount: reviews.length,
      avgRating: product.avgRating || (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
    };

    await setCache(cacheKey, result, AI_CACHE_TTL);
    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    logger.error(`summarizeReviews error: ${error.message}`);
    res.status(503).json({
      success: false,
      message: `Layanan AI sedang tidak tersedia: ${error.message}`,
    });
  }
};

module.exports = { aiAssistant, generateDescription, compareProducts, smartSearch, summarizeReviews };

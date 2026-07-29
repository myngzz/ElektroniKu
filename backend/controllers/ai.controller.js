const { generateWithRetry } = require('../services/ollama.service');
const { getCache, setCache } = require('../services/cache.service');
const Product = require('../models/Product');
const Review = require('../models/Review');
const logger = require('../services/logger.service');

const AI_CACHE_TTL = 60 * 60 * 2; // 2 jam

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
    const searchTerms = message.split(' ').filter((w) => w.length > 3).join(' ');
    let products = [];
    try {
      products = await Product.find(
        { $text: { $search: searchTerms }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5)
        .populate('category', 'name')
        .select('name brand price category specifications avgRating')
        .lean();
    } catch (_) {
      // Fallback: ambil produk terbaru jika search gagal
      products = await Product.find({ isActive: true })
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

Jawab dengan bahasa Indonesia yang ramah, informatif, dan natural. Fokus pada informasi yang relevan dari data produk di atas. Jika data tidak cukup, sampaikan dengan sopan. Jangan menyebutkan bahwa kamu AI language model.`;

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
    if (filters.keywords?.length > 0) {
      mongoFilter.$text = { $search: filters.keywords.join(' ') };
    }
    if (filters.maxPrice) mongoFilter.price = { ...mongoFilter.price, $lte: filters.maxPrice };
    if (filters.minPrice) mongoFilter.price = { ...mongoFilter.price, $gte: filters.minPrice };
    if (filters.brands?.length > 0) {
      mongoFilter.brand = { $in: filters.brands.map((b) => new RegExp(b, 'i')) };
    }

    let products;
    if (filters.keywords?.length > 0) {
      products = await Product.find(mongoFilter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .populate('category', 'name')
        .select('name brand price category images avgRating specifications')
        .lean();
    } else {
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

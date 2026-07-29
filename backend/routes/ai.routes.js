const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { aiAssistant, generateDescription, compareProducts, smartSearch, summarizeReviews } = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

// Semua endpoint AI menggunakan rate limiter
router.use(aiLimiter);

/**
 * @swagger
 * /api/ai/assistant:
 *   post:
 *     tags: [AI]
 *     summary: AI Product Assistant - tanya soal produk
 *     description: Tanya AI tentang produk elektronik. AI akan mencari produk relevan di database dan memberikan jawaban kontekstual. Hasil di-cache selama 2 jam.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "HP gaming terbaik di bawah 5 juta?"
 *     responses:
 *       200:
 *         description: Jawaban AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 cached: { type: boolean, description: "true jika diambil dari cache" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer: { type: string }
 *                     relatedProducts: { type: array, items: { $ref: '#/components/schemas/Product' } }
 *       503:
 *         description: Layanan AI tidak tersedia (Ollama timeout/down)
 */
router.post('/assistant', [body('message').trim().notEmpty().withMessage('Pesan tidak boleh kosong')], aiAssistant);

/**
 * @swagger
 * /api/ai/generate-description:
 *   post:
 *     tags: [AI]
 *     summary: AI Auto-Generate deskripsi produk (Admin)
 *     description: Buat deskripsi marketing dari spesifikasi teknis menggunakan AI. Bisa berdasarkan productId atau raw specs.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string, description: "ID produk yang sudah ada" }
 *               productName: { type: string, example: "Laptop Gaming ASUS ROG" }
 *               brand: { type: string, example: "ASUS" }
 *               category: { type: string, example: "Laptop" }
 *               specs:
 *                 type: object
 *                 additionalProperties: true
 *                 example: { CPU: "Intel i7-13700H", RAM: "16GB DDR5", GPU: "RTX 4060", Layar: "15.6 inch 144Hz" }
 *     responses:
 *       200:
 *         description: Deskripsi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     description: { type: string }
 *       503:
 *         description: Layanan AI tidak tersedia
 */
router.post('/generate-description', protect, generateDescription);

/**
 * @swagger
 * /api/ai/compare:
 *   post:
 *     tags: [AI]
 *     summary: AI Perbandingan produk
 *     description: Bandingkan 2-3 produk secara objektif. AI memberikan analisis kelebihan/kekurangan dan rekomendasi untuk kebutuhan berbeda.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productIds]
 *             properties:
 *               productIds:
 *                 type: array
 *                 items: { type: string }
 *                 minItems: 2
 *                 maxItems: 3
 *                 example: ["664f1b2c3d4e5f6a7b8c9d0e", "664f1b2c3d4e5f6a7b8c9d0f"]
 *     responses:
 *       200:
 *         description: Perbandingan produk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison: { type: string, description: "Analisis perbandingan dalam Markdown" }
 *                     products: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */
router.post('/compare', [body('productIds').isArray({ min: 2, max: 3 }).withMessage('Pilih 2-3 produk')], compareProducts);

/**
 * @swagger
 * /api/ai/smart-search:
 *   post:
 *     tags: [AI]
 *     summary: AI Smart Search — pencarian bahasa natural
 *     description: Cari produk menggunakan bahasa natural. AI mengekstrak filter (kategori, harga, brand, fitur) dari query lalu mencari produk yang cocok.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 example: "kamera mirrorless murah untuk vlogging di bawah 8 juta"
 *     responses:
 *       200:
 *         description: Hasil pencarian cerdas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     products: { type: array, items: { $ref: '#/components/schemas/Product' } }
 *                     extractedFilters: { type: object, description: "Filter yang diekstrak AI dari query" }
 *                     total: { type: integer }
 */
router.post('/smart-search', [body('query').trim().notEmpty().withMessage('Query tidak boleh kosong')], smartSearch);

/**
 * @swagger
 * /api/ai/summarize-reviews:
 *   post:
 *     tags: [AI]
 *     summary: AI Review Summarizer
 *     description: Rangkum semua ulasan pengguna untuk suatu produk. AI menganalisis sentimen dan mengekstrak poin positif/negatif utama.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "664f1b2c3d4e5f6a7b8c9d0e"
 *     responses:
 *       200:
 *         description: Ringkasan ulasan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary: { type: string }
 *                     positives: { type: array, items: { type: string } }
 *                     negatives: { type: array, items: { type: string } }
 *                     recommendation: { type: string }
 *                     sentimentScore: { type: number }
 *                     reviewCount: { type: integer }
 */
router.post('/summarize-reviews', [body('productId').notEmpty().isMongoId().withMessage('productId tidak valid')], summarizeReviews);

module.exports = router;

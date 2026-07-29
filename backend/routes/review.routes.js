const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams untuk akses :id dari parent
const { body } = require('express-validator');
const { getProductReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Ambil ulasan produk
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID produk
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [createdAt, rating] }
 *     responses:
 *       200:
 *         description: Daftar ulasan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 ratingDistribution: { type: array }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', getProductReviews);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Tambah ulasan produk
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment: { type: string, example: "Produk bagus, sesuai ekspektasi!" }
 *               images: { type: array, items: { type: string }, description: "URL gambar dari upload" }
 *     responses:
 *       201:
 *         description: Ulasan berhasil ditambahkan
 *       400:
 *         description: Sudah pernah review atau validasi gagal
 *       401:
 *         description: Tidak terautentikasi
 */
router.post(
  '/',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1-5'),
    body('comment').trim().notEmpty().withMessage('Komentar wajib diisi').isLength({ max: 2000 }),
  ],
  createReview
);

/**
 * @swagger
 * /api/products/{id}/reviews/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Hapus ulasan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ulasan berhasil dihapus
 *       403:
 *         description: Tidak punya izin
 */
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;

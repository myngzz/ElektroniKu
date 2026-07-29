const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Ambil wishlist user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar produk di wishlist
 */
router.get('/', getWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     tags: [Wishlist]
 *     summary: Tambah produk ke wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *     responses:
 *       200:
 *         description: Produk ditambahkan ke wishlist
 */
router.post('/', addToWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Hapus produk dari wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produk dihapus dari wishlist
 */
router.delete('/:productId', removeFromWishlist);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect); // Semua route cart butuh auth

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Ambil keranjang belanja
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Isi keranjang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     items: { type: array }
 *                     subtotal: { type: number }
 *                     totalItems: { type: integer }
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Tambah produk ke keranjang
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
 *               qty: { type: integer, default: 1, minimum: 1 }
 *     responses:
 *       200:
 *         description: Produk ditambahkan ke keranjang
 */
router.post('/', addToCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update jumlah item di keranjang
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qty]
 *             properties:
 *               qty: { type: integer, minimum: 0, description: "Set ke 0 untuk menghapus item" }
 *     responses:
 *       200:
 *         description: Keranjang diupdate
 */
router.put('/:productId', updateCartItem);

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Hapus item dari keranjang
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item dihapus dari keranjang
 */
router.delete('/:productId', removeFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Kosongkan seluruh keranjang
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Keranjang dikosongkan
 */
router.delete('/', clearCart);

module.exports = router;

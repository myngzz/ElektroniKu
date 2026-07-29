const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Cart]
 *     summary: Riwayat pesanan user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pesanan
 */
router.get('/', getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Cart]
 *     summary: Detail pesanan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pesanan
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Cart]
 *     summary: Checkout - buat pesanan dari keranjang
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required: [name, street, city]
 *                 properties:
 *                   name: { type: string, example: "Budi Santoso" }
 *                   phone: { type: string, example: "08123456789" }
 *                   street: { type: string, example: "Jl. Sudirman No. 10" }
 *                   city: { type: string, example: "Jakarta" }
 *                   province: { type: string, example: "DKI Jakarta" }
 *                   postalCode: { type: string, example: "10220" }
 *               shippingCost: { type: number, default: 0 }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat
 *       400:
 *         description: Keranjang kosong atau stok tidak cukup
 */
router.post('/', createOrder);

module.exports = router;

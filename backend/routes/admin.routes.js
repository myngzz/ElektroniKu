const express = require('express');
const router = express.Router();
const { getDashboard, getOrders, updateOrderStatus, getUsers } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect, adminOnly);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard statistik admin
 *     description: Statistik ringkas termasuk total produk, user, order, pendapatan, produk terlaris, stok menipis, dll.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalProducts: { type: integer }
 *                         totalUsers: { type: integer }
 *                         totalOrders: { type: integer }
 *                         totalRevenue: { type: number }
 *                         thisMonthRevenue: { type: number }
 *                         revenueGrowth: { type: number }
 *                     recentOrders: { type: array }
 *                     topProducts: { type: array }
 *                     lowStockProducts: { type: array }
 *                     charts: { type: object }
 *       403:
 *         description: Bukan admin
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: Daftar semua order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Daftar order
 */
router.get('/orders', getOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update status order
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
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Status order diupdate
 */
router.put('/orders/:id', updateOrderStatus);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Daftar semua user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Daftar user
 */
router.get('/users', getUsers);

module.exports = router;

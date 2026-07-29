const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Ambil semua kategori
 *     responses:
 *       200:
 *         description: Daftar kategori
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Category' }
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Ambil detail kategori
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID atau slug kategori
 *     responses:
 *       200:
 *         description: Detail kategori
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Buat kategori baru (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Smartphone" }
 *               slug: { type: string, example: "smartphone" }
 *               description: { type: string }
 *               icon: { type: string, example: "📱" }
 *               specFields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key: { type: string, example: "ram" }
 *                     label: { type: string, example: "RAM" }
 *                     unit: { type: string, example: "GB" }
 *                     type: { type: string, enum: [text, number, boolean, select] }
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 */
router.post(
  '/',
  protect,
  adminOnly,
  [body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi')],
  createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update kategori (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Category' }
 *     responses:
 *       200:
 *         description: Kategori berhasil diupdate
 */
router.put('/:id', protect, adminOnly, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Hapus kategori (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 */
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Ambil daftar produk
 *     description: Daftar produk dengan filter, sort, dan pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: Filter berdasarkan nama brand
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *         description: Harga minimum
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Harga maksimum
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [createdAt, price, rating, name] }
 *         description: Kolom sorting
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *         description: Arah sorting
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 50 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Pencarian teks (nama, deskripsi, brand)
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *         description: Filter produk unggulan
 *     responses:
 *       200:
 *         description: Daftar produk berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     tags: [Products]
 *     summary: Ambil daftar brand unik
 *     responses:
 *       200:
 *         description: Daftar brand
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { type: string }
 */
router.get('/brands', getBrands);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Ambil detail produk
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID produk (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Detail produk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get('/:id', getProductById);

const productValidation = [
  body('name').trim().notEmpty().withMessage('Nama produk wajib diisi').isLength({ max: 200 }),
  body('brand').trim().notEmpty().withMessage('Brand wajib diisi'),
  body('category').notEmpty().withMessage('Kategori wajib dipilih').isMongoId().withMessage('ID kategori tidak valid'),
  body('price').isFloat({ min: 0 }).withMessage('Harga tidak valid'),
  body('stock').isInt({ min: 0 }).withMessage('Stok tidak valid'),
];

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Buat produk baru (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, category, price, stock]
 *             properties:
 *               name: { type: string, example: "iPhone 15 Pro" }
 *               brand: { type: string, example: "Apple" }
 *               category: { type: string, example: "664f1b2c3d4e5f6a7b8c9d0a" }
 *               price: { type: number, example: 22999000 }
 *               originalPrice: { type: number, example: 24999000 }
 *               stock: { type: integer, example: 30 }
 *               images: { type: array, items: { type: string } }
 *               specifications:
 *                 type: object
 *                 additionalProperties: true
 *                 example: { RAM: "8GB", Storage: "256GB" }
 *               description: { type: string }
 *               isFeatured: { type: boolean }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat
 *       400:
 *         description: Validasi gagal
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Bukan admin
 */
router.post('/', protect, adminOnly, productValidation, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update produk (Admin)
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
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               specifications: { type: object, additionalProperties: true }
 *               isActive: { type: boolean }
 *               isFeatured: { type: boolean }
 *     responses:
 *       200:
 *         description: Produk berhasil diupdate
 *       404:
 *         description: Produk tidak ditemukan
 */
router.put('/:id', protect, adminOnly, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Hapus produk (Admin, soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *       404:
 *         description: Produk tidak ditemukan
 */
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;

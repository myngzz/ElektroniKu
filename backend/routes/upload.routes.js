const { upload, uploadToMinio } = require('../services/upload.service');
const logger = require('../services/logger.service');
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload gambar ke MinIO
 *     description: "Upload satu gambar (max 10MB). Format yang didukung: JPEG, PNG, WebP, GIF. Mengembalikan URL publik gambar."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File gambar (JPEG/PNG/WebP/GIF, maks 10MB)
 *               folder:
 *                 type: string
 *                 description: "Subfolder di bucket (opsional, contoh: products, reviews)"
 *                 example: products
 *     responses:
 *       200:
 *         description: Upload berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: "http://localhost:9000/products/uuid.jpg" }
 *                     fileName: { type: string, example: "products/uuid.jpg" }
 *       400:
 *         description: Format file tidak valid atau tidak ada file
 *       401:
 *         description: Tidak terautentikasi
 *       413:
 *         description: File terlalu besar (> 10MB)
 */
router.post('/', protect, uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Ukuran file melebihi batas 10MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    }

    const folder = req.body.folder || 'products';
    // Sanitize folder name
    const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50) || 'products';

    const { fileName, url } = await uploadToMinio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      safeFolder
    );

    logger.info(`Upload berhasil oleh user ${req.user._id}: ${fileName}`);
    res.json({ success: true, message: 'Upload berhasil', data: { url, fileName } });
  } catch (error) {
    logger.error(`Upload error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal upload gambar' });
  }
});

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     tags: [Upload]
 *     summary: Upload beberapa gambar sekaligus (max 5)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 example: products
 *     responses:
 *       200:
 *         description: Upload berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url: { type: string }
 *                       fileName: { type: string }
 */
router.post('/multiple', protect, uploadLimiter, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Ukuran file melebihi batas 10MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    }

    const folder = (req.body.folder || 'products').replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50) || 'products';

    const uploads = await Promise.all(
      req.files.map((file) => uploadToMinio(file.buffer, file.originalname, file.mimetype, folder))
    );

    res.json({ success: true, message: `${uploads.length} gambar berhasil diupload`, data: uploads });
  } catch (error) {
    logger.error(`Multiple upload error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal upload gambar' });
  }
});

module.exports = router;

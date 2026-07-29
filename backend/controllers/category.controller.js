const Category = require('../models/Category');
const logger = require('../services/logger.service');
const { validationResult } = require('express-validator');

/**
 * @desc    Ambil semua kategori
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).select('-__v').lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error(`getCategories error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori' });
  }
};

/**
 * @desc    Ambil detail kategori berdasarkan ID/slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const category = await Category.findOne({ ...query, isActive: true }).select('-__v');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    logger.error(`getCategoryById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori' });
  }
};

/**
 * @desc    Buat kategori baru
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const existing = await Category.findOne({ slug: req.body.slug || req.body.name?.toLowerCase().replace(/\s+/g, '-') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kategori dengan nama/slug ini sudah ada' });
    }

    const category = await Category.create(req.body);
    logger.info(`Kategori baru dibuat: ${category.name}`);
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    logger.error(`createCategory error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal membuat kategori' });
  }
};

/**
 * @desc    Update kategori
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kategori berhasil diupdate', data: category });
  } catch (error) {
    logger.error(`updateCategory error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengupdate kategori' });
  }
};

/**
 * @desc    Hapus kategori (soft delete)
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    logger.error(`deleteCategory error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori' });
  }
};

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

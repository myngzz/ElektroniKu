const Product = require('../models/Product');
const Category = require('../models/Category');
const logger = require('../services/logger.service');
const { validationResult } = require('express-validator');

/**
 * @desc    Ambil semua produk dengan filter, sort, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
      search,
      featured,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$text = { $search: search };
    }

    const sortMap = {
      price: { price: order === 'asc' ? 1 : -1 },
      rating: { avgRating: -1 },
      createdAt: { createdAt: -1 },
      name: { name: order === 'asc' ? 1 : -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug icon')
        .select('-__v')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    logger.error(`getProducts error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar produk' });
  }
};

/**
 * @desc    Ambil detail produk berdasarkan ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate('category', 'name slug icon specFields')
      .select('-__v');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
    }
    logger.error(`getProductById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail produk' });
  }
};

/**
 * @desc    Buat produk baru
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Verifikasi kategori ada
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const product = await Product.create(req.body);
    const populated = await product.populate('category', 'name slug icon');

    logger.info(`Produk baru dibuat: ${product.name} oleh admin ${req.user._id}`);
    res.status(201).json({ success: true, message: 'Produk berhasil dibuat', data: populated });
  } catch (error) {
    logger.error(`createProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal membuat produk' });
  }
};

/**
 * @desc    Update produk
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Jika category diubah, verifikasi ada
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name slug icon');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    logger.info(`Produk diupdate: ${product.name} oleh admin ${req.user._id}`);
    res.json({ success: true, message: 'Produk berhasil diupdate', data: product });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
    }
    logger.error(`updateProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengupdate produk' });
  }
};

/**
 * @desc    Hapus produk (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    logger.info(`Produk dihapus: ${product.name} oleh admin ${req.user._id}`);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
    }
    logger.error(`deleteProduct error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
  }
};

/**
 * @desc    Ambil daftar brand unik
 * @route   GET /api/products/brands
 * @access  Public
 */
const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ success: true, data: brands.sort() });
  } catch (error) {
    logger.error(`getBrands error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar brand' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getBrands };

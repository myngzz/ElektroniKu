const Review = require('../models/Review');
const Product = require('../models/Product');
const logger = require('../services/logger.service');
const { validationResult } = require('express-validator');
const { uploadToMinio } = require('../services/upload.service');

/**
 * @desc    Ambil semua review suatu produk
 * @route   GET /api/products/:id/reviews
 */
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const filter = { product: req.params.id, isApproved: true };
    const sortObj = sort === 'rating' ? { rating: -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Distribusi rating
    const ratingDist = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.id), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      success: true,
      data: reviews,
      ratingDistribution: ratingDist,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    logger.error(`getProductReviews error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil ulasan' });
  }
};

/**
 * @desc    Tambah review ke produk
 * @route   POST /api/products/:id/reviews
 */
const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Cek sudah review sebelumnya
    const existing = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk produk ini' });
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || [],
    });

    const populated = await review.populate('user', 'name avatar');

    logger.info(`Review baru untuk produk ${req.params.id} oleh user ${req.user._id}`);
    res.status(201).json({ success: true, message: 'Ulasan berhasil ditambahkan', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk produk ini' });
    }
    logger.error(`createReview error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menambah ulasan' });
  }
};

/**
 * @desc    Hapus review (user sendiri atau admin)
 * @route   DELETE /api/products/:id/reviews/:reviewId
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan' });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Tidak punya izin menghapus ulasan ini' });
    }

    await review.deleteOne();
    // Recalculate avgRating
    await Review.calcAvgRating(review.product);

    res.json({ success: true, message: 'Ulasan berhasil dihapus' });
  } catch (error) {
    logger.error(`deleteReview error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menghapus ulasan' });
  }
};

module.exports = { getProductReviews, createReview, deleteReview };

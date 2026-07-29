const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const logger = require('../services/logger.service');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name brand price images avgRating isActive stock')
      .lean();

    if (!wishlist) {
      wishlist = { user: req.user._id, products: [] };
    }

    const activeProducts = (wishlist.products || []).filter((p) => p && p.isActive);

    res.json({ success: true, data: { ...wishlist, products: activeProducts } });
  } catch (error) {
    logger.error(`getWishlist error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil wishlist' });
  }
};

const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId wajib diisi' });
  }

  try {
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate('products', 'name brand price images avgRating');

    res.json({ success: true, message: 'Produk ditambahkan ke wishlist', data: wishlist });
  } catch (error) {
    logger.error(`addToWishlist error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menambah ke wishlist' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: req.params.productId } },
      { new: true }
    ).populate('products', 'name brand price images avgRating');

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist tidak ditemukan' });
    }

    res.json({ success: true, message: 'Produk dihapus dari wishlist', data: wishlist });
  } catch (error) {
    logger.error(`removeFromWishlist error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menghapus dari wishlist' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };

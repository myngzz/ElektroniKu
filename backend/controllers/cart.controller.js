const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../services/logger.service');

/**
 * @desc    Ambil keranjang user
 * @route   GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name brand price images stock isActive')
      .lean();

    if (!cart) {
      cart = { user: req.user._id, items: [] };
    }

    // Filter produk yang tidak aktif atau stok habis
    const validItems = (cart.items || []).filter(
      (item) => item.product && item.product.isActive
    );

    const subtotal = validItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.qty,
      0
    );

    res.json({
      success: true,
      data: {
        ...cart,
        items: validItems,
        subtotal,
        totalItems: validItems.reduce((sum, item) => sum + item.qty, 0),
      },
    });
  } catch (error) {
    logger.error(`getCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil keranjang' });
  }
};

/**
 * @desc    Tambah/update item di keranjang
 * @route   POST /api/cart
 */
const addToCart = async (req, res) => {
  const { productId, qty = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId wajib diisi' });
  }

  try {
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: `Stok tidak cukup. Stok tersedia: ${product.stock}` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].qty + parseInt(qty);
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Stok tidak cukup. Stok tersedia: ${product.stock}` });
      }
      cart.items[itemIndex].qty = newQty;
    } else {
      cart.items.push({ product: productId, qty: parseInt(qty) });
    }

    await cart.save();
    await cart.populate('items.product', 'name brand price images stock');

    res.json({ success: true, message: 'Produk ditambahkan ke keranjang', data: cart });
  } catch (error) {
    logger.error(`addToCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menambah ke keranjang' });
  }
};

/**
 * @desc    Update qty item di keranjang
 * @route   PUT /api/cart/:productId
 */
const updateCartItem = async (req, res) => {
  const { qty } = req.body;

  if (!qty || qty < 0) {
    return res.status(400).json({ success: false, message: 'Jumlah tidak valid' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Keranjang tidak ditemukan' });
    }

    if (qty === 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    } else {
      const item = cart.items.find((item) => item.product.toString() === req.params.productId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item tidak ada di keranjang' });
      }

      const product = await Product.findById(req.params.productId);
      if (qty > product.stock) {
        return res.status(400).json({ success: false, message: `Stok tidak cukup. Stok tersedia: ${product.stock}` });
      }
      item.qty = parseInt(qty);
    }

    await cart.save();
    await cart.populate('items.product', 'name brand price images stock');

    res.json({ success: true, message: 'Keranjang diupdate', data: cart });
  } catch (error) {
    logger.error(`updateCartItem error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengupdate keranjang' });
  }
};

/**
 * @desc    Hapus item dari keranjang
 * @route   DELETE /api/cart/:productId
 */
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: req.params.productId } } },
      { new: true }
    ).populate('items.product', 'name brand price images');

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Keranjang tidak ditemukan' });
    }

    res.json({ success: true, message: 'Item dihapus dari keranjang', data: cart });
  } catch (error) {
    logger.error(`removeFromCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal menghapus item dari keranjang' });
  }
};

/**
 * @desc    Kosongkan keranjang
 * @route   DELETE /api/cart
 */
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    res.json({ success: true, message: 'Keranjang berhasil dikosongkan' });
  } catch (error) {
    logger.error(`clearCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengosongkan keranjang' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

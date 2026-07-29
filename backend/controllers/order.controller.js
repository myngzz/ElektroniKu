const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../services/logger.service');

/**
 * @desc    Checkout simulasi — buat order dari keranjang
 * @route   POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang kosong' });
    }

    const { shippingAddress, shippingCost = 0, notes } = req.body;

    if (!shippingAddress?.name || !shippingAddress?.street || !shippingAddress?.city) {
      return res.status(400).json({ success: false, message: 'Alamat pengiriman tidak lengkap' });
    }

    // Validasi stok & bangun order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Produk "${product?.name || 'tidak diketahui'}" sudah tidak tersedia`,
        });
      }
      if (product.stock < cartItem.qty) {
        return res.status(400).json({
          success: false,
          message: `Stok "${product.name}" tidak cukup. Tersedia: ${product.stock}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: cartItem.qty,
        image: product.images?.[0],
      });
      subtotal += product.price * cartItem.qty;
    }

    const total = subtotal + parseFloat(shippingCost);

    // Kurangi stok
    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.qty } })
      )
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost: parseFloat(shippingCost),
      total,
      notes,
    });

    // Kosongkan keranjang
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    logger.info(`Order dibuat: ${order.orderNumber} oleh user ${req.user._id}`);
    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat!', data: order });
  } catch (error) {
    logger.error(`createOrder error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan' });
  }
};

/**
 * @desc    Ambil riwayat order user
 * @route   GET /api/orders
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error(`getMyOrders error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesanan' });
  }
};

/**
 * @desc    Detail order
 * @route   GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error(`getOrderById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail order' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };

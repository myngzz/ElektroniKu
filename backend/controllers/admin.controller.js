const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Category = require('../models/Category');
const logger = require('../services/logger.service');

/**
 * @desc    Dashboard statistik ringkas untuk admin
 * @route   GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      ordersThisMonth,
      recentOrders,
      topProducts,
      ordersByStatus,
      categoryStats,
      lowStockProducts,
      recentUsers,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .select('orderNumber user total status createdAt')
        .lean(),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        { $project: { productName: '$product.name', brand: '$product.brand', totalSold: 1, revenue: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
          },
        },
        { $project: { name: 1, productCount: { $size: '$products' } } },
      ]),
      Product.find({ isActive: true, stock: { $lte: 5 } })
        .select('name brand stock images')
        .sort({ stock: 1 })
        .limit(10)
        .lean(),
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt')
        .lean(),
    ]);

    const totalRev = totalRevenue[0]?.total || 0;
    const thisMonthRev = revenueThisMonth[0]?.total || 0;
    const lastMonthRev = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0
      ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
      : 0;

    // Data chart: pendapatan 6 bulan terakhir
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue: totalRev,
          thisMonthRevenue: thisMonthRev,
          revenueGrowth: parseFloat(revenueGrowth),
          ordersThisMonth,
        },
        recentOrders,
        topProducts,
        ordersByStatus,
        categoryStats,
        lowStockProducts,
        recentUsers,
        charts: {
          revenueByMonth,
        },
      },
    });
  } catch (error) {
    logger.error(`getDashboard error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard' });
  }
};

/**
 * @desc    Ambil semua order (admin)
 * @route   GET /api/admin/orders
 */
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    logger.error(`getOrders error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar order' });
  }
};

/**
 * @desc    Update status order
 * @route   PUT /api/admin/orders/:id
 */
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    res.json({ success: true, message: 'Status order diupdate', data: order });
  } catch (error) {
    logger.error(`updateOrderStatus error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengupdate order' });
  }
};

/**
 * @desc    Daftar semua user (admin)
 * @route   GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .select('-passwordHash')
        .lean(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    logger.error(`getUsers error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar user' });
  }
};

module.exports = { getDashboard, getOrders, updateOrderStatus, getUsers };

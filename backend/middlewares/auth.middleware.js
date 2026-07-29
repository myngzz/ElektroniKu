const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../services/logger.service');

/**
 * Middleware: verifikasi JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Akses ditolak: token tidak ada' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Token tidak valid atau akun tidak aktif' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token sudah kadaluarsa, silakan login ulang' });
    }
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Kesalahan server saat verifikasi token' });
  }
};

/**
 * Middleware: cek role admin
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: hanya untuk admin' });
  }
  next();
};

/**
 * Middleware: optional auth (tidak gagal jika tidak ada token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.isActive) req.user = user;
    }
  } catch (_) {
    // Token invalid/expired, lanjutkan tanpa user
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };

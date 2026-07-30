const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../services/logger.service');
const { validationResult } = require('express-validator');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Daftar akun baru
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const user = await User.create({ name, email, passwordHash: password });

    const token = generateToken(user._id, user.role);

    logger.info(`Pengguna baru terdaftar: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`register error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mendaftar, coba lagi' });
  }
};

/**
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+passwordHash');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    logger.info(`Login berhasil: ${email}`);
    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error(`login error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal login, coba lagi' });
  }
};

/**
 * @desc    Ambil profil user yang sedang login
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error(`getMe error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil profil' });
  }
};

/**
 * @desc    Update profil user
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v');

    res.json({ success: true, message: 'Profil berhasil diupdate', data: user });
  } catch (error) {
    logger.error(`updateProfile error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengupdate profil' });
  }
};

/**
 * @desc    Ganti password user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Password lama salah' });
    }

    user.passwordHash = newPassword;
    await user.save();

    logger.info(`Password diubah: user ${req.user._id}`);
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    logger.error(`changePassword error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengubah password' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };

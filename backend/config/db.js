const mongoose = require('mongoose');
const logger = require('../services/logger.service');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB terhubung: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Gagal menghubungkan MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB terputus. Mencoba menyambung ulang...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB tersambung kembali.');
});

module.exports = connectDB;

const Redis = require('ioredis');
const logger = require('../services/logger.service');

let redisClient = null;

const connectRedis = () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis: terlalu banyak percobaan ulang, menyerah.');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => logger.info('Redis terhubung.'));
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    redisClient.on('close', () => logger.warn('Redis koneksi ditutup.'));

    return redisClient;
  } catch (error) {
    logger.error(`Gagal menginisialisasi Redis: ${error.message}`);
    return null;
  }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };

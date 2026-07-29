const { getRedis } = require('../config/redis');
const logger = require('./logger.service');

const DEFAULT_TTL = 60 * 60; // 1 jam

/**
 * Ambil data dari cache
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const getCache = async (key) => {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache get error [${key}]: ${error.message}`);
    return null;
  }
};

/**
 * Simpan data ke cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Time to live dalam detik
 */
const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    logger.error(`Cache set error [${key}]: ${error.message}`);
  }
};

/**
 * Hapus data dari cache
 * @param {string} key
 */
const deleteCache = async (key) => {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache delete error [${key}]: ${error.message}`);
  }
};

/**
 * Hapus data cache berdasarkan pattern
 * @param {string} pattern - contoh: "products:*"
 */
const deleteCacheByPattern = async (pattern) => {
  try {
    const redis = getRedis();
    if (!redis) return;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.debug(`Cache dihapus untuk pattern "${pattern}": ${keys.length} key`);
    }
  } catch (error) {
    logger.error(`Cache deleteByPattern error [${pattern}]: ${error.message}`);
  }
};

module.exports = { getCache, setCache, deleteCache, deleteCacheByPattern };

import { createClient } from 'redis';
import { config } from './config.js';
import logger from '../utils/logger.js';

// Redis client instance
let redisClient;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password || undefined
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    await redisClient.connect();
    logger.info('Redis client connected successfully');

    return true;
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    throw error;
  }
};

/**
 * Set a value in Redis cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Whether the value was cached successfully
 */
export const setCache = async (key, value, ttl = config.redis.defaultTTL) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not initialized');
      return false;
    }

    const prefixedKey = `${config.redis.prefix}${key}`;
    const serializedValue = JSON.stringify(value);

    await redisClient.set(prefixedKey, serializedValue, { EX: ttl });
    return true;
  } catch (error) {
    logger.error(`Error setting Redis cache for ${key}:`, error);
    return false;
  }
};

/**
 * Get a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null if not found
 */
export const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not initialized');
      return null;
    }

    const prefixedKey = `${config.redis.prefix}${key}`;
    const cachedValue = await redisClient.get(prefixedKey);

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue);
  } catch (error) {
    logger.error(`Error getting Redis cache for ${key}:`, error);
    return null;
  }
};

/**
 * Delete a value from Redis cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Whether the value was deleted successfully
 */
export const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not initialized');
      return false;
    }

    const prefixedKey = `${config.redis.prefix}${key}`;
    await redisClient.del(prefixedKey);
    return true;
  } catch (error) {
    logger.error(`Error deleting Redis cache for ${key}:`, error);
    return false;
  }
};

/**
 * Delete multiple values from Redis cache by pattern
 * @param {string} pattern - Cache key pattern
 * @returns {Promise<boolean>} - Whether the values were deleted successfully
 */
export const deleteCacheByPattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis client not initialized');
      return false;
    }

    const prefixedPattern = `${config.redis.prefix}${pattern}*`;
    const keys = await redisClient.keys(prefixedPattern);

    if (keys.length === 0) {
      return true;
    }

    await redisClient.del(keys);
    return true;
  } catch (error) {
    logger.error(`Error deleting Redis cache by pattern ${pattern}:`, error);
    return false;
  }
};

/**
 * Get the Redis client instance
 * @returns {Object} - Redis client
 */
export const getRedisClient = () => redisClient;

/**
 * Close the Redis connection
 */
export const closeRedisConnection = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

// Export all functions
export default {
  initializeRedis,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
  getRedisClient,
  closeRedisConnection
};

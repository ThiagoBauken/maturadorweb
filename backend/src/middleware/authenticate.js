import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.app.jwtSecret);

    // Find user by id
    const user = await User.findByPk(decoded.id);

    // Check if user exists and is active
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found or inactive'
      });
    }

    // Set user on request object
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TokenExpired',
        message: 'Token has expired, please login again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'InvalidToken',
        message: 'Invalid token'
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const authorize = (requiredRole = 'admin') => {
  return (req, res, next) => {
    try {
      // Make sure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Check role
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Requires ${requiredRole} role`
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'ServerError',
        message: 'Internal server error during authorization'
      });
    }
  };
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.app.jwtSecret,
    {
      expiresIn: config.app.jwtExpiration
    }
  );
};

/**
 * Verify JWT token and return decoded data
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token data
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.app.jwtSecret);
};

// Export functions
export default {
  authenticate,
  authorize,
  generateToken,
  verifyToken
};

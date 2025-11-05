import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { generateToken } from '../middleware/authenticate.js';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(errorUtils.conflict('User with this email already exists'));
    }

    // Check if role is valid
    if (!['admin', 'user'].includes(role)) {
      return next(errorUtils.badRequest('Invalid role'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      active: true
    });

    // Generate token
    const token = generateToken(user);

    // Return success response with token and user info
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    return next(errorUtils.internal('Failed to register user'));
  }
};

/**
 * Login user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(errorUtils.unauthorized('Invalid credentials'));
    }

    // Check if user is active
    if (!user.active) {
      return next(errorUtils.unauthorized('Account is inactive'));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(errorUtils.unauthorized('Invalid credentials'));
    }

    // Generate token
    const token = generateToken(user);

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Return success response with token and user info
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    return next(errorUtils.internal('Failed to login'));
  }
};

/**
 * Get current user info
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getMe = async (req, res, next) => {
  try {
    // User is already available from authenticate middleware
    const user = req.user;

    // Return user info
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Error getting user info:', error);
    return next(errorUtils.internal('Failed to get user info'));
  }
};

/**
 * Update user password
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(errorUtils.notFound('User not found'));
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(errorUtils.badRequest('Current password is incorrect'));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Error updating password:', error);
    return next(errorUtils.internal('Failed to update password'));
  }
};

/**
 * Update user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(errorUtils.notFound('User not found'));
    }

    // Update user profile
    await user.update({ name });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    return next(errorUtils.internal('Failed to update profile'));
  }
};

/**
 * Admin: Get all users
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(errorUtils.forbidden('Admin access required'));
    }

    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt', 'lastLogin']
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    return next(errorUtils.internal('Failed to get users'));
  }
};

/**
 * Admin: Update user status (activate/deactivate)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(errorUtils.forbidden('Admin access required'));
    }

    const { userId } = req.params;
    const { active } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(errorUtils.notFound('User not found'));
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin' && !active) {
      const adminCount = await User.count({ where: { role: 'admin', active: true } });
      if (adminCount <= 1) {
        return next(errorUtils.badRequest('Cannot deactivate the last admin'));
      }
    }

    // Update user status
    await user.update({ active });

    return res.status(200).json({
      success: true,
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    return next(errorUtils.internal('Failed to update user status'));
  }
};

/**
 * Admin: Update user role
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const updateUserRole = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(errorUtils.forbidden('Admin access required'));
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Check if role is valid
    if (!['admin', 'user'].includes(role)) {
      return next(errorUtils.badRequest('Invalid role'));
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return next(errorUtils.notFound('User not found'));
    }

    // Prevent changing the role of the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin', active: true } });
      if (adminCount <= 1) {
        return next(errorUtils.badRequest('Cannot change the role of the last admin'));
      }
    }

    // Update user role
    await user.update({ role });

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    return next(errorUtils.internal('Failed to update user role'));
  }
};

export default {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile,
  getUsers,
  updateUserStatus,
  updateUserRole
};

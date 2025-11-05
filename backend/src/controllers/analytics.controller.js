import { Session, User, VerificationCampaign, Warmer, PhoneNumber } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import evolutionApiClient from '../lib/evolutionApiClient.js';

/**
 * Get summary data for dashboard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get count of active sessions
    const activeSessions = await Session.count({
      where: { userId, status: 'connected' }
    });

    // Get total sessions
    const totalSessions = await Session.count({
      where: { userId }
    });

    // Get active warmers
    const activeWarmers = await Warmer.count({
      where: { userId, status: 'active' }
    });

    // Get total warmers
    const totalWarmers = await Warmer.count({
      where: { userId }
    });

    // Get verification campaigns
    const verificationCampaigns = await VerificationCampaign.count({
      where: { userId }
    });

    // Get total verified numbers
    const verifiedNumbers = await PhoneNumber.count({
      include: [{
        model: VerificationCampaign,
        where: { userId },
        attributes: []
      }],
      where: {
        status: { [Op.ne]: 'pending' }
      }
    });

    // Get valid numbers count
    const validNumbers = await PhoneNumber.count({
      include: [{
        model: VerificationCampaign,
        where: { userId },
        attributes: []
      }],
      where: {
        status: 'valid'
      }
    });

    // Calculate verification success rate
    const verificationRate = verifiedNumbers > 0
      ? Math.round((validNumbers / verifiedNumbers) * 100)
      : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Recent sessions
    const recentSessions = await Session.count({
      where: {
        userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Recent warmers
    const recentWarmers = await Warmer.count({
      where: {
        userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Recent verification campaigns
    const recentVerifications = await VerificationCampaign.count({
      where: {
        userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Return summary data
    return res.status(200).json({
      success: true,
      data: {
        sessions: {
          active: activeSessions,
          total: totalSessions,
          recent: recentSessions
        },
        warmers: {
          active: activeWarmers,
          total: totalWarmers,
          recent: recentWarmers
        },
        verification: {
          campaigns: verificationCampaigns,
          verified: verifiedNumbers,
          valid: validNumbers,
          successRate: verificationRate,
          recent: recentVerifications
        }
      }
    });
  } catch (error) {
    logger.error('Error getting dashboard summary:', error);
    return next(errorUtils.internal('Failed to retrieve dashboard summary'));
  }
};

/**
 * Get recent activity for the authenticated user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent activity from various sources
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Recent sessions
    const sessions = await Session.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit
    });

    // Recent warmers
    const warmers = await Warmer.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit
    });

    // Recent verification campaigns
    const verifications = await VerificationCampaign.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']],
      limit
    });

    // Combine and sort activity
    const activity = [
      ...sessions.map(session => ({
        type: 'session',
        id: session.id,
        name: session.name,
        description: `Session created: ${session.phoneNumber}`,
        timestamp: session.createdAt,
        status: session.status
      })),
      ...warmers.map(warmer => ({
        type: 'warmer',
        id: warmer.id,
        name: warmer.name,
        description: `Warmer created: ${warmer.type}`,
        timestamp: warmer.createdAt,
        status: warmer.status
      })),
      ...verifications.map(verification => ({
        type: 'verification',
        id: verification.id,
        name: verification.name,
        description: `Verification campaign: ${verification.totalNumbers} numbers`,
        timestamp: verification.createdAt,
        status: verification.status
      }))
    ];

    // Sort by timestamp descending
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limitedActivity = activity.slice(0, limit);

    return res.status(200).json({
      success: true,
      data: limitedActivity
    });
  } catch (error) {
    logger.error('Error getting recent activity:', error);
    return next(errorUtils.internal('Failed to retrieve recent activity'));
  }
};

/**
 * Get session health status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getSessionHealth = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all active sessions
    const sessions = await Session.findAll({
      where: { userId, status: 'connected' }
    });

    const sessionHealth = [];

    // For each session, get health metrics
    for (const session of sessions) {
      try {
        // Try to get device info
        const deviceInfo = await evolutionApiClient.getDeviceInfo(session.instanceName);

        sessionHealth.push({
          id: session.id,
          name: session.name,
          phoneNumber: session.phoneNumber,
          battery: deviceInfo.battery,
          plugged: deviceInfo.plugged,
          status: 'healthy',
          lastActivity: session.metrics.lastActivity || null
        });
      } catch (error) {
        // If we can't get device info, assume the session is unhealthy
        sessionHealth.push({
          id: session.id,
          name: session.name,
          phoneNumber: session.phoneNumber,
          battery: null,
          plugged: null,
          status: 'unhealthy',
          lastActivity: session.metrics.lastActivity || null
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: sessionHealth
    });
  } catch (error) {
    logger.error('Error getting session health:', error);
    return next(errorUtils.internal('Failed to retrieve session health'));
  }
};

/**
 * Get usage analytics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getUsageAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'week';
    const startDateParam = req.query.startDate;
    const endDateParam = req.query.endDate;

    // Calculate date range based on period or provided dates
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    let startDate;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
    }

    // Create date buckets for the period
    const buckets = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      buckets.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        verifications: 0,
        warmingMessages: 0,
        bulkMessages: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get all sessions for this user
    const sessions = await Session.findAll({
      where: { userId },
      attributes: ['id', 'metrics']
    });

    // Aggregate metrics from sessions
    sessions.forEach(session => {
      if (session.metrics && session.metrics.dailyStats) {
        Object.entries(session.metrics.dailyStats).forEach(([date, stats]) => {
          // Find the correct bucket
          const bucket = buckets.find(b => b.date === date);

          if (bucket) {
            bucket.verifications += stats.verifications || 0;
            bucket.warmingMessages += stats.warmingMessages || 0;
            bucket.bulkMessages += stats.bulkMessages || 0;
          }
        });
      }
    });

    // Calculate totals
    const totals = {
      verifications: buckets.reduce((sum, bucket) => sum + bucket.verifications, 0),
      warmingMessages: buckets.reduce((sum, bucket) => sum + bucket.warmingMessages, 0),
      bulkMessages: buckets.reduce((sum, bucket) => sum + bucket.bulkMessages, 0)
    };

    return res.status(200).json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        buckets,
        totals
      }
    });
  } catch (error) {
    logger.error('Error getting usage analytics:', error);
    return next(errorUtils.internal('Failed to retrieve usage analytics'));
  }
};

/**
 * Admin only: Get system stats
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const getAdminStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(errorUtils.forbidden('Admin access required'));
    }

    // Get total users
    const totalUsers = await User.count();

    // Get active users (users with sessions)
    const activeUsers = await User.count({
      include: [{
        model: Session,
        required: true
      }]
    });

    // Get total sessions
    const totalSessions = await Session.count();

    // Get active sessions
    const activeSessions = await Session.count({
      where: { status: 'connected' }
    });

    // Get total warmers
    const totalWarmers = await Warmer.count();

    // Get active warmers
    const activeWarmers = await Warmer.count({
      where: { status: 'active' }
    });

    // Get total verification campaigns
    const totalVerifications = await VerificationCampaign.count();

    // Get active verification campaigns
    const activeVerifications = await VerificationCampaign.count({
      where: { status: 'processing' }
    });

    // Get usage by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get new users by date
    const newUsers = await User.findAll({
      attributes: [
        [Sequelize.fn('date', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('count', Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      group: [Sequelize.fn('date', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date', Sequelize.col('createdAt')), 'ASC']]
    });

    // Return admin stats
    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        sessions: {
          total: totalSessions,
          active: activeSessions
        },
        warmers: {
          total: totalWarmers,
          active: activeWarmers
        },
        verifications: {
          total: totalVerifications,
          active: activeVerifications
        },
        newUsersByDate: newUsers.map(u => ({
          date: u.getDataValue('date'),
          count: parseInt(u.getDataValue('count'))
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting admin stats:', error);
    return next(errorUtils.internal('Failed to retrieve admin stats'));
  }
};

export default {
  getDashboardSummary,
  getRecentActivity,
  getSessionHealth,
  getUsageAnalytics,
  getAdminStats
};

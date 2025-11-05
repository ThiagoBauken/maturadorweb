import { Session, User } from '../models/index.js';
import evolutionApiClient from '../lib/evolutionApiClient.js';
import { addTask } from '../lib/taskQueue.js';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all sessions for the authenticated user
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Build query conditions
    const whereConditions = { userId };
    if (status) {
      whereConditions.status = status;
    }

    const sessions = await Session.findAll({
      where: whereConditions,
      order: [['updatedAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    logger.error('Error getting sessions:', error);
    return next(errorUtils.internal('Failed to retrieve sessions'));
  }
};

/**
 * Get a specific session by ID
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error(`Error getting session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to retrieve session'));
  }
};

/**
 * Create a new WhatsApp session
 */
export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, settings = {} } = req.body;

    // Sanitize phone number (remove non-digits except leading +)
    const cleanedPhoneNumber = phoneNumber
      .trim()
      .replace(/[^\d+]/g, '')
      .replace(/^(?!\+)/, '+');

    // Check if a session with this phone number already exists
    const existingSession = await Session.findOne({
      where: { phoneNumber: cleanedPhoneNumber, userId }
    });

    if (existingSession) {
      return next(errorUtils.conflict(`A session for ${cleanedPhoneNumber} already exists`));
    }

    // Generate a unique instance name (used for Evolution API)
    const instanceName = `session_${userId}_${uuidv4().replace(/-/g, '')}`;

    // Create session in Evolution API
    try {
      await evolutionApiClient.createInstance(instanceName, {
        ...config.evolutionApi.defaultSessionOptions,
        customWebhook: settings.webhook || {}
      });

      logger.info(`Created WhatsApp instance ${instanceName} for user ${userId}`);
    } catch (apiError) {
      logger.error(`Failed to create WhatsApp instance in Evolution API:`, apiError);
      return next(errorUtils.serviceUnavailable('Could not create WhatsApp session in provider API'));
    }

    // Create session in local database
    const session = await Session.create({
      id: uuidv4(),
      name,
      phoneNumber: cleanedPhoneNumber,
      instanceName,
      userId,
      status: 'created',
      settings: {
        verificationEnabled: true,
        warmingEnabled: true,
        bulkEnabled: true,
        ...settings
      },
      metrics: {
        verificationCount: 0,
        warmingCount: 0,
        bulkCount: 0,
        lastActivity: null
      }
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'WhatsApp session created successfully',
      data: session
    });
  } catch (error) {
    logger.error('Error creating session:', error);
    return next(errorUtils.internal('Failed to create session'));
  }
};

/**
 * Generate QR code for session connection
 */
export const generateQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Generate QR code from Evolution API
    try {
      const qrResponse = await evolutionApiClient.getQrCode(session.instanceName);

      if (!qrResponse.qrcode) {
        throw new Error('No QR code in response');
      }

      // Update session status
      await session.update({
        status: 'pending',
        qrCode: qrResponse.qrcode,
        qrCodeGeneratedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        data: {
          qrCode: qrResponse.qrcode,
          expiresAt: qrResponse.expiresAt || null
        }
      });
    } catch (apiError) {
      logger.error(`Failed to generate QR code for session ${id}:`, apiError);
      return next(errorUtils.serviceUnavailable('Could not generate QR code'));
    }
  } catch (error) {
    logger.error(`Error generating QR code for session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to generate QR code'));
  }
};

/**
 * Connect to WhatsApp
 */
export const connectSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Connect using Evolution API
    try {
      await evolutionApiClient.connect(session.instanceName);

      // Update session status
      await session.update({
        status: 'connecting'
      });

      // Queue a task to check connection status
      addTask('sessionStatusCheck', {
        sessionId: session.id,
        instanceName: session.instanceName,
        userId
      });

      return res.status(200).json({
        success: true,
        message: 'Connecting to WhatsApp',
        data: {
          id: session.id,
          status: 'connecting'
        }
      });
    } catch (apiError) {
      logger.error(`Failed to connect session ${id}:`, apiError);
      return next(errorUtils.serviceUnavailable('Could not connect to WhatsApp'));
    }
  } catch (error) {
    logger.error(`Error connecting session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to connect session'));
  }
};

/**
 * Disconnect from WhatsApp
 */
export const disconnectSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Only attempt to disconnect if already connected
    if (session.status !== 'connected') {
      return next(errorUtils.badRequest(`Cannot disconnect session in ${session.status} state`));
    }

    // Disconnect using Evolution API
    try {
      await evolutionApiClient.disconnect(session.instanceName);

      // Update session status
      await session.update({
        status: 'disconnected'
      });

      return res.status(200).json({
        success: true,
        message: 'Disconnected from WhatsApp',
        data: {
          id: session.id,
          status: 'disconnected'
        }
      });
    } catch (apiError) {
      logger.error(`Failed to disconnect session ${id}:`, apiError);
      return next(errorUtils.serviceUnavailable('Could not disconnect from WhatsApp'));
    }
  } catch (error) {
    logger.error(`Error disconnecting session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to disconnect session'));
  }
};

/**
 * Restart WhatsApp session
 */
export const restartSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Queue a restart task
    addTask('sessionRestart', {
      sessionId: session.id,
      instanceName: session.instanceName,
      userId
    });

    // Update session status
    await session.update({
      status: 'restarting'
    });

    return res.status(200).json({
      success: true,
      message: 'Session restart initiated',
      data: {
        id: session.id,
        status: 'restarting'
      }
    });
  } catch (error) {
    logger.error(`Error restarting session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to restart session'));
  }
};

/**
 * Delete a WhatsApp session
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Try to delete from Evolution API
    try {
      await evolutionApiClient.deleteInstance(session.instanceName);
    } catch (apiError) {
      // Log but continue - we still want to delete from our DB
      logger.error(`Failed to delete WhatsApp instance ${session.instanceName}:`, apiError);
    }

    // Delete session from database
    await session.destroy();

    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting session ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to delete session'));
  }
};

/**
 * Get session info and status
 */
export const getSessionInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Only check session status if it's connected
    if (session.status !== 'connected') {
      return res.status(200).json({
        success: true,
        data: session
      });
    }

    // Get session info from Evolution API
    try {
      const instanceInfo = await evolutionApiClient.getInstanceInfo(session.instanceName);
      const batteryInfo = await evolutionApiClient.getDeviceInfo(session.instanceName);

      // Combine data
      const enhancedSessionData = {
        ...session.toJSON(),
        instanceStatus: instanceInfo.status,
        connectedAt: instanceInfo.connectedAt,
        device: {
          battery: batteryInfo.battery,
          plugged: batteryInfo.plugged,
          phoneModel: batteryInfo.phoneModel || 'Unknown'
        }
      };

      return res.status(200).json({
        success: true,
        data: enhancedSessionData
      });
    } catch (apiError) {
      logger.error(`Failed to get info for session ${id}:`, apiError);

      // Return basic session data
      return res.status(200).json({
        success: true,
        data: session,
        warning: 'Could not retrieve detailed session status'
      });
    }
  } catch (error) {
    logger.error(`Error getting session info ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get session info'));
  }
};

/**
 * Update session settings
 */
export const updateSessionSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { settings } = req.body;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Update session settings
    await session.update({
      settings: {
        ...session.settings,
        ...settings
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Session settings updated successfully',
      data: session
    });
  } catch (error) {
    logger.error(`Error updating session settings ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to update session settings'));
  }
};

/**
 * Get session metrics and statistics
 */
export const getSessionMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({
      where: { id, userId },
      attributes: ['id', 'name', 'phoneNumber', 'status', 'metrics']
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Get additional metrics if available
    let enhancedMetrics = {
      ...session.metrics
    };

    return res.status(200).json({
      success: true,
      data: {
        session: {
          id: session.id,
          name: session.name,
          phoneNumber: session.phoneNumber,
          status: session.status
        },
        metrics: enhancedMetrics
      }
    });
  } catch (error) {
    logger.error(`Error getting session metrics ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get session metrics'));
  }
};

/**
 * Internal method to update session metrics
 */
Session.prototype.updateMetrics = async function(metrics) {
  try {
    const updatedMetrics = {
      ...this.metrics,
      ...metrics,
      lastActivity: new Date()
    };

    await this.update({ metrics: updatedMetrics });
    return true;
  } catch (error) {
    logger.error(`Error updating metrics for session ${this.id}:`, error);
    return false;
  }
};

export default {
  getSessions,
  getSession,
  createSession,
  generateQRCode,
  connectSession,
  disconnectSession,
  restartSession,
  deleteSession,
  getSessionInfo,
  updateSessionSettings,
  getSessionMetrics
};

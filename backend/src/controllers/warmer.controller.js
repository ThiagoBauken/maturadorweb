import { Warmer, Session, User } from '../models/index.js';
import evolutionApiClient from '../lib/evolutionApiClient.js';
import deepseekClient from '../lib/deepseekClient.js';
import { addTask } from '../lib/taskQueue.js';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { config } from '../config/config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Convert __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get media upload directory
const MEDIA_DIR = path.join(__dirname, '../../uploads');

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

/**
 * Get all warmers for the authenticated user
 */
export const getWarmers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Build query conditions
    const whereConditions = { userId };
    if (status) {
      whereConditions.status = status;
    }

    const warmers = await Warmer.findAll({
      where: whereConditions,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Session,
          attributes: ['id', 'name', 'phoneNumber', 'status']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: warmers
    });
  } catch (error) {
    logger.error('Error getting warmers:', error);
    return next(errorUtils.internal('Failed to retrieve warmers'));
  }
};

/**
 * Get a specific warmer by ID
 */
export const getWarmer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const warmer = await Warmer.findOne({
      where: { id, userId },
      include: [
        {
          model: Session,
          attributes: ['id', 'name', 'phoneNumber', 'status']
        }
      ]
    });

    if (!warmer) {
      return next(errorUtils.notFound('Warmer not found'));
    }

    return res.status(200).json({
      success: true,
      data: warmer
    });
  } catch (error) {
    logger.error(`Error getting warmer ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to retrieve warmer'));
  }
};

/**
 * Create a new warmer
 */
export const createWarmer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      type,
      sessionId,
      messages,
      targets,
      scheduling,
      settings
    } = req.body;

    // Validate required fields
    if (!name || !type || !messages || !messages.length) {
      return next(errorUtils.badRequest('Name, type, and messages are required'));
    }

    // Validate type
    const validTypes = ['standard', 'advanced', 'group'];
    if (!validTypes.includes(type)) {
      return next(errorUtils.badRequest('Invalid warmer type. Must be one of: standard, advanced, group'));
    }

    // For group warmers, targets are required
    if (type === 'group' && (!targets || !targets.length)) {
      return next(errorUtils.badRequest('Targets are required for group warmers'));
    }

    // Verify session exists and is available for warming
    let session;
    if (sessionId) {
      session = await Session.findOne({
        where: {
          id: sessionId,
          userId,
          status: 'connected',
          'settings.warmingEnabled': true
        }
      });

      if (!session) {
        return next(errorUtils.badRequest('Invalid session or session not available for warming'));
      }
    } else {
      // Find an available session
      session = await Session.findOne({
        where: {
          userId,
          status: 'connected',
          'settings.warmingEnabled': true
        }
      });

      if (!session) {
        return next(errorUtils.badRequest('No available WhatsApp sessions found. Please connect a session first.'));
      }
    }

    // Default settings if not provided
    const defaultSettings = {
      messageDelay: {
        min: config.warming.minDelay || 30,
        max: config.warming.maxDelay || 90
      },
      restInterval: {
        count: 10,
        duration: 600 // 10 minutes
      },
      useAi: type === 'advanced'
    };

    // Create warmer
    const warmer = await Warmer.create({
      name,
      type,
      status: 'inactive',
      sessionId: session.id,
      userId,
      messages: messages.map(message => ({
        text: message.text,
        media: message.media || null
      })),
      targets: targets || [],
      scheduling: scheduling || {
        activeDays: [1, 2, 3, 4, 5], // Monday to Friday
        timeRanges: [
          {
            start: '09:00',
            end: '17:00'
          }
        ]
      },
      settings: {
        ...defaultSettings,
        ...settings
      },
      progress: {
        messagesCount: 0,
        lastActive: null,
        lastTarget: null,
        responseRate: 0
      },
      stats: {
        messagesCount: 0,
        responsesCount: 0,
        responseRate: 0
      }
    });

    // Generate AI messages for advanced warmers if useAi is true
    if (type === 'advanced' && (!settings || settings.useAi !== false)) {
      try {
        // Queue task to generate AI messages
        addTask('generateWarmerConversation', {
          warmerId: warmer.id,
          userId
        });
      } catch (error) {
        logger.error(`Error queuing AI message generation for warmer ${warmer.id}:`, error);
        // Continue even if AI generation fails
      }
    }

    return res.status(201).json({
      success: true,
      data: warmer
    });
  } catch (error) {
    logger.error('Error creating warmer:', error);
    return next(errorUtils.internal('Failed to create warmer'));
  }
};

/**
 * Update warmer status
 */
export const updateWarmerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['active', 'inactive', 'paused', 'completed', 'failed'];
    if (!status || !validStatuses.includes(status)) {
      return next(errorUtils.badRequest('Invalid status'));
    }

    const warmer = await Warmer.findOne({
      where: { id, userId }
    });

    if (!warmer) {
      return next(errorUtils.notFound('Warmer not found'));
    }

    // Verify session is active if activating warmer
    if (status === 'active' && warmer.status !== 'active') {
      const session = await Session.findOne({
        where: {
          id: warmer.sessionId,
          status: 'connected'
        }
      });

      if (!session) {
        return next(errorUtils.badRequest('Cannot activate warmer: WhatsApp session is not connected'));
      }

      // Update warmer status and start task
      await warmer.update({
        status: 'active',
        'progress.lastActive': new Date()
      });

      // Queue warming task
      addTask('processWarmer', {
        warmerId: warmer.id,
        userId
      });

      return res.status(200).json({
        success: true,
        message: 'Warmer activated successfully',
        data: {
          id: warmer.id,
          status: 'active'
        }
      });
    } else if (status === 'paused' && warmer.status === 'active') {
      // Pause warmer
      await warmer.update({
        status: 'paused'
      });

      return res.status(200).json({
        success: true,
        message: 'Warmer paused successfully',
        data: {
          id: warmer.id,
          status: 'paused'
        }
      });
    } else if (status === 'inactive' && ['active', 'paused'].includes(warmer.status)) {
      // Deactivate warmer
      await warmer.update({
        status: 'inactive'
      });

      return res.status(200).json({
        success: true,
        message: 'Warmer deactivated successfully',
        data: {
          id: warmer.id,
          status: 'inactive'
        }
      });
    } else {
      // Simple status update
      await warmer.update({
        status
      });

      return res.status(200).json({
        success: true,
        message: `Warmer status updated to ${status}`,
        data: {
          id: warmer.id,
          status
        }
      });
    }
  } catch (error) {
    logger.error(`Error updating warmer status for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to update warmer status'));
  }
};

/**
 * Update warmer details
 */
export const updateWarmer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      messages,
      targets,
      scheduling,
      settings
    } = req.body;

    const warmer = await Warmer.findOne({
      where: { id, userId }
    });

    if (!warmer) {
      return next(errorUtils.notFound('Warmer not found'));
    }

    // Cannot update active warmer
    if (warmer.status === 'active') {
      return next(errorUtils.badRequest('Cannot update an active warmer. Please pause or deactivate it first.'));
    }

    // Fields to update
    const updateFields = {};

    if (name) updateFields.name = name;
    if (messages) updateFields.messages = messages;
    if (targets) updateFields.targets = targets;
    if (scheduling) updateFields.scheduling = scheduling;
    if (settings) {
      updateFields.settings = {
        ...warmer.settings,
        ...settings
      };
    }

    // Update warmer
    await warmer.update(updateFields);

    return res.status(200).json({
      success: true,
      message: 'Warmer updated successfully',
      data: await Warmer.findOne({
        where: { id, userId },
        include: [
          {
            model: Session,
            attributes: ['id', 'name', 'phoneNumber', 'status']
          }
        ]
      })
    });
  } catch (error) {
    logger.error(`Error updating warmer ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to update warmer'));
  }
};

/**
 * Delete a warmer
 */
export const deleteWarmer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const warmer = await Warmer.findOne({
      where: { id, userId }
    });

    if (!warmer) {
      return next(errorUtils.notFound('Warmer not found'));
    }

    // Delete warmer
    await warmer.destroy();

    return res.status(200).json({
      success: true,
      message: 'Warmer deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting warmer ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to delete warmer'));
  }
};

/**
 * Generate AI conversation for a warmer
 */
export const generateConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { participants = 2, days = 7, isGroupChat = false } = req.body;

    // Validate inputs
    const participantsCount = Math.min(Math.max(parseInt(participants, 10), 2), 10);
    const daysCount = Math.min(Math.max(parseInt(days, 10), 1), 14);

    try {
      const conversationResult = await deepseekClient.generateWarmingMessages(
        participantsCount,
        daysCount,
        isGroupChat
      );

      return res.status(200).json({
        success: true,
        data: conversationResult.messages
      });
    } catch (error) {
      logger.error('Error generating AI conversation:', error);

      // Return a simple fallback conversation
      const fallbackMessages = [];
      const messageTemplates = [
        "Hey, how's it going?",
        "Good! Just busy with work. You?",
        "Not bad, just relaxing today.",
        "Did you see the news?",
        "Yeah, it's crazy.",
        "What are your plans for the weekend?",
        "Probably just staying home, maybe watching a movie.",
        "Nice! Any movie in particular?",
        "Not sure yet, any recommendations?",
        "The new action movie is supposed to be good."
      ];

      for (let day = 1; day <= daysCount; day++) {
        const messagesPerDay = Math.floor(3 + (day * 2));

        for (let i = 0; i < messagesPerDay; i++) {
          const sender = Math.floor(Math.random() * participantsCount) + 1;
          const messageIndex = Math.floor(Math.random() * messageTemplates.length);

          fallbackMessages.push({
            sender,
            content: messageTemplates[messageIndex],
            day
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: fallbackMessages,
        note: 'Used fallback due to AI service error'
      });
    }
  } catch (error) {
    logger.error('Error in generate conversation endpoint:', error);
    return next(errorUtils.internal('Failed to generate conversation'));
  }
};

/**
 * Get warmer statistics
 */
export const getWarmerStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const warmer = await Warmer.findOne({
      where: { id, userId },
      attributes: ['id', 'name', 'type', 'status', 'progress', 'stats']
    });

    if (!warmer) {
      return next(errorUtils.notFound('Warmer not found'));
    }

    // Get session info
    const session = await Session.findOne({
      where: { id: warmer.sessionId },
      attributes: ['id', 'name', 'phoneNumber', 'status']
    });

    return res.status(200).json({
      success: true,
      data: {
        warmer: {
          id: warmer.id,
          name: warmer.name,
          type: warmer.type,
          status: warmer.status,
          progress: warmer.progress,
          stats: warmer.stats
        },
        session: session || null
      }
    });
  } catch (error) {
    logger.error(`Error getting warmer stats for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get warmer statistics'));
  }
};

export default {
  getWarmers,
  getWarmer,
  createWarmer,
  updateWarmerStatus,
  updateWarmer,
  deleteWarmer,
  generateConversation,
  getWarmerStats
};

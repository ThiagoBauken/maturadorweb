import { BulkCampaign, Recipient, Session, User } from '../models/index.js';
import evolutionApiClient from '../lib/evolutionApiClient.js';
import { addTask } from '../lib/taskQueue.js';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import deepseekClient from '../lib/deepseekClient.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';

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
 * Get all bulk campaigns for the authenticated user
 */
export const getCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Build query conditions
    const whereConditions = { userId };
    if (status) {
      whereConditions.status = status;
    }

    const campaigns = await BulkCampaign.findAll({
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
      data: campaigns
    });
  } catch (error) {
    logger.error('Error getting bulk campaigns:', error);
    return next(errorUtils.internal('Failed to retrieve bulk campaigns'));
  }
};

/**
 * Get a specific campaign by ID
 */
export const getCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await BulkCampaign.findOne({
      where: { id, userId },
      include: [
        {
          model: Session,
          attributes: ['id', 'name', 'phoneNumber', 'status']
        },
        {
          model: Recipient,
          limit: 100, // Limit recipients to avoid large response
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Get recipient count stats
    const pendingCount = await Recipient.count({
      where: { campaignId: id, status: 'pending' }
    });

    const sentCount = await Recipient.count({
      where: { campaignId: id, status: 'sent' }
    });

    const failedCount = await Recipient.count({
      where: { campaignId: id, status: 'failed' }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...campaign.toJSON(),
        stats: {
          pending: pendingCount,
          sent: sentCount,
          failed: failedCount,
          total: campaign.totalRecipients
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting campaign ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to retrieve campaign'));
  }
};

/**
 * Create a new bulk campaign
 */
export const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      messageTemplate,
      messageVariations,
      mediaAttachments,
      schedule,
      settings,
      recipients
    } = req.body;

    // Validate required fields
    if (!name || !messageTemplate || !recipients || !recipients.length) {
      return next(errorUtils.badRequest('Name, message template, and recipients are required'));
    }

    // Validate session exists
    const sessionId = settings?.preferredSessions?.[0] || null;
    if (sessionId) {
      const session = await Session.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return next(errorUtils.badRequest('Invalid session ID'));
      }
    } else {
      // Find an available session
      const availableSession = await Session.findOne({
        where: {
          userId,
          status: 'connected',
          'settings.bulkSendEnabled': true
        }
      });

      if (!availableSession) {
        return next(errorUtils.badRequest('No available WhatsApp sessions found. Please connect a session first.'));
      }
    }

    // Create campaign
    const campaign = await BulkCampaign.create({
      name,
      messageTemplate,
      messageVariations: messageVariations || [],
      mediaAttachments: mediaAttachments || [],
      schedule: schedule || {},
      settings: {
        ...settings,
        preferredSessions: settings?.preferredSessions || []
      },
      userId,
      totalRecipients: recipients.length,
      status: 'draft'
    });

    // Create recipients
    const recipientRecords = recipients.map(recipient => ({
      number: recipient.phoneNumber,
      campaignId: campaign.id,
      variables: recipient.variables || {},
      status: 'pending'
    }));

    await Recipient.bulkCreate(recipientRecords);

    // Return campaign data
    return res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    return next(errorUtils.internal('Failed to create campaign'));
  }
};

/**
 * Update campaign status (start, pause, resume, stop)
 */
export const updateCampaignStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'paused', 'completed', 'failed'];
    if (!status || !validStatuses.includes(status)) {
      return next(errorUtils.badRequest('Invalid status'));
    }

    const campaign = await BulkCampaign.findOne({
      where: { id, userId }
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Handle status change
    if (status === 'processing' && campaign.status !== 'processing') {
      // Start or resume campaign
      await campaign.update({
        status: 'processing',
        startedAt: campaign.startedAt || new Date()
      });

      // Queue processing task
      addTask('processBulkCampaign', {
        campaignId: campaign.id,
        userId
      });

      return res.status(200).json({
        success: true,
        message: 'Campaign started successfully',
        data: {
          id: campaign.id,
          status: 'processing'
        }
      });
    } else if (status === 'paused' && campaign.status === 'processing') {
      // Pause campaign
      await campaign.update({
        status: 'paused'
      });

      return res.status(200).json({
        success: true,
        message: 'Campaign paused successfully',
        data: {
          id: campaign.id,
          status: 'paused'
        }
      });
    } else if (status === 'completed' && ['processing', 'paused'].includes(campaign.status)) {
      // Complete campaign
      await campaign.update({
        status: 'completed',
        completedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Campaign marked as completed',
        data: {
          id: campaign.id,
          status: 'completed'
        }
      });
    } else {
      // Simple status update
      await campaign.update({
        status
      });

      return res.status(200).json({
        success: true,
        message: `Campaign status updated to ${status}`,
        data: {
          id: campaign.id,
          status
        }
      });
    }
  } catch (error) {
    logger.error(`Error updating campaign status for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to update campaign status'));
  }
};

/**
 * Send a single message via the appropriate WhatsApp session
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId, recipient, message, options } = req.body;

    // Validate required fields
    if (!sessionId || !recipient || !message) {
      return next(errorUtils.badRequest('Session ID, recipient, and message are required'));
    }

    // Verify session exists and is connected
    const session = await Session.findOne({
      where: {
        id: sessionId,
        userId,
        status: 'connected'
      }
    });

    if (!session) {
      return next(errorUtils.badRequest('Invalid or disconnected session'));
    }

    // Send message through Evolution API
    try {
      const sendResult = await evolutionApiClient.sendText(
        session.instanceName,
        recipient,
        message
      );

      if (!sendResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to send message',
          details: sendResult.error || 'Unknown error'
        });
      }

      // Update session metrics
      await session.updateMetrics({
        messagesProcessed: (session.metrics.messagesProcessed || 0) + 1
      });

      return res.status(200).json({
        success: true,
        data: {
          messageId: sendResult.messageId,
          recipient,
          status: 'sent',
          timestamp: sendResult.timestamp || new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send message',
        details: error.message
      });
    }
  } catch (error) {
    logger.error('Error in send message endpoint:', error);
    return next(errorUtils.internal('Failed to process message send request'));
  }
};

/**
 * Upload media for sending in messages
 */
export const uploadMedia = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return next(errorUtils.badRequest('No file uploaded'));
    }

    const userId = req.user.id;
    const file = req.file;
    const { type } = req.body;

    // Validate media type
    const validTypes = ['image', 'video', 'document', 'audio'];
    if (!type || !validTypes.includes(type)) {
      return next(errorUtils.badRequest('Invalid media type. Must be one of: image, video, document, audio'));
    }

    // Create unique filename
    const timestamp = Date.now();
    const uniqueName = `${userId}_${timestamp}_${file.originalname}`;
    const filePath = path.join(MEDIA_DIR, uniqueName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Generate public URL
    const publicUrl = `${config.server.url}/uploads/${uniqueName}`;

    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        type,
        name: file.originalname,
        size: file.size
      }
    });
  } catch (error) {
    logger.error('Error uploading media:', error);
    return next(errorUtils.internal('Failed to upload media'));
  }
};

/**
 * Get message status by ID
 */
export const getMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Look up recipient by message ID
    const recipient = await Recipient.findOne({
      where: {
        messageId: id
      },
      include: [
        {
          model: BulkCampaign,
          as: 'campaign',
          where: { userId },
          attributes: ['id', 'name']
        }
      ]
    });

    if (!recipient) {
      return next(errorUtils.notFound('Message not found'));
    }

    // If we have a session ID, get current status from Evolution API
    if (recipient.sessionId) {
      try {
        const session = await Session.findOne({
          where: { id: recipient.sessionId }
        });

        if (session && recipient.messageId) {
          // Currently we don't have a direct way to get message status in the Evolution API client
          // In a real implementation, we would query Evolution API for current status

          // For now, we'll just return the stored status
          return res.status(200).json({
            success: true,
            data: {
              id: recipient.messageId,
              status: recipient.status,
              recipient: recipient.number,
              sentAt: recipient.sentAt,
              campaignId: recipient.campaignId,
              campaignName: recipient.campaign.name
            }
          });
        }
      } catch (error) {
        logger.error(`Error checking message status for ${id}:`, error);
        // Continue and return stored status
      }
    }

    // Return stored status if we couldn't get it from Evolution API
    return res.status(200).json({
      success: true,
      data: {
        id: recipient.messageId,
        status: recipient.status,
        recipient: recipient.number,
        sentAt: recipient.sentAt,
        campaignId: recipient.campaignId,
        campaignName: recipient.campaign?.name
      }
    });
  } catch (error) {
    logger.error(`Error getting message status for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get message status'));
  }
};

/**
 * Get campaign recipients
 */
export const getCampaignRecipients = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 100, status } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Verify campaign exists and belongs to user
    const campaign = await BulkCampaign.findOne({
      where: { id, userId },
      attributes: ['id', 'name']
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Build query conditions
    const whereConditions = { campaignId: id };
    if (status) {
      whereConditions.status = status;
    }

    // Query recipients with pagination
    const { count, rows } = await Recipient.findAndCountAll({
      where: whereConditions,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    logger.error(`Error getting campaign recipients for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get campaign recipients'));
  }
};

/**
 * Generate message variations using AI
 */
export const generateMessageVariations = async (req, res, next) => {
  try {
    const { template, count = 3 } = req.body;

    if (!template) {
      return next(errorUtils.badRequest('Message template is required'));
    }

    // Validate count
    const variationCount = Math.min(Math.max(parseInt(count, 10), 1), 5);

    // Generate variations using Deepseek
    try {
      const prompt = `Generate ${variationCount} variations of the following WhatsApp message that maintain the same meaning but use different wording and tone. The variations should be natural and not feel like templates.

Original message:
"${template}"

Provide the variations as a JSON array of strings in the following format:
["variation 1", "variation 2", ...]

Do not include any other text in your response besides the JSON array.`;

      const result = await deepseekClient.generateConversation(prompt);

      let variations = [];

      if (Array.isArray(result)) {
        variations = result.slice(0, variationCount);
      } else if (result.messages) {
        // If we got a conversation format instead of direct JSON
        const firstMessage = result.messages[0]?.content;
        if (firstMessage) {
          try {
            const extractedJson = JSON.parse(firstMessage);
            if (Array.isArray(extractedJson)) {
              variations = extractedJson.slice(0, variationCount);
            }
          } catch (e) {
            logger.error('Error parsing variations JSON:', e);
          }
        }
      }

      // Ensure we have variations
      if (!variations.length) {
        // Generate simple variations as fallback
        variations = [
          template,
          template.replace(/Hi|Hello|Hey/, 'Greetings') || template,
          template.replace(/\.$/, '!') || template
        ].slice(0, variationCount);
      }

      return res.status(200).json({
        success: true,
        data: variations
      });
    } catch (error) {
      logger.error('Error generating message variations:', error);

      // Return a simple fallback set
      return res.status(200).json({
        success: true,
        data: [template],
        note: 'Used fallback due to AI service error'
      });
    }
  } catch (error) {
    logger.error('Error in generate variations endpoint:', error);
    return next(errorUtils.internal('Failed to generate message variations'));
  }
};

/**
 * Get message history for a specific contact
 */
export const getMessageHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId, contactNumber } = req.query;
    const limit = parseInt(req.query.limit || '20', 10);

    if (!sessionId || !contactNumber) {
      return next(errorUtils.badRequest('Session ID and contact number are required'));
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      where: { id: sessionId, userId }
    });

    if (!session) {
      return next(errorUtils.notFound('Session not found'));
    }

    // Get messages from recipients table
    const messages = await Recipient.findAll({
      where: {
        sessionId,
        number: contactNumber
      },
      limit,
      order: [['sentAt', 'DESC']],
      include: [
        {
          model: BulkCampaign,
          as: 'campaign',
          where: { userId },
          attributes: ['id', 'name', 'messageTemplate']
        }
      ]
    });

    // In a real implementation, we would get the actual message history from Evolution API
    // For now, we'll just format the data from our database

    const formattedMessages = messages.map(message => ({
      id: message.messageId || message.id,
      phoneNumber: message.number,
      message: message.campaign?.messageTemplate,
      timestamp: message.sentAt,
      status: message.status,
      direction: 'outbound'
    }));

    return res.status(200).json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    logger.error('Error getting message history:', error);
    return next(errorUtils.internal('Failed to get message history'));
  }
};

export default {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaignStatus,
  sendMessage,
  uploadMedia,
  getMessageStatus,
  getCampaignRecipients,
  generateMessageVariations,
  getMessageHistory
};

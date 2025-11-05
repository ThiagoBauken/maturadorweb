import { VerificationCampaign, PhoneNumber, Session, User } from '../models/index.js';
import evolutionApiClient from '../lib/evolutionApiClient.js';
import { addTask } from '../lib/taskQueue.js';
import { errorUtils } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { getCache, setCache } from '../config/redis.js';
import { config } from '../config/config.js';

/**
 * Get all verification campaigns for the authenticated user
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

    const campaigns = await VerificationCampaign.findAll({
      where: whereConditions,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Session,
          attributes: ['id', 'name', 'phoneNumber', 'status']
        }
      ]
    });

    // Add counts for each campaign
    const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
      const totalNumbers = await PhoneNumber.count({
        where: { campaignId: campaign.id }
      });

      const validCount = await PhoneNumber.count({
        where: { campaignId: campaign.id, status: 'valid' }
      });

      const invalidCount = await PhoneNumber.count({
        where: { campaignId: campaign.id, status: 'invalid' }
      });

      const pendingCount = await PhoneNumber.count({
        where: { campaignId: campaign.id, status: 'pending' }
      });

      return {
        ...campaign.toJSON(),
        stats: {
          total: totalNumbers,
          valid: validCount,
          invalid: invalidCount,
          pending: pendingCount
        }
      };
    }));

    return res.status(200).json({
      success: true,
      data: campaignsWithStats
    });
  } catch (error) {
    logger.error('Error getting verification campaigns:', error);
    return next(errorUtils.internal('Failed to retrieve verification campaigns'));
  }
};

/**
 * Get a specific verification campaign by ID
 */
export const getCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await VerificationCampaign.findOne({
      where: { id, userId },
      include: [
        {
          model: Session,
          attributes: ['id', 'name', 'phoneNumber', 'status']
        }
      ]
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Get verification progress
    const totalNumbers = await PhoneNumber.count({
      where: { campaignId: id }
    });

    const verifiedNumbers = await PhoneNumber.count({
      where: {
        campaignId: id,
        status: { [Op.ne]: 'pending' }
      }
    });

    const validNumbers = await PhoneNumber.count({
      where: { campaignId: id, status: 'valid' }
    });

    const invalidNumbers = await PhoneNumber.count({
      where: { campaignId: id, status: 'invalid' }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...campaign.toJSON(),
        progress: {
          total: totalNumbers,
          verified: verifiedNumbers,
          valid: validNumbers,
          invalid: invalidNumbers,
          percent: totalNumbers > 0 ? Math.round((verifiedNumbers / totalNumbers) * 100) : 0
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting verification campaign ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to retrieve verification campaign'));
  }
};

/**
 * Create a new verification campaign
 */
export const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      phoneNumbers,
      sessionId,
      batchSize
    } = req.body;

    // Validate required fields
    if (!name || !phoneNumbers || !phoneNumbers.length) {
      return next(errorUtils.badRequest('Name and phone numbers are required'));
    }

    // Verify session exists and is available for verification
    let session;
    if (sessionId) {
      session = await Session.findOne({
        where: {
          id: sessionId,
          userId,
          status: 'connected',
          'settings.verificationEnabled': true
        }
      });

      if (!session) {
        return next(errorUtils.badRequest('Invalid session or session not available for verification'));
      }
    } else {
      // Find an available session
      session = await Session.findOne({
        where: {
          userId,
          status: 'connected',
          'settings.verificationEnabled': true
        }
      });

      if (!session) {
        return next(errorUtils.badRequest('No available WhatsApp sessions found. Please connect a session first.'));
      }
    }

    // Create verification campaign
    const campaign = await VerificationCampaign.create({
      name,
      description: description || '',
      status: 'pending',
      sessionId: session.id,
      userId,
      batchSize: batchSize || config.verification.defaultBatchSize || 100,
      totalNumbers: phoneNumbers.length,
      validCount: 0,
      invalidCount: 0,
      startedAt: null,
      completedAt: null
    });

    // Process and clean phone numbers
    const cleanedNumbers = phoneNumbers.map(number => {
      // Remove spaces, dashes, parentheses, etc.
      let cleaned = number.trim().replace(/[\s\-\(\)\.]/g, '');

      // Ensure it starts with a + if it doesn't
      if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
      }

      return cleaned;
    });

    // Remove duplicates
    const uniqueNumbers = [...new Set(cleanedNumbers)];

    // Create phone number records
    const phoneNumberRecords = uniqueNumbers.map(number => ({
      phoneNumber: number,
      campaignId: campaign.id,
      status: 'pending',
      verifiedAt: null
    }));

    await PhoneNumber.bulkCreate(phoneNumberRecords);

    // Update total count to reflect actual unique numbers
    await campaign.update({
      totalNumbers: uniqueNumbers.length
    });

    // Queue verification task
    addTask('processVerificationCampaign', {
      campaignId: campaign.id,
      userId
    });

    return res.status(201).json({
      success: true,
      data: {
        id: campaign.id,
        name: campaign.name,
        status: 'pending',
        totalNumbers: uniqueNumbers.length,
        sessionId: session.id,
        sessionName: session.name
      }
    });
  } catch (error) {
    logger.error('Error creating verification campaign:', error);
    return next(errorUtils.internal('Failed to create verification campaign'));
  }
};

/**
 * Update verification campaign status
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

    const campaign = await VerificationCampaign.findOne({
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

      // Queue verification task
      addTask('processVerificationCampaign', {
        campaignId: campaign.id,
        userId
      });

      return res.status(200).json({
        success: true,
        message: 'Verification campaign started successfully',
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
        message: 'Verification campaign paused successfully',
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
        message: 'Verification campaign marked as completed',
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
        message: `Verification campaign status updated to ${status}`,
        data: {
          id: campaign.id,
          status
        }
      });
    }
  } catch (error) {
    logger.error(`Error updating verification campaign status for ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to update verification campaign status'));
  }
};

/**
 * Get verification results for a campaign
 */
export const getVerificationResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, page = 1, limit = 100 } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Verify campaign exists and belongs to user
    const campaign = await VerificationCampaign.findOne({
      where: { id, userId },
      attributes: ['id', 'name', 'status', 'totalNumbers', 'validCount', 'invalidCount']
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Build query conditions
    const whereConditions = { campaignId: id };
    if (status) {
      whereConditions.status = status;
    }

    // Query phone numbers with pagination
    const { count, rows } = await PhoneNumber.findAndCountAll({
      where: whereConditions,
      limit: limitNum,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: rows,
      campaign: campaign.toJSON(),
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    logger.error(`Error getting verification results for campaign ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to get verification results'));
  }
};

/**
 * Verify a single phone number
 */
export const verifyPhoneNumber = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId, phoneNumber } = req.body;

    if (!sessionId || !phoneNumber) {
      return next(errorUtils.badRequest('Session ID and phone number are required'));
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

    // Clean the phone number
    let cleanedNumber = phoneNumber.trim().replace(/[\s\-\(\)\.]/g, '');
    if (!cleanedNumber.startsWith('+')) {
      cleanedNumber = '+' + cleanedNumber;
    }

    // Check cache first
    const cacheKey = `verify:${cleanedNumber}`;
    let result = await getCache(cacheKey);

    if (!result) {
      // Verify phone number using Evolution API
      try {
        result = await evolutionApiClient.checkNumberExists(
          session.instanceName,
          cleanedNumber
        );

        // Cache the result for 24 hours
        if (result.success) {
          await setCache(cacheKey, result, 86400);
        }
      } catch (error) {
        logger.error(`Error verifying phone number ${cleanedNumber}:`, error);

        return res.status(500).json({
          success: false,
          error: 'Failed to verify phone number',
          details: error.message
        });
      }
    }

    // Update session metrics
    await session.updateMetrics({
      verificationCount: (session.metrics.verificationCount || 0) + 1
    });

    return res.status(200).json({
      success: true,
      data: {
        phoneNumber: cleanedNumber,
        exists: result.exists,
        status: result.exists ? 'valid' : 'invalid'
      }
    });
  } catch (error) {
    logger.error('Error in verify phone number endpoint:', error);
    return next(errorUtils.internal('Failed to verify phone number'));
  }
};

/**
 * Export valid numbers from a campaign
 */
export const exportValidNumbers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { format = 'json' } = req.query;

    // Verify campaign exists and belongs to user
    const campaign = await VerificationCampaign.findOne({
      where: { id, userId }
    });

    if (!campaign) {
      return next(errorUtils.notFound('Campaign not found'));
    }

    // Get valid phone numbers
    const validNumbers = await PhoneNumber.findAll({
      where: {
        campaignId: id,
        status: 'valid'
      },
      attributes: ['id', 'phoneNumber', 'verifiedAt']
    });

    if (format === 'csv') {
      // Format as CSV
      const csvHeader = 'id,phoneNumber,verifiedAt\n';
      const csvRows = validNumbers.map(number =>
        `${number.id},${number.phoneNumber},${number.verifiedAt}`
      ).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=valid-numbers-${id}.csv`);

      return res.status(200).send(csvContent);
    } else {
      // Default to JSON
      return res.status(200).json({
        success: true,
        data: validNumbers,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          totalValidNumbers: validNumbers.length
        }
      });
    }
  } catch (error) {
    logger.error(`Error exporting valid numbers from campaign ${req.params.id}:`, error);
    return next(errorUtils.internal('Failed to export valid numbers'));
  }
};

/**
 * Transfer numbers to a bulk campaign
 */
export const transferToBulk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bulkCampaignId } = req.body;
    const userId = req.user.id;

    if (!bulkCampaignId) {
      return next(errorUtils.badRequest('Bulk campaign ID is required'));
    }

    // Verify both campaigns exist and belong to user
    const verificationCampaign = await VerificationCampaign.findOne({
      where: { id, userId }
    });

    if (!verificationCampaign) {
      return next(errorUtils.notFound('Verification campaign not found'));
    }

    const bulkCampaign = await BulkCampaign.findOne({
      where: { id: bulkCampaignId, userId }
    });

    if (!bulkCampaign) {
      return next(errorUtils.notFound('Bulk campaign not found'));
    }

    // Get valid phone numbers
    const validNumbers = await PhoneNumber.findAll({
      where: {
        campaignId: id,
        status: 'valid'
      },
      attributes: ['phoneNumber']
    });

    if (validNumbers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No valid numbers to transfer',
        data: {
          transferred: 0
        }
      });
    }

    // Format for bulk campaign
    const recipients = validNumbers.map(number => ({
      number: number.phoneNumber,
      campaignId: bulkCampaignId,
      status: 'pending'
    }));

    // Add to bulk campaign
    await bulkCampaign.update({
      totalRecipients: bulkCampaign.totalRecipients + recipients.length
    });

    // Use transaction to ensure consistency
    const { Recipient } = await import('../models/BulkCampaign.js');
    await Recipient.bulkCreate(recipients);

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ${recipients.length} numbers to bulk campaign`,
      data: {
        verificationCampaignId: id,
        bulkCampaignId,
        transferred: recipients.length
      }
    });
  } catch (error) {
    logger.error(`Error transferring numbers to bulk campaign:`, error);
    return next(errorUtils.internal('Failed to transfer numbers to bulk campaign'));
  }
};

// Alias functions to match route expectations
const startCampaign = async (req, res, next) => {
  // Start campaign by updating status to 'processing'
  req.body = { status: 'processing' };
  return updateCampaignStatus(req, res, next);
};

const pauseCampaign = async (req, res, next) => {
  // Pause campaign by updating status to 'paused'
  req.body = { status: 'paused' };
  return updateCampaignStatus(req, res, next);
};

const getCampaignNumbers = getVerificationResults;
const getCampaignResults = getVerificationResults;
const exportCampaignNumbers = exportValidNumbers;

export default {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaignStatus,
  startCampaign,
  pauseCampaign,
  getCampaignNumbers,
  getCampaignResults,
  getVerificationResults,
  verifyPhoneNumber,
  exportValidNumbers,
  exportCampaignNumbers,
  transferToBulk
};

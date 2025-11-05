import express from 'express';
import { body, param, query } from 'express-validator';
import verifierController from '../controllers/verifier.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const campaignIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid campaign ID format')
];

const createCampaignValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('sessionId')
    .isUUID()
    .withMessage('Session ID is required and must be a UUID'),
  body('phoneNumbers')
    .isArray({ min: 1 })
    .withMessage('At least one phone number is required'),
  body('phoneNumbers.*')
    .isString()
    .withMessage('Phone numbers must be strings'),
  body('batchSize')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Batch size must be between 1 and 1000')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000')
];

const statusValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'valid', 'invalid', 'failed'])
    .withMessage('Invalid status value')
];

// Routes
router.get(
  '/',
  verifierController.getCampaigns
);

router.post(
  '/',
  createCampaignValidation,
  validate,
  verifierController.createCampaign
);

router.get(
  '/:id',
  campaignIdValidation,
  validate,
  verifierController.getCampaign
);

router.post(
  '/:id/start',
  campaignIdValidation,
  validate,
  verifierController.startCampaign
);

router.post(
  '/:id/pause',
  campaignIdValidation,
  validate,
  verifierController.pauseCampaign
);

router.get(
  '/:id/numbers',
  campaignIdValidation,
  paginationValidation,
  statusValidation,
  validate,
  verifierController.getCampaignNumbers
);

router.get(
  '/:id/results',
  campaignIdValidation,
  validate,
  verifierController.getCampaignResults
);

router.get(
  '/:id/export',
  campaignIdValidation,
  statusValidation,
  validate,
  verifierController.exportCampaignNumbers
);

export default router;

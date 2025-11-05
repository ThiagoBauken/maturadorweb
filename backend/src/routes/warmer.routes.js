import express from 'express';
import { body, param, query } from 'express-validator';
import warmerController from '../controllers/warmer.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const warmerIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid warmer ID format')
];

const createWarmerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Warmer name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Warmer name must be between 3 and 100 characters'),
  body('type')
    .isIn(['standard', 'advanced', 'group'])
    .withMessage('Valid warmer type is required (standard, advanced, group)'),
  body('sessionId')
    .isUUID()
    .withMessage('Session ID is required and must be a UUID'),
  body('messages')
    .isArray({ min: 1 })
    .withMessage('At least one message is required'),
  body('messages.*.text')
    .notEmpty()
    .withMessage('Message text is required for each message'),
  body('messages.*.media')
    .optional()
    .isObject()
    .withMessage('Media must be an object if provided'),
  body('messages.*.media.type')
    .optional()
    .isIn(['image', 'video', 'audio', 'document'])
    .withMessage('Media type must be image, video, audio, or document'),
  body('messages.*.media.url')
    .optional()
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('scheduling')
    .optional()
    .isObject()
    .withMessage('Scheduling must be an object if provided'),
  body('scheduling.activeDays')
    .optional()
    .isArray()
    .withMessage('Active days must be an array'),
  body('scheduling.timeRanges')
    .optional()
    .isArray()
    .withMessage('Time ranges must be an array'),
  body('targets')
    .optional()
    .isArray()
    .withMessage('Targets must be an array'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object if provided')
];

const updateStatusValidation = [
  body('status')
    .isIn(['active', 'inactive', 'paused', 'completed', 'failed'])
    .withMessage('Valid status is required (active, inactive, paused, completed, failed)')
];

const conversationValidation = [
  body('participants')
    .optional()
    .isInt({ min: 2, max: 10 })
    .withMessage('Participants must be between 2 and 10'),
  body('days')
    .optional()
    .isInt({ min: 1, max: 14 })
    .withMessage('Days must be between 1 and 14'),
  body('isGroupChat')
    .optional()
    .isBoolean()
    .withMessage('isGroupChat must be a boolean value')
];

// Routes
router.get(
  '/',
  warmerController.getWarmers
);

router.post(
  '/',
  createWarmerValidation,
  validate,
  warmerController.createWarmer
);

router.get(
  '/:id',
  warmerIdValidation,
  validate,
  warmerController.getWarmer
);

router.patch(
  '/:id/status',
  warmerIdValidation,
  updateStatusValidation,
  validate,
  warmerController.updateWarmerStatus
);

router.put(
  '/:id',
  warmerIdValidation,
  validate,
  warmerController.updateWarmer
);

router.delete(
  '/:id',
  warmerIdValidation,
  validate,
  warmerController.deleteWarmer
);

router.post(
  '/generate-conversation',
  conversationValidation,
  validate,
  warmerController.generateConversation
);

router.get(
  '/:id/stats',
  warmerIdValidation,
  validate,
  warmerController.getWarmerStats
);

export default router;

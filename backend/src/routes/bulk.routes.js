import express from 'express';
import { body, param, query } from 'express-validator';
import bulkController from '../controllers/bulk.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Set up multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
  body('messageTemplate')
    .trim()
    .notEmpty()
    .withMessage('Message template is required'),
  body('sessions')
    .isArray({ min: 1 })
    .withMessage('At least one session is required'),
  body('sessions.*')
    .isUUID()
    .withMessage('Invalid session ID format')
];

const recipientsValidation = [
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('At least one recipient is required'),
  body('recipients.*')
    .custom((value) => {
      // Allow either string or object with number property
      if (typeof value === 'string') {
        return true;
      }
      if (typeof value === 'object' && value !== null && typeof value.number === 'string') {
        return true;
      }
      throw new Error('Recipients must be strings or objects with a number property');
    })
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
    .isIn(['pending', 'sent', 'failed'])
    .withMessage('Invalid status value')
];

// Routes
// Campaign routes
router.get('/campaigns', bulkController.getCampaigns);

router.post(
  '/campaigns',
  createCampaignValidation,
  validate,
  bulkController.createCampaign
);

router.get(
  '/campaigns/:id',
  campaignIdValidation,
  validate,
  bulkController.getCampaign
);

router.patch(
  '/campaigns/:id/status',
  campaignIdValidation,
  body('status').isIn(['pending', 'processing', 'paused', 'completed', 'failed']),
  validate,
  bulkController.updateCampaignStatus
);

router.get(
  '/campaigns/:id/recipients',
  campaignIdValidation,
  paginationValidation,
  statusValidation,
  validate,
  bulkController.getCampaignRecipients
);

// Media upload route
router.post(
  '/media',
  upload.single('file'),
  body('type').isIn(['image', 'video', 'audio', 'document']),
  validate,
  bulkController.uploadMedia
);

// Message routes
router.post(
  '/messages',
  body('sessionId').isUUID(),
  body('recipient').notEmpty(),
  body('message').notEmpty(),
  validate,
  bulkController.sendMessage
);

router.get(
  '/messages/:id/status',
  param('id').notEmpty(),
  validate,
  bulkController.getMessageStatus
);

router.get(
  '/history',
  query('sessionId').isUUID(),
  query('contactNumber').notEmpty(),
  validate,
  bulkController.getMessageHistory
);

// Message variation generation
router.post(
  '/variations',
  body('template').notEmpty(),
  body('count').optional().isInt({ min: 1, max: 5 }),
  validate,
  bulkController.generateMessageVariations
);

export default router;

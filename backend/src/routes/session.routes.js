import express from 'express';
import { body, param } from 'express-validator';
import sessionController from '../controllers/session.controller.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createSessionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Session name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Session name must be between 3 and 50 characters')
];

const sessionIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid session ID format')
];

// Routes
router.get(
  '/',
  sessionController.getSessions
);

router.post(
  '/',
  createSessionValidation,
  validate,
  sessionController.createSession
);

router.get(
  '/:id',
  sessionIdValidation,
  validate,
  sessionController.getSession
);

router.post(
  '/:id/qrcode',
  sessionIdValidation,
  validate,
  sessionController.generateQRCode
);

router.post(
  '/:id/connect',
  sessionIdValidation,
  validate,
  sessionController.connectSession
);

router.get(
  '/:id/info',
  sessionIdValidation,
  validate,
  sessionController.getSessionInfo
);

router.post(
  '/:id/disconnect',
  sessionIdValidation,
  validate,
  sessionController.disconnectSession
);

router.post(
  '/:id/restart',
  sessionIdValidation,
  validate,
  sessionController.restartSession
);

router.get(
  '/:id/metrics',
  sessionIdValidation,
  validate,
  sessionController.getSessionMetrics
);

router.patch(
  '/:id/settings',
  sessionIdValidation,
  body('settings').isObject(),
  validate,
  sessionController.updateSessionSettings
);

router.delete(
  '/:id',
  sessionIdValidation,
  validate,
  sessionController.deleteSession
);

export default router;

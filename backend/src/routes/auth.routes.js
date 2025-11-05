import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post(
  '/register',
  registerValidation,
  validate,
  authController.register
);

router.post(
  '/login',
  loginValidation,
  validate,
  authController.login
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

export default router;

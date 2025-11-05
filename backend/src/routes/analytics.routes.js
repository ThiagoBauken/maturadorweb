import express from 'express';
import { query } from 'express-validator';
import {
  getDashboardSummary,
  getRecentActivity,
  getSessionHealth,
  getUsageAnalytics,
  getAdminStats
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Main dashboard summary
router.get('/dashboard', getDashboardSummary);

// Recent user activity with limit parameter
router.get(
  '/activity',
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
  getRecentActivity
);

// Session health monitoring
router.get('/sessions/health', getSessionHealth);

// Usage analytics with period filter
router.get(
  '/usage',
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  validate,
  getUsageAnalytics
);

// Admin-only system statistics
router.get('/admin/stats', getAdminStats);

export default router;

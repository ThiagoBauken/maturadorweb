import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

/**
 * Middleware to validate request data using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = formatErrors(errors.array());
    logger.warn('Validation error:', { errors: formattedErrors, path: req.path });

    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

/**
 * Format validation errors for better readability in response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} - Formatted errors
 */
const formatErrors = (errors) => {
  const formattedErrors = {};

  errors.forEach(error => {
    if (error.type === 'field') {
      // Handle field errors
      formattedErrors[error.path] = {
        message: error.msg,
        value: error.value
      };
    } else {
      // Handle non-field errors
      if (!formattedErrors.general) {
        formattedErrors.general = [];
      }
      formattedErrors.general.push(error.msg);
    }
  });

  return formattedErrors;
};

/**
 * Custom validators for common validation tasks
 */
export const customValidators = {
  /**
   * Validate phone number format
   * @param {string} value - Phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  isPhoneNumber: (value) => {
    // E.164 format validation (e.g., +1234567890)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value);
  },

  /**
   * Validate UUID format
   * @param {string} value - UUID to validate
   * @returns {boolean} - Whether the UUID is valid
   */
  isUUID: (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Validate JSON string
   * @param {string} value - JSON string to validate
   * @returns {boolean} - Whether the string is valid JSON
   */
  isJSON: (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Validate cron expression
   * @param {string} value - Cron expression to validate
   * @returns {boolean} - Whether the cron expression is valid
   */
  isCronExpression: (value) => {
    // Simple cron validation (5 or 6 fields, numbers, *, and allowed special chars)
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))( (\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])))?$/;
    return cronRegex.test(value);
  }
};

/**
 * Custom sanitizers for common sanitization tasks
 */
export const customSanitizers = {
  /**
   * Normalize phone number to E.164 format
   * @param {string} value - Phone number to normalize
   * @returns {string} - Normalized phone number
   */
  normalizePhoneNumber: (value) => {
    // Remove non-digit characters except leading +
    let normalized = value.replace(/[^\d+]/g, '');

    // Ensure there's a leading +
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  },

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} value - HTML string to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeHTML: (value) => {
    // Simple HTML sanitizer (removes all tags)
    return value.replace(/<[^>]*>?/gm, '');
  }
};

// Export validate middleware as default
export default validate;

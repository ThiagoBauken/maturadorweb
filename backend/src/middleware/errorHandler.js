import logger from '../utils/logger.js';

/**
 * Error types with corresponding HTTP status codes
 */
export const ErrorTypes = {
  BAD_REQUEST: 'BadRequest',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'NotFound',
  CONFLICT: 'Conflict',
  VALIDATION: 'ValidationError',
  RATE_LIMIT: 'RateLimit',
  INTERNAL: 'InternalError',
  SERVICE_UNAVAILABLE: 'ServiceUnavailable',
  API_ERROR: 'ApiError'
};

/**
 * HTTP status codes
 */
export const StatusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMIT: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(type, message, details = null, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = getStatusCode(type);
    this.details = details;
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Get HTTP status code for error type
 * @param {string} type - Error type
 * @returns {number} - HTTP status code
 */
const getStatusCode = (type) => {
  switch (type) {
    case ErrorTypes.BAD_REQUEST:
      return StatusCodes.BAD_REQUEST;
    case ErrorTypes.UNAUTHORIZED:
      return StatusCodes.UNAUTHORIZED;
    case ErrorTypes.FORBIDDEN:
      return StatusCodes.FORBIDDEN;
    case ErrorTypes.NOT_FOUND:
      return StatusCodes.NOT_FOUND;
    case ErrorTypes.CONFLICT:
      return StatusCodes.CONFLICT;
    case ErrorTypes.VALIDATION:
      return StatusCodes.VALIDATION;
    case ErrorTypes.RATE_LIMIT:
      return StatusCodes.RATE_LIMIT;
    case ErrorTypes.SERVICE_UNAVAILABLE:
      return StatusCodes.SERVICE_UNAVAILABLE;
    default:
      return StatusCodes.INTERNAL;
  }
};

/**
 * Error utility functions
 */
export const errorUtils = {
  /**
   * Bad request error (400)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  badRequest: (message, details = null) => new ApiError(
    ErrorTypes.BAD_REQUEST,
    message || 'Bad request',
    details
  ),

  /**
   * Unauthorized error (401)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  unauthorized: (message, details = null) => new ApiError(
    ErrorTypes.UNAUTHORIZED,
    message || 'Unauthorized',
    details
  ),

  /**
   * Forbidden error (403)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  forbidden: (message, details = null) => new ApiError(
    ErrorTypes.FORBIDDEN,
    message || 'Forbidden',
    details
  ),

  /**
   * Not found error (404)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  notFound: (message, details = null) => new ApiError(
    ErrorTypes.NOT_FOUND,
    message || 'Not found',
    details
  ),

  /**
   * Conflict error (409)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  conflict: (message, details = null) => new ApiError(
    ErrorTypes.CONFLICT,
    message || 'Conflict',
    details
  ),

  /**
   * Validation error (422)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  validation: (message, details = null) => new ApiError(
    ErrorTypes.VALIDATION,
    message || 'Validation error',
    details
  ),

  /**
   * Rate limit error (429)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  rateLimit: (message, details = null) => new ApiError(
    ErrorTypes.RATE_LIMIT,
    message || 'Rate limit exceeded',
    details
  ),

  /**
   * Internal server error (500)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  internal: (message, details = null) => new ApiError(
    ErrorTypes.INTERNAL,
    message || 'Internal server error',
    details
  ),

  /**
   * Service unavailable error (503)
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  serviceUnavailable: (message, details = null) => new ApiError(
    ErrorTypes.SERVICE_UNAVAILABLE,
    message || 'Service unavailable',
    details
  ),

  /**
   * API error with custom type
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {*} details - Error details
   * @returns {ApiError} - ApiError instance
   */
  apiError: (type, message, details = null) => new ApiError(
    type,
    message,
    details
  )
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // If headers already sent, let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  // Convert unknown errors to ApiError
  if (!(err instanceof ApiError)) {
    error = errorUtils.internal(err.message, null, err);
  }

  // Log error
  const logLevel = error.status >= 500 ? 'error' : 'warn';
  logger[logLevel](`${error.type}: ${error.message}`, {
    path: req.path,
    method: req.method,
    statusCode: error.status,
    stack: error.stack,
    details: error.details,
    originalError: error.originalError
  });

  // Send response
  return res.status(error.status).json({
    success: false,
    error: error.type,
    message: error.message,
    details: error.details,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Export as default
export default errorHandler;

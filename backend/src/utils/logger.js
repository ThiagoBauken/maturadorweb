import winston from 'winston';
import { config } from '../config/config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logDir = config.logging.directory || path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let metaString = '';

  if (Object.keys(metadata).length > 0) {
    metaString = JSON.stringify(metadata);
  }

  return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
});

// Define log configuration
const loggerConfig = {
  level: config.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.logging.format === 'json'
      ? winston.format.json()
      : logFormat
  ),
  defaultMeta: { service: 'whatsapp-platform' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),

    // File transport - error log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    // File transport - combined log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
};

// Create logger
const logger = winston.createLogger(loggerConfig);

// If we're in development, add pretty-print to console
if (config.app.environment === 'development') {
  logger.debug('Logging initialized in development mode');
}

// Export logger
export default logger;

/**
 * Stream for Morgan HTTP request logger
 */
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

/**
 * Log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

/**
 * Log uncaught exceptions
 * @param {Error} error - Error object
 */
export const logUncaughtException = (error) => {
  logger.error('Uncaught Exception:', { error });
};

/**
 * Log unhandled rejections
 * @param {Error} reason - Reason for rejection
 * @param {Promise} promise - Promise that was rejected
 */
export const logUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
};

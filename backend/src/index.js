import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/config.js';
import { initializeDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { initializeTaskQueue } from './lib/taskQueue.js';
import logger from './utils/logger.js';

// Import route handlers
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import verifierRoutes from './routes/verifier.routes.js';
import warmerRoutes from './routes/warmer.routes.js';
import bulkRoutes from './routes/bulk.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Initialize express app
const app = express();
const port = config.app.port;
const apiPrefix = config.app.apiPrefix;

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
const corsOptions = {
  origin: config.app.corsOrigins === '*'
    ? '*'
    : config.app.corsOrigins.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Static files for media uploads
app.use('/uploads', express.static(config.media.uploadDir));

// API routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/sessions`, sessionRoutes);
app.use(`${apiPrefix}/verifier`, verifierRoutes);
app.use(`${apiPrefix}/warmers`, warmerRoutes);
app.use(`${apiPrefix}/bulk`, bulkRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.app.environment
  });
});

// Root API endpoint
app.get(`${apiPrefix}`, (req, res) => {
  res.status(200).json({
    name: 'WhatsApp Platform API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/docs`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  logger.error(`Error ${status}: ${message}`, {
    path: req.path,
    method: req.method,
    error: err.stack
  });

  res.status(status).json({
    success: false,
    error: message,
    stack: config.app.environment === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    logger.info('Database connection established');

    // Initialize Redis
    await initializeRedis();
    logger.info('Redis connection established');

    // Initialize task queue
    await initializeTaskQueue();
    logger.info('Task queue initialized');

    // Start server
    app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${config.app.environment} mode`);
      logger.info(`API available at: http://localhost:${port}${apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;

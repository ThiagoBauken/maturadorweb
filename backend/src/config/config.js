/**
 * Main application configuration
 */
export const config = {
  // Application settings
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS || '*',
    apiPrefix: '/api/v1',
    jwtSecret: process.env.JWT_SECRET || 'whatsapp-platform-secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h'
  },

  // Database connection
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'whatsapp_platform',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: 30000,
      idle: 10000
    }
  },

  // Redis cache settings
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    defaultTTL: 3600, // Default TTL in seconds (1 hour)
    prefix: 'wap:'  // WhatsApp Platform prefix for keys
  },

  // Evolution API connection settings
  evolutionApi: {
    baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY || 'your-api-key-here',
    defaultSessionOptions: {
      webhook: {
        enabled: false,
        url: process.env.WEBHOOK_URL || 'http://localhost:3000/api/v1/webhook',
        messageHook: true,
        ackHook: true,
        readHook: true,
        statusHook: true
      },
      websocketSSL: false,
      sessionTimeout: 60
    }
  },

  // DeepSeek AI for natural language tasks
  deepseek: {
    baseUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || 'your-api-key-here',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  },

  // Task queue configuration
  taskQueue: {
    processInterval: parseInt(process.env.TASK_PROCESS_INTERVAL || '1000'),
    maxConcurrent: parseInt(process.env.TASK_MAX_CONCURRENT || '25'),
    retryAttempts: parseInt(process.env.TASK_RETRY_ATTEMPTS || '3')
  },

  // Message verification settings
  verification: {
    defaultBatchSize: parseInt(process.env.VERIFICATION_BATCH_SIZE || '100'),
    retryDelay: parseInt(process.env.VERIFICATION_RETRY_DELAY || '1000'),
    maxConcurrent: parseInt(process.env.VERIFICATION_MAX_CONCURRENT || '10')
  },

  // Warming settings
  warming: {
    minDelay: parseInt(process.env.WARMING_MIN_DELAY || '30'),
    maxDelay: parseInt(process.env.WARMING_MAX_DELAY || '90'),
    defaultSessionPoolSize: parseInt(process.env.WARMING_SESSION_POOL_SIZE || '5'),
    defaultRestInterval: parseInt(process.env.WARMING_REST_INTERVAL || '10'),
    defaultRestDuration: parseInt(process.env.WARMING_REST_DURATION || '600')
  },

  // Bulk messaging settings
  bulk: {
    defaultBatchSize: parseInt(process.env.BULK_BATCH_SIZE || '50'),
    defaultConcurrency: parseInt(process.env.BULK_CONCURRENCY || '5'),
    dayMaxLimit: parseInt(process.env.BULK_DAY_MAX_LIMIT || '1000'),
    retryAttempts: parseInt(process.env.BULK_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.BULK_RETRY_DELAY || '1000')
  },

  // Media upload settings
  media: {
    uploadDir: process.env.MEDIA_UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MEDIA_MAX_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.MEDIA_ALLOWED_TYPES || 'jpg,jpeg,png,gif,mp4,mp3,pdf,doc,docx,xls,xlsx,ppt,pptx',
    storageType: process.env.MEDIA_STORAGE_TYPE || 'local' // local, s3, etc.
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    directory: process.env.LOG_DIR || './logs'
  }
};

export default config;

import { Sequelize } from 'sequelize';
import { config } from './config.js';
import logger from '../utils/logger.js';

// Create Sequelize instance
const sequelizeOptions = {
  dialect: config.database.dialect,
  logging: config.database.logging ? (msg) => logger.debug(msg) : false,
  pool: {
    max: config.database.pool.max,
    min: config.database.pool.min,
    acquire: config.database.pool.acquire,
    idle: config.database.pool.idle
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false,
    charset: 'utf8mb4',
    dialectOptions: {
      collate: 'utf8mb4_unicode_ci'
    }
  }
};

// Add host configuration (support for Unix socket or TCP)
if (config.database.host.startsWith('/')) {
  // Unix socket connection
  sequelizeOptions.host = config.database.host;
} else {
  // TCP connection
  sequelizeOptions.host = config.database.host;
  sequelizeOptions.port = config.database.port;
}

// Add SSL if needed
if (config.database.ssl) {
  sequelizeOptions.dialectOptions = {
    ...sequelizeOptions.dialectOptions,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  sequelizeOptions
);

/**
 * Initialize database connection and sync models
 */
export const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync models (only in development by default)
    if (config.app.environment === 'development') {
      const shouldForce = process.env.DB_FORCE_SYNC === 'true';
      const shouldAlter = process.env.DB_ALTER_SYNC === 'true';

      if (shouldForce) {
        logger.warn('Forcing database sync (all data will be lost)');
        await sequelize.sync({ force: true });
        logger.info('Database synced (forced)');
      } else if (shouldAlter) {
        logger.warn('Altering database tables to match models');
        await sequelize.sync({ alter: true });
        logger.info('Database synced (altered)');
      } else {
        await sequelize.sync();
        logger.info('Database synced');
      }
    }

    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = async () => {
  try {
    await sequelize.authenticate();
    return {
      status: 'connected',
      dialect: config.database.dialect,
      host: config.database.host,
      database: config.database.database
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message
    };
  }
};

/**
 * Close database connection
 */
export const closeDatabaseConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Export Sequelize instance as default
export default sequelize;

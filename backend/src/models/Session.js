import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  instanceName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true // Will be null initially until connected
  },
  status: {
    type: DataTypes.ENUM(
      'initializing',
      'pending',
      'connected',
      'disconnected',
      'reconnecting',
      'failed'
    ),
    defaultValue: 'initializing'
  },
  connectionData: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      verificationEnabled: true,
      bulkSendEnabled: true,
      warmingEnabled: true,
      maxOperationsPerHour: 100
    }
  },
  metrics: {
    type: DataTypes.JSON,
    defaultValue: {
      messagesProcessed: 0,
      verificationCount: 0,
      failureRate: 0,
      reconnectionAttempts: 0
    }
  }
}, {
  // Enable timestamps (createdAt, updatedAt)
  timestamps: true,

  // Add hooks
  hooks: {
    // Update metrics when session is updated
    beforeUpdate: async (session) => {
      // Update lastActive when status changes to connected
      if (session.changed('status') && session.status === 'connected') {
        session.lastActive = new Date();
      }
    }
  }
});

// Define associations
Session.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Instance methods
Session.prototype.updateMetrics = async function(metricUpdates) {
  this.metrics = {
    ...this.metrics,
    ...metricUpdates
  };
  await this.save();
};

// Check if session is available for an operation type
Session.prototype.isAvailableFor = function(operationType) {
  // First check if session is connected
  if (this.status !== 'connected') {
    return false;
  }

  // Check if operation type is enabled
  switch (operationType) {
    case 'verification':
      return this.settings.verificationEnabled;
    case 'bulkSend':
      return this.settings.bulkSendEnabled;
    case 'warming':
      return this.settings.warmingEnabled;
    default:
      return true;
  }
};

// Static method to find least utilized session for an operation
Session.findLeastUtilizedFor = async function(userId, operationType) {
  const sessions = await this.findAll({
    where: {
      userId,
      status: 'connected',
      [`settings.${operationType}Enabled`]: true
    },
    order: [
      ['metrics.messagesProcessed', 'ASC']
    ]
  });

  return sessions.length > 0 ? sessions[0] : null;
};

export default Session;

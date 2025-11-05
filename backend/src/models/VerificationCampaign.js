import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const VerificationCampaign = sequelize.define('VerificationCampaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'paused',
      'completed',
      'failed'
    ),
    defaultValue: 'pending'
  },
  totalNumbers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  processedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  validCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      batchSize: 50,
      autoExport: false,
      retryFailed: true,
      preferredSessions: []
    }
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedTimeRemaining: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true
  }
}, {
  // Enable timestamps (createdAt, updatedAt)
  timestamps: true,

  // Add hooks
  hooks: {
    // Set startedAt when campaign starts processing
    beforeUpdate: async (campaign) => {
      if (campaign.changed('status')) {
        // If status is changing to processing and startedAt is not set
        if (campaign.status === 'processing' && !campaign.startedAt) {
          campaign.startedAt = new Date();
        }

        // If status is changing to completed and there was a startedAt
        if (campaign.status === 'completed' && campaign.startedAt) {
          campaign.completedAt = new Date();
        }
      }
    }
  }
});

// Define associations
VerificationCampaign.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Instance methods
VerificationCampaign.prototype.updateCounts = async function(processedIncrement = 0, validIncrement = 0) {
  this.processedCount += processedIncrement;
  this.validCount += validIncrement;

  // Check if campaign is complete
  if (this.processedCount >= this.totalNumbers) {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Calculate estimated time remaining
  if (this.processedCount > 0 && this.startedAt) {
    const elapsedSeconds = (Date.now() - new Date(this.startedAt).getTime()) / 1000;
    const numberPerSecond = this.processedCount / elapsedSeconds;
    const remainingNumbers = this.totalNumbers - this.processedCount;

    this.estimatedTimeRemaining = numberPerSecond > 0
      ? Math.round(remainingNumbers / numberPerSecond)
      : null;
  }

  return await this.save();
};

// Reactivate a completed campaign for re-verification
VerificationCampaign.prototype.reactivate = async function() {
  if (this.status === 'completed' || this.status === 'failed') {
    this.status = 'pending';
    this.startedAt = null;
    this.completedAt = null;
    this.processedCount = 0;
    this.validCount = 0;
    this.estimatedTimeRemaining = null;

    return await this.save();
  }

  return this;
};

// Generate a summary of the campaign
VerificationCampaign.prototype.generateSummary = function() {
  const validPercentage = this.totalNumbers > 0
    ? ((this.validCount / this.totalNumbers) * 100).toFixed(2)
    : 0;

  const invalidCount = this.processedCount - this.validCount;
  const pendingCount = this.totalNumbers - this.processedCount;

  return {
    id: this.id,
    name: this.name,
    status: this.status,
    progress: {
      totalNumbers: this.totalNumbers,
      processedCount: this.processedCount,
      validCount: this.validCount,
      invalidCount,
      pendingCount,
      percentComplete: (this.processedCount / this.totalNumbers * 100).toFixed(2),
      validPercentage
    },
    timing: {
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      estimatedTimeRemaining: this.estimatedTimeRemaining
    }
  };
};

export default VerificationCampaign;

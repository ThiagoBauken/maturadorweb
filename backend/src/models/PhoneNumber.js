import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import VerificationCampaign from './VerificationCampaign.js';

const PhoneNumber = sequelize.define('PhoneNumber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'valid',
      'invalid',
      'failed',
      'retrying'
    ),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attemptCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAttempt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Enable timestamps (createdAt, updatedAt)
  timestamps: true,

  // Add indexes for faster querying
  indexes: [
    {
      fields: ['number'],
      // Not unique because the same number could be in different campaigns
    },
    {
      fields: ['campaignId', 'status'],
      // Useful for querying numbers by campaign and status
    }
  ],

  // Add hooks
  hooks: {
    // Track attempts
    beforeUpdate: async (phoneNumber) => {
      if (phoneNumber.changed('status')) {
        // If status is changing to retrying, increment attemptCount
        if (phoneNumber.status === 'retrying') {
          phoneNumber.attemptCount += 1;
        }

        // If status is changing to valid or invalid, set verifiedAt
        if (phoneNumber.status === 'valid' || phoneNumber.status === 'invalid') {
          phoneNumber.verifiedAt = new Date();
        }

        // Set lastAttempt for any status change except 'pending'
        if (phoneNumber.status !== 'pending') {
          phoneNumber.lastAttempt = new Date();
        }
      }
    }
  }
});

// Define associations
PhoneNumber.belongsTo(VerificationCampaign, {
  foreignKey: 'campaignId',
  onDelete: 'CASCADE'
});

// Add reverse association to make it easier to work with
VerificationCampaign.hasMany(PhoneNumber, {
  foreignKey: 'campaignId'
});

// Static methods for formatting and validation
PhoneNumber.formatNumber = function(number) {
  // Remove all non-numeric characters
  let cleaned = String(number).replace(/\D/g, '');

  // Apply formatting rules
  if (!cleaned.startsWith('9') && !cleaned.startsWith('55') && cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }

  return cleaned;
};

PhoneNumber.isValidFormat = function(number) {
  const cleaned = this.formatNumber(number);
  // Basic validation - should be a minimum length
  return cleaned.length >= 10;
};

// Instance methods
PhoneNumber.prototype.markAsValid = async function() {
  this.status = 'valid';
  this.verifiedAt = new Date();

  // Update campaign counts
  const campaign = await VerificationCampaign.findByPk(this.campaignId);
  if (campaign) {
    await campaign.updateCounts(1, 1);
  }

  return await this.save();
};

PhoneNumber.prototype.markAsInvalid = async function() {
  this.status = 'invalid';
  this.verifiedAt = new Date();

  // Update campaign counts
  const campaign = await VerificationCampaign.findByPk(this.campaignId);
  if (campaign) {
    await campaign.updateCounts(1, 0);
  }

  return await this.save();
};

PhoneNumber.prototype.markAsFailed = async function(errorMessage = null) {
  this.status = 'failed';
  this.lastAttempt = new Date();

  if (errorMessage) {
    this.errorMessage = errorMessage;
  }

  return await this.save();
};

export default PhoneNumber;

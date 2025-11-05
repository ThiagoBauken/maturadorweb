import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const BulkCampaign = sequelize.define('BulkCampaign', {
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
      'draft',
      'pending',
      'processing',
      'paused',
      'completed',
      'failed'
    ),
    defaultValue: 'draft'
  },
  messageTemplate: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageVariations: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mediaAttachments: {
    type: DataTypes.JSON,
    defaultValue: []
    // Structure: [{ type: 'image|video|document', url: 'path', caption: 'optional caption' }]
  },
  schedule: {
    type: DataTypes.JSON,
    defaultValue: {
      // Active days (0-6, Sunday to Saturday)
      activeDays: [1, 2, 3, 4, 5], // Monday to Friday

      // Time ranges for sending messages
      timeRanges: [
        {
          startHour: 9,
          startMinute: 0,
          endHour: 17,
          endMinute: 0
        }
      ],
      // Immediate or scheduled date
      startDate: null
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      delayRange: {
        minSeconds: 40,
        maxSeconds: 200
      },
      periodicPause: {
        count: 10,
        seconds: 120
      },
      preferredSessions: [],
      retryCount: 2,
      useAiVariations: false,
      variationCount: 0
    }
  },
  totalRecipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedCompletionTime: {
    type: DataTypes.DATE,
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

          // Calculate estimated completion time
          if (campaign.totalRecipients > 0) {
            const { minSeconds, maxSeconds } = campaign.settings.delayRange;
            const avgDelay = (minSeconds + maxSeconds) / 2;
            const periodicPauseEffect = campaign.settings.periodicPause.seconds / campaign.settings.periodicPause.count;
            const avgMessageTime = avgDelay + periodicPauseEffect;

            // Estimate time based on average message processing time
            const remainingMessages = campaign.totalRecipients - campaign.sentCount;
            const estimatedSeconds = remainingMessages * avgMessageTime;

            const estimatedCompletionTime = new Date();
            estimatedCompletionTime.setSeconds(estimatedCompletionTime.getSeconds() + estimatedSeconds);
            campaign.estimatedCompletionTime = estimatedCompletionTime;
          }
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
BulkCampaign.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Define the Recipient model for storing campaign recipients
const Recipient = sequelize.define('Recipient', {
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
      'sent',
      'failed',
      'retrying'
    ),
    defaultValue: 'pending'
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sentAt: {
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
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

// Define the relationship between BulkCampaign and Recipient
BulkCampaign.hasMany(Recipient, {
  foreignKey: 'campaignId',
  onDelete: 'CASCADE'
});

Recipient.belongsTo(BulkCampaign, {
  foreignKey: 'campaignId'
});

// Instance methods for BulkCampaign
BulkCampaign.prototype.updateCounts = async function(sentIncrement = 0, failedIncrement = 0) {
  this.sentCount += sentIncrement;
  this.failedCount += failedIncrement;

  // Check if campaign is complete
  if (this.sentCount + this.failedCount >= this.totalRecipients) {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Update estimated completion time
  if (this.sentCount > 0 && this.startedAt && this.status === 'processing') {
    const elapsedSeconds = (Date.now() - new Date(this.startedAt).getTime()) / 1000;
    const messagesPerSecond = this.sentCount / elapsedSeconds;
    const remainingMessages = this.totalRecipients - this.sentCount - this.failedCount;

    if (messagesPerSecond > 0) {
      const estimatedRemainingSeconds = remainingMessages / messagesPerSecond;
      const estimatedCompletionTime = new Date();
      estimatedCompletionTime.setSeconds(estimatedCompletionTime.getSeconds() + estimatedRemainingSeconds);
      this.estimatedCompletionTime = estimatedCompletionTime;
    }
  }

  return await this.save();
};

BulkCampaign.prototype.isScheduledNow = function() {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Check if campaign has a specific start date that hasn't occurred yet
  if (this.schedule.startDate) {
    const startDate = new Date(this.schedule.startDate);
    if (startDate > now) {
      return false;
    }
  }

  // Check if today is an active day
  if (!this.schedule.activeDays.includes(currentDay)) {
    return false;
  }

  // Check if current time is within any of the scheduled time ranges
  return this.schedule.timeRanges.some(range => {
    const startMinutes = range.startHour * 60 + range.startMinute;
    const endMinutes = range.endHour * 60 + range.endMinute;

    return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
  });
};

// Export both models
export { BulkCampaign, Recipient };
export default BulkCampaign;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Session from './Session.js';

const Warmer = sequelize.define('Warmer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'standard', // Number to number warming
      'group',    // Number to group warming
      'advanced'  // Custom pattern warming with AI
    ),
    defaultValue: 'standard'
  },
  status: {
    type: DataTypes.ENUM(
      'inactive',  // Not running
      'active',    // Currently running
      'paused',    // Temporarily paused
      'completed', // Finished all warming
      'failed'     // Error occurred
    ),
    defaultValue: 'inactive'
  },
  messages: {
    type: DataTypes.JSON,
    defaultValue: []
    // Array of message objects: [{ text: "message text", media: { type, url } }]
  },
  targets: {
    type: DataTypes.JSON,
    defaultValue: []
    // Array of phone numbers for group warming or more complex warming patterns
  },
  scheduling: {
    type: DataTypes.JSON,
    defaultValue: {
      // Active days (0-6, Sunday to Saturday)
      activeDays: [1, 2, 3, 4, 5], // Monday to Friday
      // Time ranges for sending messages
      timeRanges: [
        {
          start: '09:00',
          end: '17:00'
        }
      ]
    }
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      messageDelay: {
        min: 30, // Minimum delay between messages in seconds
        max: 90  // Maximum delay between messages in seconds
      },
      restInterval: {
        count: 10,     // Take a break after this many messages
        duration: 600  // Break duration in seconds (10 minutes)
      },
      useAi: false     // Whether to use AI for message generation
    }
  },
  progress: {
    type: DataTypes.JSON,
    defaultValue: {
      messagesCount: 0,      // Total messages sent
      lastActive: null,      // Last time a message was sent
      lastTarget: null,      // Last target message was sent to
      responseRate: 0        // Estimated response rate
    }
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      messagesCount: 0,     // Total messages sent
      responsesCount: 0,    // Total responses received
      responseRate: 0       // Response rate percentage
    }
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // Enable timestamps (createdAt, updatedAt)
  timestamps: true,

  // Add hooks
  hooks: {
    // Set startedAt when warmer becomes active
    beforeUpdate: async (warmer) => {
      if (warmer.changed('status')) {
        // If status is changing to active and startedAt is not set
        if (warmer.status === 'active' && !warmer.startedAt) {
          warmer.startedAt = new Date();

          // Update progress lastActive field
          const progress = typeof warmer.progress === 'string'
            ? JSON.parse(warmer.progress)
            : warmer.progress || {};

          progress.lastActive = new Date();
          warmer.progress = progress;
        }

        // If status is changing to completed and there was a startedAt
        if (warmer.status === 'completed' && warmer.startedAt) {
          warmer.completedAt = new Date();
        }
      }
    }
  }
});

// Define associations
Warmer.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

// Single session per warmer
Warmer.belongsTo(Session, {
  foreignKey: 'sessionId'
});

// Instance methods
Warmer.prototype.isActive = function() {
  return this.status === 'active';
};

Warmer.prototype.isScheduledNow = function() {
  const now = new Date();
  const currentDay = now.getDay(); // 0-6

  // Get hours and minutes as strings like '09:30'
  const currentTime = now.toTimeString().substring(0, 5);

  // Check if today is an active day
  if (!this.scheduling.activeDays.includes(currentDay)) {
    return false;
  }

  // Check if current time is within any of the scheduled time ranges
  return this.scheduling.timeRanges.some(range => {
    return currentTime >= range.start && currentTime <= range.end;
  });
};

Warmer.prototype.updateProgress = async function(update) {
  const progress = typeof this.progress === 'string'
    ? JSON.parse(this.progress)
    : this.progress || {};

  this.progress = {
    ...progress,
    ...update,
    lastActive: new Date()
  };

  return await this.save();
};

Warmer.prototype.updateStats = async function(update) {
  const stats = typeof this.stats === 'string'
    ? JSON.parse(this.stats)
    : this.stats || {};

  this.stats = {
    ...stats,
    ...update
  };

  // Calculate response rate if we have messages and responses
  if (this.stats.messagesCount > 0 && 'responsesCount' in update) {
    this.stats.responseRate = Math.round((this.stats.responsesCount / this.stats.messagesCount) * 100);
  }

  return await this.save();
};

export default Warmer;

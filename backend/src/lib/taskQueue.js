import { createClient } from 'redis';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { Semaphore } from 'async-mutex';

// Singleton instance of the task queue
let redisClient;
const taskHandlers = {};
const activeTasks = new Map();

// Enhanced concurrency control with circuit breaker
const operationSemaphore = new Semaphore(config.taskQueue.maxConcurrent || 25);
const circuitBreakerStates = new Map();

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 10000
};

// Enhanced task processing metrics
const taskMetrics = {
  processed: 0,
  succeeded: 0,
  failed: 0,
  lastError: null
};

// Session rotation tracker
const sessionRotation = {
  currentIndex: 0,
  instances: []
};

/**
 * Initialize the task queue with Redis
 */
export const initializeTaskQueue = async () => {
  try {
    redisClient = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password || undefined
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    await redisClient.connect();
    logger.info('Task queue initialized successfully');

    // Start task processor
    startTaskProcessor();

    return true;
  } catch (error) {
    logger.error('Failed to initialize task queue:', error);
    throw error;
  }
};

/**
 * Add a task to the queue
 * @param {string} taskType - Type of task to execute
 * @param {Object} data - Task data
 * @returns {Promise<boolean>} - Whether the task was queued successfully
 */
export const addTask = async (taskType, data) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Task queue not initialized');
      return false;
    }

    const taskId = `${taskType}:${Date.now()}:${Math.random().toString(36).substring(2, 10)}`;
    const task = {
      id: taskId,
      type: taskType,
      data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to Redis queue and set task details
    await redisClient.rPush('task_queue', taskId);
    await redisClient.hSet(`task:${taskId}`, {
      ...task,
      data: JSON.stringify(data)
    });

    logger.info(`Task ${taskId} added to queue`);
    return true;
  } catch (error) {
    logger.error('Error adding task to queue:', error);
    return false;
  }
};

/**
 * Register a task handler
 * @param {string} taskType - Type of task
 * @param {Function} handler - Task handler function
 */
export const registerTaskHandler = (taskType, handler) => {
  if (typeof handler !== 'function') {
    throw new Error(`Handler for task type ${taskType} must be a function`);
  }

  taskHandlers[taskType] = handler;
  logger.info(`Registered handler for task type: ${taskType}`);
};

/**
 * Process a task from the queue
 */
const processTask = async () => {
  let taskId;
  let taskRelease = null;

  try {
    // Get the next task from the queue
    taskId = await redisClient.lPop('task_queue');

    if (!taskId) {
      return; // No tasks in the queue
    }

    // Get task details
    const taskDetails = await redisClient.hGetAll(`task:${taskId}`);

    if (!taskDetails || !taskDetails.type) {
      logger.error(`Invalid task details for ${taskId}`);
      return;
    }

    const task = {
      ...taskDetails,
      data: JSON.parse(taskDetails.data || '{}')
    };

    // Update task status to processing
    await redisClient.hSet(`task:${taskId}`, 'status', 'processing');
    await redisClient.hSet(`task:${taskId}`, 'startedAt', new Date().toISOString());

    // Track active task
    activeTasks.set(taskId, task);

    // Get the handler for this task type
    const handler = taskHandlers[task.type];

    if (!handler) {
      logger.error(`No handler registered for task type: ${task.type}`);
      await redisClient.hSet(`task:${taskId}`, 'status', 'failed');
      await redisClient.hSet(`task:${taskId}`, 'error', 'No handler found');
      activeTasks.delete(taskId);
      return;
    }

    // Acquire a permit from the semaphore
    taskRelease = await operationSemaphore.acquire();

    logger.info(`Processing task ${taskId} of type ${task.type}`);

    // Get next available session instance
    const instance = getNextSessionInstance(task.type);

    // Check circuit breaker state
    if (checkCircuitBreaker(instance)) {
      throw new Error(`Circuit breaker open for instance ${instance}`);
    }

    // Execute task with instance rotation and circuit breaker
    const result = await handler({
      ...task.data,
      instance,
      attempt: 1,
      maxAttempts: config.taskQueue.maxAttempts || 3
    });

    // Update metrics
    taskMetrics.processed++;
    taskMetrics.succeeded++;
    updateCircuitBreaker(instance, true);

    // Update task status to completed
    await redisClient.hSet(`task:${taskId}`, 'status', 'completed');
    await redisClient.hSet(`task:${taskId}`, 'completedAt', new Date().toISOString());

    if (result) {
      await redisClient.hSet(`task:${taskId}`, 'result', JSON.stringify(result));
    }

    logger.info(`Task ${taskId} completed successfully`);
  } catch (error) {
    logger.error(`Error processing task ${taskId}:`, error);

    // Update task status to failed
    if (taskId) {
      await redisClient.hSet(`task:${taskId}`, 'status', 'failed');
      await redisClient.hSet(`task:${taskId}`, 'error', error.message || 'Unknown error');
      await redisClient.hSet(`task:${taskId}`, 'errorAt', new Date().toISOString());
    }
  } finally {
    // Release the semaphore
    if (taskRelease) {
      taskRelease();
    }

    // Remove from active tasks
    if (taskId) {
      activeTasks.delete(taskId);
    }
  }
};

/**
 * Start processing tasks from the queue
 */
const startTaskProcessor = () => {
  const processInterval = config.taskQueue.processInterval || 1000;

  // Process tasks at regular intervals
  setInterval(async () => {
    try {
      await processTask();
    } catch (error) {
      logger.error('Error in task processor:', error);
    }
  }, processInterval);

  logger.info(`Task processor started with interval ${processInterval}ms`);
};

/**
 * Get the status of a specific task
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} - Task status details
 */
export const getTaskStatus = async (taskId) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return { error: 'Task queue not initialized' };
    }

    const taskDetails = await redisClient.hGetAll(`task:${taskId}`);

    if (!taskDetails || !taskDetails.type) {
      return { error: 'Task not found' };
    }

    return {
      id: taskId,
      type: taskDetails.type,
      status: taskDetails.status,
      createdAt: taskDetails.createdAt,
      startedAt: taskDetails.startedAt,
      completedAt: taskDetails.completedAt,
      error: taskDetails.error
    };
  } catch (error) {
    logger.error(`Error getting task status for ${taskId}:`, error);
    return { error: error.message || 'Unknown error' };
  }
};

// Default task handlers
registerTaskHandler('processBulkCampaign', async (data) => {
  const { campaignId, userId } = data;
  logger.info(`Started bulk campaign processing for campaign ${campaignId}`);

  // Import controllers dynamically to avoid circular dependencies
  const bulkController = await import('../controllers/bulk.controller.js');

  // Note: The actual implementation would be called from the controller
  // This is just a placeholder for demonstration
  return { status: 'started', campaignId };
});

registerTaskHandler('processVerificationCampaign', async (data) => {
  const { campaignId, userId } = data;
  logger.info(`Started verification campaign processing for campaign ${campaignId}`);

  // Import controllers dynamically to avoid circular dependencies
  const verifierController = await import('../controllers/verifier.controller.js');

  // Note: The actual implementation would be called from the controller
  return { status: 'started', campaignId };
});

registerTaskHandler('processWarmer', async (data) => {
  const { warmerId, userId } = data;
  logger.info(`Started warmer processing for warmer ${warmerId}`);

  // Import controllers dynamically to avoid circular dependencies
  const warmerController = await import('../controllers/warmer.controller.js');

  // Note: The actual implementation would be called from the controller
  return { status: 'started', warmerId };
});

registerTaskHandler('generateWarmerConversation', async (data) => {
  const { warmerId, userId } = data;
  logger.info(`Started conversation generation for warmer ${warmerId}`);

  // Import controllers dynamically to avoid circular dependencies
  const warmerController = await import('../controllers/warmer.controller.js');

  // Note: The actual implementation would be called from the controller
  return { status: 'started', warmerId };
});

registerTaskHandler('sessionRestart', async (data) => {
  const { sessionId, instanceName, userId } = data;
  logger.info(`Restarting session ${sessionId} (${instanceName})`);

  // Import controllers dynamically to avoid circular dependencies
  const sessionController = await import('../controllers/session.controller.js');

  // Note: The actual implementation would be called from the controller
  return { status: 'started', sessionId };
});

// Export task queue functionality
export default {
  initialize: initializeTaskQueue,
  addTask,
  registerTaskHandler,
  getTaskStatus
};

// Session rotation functions
function getNextSessionInstance(taskType) {
  // Filter instances by task type capabilities
  const availableInstances = sessionRotation.instances.filter(instance =>
    instance.capabilities.includes(taskType)
  );

  if (availableInstances.length === 0) {
    throw new Error(`No instances available for task type: ${taskType}`);
  }

  // Round-robin selection
  sessionRotation.currentIndex =
    (sessionRotation.currentIndex + 1) % availableInstances.length;

  return availableInstances[sessionRotation.currentIndex].instanceName;
}

// Circuit breaker functions
function checkCircuitBreaker(instance) {
  const state = circuitBreakerStates.get(instance) || {
    failures: 0,
    successes: 0,
    state: 'CLOSED',
    nextTry: 0
  };

  if (state.state === 'OPEN' && Date.now() < state.nextTry) {
    return true;
  }
  return false;
}

function updateCircuitBreaker(instance, success) {
  let state = circuitBreakerStates.get(instance) || {
    failures: 0,
    successes: 0,
    state: 'CLOSED',
    nextTry: 0
  };

  if (success) {
    state.successes++;
    state.failures = 0;
    if (state.successes > CIRCUIT_BREAKER_CONFIG.successThreshold) {
      state.state = 'CLOSED';
    }
  } else {
    state.failures++;
    state.successes = 0;
    if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      state.state = 'OPEN';
      state.nextTry = Date.now() + CIRCUIT_BREAKER_CONFIG.timeout;
    }
  }

  circuitBreakerStates.set(instance, state);
}

// Initialize session instances from database
async function initializeSessionRotation() {
  try {
    // Import Session model to get connected instances
    const { Session } = await import('../models/index.js');

    const sessions = await Session.findAll({
      where: { status: 'connected' }
    });

    sessionRotation.instances = sessions.map(session => ({
      instanceName: session.instanceName,
      capabilities: ['verification', 'bulkSend', 'warming']
    }));

    logger.info(`Initialized ${sessionRotation.instances.length} WhatsApp instances`);
  } catch (error) {
    logger.error('Failed to initialize session rotation:', error);
    // Don't throw - allow system to start without sessions
  }
}

// Periodically refresh instances
setInterval(() => {
  initializeSessionRotation().catch(error =>
    logger.error('Session rotation refresh failed:', error)
  );
}, 30000); // 30 seconds

export { taskHandlers };

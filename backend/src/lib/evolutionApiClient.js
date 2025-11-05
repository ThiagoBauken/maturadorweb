import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { getCache, setCache } from '../config/redis.js';

// Cache TTL settings
const CACHE_TTL = {
  INSTANCE_INFO: 60, // 1 minute
  PROFILE_INFO: 3600, // 1 hour
  GROUPS: 1800, // 30 minutes
  CONTACTS: 3600, // 1 hour
  NUMBER_EXISTS: 86400, // 24 hours
};

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: config.evolutionApi.baseUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'apikey': config.evolutionApi.apiKey,
    'X-Instance-Rotation': 'true' // Enable session rotation
  }
});

// Add rate limiting interceptors
apiClient.interceptors.request.use(
  async (config) => {
    const currentRate = await checkRateLimit(config.url);
    if (currentRate.remaining <= 0) {
      throw new Error(`Rate limit exceeded for ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add automatic retry interceptor
apiClient.interceptors.response.use(
  null,
  async (error) => {
    const config = error.config;
    if (!config || !config.retry) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    const delay = Math.pow(2, config.__retryCount) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    return apiClient(config);
  }
);

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`Evolution API request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Evolution API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and handling errors
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`Evolution API response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`Evolution API error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      logger.error('Evolution API no response received:', error.request);
    } else {
      logger.error('Evolution API error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Create a new WhatsApp instance
 * @param {string} instanceName - Name for the instance
 * @param {Object} options - Instance configuration options
 * @returns {Promise<Object>} - Instance creation response
 */
const createInstance = async (instanceName, options = {}) => {
  try {
    const response = await apiClient.post('/instance/create', {
      instanceName,
      ...options
    });

    return response.data;
  } catch (error) {
    logger.error(`Failed to create instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Delete a WhatsApp instance
 * @param {string} instanceName - Name of the instance to delete
 * @returns {Promise<Object>} - Instance deletion response
 */
const deleteInstance = async (instanceName) => {
  try {
    const response = await apiClient.delete(`/instance/delete/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to delete instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Get instance connection QR code
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - QR code response
 */
const getQrCode = async (instanceName) => {
  try {
    const response = await apiClient.get(`/instance/qrcode/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get QR code for instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Connect to a WhatsApp instance
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Connection response
 */
const connect = async (instanceName) => {
  try {
    const response = await apiClient.post(`/instance/connect/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to connect instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Disconnect from a WhatsApp instance
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Disconnection response
 */
const disconnect = async (instanceName) => {
  try {
    const response = await apiClient.post(`/instance/disconnect/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to disconnect instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Restart a WhatsApp instance
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Restart response
 */
const restart = async (instanceName) => {
  try {
    const response = await apiClient.post(`/instance/restart/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to restart instance ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Get instance information
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Instance information
 */
const getInstanceInfo = async (instanceName) => {
  try {
    // Check cache first
    const cacheKey = `instance:info:${instanceName}`;
    const cachedInfo = await getCache(cacheKey);

    if (cachedInfo) {
      return cachedInfo;
    }

    const response = await apiClient.get(`/instance/info/${instanceName}`);

    // Cache the result
    await setCache(cacheKey, response.data, CACHE_TTL.INSTANCE_INFO);

    return response.data;
  } catch (error) {
    logger.error(`Failed to get instance info for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Get profile information for the connected instance
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Profile information
 */
const getProfileInfo = async (instanceName) => {
  try {
    // Check cache first
    const cacheKey = `profile:${instanceName}`;
    const cachedProfile = await getCache(cacheKey);

    if (cachedProfile) {
      return cachedProfile;
    }

    const response = await apiClient.get(`/instance/profile/${instanceName}`);

    // Cache the result
    await setCache(cacheKey, response.data, CACHE_TTL.PROFILE_INFO);

    return response.data;
  } catch (error) {
    logger.error(`Failed to get profile info for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Send a text message to a recipient
 * @param {string} instanceName - Name of the instance
 * @param {string} to - Phone number of the recipient
 * @param {string} text - Message content
 * @param {Object} options - Additional message options
 * @returns {Promise<Object>} - Message send response
 */
const sendMessage = async (instanceName, to, text, options = {}) => {
  try {
    const response = await apiClient.post(`/message/text/${instanceName}`, {
      to,
      text,
      ...options
    });

    return response.data;
  } catch (error) {
    logger.error(`Failed to send message from ${instanceName} to ${to}:`, error);
    throw error;
  }
};

/**
 * Send a media message (image, video, audio, document)
 * @param {string} instanceName - Name of the instance
 * @param {string} to - Phone number of the recipient
 * @param {string} mediaType - Type of media (image, video, audio, document)
 * @param {string} url - URL of the media or base64 content
 * @param {string} caption - Optional caption for the media
 * @param {Object} options - Additional message options
 * @returns {Promise<Object>} - Message send response
 */
const sendMedia = async (instanceName, to, mediaType, url, caption = '', options = {}) => {
  try {
    const endpoint = `/message/media/${instanceName}`;

    const payload = {
      to,
      mediaType,
      media: url,
      ...options
    };

    if (caption) {
      payload.caption = caption;
    }

    const response = await apiClient.post(endpoint, payload);

    return response.data;
  } catch (error) {
    logger.error(`Failed to send media from ${instanceName} to ${to}:`, error);
    throw error;
  }
};

/**
 * Check if a phone number exists on WhatsApp
 * @param {string} instanceName - Name of the instance
 * @param {string} phoneNumber - Phone number to check
 * @returns {Promise<Object>} - Verification result
 */
const checkNumberExists = async (instanceName, phoneNumber) => {
  try {
    // Clean phone number
    const cleanedNumber = phoneNumber.replace(/\D/g, '');

    // Check cache first
    const cacheKey = `verify:${cleanedNumber}`;
    const cachedResult = await getCache(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const response = await apiClient.get(`/contact/check/${instanceName}`, {
      params: {
        phone: cleanedNumber
      }
    });

    const result = {
      success: true,
      exists: response.data.exists,
      jid: response.data.jid || null
    };

    // Cache the result
    await setCache(cacheKey, result, CACHE_TTL.NUMBER_EXISTS);

    return result;
  } catch (error) {
    logger.error(`Failed to check number ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Get contact list from WhatsApp
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Array>} - List of contacts
 */
const getContacts = async (instanceName) => {
  try {
    // Check cache first
    const cacheKey = `contacts:${instanceName}`;
    const cachedContacts = await getCache(cacheKey);

    if (cachedContacts) {
      return cachedContacts;
    }

    const response = await apiClient.get(`/contact/get/${instanceName}`);

    // Cache the result
    await setCache(cacheKey, response.data, CACHE_TTL.CONTACTS);

    return response.data;
  } catch (error) {
    logger.error(`Failed to get contacts for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Get group list from WhatsApp
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Array>} - List of groups
 */
const getGroups = async (instanceName) => {
  try {
    // Check cache first
    const cacheKey = `groups:${instanceName}`;
    const cachedGroups = await getCache(cacheKey);

    if (cachedGroups) {
      return cachedGroups;
    }

    const response = await apiClient.get(`/group/get/${instanceName}`);

    // Cache the result
    await setCache(cacheKey, response.data, CACHE_TTL.GROUPS);

    return response.data;
  } catch (error) {
    logger.error(`Failed to get groups for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Send a message to a WhatsApp group
 * @param {string} instanceName - Name of the instance
 * @param {string} groupId - ID of the group
 * @param {string} text - Message content
 * @param {Object} options - Additional message options
 * @returns {Promise<Object>} - Message send response
 */
const sendGroupMessage = async (instanceName, groupId, text, options = {}) => {
  try {
    const response = await apiClient.post(`/message/group/${instanceName}`, {
      groupId,
      text,
      ...options
    });

    return response.data;
  } catch (error) {
    logger.error(`Failed to send group message from ${instanceName} to ${groupId}:`, error);
    throw error;
  }
};

/**
 * Get device info including battery level, etc.
 * @param {string} instanceName - Name of the instance
 * @returns {Promise<Object>} - Device information
 */
const getDeviceInfo = async (instanceName) => {
  try {
    const response = await apiClient.get(`/instance/device/${instanceName}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to get device info for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Set webhook URLs for WhatsApp events
 * @param {string} instanceName - Name of the instance
 * @param {Object} webhooks - Webhook configuration
 * @returns {Promise<Object>} - Webhook set response
 */
const setWebhooks = async (instanceName, webhooks) => {
  try {
    const response = await apiClient.post(`/webhook/set/${instanceName}`, webhooks);
    return response.data;
  } catch (error) {
    logger.error(`Failed to set webhooks for ${instanceName}:`, error);
    throw error;
  }
};

/**
 * Upload a file to be used in media messages
 * @param {string} instanceName - Name of the instance
 * @param {Object} fileData - File data in form data format
 * @returns {Promise<Object>} - Upload response with URL
 */
const uploadMedia = async (instanceName, fileData) => {
  try {
    const formData = new FormData();
    formData.append('file', fileData);

    const response = await apiClient.post(`/media/upload/${instanceName}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    logger.error(`Failed to upload media for ${instanceName}:`, error);
    throw error;
  }
};

// Export all functions
export default {
  createInstance,
  deleteInstance,
  getQrCode,
  connect,
  disconnect,
  restart,
  getInstanceInfo,
  getProfileInfo,
  sendMessage,
  sendMedia,
  checkNumberExists,
  getContacts,
  getGroups,
  sendGroupMessage,
  getDeviceInfo,
  setWebhooks,
  uploadMedia
};

import axios from 'axios';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';
import { getCache, setCache } from '../config/redis.js';

// Cache TTL for AI generations (24 hours)
const CACHE_TTL = 86400;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.deepseek.baseUrl || 'https://api.deepseek.com/v1',
  timeout: 60000, // 60 seconds for AI requests
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.deepseek.apiKey}`
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`DeepSeek API request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('DeepSeek API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and handling errors
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`DeepSeek API response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`DeepSeek API error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      logger.error('DeepSeek API no response received:', error.request);
    } else {
      logger.error('DeepSeek API error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Generate warming messages for conversation simulation
 * @param {number} participants - Number of participants in the conversation
 * @param {number} days - Number of days worth of conversation
 * @param {boolean} isGroupChat - Whether this is a group chat simulation
 * @returns {Promise<Object>} - Generated messages
 */
const generateWarmingMessages = async (participants = 2, days = 7, isGroupChat = false) => {
  try {
    // Check cache first
    const cacheKey = `ai:warming:${participants}:${days}:${isGroupChat ? 'group' : 'private'}`;
    const cachedMessages = await getCache(cacheKey);

    if (cachedMessages) {
      logger.info(`Using cached AI warming messages for ${participants} participants over ${days} days`);
      return cachedMessages;
    }

    // Construct the prompt for the AI
    const prompt = constructWarmingPrompt(participants, days, isGroupChat);

    // Generate completion
    const response = await apiClient.post('/chat/completions', {
      model: config.deepseek.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that generates realistic WhatsApp conversation data for account warming purposes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    let result;
    try {
      // Parse the content (should be JSON)
      const content = response.data.choices[0].message.content;
      result = JSON.parse(content);

      // Validate the expected format
      if (!result.messages || !Array.isArray(result.messages)) {
        throw new Error('Invalid response format: messages array missing');
      }

      // Cache the result
      await setCache(cacheKey, result, CACHE_TTL);

      logger.info(`Generated ${result.messages.length} warming messages for ${participants} participants over ${days} days`);
      return result;
    } catch (parseError) {
      logger.error('Error parsing DeepSeek response:', parseError);
      throw new Error('Failed to parse AI response into valid format');
    }
  } catch (error) {
    logger.error('Error generating warming messages:', error);
    throw error;
  }
};

/**
 * Generate a conversational response to a message
 * @param {string} message - The incoming message to respond to
 * @param {Array} context - Previous messages for context
 * @returns {Promise<string>} - AI generated response
 */
const generateChatResponse = async (message, context = []) => {
  try {
    // Prepare conversation history
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly, helpful person chatting on WhatsApp. Keep your responses concise and casual, as if you\'re texting a friend.'
      }
    ];

    // Add context messages
    context.forEach((msg, index) => {
      const role = index % 2 === 0 ? 'user' : 'assistant';
      messages.push({ role, content: msg });
    });

    // Add the current message
    messages.push({ role: 'user', content: message });

    // Generate completion
    const response = await apiClient.post('/chat/completions', {
      model: config.deepseek.model || 'deepseek-chat',
      messages: messages,
      temperature: 0.8,
      max_tokens: 300
    });

    const content = response.data.choices[0].message.content;
    logger.info(`Generated chat response for message: "${message.substring(0, 30)}..."`);

    return content;
  } catch (error) {
    logger.error('Error generating chat response:', error);
    throw error;
  }
};

/**
 * Construct a detailed prompt for warming message generation
 */
const constructWarmingPrompt = (participants, days, isGroupChat) => {
  const conversationType = isGroupChat ? 'group chat' : 'private conversation';

  return `
Generate a realistic WhatsApp ${conversationType} between ${participants} people over a period of ${days} days.

The conversation should:
- Feel natural and authentic
- Include greetings, casual chit-chat, questions, and responses
- Have some messages on each day (with higher frequency on later days)
- Include shorter and longer messages
- Have some time gaps between messages
- Include common chat patterns like asking about weekend plans, work discussions, sharing news
- Include occasional emoji usage

Assign each participant a persona (e.g., friend, colleague, family member) and maintain consistent character for each person throughout the conversation.

Return ONLY a JSON object with the following structure:
{
  "messages": [
    {
      "sender": 1, // (number from 1 to ${participants})
      "content": "Hey, how's it going?", // The message text
      "day": 1 // Day number (1 to ${days})
    },
    // more messages...
  ]
}

The messages should be sorted chronologically by day. Make sure to have varying frequency of messages per day, with earlier days having fewer messages and later days having more messages to simulate warming up the conversation naturally. No other formatting or explanation, just the valid JSON.
`;
};

/**
 * Generate personalized message variations based on a template
 * @param {string} templateMessage - Base message template
 * @param {number} variations - Number of variations to generate
 * @returns {Promise<Array<string>>} - Array of generated message variations
 */
const generateMessageVariations = async (templateMessage, variations = 5) => {
  try {
    // Check cache first
    const cacheKey = `ai:variations:${templateMessage.substring(0, 50)}:${variations}`;
    const cachedVariations = await getCache(cacheKey);

    if (cachedVariations) {
      return cachedVariations;
    }

    const prompt = `
Generate ${variations} different variations of the following message. Each variation should convey the same meaning but use different wording, tone, or structure. Make them sound natural and conversational, as if written by different people:

"${templateMessage}"

Return ONLY a JSON array of strings with the variations. For example:
["First variation", "Second variation", ...]
`;

    const response = await apiClient.post('/chat/completions', {
      model: config.deepseek.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that generates message variations for marketing and outreach purposes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    try {
      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);

      if (!Array.isArray(result)) {
        throw new Error('Expected array response');
      }

      // Cache the result
      await setCache(cacheKey, result, CACHE_TTL);

      logger.info(`Generated ${result.length} variations of message template`);
      return result;
    } catch (parseError) {
      logger.error('Error parsing message variations response:', parseError);
      throw new Error('Failed to parse AI response into valid format');
    }
  } catch (error) {
    logger.error('Error generating message variations:', error);
    throw error;
  }
};

/**
 * Parse contacts from a bulk list with AI assistance
 * @param {Array<string>} rows - Raw input rows
 * @returns {Promise<Array<Object>>} - Structured contact data
 */
const parseContactsFromBulk = async (rows) => {
  try {
    // Take a sample of rows to analyze (max 20)
    const sampleRows = rows.slice(0, 20).join('\n');

    const prompt = `
Analyze these sample rows from a contact list and determine the best way to extract:
1. Phone numbers
2. Names
3. Tags/labels (if present)

Sample rows:
${sampleRows}

Return ONLY a JSON object with:
1. Detected format description
2. Extraction rules for each field
3. JSON example of a parsed row
`;

    const response = await apiClient.post('/chat/completions', {
      model: config.deepseek.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that analyzes data formats and extracts structured information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    // We only use the analysis for guidance, then process the rows ourselves
    // This prevents sending the entire contacts list to the API
    const content = response.data.choices[0].message.content;
    const analysis = JSON.parse(content);

    // Implement extraction based on detected format
    // In a real implementation, this would use the analysis to build extraction logic
    // For simplicity, we'll just use basic extraction here

    const contacts = rows.map(row => {
      // Basic extraction - This would be replaced with smarter logic based on the AI analysis
      const phonePattern = /(?:\+\d{1,3})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/;
      const phoneMatch = row.match(phonePattern);
      const phone = phoneMatch ? phoneMatch[0].replace(/\D/g, '') : '';

      // After extracting phone, the rest is likely the name and tags
      let remainder = row;
      if (phoneMatch) {
        remainder = row.replace(phoneMatch[0], '').trim();
      }

      // Split by comma or semicolon if present
      const parts = remainder.split(/[,;]/);
      const name = parts[0]?.trim() || '';
      const tags = parts.slice(1).map(tag => tag.trim()).filter(Boolean);

      return {
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        name,
        tags
      };
    });

    return contacts.filter(contact => contact.phone);
  } catch (error) {
    logger.error('Error parsing contacts from bulk data:', error);
    throw error;
  }
};

export default {
  generateWarmingMessages,
  generateChatResponse,
  generateMessageVariations,
  parseContactsFromBulk
};

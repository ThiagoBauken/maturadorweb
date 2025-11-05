import axios from 'axios';
import { WhatsAppMessage } from '../pages/dashboard/BulkSender/hooks/types/messageTypes';

// API Types
export interface SessionResponse {
  id: string;
  name: string;
  phoneNumber: string;
  phone?: string; // Added for frontend compatibility
  status: string;
  instanceName: string;
  updatedAt: string;
  createdAt: string;
  qrCode?: string;
  qrCodeGeneratedAt?: string;
  lastActive?: string;
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  lastSeen?: string;
  retryCount?: number;
  sessionId?: string;
  metrics?: {
    verificationCount?: number;
    warmingCount?: number;
    bulkCount?: number;
    lastActivity?: string;
    [key: string]: unknown;
  };
  settings?: {
    verificationEnabled?: boolean;
    warmingEnabled?: boolean;
    bulkEnabled?: boolean;
    [key: string]: unknown;
  };
  device?: {
    battery?: number;
    plugged?: boolean;
    phoneModel?: string;
  };
}

export interface MessageOptions {
  delay?: number;
  presence?: 'composing' | 'recording' | 'paused';
}

export interface BulkCampaignData {
  name: string;
  description?: string;
  sessionId: string;
  recipients: Array<{
    phoneNumber: string;
    variables?: Record<string, string>;
  }>;
  message: string;
  media?: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
  };
  scheduling?: {
    startAt?: string;
    endAt?: string;
    activeDays?: number[];
  };
}

export interface VerificationCampaignData {
  name: string;
  description?: string;
  sessionId: string;
  phoneNumbers: string[];
  batchSize?: number;
}

export interface WarmerData {
  name: string;
  type: 'standard' | 'advanced' | 'group';
  sessionId: string;
  scheduling?: {
    activeDays: number[];
    timeRanges: Array<{
      start: string;
      end: string;
    }>;
  };
  messages: Array<{
    text: string;
    media?: {
      type: 'image' | 'video' | 'audio' | 'document';
      url: string;
    };
  }>;
  targets?: string[];
  settings?: {
    messageDelay?: {
      min: number;
      max: number;
    };
    restInterval?: {
      count: number;
      duration: number;
    };
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with configured defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Network Error - No response from server');
    }
    throw error;
  }
);

// WhatsApp API service
export const whatsAppApi = {
  // Get available WhatsApp sessions
  getSessions: async () => {
    try {
      const response = await apiClient.get('/sessions');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Get a specific session by ID
  getSession: async (sessionId: string) => {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  },

  // Create a new WhatsApp session
  connectSession: async (name: string): Promise<SessionResponse> => {
    try {
      const response = await apiClient.post('/sessions', { name });
      return response.data.data;
    } catch (error) {
      console.error('Error connecting session:', error);
      throw error;
    }
  },

  // Generate QR code for a session
  generateQRCode: async (sessionId: string): Promise<{ qrCode: string; expiresAt?: string }> => {
    try {
      const response = await apiClient.post(`/sessions/${sessionId}/qrcode`);
      return response.data.data;
    } catch (error) {
      console.error(`Error generating QR code for session ${sessionId}:`, error);
      throw error;
    }
  },

  // Connect a session using a QR code
  connectWithQR: async (sessionId: string): Promise<SessionResponse> => {
    try {
      const response = await apiClient.post(`/sessions/${sessionId}/connect`);
      return response.data.data;
    } catch (error) {
      console.error(`Error connecting session ${sessionId} with QR:`, error);
      throw error;
    }
  },

  // Disconnect a WhatsApp session
  disconnectSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error disconnecting session ${sessionId}:`, error);
      throw error;
    }
  },

  // Send a WhatsApp message
  sendMessage: async (sessionId: string, toNumber: string, message: string, options: MessageOptions = {}) => {
    try {
      const response = await apiClient.post(`/bulk/messages`, {
        sessionId,
        recipient: toNumber,
        message,
        options
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Check status of a sent message
  getMessageStatus: async (messageId: string): Promise<{ id: string; status: string; recipient: string; sentAt: string }> => {
    try {
      const response = await apiClient.get(`/bulk/messages/${messageId}/status`);
      return response.data.data;
    } catch (error) {
      console.error(`Error getting message status for ${messageId}:`, error);
      throw error;
    }
  },

  // Get message history for a contact
  getMessageHistory: async (sessionId: string, contactNumber: string, limit: number = 20): Promise<Array<WhatsAppMessage>> => {
    try {
      const response = await apiClient.get(`/bulk/history`, {
        params: { sessionId, contactNumber, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting message history:', error);
      throw error;
    }
  },

  // Create a new bulk campaign
  createCampaign: async (campaignData: BulkCampaignData) => {
    try {
      const response = await apiClient.post('/bulk/campaigns', campaignData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Get all campaigns
  getCampaigns: async () => {
    try {
      const response = await apiClient.get('/bulk/campaigns');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get campaign by id
  getCampaign: async (campaignId: string) => {
    try {
      const response = await apiClient.get(`/bulk/campaigns/${campaignId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching campaign ${campaignId}:`, error);
      throw error;
    }
  },

  // Update campaign status (start, pause, resume, stop)
  updateCampaignStatus: async (campaignId: string, status: string) => {
    try {
      const response = await apiClient.patch(`/bulk/campaigns/${campaignId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating campaign ${campaignId} status:`, error);
      throw error;
    }
  },

  // Get verification campaigns
  getVerificationCampaigns: async () => {
    try {
      const response = await apiClient.get('/verifier/campaigns');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching verification campaigns:', error);
      throw error;
    }
  },

  // Create a new verification campaign
  createVerificationCampaign: async (campaignData: VerificationCampaignData) => {
    try {
      const response = await apiClient.post('/verifier/campaigns', campaignData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating verification campaign:', error);
      throw error;
    }
  },

  // Get verification results
  getVerificationResults: async (campaignId: string) => {
    try {
      const response = await apiClient.get(`/verifier/campaigns/${campaignId}/results`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching verification results for campaign ${campaignId}:`, error);
      throw error;
    }
  },

  // Get warmers
  getWarmers: async () => {
    try {
      const response = await apiClient.get('/warmers');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching warmers:', error);
      throw error;
    }
  },

  // Create a new warmer
  createWarmer: async (warmerData: WarmerData) => {
    try {
      const response = await apiClient.post('/warmers', warmerData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating warmer:', error);
      throw error;
    }
  },

  // Update warmer status
  updateWarmerStatus: async (warmerId: string, status: string): Promise<{ id: string; status: string }> => {
    try {
      const response = await apiClient.patch(`/warmers/${warmerId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating warmer ${warmerId} status:`, error);
      throw error;
    }
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<Record<string, unknown>> => {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10): Promise<Array<{ id: string; type: string; timestamp: string; details: Record<string, unknown> }>> => {
    try {
      const response = await apiClient.get('/analytics/activity', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get session health metrics
  getSessionHealth: async (): Promise<Array<{ sessionId: string; healthScore: number; metrics: Record<string, unknown> }>> => {
    try {
      const response = await apiClient.get('/analytics/sessions/health');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching session health metrics:', error);
      throw error;
    }
  },

  // Upload media for sending
  uploadMedia: async (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post('/bulk/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
};

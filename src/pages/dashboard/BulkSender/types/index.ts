
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface SavedConfig {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
  messageTemplates: string[];
  sendingOptions?: {
    minInterval: number;
    maxInterval: number;
    useRandomInterval: boolean;
    numberRotation: boolean;
    rotationMode: 'switch' | 'all-together' | 'sequential';
    maxDailyMessages: number;
    warmerMode: boolean;
    scheduleEnabled: boolean;
    scheduleTime: string;
    scheduleDate: string;
    timeSlots: TimeSlot[];
    timezone: string;
  };
  minInterval?: number;
  maxInterval?: number;
  useRandomInterval?: boolean;
  numberRotation?: boolean;
  rotationMode?: 'switch' | 'all-together' | 'sequential';
  maxDailyMessages?: number;
  messageVariation?: boolean;
  typingDelay?: boolean;
  readReceipts?: boolean;
  emojiVariation?: boolean;
  responseSimulation?: boolean;
  messageVariationPercentage?: number;
  warmerMode?: boolean;
  scheduleEnabled?: boolean;
  scheduleTime?: string;
  scheduleDate?: string;
  timezone?: string;
}

export interface ContactStatus {
  phoneNumber: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
  read?: boolean;
  readAt?: string;
  responded?: boolean;
  respondedAt?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface MessageResponse {
  phoneNumber: string;
  message: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SendingHistory {
  id: string;
  projectName: string;
  messageTemplates: string[];
  startTime: string;
  endTime?: string;
  status: 'in-progress' | 'paused' | 'completed' | 'canceled' | 'scheduled';
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  selectedContacts: string[];
  contacts: ContactStatus[];
  config?: any;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaOnly?: boolean;
  scheduleDate?: string;
  scheduleTime?: string;
  messageResponses?: MessageResponse[];
  templateStats?: Record<string, {
    content: string;
    sent: number;
    delivered: number;
    read: number;
    responses: number;
  }>;
}

export interface MessageSentiment {
  positive: number;
  negative: number;
  neutral: number;
}

export interface MessageTemplateStats {
  id: string;
  content: string;
  sent: number;
  delivered: number;
  read: number;
  responses: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  responseCount: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  lastUsed: string;
}

export interface SendingConfig {
  messageTemplates: string[];
  minInterval: number;
  maxInterval: number;
  useRandomInterval: boolean;
  numberRotation: boolean;
  rotationMode: 'switch' | 'all-together' | 'sequential';
  maxDailyMessages: number;
  messageVariation: boolean;
  typingDelay: boolean;
  readReceipts: boolean;
  emojiVariation: boolean;
  responseSimulation: boolean;
  messageVariationPercentage: number;
  warmerMode: boolean;
  scheduleEnabled: boolean;
  scheduleTime: string;
  scheduleDate: string;
  timeSlots: TimeSlot[];
  timezone: string;
}

export interface MessageDraft {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messageTemplates: string[];
  messageVariation: boolean;
  messageVariationPercentage: number;
  scheduleEnabled: boolean;
  scheduleDate: string;
  scheduleTime: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaOnly?: boolean;
}

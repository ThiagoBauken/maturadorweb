
import { MessageActivity, MessageSentiment, SendingConfig } from './types/messageTypes';
import { TimeSlot } from '../types';

export interface Contact {
  phoneNumber: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
  read?: boolean;
  readAt?: string;
  responded?: boolean;
  respondedAt?: string;
  replied?: boolean; // Add replied property to ensure compatibility
  sentiment?: 'positive' | 'negative' | 'neutral';
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
  contacts: Contact[];
  config?: SendingConfig;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaOnly?: boolean;
  scheduleDate?: string;
  scheduleTime?: string;
  templateStats?: Record<string, {
    content: string;
    sent: number;
    delivered: number;
    read: number;
    responses: number;
  }>;
}

export interface BulkSenderContextType {
  activeTab: string;
  selectedContacts: string[];
  messageText: string;
  minInterval: number;
  maxInterval: number;
  useRandomInterval: boolean;
  numberRotation: boolean;
  rotationMode: 'switch' | 'all-together' | 'sequential';
  sendAllTogether: boolean;
  maxDailyMessages: number;
  messageTemplates: string[];
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
  saveConfigName: string;
  savedConfigs: any[];
  currentSendingId: string | null;
  sendingInProgress: boolean;
  sendingPaused: boolean;
  sentCount: number;
  failedCount: number;
  sendingHistory: SendingHistory[];
  isGeneratingMessages: boolean;
  aiVariationsCount: number;
  showAiDialog: boolean;
  templateStats: any[];
  recipientListText: string;
  projectName: string;
  savedMessageDrafts: any[];
  activeDraftId: string | null;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'none';
  mediaOnly: boolean;
  activeSessions: string[];
  messageActivities: MessageActivity[];
  isMonitoring: boolean;
  timezone: string;

  setActiveTab: (tab: string) => void;
  setSelectedContacts: (contacts: string[]) => void;
  setMessageText: (text: string) => void;
  setMinInterval: (interval: number) => void;
  setMaxInterval: (interval: number) => void;
  setUseRandomInterval: (use: boolean) => void;
  setNumberRotation: (use: boolean) => void;
  setRotationMode: (mode: 'switch' | 'all-together' | 'sequential') => void;
  setSendAllTogether: (use: boolean) => void;
  setMaxDailyMessages: (max: number) => void;
  setMessageTemplates: (templates: string[]) => void;
  setMessageVariation: (use: boolean) => void;
  setTypingDelay: (use: boolean) => void;
  setReadReceipts: (use: boolean) => void;
  setEmojiVariation: (use: boolean) => void;
  setResponseSimulation: (use: boolean) => void;
  setMessageVariationPercentage: (percentage: number) => void;
  setWarmerMode: (use: boolean) => void;
  setScheduleEnabled: (use: boolean) => void;
  setScheduleTime: (time: string) => void;
  setScheduleDate: (date: string) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  setSaveConfigName: (name: string) => void;
  setSavedConfigs: (configs: any[]) => void;
  setSendingInProgress: (inProgress: boolean) => void;
  setSendingPaused: (paused: boolean) => void;
  setSentCount: (count: number) => void;
  setFailedCount: (count: number) => void;
  setShowAiDialog: (show: boolean) => void;
  setAiVariationsCount: (count: number) => void;
  setCurrentSendingId: (id: string | null) => void;
  setRecipientListText: (text: string) => void;
  setProjectName: (name: string) => void;
  setMediaUrl: (url: string) => void;
  setMediaType: (type: 'image' | 'video' | 'none') => void;
  setMediaOnly: (mediaOnly: boolean) => void;
  setActiveSessions: (sessions: string[]) => void;
  setSendingHistory: (history: SendingHistory[] | ((prev: SendingHistory[]) => SendingHistory[])) => void;
  setTimezone: (timezone: string) => void;

  removeDuplicates: (contacts: string[]) => void;
  formatPhoneNumber: (phoneNumber: string) => string;
  processRecipientList: () => string[];
  handleSendMessage: () => void;
  handlePauseSending: () => void;
  handleResumeSending: () => void;
  handleCancelSending: () => void;
  handleImportFromVerifier: () => string[];
  handleSaveConfig: () => void;
  handleLoadConfig: () => void;
  addMessageTemplate: () => void;
  updateMessageTemplate: (index: number, text: string) => void;
  removeMessageTemplate: (index: number) => void;
  createWarmer: () => void;
  // Update the signature to not accept any parameters
  generateAiMessageVariations: () => void;
  updateMessageReadStatus: (historyId: string, phoneNumber: string, read: boolean) => void;
  updateMessageResponseStatus: (historyId: string, phoneNumber: string, responded: boolean, sentiment?: 'positive' | 'negative' | 'neutral') => void;
  getTopPerformingTemplates: (limit?: number) => any[];
  addContactsFromFile: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  handleFileUpload: (file: File) => void;
  saveMessageDraft: () => boolean;
  // Update these functions to not accept parameters
  loadMessageDraft: () => void;
  deleteMessageDraft: () => void;
  updateSendingHistory: (id: string, updates: Partial<SendingHistory>) => void;
  updateContactStatus: (historyId: string, phoneNumber: string, updates: Partial<Contact>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearSessionActivity: (sessionId: string) => void;
  clearAllActivities: () => void;
  setPollingFrequency: (milliseconds: number) => void;
}

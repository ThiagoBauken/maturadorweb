
import { ReactNode } from 'react';
// Import TimeSlot and SavedConfig from the types folder
import { TimeSlot, SavedConfig, SendingHistory, ContactStatus } from '../../types';

export interface MessageTemplate {
  id: string;
  content: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface MessageActivity {
  phoneNumber: string;
  contactName?: string;
  sessionId: string;
  messages: Message[];
  lastActivity: string;
}

export interface BulkSenderContextType {
  // State
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
  savedConfigs: SavedConfig[];
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

  // State setters
  setActiveTab: (tab: string) => void;
  setSelectedContacts: (contacts: string[]) => void;
  setMessageText: (text: string) => void;
  setMinInterval: (interval: number) => void;
  setMaxInterval: (interval: number) => void;
  setUseRandomInterval: (use: boolean) => void;
  setNumberRotation: (rotation: boolean) => void;
  setRotationMode: (mode: 'switch' | 'all-together' | 'sequential') => void;
  setSendAllTogether: (allTogether: boolean) => void;
  setMaxDailyMessages: (max: number) => void;
  setMessageTemplates: (templates: string[]) => void;
  setMessageVariation: (variation: boolean) => void;
  setTypingDelay: (delay: boolean) => void;
  setReadReceipts: (receipts: boolean) => void;
  setEmojiVariation: (variation: boolean) => void;
  setResponseSimulation: (simulation: boolean) => void;
  setMessageVariationPercentage: (percentage: number) => void;
  setWarmerMode: (mode: boolean) => void;
  setScheduleEnabled: (enabled: boolean) => void;
  setScheduleTime: (time: string) => void;
  setScheduleDate: (date: string) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  setSaveConfigName: (name: string) => void;
  setSavedConfigs: (configs: SavedConfig[]) => void;
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
  setSendingHistory: (history: SendingHistory[]) => void;
  setTimezone: (timezone: string) => void;

  // Actions
  removeDuplicates: () => void;
  formatPhoneNumber: () => void;
  processRecipientList: () => { name: string, phoneNumber: string, hasWhatsApp: boolean }[];
  handleSendMessage: () => void;
  handlePauseSending: () => void;
  handleResumeSending: () => void;
  handleCancelSending: () => void;
  handleImportFromVerifier: () => string[];
  handleSaveConfig: () => void;
  handleLoadConfig: (configId: string) => void;
  addMessageTemplate: () => void;
  updateMessageTemplate: (index: number, value: string) => void;
  removeMessageTemplate: (index: number) => void;
  createWarmer: () => void;
  generateAiMessageVariations: () => Promise<void>;
  updateMessageReadStatus: (sendingId: string, phoneNumber: string, read: boolean) => void;
  updateMessageResponseStatus: (sendingId: string, phoneNumber: string, responded: boolean) => void;
  getTopPerformingTemplates: () => { template: string, successRate: number, responseRate: number }[];
  addContactsFromFile: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  handleFileUpload: (file: File) => Promise<void>;
  saveMessageDraft: () => boolean;
  loadMessageDraft: (draftId: string) => void;
  deleteMessageDraft: (draftId: string) => void;
  updateSendingHistory: (id: string, updates: Partial<SendingHistory>) => void;
  updateContactStatus: (sendingId: string, phoneNumber: string, updates: Partial<ContactStatus>) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearSessionActivity: (sessionId: string) => void;
  clearAllActivities: () => void;
  setPollingFrequency: (frequency: number) => void;
}

export interface BulkSenderProviderProps {
  children: ReactNode;
}

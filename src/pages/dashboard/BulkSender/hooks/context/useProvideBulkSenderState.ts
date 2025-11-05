
import { useState } from 'react';
import { BulkSenderContextType, SendingHistory } from '../types';
import { useMessageTemplates } from '../useMessageTemplates';
import { useSendingOptions } from '../useSendingOptions';
import { useSendingHistory } from '../useSendingHistory';
import { useSendingProcess } from '../useSendingProcess';
import { useRecipientList } from '../recipient';
import { MouseEvent } from 'react';
import { ContactStatus } from '../../types'; // Import Contact from types

export function useProvideBulkSenderState(): BulkSenderContextType {
  const [activeTab, setActiveTab] = useState('message');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [mediaOnly, setMediaOnly] = useState<boolean>(false);
  
  const messageTemplatesHook = useMessageTemplates();
  const sendingOptionsHook = useSendingOptions();
  const sendingHistoryHook = useSendingHistory();
  const recipientListHook = useRecipientList(setSelectedContacts);
  
  // Create a wrapper function to convert types
  const setSendingHistoryWrapper = (callback: (prev: SendingHistory[]) => SendingHistory[]) => {
    sendingHistoryHook.setSendingHistory((prev: any) => callback(prev));
  };
  
  // Modified to fix the callback type issue
  const sendingProcessHook = useSendingProcess(
    setSendingHistoryWrapper,
    sendingHistoryHook.updateSendingHistory,
    sendingHistoryHook.sendingPaused,
    sendingHistoryHook.setSentCount,
    sendingHistoryHook.setFailedCount,
    sendingOptionsHook.numberRotation,
    sendingOptionsHook.useRandomInterval,
    sendingOptionsHook.minInterval,
    sendingOptionsHook.maxInterval,
    messageTemplatesHook.messageVariation,
    messageTemplatesHook.messageTemplates
  );

  const updateContactStatusWrapper = (sendingId: string, phoneNumber: string, updates: Partial<ContactStatus>) => {
    sendingHistoryHook.updateContactStatus(sendingId, phoneNumber, updates);
  };

  const saveMessageDraftWrapper = (): boolean => {
    return true;
  };

  // Update function wrappers to match the expected type signatures
  const value: BulkSenderContextType = {
    activeTab,
    selectedContacts,
    messageText: messageTemplatesHook.messageText,
    minInterval: sendingOptionsHook.minInterval,
    maxInterval: sendingOptionsHook.maxInterval,
    useRandomInterval: sendingOptionsHook.useRandomInterval,
    numberRotation: sendingOptionsHook.numberRotation,
    rotationMode: sendingOptionsHook.rotationMode,
    sendAllTogether: sendingOptionsHook.sendAllTogether,
    maxDailyMessages: sendingOptionsHook.maxDailyMessages,
    messageTemplates: messageTemplatesHook.messageTemplates,
    messageVariation: messageTemplatesHook.messageVariation,
    typingDelay: messageTemplatesHook.typingDelay,
    readReceipts: messageTemplatesHook.readReceipts,
    emojiVariation: messageTemplatesHook.emojiVariation,
    responseSimulation: messageTemplatesHook.responseSimulation,
    messageVariationPercentage: messageTemplatesHook.messageVariationPercentage,
    warmerMode: sendingOptionsHook.warmerMode,
    scheduleEnabled: sendingOptionsHook.scheduleEnabled,
    scheduleTime: sendingOptionsHook.scheduleTime,
    scheduleDate: sendingOptionsHook.scheduleDate,
    timeSlots: [],
    saveConfigName: '',
    savedConfigs: [],
    currentSendingId: sendingHistoryHook.currentSendingId,
    sendingInProgress: sendingHistoryHook.sendingInProgress,
    sendingPaused: sendingHistoryHook.sendingPaused,
    sentCount: sendingHistoryHook.sentCount,
    failedCount: sendingHistoryHook.failedCount,
    sendingHistory: sendingHistoryHook.sendingHistory,
    isGeneratingMessages: messageTemplatesHook.isGeneratingMessages,
    aiVariationsCount: messageTemplatesHook.aiVariationsCount,
    showAiDialog: messageTemplatesHook.showAiDialog,
    templateStats: [],
    recipientListText: recipientListHook.recipientListText,
    projectName,
    savedMessageDrafts: [],
    activeDraftId: null,
    mediaUrl,
    mediaType,
    mediaOnly,
    activeSessions: sendingOptionsHook.activeSessions,
    messageActivities: [],
    isMonitoring: false,
    timezone: sendingOptionsHook.timezone,

    setActiveTab,
    setSelectedContacts,
    setMessageText: messageTemplatesHook.setMessageText,
    setMinInterval: sendingOptionsHook.setMinInterval,
    setMaxInterval: sendingOptionsHook.setMaxInterval,
    setUseRandomInterval: sendingOptionsHook.setUseRandomInterval,
    setNumberRotation: sendingOptionsHook.setNumberRotation,
    setRotationMode: sendingOptionsHook.setRotationMode,
    setSendAllTogether: sendingOptionsHook.setSendAllTogether,
    setMaxDailyMessages: sendingOptionsHook.setMaxDailyMessages,
    setMessageTemplates: messageTemplatesHook.setMessageTemplates,
    setMessageVariation: messageTemplatesHook.setMessageVariation,
    setTypingDelay: messageTemplatesHook.setTypingDelay,
    setReadReceipts: messageTemplatesHook.setReadReceipts,
    setEmojiVariation: messageTemplatesHook.setEmojiVariation,
    setResponseSimulation: messageTemplatesHook.setResponseSimulation,
    setMessageVariationPercentage: messageTemplatesHook.setMessageVariationPercentage,
    setWarmerMode: sendingOptionsHook.setWarmerMode,
    setScheduleEnabled: sendingOptionsHook.setScheduleEnabled,
    setScheduleTime: sendingOptionsHook.setScheduleTime,
    setScheduleDate: sendingOptionsHook.setScheduleDate,
    setTimeSlots: () => {},
    setSaveConfigName: () => {},
    setSavedConfigs: () => {},
    setSendingInProgress: sendingHistoryHook.setSendingInProgress,
    setSendingPaused: sendingHistoryHook.setSendingPaused,
    setSentCount: sendingHistoryHook.setSentCount,
    setFailedCount: sendingHistoryHook.setFailedCount,
    setShowAiDialog: messageTemplatesHook.setShowAiDialog,
    setAiVariationsCount: messageTemplatesHook.setAiVariationsCount,
    setCurrentSendingId: sendingHistoryHook.setCurrentSendingId,
    setRecipientListText: recipientListHook.setRecipientListText,
    setProjectName,
    setMediaUrl,
    setMediaType,
    setMediaOnly,
    setActiveSessions: sendingOptionsHook.setActiveSessions,
    setSendingHistory: sendingHistoryHook.setSendingHistory,
    setTimezone: sendingOptionsHook.setTimezone,
    
    removeDuplicates: recipientListHook.removeDuplicates,
    formatPhoneNumber: recipientListHook.formatPhoneNumber,
    processRecipientList: recipientListHook.processRecipientList,
    handleSendMessage: () => {},
    handlePauseSending: () => {},
    handleResumeSending: () => {},
    handleCancelSending: () => {},
    handleImportFromVerifier: () => [],
    handleSaveConfig: () => {},
    handleLoadConfig: () => {},
    addMessageTemplate: messageTemplatesHook.addMessageTemplate,
    updateMessageTemplate: messageTemplatesHook.updateMessageTemplate,
    removeMessageTemplate: messageTemplatesHook.removeMessageTemplate,
    createWarmer: () => {},
    generateAiMessageVariations: messageTemplatesHook.generateAiMessageVariations,
    updateMessageReadStatus: sendingHistoryHook.updateMessageReadStatus,
    updateMessageResponseStatus: sendingHistoryHook.updateMessageResponseStatus,
    getTopPerformingTemplates: () => [],
    addContactsFromFile: (e?: MouseEvent<HTMLButtonElement>) => recipientListHook.addContactsFromFile(e),
    handleFileUpload: (file: File) => recipientListHook.handleFileUpload(file),
    saveMessageDraft: saveMessageDraftWrapper,
    loadMessageDraft: () => {},
    deleteMessageDraft: () => {},
    updateSendingHistory: sendingHistoryHook.updateSendingHistory,
    updateContactStatus: updateContactStatusWrapper,
    startMonitoring: () => {},
    stopMonitoring: () => {},
    clearSessionActivity: () => {},
    clearAllActivities: () => {},
    setPollingFrequency: () => {}
  };

  return value;
}

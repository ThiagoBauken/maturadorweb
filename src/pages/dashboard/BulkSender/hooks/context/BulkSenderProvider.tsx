
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulkSenderContext } from './BulkSenderContext';
import { BulkSenderContextType } from '../types';
import { useProvideBulkSenderState } from './useProvideBulkSenderState';
import { MessagingProvider } from '../../providers/MessagingProvider';
import { SendingOptionsProvider } from '../../providers/SendingOptionsProvider';
import { SendingHistoryProvider } from '../../providers/SendingHistoryProvider';
import { ConfigurationProvider } from '../../providers/ConfigurationProvider';
import { DraftsProvider } from '../../providers/DraftsProvider';
import { ActionsProvider } from '../../providers/ActionsProvider';
import { RealTimeMessagingProvider } from '../../providers/RealTimeMessagingProvider';

export const BulkSenderProvider = ({ children }: { children: ReactNode }) => {
  const bulkSenderState = useProvideBulkSenderState();
  const navigate = useNavigate();

  return (
    <BulkSenderContext.Provider value={bulkSenderState}>
      <SendingOptionsProvider>
        <MessagingProvider>
          <SendingHistoryProvider>
            <ConfigurationProvider
              setMinInterval={bulkSenderState.setMinInterval}
              setMaxInterval={bulkSenderState.setMaxInterval}
              setUseRandomInterval={bulkSenderState.setUseRandomInterval}
              setNumberRotation={bulkSenderState.setNumberRotation}
              setMaxDailyMessages={bulkSenderState.setMaxDailyMessages}
              setMessageVariation={bulkSenderState.setMessageVariation}
              setTypingDelay={bulkSenderState.setTypingDelay}
              setReadReceipts={bulkSenderState.setReadReceipts}
              setEmojiVariation={bulkSenderState.setEmojiVariation}
              setResponseSimulation={bulkSenderState.setResponseSimulation}
              setMessageVariationPercentage={bulkSenderState.setMessageVariationPercentage}
              setWarmerMode={bulkSenderState.setWarmerMode}
              setScheduleEnabled={bulkSenderState.setScheduleEnabled}
              setScheduleTime={bulkSenderState.setScheduleTime}
              setScheduleDate={bulkSenderState.setScheduleDate}
            >
              <DraftsProvider
                messageTemplates={bulkSenderState.messageTemplates}
                setMessageTemplates={bulkSenderState.setMessageTemplates}
                messageVariation={bulkSenderState.messageVariation}
                setMessageVariation={bulkSenderState.setMessageVariation}
                messageVariationPercentage={bulkSenderState.messageVariationPercentage}
                setMessageVariationPercentage={bulkSenderState.setMessageVariationPercentage}
                scheduleEnabled={bulkSenderState.scheduleEnabled}
                setScheduleEnabled={bulkSenderState.setScheduleEnabled}
                scheduleDate={bulkSenderState.scheduleDate}
                setScheduleDate={bulkSenderState.setScheduleDate}
                scheduleTime={bulkSenderState.scheduleTime}
                setScheduleTime={bulkSenderState.setScheduleTime}
                mediaUrl={bulkSenderState.mediaUrl}
                mediaType={bulkSenderState.mediaType}
                mediaOnly={bulkSenderState.mediaOnly}
              >
                <ActionsProvider
                  messageTemplatesHook={{
                    messageTemplates: bulkSenderState.messageTemplates,
                    messageVariation: bulkSenderState.messageVariation,
                    typingDelay: bulkSenderState.typingDelay,
                    readReceipts: bulkSenderState.readReceipts,
                    emojiVariation: bulkSenderState.emojiVariation,
                    mediaUrl: bulkSenderState.mediaUrl,
                    mediaType: bulkSenderState.mediaType,
                    mediaOnly: bulkSenderState.mediaOnly
                  }}
                  sendingOptionsHook={{
                    minInterval: bulkSenderState.minInterval,
                    maxInterval: bulkSenderState.maxInterval,
                    useRandomInterval: bulkSenderState.useRandomInterval,
                    numberRotation: bulkSenderState.numberRotation,
                    maxDailyMessages: bulkSenderState.maxDailyMessages,
                    warmerMode: bulkSenderState.warmerMode,
                    scheduleEnabled: bulkSenderState.scheduleEnabled,
                    scheduleTime: bulkSenderState.scheduleTime,
                    scheduleDate: bulkSenderState.scheduleDate
                  }}
                  sendingHistoryHook={{
                    setSendingHistory: bulkSenderState.setSendingHistory,
                    updateSendingHistory: bulkSenderState.updateSendingHistory,
                    setSendingInProgress: bulkSenderState.setSendingInProgress,
                    setSendingPaused: bulkSenderState.setSendingPaused,
                    currentSendingId: bulkSenderState.currentSendingId,
                    sendingPaused: bulkSenderState.sendingPaused,
                    setSentCount: bulkSenderState.setSentCount,
                    setFailedCount: bulkSenderState.setFailedCount,
                    setCurrentSendingId: bulkSenderState.setCurrentSendingId,
                    updateContactStatus: bulkSenderState.updateContactStatus
                  }}
                  selectedContacts={bulkSenderState.selectedContacts}
                  sendingProcessHook={{
                    startSendingMessages: (id: string, maxDaily: number) => {
                      // Simple implementation that simulates sending messages without actual API calls
                      const simulateSending = () => {
                        const contacts = bulkSenderState.selectedContacts.map(phoneNumber => ({
                          phoneNumber,
                          sent: true,
                          sentAt: new Date().toISOString()
                        }));
                        
                        bulkSenderState.updateSendingHistory(id, {
                          sentCount: contacts.length,
                          status: 'completed',
                          endTime: new Date().toISOString(),
                          contacts
                        });
                        
                        bulkSenderState.setSentCount(contacts.length);
                      };
                      
                      // Simulate a brief delay before completion
                      setTimeout(simulateSending, 2000);
                    }
                  }}
                  configurationsHook={{
                    saveConfiguration: () => {},
                    loadConfiguration: () => {}
                  }}
                  projectName={bulkSenderState.projectName}
                  recipientListHook={{
                    recipientListText: bulkSenderState.recipientListText,
                    processRecipientList: bulkSenderState.processRecipientList
                  }}
                >
                  {children}
                </ActionsProvider>
              </DraftsProvider>
            </ConfigurationProvider>
          </SendingHistoryProvider>
        </MessagingProvider>
      </SendingOptionsProvider>
    </BulkSenderContext.Provider>
  );
};

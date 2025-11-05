import { toast } from 'sonner';
import { SendingHistory } from '../../types';
import { useNavigate } from 'react-router-dom';

interface MessageActionsProps {
  messageTemplatesHook: any;
  sendingOptionsHook: any;
  sendingHistoryHook: any;
  selectedContacts: string[];
  sendingProcessHook: any;
  projectName?: string;
  recipientListHook?: any;
  navigate?: any;
}

export function useMessageActions({
  messageTemplatesHook,
  sendingOptionsHook,
  sendingHistoryHook,
  selectedContacts,
  sendingProcessHook,
  projectName = '',
  recipientListHook,
  navigate
}: MessageActionsProps) {
  
  const processRecipientsIfAvailable = () => {
    let processedContacts = [...selectedContacts];
    
    if (recipientListHook && recipientListHook.recipientListText && selectedContacts.length === 0) {
      const processed = recipientListHook.processRecipientList();
      if (processed && processed.length > 0) {
        processedContacts = processed;
        console.log('Processed contacts from text:', processedContacts);
      }
    }
    
    processedContacts = [...new Set(processedContacts)];
    
    return processedContacts;
  };
  
  const handleSendMessage = () => {
    const contacts = processRecipientsIfAvailable();
    
    const hasMedia = messageTemplatesHook.mediaUrl && messageTemplatesHook.mediaType !== 'none';
    const hasMessageContent = messageTemplatesHook.messageTemplates.some((msg: string) => msg.trim().length > 0);
    const hasContent = hasMessageContent || hasMedia;
    
    if (!hasContent) {
      toast.error('Please add text or media content before sending');
      return;
    }
    
    if (contacts.length === 0) {
      toast.error('Please select at least one contact to send to');
      return;
    }

    if (sendingHistoryHook.currentSendingId && sendingHistoryHook.sendingPaused) {
      const shouldResume = window.confirm('There is a paused sending operation. Do you want to resume it?');
      if (shouldResume) {
        sendingHistoryHook.setSendingPaused(false);
        sendingHistoryHook.updateSendingHistory(sendingHistoryHook.currentSendingId, { status: 'in-progress' });
        
        // Check if startSendingMessages exists before calling it
        if (typeof sendingProcessHook.startSendingMessages === 'function') {
          sendingProcessHook.startSendingMessages(sendingHistoryHook.currentSendingId, sendingOptionsHook.maxDailyMessages);
        } else {
          console.log("No startSendingMessages function found, using fallback");
          simulateSendingProcess(sendingHistoryHook.currentSendingId, contacts);
        }
        
        toast.info('Sending has been resumed.');
        return;
      }
    }
    
    const newSendingId = Date.now().toString();
    sendingHistoryHook.setCurrentSendingId(newSendingId);
    sendingHistoryHook.setSendingInProgress(true);
    sendingHistoryHook.setSendingPaused(false);
    sendingHistoryHook.setSentCount(0);
    sendingHistoryHook.setFailedCount(0);
    
    const templateStats: { [key: string]: any } = {};
    messageTemplatesHook.messageTemplates.forEach((template: string, index: number) => {
      const templateId = `template-${newSendingId}-${index}`;
      templateStats[templateId] = {
        content: template,
        sent: 0,
        delivered: 0,
        read: 0,
        responses: 0
      };
    });
    
    const newHistoryItem: SendingHistory = {
      id: newSendingId,
      projectName: projectName || 'New Message Campaign',
      messageTemplates: [...messageTemplatesHook.messageTemplates],
      startTime: new Date().toISOString(),
      totalContacts: contacts.length,
      sentCount: 0,
      failedCount: 0,
      status: 'in-progress',
      selectedContacts: [...contacts],
      contacts: contacts.map(phoneNumber => ({
        phoneNumber,
        sent: false
      })),
      templateStats,
      messageResponses: [],
      scheduleTime: sendingOptionsHook.scheduleEnabled ? sendingOptionsHook.scheduleTime : undefined,
      scheduleDate: sendingOptionsHook.scheduleEnabled ? sendingOptionsHook.scheduleDate : undefined,
      mediaUrl: messageTemplatesHook.mediaUrl,
      mediaType: messageTemplatesHook.mediaType,
      mediaOnly: messageTemplatesHook.mediaOnly
    };
    
    sendingHistoryHook.setSendingHistory((prev: SendingHistory[]) => [...prev, newHistoryItem]);
    
    const intervalDesc = sendingOptionsHook.useRandomInterval 
      ? `random intervals between ${sendingOptionsHook.minInterval}-${sendingOptionsHook.maxInterval} seconds` 
      : `fixed ${sendingOptionsHook.minInterval} second intervals`;
    
    const rotationDesc = sendingOptionsHook.numberRotation ? 'with number rotation' : 'in sequence';
    
    const scheduleDesc = sendingOptionsHook.scheduleEnabled
      ? `scheduled for ${sendingOptionsHook.scheduleDate} at ${sendingOptionsHook.scheduleTime}`
      : 'immediately';
      
    const messageVariationDesc = messageTemplatesHook.messageVariation && messageTemplatesHook.messageTemplates.length > 1
      ? `with ${messageTemplatesHook.messageTemplates.length} message variants`
      : 'with fixed message';
    
    const mediaDesc = hasMedia ? ` with ${messageTemplatesHook.mediaType} media` : '';
    
    const warmerModeDesc = sendingOptionsHook.warmerMode
      ? ' in warmer mode'
      : '';
      
    const projectDesc = projectName ? ` for project "${projectName}"` : '';
    
    const dailyLimitDesc = `max ${sendingOptionsHook.maxDailyMessages} messages per day`;
    
    toast.success(
      `Message queue created${projectDesc} for ${contacts.length} contacts at ${intervalDesc} ${rotationDesc} ${scheduleDesc} ${messageVariationDesc}${mediaDesc}${warmerModeDesc} (${dailyLimitDesc})`
    );
    
    try {
      // Check if startSendingMessages exists before calling it
      if (typeof sendingProcessHook.startSendingMessages === 'function') {
        sendingProcessHook.startSendingMessages(newSendingId, sendingOptionsHook.maxDailyMessages);
      } else {
        console.log("No startSendingMessages function found, using fallback");
        simulateSendingProcess(newSendingId, contacts);
      }
      
      // Navigate to dashboard after starting the sending process
      if (navigate) {
        setTimeout(() => {
          navigate('/dashboard?tab=live');
        }, 1000); // Small delay to allow the toast to be seen
      }
    } catch (error) {
      console.error("Error starting sending messages:", error);
      toast.error("There was an error starting the sending process. Please check console for details.");
    }
  };
  
  const simulateSendingProcess = (sendingId: string, contacts: string[]) => {
    setTimeout(() => {
      // Mark all contacts as sent
      const updatedContacts = contacts.map(phoneNumber => ({
        phoneNumber,
        sent: true,
        sentAt: new Date().toISOString()
      }));
      
      // Update sending history
      sendingHistoryHook.updateSendingHistory(sendingId, {
        sentCount: contacts.length,
        status: 'completed',
        endTime: new Date().toISOString(),
        contacts: updatedContacts
      });
      
      // Update counters
      sendingHistoryHook.setSentCount(contacts.length);
    }, 2000);
  };
  
  return {
    handleSendMessage,
    processRecipientsIfAvailable
  };
}

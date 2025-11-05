
import { useCallback } from 'react';
import { SendingHistory } from '../types';

export const useSendingProcess = (
  setSendingHistory: (
    callback: (prev: SendingHistory[]) => SendingHistory[]
  ) => void,
  updateSendingHistory: (id: string, updates: Partial<SendingHistory>) => void,
  sendingPaused: boolean,
  setSentCount: (count: number) => void,
  setFailedCount: (count: number) => void,
  numberRotation: boolean,
  useRandomInterval: boolean,
  minInterval: number,
  maxInterval: number,
  messageVariation: boolean,
  messageTemplates: string[]
) => {
  // Keep the current process IDs in memory to allow cancellation
  let processingTimeouts: { [key: string]: NodeJS.Timeout } = {};
  
  // Clean up function to clear any pending timeouts for a specific sending operation
  const cleanupTimeouts = useCallback((sendingId: string) => {
    if (processingTimeouts[sendingId]) {
      clearTimeout(processingTimeouts[sendingId]);
      delete processingTimeouts[sendingId];
    }
  }, [processingTimeouts]);
  
  // Function to check if current time is within allowed sending hours
  const isWithinSendingHours = useCallback((scheduleTime?: string) => {
    if (!scheduleTime) return true; // No time restrictions
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    // Schedule time format: "HH:MM-HH:MM,HH:MM-HH:MM"
    const timeRanges = scheduleTime.split(',');
    
    // Check if current time is within any of the allowed time ranges
    return timeRanges.some(timeRange => {
      const [start, end] = timeRange.split('-');
      
      if (!start || !end) return true; // Invalid format, allow sending
      
      const [startHour, startMinute] = start.split(':').map(n => parseInt(n));
      const [endHour, endMinute] = end.split(':').map(n => parseInt(n));
      
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      
      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
    });
  }, []);
  
  // Check if we've reached the daily message limit
  const isDailyLimitReached = useCallback((historyItem: SendingHistory, maxDailyMessages: number) => {
    if (!maxDailyMessages) return false;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Count messages sent today for this sending task
    const sentToday = historyItem.contacts.filter(contact => {
      if (!contact.sentAt) return false;
      const sentDate = contact.sentAt.split('T')[0];
      return sentDate === today && contact.sent;
    }).length;
    
    return sentToday >= maxDailyMessages;
  }, []);
  
  // Select a message template based on the configuration
  const selectMessageTemplate = useCallback(() => {
    if (!messageVariation || messageTemplates.length <= 1) {
      return messageTemplates[0] || '';
    }
    
    // Randomly select a template
    const randomIndex = Math.floor(Math.random() * messageTemplates.length);
    return messageTemplates[randomIndex] || '';
  }, [messageVariation, messageTemplates]);
  
  // Handle errors during sending
  const handleSendError = useCallback((
    sendingId: string, 
    phoneNumber: string, 
    error: Error
  ) => {
    setSendingHistory((prev) => {
      return prev.map((item) => {
        if (item.id !== sendingId) return item;
        
        return {
          ...item,
          failedCount: item.failedCount + 1,
          contacts: item.contacts.map((contact) => {
            if (contact.phoneNumber !== phoneNumber) return contact;
            
            return {
              ...contact,
              sent: false,
              error: error.message
            };
          })
        };
      });
    });
    
    // Use the current failed count from the history item instead of using a function update
    setSendingHistory((prev) => {
      const historyItem = prev.find(item => item.id === sendingId);
      if (historyItem) {
        setFailedCount(historyItem.failedCount + 1);
      }
      return prev;
    });
    
    console.error(`Failed to send message to ${phoneNumber}:`, error);
  }, [setSendingHistory, setFailedCount]);
  
  // The main function to start sending messages
  const startSendingMessages = useCallback((sendingId: string, maxDailyMessages: number = 100) => {
    setSendingHistory((prev) => {
      const historyItem = prev.find(item => item.id === sendingId);
      if (!historyItem) return prev;
      
      // Check if current time is within sending hours
      if (historyItem.scheduleTime && !isWithinSendingHours(historyItem.scheduleTime)) {
        console.log('Outside of scheduled sending hours, waiting for next scheduled time...');
        
        // Schedule a check in 5 minutes to see if it's time to start sending again
        processingTimeouts[sendingId] = setTimeout(() => {
          startSendingMessages(sendingId, maxDailyMessages);
        }, 5 * 60 * 1000); // 5 minutes
        
        return prev;
      }
      
      // Check if we've reached the daily message limit
      if (isDailyLimitReached(historyItem, maxDailyMessages)) {
        console.log(`Daily message limit of ${maxDailyMessages} reached. Pausing until tomorrow.`);
        
        // Schedule a check at midnight to resume sending
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 5, 0, 0); // 12:05 AM
        
        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        processingTimeouts[sendingId] = setTimeout(() => {
          startSendingMessages(sendingId, maxDailyMessages);
        }, timeUntilTomorrow);
        
        return prev;
      }
      
      // Find the pending contacts (those that haven't been sent yet)
      const pendingContacts = historyItem.contacts
        .filter(contact => !contact.sent)
        .map(contact => contact.phoneNumber);
      
      if (pendingContacts.length === 0) {
        // All messages have been sent
        return prev.map(item => {
          if (item.id !== sendingId) return item;
          
          return {
            ...item,
            status: 'completed',
            endTime: new Date().toISOString()
          };
        });
      }
      
      // Process the first pending contact or a random one based on numberRotation setting
      const nextContact = numberRotation
        ? pendingContacts[Math.floor(Math.random() * pendingContacts.length)]
        : pendingContacts[0];
      
      const messageTemplate = selectMessageTemplate();
      
      // Simulate sending the message (in a real app, this would make an API call)
      console.log(`Sending message to ${nextContact}: ${messageTemplate}`);
      
      // Update the contact state to mark it as sent
      return prev.map(item => {
        if (item.id !== sendingId) return item;
        
        const updatedItem = {
          ...item,
          sentCount: item.sentCount + 1,
          contacts: item.contacts.map(contact => {
            if (contact.phoneNumber !== nextContact) return contact;
            
            return {
              ...contact,
              sent: true,
              sentAt: new Date().toISOString(),
              messageTemplate
            };
          })
        };
        
        // Update the sent count with the new value
        setSentCount(updatedItem.sentCount);
        
        return updatedItem;
      });
    });
    
    // Simulate a delay before processing the next item
    const delayMs = useRandomInterval
      ? Math.floor(Math.random() * (maxInterval - minInterval + 1) + minInterval) * 1000
      : minInterval * 1000;
    
    // Schedule the next message if not paused
    if (!sendingPaused) {
      processingTimeouts[sendingId] = setTimeout(() => {
        startSendingMessages(sendingId, maxDailyMessages);
      }, delayMs);
    }
  }, [
    setSendingHistory,
    setSentCount,
    sendingPaused,
    numberRotation,
    useRandomInterval,
    minInterval,
    maxInterval,
    selectMessageTemplate,
    processingTimeouts,
    isWithinSendingHours,
    isDailyLimitReached
  ]);
  
  return {
    startSendingMessages,
    cleanupTimeouts,
    handleSendError,
    isWithinSendingHours
  };
};

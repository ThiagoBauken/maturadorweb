
import { useState, useCallback } from 'react';
import { SendingHistory, Contact } from './types';

export const useSendingHistory = () => {
  const [sendingHistory, setSendingHistory] = useState<SendingHistory[]>([]);
  const [currentSendingId, setCurrentSendingId] = useState<string | null>(null);
  const [sendingInProgress, setSendingInProgress] = useState(false);
  const [sendingPaused, setSendingPaused] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [activeSessions, setActiveSessions] = useState<string[]>([]);

  const updateSendingHistory = useCallback((id: string, updates: Partial<SendingHistory>) => {
    setSendingHistory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  }, []);

  const updateContactStatus = useCallback((historyId: string, phoneNumber: string, updates: Partial<Contact>) => {
    setSendingHistory(prev => prev.map(item => {
      if (item.id === historyId) {
        const updatedContacts = item.contacts.map(contactItem => {
          if (contactItem.phoneNumber === phoneNumber) {
            return {
              ...contactItem,
              ...updates,
              sentAt: updates.sent ? new Date().toISOString() : contactItem.sentAt
            };
          }
          return contactItem;
        });

        // Update counts based on changes
        let newSentCount = item.sentCount;
        let newFailedCount = item.failedCount;
        
        // Find the specific contact being updated
        const contactBeingUpdated = item.contacts.find(c => c.phoneNumber === phoneNumber);
        
        // Update sent count if the sent status changed
        if (updates.sent !== undefined && contactBeingUpdated && !contactBeingUpdated.sent && updates.sent) {
          newSentCount++;
        }
        
        // Update failed count if error was added
        if (updates.error && contactBeingUpdated && !contactBeingUpdated.error) {
          newFailedCount++;
        }

        return {
          ...item,
          contacts: updatedContacts,
          sentCount: newSentCount,
          failedCount: newFailedCount
        };
      }
      return item;
    }));
  }, []);

  const updateMessageReadStatus = useCallback((historyId: string, phoneNumber: string, read: boolean) => {
    setSendingHistory(prev => prev.map(item => {
      if (item.id === historyId) {
        const updatedContacts = item.contacts.map(contact => {
          if (contact.phoneNumber === phoneNumber) {
            return {
              ...contact,
              read,
              readAt: read ? new Date().toISOString() : contact.readAt as string | undefined
            };
          }
          return contact;
        });

        return {
          ...item,
          contacts: updatedContacts
        };
      }
      return item;
    }));
  }, []);

  const updateMessageResponseStatus = useCallback((historyId: string, phoneNumber: string, responded: boolean, sentiment?: 'positive' | 'negative' | 'neutral') => {
    setSendingHistory(prev => prev.map(item => {
      if (item.id === historyId) {
        const updatedContacts = item.contacts.map(contact => {
          if (contact.phoneNumber === phoneNumber) {
            return {
              ...contact,
              responded,
              replied: responded, // Update both for compatibility
              respondedAt: responded ? new Date().toISOString() : contact.respondedAt as string | undefined,
              sentiment: sentiment || contact.sentiment
            };
          }
          return contact;
        });

        return {
          ...item,
          contacts: updatedContacts
        };
      }
      return item;
    }));
  }, []);

  return {
    sendingHistory,
    setSendingHistory,
    currentSendingId,
    setCurrentSendingId,
    sendingInProgress,
    setSendingInProgress,
    sendingPaused,
    setSendingPaused,
    sentCount,
    setSentCount,
    failedCount,
    setFailedCount,
    updateSendingHistory,
    updateContactStatus,
    updateMessageReadStatus,
    updateMessageResponseStatus,
    activeSessions,
    setActiveSessions
  };
};


import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MessageActivity, WhatsAppMessage } from '../hooks/types/messageTypes';

interface RealTimeMessagingContextType {
  messageActivities: MessageActivity[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearSessionActivity: (sessionId: string) => void;
  clearAllActivities: () => void;
  setPollingFrequency: (frequency: number) => void;
  currentSendingId: string | null;
  setCurrentSendingId: (id: string | null) => void;
  selectedSendingId: string | null;
  setSelectedSendingId: (id: string | null) => void;
}

const RealTimeMessagingContext = createContext<RealTimeMessagingContextType | undefined>(undefined);

export function RealTimeMessagingProvider({ children }: { children: ReactNode }) {
  const [messageActivities, setMessageActivities] = useState<MessageActivity[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [pollingFrequency, setPollingFrequency] = useState(5000); // 5 seconds default
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentSendingId, setCurrentSendingId] = useState<string | null>(null);
  const [selectedSendingId, setSelectedSendingId] = useState<string | null>(null);

  // Function to fetch messages from the API
  const fetchMessages = useCallback(async () => {
    try {
      // This is a mock implementation - in a real app, you'd call an API
      // const response = await fetch('/api/messages');
      // const data = await response.json();
      
      // For demo purposes, we'll generate some random messages
      const mockSessions = ['session1', 'session2', 'session3'];
      const mockPhoneNumbers = ['+1234567890', '+0987654321', '+1122334455'];
      const mockSessionNames = ['Personal', 'Business', 'Sales'];
      
      // Only add new messages occasionally to simulate real-time updates
      if (Math.random() > 0.7) {
        const randomSession = mockSessions[Math.floor(Math.random() * mockSessions.length)];
        const randomPhone = mockPhoneNumbers[Math.floor(Math.random() * mockPhoneNumbers.length)];
        const randomSessionName = mockSessionNames[Math.floor(Math.random() * mockSessionNames.length)];
        
        const newMessage: WhatsAppMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          phoneNumber: randomPhone,
          message: `Message at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString(),
          status: Math.random() > 0.2 ? 'delivered' : 'sent',
          direction: Math.random() > 0.5 ? 'inbound' : 'outbound',
          sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative'
        };
        
        // Find if this session+phone combo already exists
        setMessageActivities(prev => {
          const existingActivityIndex = prev.findIndex(
            activity => activity.sessionId === randomSession && activity.phoneNumber === randomPhone
          );
          
          if (existingActivityIndex >= 0) {
            // Add to existing activity
            const updatedActivities = [...prev];
            updatedActivities[existingActivityIndex] = {
              ...updatedActivities[existingActivityIndex],
              messages: [...updatedActivities[existingActivityIndex].messages, newMessage],
              lastActivity: new Date().toISOString()
            };
            return updatedActivities;
          } else {
            // Create new activity
            return [...prev, {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              sessionId: randomSession,
              phoneNumber: randomPhone,
              sessionName: randomSessionName,
              messages: [newMessage],
              lastActivity: new Date().toISOString()
            }];
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);
  
  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      const interval = setInterval(fetchMessages, pollingFrequency);
      setPollingInterval(interval);
    }
  }, [isMonitoring, fetchMessages, pollingFrequency]);
  
  const stopMonitoring = useCallback(() => {
    if (isMonitoring && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsMonitoring(false);
    }
  }, [isMonitoring, pollingInterval]);
  
  const clearSessionActivity = useCallback((sessionId: string) => {
    setMessageActivities(prev => prev.filter(activity => activity.sessionId !== sessionId));
  }, []);
  
  const clearAllActivities = useCallback(() => {
    setMessageActivities([]);
  }, []);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  // Update polling frequency if it changes
  useEffect(() => {
    if (isMonitoring && pollingInterval) {
      clearInterval(pollingInterval);
      const newInterval = setInterval(fetchMessages, pollingFrequency);
      setPollingInterval(newInterval);
    }
  }, [pollingFrequency, isMonitoring, fetchMessages]);
  
  const value = {
    messageActivities,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearSessionActivity,
    clearAllActivities,
    setPollingFrequency,
    currentSendingId,
    setCurrentSendingId,
    selectedSendingId,
    setSelectedSendingId
  };
  
  return (
    <RealTimeMessagingContext.Provider value={value}>
      {children}
    </RealTimeMessagingContext.Provider>
  );
}

export function useRealTimeMessagingContext() {
  const context = useContext(RealTimeMessagingContext);
  if (context === undefined) {
    throw new Error('useRealTimeMessagingContext must be used within a RealTimeMessagingProvider');
  }
  return context;
}

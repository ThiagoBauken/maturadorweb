
import { useState, useEffect, useCallback } from 'react';
import { whatsAppApi } from '@/services/whatsapp-api';
import { MessageActivity, MessageSentiment, WhatsAppMessage } from './types/messageTypes';

export type { MessageActivity, MessageSentiment, WhatsAppMessage };

export function useRealTimeMessaging() {
  const [messageActivities, setMessageActivities] = useState<MessageActivity[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5000); // 5 seconds default
  const [sentimentAnalysis, setSentimentAnalysis] = useState<Record<string, MessageSentiment>>({});
  
  // Start monitoring messages
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);
  
  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);
  
  // Clear activities for a session
  const clearSessionActivity = useCallback((sessionId: string) => {
    setMessageActivities(prev => prev.filter(a => a.sessionId !== sessionId));
    setSentimentAnalysis(prev => {
      const updated = {...prev};
      delete updated[sessionId];
      return updated;
    });
  }, []);
  
  // Clear all activities
  const clearAllActivities = useCallback(() => {
    setMessageActivities([]);
    setSentimentAnalysis({});
  }, []);
  
  // Set polling frequency
  const setPollingFrequency = useCallback((milliseconds: number) => {
    setPollingInterval(milliseconds);
  }, []);
  
  // Get sentiment summary for a session
  const getSentimentSummary = useCallback((sessionId: string) => {
    return sentimentAnalysis[sessionId] || { positive: 0, negative: 0, neutral: 0 };
  }, [sentimentAnalysis]);
  
  // Update sentiment analysis when message activities change
  useEffect(() => {
    const updatedSentiments: Record<string, MessageSentiment> = {};
    
    messageActivities.forEach(activity => {
      const sentiment = { positive: 0, negative: 0, neutral: 0 };
      
      activity.messages.forEach(message => {
        if (message.sentiment === 'positive') sentiment.positive++;
        else if (message.sentiment === 'negative') sentiment.negative++;
        else if (message.sentiment === 'neutral') sentiment.neutral++;
      });
      
      updatedSentiments[activity.sessionId] = sentiment;
    });
    
    setSentimentAnalysis(updatedSentiments);
  }, [messageActivities]);
  
  return {
    messageActivities,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearSessionActivity,
    clearAllActivities,
    setPollingFrequency,
    sentimentAnalysis,
    getSentimentSummary
  };
}

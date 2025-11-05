
import { ReactNode, createContext, useContext, useEffect } from 'react';
import { useSendingHistory } from '../hooks/useSendingHistory';
import { SendingHistory, Contact } from '../hooks/types'; // Import Contact from hooks/types
import { useTemplateStats } from '../hooks/useTemplateStats';

interface SendingHistoryContextType {
  sendingHistory: SendingHistory[];
  setSendingHistory: (history: SendingHistory[] | ((prev: SendingHistory[]) => SendingHistory[])) => void;
  currentSendingId: string | null;
  setCurrentSendingId: (id: string | null) => void;
  sendingInProgress: boolean;
  setSendingInProgress: (inProgress: boolean) => void;
  sendingPaused: boolean;
  setSendingPaused: (paused: boolean) => void;
  sentCount: number;
  setSentCount: (count: number) => void;
  failedCount: number;
  setFailedCount: (count: number) => void;
  updateSendingHistory: (id: string, updates: Partial<SendingHistory>) => void;
  updateContactStatus: (historyId: string, phoneNumber: string, updates: Partial<Contact>) => void;
  updateMessageReadStatus: (historyId: string, phoneNumber: string, read: boolean) => void;
  updateMessageResponseStatus: (historyId: string, phoneNumber: string, responded: boolean, sentiment?: 'positive' | 'negative' | 'neutral') => void;
  templateStats: any[];
  getTopPerformingTemplates: (limit?: number) => any[];
  activeSessions: string[];
  setActiveSessions: (sessions: string[]) => void;
}

const SendingHistoryContext = createContext<SendingHistoryContextType | undefined>(undefined);

export function SendingHistoryProvider({ children }: { children: ReactNode }) {
  const sendingHistoryHook = useSendingHistory();
  const templateStatsHook = useTemplateStats();
  
  useEffect(() => {
    const savedSendingHistory = localStorage.getItem('sending_history');
    if (savedSendingHistory) {
      try {
        const history = JSON.parse(savedSendingHistory);
        sendingHistoryHook.setSendingHistory(history);
        
        const inProgressOperation = history.find((h: SendingHistory) => 
          h.status === 'in-progress' || h.status === 'paused'
        );
        
        if (inProgressOperation) {
          sendingHistoryHook.setCurrentSendingId(inProgressOperation.id);
          sendingHistoryHook.setSentCount(inProgressOperation.sentCount);
          sendingHistoryHook.setFailedCount(inProgressOperation.failedCount);
          
          if (inProgressOperation.status === 'paused') {
            sendingHistoryHook.setSendingPaused(true);
            sendingHistoryHook.setSendingInProgress(true);
          }
        }
        
        templateStatsHook.generateTemplateStats(history);
      } catch (error) {
        console.error('Failed to load sending history', error);
      }
    }
  }, []);
  
  useEffect(() => {
    if (sendingHistoryHook.sendingHistory.length > 0) {
      localStorage.setItem('sending_history', JSON.stringify(sendingHistoryHook.sendingHistory));
      templateStatsHook.generateTemplateStats(sendingHistoryHook.sendingHistory);
    }
  }, [sendingHistoryHook.sendingHistory]);
  
  const value: SendingHistoryContextType = {
    ...sendingHistoryHook,
    templateStats: templateStatsHook.templateStats,
    getTopPerformingTemplates: templateStatsHook.getTopPerformingTemplates,
  };
  
  return (
    <SendingHistoryContext.Provider value={value}>
      {children}
    </SendingHistoryContext.Provider>
  );
}

export function useSendingHistoryContext() {
  const context = useContext(SendingHistoryContext);
  if (context === undefined) {
    throw new Error('useSendingHistoryContext must be used within a SendingHistoryProvider');
  }
  return context;
}

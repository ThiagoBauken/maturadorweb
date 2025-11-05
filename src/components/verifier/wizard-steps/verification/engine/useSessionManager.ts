import { useState } from 'react';
import { StatusItem } from '@/components/common/status';
import { Session, SessionManagerProps } from './types';

export function useSessionManager({
  sessions,
  config,
  setStatusItems
}: SessionManagerProps) {
  const [sessionUsageCounts, setSessionUsageCounts] = useState<Record<string, number>>({});
  
  const initializeSessionUsage = () => {
    const initialSessionUsage: Record<string, number> = {};
    const availableSessions = sessions.filter(s => s.status === 'active');
    
    availableSessions.forEach(session => {
      initialSessionUsage[session.id] = 0;
    });
    
    setSessionUsageCounts(initialSessionUsage);
    return initialSessionUsage;
  };
  
  const getSelectedSessionId = () => {
    const availableSessions = sessions.filter(s => s.status === 'active');
    
    if (availableSessions.length === 0) {
      return null;
    }
    
    // Select session with least usage
    let selectedSessionId = availableSessions[0].id;
    let minUsage = sessionUsageCounts[selectedSessionId] || 0;
    
    availableSessions.forEach(session => {
      const usage = sessionUsageCounts[session.id] || 0;
      if (usage < minUsage) {
        minUsage = usage;
        selectedSessionId = session.id;
      }
    });
    
    // Check if session has reached its daily limit
    if (config.sessionLimits.enabled && 
        minUsage >= config.sessionLimits.maxNumbersPerSession) {
      // Session at limit, show warning
      setStatusItems(prev => [
        ...prev,
        {
          id: `status-session-limit-${Date.now()}`,
          status: 'warning',
          title: 'Limite de Sessão Atingido',
          description: 'Todas as sessões atingiram o limite diário',
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Reset counts after warning
      setTimeout(() => {
        setSessionUsageCounts({}); // Reset counts
      }, 10000); // 10 second cooldown for demo
    }
    
    return selectedSessionId;
  };
  
  const incrementSessionUsage = (sessionId: string) => {
    setSessionUsageCounts(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || 0) + 1
    }));
  };
  
  const resetSessionUsage = () => {
    setSessionUsageCounts({});
  };
  
  const updateSessionStatusItem = () => {
    const sessionInfo = Object.entries(sessionUsageCounts)
      .map(([id, count]) => {
        const session = sessions.find(s => s.id === id);
        return `${session?.name || id}: ${count}/${config.sessionLimits.maxNumbersPerSession}`;
      })
      .join(', ');
    
    setStatusItems(prev => {
      const updated = [...prev];
      const sessionIndex = updated.findIndex(item => item.id === 'session-usage');
      if (sessionIndex !== -1) {
        updated[sessionIndex] = {
          ...updated[sessionIndex],
          description: `Uso: ${sessionInfo}`,
        };
      }
      return updated;
    });
  };
  
  return {
    sessionUsageCounts,
    initializeSessionUsage,
    getSelectedSessionId,
    incrementSessionUsage,
    resetSessionUsage,
    updateSessionStatusItem
  };
}


import { useState, useCallback } from 'react';
import { SendingHistory } from './types';

export interface MessageTemplateStats {
  id: string;
  content: string;
  sent: number;
  delivered: number;
  read: number;
  responses: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  responseCount: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  lastUsed: string;
}

export const useTemplateStats = () => {
  const [templateStats, setTemplateStats] = useState<MessageTemplateStats[]>([]);

  const generateTemplateStats = useCallback((history: SendingHistory[]) => {
    const statsMap = new Map<string, any>();

    history.forEach(item => {
      if (item.messageTemplates) {
        item.messageTemplates.forEach((template, index) => {
          const key = `${template}-${index}`;

          if (!statsMap.has(key)) {
            statsMap.set(key, {
              id: Math.random().toString(36).substring(2, 9),
              content: template,
              sent: 0,
              delivered: 0,
              read: 0,
              responses: 0,
              sentiments: {
                positive: 0,
                negative: 0,
                neutral: 0
              },
              lastUsed: item.startTime
            });
          }

          const stats = statsMap.get(key);

          // Count all sent messages for this template
          stats.sent += item.contacts.filter(c => c.sent).length;
          
          // Count all delivered messages
          stats.delivered += item.contacts.filter(c => c.sent && !c.error).length;
          
          // Count all read messages
          stats.read += item.contacts.filter(c => c.read).length;
          
          // Count all responses
          stats.responses += item.contacts.filter(c => c.responded || c.replied === true).length;
          
          // Update last used date if this sending is newer
          if (new Date(item.startTime) > new Date(stats.lastUsed)) {
            stats.lastUsed = item.startTime;
          }
          
          statsMap.set(key, stats);
        });
      }
    });

    const calculatedStats = Array.from(statsMap.values()).map(stat => ({
      id: stat.id,
      content: stat.content,
      sent: stat.sent,
      delivered: stat.delivered,
      read: stat.read,
      responses: stat.responses,
      sentCount: stat.sent,
      deliveredCount: stat.delivered,
      readCount: stat.read,
      responseCount: stat.responses,
      deliveryRate: stat.sent > 0 ? Math.round((stat.delivered / stat.sent) * 100) : 0,
      readRate: stat.delivered > 0 ? Math.round((stat.read / stat.delivered) * 100) : 0,
      responseRate: stat.read > 0 ? Math.round((stat.responses / stat.read) * 100) : 0,
      lastUsed: stat.lastUsed
    }));

    setTemplateStats(calculatedStats);
  }, []);

  const getTopPerformingTemplates = useCallback((limit = 3) => {
    return [...templateStats]
      .sort((a, b) => b.responseRate - a.responseRate)
      .slice(0, limit);
  }, [templateStats]);

  return {
    templateStats,
    generateTemplateStats,
    getTopPerformingTemplates
  };
};

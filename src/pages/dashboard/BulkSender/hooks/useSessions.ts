
import { useState, useEffect, useCallback } from 'react';
import { WhatsAppSession } from '../models/whatsapp';
import { toast } from 'sonner';
import { useSessions as useGlobalSessions } from '@/hooks/useSessions';

interface UseSessionsResult {
  availableSessions: WhatsAppSession[];
  isLoading: boolean;
  refreshSessions: () => void;
  error: Error | null;
}

/**
 * Custom hook for fetching and managing WhatsApp sessions for bulk sender
 */
export function useSessions(): UseSessionsResult {
  const { sessions, isLoading, error, refreshSessions } = useGlobalSessions({ filterStatus: 'all' });
  
  // Convert the global session format to WhatsAppSession format for BulkSender
  const availableSessions: WhatsAppSession[] = sessions.map(session => ({
    id: session.id,
    name: session.name,
    phone: session.phone,
    status: session.status === 'active' ? 'connected' : 'disconnected',
    batteryLevel: session.batteryLevel,
    connectionType: session.connectionType,
    lastSeen: session.lastSeen
  }));

  return { 
    availableSessions, 
    isLoading, 
    refreshSessions, 
    error 
  };
}

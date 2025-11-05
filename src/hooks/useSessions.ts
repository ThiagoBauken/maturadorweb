import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { whatsAppApi } from '@/services/whatsapp-api';

export type SessionConnectionStatus = 'active' | 'disconnected' | 'connecting' | 'error' | 'pending' | 'created' | 'restarting';

export interface SessionWithDetails {
  id: string;
  name: string;
  phone: string;
  phoneNumber?: string; // Backend uses phoneNumber, frontend uses phone
  status: SessionConnectionStatus;
  lastActive?: string;
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  lastSeen?: string;
  qrCode?: string;
  retryCount?: number;
  sessionId?: string;
  instanceName?: string;
  metrics?: {
    verificationCount?: number;
    warmingCount?: number;
    bulkCount?: number;
    lastActivity?: string;
    [key: string]: unknown;
  };
  settings?: {
    verificationEnabled?: boolean;
    warmingEnabled?: boolean;
    bulkEnabled?: boolean;
    [key: string]: unknown;
  };
  device?: {
    battery?: number;
    plugged?: boolean;
    phoneModel?: string;
  };
}

interface UseSessionsOptions {
  filterStatus?: SessionConnectionStatus | 'all';
}

export function useSessions(options: UseSessionsOptions = {}) {
  const { filterStatus = 'all' } = options;
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshSessions = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.info("Refreshing WhatsApp sessions...");
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call the real API instead of using mock data
        const fetchedSessions = await whatsAppApi.getSessions();

        // Transform API response to match the expected format
        const transformedSessions = fetchedSessions.map(session => ({
          id: session.id,
          name: session.name,
          phone: session.phoneNumber, // Map backend phoneNumber to frontend phone
          phoneNumber: session.phoneNumber,
          status: mapSessionStatus(session.status),
          lastActive: session.updatedAt,
          instanceName: session.instanceName,
          metrics: session.metrics || {},
          settings: session.settings || {},
          // If we have device info
          ...(session.device && {
            batteryLevel: session.device.battery,
            device: {
              battery: session.device.battery,
              plugged: session.device.plugged,
              phoneModel: session.device.phoneModel
            }
          })
        }));

        // Filter sessions based on status if needed
        let filteredSessions = transformedSessions;
        if (filterStatus !== 'all') {
          filteredSessions = transformedSessions.filter(s => s.status === filterStatus);
        }

        setSessions(filteredSessions);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        console.error('Error loading WhatsApp sessions:', error);
        setError(error);
        toast.error('Failed to load WhatsApp sessions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [refreshKey, filterStatus]);

  const connectSession = useCallback(async (sessionId: string) => {
    try {
      toast.info(`Connecting to session ${sessionId}...`);

      // First get QR code for the session
      const sessionWithQr = await whatsAppApi.generateQRCode(sessionId);

      // Update session with QR code in the local state
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, qrCode: sessionWithQr.qrCode, status: 'pending' }
            : s
        )
      );

      // Then connect using the QR code (in a real app, the user would scan the QR code)
      await whatsAppApi.connectWithQR(sessionId);

      toast.success(`Session ${sessionId} connection initiated. Please scan the QR code.`);
      return sessionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error connecting session:', error);
      toast.error(`Failed to connect session: ${error.message}`);
      throw error;
    }
  }, []);

  const disconnectSession = useCallback(async (sessionId: string) => {
    try {
      toast.info(`Disconnecting session ${sessionId}...`);
      await whatsAppApi.disconnectSession(sessionId);

      // Update local state
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'disconnected' }
            : s
        )
      );

      toast.success(`Session ${sessionId} disconnected successfully`);
      return sessionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error disconnecting session:', error);
      toast.error(`Failed to disconnect session: ${error.message}`);
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      toast.info(`Deleting session ${sessionId}...`);
      await whatsAppApi.disconnectSession(sessionId);

      // Update local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      toast.success(`Session ${sessionId} deleted successfully`);
      return sessionId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error deleting session:', error);
      toast.error(`Failed to delete session: ${error.message}`);
      throw error;
    }
  }, []);

  const generateQRCode = useCallback(async (sessionId: string) => {
    try {
      const result = await whatsAppApi.getSession(sessionId);

      // Update local state with QR code
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? { ...s, qrCode: result.qrCode }
            : s
        )
      );

      return result.qrCode;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error generating QR code:', error);
      toast.error(`Failed to generate QR code: ${error.message}`);
      throw error;
    }
  }, []);

  const createSession = useCallback(async (name: string, phoneNumber: string, settings = {}): Promise<SessionWithDetails> => {
    try {
      toast.info(`Creating new WhatsApp session: ${name}...`);
      const newSession = await whatsAppApi.connectSession(name);

      // Transform the API response to a SessionWithDetails
      const sessionDetails: SessionWithDetails = {
        id: newSession.id,
        name: newSession.name,
        phone: newSession.phoneNumber, // Set phone from phoneNumber
        phoneNumber: newSession.phoneNumber,
        status: mapSessionStatus(newSession.status),
        instanceName: newSession.instanceName,
        metrics: newSession.metrics,
        settings: newSession.settings
      };

      // Add to local state
      setSessions(prev => [...prev, sessionDetails]);

      toast.success(`Session ${name} created successfully`);
      return sessionDetails;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error creating session:', error);
      toast.error(`Failed to create session: ${error.message}`);
      throw error;
    }
  }, []);

  // Helper function to map backend session status to frontend status
  const mapSessionStatus = (backendStatus: string): SessionConnectionStatus => {
    switch (backendStatus) {
      case 'connected':
        return 'active';
      case 'disconnected':
        return 'disconnected';
      case 'connecting':
        return 'connecting';
      case 'pending':
        return 'pending';
      case 'created':
        return 'created';
      case 'restarting':
        return 'restarting';
      default:
        return 'disconnected';
    }
  };

  return {
    sessions,
    isLoading,
    error,
    refreshSessions,
    connectSession,
    disconnectSession,
    deleteSession,
    generateQRCode,
    createSession
  };
}

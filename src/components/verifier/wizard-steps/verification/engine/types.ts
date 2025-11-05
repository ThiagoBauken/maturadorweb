
import { StatusItem } from '@/components/common/status';

// Interface unificada para compatibilidade entre Session e SessionWithDetails
export interface Session {
  id: string;
  name: string;
  phone?: string;
  phoneNumber?: string;
  status: 'active' | 'disconnected' | 'connecting' | 'error';
  lastActive?: string;
  deviceInfo?: {
    name: string;
    model: string;
  };
  // Campos adicionais que podem estar em SessionWithDetails
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  lastSeen?: string;
  qrCode?: string;
  retryCount?: number;
  sessionId?: string;
}

export interface SessionManagerProps {
  sessions: Session[];
  config: {
    sessionLimits: {
      enabled: boolean;
      maxNumbersPerSession: number;
    }
  };
  setStatusItems: (setter: (prev: StatusItem[]) => StatusItem[]) => void;
}

export interface StatusUpdatesProps {
  setStatusItems: (setter: (prev: StatusItem[]) => StatusItem[]) => void;
  sessions: Session[];
  config: {
    sessionLimits: {
      maxNumbersPerSession: number;
    }
  };
}

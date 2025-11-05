
/**
 * Interface representing a WhatsApp session
 */
export interface WhatsAppSession {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'loading';
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  lastSeen?: string;
}

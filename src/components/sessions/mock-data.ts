
export interface Session {
  id: string;
  name: string;
  phone: string;
  status: 'active' | 'disconnected';
  lastActive?: string;
}

export const mockSessions: Session[] = [
  {
    id: '1',
    name: 'Personal WhatsApp',
    phone: '+1 (555) 123-4567',
    status: 'active',
    lastActive: '2023-06-15T10:30:00'
  },
  {
    id: '2',
    name: 'Business Account',
    phone: '+1 (555) 987-6543',
    status: 'active',
    lastActive: '2023-06-15T09:45:00'
  },
  {
    id: '3',
    name: 'Marketing Team',
    phone: '+1 (555) 234-5678',
    status: 'disconnected',
    lastActive: '2023-06-14T16:20:00'
  },
  {
    id: '4',
    name: 'Support Line',
    phone: '+1 (555) 345-6789',
    status: 'disconnected',
    lastActive: '2023-06-13T11:10:00'
  }
];


import { WhatsAppSession } from '../models/whatsapp';
import { SessionCard } from './SessionCard';
import { Button } from '@/components/ui/button';

interface SessionListProps {
  sessions: WhatsAppSession[];
  activeSessions: string[];
  onToggle: (sessionId: string) => void;
  isLoading?: boolean;
}

/**
 * Component that renders a list of WhatsApp sessions
 */
export function SessionList({ sessions, activeSessions, onToggle, isLoading }: SessionListProps) {
  if (sessions.length === 0 && !isLoading) {
    return (
      <div className="border border-dashed rounded-md p-6 text-center">
        <p className="text-muted-foreground">No WhatsApp sessions available</p>
        <Button variant="outline" size="sm" className="mt-2">
          Connect New Session
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {sessions.map(session => (
        <SessionCard 
          key={session.id} 
          session={session} 
          isActive={activeSessions.includes(session.id)}
          onToggle={onToggle}
          disabled={isLoading}
        />
      ))}
    </div>
  );
}

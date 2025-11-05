
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { WhatsAppSession } from '../models/whatsapp';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: WhatsAppSession;
  isActive: boolean;
  onToggle: (sessionId: string) => void;
  disabled?: boolean;
}

/**
 * Component that renders a single WhatsApp session card
 */
export function SessionCard({ session, isActive, onToggle, disabled }: SessionCardProps) {
  return (
    <Card className={cn(
      "p-3",
      session.status === 'disconnected' && "opacity-60"
    )}>
      <div className="flex items-center space-x-3">
        <Checkbox 
          id={`session-${session.id}`} 
          checked={isActive}
          onCheckedChange={() => onToggle(session.id)}
          disabled={disabled || session.status === 'disconnected'}
          aria-label={`Select ${session.name} session`}
        />
        <div className="grid gap-0.5 flex-1">
          <Label htmlFor={`session-${session.id}`} className="cursor-pointer">
            {session.name}
          </Label>
          <div className="flex items-center gap-2">
            <span 
              className={cn("text-xs px-1.5 py-0.5 rounded-full", 
                session.status === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}
            >
              {session.status === 'connected' ? 'connected' : 'disconnected'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

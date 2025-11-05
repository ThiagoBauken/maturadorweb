
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  MoreVertical, 
  RefreshCw, 
  Smartphone, 
  Trash2, 
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SessionWithDetails } from '@/hooks/useSessions';

interface SessionsListProps {
  sessions: SessionWithDetails[];
  isLoading?: boolean;
  onConnect: (sessionId: string) => void;
  onRefresh: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onViewDetails?: (session: SessionWithDetails) => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions, 
  isLoading,
  onConnect, 
  onRefresh,
  onDelete,
  onViewDetails
}) => {
  if (sessions.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Sessions Found</h3>
        <p className="text-muted-foreground mt-2 mb-6">
          No WhatsApp sessions are available for the current filter.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div 
          key={session.id} 
          className={cn(
            "flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors",
            onViewDetails && "cursor-pointer"
          )}
          onClick={() => onViewDetails && onViewDetails(session)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{session.name}</div>
              <div className="text-sm text-muted-foreground">{session.phone}</div>
              {session.lastSeen && (
                <div className="text-xs flex items-center mt-1 text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  Last seen: {session.lastSeen}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={session.status === 'active' ? 'default' : 'outline'} 
              className={session.status === 'active' ? 'bg-green-500' : ''}
            >
              {session.status === 'active' ? 'Active' : 'Disconnected'}
            </Badge>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onConnect(session.id);
              }}
              title="Scan QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh(session.id);
              }}
              title="Refresh Status"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onConnect(session.id)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRefresh(session.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(session.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

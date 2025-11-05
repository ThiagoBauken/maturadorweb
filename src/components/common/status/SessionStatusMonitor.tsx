
import React from 'react';
import { StatusMonitor, StatusItem, StatusType } from './StatusMonitor';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ZapOff, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export interface SessionStatus extends StatusItem {
  sessionId: string;
  status: StatusType;
  title: string;
  description?: string;
  timestamp?: string;
  lastActive?: string;
  batteryLevel?: number;
  connectionType?: 'wifi' | 'cellular' | 'unknown';
  retryCount?: number;
  name?: string; 
  phone?: string;
}

interface SessionStatusMonitorProps {
  sessions: SessionStatus[];
  onRefresh?: () => void;
  onReconnect?: (sessionId: string) => void;
  onViewDetails?: (session: SessionStatus) => void;
  isLoading?: boolean;
}

export const SessionStatusMonitor: React.FC<SessionStatusMonitorProps> = ({ 
  sessions, 
  onRefresh, 
  onReconnect, 
  onViewDetails,
  isLoading 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'success':
        return <Info className="h-4 w-4 mr-2" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
      case 'error':
        return <ZapOff className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <StatusMonitor title="Session Status">
      {sessions.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No sessions available.
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="border-b py-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge className="mr-2 rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: getStatusColor(session.status) }}>
                  {getStatusIcon(session.status)}
                </Badge>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold">{session.title}</h4>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                  {session.batteryLevel !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Battery: {session.batteryLevel}%
                    </p>
                  )}
                  {session.connectionType && (
                    <p className="text-sm text-muted-foreground">
                      Connection: {session.connectionType}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.status === 'error' && onReconnect && (
                  <Button variant="outline" size="sm" onClick={() => onReconnect(session.sessionId)}>
                    Reconnect
                  </Button>
                )}
                {onViewDetails && (
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(session)}>
                    View Details
                  </Button>
                )}
              </div>
            </div>
            {session.timestamp && (
              <p className="mt-1 text-right text-sm text-muted-foreground">
                {session.timestamp}
              </p>
            )}
          </div>
        ))
      )}
      <div className="mt-4 flex justify-end">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
    </StatusMonitor>
  );
};

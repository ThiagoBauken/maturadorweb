
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useBulkSender } from '../hooks/useBulkSender';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { SessionList } from './SessionList';
import { useSessions } from '../hooks/useSessions';

/**
 * Component for selecting which WhatsApp sessions to use for sending messages
 */
export function SessionSelector() {
  const { activeSessions, setActiveSessions } = useBulkSender();
  const { availableSessions, isLoading, refreshSessions, error } = useSessions();

  // Initialize with connected sessions if none are selected
  useEffect(() => {
    if (activeSessions.length === 0 && availableSessions.length > 0) {
      const connectedSessions = availableSessions
        .filter(session => session.status === 'connected')
        .map(session => session.id);
      
      if (connectedSessions.length > 0) {
        setActiveSessions(connectedSessions);
      }
    }
  }, [availableSessions, activeSessions.length, setActiveSessions]);

  const handleSessionToggle = (sessionId: string) => {
    // Create a new array based on the current activeSessions
    const updatedSessions = [...activeSessions];
    
    if (updatedSessions.includes(sessionId)) {
      // Don't allow removing the last session
      if (updatedSessions.length === 1) {
        toast.error("At least one WhatsApp session must be selected");
        return;
      }
      // Remove the session
      const filteredSessions = updatedSessions.filter(id => id !== sessionId);
      setActiveSessions(filteredSessions);
    } else {
      // Add the session
      updatedSessions.push(sessionId);
      setActiveSessions(updatedSessions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="ml-2 text-muted-foreground">Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Failed to load WhatsApp sessions</p>
        <Button 
          onClick={refreshSessions} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select which WhatsApp accounts will be used to send messages
        </p>
        <Button
          onClick={refreshSessions}
          variant="outline"
          size="sm"
          className="gap-1"
          aria-label="Refresh sessions list"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>
      
      <SessionList
        sessions={availableSessions}
        activeSessions={activeSessions}
        onToggle={handleSessionToggle}
        isLoading={isLoading}
      />
    </div>
  );
}

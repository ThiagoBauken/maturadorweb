
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { SessionsList } from '@/components/sessions/SessionsList';
import { NewSessionDialog } from '@/components/sessions/NewSessionDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SessionQRCode } from '@/components/sessions/SessionQRCode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionStatusMonitor, SessionStatus } from '@/components/common/status';
import { useSessions, SessionWithDetails } from '@/hooks/useSessions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Sessions() {
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const { 
    sessions, 
    isLoading, 
    error, 
    refreshSessions, 
    connectSession, 
    deleteSession 
  } = useSessions({
    filterStatus: activeTab === 'all' ? 'all' : activeTab as any
  });

  const sessionStatusItems: SessionStatus[] = sessions.map(session => ({
    id: session.id,
    sessionId: session.id,
    title: session.name,
    description: session.phone,
    status: session.status === 'active' ? 'success' : 'error',
    timestamp: session.lastActive,
    phoneNumber: session.phone,
    batteryLevel: session.batteryLevel,
    connectionType: session.connectionType,
    lastActivity: session.lastSeen,
    name: session.name,
    phone: session.phone
  }));

  const handleConnectSession = (sessionId: string) => {
    connectSession(sessionId);
    setSelectedSessionId(sessionId);
    setIsQRDialogOpen(true);
  };

  const handleRefreshSession = (sessionId: string) => {
    const sessionName = sessions.find(s => s.id === sessionId)?.name || 'Unknown';
    toast.info(`Refreshing ${sessionName} status...`);
  };

  // Function for SessionsList component (expects SessionWithDetails)
  const handleViewSessionDetailsFromList = (session: SessionWithDetails) => {
    console.log("View details for session from list:", session);
    setSelectedSessionId(session.id);
    setIsQRDialogOpen(true);
  };
  
  // Function for SessionStatusMonitor component (expects SessionStatus)
  const handleViewSessionDetailsFromMonitor = (session: SessionStatus) => {
    console.log("View details for session from monitor:", session);
    setSelectedSessionId(session.sessionId);
    setIsQRDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Sessions"
        description="Manage your connected WhatsApp sessions"
        actions={
          <Button onClick={() => setIsNewSessionDialogOpen(true)}>
            <span className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </span>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>
                View and manage your connected WhatsApp sessions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshSessions}
                disabled={isLoading}
              >
                <span className="flex items-center">
                  <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                  Refresh All
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load sessions. Please try again.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
              <TabsTrigger value="all">All Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <SessionsList 
                sessions={sessions}
                isLoading={isLoading}
                onConnect={handleConnectSession}
                onRefresh={handleRefreshSession}
                onDelete={deleteSession}
                onViewDetails={handleViewSessionDetailsFromList}
              />
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <SessionStatusMonitor 
              sessions={sessionStatusItems}
              onRefresh={refreshSessions}
              onReconnect={handleConnectSession}
              onViewDetails={handleViewSessionDetailsFromMonitor}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
      
      <NewSessionDialog 
        open={isNewSessionDialogOpen} 
        onOpenChange={setIsNewSessionDialogOpen} 
      />
      
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          {selectedSessionId && (
            <SessionQRCode sessionId={selectedSessionId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

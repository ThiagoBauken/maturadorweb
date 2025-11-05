import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, PowerOff, Smartphone, Battery, Wifi, Signal, Clock, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useSessions, SessionWithDetails } from '@/hooks/useSessions';
import { availableSessions } from '@/components/warmers/utils';

const SessionDetails = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, isLoading, refreshSessions, connectSession, disconnectSession } = useSessions();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the session from our data sources
  const sessionFromHook = sessions.find(s => s.id === sessionId);
  const sessionFromMock = availableSessions.find(s => s.id === sessionId);
  
  // Combine data if needed
  const session: SessionWithDetails | undefined = sessionFromHook || {
    id: sessionFromMock?.id || sessionId || '',
    name: sessionFromMock?.name || 'Unknown Session',
    status: sessionFromMock?.status === 'connected' ? 'active' : 'disconnected',
    phone: sessionFromMock?.phone,
    lastActive: new Date().toISOString(),
    batteryLevel: 85,
    connectionType: 'wifi',
    sessionId: sessionId || ''
  };

  useEffect(() => {
    if (!session) {
      toast.error('Session not found');
      navigate('/sessions');
    }
  }, [session, navigate]);

  const handleBack = () => {
    navigate('/sessions');
  };

  const handleRefresh = () => {
    refreshSessions();
    toast.success('Session information refreshed');
  };

  const handleConnect = () => {
    if (sessionId) {
      connectSession(sessionId);
      toast.success('Connecting to WhatsApp...');
    }
  };

  const handleDisconnect = () => {
    if (sessionId) {
      disconnectSession(sessionId);
      toast.success('Disconnected from WhatsApp');
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  const isConnected = session.status === 'active';

  return (
    <div className="space-y-6">
      <PageHeader
        title={session.name}
        description={`WhatsApp session details for ${session.phone || 'Unknown'}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            {isConnected ? (
              <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                <PowerOff className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={handleConnect}>
                <Smartphone className="mr-2 h-4 w-4" /> Connect
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current connection status and details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={isConnected ? 'success' : 'destructive'}
                  className="px-3 py-1"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Phone Number:</span>
                <span>{session.phone || 'Unknown'}</span>
              </div>
              
              {session.batteryLevel !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Battery Level:</span>
                  <div className="flex items-center">
                    <Battery className="mr-2 h-4 w-4" />
                    <span>{session.batteryLevel}%</span>
                  </div>
                </div>
              )}
              
              {session.connectionType && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Connection Type:</span>
                  <div className="flex items-center">
                    {session.connectionType === 'wifi' ? (
                      <Wifi className="mr-2 h-4 w-4" />
                    ) : (
                      <Signal className="mr-2 h-4 w-4" />
                    )}
                    <span>{session.connectionType === 'wifi' ? 'WiFi' : 'Cellular Data'}</span>
                  </div>
                </div>
              )}
              
              {session.lastActive && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Activity:</span>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{new Date(session.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>WhatsApp client details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Client Version:</span>
                <span>WhatsApp 2.23.10.76</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Platform:</span>
                <span>Android</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Device Model:</span>
                <span>Samsung Galaxy S22</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Connected Since:</span>
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Overview</CardTitle>
              <CardDescription>Quick summary of session activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/20 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium">Messages</h3>
                  <p className="text-3xl font-bold mt-2">1,243</p>
                  <p className="text-sm text-muted-foreground mt-1">Sent today</p>
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium">Contacts</h3>
                  <p className="text-3xl font-bold mt-2">587</p>
                  <p className="text-sm text-muted-foreground mt-1">Active contacts</p>
                </div>
                
                <div className="bg-secondary/20 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium">Groups</h3>
                  <p className="text-3xl font-bold mt-2">32</p>
                  <p className="text-sm text-muted-foreground mt-1">Active groups</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                    <span>Bulk message campaign completed</span>
                    <span className="text-sm text-muted-foreground">10:23 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                    <span>New contacts synced</span>
                    <span className="text-sm text-muted-foreground">Yesterday</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                    <span>Warmer task completed</span>
                    <span className="text-sm text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Message Statistics</CardTitle>
              <CardDescription>Detailed messaging activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">Message statistics will be available in future updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>Configure session parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">Session settings will be available in future updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Session Logs</CardTitle>
              <CardDescription>Activity and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">Session logs will be available in future updates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionDetails;

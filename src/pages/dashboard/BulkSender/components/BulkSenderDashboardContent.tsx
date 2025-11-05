
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SendingProgress } from './SendingProgress';
import { SendingHistory } from './SendingHistory';
import { MessageActivityMonitor } from './MessageActivityMonitor';
import { ActiveSendings } from './ActiveSendings';
import { useBulkSender } from '../hooks/useBulkSender';
import { useNavigate } from 'react-router-dom';
import { SendingConfig } from '../hooks/types/messageTypes';

interface BulkSenderDashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BulkSenderDashboardContent({ activeTab, setActiveTab }: BulkSenderDashboardContentProps) {
  const {
    sendingHistory,
    sendingInProgress,
    currentSendingId,
    sentCount,
    failedCount,
    handlePauseSending,
    handleCancelSending,
  } = useBulkSender();
  
  const navigate = useNavigate();
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState('Calculating...');
  
  const currentSending = currentSendingId 
    ? sendingHistory.find(s => s.id === currentSendingId) 
    : null;
  
  const totalContacts = currentSending?.totalContacts || 0;
  const startTime = currentSending?.startTime || 'N/A';
  const elapsed = startTime !== 'N/A' 
    ? calculateElapsedTime(startTime) 
    : 'N/A';
  
  // Extract sending config if it exists
  const sendingConfig: SendingConfig = currentSending?.config || {
    useRandomInterval: false,
    minInterval: 0,
    maxInterval: 0
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="live">Live Sending</TabsTrigger>
        <TabsTrigger value="history">Sending History</TabsTrigger>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
      </TabsList>
      
      <TabsContent value="live" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Live Sending Operation</h2>
          <p className="text-muted-foreground">Monitor your active sending operation in real-time</p>
        </div>
        
        <ActiveSendings />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sending Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <SendingProgress 
                sentCount={sentCount} 
                totalContacts={totalContacts}
                failedCount={failedCount}
                status={currentSending?.status || 'inactive'}
              />
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{totalContacts}</p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-xl font-bold">{sentCount}</p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-xl font-bold">{failedCount}</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Estimated time left:</p>
                  <p className="font-medium">{estimatedTimeLeft}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePauseSending} 
                    variant="outline" 
                    className="flex-1"
                    disabled={!sendingInProgress}
                  >
                    Pause Sending
                  </Button>
                  <Button 
                    onClick={handleCancelSending} 
                    variant="destructive" 
                    className="flex-1"
                    disabled={!sendingInProgress}
                  >
                    Cancel Operation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Message Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <MessageActivityMonitor />
              
              <div className="mt-4">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/bulk-sender?step=live')}
                >
                  View Live Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sending Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  {sendingInProgress ? 'In Progress' : 'Inactive'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">{startTime !== 'N/A' ? formatDateTime(startTime) : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Elapsed</p>
                <p className="font-medium">{elapsed}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Settings</p>
                <p className="font-medium">
                  {sendingConfig.useRandomInterval 
                    ? `Random delay (${sendingConfig.minInterval}-${sendingConfig.maxInterval}s)` 
                    : `Fixed delay (${sendingConfig.minInterval}s)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history">
        <SendingHistory />
      </TabsContent>
    </Tabs>
  );
}

// Helper functions for time formatting
function calculateElapsedTime(startTime: string): string {
  try {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    
    // Convert to hours and minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `about ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `about ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  } catch (e) {
    return 'N/A';
  }
}

function formatDateTime(dateTimeStr: string): string {
  try {
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  } catch (e) {
    return dateTimeStr;
  }
}

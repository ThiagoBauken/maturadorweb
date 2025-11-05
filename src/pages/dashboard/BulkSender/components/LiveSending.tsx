
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendingProgress } from './SendingProgress';
import { MessageActivityMonitor } from './MessageActivityMonitor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBulkSender } from '../hooks/useBulkSender';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarClock, 
  Pause, 
  Play, 
  StopCircle, 
  RefreshCw, 
  Clock, 
  MessageSquare,
  Users,
  AlarmClock,
  BarChart
} from 'lucide-react';
import { SendingHistory } from '../hooks/types';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface LiveSendingProps {
  currentSendingId: string;
}

export function LiveSending({ currentSendingId }: LiveSendingProps) {
  const navigate = useNavigate();
  const {
    sendingInProgress,
    sendingPaused,
    sentCount,
    failedCount,
    handlePauseSending,
    handleResumeSending,
    handleCancelSending,
    sendingHistory,
    numberRotation,
    useRandomInterval,
    minInterval,
    maxInterval,
    scheduleEnabled,
    scheduleDate,
    scheduleTime,
    startMonitoring,
    isMonitoring,
    activeSessions
  } = useBulkSender();
  
  const [currentSending, setCurrentSending] = useState<SendingHistory | null>(null);
  const [activeTab, setActiveTab] = useState<string>("progress");
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>("Calculating...");
  
  // Fetch the current sending operation's details
  useEffect(() => {
    if (currentSendingId) {
      const sending = sendingHistory?.find(s => s.id === currentSendingId);
      if (sending) {
        setCurrentSending(sending);
      }
    }
  }, [currentSendingId, sendingHistory]);
  
  // Start monitoring when component mounts
  useEffect(() => {
    if (activeSessions && activeSessions.length > 0 && !isMonitoring) {
      startMonitoring();
    }
  }, [activeSessions, isMonitoring, startMonitoring]);
  
  // Calculate estimated completion time
  useEffect(() => {
    if (currentSending && sentCount > 0) {
      const estimate = calculateEstimatedCompletion(
        currentSending.startTime, 
        sentCount, 
        currentSending.totalContacts, 
        minInterval, 
        maxInterval, 
        useRandomInterval
      );
      setEstimatedCompletion(estimate);
    }
  }, [currentSending, sentCount, minInterval, maxInterval, useRandomInterval]);
  
  // Redirect to dashboard if no active sending
  useEffect(() => {
    if (!sendingInProgress && !currentSendingId) {
      navigate('/dashboard');
    }
  }, [sendingInProgress, currentSendingId, navigate]);
  
  if (!currentSending) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Loading sending details...</h3>
        </div>
      </div>
    );
  }
  
  // Get sending configuration details
  const totalContacts = currentSending.totalContacts;
  const progress = Math.round((sentCount / (totalContacts || 1)) * 100);
  const isScheduled = currentSending.scheduleDate && currentSending.scheduleTime;
  
  // Format date and time for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'PP');
    } catch {
      return dateStr;
    }
  };
  
  // Format time
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr;
  };

  // Handle clicking on view live messages
  const handleViewLiveMessages = () => {
    setActiveTab("activity");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Live Sending</h1>
          <p className="text-muted-foreground">
            {sendingPaused ? 
              'Sending paused - click resume to continue' : 
              'Sending messages in progress'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {sendingPaused ? (
            <Button 
              onClick={handleResumeSending} 
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          ) : (
            <Button 
              onClick={handlePauseSending} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={handleCancelSending} 
            variant="destructive" 
            className="flex items-center gap-2"
          >
            <StopCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Sending Status</span>
            {isScheduled && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4 mr-1" />
                Scheduled for {formatDate(currentSending.scheduleDate)} at {formatTime(currentSending.scheduleTime)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <SendingProgress 
                sentCount={sentCount} 
                totalContacts={totalContacts} 
                failedCount={failedCount}
                status={sendingPaused ? 'paused' : 'in-progress'}
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground">Sending Interval</p>
                  <p className="font-medium">
                    {useRandomInterval ? 
                      `${minInterval}-${maxInterval} seconds (random)` : 
                      `${minInterval} seconds (fixed)`
                    }
                  </p>
                </div>
                
                <div className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground">Rotation Mode</p>
                  <p className="font-medium">
                    {numberRotation ? 'Number Rotation' : 'Sequential'}
                  </p>
                </div>
                
                <div className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground">Started At</p>
                  <p className="font-medium">
                    {formatDate(currentSending.startTime)} {formatTime(currentSending.startTime.split('T')[1]?.substring(0, 5) || '')}
                  </p>
                </div>
                
                <div className="bg-muted rounded-md p-3">
                  <p className="text-muted-foreground">Estimated Completion</p>
                  <p className="font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {estimatedCompletion}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full justify-center mt-4"
                onClick={handleViewLiveMessages}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Live Messages
              </Button>
            </div>
            
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="progress" className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Progress
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="progress" className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Message Status
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-xl font-bold">{sentCount}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-xl font-bold">{totalContacts - sentCount - failedCount}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-xl font-bold">{failedCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium flex items-center">
                      <AlarmClock className="h-4 w-4 mr-2" />
                      Detailed Stats
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Read Rate</p>
                        <p className="text-xl font-bold">
                          {calculateReadRate(currentSending)}%
                        </p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Reply Rate</p>
                        <p className="text-xl font-bold">
                          {calculateReplyRate(currentSending)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  <MessageActivityMonitor />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Contact List Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left font-medium">Contact</th>
                  <th className="p-2 text-left font-medium">Status</th>
                  <th className="p-2 text-left font-medium">Sent At</th>
                  <th className="p-2 text-left font-medium">Read</th>
                  <th className="p-2 text-left font-medium">Replied</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentSending.contacts && currentSending.contacts.slice(0, 10).map((contact, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                    <td className="p-2">{contact.phoneNumber}</td>
                    <td className="p-2">
                      {contact.error ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : contact.sent ? (
                        <Badge variant="success">Sent</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      {contact.sentAt ? formatTimestamp(contact.sentAt) : '-'}
                    </td>
                    <td className="p-2">
                      {contact.read ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2">
                      {contact.responded ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Replied</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
                {currentSending.contacts && currentSending.contacts.length > 10 && (
                  <tr>
                    <td colSpan={5} className="p-2 text-center text-sm text-muted-foreground">
                      Showing 10 of {currentSending.contacts.length} contacts
                    </td>
                  </tr>
                )}
                {(!currentSending.contacts || currentSending.contacts.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No contacts available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Utility functions
function calculateEstimatedCompletion(
  startTime: string, 
  sentCount: number, 
  totalContacts: number,
  minInterval: number,
  maxInterval: number,
  useRandomInterval: boolean
): string {
  if (sentCount === 0) return 'Calculating...';
  
  try {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - start;
    const msPerMessage = elapsedMs / sentCount;
    const remaining = totalContacts - sentCount;
    const estimatedMs = remaining * msPerMessage;
    
    // If more than a day
    if (estimatedMs > 86400000) {
      const days = Math.ceil(estimatedMs / 86400000);
      return `~${days} day${days > 1 ? 's' : ''}`;
    }
    
    // If more than an hour
    if (estimatedMs > 3600000) {
      const hours = Math.ceil(estimatedMs / 3600000);
      return `~${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    // If more than a minute
    if (estimatedMs > 60000) {
      const minutes = Math.ceil(estimatedMs / 60000);
      return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    return 'Less than a minute';
  } catch (e) {
    return 'Calculating...';
  }
}

function calculateReadRate(sending: SendingHistory): number {
  if (!sending || !sending.contacts || sending.contacts.length === 0) return 0;
  
  const sentCount = sending.contacts.filter(c => c.sent).length;
  if (sentCount === 0) return 0;
  
  const readCount = sending.contacts.filter(c => c.read).length;
  return Math.round((readCount / sentCount) * 100);
}

function calculateReplyRate(sending: SendingHistory): number {
  if (!sending || !sending.contacts || sending.contacts.length === 0) return 0;
  
  const sentCount = sending.contacts.filter(c => c.sent).length;
  if (sentCount === 0) return 0;
  
  const repliedCount = sending.contacts.filter(c => c.responded).length;
  return Math.round((repliedCount / sentCount) * 100);
}

function formatTimestamp(timestamp: string): string {
  try {
    return format(new Date(timestamp), 'HH:mm:ss');
  } catch (e) {
    return timestamp;
  }
}

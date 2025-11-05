
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBulkSender } from '../hooks/useBulkSender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, RefreshCw, Phone, X, Filter } from 'lucide-react';
import { MessageList } from './MessageList';
import { WhatsAppMessage } from '../hooks/types/messageTypes';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function MessageActivityMonitor() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { 
    messageActivities, 
    clearSessionActivity, 
    clearAllActivities,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    sendingHistory,
    activeSessions
  } = useBulkSender();

  const [selectedSendingId, setSelectedSendingId] = useState<string>('all');
  const [filteredActivities, setFilteredActivities] = useState(messageActivities);

  // Filter activities when selectedSendingId changes
  useEffect(() => {
    if (!messageActivities) return;
    
    if (selectedSendingId === 'all') {
      setFilteredActivities(messageActivities);
    } else {
      // Find sending operation by ID
      const sending = sendingHistory?.find(s => s.id === selectedSendingId);
      if (sending) {
        // Filter activities to only show ones associated with this sending's contacts
        const phoneNumbers = sending.contacts.map(c => c.phoneNumber);
        const filtered = messageActivities.filter(activity => 
          phoneNumbers.includes(activity.phoneNumber)
        );
        setFilteredActivities(filtered);
      }
    }
  }, [selectedSendingId, messageActivities, sendingHistory]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleClearSession = (sessionId: string) => {
    if (clearSessionActivity) {
      clearSessionActivity(sessionId);
    }
  };

  const handleClearAll = () => {
    if (clearAllActivities) {
      clearAllActivities();
    }
  };

  const handleToggleMonitoring = () => {
    if (isMonitoring && stopMonitoring) {
      stopMonitoring();
    } else if (!isMonitoring && startMonitoring) {
      startMonitoring();
    }
  };

  const getSessionMessages = (sessionId: string): WhatsAppMessage[] => {
    const activity = filteredActivities?.find(activity => activity.sessionId === sessionId);
    return activity?.messages || [];
  };

  const getAllMessages = (): WhatsAppMessage[] => {
    const allMessages: WhatsAppMessage[] = [];
    
    filteredActivities?.forEach(activity => {
      if (activity && activity.messages) {
        allMessages.push(...activity.messages);
      }
    });
    
    // Sort by timestamp, newest first
    return allMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Group sessions by sessionId
  const groupedSessions = filteredActivities?.reduce((acc, activity) => {
    if (activity) {
      acc[activity.sessionId] = {
        id: activity.sessionId,
        name: activity.sessionName || activity.sessionId,
        count: activity.messages ? activity.messages.length : 0
      };
    }
    return acc;
  }, {} as Record<string, {id: string, name: string, count: number}>) || {};

  // Messages to display based on active tab
  const messagesToDisplay = activeTab === 'all' ? 
    getAllMessages() : 
    getSessionMessages(activeTab);

  // Get active sendings (those with status 'in-progress' or 'paused')
  const activeSendingOperations = sendingHistory?.filter(
    s => s.status === 'in-progress' || s.status === 'paused'
  ) || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Message Activity
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleMonitoring}
              className={isMonitoring ? "bg-primary/10" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isMonitoring ? "animate-spin" : ""}`} />
              {isMonitoring ? "Monitoring..." : "Start Monitoring"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by active sending:</span>
          </div>
          <Select
            value={selectedSendingId}
            onValueChange={setSelectedSendingId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sending operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              {activeSendingOperations.map(sending => (
                <SelectItem key={sending.id} value={sending.id}>
                  {sending.projectName || `Sending #${sending.id.substring(0, 5)}`}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {sending.sentCount}/{sending.totalContacts}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-[400px] grid-cols-4">
              <TabsTrigger value="all" className="flex items-center justify-center">
                All
                {filteredActivities && filteredActivities.length > 0 && (
                  <span className="ml-1 text-xs bg-muted px-1.5 rounded-full">
                    {getAllMessages().length}
                  </span>
                )}
              </TabsTrigger>
              
              {Object.values(groupedSessions || {}).slice(0, 3).map((session) => (
                <TabsTrigger 
                  key={session.id} 
                  value={session.id}
                  className="flex items-center justify-center"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {session.name.split(' ')[0]}
                  <span className="ml-1 text-xs bg-muted px-1.5 rounded-full">
                    {session.count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {activeTab !== 'all' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleClearSession(activeTab)}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px]">
            <TabsContent value={activeTab} className="mt-0">
              {messagesToDisplay && messagesToDisplay.length > 0 ? (
                <MessageList messages={messagesToDisplay} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Monitor className="h-12 w-12 mb-2 opacity-20" />
                  <p>No messages to display</p>
                  {!isMonitoring && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={handleToggleMonitoring}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Monitoring
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

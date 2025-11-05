
import React, { useState } from 'react';
import { useBulkSender } from '../hooks/useBulkSender';
import { MessageTemplateStats, SendingHistory as SendingHistoryType } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendingProgress } from './SendingProgress';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export function SendingHistory() {
  const { sendingHistory, getTopPerformingTemplates } = useBulkSender();
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(
    sendingHistory.length > 0 ? sendingHistory[0].id : null
  );
  
  const activeHistory = sendingHistory.find(h => h.id === activeHistoryId);
  
  const templates = activeHistory ? Object.values(activeHistory.templateStats || {}).map(template => ({
    id: String(Math.random()), // Generate a unique ID
    content: template.content,
    sent: template.sent,
    delivered: template.delivered,
    read: template.read,
    responses: template.responses,
    sentCount: template.sent,
    deliveredCount: template.delivered,
    readCount: template.read,
    responseCount: template.responses,
    deliveryRate: template.sent > 0 ? Math.round((template.delivered / template.sent) * 100) : 0,
    readRate: template.delivered > 0 ? Math.round((template.read / template.delivered) * 100) : 0,
    responseRate: template.read > 0 ? Math.round((template.responses / template.read) * 100) : 0,
    lastUsed: new Date().toISOString()
  })) : [];

  // Handle case when no history is available
  if (sendingHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No sending history yet</h3>
          <p className="text-muted-foreground">
            Your message sending history will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sending History</h2>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">History List</TabsTrigger>
          <TabsTrigger value="templates">Template Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
          {sendingHistory.map((history) => (
            <Card 
              key={history.id} 
              className={`cursor-pointer hover:border-primary transition-colors ${
                history.id === activeHistoryId ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setActiveHistoryId(history.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {history.projectName || `Sending ${formatDistanceToNow(new Date(history.startTime), { addSuffix: true })}`}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {history.status === 'in-progress' && (
                      <Button variant="outline" size="sm">Resume</Button>
                    )}
                    {history.status === 'paused' && (
                      <Button variant="outline" size="sm">Resume</Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {new Date(history.startTime).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SendingProgress 
                  sentCount={history.sentCount}
                  totalContacts={history.totalContacts}
                  failedCount={history.failedCount}
                  status={history.status}
                />
                
                <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">{history.totalContacts}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sent:</span>
                    <div className="font-medium">{history.sentCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed:</span>
                    <div className="font-medium">{history.failedCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium capitalize">{history.status}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6 mt-4">
          <div className="grid gap-4">
            {templates.length > 0 ? (
              templates.map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{template.content}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Rate</h4>
                        <p className="text-2xl font-bold">{template.deliveryRate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {template.delivered}/{template.sent} messages
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Read Rate</h4>
                        <p className="text-2xl font-bold">{template.readRate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {template.read}/{template.delivered} messages
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Response Rate</h4>
                        <p className="text-2xl font-bold">{template.responseRate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {template.responses}/{template.read} messages
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No template statistics available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

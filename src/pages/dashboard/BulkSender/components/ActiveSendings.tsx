
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useBulkSender } from '../hooks/useBulkSender';
import { SendingHistory } from '../hooks/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { SendingProgress } from './SendingProgress';
import { MessageList } from './MessageList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ActiveSendings() {
  const { sendingHistory } = useBulkSender();
  const [selectedSending, setSelectedSending] = useState<SendingHistory | null>(null);
  
  // Generate some demo sending operations if none exist
  const demoSendings: SendingHistory[] = [
    {
      id: '5991',
      projectName: 'Demo Sending 1',
      messageTemplates: ['Hello, this is a test message'],
      startTime: new Date(Date.now() - 3600000).toISOString(),
      status: 'in-progress',
      totalContacts: 7,
      sentCount: 2,
      failedCount: 0,
      selectedContacts: ['+1234567890', '+2345678901', '+3456789012'],
      contacts: [
        { phoneNumber: '+1234567890', sent: true, sentAt: new Date().toISOString(), responded: true },
        { phoneNumber: '+2345678901', sent: true, sentAt: new Date().toISOString(), responded: false },
      ],
      config: {
        useRandomInterval: true,
        minInterval: 30,
        maxInterval: 60
      },
      scheduleDate: new Date().toISOString().split('T')[0],
      scheduleTime: "12:00"
    },
    {
      id: '2765',
      projectName: 'Demo Sending 2',
      messageTemplates: ['Another test message'],
      startTime: new Date(Date.now() - 7200000).toISOString(),
      status: 'in-progress',
      totalContacts: 7,
      sentCount: 1,
      failedCount: 0,
      selectedContacts: Array(7).fill(0).map((_, i) => `+${i}123456789`),
      contacts: [
        { phoneNumber: '+0123456789', sent: true, sentAt: new Date().toISOString(), responded: false }
      ],
      config: {
        useRandomInterval: false,
        minInterval: 45,
        maxInterval: 45
      }
    },
    {
      id: '2481',
      projectName: 'Demo Sending 3',
      messageTemplates: ['Third test message'],
      startTime: new Date(Date.now() - 10800000).toISOString(),
      status: 'in-progress',
      totalContacts: 7,
      sentCount: 3,
      failedCount: 0,
      selectedContacts: Array(7).fill(0).map((_, i) => `+${i}987654321`),
      contacts: Array(3).fill(0).map((_, i) => ({ 
        phoneNumber: `+${i}987654321`, 
        sent: true, 
        sentAt: new Date().toISOString(),
        responded: i === 0
      })),
      config: {
        useRandomInterval: true,
        minInterval: 20,
        maxInterval: 50
      }
    },
    {
      id: '001c',
      projectName: 'Demo Sending 4',
      messageTemplates: ['Fourth test message'],
      startTime: new Date(Date.now() - 14400000).toISOString(),
      status: 'paused',
      totalContacts: 7,
      sentCount: 1,
      failedCount: 0,
      selectedContacts: Array(7).fill(0).map((_, i) => `+${i}567891234`),
      contacts: [
        { phoneNumber: '+0567891234', sent: true, sentAt: new Date().toISOString(), responded: false }
      ],
      config: {
        useRandomInterval: false,
        minInterval: 60,
        maxInterval: 60
      }
    }
  ];
  
  // For demo purposes, merge with any real sending operations
  const activeSendings = (sendingHistory && sendingHistory.length > 0) ? 
    sendingHistory.filter(sending => sending.status === 'in-progress' || sending.status === 'paused')
    : demoSendings;
  
  if (!activeSendings || activeSendings.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <p>No active sending operations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSendingClick = (sending: SendingHistory) => {
    setSelectedSending(sending);
  };

  const closeDialog = () => {
    setSelectedSending(null);
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">Active Sendings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeSendings.map((sending) => (
          <ActiveSendingCard 
            key={sending.id} 
            sending={sending} 
            onClick={() => handleSendingClick(sending)}
          />
        ))}
      </div>

      {/* Sending Details Dialog */}
      <Dialog open={selectedSending !== null} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-w-4xl">
          {selectedSending && (
            <>
              <DialogHeader>
                <DialogTitle>Sending #{selectedSending.id.substring(0, 4)} Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedSending.projectName}</h2>
                    <p className="text-muted-foreground">
                      Started {format(new Date(selectedSending.startTime), 'PPpp')}
                    </p>
                  </div>
                  <Badge className={selectedSending.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                    {selectedSending.status === 'paused' ? 'Paused' : 'Active'}
                  </Badge>
                </div>

                <SendingProgress 
                  sentCount={selectedSending.sentCount} 
                  totalContacts={selectedSending.totalContacts} 
                  failedCount={selectedSending.failedCount}
                  status={selectedSending.status}
                />

                <Tabs defaultValue="contacts">
                  <TabsList className="w-full">
                    <TabsTrigger value="contacts">Contact Details</TabsTrigger>
                    <TabsTrigger value="messages">Message Templates</TabsTrigger>
                    <TabsTrigger value="settings">Sending Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="contacts" className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
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
                              {selectedSending.contacts && selectedSending.contacts.map((contact, index) => (
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
                                    {contact.sentAt ? format(new Date(contact.sentAt), 'HH:mm:ss') : '-'}
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
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="messages" className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
                        <h3 className="text-lg font-medium mb-4">Message Templates</h3>
                        <div className="space-y-4">
                          {selectedSending.messageTemplates && selectedSending.messageTemplates.map((template, index) => (
                            <div key={index} className="bg-muted p-4 rounded-md">
                              <p className="whitespace-pre-wrap">{template}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium">Sending Interval</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedSending.config?.useRandomInterval 
                                ? `${selectedSending.config.minInterval}-${selectedSending.config.maxInterval} seconds (random)`
                                : `${selectedSending.config?.minInterval || 30} seconds (fixed)`}
                            </p>
                          </div>
                          
                          {selectedSending.scheduleDate && selectedSending.scheduleTime && (
                            <div className="space-y-1">
                              <h3 className="text-sm font-medium">Scheduled For</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(selectedSending.scheduleDate), 'PP')} at {selectedSending.scheduleTime}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeDialog}>Close</Button>
                  <Button>View in Bulk Sender</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ActiveSendingCardProps {
  sending: SendingHistory;
  onClick: () => void;
}

function ActiveSendingCard({ sending, onClick }: ActiveSendingCardProps) {
  const sentCount = sending.sentCount || 0;
  const totalContacts = sending.totalContacts || 0;
  const progress = totalContacts > 0 ? Math.round((sentCount / totalContacts) * 100) : 0;
  
  // Format ID to be shorter
  const shortId = sending.id.substring(0, 4);
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Badge variant="outline" className={sending.status === 'paused' ? 'bg-yellow-100' : 'bg-green-100'}>
              {sending.status === 'paused' ? 'Paused' : 'Active'}
            </Badge>
            <h4 className="font-medium mt-2">Sending #{shortId}</h4>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-sm font-medium">
            {sentCount}/{totalContacts}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


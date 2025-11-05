
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WhatsAppMessage } from '../hooks/types/messageTypes';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';

interface MessageListProps {
  messages: WhatsAppMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return (
      <div className="text-center p-4">
        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">No messages to display</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}

interface MessageItemProps {
  message: WhatsAppMessage;
}

function MessageItem({ message }: MessageItemProps) {
  const isInbound = message.direction === 'inbound';
  
  return (
    <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isInbound ? 'bg-muted' : 'bg-primary/10'} p-3 rounded-lg`}>
        <div className="flex items-center gap-2 mb-1">
          {isInbound ? (
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ArrowRight className="h-4 w-4 text-primary" />
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'HH:mm:ss')}
          </span>
          {message.sentiment && (
            <Badge 
              variant="outline"
              className={
                message.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                message.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }
            >
              {message.sentiment}
            </Badge>
          )}
          <Badge variant="outline">
            {message.status}
          </Badge>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        {message.media && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {message.media.type}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

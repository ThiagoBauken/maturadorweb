
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';

interface SendingProgressProps {
  sentCount: number;
  totalContacts: number;
  failedCount: number;
  status: string;
}

export function SendingProgress({ sentCount, totalContacts, failedCount, status }: SendingProgressProps) {
  const progressPercentage = totalContacts > 0 ? Math.round((sentCount / totalContacts) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{sentCount} of {totalContacts} sent</span>
          {status === 'paused' && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Pause className="mr-1 h-3 w-3" />
              Paused
            </Badge>
          )}
          {status === 'in-progress' && (
            <Badge className="bg-green-100 text-green-800">
              <Play className="mr-1 h-3 w-3" />
              Sending
            </Badge>
          )}
        </div>
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      {failedCount > 0 && (
        <div className="text-sm text-red-500">
          {failedCount} message{failedCount !== 1 ? 's' : ''} failed to send
        </div>
      )}
    </div>
  );
}

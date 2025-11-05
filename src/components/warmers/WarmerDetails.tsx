
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Flame, Pause, Play, Trash, Zap, Users, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export interface WarmerStats {
  id: string;
  name: string;
  type: 'number-to-number' | 'number-to-group' | 'standard-warmer' | 'advanced-warmer';
  status: 'active' | 'paused' | 'completed' | 'error';
  targetCount: number;
  completedCount: number;
  progress: number;
  startDate: string;
  lastRun: string;
  account?: string;
  group?: string;
  groupName?: string;
  nextRun?: string;
  isStandard?: boolean;
  configuration?: {
    useAI?: boolean;
    messageTemplates?: string[];
    mediaEnabled?: boolean;
    mediaTypes?: ('image' | 'video' | 'audio' | 'sticker')[];
    delayMin?: number;
    delayMax?: number;
    numberRotation?: boolean;
    aiProvider?: 'deepseek' | 'openai';
    aiPrompt?: string;
    typingIndicator?: boolean;
    readReceipts?: boolean;
    randomEmojis?: boolean;
    schedule?: {
      days: string[];
      timeRanges: { start: string; end: string }[];
    };
  };
}

interface WarmerDetailsProps {
  warmer: WarmerStats;
  onDelete?: (id: string) => void;
  onTogglePause?: (id: string, currentStatus: string) => void;
  onEdit?: (id: string) => void;
  onRestart?: (id: string) => void;
  className?: string;
}

export function WarmerDetails({ 
  warmer, 
  onDelete, 
  onTogglePause,
  onEdit,
  onRestart,
  className = ''
}: WarmerDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTogglePause = () => {
    if (onTogglePause) {
      onTogglePause(warmer.id, warmer.status);
    } else {
      const newStatus = warmer.status === 'active' ? 'paused' : 'active';
      toast.success(`Warmer ${newStatus === 'active' ? 'activated' : 'paused'}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(warmer.id);
    } else {
      toast.success('Warmer deleted');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(warmer.id);
    }
  };

  const handleRestart = () => {
    if (onRestart) {
      onRestart(warmer.id);
    } else {
      toast.success('Warmer restarted');
    }
  };

  const getTypeIcon = () => {
    if (warmer.type === 'number-to-group' || warmer.type.includes('group')) {
      return <Users className="h-5 w-5 text-purple-500" />;
    } else if (warmer.type === 'standard-warmer' || warmer.isStandard) {
      return <Flame className="h-5 w-5 text-green-500" />;
    } else {
      return <Flame className="h-5 w-5 text-orange-500" />;
    }
  };

  const getTypeLabel = () => {
    if (warmer.type === 'number-to-group' || warmer.type.includes('group')) {
      return 'Group Warmer';
    } else if (warmer.type === 'standard-warmer' || warmer.isStandard) {
      return 'Standard Warmer';
    } else {
      return 'Advanced Warmer';
    }
  };

  // Render configuration badges if available
  const renderConfigurationBadges = () => {
    if (!warmer.configuration) return null;
    
    const badges = [];
    
    if (warmer.configuration.useAI) {
      badges.push(
        <Badge key="ai" variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          AI Enabled
        </Badge>
      );
    }
    
    if (warmer.configuration.mediaEnabled) {
      badges.push(
        <Badge key="media" variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
          Media
        </Badge>
      );
    }
    
    if (warmer.configuration.numberRotation) {
      badges.push(
        <Badge key="rotation" variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          Number Rotation
        </Badge>
      );
    }
    
    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-2">
        {badges}
      </div>
    ) : null;
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon()}
              {warmer.name}
            </CardTitle>
            <CardDescription>
              {getTypeLabel()}
              {warmer.groupName && (warmer.type === 'number-to-group' || warmer.type.includes('group')) && (
                <span className="ml-1">• Group: {warmer.groupName}</span>
              )}
            </CardDescription>
            {renderConfigurationBadges()}
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(warmer.status)} text-white border-0`}
          >
            {warmer.status.charAt(0).toUpperCase() + warmer.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{warmer.progress}%</span>
            </div>
            <Progress value={warmer.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{warmer.completedCount} of {warmer.targetCount} messages</span>
              {warmer.nextRun && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Next: {warmer.nextRun}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Started</div>
                <div className="text-muted-foreground">
                  {new Date(warmer.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Last Activity</div>
                <div className="text-muted-foreground">
                  {new Date(warmer.lastRun).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>

          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {warmer.status === 'completed' && onRestart && (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleRestart}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          )}

          {warmer.status !== 'completed' && (
            <Button 
              variant={warmer.status === 'active' ? 'outline' : 'default'}
              size="sm"
              onClick={handleTogglePause}
              disabled={warmer.status === 'error'}
            >
              {warmer.status === 'active' ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

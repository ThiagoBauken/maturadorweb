
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'processing';

export interface StatusItem {
  id: string;
  status: StatusType;
  title: string;
  description?: string;
  timestamp?: string;
  progress?: number;
  meta?: Record<string, any>;
}

export interface StatusMonitorProps {
  items?: StatusItem[];
  title?: string;
  showProgress?: boolean;
  showTimestamp?: boolean;
  onItemClick?: (item: StatusItem) => void;
  emptyMessage?: string;
  className?: string;
  renderExtraContent?: (item: StatusItem) => React.ReactNode;
  children?: React.ReactNode;
}

export function StatusMonitor({
  items = [],
  title = 'Status Monitor',
  showProgress = true,
  showTimestamp = true,
  onItemClick,
  emptyMessage = 'No status items to display',
  className,
  renderExtraContent,
  children
}: StatusMonitorProps) {
  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-indigo-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: StatusType): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: StatusType) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      
      {items.length === 0 && !children ? (
        <Alert variant="default">
          <AlertTitle>No Items</AlertTitle>
          <AlertDescription>{emptyMessage}</AlertDescription>
        </Alert>
      ) : (
        <>
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "border rounded-md p-4 transition-all",
                    onItemClick ? "cursor-pointer hover:bg-accent/50" : ""
                  )}
                  onClick={() => onItemClick && onItemClick(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h4 className="text-sm font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>

                  {showProgress && typeof item.progress === 'number' && (
                    <div className="mt-3">
                      <Progress value={item.progress} className="h-2" />
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-muted-foreground">{item.progress}%</span>
                      </div>
                    </div>
                  )}

                  {renderExtraContent && renderExtraContent(item)}

                  {showTimestamp && item.timestamp && (
                    <div className="flex items-center mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {children}
        </>
      )}
    </div>
  );
}


import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TimeRange {
  start: string;
  end: string;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
}

export function TimeRangePicker({
  value,
  onChange,
  onRemove,
  showRemoveButton = false,
  className,
}: TimeRangePickerProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, start: e.target.value });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, end: e.target.value });
  };

  return (
    <div className={cn('flex items-end gap-2', className)}>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="start-time">Start Time</Label>
        <div className="relative">
          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="start-time"
            type="time"
            value={value.start}
            onChange={handleStartChange}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid w-full gap-1.5">
        <Label htmlFor="end-time">End Time</Label>
        <div className="relative">
          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="end-time"
            type="time"
            value={value.end}
            onChange={handleEndChange}
            className="pl-8"
          />
        </div>
      </div>

      {showRemoveButton && onRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          className="h-10 w-10 shrink-0 rounded-md border border-input"
        >
          ✕
        </Button>
      )}
    </div>
  );
}

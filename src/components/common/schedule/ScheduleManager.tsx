
import React from 'react';
import { ScheduleBuilder, type ScheduleConfig } from './ScheduleBuilder';
import { type Day } from './WeekdaySelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScheduleManagerProps {
  value: ScheduleConfig;
  onChange: (value: ScheduleConfig) => void;
  className?: string;
}

export function ScheduleManager({ value, onChange, className }: ScheduleManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Format the schedule for display
  const formatScheduleSummary = (schedule: ScheduleConfig) => {
    if (schedule.days.length === 0 || schedule.timeRanges.length === 0) {
      return 'No schedule configured';
    }

    const daysSummary =
      schedule.days.length === 7
        ? 'Every day'
        : schedule.days
            .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
            .join(', ');

    const timeRangesSummary = schedule.timeRanges
      .map((tr) => `${tr.start} - ${tr.end}`)
      .join(', ');

    return `${daysSummary}: ${timeRangesSummary}`;
  };

  const activeSchedule = value.days.length > 0 && value.timeRanges.length > 0;

  return (
    <div className={cn('w-full rounded-md border', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between rounded-none p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Schedule</div>
                <div className="text-sm text-muted-foreground">
                  {formatScheduleSummary(value)}
                </div>
              </div>
            </div>
            {activeSchedule && (
              <Badge variant="secondary" className="mr-2">
                Active
              </Badge>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          <ScheduleBuilder value={value} onChange={onChange} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

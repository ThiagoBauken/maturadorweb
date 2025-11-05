
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeekdaySelector, DAYS_OF_WEEK, type Day } from './WeekdaySelector';
import { TimeRangePicker, type TimeRange } from './TimeRangePicker';
import { cn } from '@/lib/utils';

export interface ScheduleConfig {
  days: Day[];
  timeRanges: TimeRange[];
}

interface ScheduleBuilderProps {
  value: ScheduleConfig;
  onChange: (value: ScheduleConfig) => void;
  className?: string;
}

export function ScheduleBuilder({ value, onChange, className }: ScheduleBuilderProps) {
  const handleDaysChange = (days: Day[]) => {
    onChange({ ...value, days });
  };

  const handleTimeRangeChange = (index: number, timeRange: TimeRange) => {
    const newTimeRanges = [...value.timeRanges];
    newTimeRanges[index] = timeRange;
    onChange({ ...value, timeRanges: newTimeRanges });
  };

  const addTimeRange = () => {
    onChange({
      ...value,
      timeRanges: [...value.timeRanges, { start: '09:00', end: '17:00' }],
    });
  };

  const removeTimeRange = (index: number) => {
    const newTimeRanges = [...value.timeRanges];
    newTimeRanges.splice(index, 1);
    onChange({ ...value, timeRanges: newTimeRanges });
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Schedule Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Active Days</h3>
          <WeekdaySelector selectedDays={value.days} onChange={handleDaysChange} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Time Ranges</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addTimeRange}
              disabled={value.timeRanges.length >= 5}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Time Range
            </Button>
          </div>

          <div className="space-y-3">
            {value.timeRanges.map((timeRange, index) => (
              <TimeRangePicker
                key={index}
                value={timeRange}
                onChange={(newRange) => handleTimeRangeChange(index, newRange)}
                onRemove={() => removeTimeRange(index)}
                showRemoveButton={value.timeRanges.length > 1}
              />
            ))}
            {value.timeRanges.length === 0 && (
              <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No time ranges added</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={addTimeRange}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Range
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

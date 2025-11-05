
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const SHORT_DAYS: Record<Day, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface WeekdaySelectorProps {
  selectedDays: Day[];
  onChange: (days: Day[]) => void;
  className?: string;
}

export function WeekdaySelector({ selectedDays, onChange, className }: WeekdaySelectorProps) {
  const toggleDay = (day: Day) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {DAYS_OF_WEEK.map((day) => (
        <Button
          key={day}
          type="button"
          size="sm"
          variant={selectedDays.includes(day) ? 'default' : 'outline'}
          onClick={() => toggleDay(day)}
          className="w-10 p-0"
        >
          {SHORT_DAYS[day]}
        </Button>
      ))}
    </div>
  );
}

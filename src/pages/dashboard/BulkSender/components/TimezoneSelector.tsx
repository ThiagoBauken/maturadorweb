
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { COMMON_TIMEZONES, getCurrentTimezone, formatDateForTimezone } from '../utils/timezoneUtils';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  showCurrentTime?: boolean;
}

export function TimezoneSelector({ value, onChange, showCurrentTime = true }: TimezoneSelectorProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [browserTimezone, setBrowserTimezone] = useState<string>('');
  
  // Set initial timezone from browser if not provided
  useEffect(() => {
    if (!value) {
      const detected = getCurrentTimezone();
      onChange(detected);
    }
    
    setBrowserTimezone(getCurrentTimezone());
  }, [value, onChange]);
  
  // Update current time periodically
  useEffect(() => {
    const updateTime = () => {
      if (value) {
        setCurrentTime(formatDateForTimezone(new Date(), value));
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [value]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="timezone-select">Timezone</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="timezone-select" className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {/* Default to browser timezone */}
          <SelectItem value={browserTimezone} className="font-medium">
            {browserTimezone} (Browser Timezone)
          </SelectItem>
          
          {/* Show all common timezones */}
          {COMMON_TIMEZONES.map(tz => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showCurrentTime && currentTime && (
        <div className="text-xs text-muted-foreground">
          Current time: {currentTime}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useBulkSender } from '../hooks/useBulkSender';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TimeSlotSelector, TimeSlot } from './TimeSlotSelector';
import { formatDistanceToNow, format } from 'date-fns';
import { TimezoneSelector } from './TimezoneSelector';
import { calculateScheduleForTimezone } from '../utils/timezoneUtils';

export function ScheduleSettings() {
  const {
    scheduleEnabled,
    setScheduleEnabled,
    scheduleTime,
    setScheduleTime,
    scheduleDate,
    setScheduleDate,
    timeSlots,
    setTimeSlots,
    timezone,
    setTimezone
  } = useBulkSender();
  
  // Generate a descriptive message about when the messages will be sent
  const getSendingDescription = () => {
    if (!scheduleEnabled) {
      return 'Messages will be sent immediately when you click Send';
    }
    
    if (!scheduleDate || !scheduleTime) {
      return 'Please select a date and time for scheduling';
    }
    
    try {
      // Parse the schedule date and time
      let displayDate = scheduleDate;
      // Convert from yyyy-MM-dd to dd/MM/yyyy if needed
      if (scheduleDate.includes('-')) {
        const [year, month, day] = scheduleDate.split('-');
        displayDate = `${day}/${month}/${year}`;
      }
      
      const scheduledDate = new Date(`${scheduleDate}T${scheduleTime}`);
      
      // If timezone is selected, show that time instead
      if (timezone) {
        const adjustedDate = calculateScheduleForTimezone(scheduleTime, scheduleDate, timezone);
        return `Messages will be sent about ${formatDistanceToNow(adjustedDate)} from now (${timezone})`;
      }
      
      return `Messages will be sent ${formatDistanceToNow(scheduledDate)} from now`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid date or time selected';
    }
  };
  
  // Set default date if not set
  const setDefaultDateIfNeeded = () => {
    if (!scheduleDate) {
      setScheduleDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  // Set default time if not set
  const setDefaultTimeIfNeeded = () => {
    if (!scheduleTime) {
      // Default to current time + 5 minutes, rounded to nearest 5 minutes
      const now = new Date();
      const minutes = Math.ceil((now.getMinutes() + 5) / 5) * 5;
      const hours = now.getHours() + (minutes >= 60 ? 1 : 0);
      const adjustedMinutes = minutes % 60;
      
      setScheduleTime(`${hours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`);
    }
  };
  
  // Handle enabling schedule
  const handleScheduleToggle = (enabled: boolean) => {
    setScheduleEnabled(enabled);
    if (enabled) {
      setDefaultDateIfNeeded();
      setDefaultTimeIfNeeded();
    }
  };
  
  // Generate time slots for a week
  const generateWeeklySchedule = () => {
    // Time slots for a typical business week
    const newTimeSlots: TimeSlot[] = [
      { id: 'mon-morning', startTime: '09:00', endTime: '12:00' },
      { id: 'mon-afternoon', startTime: '14:00', endTime: '17:00' },
      { id: 'tue-morning', startTime: '09:00', endTime: '12:00' },
      { id: 'tue-afternoon', startTime: '14:00', endTime: '17:00' },
      { id: 'wed-morning', startTime: '09:00', endTime: '12:00' },
      { id: 'wed-afternoon', startTime: '14:00', endTime: '17:00' },
      { id: 'thu-morning', startTime: '09:00', endTime: '12:00' },
      { id: 'thu-afternoon', startTime: '14:00', endTime: '17:00' },
      { id: 'fri-morning', startTime: '09:00', endTime: '12:00' },
      { id: 'fri-afternoon', startTime: '14:00', endTime: '16:00' },
    ];
    
    setTimeSlots(newTimeSlots);
  };
  
  // Format the date for display
  const formatDateForInput = (dateStr: string) => {
    // If already in yyyy-MM-dd format, return as is
    if (dateStr.includes('-')) return dateStr;
    
    // Otherwise convert dd/MM/yyyy to yyyy-MM-dd
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  // Format the date for display
  const formatDateForDisplay = (dateStr: string) => {
    // If in dd/MM/yyyy format, return as is
    if (dateStr.includes('/')) return dateStr;
    
    // Otherwise convert yyyy-MM-dd to dd/MM/yyyy
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
  useEffect(() => {
    // Set default timezone if not set
    if (!timezone) {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(browserTz);
    }
  }, [timezone, setTimezone]);
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch 
            id="schedule-toggle" 
            checked={scheduleEnabled}
            onCheckedChange={handleScheduleToggle}
          />
          <Label htmlFor="schedule-toggle">Schedule sending for later</Label>
        </div>
        
        {scheduleEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input 
                id="schedule-date"
                type="date"
                value={formatDateForInput(scheduleDate)}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Input 
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <TimezoneSelector
                value={timezone}
                onChange={setTimezone}
                showCurrentTime={true}
              />
            </div>
            
            <div className="md:col-span-2 bg-muted p-3 rounded-md">
              <p className="text-sm">{getSendingDescription()}</p>
            </div>
          </div>
        )}
      </div>
      
      {scheduleEnabled && (
        <div className="space-y-4 border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">Advanced Time Slots</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateWeeklySchedule}
            >
              Generate Business Week Schedule
            </Button>
          </div>
          
          <TimeSlotSelector
            timeSlots={timeSlots}
            onChange={setTimeSlots}
          />
        </div>
      )}
    </div>
  );
}

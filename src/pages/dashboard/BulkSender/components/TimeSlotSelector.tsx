
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  disabled?: boolean;
  value?: TimeSlot[]; // Add optional value prop for backward compatibility
}

export function TimeSlotSelector({ timeSlots = [], onChange, disabled = false, value }: TimeSlotSelectorProps) {
  // Use value prop if provided, otherwise use timeSlots
  const slots = value || timeSlots;
  
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('18:00');

  const validateTimes = (): boolean => {
    if (!isValidTimeFormat(newStartTime)) {
      toast.error('Invalid start time format. Use HH:MM format.');
      return false;
    }

    if (!isValidTimeFormat(newEndTime)) {
      toast.error('Invalid end time format. Use HH:MM format.');
      return false;
    }

    if (newStartTime >= newEndTime) {
      toast.error('Start time must be before end time');
      return false;
    }

    if (hasOverlap(newStartTime, newEndTime, timeSlots)) {
      toast.error('Time slot overlaps with existing slots');
      return false;
    }

    return true;
  };

  const addTimeSlot = () => {
    if (!validateTimes()) return;

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: newStartTime,
      endTime: newEndTime
    };

    onChange([...(timeSlots || []), newSlot]);
    toast.success('Time slot added');
  };

  const removeTimeSlot = (id: string) => {
    onChange((timeSlots || []).filter(slot => slot.id !== id));
  };

  const isValidTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  const getTimeLabel = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      return new Date(2022, 0, 1, hours, minutes).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time;
    }
  };

  const hasOverlap = (start: string, end: string, slots: TimeSlot[] = []): boolean => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const newStartMinutes = startHour * 60 + startMinute;
    const newEndMinutes = endHour * 60 + endMinute;

    return slots.some(slot => {
      const [slotStartHour, slotStartMinute] = slot.startTime.split(':').map(Number);
      const [slotEndHour, slotEndMinute] = slot.endTime.split(':').map(Number);
      const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
      const slotEndMinutes = slotEndHour * 60 + slotEndMinute;

      // Check if there's any overlap
      return (
        (newStartMinutes >= slotStartMinutes && newStartMinutes < slotEndMinutes) ||
        (newEndMinutes > slotStartMinutes && newEndMinutes <= slotEndMinutes) ||
        (newStartMinutes <= slotStartMinutes && newEndMinutes >= slotEndMinutes)
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Active Time Slots</Label>
        {!slots || slots.length === 0 ? (
          <div className="text-sm text-muted-foreground italic border border-dashed p-4 rounded-md text-center">
            No time slots added. Messages will be sent at any time.
          </div>
        ) : (
          <div className="grid gap-2">
            {slots.map((slot) => (
              <div 
                key={slot.id} 
                className="flex items-center justify-between p-2 border rounded-md bg-muted"
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {getTimeLabel(slot.startTime)} to {getTimeLabel(slot.endTime)}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeTimeSlot(slot.id)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="start-time" className="text-xs">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="end-time" className="text-xs">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={newEndTime}
            onChange={(e) => setNewEndTime(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={addTimeSlot} 
            disabled={disabled} 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

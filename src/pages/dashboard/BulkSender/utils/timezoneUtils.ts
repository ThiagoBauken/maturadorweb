
// List of common timezones
export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New York (EDT/EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PDT/PST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CDT/CST)' },
  { value: 'America/Sao_Paulo', label: 'America/São Paulo (BRT)' },
  { value: 'Europe/London', label: 'Europe/London (BST/GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CEST/CET)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CEST/CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
];

// Get current timezone from browser
export function getCurrentTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC'; // Fallback
  }
}

// Format date for display in the specified timezone
export function formatDateForTimezone(date: Date, timezone: string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      hour12: false
    }).format(date);
  } catch (e) {
    console.error('Error formatting date for timezone:', e);
    return date.toISOString();
  }
}

// Convert a date from one timezone to another
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  try {
    // Get the time in milliseconds in the given timezone
    const fromOffset = getTimezoneOffset(date, fromTimezone);
    const toOffset = getTimezoneOffset(date, toTimezone);
    
    // Apply the offset difference
    const offsetDiff = toOffset - fromOffset;
    return new Date(date.getTime() + offsetDiff);
  } catch (e) {
    console.error('Error converting timezone:', e);
    return date;
  }
}

// Get timezone offset in milliseconds for a date in a specific timezone
function getTimezoneOffset(date: Date, timezone: string): number {
  try {
    // Format the date in the given timezone and UTC
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    
    // Parse the formatted date back to a Date object
    const parts = formatter.formatToParts(date);
    const formatted: Record<string, string> = {};
    parts.forEach(part => {
      if (part.type !== 'literal') {
        formatted[part.type] = part.value;
      }
    });
    
    const year = parseInt(formatted.year, 10);
    const month = parseInt(formatted.month, 10) - 1; // Months are 0-indexed
    const day = parseInt(formatted.day, 10);
    const hour = parseInt(formatted.hour, 10);
    const minute = parseInt(formatted.minute, 10);
    const second = parseInt(formatted.second, 10);
    
    // Create a new date in UTC using the components from the formatted date
    const utcDate = Date.UTC(year, month, day, hour, minute, second);
    
    // Return the difference between UTC time and the timezone's local time
    return date.getTime() - utcDate;
  } catch (e) {
    console.error('Error getting timezone offset:', e);
    return 0;
  }
}

// Calculate a schedule in the target timezone
export function calculateScheduleForTimezone(scheduleTime: string, scheduleDate: string, timezone: string): Date {
  try {
    // Parse the schedule time and date
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const [year, month, day] = scheduleDate.split('-').map(Number);
    
    // Create date in target timezone
    const targetDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Adjust for the timezone
    const offset = getTimezoneOffset(targetDate, timezone);
    return new Date(targetDate.getTime() - offset);
  } catch (e) {
    console.error('Error calculating schedule for timezone:', e);
    return new Date();
  }
}

// Get a list of timezones with their current time
export function getTimezonesWithCurrentTime(): Array<{ value: string, label: string, currentTime: string }> {
  const now = new Date();
  
  return COMMON_TIMEZONES.map(tz => ({
    value: tz.value,
    label: tz.label,
    currentTime: formatDateForTimezone(now, tz.value)
  }));
}

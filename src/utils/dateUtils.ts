
import { 
  format, 
  formatDistance, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  differenceInDays,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';

/**
 * Format a date for display
 */
export const formatDate = (date: Date | number): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Format a time for display
 */
export const formatTime = (date: Date | number): string => {
  return format(date, 'h:mm a');
};

/**
 * Format a date and time for display
 */
export const formatDateTime = (date: Date | number): string => {
  return format(date, 'MMM d, yyyy, h:mm a');
};

/**
 * Format a relative date (e.g. "2 days ago", "in 3 days")
 */
export const formatRelativeDate = (date: Date | number): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  
  const days = differenceInDays(date, new Date());
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  } else {
    return `in ${days} days`;
  }
};

/**
 * Format review due date
 */
export const formatDueDate = (date: Date | number): string => {
  if (isToday(date)) return 'Due today';
  if (isTomorrow(date)) return 'Due tomorrow';
  
  const days = differenceInDays(date, new Date());
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
  } else {
    return `Due in ${days} day${days > 1 ? 's' : ''}`;
  }
};

/**
 * Format study time duration
 */
export const formatStudyTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get date ranges for filtering statistics
 */
export const getDateRanges = () => {
  const now = new Date();
  
  return {
    today: {
      start: startOfDay(now),
      end: endOfDay(now)
    },
    thisWeek: {
      start: startOfWeek(now),
      end: endOfWeek(now)
    },
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now)
    }
  };
};

/**
 * Create daily date labels for charts
 */
export const getDailyLabels = (start: Date, end: Date): string[] => {
  const days = eachDayOfInterval({ start, end });
  return days.map(day => format(day, 'MMM d'));
};

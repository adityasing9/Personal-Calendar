import { format, parseISO, isValid } from 'date-fns';

export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  const displayMinutes = String(m || 0).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export function getRelativeDayLabel(dateStr: string, baseDateStr?: string): string {
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  base.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  return formatShortDate(dateStr);
}

export function getGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours < 12) return 'Good morning';
  if (hours < 17) return 'Good afternoon';
  return 'Good evening';
}

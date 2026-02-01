import type { RecurrenceRule } from '../types.js';

/**
 * Parse a recurrence rule from JSON string
 */
export function parseRecurrenceRule(ruleString: string | null): RecurrenceRule | null {
  if (!ruleString) return null;

  try {
    const parsed = JSON.parse(ruleString);
    // Validate it has at least a frequency
    if (!parsed.frequency || !['daily', 'weekly', 'monthly'].includes(parsed.frequency)) {
      return null;
    }
    return parsed as RecurrenceRule;
  } catch (error) {
    return null;
  }
}

/**
 * Stringify a recurrence rule to JSON
 */
export function stringifyRecurrenceRule(rule: RecurrenceRule): string {
  return JSON.stringify(rule);
}

/**
 * Generate the next instance date based on a recurrence rule
 */
export function generateNextInstanceDate(
  rule: RecurrenceRule,
  fromDate: Date
): Date | null {
  const interval = rule.interval || 1;
  const nextDate = new Date(fromDate);

  switch (rule.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      // If daysOfWeek is specified, find next matching day
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const currentDay = nextDate.getDay();
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);

        // Find next day in the same week
        const nextDayInWeek = sortedDays.find(day => day > currentDay);

        if (nextDayInWeek !== undefined) {
          // Next occurrence is in the same week
          nextDate.setDate(nextDate.getDate() + (nextDayInWeek - currentDay));
        } else {
          // Next occurrence is in the next cycle
          const firstDay = sortedDays[0];
          const daysUntilNextWeek = 7 - currentDay + firstDay;
          nextDate.setDate(nextDate.getDate() + daysUntilNextWeek + (interval - 1) * 7);
        }
      } else {
        // No specific days, just add weeks
        nextDate.setDate(nextDate.getDate() + (interval * 7));
      }
      break;

    case 'monthly':
      const targetDay = rule.dayOfMonth || fromDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + interval);

      // Handle edge case where target day doesn't exist in the month (e.g., Feb 31)
      const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
      nextDate.setDate(Math.min(targetDay, daysInMonth));
      break;
  }

  // Check if we've exceeded the end date or count
  if (rule.endDate && nextDate.getTime() > rule.endDate) {
    return null;
  }

  return nextDate;
}

/**
 * Generate multiple instance dates within a date range
 */
export function generateInstancesInRange(
  rule: RecurrenceRule,
  startDate: Date,
  endDate: Date
): Date[] {
  const instances: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;

  // Generate first instance on or after start date
  while (currentDate <= endDate) {
    // Check if this date matches the rule
    if (matchesRecurrenceRule(rule, currentDate)) {
      instances.push(new Date(currentDate));
      count++;

      // Check count limit
      if (rule.count && count >= rule.count) {
        break;
      }
    }

    // Get next date
    const nextDate = generateNextInstanceDate(rule, currentDate);
    if (!nextDate || nextDate > endDate) {
      break;
    }
    currentDate = nextDate;
  }

  return instances;
}

/**
 * Check if a date matches a recurrence rule
 */
function matchesRecurrenceRule(rule: RecurrenceRule, date: Date): boolean {
  switch (rule.frequency) {
    case 'daily':
      return true; // Every day matches for daily recurrence

    case 'weekly':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        return rule.daysOfWeek.includes(date.getDay());
      }
      return true; // No specific days means every week

    case 'monthly':
      if (rule.dayOfMonth) {
        return date.getDate() === rule.dayOfMonth;
      }
      return true; // No specific day means use the original date

    default:
      return false;
  }
}

/**
 * Get a human-readable description of a recurrence rule
 */
export function describeRecurrenceRule(rule: RecurrenceRule): string {
  const interval = rule.interval || 1;
  const intervalText = interval > 1 ? ` ${interval}` : '';

  switch (rule.frequency) {
    case 'daily':
      return interval === 1 ? 'Every day' : `Every${intervalText} days`;

    case 'weekly':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = rule.daysOfWeek.map(d => dayNames[d]).join(', ');
        return interval === 1
          ? `Every week on ${days}`
          : `Every${intervalText} weeks on ${days}`;
      }
      return interval === 1 ? 'Every week' : `Every${intervalText} weeks`;

    case 'monthly':
      if (rule.dayOfMonth) {
        return interval === 1
          ? `Every month on day ${rule.dayOfMonth}`
          : `Every${intervalText} months on day ${rule.dayOfMonth}`;
      }
      return interval === 1 ? 'Every month' : `Every${intervalText} months`;

    default:
      return 'Unknown recurrence';
  }
}

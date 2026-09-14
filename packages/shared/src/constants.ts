// Status column definitions
export const WORK_ITEM_STATUSES = [
  'garage',
  'on_track',
  'pits',
  'checkered',
] as const;

// Grid Points scale (Fibonacci)
export const GRID_POINTS_SCALE = [1, 2, 3, 5, 8, 13, 21] as const;

// Status display names (racing-themed)
export const STATUS_NAMES: Record<string, string> = {
  garage: 'In the Garage',
  on_track: 'On Track',
  pits: 'In the Pits',
  checkered: 'Checkered',
};

// Status descriptions
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  garage: 'Not started yet',
  on_track: 'Currently in progress',
  pits: 'Blocked or paused',
  checkered: 'Completed',
};

// Recurrence frequency labels
export const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
} as const;

// Days of the week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
] as const;

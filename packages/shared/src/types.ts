// Core status types
export type WorkItemStatus = 'garage' | 'on_track' | 'pits' | 'checkered';

// Recurrence rule structure
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval?: number; // Every N days/weeks/months (default 1)
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: number; // Timestamp when to stop generating
  count?: number; // Max number of instances to generate
}

// Export constants
export { WORK_ITEM_STATUSES, STATUS_NAMES, STATUS_DESCRIPTIONS, FREQUENCY_LABELS, DAYS_OF_WEEK } from './constants.js';

// Work Item interface
export interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  parent_id: string | null;
  due_at: number | null; // Unix timestamp in milliseconds
  is_goal: boolean;
  goal_end_condition: string | null;
  goal_target: number | null; // Expected number of children for defined goals (null for open-ended)
  is_recurring_template: boolean;
  recurrence_rule: string | null; // JSON string for rrule
  position: number; // For ordering within status column
  created_at: number; // Unix timestamp in milliseconds
  updated_at: number; // Unix timestamp in milliseconds
}

// Time Log interface
export interface TimeLog {
  id: string;
  work_item_id: string;
  start_time: number; // Unix timestamp in milliseconds
  end_time: number | null; // NULL if timer is active
  duration: number | null; // Milliseconds, calculated when ended
  notes: string | null;
  created_at: number; // Unix timestamp in milliseconds
}

// Block Record interface
export interface BlockRecord {
  id: string;
  work_item_id: string;
  reason: string | null;
  blocked_by_work_item_id: string | null;
  start_time: number; // Unix timestamp in milliseconds
  end_time: number | null;
  created_at: number; // Unix timestamp in milliseconds
}

// Input types for API
export type CreateWorkItemInput = Omit<
  WorkItem,
  'id' | 'created_at' | 'updated_at' | 'position'
> & {
  position?: number;
};

export type UpdateWorkItemInput = Partial<
  Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>
>;

export type CreateTimeLogInput = {
  work_item_id: string;
  start_time: number;
  notes?: string;
};

export type StopTimeLogInput = {
  end_time: number;
  notes?: string;
};

export type CreateBlockRecordInput = {
  work_item_id: string;
  reason?: string;
  blocked_by_work_item_id?: string;
  start_time: number;
};

// Analytics types
export type AnalyticsGranularity = 'day' | 'week' | 'month';

export interface VelocityDataPoint {
  period: string; // ISO date string or 'YYYY-WW' for weeks
  completed: number;
  timestamp: number; // Unix timestamp for sorting/grouping
}

export interface GoalMetrics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  completionRate: number; // 0-100
  byPeriod: {
    period: string;
    completed: number;
    created: number;
  }[];
}

export interface TimeDataPoint {
  period: string;
  totalMs: number;
  byStatus: Record<string, number>; // 'garage': ms, 'on_track': ms, etc.
  byWorkItem: {
    workItemId: string;
    workItemTitle: string;
    durationMs: number;
  }[];
}

export interface BurndownDataPoint {
  date: number; // Unix timestamp
  totalWork: number; // Total items created by this date
  remaining: number; // Items not yet checkered
  completed: number; // Items in checkered status
}

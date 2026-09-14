// Core status types
export type WorkItemStatus = 'garage' | 'on_track' | 'pits' | 'checkered';

// Item type: task (default) or event (scheduled calendar block)
export type WorkItemType = 'task' | 'event';

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

// Grid Points type (Fibonacci scale defined in constants)
export type GridPoints = 1 | 2 | 3 | 5 | 8 | 13 | 21;

// Work Item interface
export interface WorkItem {
  id: string;
  user_id: string | null; // Owner of this work item
  title: string;
  description: string | null;
  status: WorkItemStatus;
  parent_id: string | null;
  due_at: number | null; // Unix timestamp in milliseconds
  grid_points: number | null; // Fibonacci scale: 1, 2, 3, 5, 8, 13, 21
  is_goal: boolean;
  goal_end_condition: string | null;
  goal_target: number | null; // Expected number of children for defined goals (null for open-ended)
  is_recurring_template: boolean;
  recurrence_rule: string | null; // JSON string for rrule
  position: number; // For ordering within status column
  item_type?: WorkItemType; // 'task' (default) or 'event' (scheduled calendar block)
  scheduled_start?: number | null; // Unix timestamp ms — when event begins
  scheduled_end?: number | null; // Unix timestamp ms — when event ends
  assignee_id: string | null; // User assigned to this work item (teams feature)
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

// Comment interface
export interface Comment {
  id: string;
  work_item_id: string;
  user_id: string | null;
  content: string;
  created_at: number; // Unix timestamp in milliseconds
  updated_at: number; // Unix timestamp in milliseconds
  // Joined fields
  user_name?: string;
  user_picture?: string;
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

export type CreateCommentInput = {
  work_item_id: string;
  content: string;
};

export type UpdateCommentInput = {
  content: string;
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

// ============ TEAMS ============

export type TeamMemberRole = 'owner' | 'admin' | 'member';
export type TeamMemberStatus = 'active' | 'pending' | 'invited';

// Team interface
export interface Team {
  id: string;
  name: string;
  code: string; // 6-char invite code
  owner_id: string;
  is_public: boolean;
  max_members: number;
  created_at: number;
  updated_at: number;
  // Computed/joined fields
  member_count?: number;
  owner_name?: string;
}

// Team member interface
export interface TeamMember {
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  team_project_id: string | null; // User's local project that syncs with team
  joined_at: number;
  // Joined fields
  user_name?: string;
  user_email?: string;
  user_picture?: string;
}

// Team work item (shared item)
export interface TeamWorkItem {
  id: string;
  team_id: string;
  work_item_id: string;
  shared_by: string;
  shared_at: number;
  // Joined fields
  work_item?: WorkItem;
  shared_by_name?: string;
}

// User profile (extended user info)
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  picture: string | null;
  is_public: boolean;
  profile_code: string | null;
  created_at: number;
}

// Input types for Teams API
export interface CreateTeamInput {
  name: string;
  is_public?: boolean;
}

export interface UpdateTeamInput {
  name?: string;
  is_public?: boolean;
}

export interface InviteTeamMemberInput {
  user_id: string;
}

export interface JoinTeamInput {
  code: string;
}

export interface ShareWorkItemInput {
  work_item_id: string;
  include_children?: boolean; // Default true
}

export interface UpdateUserProfileInput {
  display_name?: string;
  is_public?: boolean;
}

// Response types
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export interface TeamBoardItem extends WorkItem {
  team_id: string;
  shared_by: string;
  shared_by_name?: string;
  shared_at: number;
  assignee_name?: string;
  assignee_picture?: string;
}

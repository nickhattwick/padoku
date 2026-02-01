import { z } from 'zod';

// Work Item Status enum
const workItemStatusEnum = z.enum(['garage', 'on_track', 'pits', 'checkered']);

// Schema for creating a new work item
export const createWorkItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  status: workItemStatusEnum.default('garage'),
  parent_id: z.string().uuid().nullable().optional(),
  due_at: z.number().int().positive().nullable().optional(),
  is_goal: z.boolean().optional().default(false),
  goal_end_condition: z.string().nullable().optional(),
  goal_target: z.number().int().positive().nullable().optional(),
  is_recurring_template: z.boolean().optional().default(false),
  recurrence_rule: z.string().nullable().optional(),
  position: z.number().optional().default(0),
});

// Schema for updating an existing work item
export const updateWorkItemSchema = createWorkItemSchema.partial();

// Schema for moving a work item (drag-drop, reparent)
export const moveWorkItemSchema = z.object({
  status: workItemStatusEnum.optional(),
  position: z.number().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

// Schema for creating a time log
export const createTimeLogSchema = z.object({
  work_item_id: z.string().uuid(),
  start_time: z.number().int().positive(),
  notes: z.string().optional(),
});

// Schema for stopping a time log
export const stopTimeLogSchema = z.object({
  end_time: z.number().int().positive(),
  notes: z.string().optional(),
});

// Schema for updating a time log
export const updateTimeLogSchema = z.object({
  start_time: z.number().int().positive().optional(),
  end_time: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Schema for creating a block record
export const createBlockRecordSchema = z.object({
  work_item_id: z.string().uuid(),
  reason: z.string().optional(),
  blocked_by_work_item_id: z.string().uuid().nullable().optional(),
  start_time: z.number().int().positive(),
});

// Schema for updating a block record
export const updateBlockRecordSchema = z.object({
  reason: z.string().nullable().optional(),
  blocked_by_work_item_id: z.string().uuid().nullable().optional(),
  end_time: z.number().int().positive().nullable().optional(),
});

// Type exports for use in services
export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
export type MoveWorkItemInput = z.infer<typeof moveWorkItemSchema>;
export type CreateTimeLogInput = z.infer<typeof createTimeLogSchema>;
export type StopTimeLogInput = z.infer<typeof stopTimeLogSchema>;
export type UpdateTimeLogInput = z.infer<typeof updateTimeLogSchema>;
export type CreateBlockRecordInput = z.infer<typeof createBlockRecordSchema>;
export type UpdateBlockRecordInput = z.infer<typeof updateBlockRecordSchema>;

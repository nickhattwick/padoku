import { apiClient } from './client';
import type { TimeLog } from '@paddock/shared';

/**
 * API functions for time logs
 */
export const timeLogsApi = {
  /**
   * Get all time logs, optionally filtered by work_item_id
   */
  getAll: (workItemId?: string) => {
    const query = workItemId ? `?work_item_id=${workItemId}` : '';
    return apiClient.get<TimeLog[]>(`/time-logs${query}`);
  },

  /**
   * Get currently active timer
   */
  getActive: () => apiClient.get<TimeLog | null>('/time-logs/active'),

  /**
   * Start a timer for a work item
   */
  start: (workItemId: string, notes?: string) =>
    apiClient.post<TimeLog>('/time-logs', {
      work_item_id: workItemId,
      start_time: Date.now(),
      notes,
    }),

  /**
   * Stop an active timer
   */
  stop: (id: string, notes?: string) =>
    apiClient.patch<TimeLog>(`/time-logs/${id}/stop`, {
      end_time: Date.now(),
      notes,
    }),

  /**
   * Delete a time log
   */
  delete: (id: string) => apiClient.delete(`/time-logs/${id}`),
};

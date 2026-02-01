import { apiClient } from './client';
import type { WorkItem, CreateWorkItemInput, UpdateWorkItemInput } from '@paddock/shared';

/**
 * API functions for work items
 */
export const workItemsApi = {
  /**
   * Get all work items, optionally filtered by parent_id
   */
  getAll: (parentId?: string | null) => {
    const query = parentId !== undefined
      ? `?parent_id=${parentId === null ? 'null' : parentId}`
      : '';
    return apiClient.get<WorkItem[]>(`/work-items${query}`);
  },

  /**
   * Get a single work item by ID
   */
  getById: (id: string) =>
    apiClient.get<WorkItem>(`/work-items/${id}`),

  /**
   * Get children of a work item
   */
  getChildren: (id: string) =>
    apiClient.get<WorkItem[]>(`/work-items/${id}/children`),

  /**
   * Get ancestors (breadcrumb path) of a work item
   */
  getAncestors: (id: string) =>
    apiClient.get<WorkItem[]>(`/work-items/${id}/ancestors`),

  /**
   * Create a new work item
   */
  create: (data: CreateWorkItemInput) =>
    apiClient.post<WorkItem>('/work-items', data),

  /**
   * Update a work item
   */
  update: (id: string, data: UpdateWorkItemInput) =>
    apiClient.patch<WorkItem>(`/work-items/${id}`, data),

  /**
   * Move a work item (drag-drop operation)
   */
  move: (id: string, data: { status?: string; position?: number; parent_id?: string | null }) =>
    apiClient.patch<WorkItem>(`/work-items/${id}/move`, data),

  /**
   * Delete a work item
   */
  delete: (id: string) =>
    apiClient.delete(`/work-items/${id}`),

  /**
   * Generate instances from a recurring template
   */
  generateInstances: (templateId: string, startDate: number, endDate: number) =>
    apiClient.post<WorkItem[]>(`/work-items/${templateId}/generate-instances`, {
      startDate,
      endDate,
    }),

  /**
   * Get all instances of a template
   */
  getInstances: (templateId: string) =>
    apiClient.get<WorkItem[]>(`/work-items/${templateId}/instances`),
};

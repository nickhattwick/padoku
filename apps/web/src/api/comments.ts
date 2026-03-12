import { apiClient } from './client';
import type { Comment } from '@paddock/shared';

export const commentsApi = {
  /**
   * Get all comments for a work item
   */
  getByWorkItem: async (workItemId: string): Promise<Comment[]> => {
    return apiClient.get<Comment[]>(`/work-items/${workItemId}/comments`);
  },

  /**
   * Create a new comment
   */
  create: async (workItemId: string, content: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/work-items/${workItemId}/comments`, {
      content,
    });
  },

  /**
   * Update a comment
   */
  update: async (workItemId: string, commentId: string, content: string): Promise<Comment> => {
    return apiClient.patch<Comment>(
      `/work-items/${workItemId}/comments/${commentId}`,
      { content }
    );
  },

  /**
   * Delete a comment
   */
  delete: async (workItemId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/work-items/${workItemId}/comments/${commentId}`);
  },
};

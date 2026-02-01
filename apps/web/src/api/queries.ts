import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workItemsApi } from './workItems';
import type { CreateWorkItemInput, UpdateWorkItemInput, WorkItemStatus } from '@paddock/shared';

/**
 * React Query hook for fetching work items
 */
export const useWorkItems = (parentId?: string | null) => {
  // Use distinct query keys: 'root' for null, 'all' for undefined, or the actual ID
  const queryKeyParam = parentId === null ? 'root' : parentId === undefined ? 'all' : parentId;

  return useQuery({
    queryKey: ['workItems', queryKeyParam],
    queryFn: () => workItemsApi.getAll(parentId),
    staleTime: 0,
    refetchOnMount: true,
  });
};

/**
 * React Query hook for fetching a single work item
 */
export const useWorkItem = (id: string) => {
  return useQuery({
    queryKey: ['workItem', id],
    queryFn: () => workItemsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * React Query hook for fetching work item ancestors
 */
export const useWorkItemAncestors = (id?: string) => {
  return useQuery({
    queryKey: ['workItemAncestors', id],
    queryFn: () => workItemsApi.getAncestors(id!),
    enabled: !!id,
  });
};

/**
 * Mutation hook for creating a work item
 */
export const useCreateWorkItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkItemInput) => workItemsApi.create(data),
    onSuccess: () => {
      // Invalidate all work item queries to refetch
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
    },
  });
};

/**
 * Mutation hook for updating a work item
 */
export const useUpdateWorkItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkItemInput }) =>
      workItemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
      queryClient.invalidateQueries({ queryKey: ['workItem'] });
    },
  });
};

/**
 * Mutation hook for moving a work item (drag-drop)
 */
export const useMoveWorkItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      position,
      parentId,
    }: {
      id: string;
      status?: WorkItemStatus;
      position?: number;
      parentId?: string | null;
    }) =>
      workItemsApi.move(id, { status, position, parent_id: parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
    },
  });
};

/**
 * Mutation hook for deleting a work item
 */
export const useDeleteWorkItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
    },
  });
};

/**
 * Mutation hook for generating instances from a recurring template
 */
export const useGenerateInstances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, startDate, endDate }: {
      templateId: string;
      startDate: number;
      endDate: number;
    }) => workItemsApi.generateInstances(templateId, startDate, endDate),
    onSuccess: () => {
      // Refresh work items list to show new instances
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
    },
  });
};

// ============================================================================
// Analytics Hooks
// ============================================================================

import { analyticsApi } from './analytics';
import type { AnalyticsGranularity } from '@paddock/shared';

/**
 * Query hook for velocity metrics
 */
export const useVelocity = (
  startDate: number,
  endDate: number,
  granularity: AnalyticsGranularity
) => {
  return useQuery({
    queryKey: ['velocity', startDate, endDate, granularity],
    queryFn: () => analyticsApi.getVelocity(startDate, endDate, granularity),
    staleTime: 60000, // 1 minute cache
  });
};

/**
 * Query hook for goal completion metrics
 */
export const useGoalMetrics = (startDate: number, endDate: number) => {
  return useQuery({
    queryKey: ['goals', startDate, endDate],
    queryFn: () => analyticsApi.getGoals(startDate, endDate),
    staleTime: 60000,
  });
};

/**
 * Query hook for time spent metrics
 */
export const useTimeSpent = (
  startDate: number,
  endDate: number,
  granularity: AnalyticsGranularity
) => {
  return useQuery({
    queryKey: ['timeSpent', startDate, endDate, granularity],
    queryFn: () => analyticsApi.getTimeSpent(startDate, endDate, granularity),
    staleTime: 60000,
  });
};

/**
 * Query hook for burndown data
 */
export const useBurndown = (startDate: number, endDate: number) => {
  return useQuery({
    queryKey: ['burndown', startDate, endDate],
    queryFn: () => analyticsApi.getBurndown(startDate, endDate),
    staleTime: 60000,
  });
};

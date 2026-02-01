import { apiClient } from './client';
import type {
  VelocityDataPoint,
  GoalMetrics,
  TimeDataPoint,
  BurndownDataPoint,
  AnalyticsGranularity,
} from '@paddock/shared';

export const analyticsApi = {
  getVelocity: (startDate: number, endDate: number, granularity: AnalyticsGranularity) => {
    return apiClient.get<VelocityDataPoint[]>(
      `/analytics/velocity?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
    );
  },

  getGoals: (startDate: number, endDate: number) => {
    return apiClient.get<GoalMetrics>(
      `/analytics/goals?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getTimeSpent: (startDate: number, endDate: number, granularity: AnalyticsGranularity) => {
    return apiClient.get<TimeDataPoint[]>(
      `/analytics/time-spent?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
    );
  },

  getBurndown: (startDate: number, endDate: number) => {
    return apiClient.get<BurndownDataPoint[]>(
      `/analytics/burndown?startDate=${startDate}&endDate=${endDate}`
    );
  },
};

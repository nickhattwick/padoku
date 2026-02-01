import { useState, useMemo } from 'react';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
} from 'date-fns';
import type { AnalyticsGranularity } from '@paddock/shared';

export type RacingPeriod = 'race' | 'gp' | 'season' | 'championship';

export interface DateRangeResult {
  period: RacingPeriod;
  setPeriod: (period: RacingPeriod) => void;
  startDate: number;
  endDate: number;
  granularity: AnalyticsGranularity;
}

export const useDateRange = (initialPeriod: RacingPeriod = 'gp'): DateRangeResult => {
  const [period, setPeriod] = useState<RacingPeriod>(initialPeriod);

  const dateRange = useMemo(() => {
    const now = new Date();

    switch (period) {
      case 'race': // Day
        return {
          startDate: startOfDay(now).getTime(),
          endDate: endOfDay(now).getTime(),
          granularity: 'day' as const,
        };
      case 'gp': // Week
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }).getTime(), // Monday start
          endDate: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
          granularity: 'day' as const,
        };
      case 'season': // Month
        return {
          startDate: startOfMonth(now).getTime(),
          endDate: endOfMonth(now).getTime(),
          granularity: 'week' as const,
        };
      case 'championship': // Quarter
        return {
          startDate: startOfQuarter(now).getTime(),
          endDate: endOfQuarter(now).getTime(),
          granularity: 'month' as const,
        };
    }
  }, [period]);

  return {
    period,
    setPeriod,
    ...dateRange,
  };
};

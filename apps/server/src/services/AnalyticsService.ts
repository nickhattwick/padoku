import { Database as SqlJsDatabase } from 'sql.js';
import { getDb } from '../db/database.js';
import type {
  VelocityDataPoint,
  GoalMetrics,
  TimeDataPoint,
  BurndownDataPoint,
  AnalyticsGranularity,
} from '@paddock/shared';

export class AnalyticsService {
  private db: SqlJsDatabase;

  constructor() {
    this.db = getDb();
  }

  /**
   * Get velocity (completed items) grouped by time period
   */
  getVelocityByPeriod(
    startDate: number,
    endDate: number,
    _granularity: AnalyticsGranularity
  ): VelocityDataPoint[] {
    // Query to get items that moved to 'checkered' status within the date range
    // Note: Using updated_at as proxy for completion time (limitation: inaccurate if edited after completion)
    const query = `
      SELECT
        DATE(updated_at/1000, 'unixepoch') as completion_date,
        COUNT(*) as completed_count
      FROM work_items
      WHERE status = 'checkered'
        AND updated_at >= ? AND updated_at <= ?
      GROUP BY completion_date
      ORDER BY completion_date
    `;

    const result = this.db.exec(query, [startDate, endDate]);

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const dataPoints: VelocityDataPoint[] = result[0].values.map(row => {
      const dateStr = row[0] as string; // 'YYYY-MM-DD'
      const count = row[1] as number;

      return {
        period: dateStr,
        completed: count,
        timestamp: new Date(dateStr).getTime(),
      };
    });

    return dataPoints;
  }

  /**
   * Get goal completion metrics
   */
  getGoalCompletionRate(startDate: number, endDate: number): GoalMetrics {
    // Count all goals
    const totalQuery = `
      SELECT COUNT(*) as count
      FROM work_items
      WHERE is_goal = 1
        AND created_at <= ?
    `;

    const totalResult = this.db.exec(totalQuery, [endDate]);
    const totalGoals = totalResult.length > 0 && totalResult[0].values.length > 0
      ? (totalResult[0].values[0][0] as number)
      : 0;

    // Count completed goals
    const completedQuery = `
      SELECT COUNT(*) as count
      FROM work_items
      WHERE is_goal = 1
        AND status = 'checkered'
        AND created_at <= ?
    `;

    const completedResult = this.db.exec(completedQuery, [endDate]);
    const completedGoals = completedResult.length > 0 && completedResult[0].values.length > 0
      ? (completedResult[0].values[0][0] as number)
      : 0;

    // Count active goals (not checkered)
    const activeGoals = totalGoals - completedGoals;

    // Calculate completion rate
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Get goals by period (created and completed)
    const periodQuery = `
      SELECT
        DATE(created_at/1000, 'unixepoch') as period,
        COUNT(*) as created
      FROM work_items
      WHERE is_goal = 1
        AND created_at >= ? AND created_at <= ?
      GROUP BY period
      ORDER BY period
    `;

    const periodResult = this.db.exec(periodQuery, [startDate, endDate]);
    const byPeriod = periodResult.length > 0 && periodResult[0].values.length > 0
      ? periodResult[0].values.map(row => ({
          period: row[0] as string,
          created: row[1] as number,
          completed: 0, // TODO: track completed separately
        }))
      : [];

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      completionRate,
      byPeriod,
    };
  }

  /**
   * Get time spent aggregated by period
   */
  getTimeSpentByPeriod(
    startDate: number,
    endDate: number,
    _granularity: AnalyticsGranularity
  ): TimeDataPoint[] {
    // Get time logs with work item info
    const query = `
      SELECT
        DATE(tl.start_time/1000, 'unixepoch') as log_date,
        wi.id as work_item_id,
        wi.title as work_item_title,
        wi.status as work_item_status,
        SUM(tl.duration) as total_duration
      FROM time_logs tl
      JOIN work_items wi ON tl.work_item_id = wi.id
      WHERE tl.start_time >= ? AND tl.start_time <= ?
        AND tl.end_time IS NOT NULL
      GROUP BY log_date, work_item_id, work_item_title, work_item_status
      ORDER BY log_date
    `;

    const result = this.db.exec(query, [startDate, endDate]);

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    // Group by period
    const periodMap = new Map<string, {
      totalMs: number;
      byStatus: Map<string, number>;
      byWorkItem: Map<string, { title: string; durationMs: number }>;
    }>();

    result[0].values.forEach(row => {
      const period = row[0] as string;
      const workItemId = row[1] as string;
      const workItemTitle = row[2] as string;
      const status = row[3] as string;
      const duration = row[4] as number;

      if (!periodMap.has(period)) {
        periodMap.set(period, {
          totalMs: 0,
          byStatus: new Map(),
          byWorkItem: new Map(),
        });
      }

      const periodData = periodMap.get(period)!;
      periodData.totalMs += duration;

      // Aggregate by status
      const statusTotal = periodData.byStatus.get(status) || 0;
      periodData.byStatus.set(status, statusTotal + duration);

      // Aggregate by work item
      const existing = periodData.byWorkItem.get(workItemId);
      if (existing) {
        existing.durationMs += duration;
      } else {
        periodData.byWorkItem.set(workItemId, {
          title: workItemTitle,
          durationMs: duration,
        });
      }
    });

    // Convert to array
    const dataPoints: TimeDataPoint[] = Array.from(periodMap.entries()).map(([period, data]) => ({
      period,
      totalMs: data.totalMs,
      byStatus: Object.fromEntries(data.byStatus),
      byWorkItem: Array.from(data.byWorkItem.entries()).map(([workItemId, info]) => ({
        workItemId,
        workItemTitle: info.title,
        durationMs: info.durationMs,
      })),
    }));

    return dataPoints;
  }

  /**
   * Get burndown data (total, remaining, completed work over time)
   */
  getBurndownData(startDate: number, endDate: number): BurndownDataPoint[] {
    // Get snapshot of work status at various points in time
    // For simplicity, we'll create daily snapshots
    const dataPoints: BurndownDataPoint[] = [];

    // Calculate number of days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= daysDiff; i++) {
      const snapshotDate = new Date(start);
      snapshotDate.setDate(snapshotDate.getDate() + i);
      const timestamp = snapshotDate.getTime();

      // Query work items created by this date
      const query = `
        SELECT
          status,
          COUNT(*) as count
        FROM work_items
        WHERE created_at <= ?
        GROUP BY status
      `;

      const result = this.db.exec(query, [timestamp]);

      let totalWork = 0;
      let completed = 0;

      if (result.length > 0 && result[0].values.length > 0) {
        result[0].values.forEach(row => {
          const status = row[0] as string;
          const count = row[1] as number;

          totalWork += count;
          if (status === 'checkered') {
            completed += count;
          }
        });
      }

      const remaining = totalWork - completed;

      dataPoints.push({
        date: timestamp,
        totalWork,
        remaining,
        completed,
      });
    }

    return dataPoints;
  }
}

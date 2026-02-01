import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';
import type { AnalyticsGranularity } from '@paddock/shared';

const router = Router();

// Lazy-initialize service to avoid database init issues
const getService = () => new AnalyticsService();

/**
 * GET /api/analytics/velocity
 * Get velocity metrics (completed items over time)
 * Query params:
 *   - startDate: Unix timestamp in milliseconds
 *   - endDate: Unix timestamp in milliseconds
 *   - granularity: 'day' | 'week' | 'month'
 */
router.get('/velocity', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, granularity } = req.query;

    // Validate required parameters
    if (!startDate || !endDate || !granularity) {
      return res.status(400).json({
        error: 'startDate, endDate, and granularity are required',
      });
    }

    const start = parseInt(startDate as string, 10);
    const end = parseInt(endDate as string, 10);
    const gran = granularity as AnalyticsGranularity;

    // Validate granularity
    if (!['day', 'week', 'month'].includes(gran)) {
      return res.status(400).json({
        error: 'granularity must be day, week, or month',
      });
    }

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'startDate and endDate must be valid timestamps',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'startDate must be before endDate',
      });
    }

    const data = getService().getVelocityByPeriod(start, end, gran);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/goals
 * Get goal completion metrics
 * Query params:
 *   - startDate: Unix timestamp in milliseconds
 *   - endDate: Unix timestamp in milliseconds
 */
router.get('/goals', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required',
      });
    }

    const start = parseInt(startDate as string, 10);
    const end = parseInt(endDate as string, 10);

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'startDate and endDate must be valid timestamps',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'startDate must be before endDate',
      });
    }

    const data = getService().getGoalCompletionRate(start, end);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/time-spent
 * Get time spent metrics aggregated by period
 * Query params:
 *   - startDate: Unix timestamp in milliseconds
 *   - endDate: Unix timestamp in milliseconds
 *   - granularity: 'day' | 'week' | 'month'
 */
router.get('/time-spent', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, granularity } = req.query;

    // Validate required parameters
    if (!startDate || !endDate || !granularity) {
      return res.status(400).json({
        error: 'startDate, endDate, and granularity are required',
      });
    }

    const start = parseInt(startDate as string, 10);
    const end = parseInt(endDate as string, 10);
    const gran = granularity as AnalyticsGranularity;

    // Validate granularity
    if (!['day', 'week', 'month'].includes(gran)) {
      return res.status(400).json({
        error: 'granularity must be day, week, or month',
      });
    }

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'startDate and endDate must be valid timestamps',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'startDate must be before endDate',
      });
    }

    const data = getService().getTimeSpentByPeriod(start, end, gran);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/burndown
 * Get burndown data (total, remaining, completed work over time)
 * Query params:
 *   - startDate: Unix timestamp in milliseconds
 *   - endDate: Unix timestamp in milliseconds
 */
router.get('/burndown', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required',
      });
    }

    const start = parseInt(startDate as string, 10);
    const end = parseInt(endDate as string, 10);

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'startDate and endDate must be valid timestamps',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'startDate must be before endDate',
      });
    }

    const data = getService().getBurndownData(start, end);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;

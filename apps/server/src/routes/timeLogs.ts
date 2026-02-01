import { Router, Request, Response, NextFunction } from 'express';
import { TimeLogService } from '../services/TimeLogService.js';
import {
  createTimeLogSchema,
  stopTimeLogSchema,
  updateTimeLogSchema,
} from '../validators/schemas.js';

const router = Router();

// Lazy-initialize service
const getService = () => new TimeLogService();

/**
 * GET /api/time-logs
 * Get all time logs, optionally filtered by work_item_id
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { work_item_id } = req.query;
    const workItemId = typeof work_item_id === 'string' ? work_item_id : undefined;

    const logs = getService().findAll(workItemId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/time-logs/active
 * Get the currently active timer
 */
router.get('/active', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const activeLog = getService().findActive();
    res.json(activeLog);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/time-logs/:id
 * Get a single time log by ID
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = getService().findById(req.params.id);

    if (!log) {
      res.status(404).json({ error: 'Time log not found' });
      return;
    }

    res.json(log);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/time-logs
 * Start a new timer
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createTimeLogSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const log = getService().start(
      result.data.work_item_id,
      result.data.notes
    );

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/time-logs/:id/stop
 * Stop an active timer
 */
router.patch('/:id/stop', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = stopTimeLogSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const log = getService().stop(
      req.params.id,
      result.data.end_time,
      result.data.notes
    );

    res.json(log);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('already stopped')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * PATCH /api/time-logs/:id
 * Update a time log (manual edit)
 */
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateTimeLogSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const log = getService().update(req.params.id, result.data);
    res.json(log);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * DELETE /api/time-logs/:id
 * Delete a time log
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    getService().delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

export default router;

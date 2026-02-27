import { Router, Request, Response, NextFunction } from 'express';
import { WorkItemService } from '../services/WorkItemService.js';
import {
  createWorkItemSchema,
  updateWorkItemSchema,
  moveWorkItemSchema,
} from '../validators/schemas.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Apply optional auth middleware to all routes
router.use(optionalAuth);

// Lazy-initialize service to avoid database init issues
const getService = () => new WorkItemService();

/**
 * GET /api/work-items
 * Get all work items, optionally filtered by parent_id
 * Query params:
 *   - parent_id: 'null' for root items, UUID for children of specific parent, omit for all items
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parent_id } = req.query;

    let parentId: string | null | undefined = undefined;

    if (parent_id === 'null') {
      parentId = null; // Root items
    } else if (typeof parent_id === 'string') {
      parentId = parent_id; // Children of specific parent
    }
    // If parent_id is undefined, fetch all items

    const items = getService().findAll(parentId, req.userId);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-items/:id
 * Get a single work item by ID
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = getService().findById(req.params.id, req.userId);

    if (!item) {
      res.status(404).json({ error: 'Work item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-items/:id/children
 * Get all children of a work item
 */
router.get('/:id/children', (req: Request, res: Response, next: NextFunction) => {
  try {
    const children = getService().findChildren(req.params.id, req.userId);
    res.json(children);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-items/:id/ancestors
 * Get breadcrumb path (ancestors) of a work item
 */
router.get('/:id/ancestors', (req: Request, res: Response, next: NextFunction) => {
  try {
    const ancestors = getService().findAncestors(req.params.id);
    res.json(ancestors);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/work-items
 * Create a new work item
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createWorkItemSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const item = getService().create(result.data, req.userId);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/work-items/:id
 * Update a work item
 */
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateWorkItemSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const item = getService().update(req.params.id, result.data, req.userId);
    res.json(item);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * PATCH /api/work-items/:id/move
 * Move a work item (change status, position, or parent)
 * Primary endpoint for drag-drop operations
 */
router.patch('/:id/move', (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = moveWorkItemSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }

    const item = getService().move(req.params.id, result.data, req.userId);
    res.json(item);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * DELETE /api/work-items/:id
 * Delete a work item (cascades to children)
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    getService().delete(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * POST /api/work-items/:id/generate-instances
 * Generate instances of a recurring template
 */
import { RecurringService } from '../services/RecurringService.js';

const getRecurringService = () => new RecurringService();

router.post('/:id/generate-instances', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required'
      });
    }

    const instances = getRecurringService().generateInstances(
      req.params.id,
      startDate,
      endDate
    );

    res.json(instances);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/work-items/:id/instances
 * Get all instances of a template
 */
router.get('/:id/instances', (req: Request, res: Response, next: NextFunction) => {
  try {
    const instances = getRecurringService().getInstancesOfTemplate(req.params.id);
    res.json(instances);
  } catch (error) {
    next(error);
  }
});

export default router;

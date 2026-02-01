import { Router } from 'express';

const router = Router();

// Placeholder routes for Phase 2 (Time and Calendar)
// These will be implemented when we add blocked tracking

router.get('/', (_req, res) => {
  res.json([]);
});

router.post('/', (_req, res) => {
  res.status(501).json({ error: 'Block records not yet implemented - coming in Phase 2' });
});

export default router;

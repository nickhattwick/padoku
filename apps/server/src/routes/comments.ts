import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { getDb, saveDatabase } from '../db/database.js';
import { optionalAuth } from '../middleware/auth.js';
import type { Comment } from '@paddock/shared';

const router = Router();

// Apply optional auth middleware to all routes
router.use(optionalAuth);

/**
 * GET /api/work-items/:workItemId/comments
 * Get all comments for a work item
 */
router.get('/:workItemId/comments', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workItemId } = req.params;
    const db = getDb();

    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.work_item_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.picture as user_picture
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.work_item_id = ?
      ORDER BY c.created_at ASC
    `);
    stmt.bind([workItemId]);

    const comments: Comment[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      comments.push({
        id: row.id,
        work_item_id: row.work_item_id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_name: row.user_name || 'Anonymous',
        user_picture: row.user_picture,
      });
    }
    stmt.free();

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/work-items/:workItemId/comments
 * Create a new comment on a work item
 */
router.post('/:workItemId/comments', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workItemId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const db = getDb();
    const now = Date.now();
    const id = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO comments (id, work_item_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([id, workItemId, req.userId || null, content.trim(), now, now]);
    stmt.free();

    saveDatabase();

    // Fetch the created comment with user info
    const selectStmt = db.prepare(`
      SELECT 
        c.id,
        c.work_item_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.picture as user_picture
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    selectStmt.bind([id]);
    selectStmt.step();
    const row = selectStmt.getAsObject() as any;
    selectStmt.free();

    const comment: Comment = {
      id: row.id,
      work_item_id: row.work_item_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_name: row.user_name || 'Anonymous',
      user_picture: row.user_picture,
    };

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/work-items/:workItemId/comments/:id
 * Update a comment
 */
router.patch('/:workItemId/comments/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const db = getDb();
    const now = Date.now();

    // Check if comment exists and user owns it
    const checkStmt = db.prepare('SELECT user_id FROM comments WHERE id = ?');
    checkStmt.bind([id]);
    if (!checkStmt.step()) {
      checkStmt.free();
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    const commentData = checkStmt.getAsObject() as { user_id: string | null };
    checkStmt.free();

    // Only allow editing own comments (or if no user auth)
    if (req.userId && commentData.user_id && commentData.user_id !== req.userId) {
      res.status(403).json({ error: 'Cannot edit other users comments' });
      return;
    }

    const stmt = db.prepare('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?');
    stmt.run([content.trim(), now, id]);
    stmt.free();

    saveDatabase();

    // Fetch updated comment
    const selectStmt = db.prepare(`
      SELECT 
        c.id,
        c.work_item_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.picture as user_picture
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    selectStmt.bind([id]);
    selectStmt.step();
    const row = selectStmt.getAsObject() as any;
    selectStmt.free();

    const comment: Comment = {
      id: row.id,
      work_item_id: row.work_item_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_name: row.user_name || 'Anonymous',
      user_picture: row.user_picture,
    };

    res.json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/work-items/:workItemId/comments/:id
 * Delete a comment
 */
router.delete('/:workItemId/comments/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const db = getDb();

    // Check if comment exists and user owns it
    const checkStmt = db.prepare('SELECT user_id FROM comments WHERE id = ?');
    checkStmt.bind([id]);
    if (!checkStmt.step()) {
      checkStmt.free();
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    const commentData = checkStmt.getAsObject() as { user_id: string | null };
    checkStmt.free();

    // Only allow deleting own comments (or if no user auth)
    if (req.userId && commentData.user_id && commentData.user_id !== req.userId) {
      res.status(403).json({ error: 'Cannot delete other users comments' });
      return;
    }

    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run([id]);
    stmt.free();

    saveDatabase();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

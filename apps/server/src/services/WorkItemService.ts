import { getDb, saveDatabase } from '../db/database.js';
import type { WorkItem } from '@paddock/shared';
import type { CreateWorkItemInput, UpdateWorkItemInput, MoveWorkItemInput } from '../validators/schemas.js';
import { randomUUID } from 'crypto';

export class WorkItemService {
  /**
   * Find all work items, optionally filtered by parent_id and user_id
   * @param parentId - Parent ID to filter by (null for root items, undefined for all items)
   * @param userId - User ID to filter by (null/undefined for all users - backwards compatible)
   */
  findAll(parentId?: string | null, userId?: string | null): WorkItem[] {
    const db = getDb();
    let query: string;
    let params: any[] = [];

    // Build user filter condition
    const userCondition = userId ? 'user_id = ?' : '1=1';
    const userParams = userId ? [userId] : [];

    if (parentId === null) {
      // Root items only (no parent)
      query = `SELECT * FROM work_items WHERE parent_id IS NULL AND ${userCondition} ORDER BY position`;
      params = [...userParams];
    } else if (parentId !== undefined) {
      // Children of specific parent
      query = `SELECT * FROM work_items WHERE parent_id = ? AND ${userCondition} ORDER BY position`;
      params = [parentId, ...userParams];
    } else {
      // All items for user
      query = `SELECT * FROM work_items WHERE ${userCondition} ORDER BY position`;
      params = [...userParams];
    }

    const result = db.exec(query, params);

    if (result.length === 0) {
      return [];
    }

    return this.mapResultsToWorkItems(result[0]);
  }

  /**
   * Find a single work item by ID
   * @param id - Work item ID
   * @param userId - Optional user ID to verify ownership
   */
  findById(id: string, userId?: string | null): WorkItem | null {
    const db = getDb();
    let query = 'SELECT * FROM work_items WHERE id = ?';
    let params: any[] = [id];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const result = db.exec(query, params);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const items = this.mapResultsToWorkItems(result[0]);
    return items[0] || null;
  }

  /**
   * Get all children of a work item
   */
  findChildren(parentId: string, userId?: string | null): WorkItem[] {
    const db = getDb();
    let query = 'SELECT * FROM work_items WHERE parent_id = ?';
    let params: any[] = [parentId];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY position';

    const result = db.exec(query, params);

    if (result.length === 0) {
      return [];
    }

    return this.mapResultsToWorkItems(result[0]);
  }

  /**
   * Get all ancestors of a work item (breadcrumb path)
   * Returns ancestors from root to immediate parent
   */
  findAncestors(id: string): WorkItem[] {
    const db = getDb();
    const query = `
      WITH RECURSIVE ancestors AS (
        SELECT * FROM work_items WHERE id = ?
        UNION ALL
        SELECT w.* FROM work_items w
        INNER JOIN ancestors a ON a.parent_id = w.id
      )
      SELECT * FROM ancestors WHERE id != ?
    `;

    const result = db.exec(query, [id, id]);

    if (result.length === 0) {
      return [];
    }

    const ancestors = this.mapResultsToWorkItems(result[0]);

    // Build correct order (root first)
    const ordered: WorkItem[] = [];
    let current = ancestors.find(a => a.parent_id === null);

    while (current) {
      ordered.push(current);
      current = ancestors.find(a => a.parent_id === current!.id);
    }

    return ordered;
  }

  /**
   * Create a new work item
   */
  create(input: CreateWorkItemInput, userId?: string | null): WorkItem {
    const db = getDb();
    const id = randomUUID();
    const now = Date.now();

    const query = `
      INSERT INTO work_items (
        id, user_id, title, description, status, parent_id, due_at, grid_points,
        is_goal, goal_end_condition, goal_target, is_recurring_template, recurrence_rule,
        position, assignee_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      id,
      userId || null,
      input.title,
      input.description || null,
      input.status,
      input.parent_id || null,
      input.due_at || null,
      input.grid_points || null,
      input.is_goal ? 1 : 0,
      input.goal_end_condition || null,
      input.goal_target || null,
      input.is_recurring_template ? 1 : 0,
      input.recurrence_rule || null,
      input.position ?? 0,
      input.assignee_id || null,
      now,
      now,
    ]);

    // Save to disk after write
    saveDatabase();

    const created = this.findById(id);
    if (!created) {
      throw new Error('Failed to create work item');
    }

    return created;
  }

  /**
   * Update a work item
   */
  update(id: string, input: UpdateWorkItemInput, userId?: string | null): WorkItem {
    const db = getDb();
    const existing = this.findById(id, userId);
    if (!existing) {
      throw new Error(`Work item not found: ${id}`);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      fields.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      fields.push('description = ?');
      values.push(input.description);
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }
    if (input.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(input.parent_id);
    }
    if (input.due_at !== undefined) {
      fields.push('due_at = ?');
      values.push(input.due_at);
    }
    if (input.grid_points !== undefined) {
      fields.push('grid_points = ?');
      values.push(input.grid_points);
    }
    if (input.is_goal !== undefined) {
      fields.push('is_goal = ?');
      values.push(input.is_goal ? 1 : 0);
    }
    if (input.goal_end_condition !== undefined) {
      fields.push('goal_end_condition = ?');
      values.push(input.goal_end_condition);
    }
    if (input.goal_target !== undefined) {
      fields.push('goal_target = ?');
      values.push(input.goal_target);
    }
    if (input.is_recurring_template !== undefined) {
      fields.push('is_recurring_template = ?');
      values.push(input.is_recurring_template ? 1 : 0);
    }
    if (input.recurrence_rule !== undefined) {
      fields.push('recurrence_rule = ?');
      values.push(input.recurrence_rule);
    }
    if (input.position !== undefined) {
      fields.push('position = ?');
      values.push(input.position);
    }
    if (input.assignee_id !== undefined) {
      fields.push('assignee_id = ?');
      values.push(input.assignee_id);
    }

    if (fields.length === 0) {
      return existing; // Nothing to update
    }

    let query = `UPDATE work_items SET ${fields.join(', ')} WHERE id = ?`;
    const queryParams = [...values, id];

    if (userId) {
      query += ' AND user_id = ?';
      queryParams.push(userId);
    }

    db.run(query, queryParams);

    // Save to disk after write
    saveDatabase();

    const updated = this.findById(id);
    if (!updated) {
      throw new Error('Failed to update work item');
    }

    return updated;
  }

  /**
   * Move a work item (change status, position, or parent)
   * Used primarily for drag-drop operations
   */
  move(id: string, input: MoveWorkItemInput, userId?: string | null): WorkItem {
    const db = getDb();
    const existing = this.findById(id, userId);
    if (!existing) {
      throw new Error(`Work item not found: ${id}`);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }

    if (input.position !== undefined) {
      fields.push('position = ?');
      values.push(input.position);
    }

    if (input.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(input.parent_id);
    }

    if (fields.length === 0) {
      return existing; // Nothing to move
    }

    let query = `UPDATE work_items SET ${fields.join(', ')} WHERE id = ?`;
    const queryParams = [...values, id];

    if (userId) {
      query += ' AND user_id = ?';
      queryParams.push(userId);
    }

    db.run(query, queryParams);

    // Save to disk after write
    saveDatabase();

    const moved = this.findById(id);
    if (!moved) {
      throw new Error('Failed to move work item');
    }

    return moved;
  }

  /**
   * Delete a work item
   * Cascades to children due to foreign key constraint
   */
  delete(id: string, userId?: string | null): void {
    const db = getDb();
    const existing = this.findById(id, userId);

    if (!existing) {
      throw new Error(`Work item not found: ${id}`);
    }

    let query = 'DELETE FROM work_items WHERE id = ?';
    const params: any[] = [id];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    db.run(query, params);

    // Save to disk after write
    saveDatabase();
  }

  /**
   * Map sql.js query results to WorkItem objects
   */
  private mapResultsToWorkItems(result: { columns: string[]; values: any[][] }): WorkItem[] {
    const { columns, values } = result;

    return values.map(row => {
      const item: any = {};
      columns.forEach((col, idx) => {
        item[col] = row[idx];
      });

      return {
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        status: item.status,
        parent_id: item.parent_id,
        due_at: item.due_at,
        grid_points: item.grid_points,
        is_goal: Boolean(item.is_goal),
        goal_end_condition: item.goal_end_condition,
        goal_target: item.goal_target,
        is_recurring_template: Boolean(item.is_recurring_template),
        recurrence_rule: item.recurrence_rule,
        position: item.position,
        assignee_id: item.assignee_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });
  }
}

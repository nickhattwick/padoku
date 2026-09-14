import { getDb, saveDatabase } from '../db/database.js';
import type { TimeLog } from '@paddock/shared';
import { randomUUID } from 'crypto';

export class TimeLogService {
  /**
   * Find all time logs, optionally filtered by work_item_id
   */
  findAll(workItemId?: string): TimeLog[] {
    const db = getDb();

    let query: string;
    let params: any[] = [];

    if (workItemId) {
      query = 'SELECT * FROM time_logs WHERE work_item_id = ? ORDER BY start_time DESC';
      params = [workItemId];
    } else {
      query = 'SELECT * FROM time_logs ORDER BY start_time DESC';
    }

    const result = db.exec(query, params);

    if (result.length === 0) {
      return [];
    }

    return this.mapResultsToTimeLogs(result[0]);
  }

  /**
   * Find a single time log by ID
   */
  findById(id: string): TimeLog | null {
    const db = getDb();
    const result = db.exec('SELECT * FROM time_logs WHERE id = ?', [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const logs = this.mapResultsToTimeLogs(result[0]);
    return logs[0] || null;
  }

  /**
   * Get the currently active timer (where end_time is NULL)
   */
  findActive(): TimeLog | null {
    const db = getDb();
    const result = db.exec('SELECT * FROM time_logs WHERE end_time IS NULL LIMIT 1');

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const logs = this.mapResultsToTimeLogs(result[0]);
    return logs[0] || null;
  }

  /**
   * Start a new timer (create time log without end_time)
   */
  start(workItemId: string, notes?: string): TimeLog {
    const db = getDb();

    // Stop any active timer first
    const activeTimer = this.findActive();
    if (activeTimer) {
      this.stop(activeTimer.id, Date.now());
    }

    const id = randomUUID();
    const now = Date.now();

    const query = `
      INSERT INTO time_logs (
        id, work_item_id, start_time, end_time, duration, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      id,
      workItemId,
      now,
      null, // end_time is NULL for active timer
      null, // duration is NULL until stopped
      notes || null,
      now,
    ]);

    saveDatabase();

    const created = this.findById(id);
    if (!created) {
      throw new Error('Failed to create time log');
    }

    return created;
  }

  /**
   * Create a completed time log entry (for imports/syncs)
   */
  createManual(workItemId: string, startTime: number, endTime: number, notes?: string | null): TimeLog {
    const db = getDb();
    const id = randomUUID();
    const duration = endTime - startTime;

    const query = `
      INSERT INTO time_logs (
        id, work_item_id, start_time, end_time, duration, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [id, workItemId, startTime, endTime, duration, notes || null, Date.now()]);
    saveDatabase();

    const created = this.findById(id);
    if (!created) {
      throw new Error('Failed to create time log');
    }
    return created;
  }

  /**
   * Stop an active timer
   */
  stop(id: string, endTime: number, notes?: string): TimeLog {
    const db = getDb();
    const existing = this.findById(id);

    if (!existing) {
      throw new Error(`Time log not found: ${id}`);
    }

    if (existing.end_time !== null) {
      throw new Error('Timer already stopped');
    }

    const duration = endTime - existing.start_time;

    const query = `
      UPDATE time_logs
      SET end_time = ?, duration = ?, notes = ?
      WHERE id = ?
    `;

    db.run(query, [
      endTime,
      duration,
      notes !== undefined ? notes : existing.notes,
      id,
    ]);

    saveDatabase();

    const updated = this.findById(id);
    if (!updated) {
      throw new Error('Failed to stop timer');
    }

    return updated;
  }

  /**
   * Update a time log (for manual edits)
   */
  update(id: string, data: { start_time?: number; end_time?: number | null; notes?: string | null }): TimeLog {
    const db = getDb();
    const existing = this.findById(id);

    if (!existing) {
      throw new Error(`Time log not found: ${id}`);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(data.start_time);
    }

    if (data.end_time !== undefined) {
      fields.push('end_time = ?');
      values.push(data.end_time);

      // Recalculate duration if we have both start and end
      const startTime = data.start_time ?? existing.start_time;
      const endTime = data.end_time;

      if (endTime !== null) {
        const duration = endTime - startTime;
        fields.push('duration = ?');
        values.push(duration);
      } else {
        fields.push('duration = ?');
        values.push(null);
      }
    }

    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return existing;
    }

    const query = `UPDATE time_logs SET ${fields.join(', ')} WHERE id = ?`;
    db.run(query, [...values, id]);

    saveDatabase();

    const updated = this.findById(id);
    if (!updated) {
      throw new Error('Failed to update time log');
    }

    return updated;
  }

  /**
   * Delete a time log
   */
  delete(id: string): void {
    const db = getDb();
    const existing = this.findById(id);

    if (!existing) {
      throw new Error(`Time log not found: ${id}`);
    }

    db.run('DELETE FROM time_logs WHERE id = ?', [id]);
    saveDatabase();
  }

  /**
   * Map sql.js query results to TimeLog objects
   */
  private mapResultsToTimeLogs(result: { columns: string[]; values: any[][] }): TimeLog[] {
    const { columns, values } = result;

    return values.map(row => {
      const item: any = {};
      columns.forEach((col, idx) => {
        item[col] = row[idx];
      });

      return {
        id: item.id,
        work_item_id: item.work_item_id,
        start_time: item.start_time,
        end_time: item.end_time,
        duration: item.duration,
        notes: item.notes,
        created_at: item.created_at,
      };
    });
  }
}

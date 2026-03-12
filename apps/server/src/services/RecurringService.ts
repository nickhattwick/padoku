import { Database as SqlJsDatabase } from 'sql.js';
import { getDb } from '../db/database.js';
import type { WorkItem } from '@paddock/shared';
import { parseRecurrenceRule, generateInstancesInRange } from '@paddock/shared';
import { WorkItemService } from './WorkItemService.js';

export class RecurringService {
  private db: SqlJsDatabase;
  private workItemService: WorkItemService;

  constructor() {
    this.db = getDb();
    this.workItemService = new WorkItemService();
  }

  /**
   * Generate instances of a recurring template for a date range
   */
  generateInstances(
    templateId: string,
    startDate: number,
    endDate: number
  ): WorkItem[] {
    // Get template
    const template = this.workItemService.findById(templateId);
    if (!template || !template.is_recurring_template) {
      throw new Error('Work item is not a recurring template');
    }

    // Parse recurrence rule
    const rule = parseRecurrenceRule(template.recurrence_rule);
    if (!rule) {
      throw new Error('Invalid recurrence rule');
    }

    // Generate dates
    const dates = generateInstancesInRange(
      rule,
      new Date(startDate),
      new Date(endDate)
    );

    // Create instances
    const instances: WorkItem[] = [];
    for (const date of dates) {
      // Check if instance already exists for this date
      const existing = this.findInstanceForDate(templateId, date);
      if (existing) {
        instances.push(existing);
        continue;
      }

      // Create new instance
      const instance = this.workItemService.create({
        title: `${template.title} – ${this.formatDate(date)}`,
        description: template.description ?? undefined,
        status: 'garage', // Always start in garage
        parent_id: template.parent_id ?? undefined,
        due_at: date.getTime(),
        is_goal: false,
        goal_end_condition: undefined,
        is_recurring_template: false,
        recurrence_rule: undefined,
        position: 0, // Will be recalculated by service
      });

      instances.push(instance);
    }

    return instances;
  }

  /**
   * Find existing instance for a specific date
   */
  private findInstanceForDate(
    templateId: string,
    date: Date
  ): WorkItem | null {
    const template = this.workItemService.findById(templateId);
    if (!template) return null;

    // Find items with matching title pattern and due date
    const dateStr = this.formatDate(date);
    const titlePattern = `${template.title} – ${dateStr}`;

    const query = `
      SELECT * FROM work_items
      WHERE title = ?
      AND due_at = ?
      LIMIT 1
    `;

    const result = this.db.exec(query, [titlePattern, date.getTime()]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.mapRow(result[0].columns, result[0].values[0]);
  }

  /**
   * Format date as "Jan 7"
   */
  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  /**
   * Get all instances of a template
   */
  getInstancesOfTemplate(templateId: string): WorkItem[] {
    const template = this.workItemService.findById(templateId);
    if (!template) return [];

    // Find all items with title starting with template title
    const query = `
      SELECT * FROM work_items
      WHERE title LIKE ?
      AND id != ?
      ORDER BY due_at ASC
    `;

    const result = this.db.exec(query, [`${template.title} – %`, templateId]);
    if (result.length === 0) return [];

    return result[0].values.map(row =>
      this.mapRow(result[0].columns, row)
    );
  }

  /**
   * Map a database row to a WorkItem object
   */
  private mapRow(columns: string[], row: any[]): WorkItem {
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
      assignee_id: item.assignee_id,
      position: item.position,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}

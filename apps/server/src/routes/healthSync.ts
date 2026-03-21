import { Router, Request, Response, NextFunction } from 'express';
import { WorkItemService } from '../services/WorkItemService.js';
import { TimeLogService } from '../services/TimeLogService.js';
import { getDb, saveDatabase } from '../db/database.js';

const router = Router();

interface HealthEntry {
  type: string;           // "exercise", "sleep", "steps"
  sub_type: string | null;
  start_time: number;     // epoch ms
  end_time: number;       // epoch ms
  duration_ms: number;
  calories: number | null;
  distance_meters: number | null;
  heart_rate_avg: number | null;
  steps: number | null;
  notes: string | null;
}

interface HealthSyncBody {
  entries: HealthEntry[];
  source: string;
  synced_at: number;
  user_email?: string;  // Optional: associate synced items with a user
}

// Format duration from ms to human-readable
function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Map exercise sub_type to emoji
function exerciseEmoji(subType: string | null): string {
  const map: Record<string, string> = {
    cycling: '🚴', running: '🏃', walking: '🚶', swimming: '🏊',
    hiking: '🥾', yoga: '🧘', weightlifting: '🏋️', rowing: '🚣',
    elliptical: '🏃', stair_climbing: '🪜', pilates: '🧘', dancing: '💃',
    stretching: '🤸', hiit: '🔥', strength: '💪', calisthenics: '💪',
  };
  return map[subType || ''] || '🏋️';
}

// Generate a title for the health entry
function generateTitle(entry: HealthEntry): string {
  if (entry.type === 'exercise') {
    const name = (entry.sub_type || 'workout').replace(/_/g, ' ');
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    const emoji = exerciseEmoji(entry.sub_type);
    const duration = formatDuration(entry.duration_ms);
    return `${emoji} ${capitalizedName} — ${duration}`;
  }
  if (entry.type === 'sleep') {
    const hours = (entry.duration_ms / 3600000).toFixed(1);
    return `😴 Sleep — ${hours}h`;
  }
  if (entry.type === 'steps') {
    return `👟 Steps — ${(entry.steps || 0).toLocaleString()}`;
  }
  return `📊 Health Data`;
}

// Generate description with stats
function generateDescription(entry: HealthEntry): string {
  const parts: string[] = [];
  
  if (entry.calories) parts.push(`🔥 ${Math.round(entry.calories)} cal`);
  if (entry.distance_meters) {
    const km = (entry.distance_meters / 1000).toFixed(2);
    const miles = (entry.distance_meters / 1609.34).toFixed(2);
    parts.push(`📏 ${km} km (${miles} mi)`);
  }
  if (entry.heart_rate_avg) parts.push(`❤️ ${Math.round(entry.heart_rate_avg)} avg bpm`);
  if (entry.steps) parts.push(`👟 ${entry.steps.toLocaleString()} steps`);
  parts.push(`⏱️ ${formatDuration(entry.duration_ms)}`);
  parts.push(`📱 Synced from Health Connect`);
  
  return parts.join('\n');
}

/**
 * GET /api/health-sync/status
 * Health check for the sync endpoint
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({ 
    ok: true, 
    service: 'paddock-health-sync',
    timestamp: Date.now() 
  });
});

/**
 * POST /api/health-sync/backfill-user
 * One-time: assign user_id to orphaned health-synced items
 */
router.post('/backfill-user', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    // Find default user
    const userResult = db.exec('SELECT id FROM users ORDER BY created_at ASC LIMIT 1');
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      res.json({ ok: false, error: 'No users found' });
      return;
    }
    const userId = userResult[0].values[0][0] as string;

    // Update orphaned health-synced items (description contains [hc:])
    db.run(
      "UPDATE work_items SET user_id = ? WHERE description LIKE '%[hc:%' AND (user_id IS NULL OR user_id = '')",
      [userId]
    );
    saveDatabase();

    res.json({ ok: true, userId, message: 'Backfilled orphaned health items' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/health-sync
 * Receive health data from Paddock Sync Android app
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as HealthSyncBody;
    
    if (!body.entries || !Array.isArray(body.entries)) {
      res.status(400).json({ error: 'Missing entries array' });
      return;
    }

    const workItemService = new WorkItemService();
    const timeLogService = new TimeLogService();
    let created = 0;
    let skipped = 0;

    // Resolve user_id from email, or fall back to first user in DB
    let userId: string | null = null;
    const db = getDb();
    if (body.user_email) {
      const userResult = db.exec('SELECT id FROM users WHERE email = ? LIMIT 1', [body.user_email]);
      if (userResult.length > 0 && userResult[0].values.length > 0) {
        userId = userResult[0].values[0][0] as string;
      }
    }
    if (!userId) {
      // Default to first user (single-user setup)
      const defaultResult = db.exec('SELECT id FROM users ORDER BY created_at ASC LIMIT 1');
      if (defaultResult.length > 0 && defaultResult[0].values.length > 0) {
        userId = defaultResult[0].values[0][0] as string;
      }
    }

    for (const entry of body.entries) {
      // Skip steps entries (they're cumulative, not discrete events)
      // We could track them differently later
      if (entry.type === 'steps') {
        skipped++;
        continue;
      }

      // Check for duplicate by looking for existing items with same start_time
      // Use the start_time as a dedup key in the title
      const dedupeKey = `[hc:${entry.start_time}]`;
      const existing = workItemService.findAll(null, userId).find(
        (item: any) => item.description?.includes(dedupeKey)
      );
      
      if (existing) {
        skipped++;
        continue;
      }

      const title = generateTitle(entry);
      const description = generateDescription(entry) + `\n\n${dedupeKey}`;

      // Create work item as completed (checkered), tagged with user
      const workItem = workItemService.create({
        title,
        description,
        status: 'checkered',
        position: 0,
        parent_id: null,
        due_at: null,
        grid_points: entry.type === 'exercise' ? estimateGridPoints(entry.duration_ms) : 1 as 1,
        is_goal: false,
        is_recurring_template: false,
        goal_end_condition: null,
        goal_target: null,
      }, userId);

      // Create a time log entry for the activity
      if (entry.start_time && entry.end_time) {
        try {
          timeLogService.createManual(
            workItem.id,
            entry.start_time,
            entry.end_time,
            entry.notes || null
          );
        } catch (e) {
          // Time log creation is best-effort
          console.error('Failed to create time log for health entry:', e);
        }
      }

      created++;
    }

    res.json({
      ok: true,
      created,
      skipped,
      total: body.entries.length,
    });
  } catch (error) {
    next(error);
  }
});

// Estimate grid points based on workout duration (Fibonacci scale)
type GridPoints = 1 | 2 | 3 | 5 | 8 | 13 | 21;
function estimateGridPoints(durationMs: number): GridPoints {
  const minutes = durationMs / 60000;
  if (minutes < 15) return 1;
  if (minutes < 30) return 2;
  if (minutes < 60) return 3;
  if (minutes < 120) return 5;
  return 8;
}

export default router;

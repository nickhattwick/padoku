import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';

const DB_PATH = './apps/server/data/paddock.db';

async function main() {
  const SQL = await initSqlJs();
  const buffer = readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Next 2 weeks: Feb 2 - Feb 16, 2026
  const now = Date.now();
  const twoWeeksLater = now + (14 * 24 * 60 * 60 * 1000);

  // Query tasks with due dates in next 2 weeks (not completed)
  const query = `
    SELECT id, title, description, status, due_at, parent_id, is_goal
    FROM work_items
    WHERE due_at IS NOT NULL
      AND due_at <= ?
      AND status != 'checkered'
    ORDER BY due_at ASC
  `;

  const results = db.exec(query, [twoWeeksLater]);

  if (results.length === 0 || results[0].values.length === 0) {
    console.log('No tasks due in the next 2 weeks.');
  } else {
    console.log('Tasks due in the next 2 weeks:\n');
    const cols = results[0].columns;
    for (const row of results[0].values) {
      const task = {};
      cols.forEach((col, i) => task[col] = row[i]);
      const dueDate = task.due_at ? new Date(task.due_at).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }) : 'No due date';
      const statusEmoji = {
        'garage': '📦',
        'on_track': '🏎️',
        'pits': '🔧',
        'checkered': '🏁'
      }[task.status] || '❓';
      console.log(`${statusEmoji} ${task.title}`);
      console.log(`   Due: ${dueDate} | Status: ${task.status}`);
      if (task.description) console.log(`   ${task.description}`);
      console.log('');
    }
  }

  // Also show all non-completed tasks for context
  console.log('\n--- All active tasks (not checkered) ---\n');
  const allQuery = `
    SELECT id, title, status, due_at, is_goal
    FROM work_items
    WHERE status != 'checkered'
    ORDER BY due_at ASC NULLS LAST, position ASC
  `;
  const allResults = db.exec(allQuery);
  
  if (allResults.length > 0 && allResults[0].values.length > 0) {
    const cols = allResults[0].columns;
    for (const row of allResults[0].values) {
      const task = {};
      cols.forEach((col, i) => task[col] = row[i]);
      const dueDate = task.due_at ? new Date(task.due_at).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric'
      }) : 'No due date';
      const statusEmoji = {
        'garage': '📦',
        'on_track': '🏎️',
        'pits': '🔧'
      }[task.status] || '❓';
      const goalTag = task.is_goal ? ' 🎯' : '';
      console.log(`${statusEmoji} ${task.title}${goalTag} — ${dueDate} (${task.status})`);
    }
  } else {
    console.log('No active tasks found.');
  }

  db.close();
}

main().catch(console.error);

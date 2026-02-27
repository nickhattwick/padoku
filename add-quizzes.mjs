import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

const DB_PATH = './apps/server/data/paddock.db';

async function main() {
  const SQL = await initSqlJs();
  const buffer = readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  // Get Cybersecurity Fundamentals parent ID
  const parentResult = db.exec("SELECT id FROM work_items WHERE title = 'Cybersecurity Fundamentals'");
  if (!parentResult.length || !parentResult[0].values.length) {
    console.error('Cybersecurity Fundamentals not found!');
    db.close();
    return;
  }
  const parentId = parentResult[0].values[0][0];
  console.log('Parent ID:', parentId);

  // Check existing quizzes
  const existingQuizzes = db.exec(`SELECT title FROM work_items WHERE parent_id = '${parentId}' AND title LIKE 'Quiz%'`);
  const existingTitles = existingQuizzes.length ? existingQuizzes[0].values.map(r => r[0]) : [];
  console.log('Existing quizzes:', existingTitles);

  // Quiz schedule (times in UTC)
  // Quiz 1: Feb 6 11:59 PM EST = Feb 7 04:59 UTC (DONE - already passed)
  // Quiz 2: Mar 6 11:59 PM EST = Mar 7 04:59 UTC
  // Quiz 3: Mar 27 11:59 PM EDT = Mar 28 03:59 UTC
  // Quiz 4: Apr 10 11:59 PM EDT = Apr 11 03:59 UTC
  // Quiz 5: Apr 24 11:59 PM EDT = Apr 25 03:59 UTC
  const quizzes = [
    { title: 'Quiz 1', due: Date.UTC(2026, 1, 7, 4, 59, 0), status: 'checkered' },  // Feb 7 04:59 UTC (completed)
    { title: 'Quiz 2', due: Date.UTC(2026, 2, 7, 4, 59, 0), status: 'garage' },     // Mar 7 04:59 UTC
    { title: 'Quiz 3', due: Date.UTC(2026, 2, 28, 3, 59, 0), status: 'garage' },    // Mar 28 03:59 UTC (EDT)
    { title: 'Quiz 4', due: Date.UTC(2026, 3, 11, 3, 59, 0), status: 'garage' },    // Apr 11 03:59 UTC (EDT)
    { title: 'Quiz 5', due: Date.UTC(2026, 3, 25, 3, 59, 0), status: 'garage' },    // Apr 25 03:59 UTC (EDT)
  ];

  const now = Date.now();
  let added = 0;

  for (const quiz of quizzes) {
    if (existingTitles.includes(quiz.title)) {
      console.log(`${quiz.title} already exists, skipping`);
      continue;
    }

    const id = randomUUID();
    const description = '60 minute time limit. Cannot start after due date.';
    
    db.run(
      `INSERT INTO work_items (id, title, description, status, due_at, parent_id, created_at, updated_at, position, is_goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, quiz.title, description, quiz.status, quiz.due, parentId, now, now, 100 + added, 0]
    );
    
    const dueDate = new Date(quiz.due).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York'
    });
    console.log(`✅ Added ${quiz.title} - Due: ${dueDate} (${quiz.status})`);
    added++;
  }

  if (added > 0) {
    // Save the database
    const data = db.export();
    const outBuffer = Buffer.from(data);
    writeFileSync(DB_PATH, outBuffer);
    console.log(`\n💾 Saved ${added} new quiz(zes) to database`);
  } else {
    console.log('\nNo new quizzes to add.');
  }

  db.close();
}

main().catch(console.error);

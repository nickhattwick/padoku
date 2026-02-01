import Database from 'better-sqlite3';

const API_BASE = 'http://localhost:3000/api';
const OLD_DB_PATH = '/Users/nickhattwick/Code/chrono-conqueror/backend/data.db';

// Status mapping from ChronoConqueror to Paddock
const STATUS_MAP = {
  'Done': 'checkered',
  'done': 'checkered',
  'To Do': 'garage',
  'todo': 'garage',
  'In Progress': 'on_track',
  'in progress': 'on_track',
};

async function deleteAllWorkItems() {
  console.log('Fetching all work items...');
  const response = await fetch(`${API_BASE}/work-items`);
  const items = await response.json();

  console.log(`Deleting ${items.length} work items...`);
  for (const item of items) {
    await fetch(`${API_BASE}/work-items/${item.id}`, { method: 'DELETE' });
    console.log(`  Deleted: ${item.title}`);
  }
  console.log('All work items deleted.\n');
}

async function createWorkItem(data) {
  const response = await fetch(`${API_BASE}/work-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function migrateData() {
  console.log('Opening ChronoConqueror database...');
  const db = new Database(OLD_DB_PATH, { readonly: true });

  // Get all projects
  const projects = db.prepare('SELECT * FROM projects').all();
  console.log(`Found ${projects.length} projects\n`);

  // Get all flags
  const flags = db.prepare('SELECT * FROM flags').all();
  console.log(`Found ${flags.length} flags/tasks\n`);

  // Get circuits (Masters in CS)
  const circuits = db.prepare('SELECT * FROM circuits').all();
  console.log(`Found ${circuits.length} circuits\n`);

  // Create project ID mapping from old to new
  const projectIdMap = new Map();

  // First pass: Create all non-Masters projects as top-level items
  console.log('Creating top-level projects...');
  const mastersCourseIds = new Set([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

  for (const project of projects) {
    if (mastersCourseIds.has(project.id)) {
      continue; // Skip Masters courses for now
    }

    const status = project.completed === 1 ? 'checkered' :
                   project.active === 1 ? 'on_track' : 'garage';

    const newItem = await createWorkItem({
      title: project.title,
      description: project.description,
      status: status,
      parent_id: null,
      is_goal: project.id >= 10 && project.id <= 19 ? false : false, // Will make Masters in CS a goal separately
    });

    projectIdMap.set(project.id, newItem.id);
    console.log(`  Created project: ${project.title} (${status})`);
  }

  // Create Masters in CS as a goal with courses as children
  console.log('\nCreating Masters in CS hierarchy...');
  const mastersItem = await createWorkItem({
    title: 'Masters in CS',
    description: 'Complete Computer Science Masters Degree',
    status: 'on_track',
    parent_id: null,
    is_goal: true,
    goal_end_condition: 'Complete all 10 courses and receive diploma',
  });
  console.log(`  Created goal: Masters in CS`);

  // Now create each Masters course as a child
  const mastersCourses = projects.filter(p => mastersCourseIds.has(p.id));
  for (const course of mastersCourses) {
    const status = course.completed === 1 ? 'checkered' :
                   course.active === 1 ? 'on_track' : 'garage';

    const newCourse = await createWorkItem({
      title: course.title,
      description: course.description,
      status: status,
      parent_id: mastersItem.id,
      is_goal: false,
    });

    projectIdMap.set(course.id, newCourse.id);
    console.log(`  Created course: ${course.title} (${status})`);
  }

  // Second pass: Create all flags as children of their projects
  console.log('\nCreating flags/tasks...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const flag of flags) {
    const parentId = projectIdMap.get(flag.race_id);

    if (!parentId) {
      console.log(`  Skipped: "${flag.name}" (race_id ${flag.race_id} not found)`);
      skippedCount++;
      continue;
    }

    const status = STATUS_MAP[flag.status] || 'garage';

    await createWorkItem({
      title: flag.name,
      description: flag.description || null,
      status: status,
      parent_id: parentId,
      is_goal: false,
    });

    createdCount++;
    if (createdCount % 10 === 0) {
      console.log(`  Created ${createdCount} tasks...`);
    }
  }

  console.log(`\nCreated ${createdCount} tasks, skipped ${skippedCount}\n`);

  db.close();

  console.log('Migration complete! 🎉');
  console.log('\nSummary:');
  console.log(`  - Projects: ${projects.length - mastersCourses.length} top-level`);
  console.log(`  - Masters in CS: 1 goal with ${mastersCourses.length} courses`);
  console.log(`  - Tasks: ${createdCount} imported`);
}

async function main() {
  try {
    await deleteAllWorkItems();
    await migrateData();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();

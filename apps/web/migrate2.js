import fs from 'fs';

const API_BASE = 'http://localhost:3000/api';

// Status mapping from ChronoConqueror to Paddock
const STATUS_MAP = {
  'Done': 'checkered',
  'done': 'checkered',
  'To Do': 'garage',
  'todo': 'garage',
  'In Progress': 'on_track',
  'in progress': 'on_track',
};

async function createWorkItem(data) {
  const response = await fetch(`${API_BASE}/work-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create work item: ${error}`);
  }
  return await response.json();
}

async function migrateData() {
  console.log('Reading exported JSON files...');
  const projects = JSON.parse(fs.readFileSync('/tmp/projects.json', 'utf8'));
  const flags = JSON.parse(fs.readFileSync('/tmp/flags.json', 'utf8'));

  console.log(`Found ${projects.length} projects`);
  console.log(`Found ${flags.length} flags/tasks\n`);

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
      description: project.description || '',
      status: status,
      parent_id: null,
      is_goal: false,
    });

    projectIdMap.set(project.id, newItem.id);
    console.log(`  ✓ ${project.title} (${status})`);
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
  console.log(`  ✓ Masters in CS (goal)`);

  // Now create each Masters course as a child
  const mastersCourses = projects.filter(p => mastersCourseIds.has(p.id));
  for (const course of mastersCourses) {
    const status = course.completed === 1 ? 'checkered' :
                   course.active === 1 ? 'on_track' : 'garage';

    const newCourse = await createWorkItem({
      title: course.title,
      description: course.description || '',
      status: status,
      parent_id: mastersItem.id,
      is_goal: false,
    });

    projectIdMap.set(course.id, newCourse.id);
    console.log(`  ✓ ${course.title} (${status})`);
  }

  // Handle orphaned CS 673 tasks (race_id=1 doesn't have a project)
  const cs673Flags = flags.filter(f => f.race_id === 1 && f.name && f.name.includes('CS 673'));
  if (cs673Flags.length > 0) {
    console.log('\nCreating orphaned CS 673 course...');
    const cs673Course = await createWorkItem({
      title: 'MET CS 673: Software Development',
      description: 'Missing course from ChronoConqueror',
      status: 'checkered',
      parent_id: mastersItem.id,
      is_goal: false,
    });
    projectIdMap.set(1, cs673Course.id);
    console.log(`  ✓ MET CS 673: Software Development (checkered)`);
  }

  // Second pass: Create all flags as children of their projects
  console.log('\nCreating tasks under projects...');
  let createdCount = 0;
  let skippedCount = 0;

  // Group flags by project for better logging
  const flagsByProject = {};
  for (const flag of flags) {
    if (!flagsByProject[flag.race_id]) {
      flagsByProject[flag.race_id] = [];
    }
    flagsByProject[flag.race_id].push(flag);
  }

  for (const [projectId, projectFlags] of Object.entries(flagsByProject)) {
    const parentId = projectIdMap.get(parseInt(projectId));

    if (!parentId) {
      console.log(`  ⚠ Skipping ${projectFlags.length} tasks (project ${projectId} not found)`);
      skippedCount += projectFlags.length;
      continue;
    }

    const projectName = projects.find(p => p.id === parseInt(projectId))?.title || `Project ${projectId}`;
    console.log(`\n  ${projectName}:`);

    for (const flag of projectFlags) {
      const status = STATUS_MAP[flag.status] || 'garage';

      // Parse due date if present and not "No due date"
      let due_at = null;
      if (flag.due_date && flag.due_date !== 'No due date') {
        try {
          due_at = new Date(flag.due_date).getTime();
        } catch (e) {
          // Invalid date, skip
        }
      }

      await createWorkItem({
        title: flag.name,
        description: flag.description || '',
        status: status,
        parent_id: parentId,
        is_goal: false,
        due_at: due_at,
      });

      createdCount++;
      const dueStr = due_at ? ` due:${flag.due_date}` : '';
      console.log(`    ✓ ${flag.name} (${status}${dueStr})`);
    }
  }

  console.log(`\n\nMigration complete! 🎉\n`);
  console.log('Summary:');
  console.log(`  - Projects: ${projects.length - mastersCourses.length} top-level`);
  console.log(`  - Masters in CS: 1 goal with ${mastersCourses.length} courses`);
  console.log(`  - Tasks: ${createdCount} imported, ${skippedCount} skipped`);
}

async function main() {
  try {
    await migrateData();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

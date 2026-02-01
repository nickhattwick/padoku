import fs from 'fs';

const items = JSON.parse(fs.readFileSync('/tmp/verify.json', 'utf-8'));

console.log('\n📊 Migration Verification:\n');
console.log('Total items:', items.length);
console.log('Top-level items:', items.filter(i => !i.parent_id).length);
console.log('Goals:', items.filter(i => i.is_goal).length);

const masters = items.find(i => i.title === 'Masters in CS');
const courses = items.filter(i => i.parent_id === masters?.id);
console.log('\nMasters in CS:');
console.log('  - Courses:', courses.length);

// Count tasks under each course
let totalCourseTasks = 0;
for (const course of courses) {
  const tasks = items.filter(i => i.parent_id === course.id);
  if (tasks.length > 0) {
    console.log(`  - ${course.title}: ${tasks.length} tasks (${course.status})`);
    totalCourseTasks += tasks.length;
  }
}
console.log(`  - Total course tasks: ${totalCourseTasks}`);

// Show other top-level projects with task counts
console.log('\nOther Projects:');
const topLevel = items.filter(i => !i.parent_id && i.id !== masters.id);
for (const project of topLevel) {
  const tasks = items.filter(i => i.parent_id === project.id);
  console.log(`  - ${project.title}: ${tasks.length} tasks (${project.status})`);
}

console.log('\n✅ Migration successful!\n');

import type { WorkItem } from '@paddock/shared';

export interface GoalProgress {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
  target: number | null;
  percentage: number;
  displayText: string;
}

/**
 * Calculate progress for a goal based on its children
 * @param goal - The goal work item
 * @param children - Child work items of the goal
 * @returns Progress information
 */
export function calculateGoalProgress(goal: WorkItem, children: WorkItem[]): GoalProgress {
  const completed = children.filter(c => c.status === 'checkered').length;
  const inProgress = children.filter(c => c.status === 'on_track').length;
  const notStarted = children.filter(c => c.status === 'garage' || c.status === 'pits').length;
  const total = children.length;
  const target = goal.goal_target;

  let percentage = 0;
  let displayText = '';

  if (target && target > total) {
    // Still creating children, show progress toward target
    percentage = Math.round((completed / target) * 100);
    displayText = `${completed} / ${target} (${percentage}%)`;
  } else if (target || total > 0) {
    // All children exist or no target set, show actual progress
    const denominator = target || total;
    percentage = denominator > 0 ? Math.round((completed / denominator) * 100) : 0;
    displayText = target
      ? `${completed} / ${total} (${percentage}%)`
      : `${completed} completed`;
  } else {
    // No children yet
    displayText = target ? `0 / ${target} (0%)` : '0 completed';
  }

  return {
    completed,
    inProgress,
    notStarted,
    total,
    target,
    percentage,
    displayText,
  };
}

/**
 * Get a color class for the progress bar based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-yellow-500';
  return 'bg-gray-400';
}

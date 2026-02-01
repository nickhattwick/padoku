import type { WorkItem } from '@paddock/shared';
import { calculateGoalProgress, getProgressColor } from '../../utils/goalProgress';

interface GoalProgressBadgeProps {
  goal: WorkItem;
  children: WorkItem[];
  size?: 'small' | 'large';
}

export const GoalProgressBadge = ({ goal, children, size = 'small' }: GoalProgressBadgeProps) => {
  const progress = calculateGoalProgress(goal, children);
  const colorClass = getProgressColor(progress.percentage);

  if (size === 'small') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
          <div
            className={`${colorClass} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <span className="text-gray-600 font-medium whitespace-nowrap">
          {progress.displayText}
        </span>
      </div>
    );
  }

  // Large size for detailed view
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">
            {progress.displayText}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${colorClass} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{progress.completed}</div>
          <div className="text-xs text-green-600">✅ Completed</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{progress.inProgress}</div>
          <div className="text-xs text-blue-600">🏁 On Track</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-700">{progress.notStarted}</div>
          <div className="text-xs text-gray-600">📦 Not Started</div>
        </div>
      </div>

      {goal.goal_target && goal.goal_target > progress.total && (
        <div className="text-xs text-gray-500 italic">
          Target: {goal.goal_target} items ({progress.total} created so far)
        </div>
      )}
    </div>
  );
};

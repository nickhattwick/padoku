import { useGoalMetrics } from '../../api/queries';

interface GoalProgressProps {
  startDate: number;
  endDate: number;
}

export const GoalProgress = ({ startDate, endDate }: GoalProgressProps) => {
  const { data, isLoading, error } = useGoalMetrics(startDate, endDate);

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">🎯</span> Goal Progress
        </h3>
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">🎯</span> Goal Progress
        </h3>
        <div className="text-red-400">Error loading goal data</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-green-400">🎯</span> Goal Progress
        </h3>
      </div>

      {/* Total Goals */}
      <div className="mb-6">
        <div className="text-4xl font-black text-white mb-1">
          {data.totalGoals}
        </div>
        <div className="text-sm text-gray-400">Total Goals</div>
      </div>

      {/* Completion Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Completion Rate</span>
          <span className="text-sm font-bold text-green-400">
            {data.completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${data.completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
          <div className="text-2xl font-black text-green-400 mb-1">
            {data.completedGoals}
          </div>
          <div className="text-xs text-green-300/70">✅ Completed</div>
        </div>
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
          <div className="text-2xl font-black text-blue-400 mb-1">
            {data.activeGoals}
          </div>
          <div className="text-xs text-blue-300/70">🏁 Active</div>
        </div>
      </div>
    </div>
  );
};

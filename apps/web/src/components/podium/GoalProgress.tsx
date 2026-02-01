import { useGoalMetrics } from '../../api/queries';

interface GoalProgressProps {
  startDate: number;
  endDate: number;
}

export const GoalProgress = ({ startDate, endDate }: GoalProgressProps) => {
  const { data, isLoading, error } = useGoalMetrics(startDate, endDate);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
        <div className="text-red-500">Error loading goal data</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🎯 Goal Progress</h3>
      </div>

      {/* Total Goals */}
      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {data.totalGoals}
        </div>
        <div className="text-sm text-gray-600">Total Goals</div>
      </div>

      {/* Completion Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
          <span className="text-sm font-bold text-gray-900">
            {data.completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${data.completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {data.completedGoals}
          </div>
          <div className="text-xs text-green-600">✅ Completed</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {data.activeGoals}
          </div>
          <div className="text-xs text-blue-600">🏁 Active</div>
        </div>
      </div>
    </div>
  );
};

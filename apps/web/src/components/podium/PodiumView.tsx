import { useDateRange } from '../../hooks/useDateRange';
import { PeriodSelector } from './PeriodSelector';
import { GoalProgress } from './GoalProgress';
import { VelocityChart } from './VelocityChart';
import { BurndownChart } from './BurndownChart';
import { TimeBreakdown } from './TimeBreakdown';

export const PodiumView = () => {
  const { period, setPeriod, startDate, endDate, granularity } = useDateRange('gp');

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🏆 Podium
            </h2>
            <p className="text-sm text-gray-500">Performance metrics and analytics</p>
          </div>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Top Row: Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GoalProgress startDate={startDate} endDate={endDate} />

          {/* Velocity Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🏁 Velocity</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-1">
              --
            </div>
            <div className="text-sm text-gray-600">Tasks/period</div>
            <div className="mt-4 text-xs text-gray-500">
              Completion rate over time
            </div>
          </div>

          {/* Time Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">⏱️ Time Tracked</h3>
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-1">
              --
            </div>
            <div className="text-sm text-gray-600">Total hours</div>
            <div className="mt-4 text-xs text-gray-500">
              Time spent across all tasks
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Velocity Trend</h3>
            <VelocityChart
              startDate={startDate}
              endDate={endDate}
              granularity={granularity}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Burndown</h3>
            <BurndownChart startDate={startDate} endDate={endDate} />
          </div>
        </div>

        {/* Time Breakdown Row */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Time Spent Analysis</h3>
          <TimeBreakdown
            startDate={startDate}
            endDate={endDate}
            granularity={granularity}
          />
        </div>
      </div>
    </div>
  );
};

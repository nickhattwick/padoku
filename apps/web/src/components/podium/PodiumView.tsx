import { useDateRange } from '../../hooks/useDateRange';
import { PeriodSelector } from './PeriodSelector';
import { GoalProgress } from './GoalProgress';
import { VelocityChart } from './VelocityChart';
import { BurndownChart } from './BurndownChart';
import { TimeBreakdown } from './TimeBreakdown';

export const PodiumView = () => {
  const { period, setPeriod, startDate, endDate, granularity } = useDateRange('gp');

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Sticky Header */}
      <div className="bg-gray-900/95 backdrop-blur border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400">🏆</span> Podium
            </h2>
            <p className="text-sm text-gray-400">Performance metrics and analytics</p>
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
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">🏁</span> Velocity
              </h3>
            </div>
            <div className="text-4xl font-black text-blue-400 mb-1">
              --
            </div>
            <div className="text-sm text-gray-400">Tasks/period</div>
            <div className="mt-4 text-xs text-gray-500 bg-gray-800 rounded-lg px-3 py-2">
              Completion rate over time
            </div>
          </div>

          {/* Time Summary Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-orange-400">⏱️</span> Time Tracked
              </h3>
            </div>
            <div className="text-4xl font-black text-orange-400 mb-1">
              --
            </div>
            <div className="text-sm text-gray-400">Total hours</div>
            <div className="mt-4 text-xs text-gray-500 bg-gray-800 rounded-lg px-3 py-2">
              Time spent across all tasks
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">📈</span> Velocity Trend
            </h3>
            <VelocityChart
              startDate={startDate}
              endDate={endDate}
              granularity={granularity}
            />
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">📉</span> Burndown
            </h3>
            <BurndownChart startDate={startDate} endDate={endDate} />
          </div>
        </div>

        {/* Time Breakdown Row */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">🕐</span> Time Spent Analysis
          </h3>
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

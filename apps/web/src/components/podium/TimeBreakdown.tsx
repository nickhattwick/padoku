import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTimeSpent } from '../../api/queries';
import type { AnalyticsGranularity } from '@paddock/shared';

interface TimeBreakdownProps {
  startDate: number;
  endDate: number;
  granularity: AnalyticsGranularity;
}

export const TimeBreakdown = ({ startDate, endDate, granularity }: TimeBreakdownProps) => {
  const { data, isLoading, error } = useTimeSpent(startDate, endDate, granularity);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400 animate-pulse">Loading time data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-400">Error loading time data</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-500">No time tracking data available</div>
      </div>
    );
  }

  // Convert milliseconds to hours and format data for stacked bars
  const formattedData = data.map(d => ({
    period: d.period,
    garage: (d.byStatus.garage || 0) / (1000 * 60 * 60),
    on_track: (d.byStatus.on_track || 0) / (1000 * 60 * 60),
    pits: (d.byStatus.pits || 0) / (1000 * 60 * 60),
    checkered: (d.byStatus.checkered || 0) / (1000 * 60 * 60),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="period"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#9ca3af' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#9ca3af' }}
          label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
          formatter={(value: number) => `${value.toFixed(2)}h`}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Bar dataKey="garage" stackId="a" fill="#6b7280" name="🔧 Garage" radius={[0, 0, 0, 0]} />
        <Bar dataKey="on_track" stackId="a" fill="#3b82f6" name="🏎️ On Track" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pits" stackId="a" fill="#f59e0b" name="⏸️ Pits" radius={[0, 0, 0, 0]} />
        <Bar dataKey="checkered" stackId="a" fill="#22c55e" name="🏁 Checkered" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

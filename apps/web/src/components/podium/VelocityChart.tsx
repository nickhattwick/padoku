import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useVelocity } from '../../api/queries';
import type { AnalyticsGranularity } from '@paddock/shared';

interface VelocityChartProps {
  startDate: number;
  endDate: number;
  granularity: AnalyticsGranularity;
}

export const VelocityChart = ({ startDate, endDate, granularity }: VelocityChartProps) => {
  const { data, isLoading, error } = useVelocity(startDate, endDate, granularity);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400 animate-pulse">Loading velocity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-400">Error loading velocity data</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-500">No velocity data available</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          label={{ value: 'Completed Items', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4, stroke: '#1f2937', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#60a5fa' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

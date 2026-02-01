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
        <div className="text-gray-500">Loading velocity data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-500">Error loading velocity data</div>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Completed Items', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#1e88e5"
          strokeWidth={2}
          dot={{ fill: '#1e88e5', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

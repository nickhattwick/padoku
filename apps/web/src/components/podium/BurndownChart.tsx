import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useBurndown } from '../../api/queries';
import { format } from 'date-fns';

interface BurndownChartProps {
  startDate: number;
  endDate: number;
}

export const BurndownChart = ({ startDate, endDate }: BurndownChartProps) => {
  const { data, isLoading, error } = useBurndown(startDate, endDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-400 animate-pulse">Loading burndown data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-400">Error loading burndown data</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-gray-500">No burndown data available</div>
      </div>
    );
  }

  // Format data for display
  const formattedData = data.map(d => ({
    ...d,
    dateLabel: format(new Date(d.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="dateLabel"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#9ca3af' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#9ca3af' }}
          label={{ value: 'Work Items', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#e5e7eb',
          }}
        />
        <Legend 
          wrapperStyle={{ color: '#9ca3af' }}
        />
        <Area
          type="monotone"
          dataKey="totalWork"
          stackId="1"
          stroke="#6b7280"
          fill="#374151"
          name="Total Work"
        />
        <Area
          type="monotone"
          dataKey="remaining"
          stackId="2"
          stroke="#f59e0b"
          fill="rgba(245, 158, 11, 0.4)"
          name="Remaining"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stackId="2"
          stroke="#22c55e"
          fill="rgba(34, 197, 94, 0.4)"
          name="Completed"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

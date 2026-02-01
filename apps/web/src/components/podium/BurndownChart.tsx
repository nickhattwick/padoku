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
        <div className="text-gray-500">Loading burndown data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-500">Error loading burndown data</div>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="dateLabel"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Work Items', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="totalWork"
          stackId="1"
          stroke="#9ca3af"
          fill="#e5e7eb"
          name="Total Work"
        />
        <Area
          type="monotone"
          dataKey="remaining"
          stackId="2"
          stroke="#fb8c00"
          fill="#ffb74d"
          name="Remaining"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stackId="2"
          stroke="#43a047"
          fill="#81c784"
          name="Completed"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

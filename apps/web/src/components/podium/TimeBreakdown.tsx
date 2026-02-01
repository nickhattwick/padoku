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
        <div className="text-gray-500">Loading time data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-red-500">Error loading time data</div>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `${value.toFixed(2)}h`}
        />
        <Legend />
        <Bar dataKey="garage" stackId="a" fill="#9ca3af" name="Garage" />
        <Bar dataKey="on_track" stackId="a" fill="#1e88e5" name="On Track" />
        <Bar dataKey="pits" stackId="a" fill="#fb8c00" name="Pits" />
        <Bar dataKey="checkered" stackId="a" fill="#43a047" name="Checkered" />
      </BarChart>
    </ResponsiveContainer>
  );
};

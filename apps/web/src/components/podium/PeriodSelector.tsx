import type { RacingPeriod } from '../../hooks/useDateRange';

interface PeriodSelectorProps {
  period: RacingPeriod;
  onChange: (period: RacingPeriod) => void;
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  return (
    <div className="flex bg-gray-100 rounded-md p-1">
      <button
        onClick={() => onChange('race')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          period === 'race'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🏁 Race (Today)
      </button>
      <button
        onClick={() => onChange('gp')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          period === 'gp'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🏆 GP (Week)
      </button>
      <button
        onClick={() => onChange('season')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          period === 'season'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🎯 Season (Month)
      </button>
      <button
        onClick={() => onChange('championship')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          period === 'championship'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        👑 Championship (Quarter)
      </button>
    </div>
  );
};

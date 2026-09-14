import type { RacingPeriod } from '../../hooks/useDateRange';

interface PeriodSelectorProps {
  period: RacingPeriod;
  onChange: (period: RacingPeriod) => void;
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  const options: { value: RacingPeriod; label: string; emoji: string }[] = [
    { value: 'race', label: 'Race', emoji: '🏁' },
    { value: 'gp', label: 'GP', emoji: '🏆' },
    { value: 'season', label: 'Season', emoji: '🎯' },
    { value: 'championship', label: 'Champ', emoji: '👑' },
  ];

  return (
    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            period === opt.value
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <span className="mr-1">{opt.emoji}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

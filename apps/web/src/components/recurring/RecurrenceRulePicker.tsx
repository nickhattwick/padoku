import { RecurrenceRule, DAYS_OF_WEEK } from '@paddock/shared';

interface RecurrenceRulePickerProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule) => void;
}

export const RecurrenceRulePicker = ({ value, onChange }: RecurrenceRulePickerProps) => {
  const rule = value || { frequency: 'daily', interval: 1 };

  return (
    <div className="space-y-3 mt-2">
      {/* Frequency selector */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Frequency</label>
        <select
          value={rule.frequency}
          onChange={(e) => onChange({ ...rule, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-track-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Interval */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Every
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={rule.interval || 1}
            onChange={(e) => onChange({ ...rule, interval: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-track-500"
          />
          <span className="text-sm text-gray-600">
            {rule.frequency === 'daily' ? 'day(s)' : rule.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
          </span>
        </div>
      </div>

      {/* Days of week (for weekly) */}
      {rule.frequency === 'weekly' && (
        <div>
          <label className="block text-sm text-gray-600 mb-2">On days:</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => {
                  const days = rule.daysOfWeek || [];
                  const newDays = days.includes(day.value)
                    ? days.filter(d => d !== day.value)
                    : [...days, day.value].sort();
                  onChange({ ...rule, daysOfWeek: newDays });
                }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  (rule.daysOfWeek || []).includes(day.value)
                    ? 'bg-track-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
          {(!rule.daysOfWeek || rule.daysOfWeek.length === 0) && (
            <p className="text-xs text-gray-500 mt-1">Select at least one day</p>
          )}
        </div>
      )}

      {/* Day of month (for monthly) */}
      {rule.frequency === 'monthly' && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">On day:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="31"
              value={rule.dayOfMonth || 1}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 31) {
                  onChange({ ...rule, dayOfMonth: value });
                }
              }}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-track-500"
            />
            <span className="text-sm text-gray-600">of the month</span>
          </div>
        </div>
      )}
    </div>
  );
};

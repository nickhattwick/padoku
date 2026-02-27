import { useMemo, useState } from 'react';
import {
  RACERS,
  simulateRace,
  getPositionMedal,
  getPositionPoints,
  getRandomCatchphrase,
  type Racer,
  type RaceResult,
} from '@paddock/shared';
import { useAllWorkItems } from '../../api/queries';

// Get current week number
const getWeekNumber = (date: Date = new Date()): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// Get week date range
const getWeekRange = (weekNumber: number, year: number = new Date().getFullYear()): string => {
  const startOfYear = new Date(year, 0, 1);
  const daysToAdd = (weekNumber - 1) * 7 - startOfYear.getDay();
  const weekStart = new Date(year, 0, 1 + daysToAdd);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
};

interface RacerCardProps {
  result: RaceResult;
  isExpanded: boolean;
  onToggle: () => void;
}

const RacerCard = ({ result, isExpanded, onToggle }: RacerCardProps) => {
  const { racer, points, isPlayer, position = 0 } = result;
  const medal = getPositionMedal(position);
  const championshipPoints = getPositionPoints(position);

  const bgColor = isPlayer
    ? 'bg-gradient-to-r from-track-100 to-track-200 border-track-400'
    : position <= 3
    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300'
    : 'bg-white border-gray-200';

  const colorClass = racer ? `text-${racer.color}-600` : 'text-track-600';

  return (
    <div
      className={`border rounded-lg p-4 ${bgColor} cursor-pointer transition-all hover:shadow-md`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Position */}
          <div className="w-8 text-center">
            {medal ? (
              <span className="text-2xl">{medal}</span>
            ) : (
              <span className="text-lg font-bold text-gray-400">P{position}</span>
            )}
          </div>

          {/* Avatar/Emoji */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
            {isPlayer ? '🏎️' : racer?.emoji}
          </div>

          {/* Name & Title */}
          <div>
            <div className="font-bold text-gray-900">
              {isPlayer ? 'YOU' : racer?.name}
            </div>
            <div className={`text-sm ${isPlayer ? 'text-track-600' : 'text-gray-500'}`}>
              {isPlayer ? 'The Competitor' : racer?.racingName}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{points} GP</div>
          <div className="text-sm text-gray-500">+{championshipPoints} pts</div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && racer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Vehicle */}
          <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{racer.vehicleEmoji}</span>
            <div>
              <div className="text-xs text-gray-500">Vehicle</div>
              <div className="text-sm font-medium text-gray-700">{racer.vehicle}</div>
            </div>
          </div>

          {/* Profession & Quote */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Profession:</span>
            <span className="text-sm">{racer.profession}</span>
          </div>
          <div className="italic text-gray-600 text-sm mb-4">
            "{getRandomCatchphrase(racer)}"
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-xs mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold">{racer.consistency}</div>
              <div className="text-gray-500">Consistency</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold">{racer.peakPower}</div>
              <div className="text-gray-500">Peak Power</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold">{racer.startStrength}</div>
              <div className="text-gray-500">Fast Start</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold">{racer.endStrength}</div>
              <div className="text-gray-500">Clutch</div>
            </div>
          </div>

          {/* Completed Tickets */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              🏁 Recently Checkered
            </h4>
            <div className="space-y-2">
              {racer.completedTickets.slice(0, 3).map((ticket, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{ticket.title}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {ticket.gridPoints} GP
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 italic">
                    "{ticket.completedQuip}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isExpanded && isPlayer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Your Grid Points are calculated from tasks you complete this week.
            Keep racing to climb the standings! 🏁
          </div>
        </div>
      )}
    </div>
  );
};

export const RacingView = () => {
  const currentWeek = getWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [expandedRacer, setExpandedRacer] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Fetch all work items to calculate player's weekly GP
  const { data: allItems = [] } = useAllWorkItems();

  // Calculate player's points for the selected week
  const playerPoints = useMemo(() => {
    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekStart = new Date(startOfYear);
    weekStart.setDate(weekStart.getDate() + (selectedWeek - 1) * 7 - startOfYear.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Sum GP of items completed (checkered) this week
    return allItems
      .filter((item) => {
        if (item.status !== 'checkered') return false;
        const updatedAt = item.updated_at;
        return updatedAt >= weekStart.getTime() && updatedAt < weekEnd.getTime();
      })
      .reduce((sum, item) => sum + (item.grid_points || 0), 0);
  }, [allItems, selectedWeek]);

  // Simulate race
  const raceResults = useMemo(
    () => simulateRace(selectedWeek, playerPoints, difficulty),
    [selectedWeek, playerPoints, difficulty]
  );

  const playerResult = raceResults.find((r) => r.isPlayer);
  const playerPosition = playerResult?.position || 9;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏁 Grand Prix Week {selectedWeek}
          </h1>
          <p className="text-gray-500">{getWeekRange(selectedWeek)}</p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            ← Prev Week
          </button>
          <span className="font-medium">Week {selectedWeek}</span>
          <button
            onClick={() => setSelectedWeek((w) => Math.min(52, w + 1))}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Next Week →
          </button>
          {selectedWeek !== currentWeek && (
            <button
              onClick={() => setSelectedWeek(currentWeek)}
              className="px-3 py-1 rounded bg-track-100 hover:bg-track-200 text-track-700"
            >
              Current
            </button>
          )}
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-gray-500">Difficulty:</span>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                difficulty === d
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Player Summary */}
        <div className="bg-gradient-to-r from-track-500 to-track-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">Your Position</div>
              <div className="text-4xl font-bold">
                {getPositionMedal(playerPosition)} P{playerPosition}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Grid Points Earned</div>
              <div className="text-4xl font-bold">{playerPoints} GP</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Championship Points</div>
              <div className="text-4xl font-bold">+{getPositionPoints(playerPosition)}</div>
            </div>
          </div>
          {playerPosition <= 3 && (
            <div className="mt-4 text-center text-lg">
              🎉 Podium Finish! {playerPosition === 1 ? "You're the champion!" : 'Great race!'}
            </div>
          )}
          {playerPoints === 0 && (
            <div className="mt-4 text-center text-sm opacity-80">
              Complete tasks with Grid Points to score in the race!
            </div>
          )}
        </div>

        {/* Standings */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Race Standings</h2>
          {raceResults.map((result) => (
            <RacerCard
              key={result.isPlayer ? 'player' : result.racer?.id}
              result={result}
              isExpanded={
                expandedRacer === (result.isPlayer ? 'player' : result.racer?.id)
              }
              onToggle={() =>
                setExpandedRacer((prev) => {
                  const id = result.isPlayer ? 'player' : result.racer?.id;
                  return prev === id ? null : id || null;
                })
              }
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Championship Points</h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>🥇 P1: 25pts</span>
            <span>🥈 P2: 18pts</span>
            <span>🥉 P3: 15pts</span>
            <span>P4: 12pts</span>
            <span>P5: 10pts</span>
            <span>P6: 8pts</span>
            <span>P7: 6pts</span>
            <span>P8: 4pts</span>
            <span>P9: 2pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

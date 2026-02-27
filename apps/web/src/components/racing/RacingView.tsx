import { useMemo, useState } from 'react';
import {
  simulateRace,
  getPositionMedal,
  getPositionPoints,
  getRandomCatchphrase,
  type Racer,
  type RaceResult,
} from '@paddock/shared';
import { useAllWorkItems } from '../../api/queries';

// Get day of year (1-366)
const getDayOfYear = (date: Date = new Date()): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

// Get date from day of year
const getDateFromDayOfYear = (dayOfYear: number, year: number = new Date().getFullYear()): Date => {
  const date = new Date(year, 0, dayOfYear);
  return date;
};

// Format date for display
const formatRaceDate = (dayOfYear: number, year: number = new Date().getFullYear()): string => {
  const date = getDateFromDayOfYear(dayOfYear, year);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

// Modal for racer details
interface RacerModalProps {
  racer: Racer;
  result: RaceResult;
  onClose: () => void;
}

const RacerModal = ({ racer, result, onClose }: RacerModalProps) => {
  const { points, position = 0 } = result;
  const medal = getPositionMedal(position);
  const championshipPoints = getPositionPoints(position);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header with large image */}
          <div className={`relative bg-gradient-to-br from-${racer.color}-100 to-${racer.color}-200 p-6 rounded-t-2xl`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>

            <div className="flex flex-col items-center">
              {/* Large portrait */}
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                {racer.image ? (
                  <img
                    src={racer.image}
                    alt={racer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100">
                    {racer.emoji}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <h2 className="text-2xl font-bold text-gray-900">{racer.name}</h2>
              <p className="text-gray-600">{racer.racingName}</p>

              {/* Position badge */}
              <div className="mt-3 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl">{medal || `P${position}`}</div>
                  <div className="text-xs text-gray-500">Position</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{points} GP</div>
                  <div className="text-xs text-gray-500">Grid Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">+{championshipPoints}</div>
                  <div className="text-xs text-gray-500">Championship</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Vehicle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
              <span className="text-3xl">{racer.vehicleEmoji}</span>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</div>
                <div className="font-medium text-gray-800">{racer.vehicle}</div>
              </div>
            </div>

            {/* Profession & Quote */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Profession:</span> {racer.profession}
              </div>
              <div className="italic text-gray-600 text-lg">
                "{getRandomCatchphrase(racer)}"
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{racer.consistency}</div>
                <div className="text-xs text-gray-500">Consistency</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{racer.peakPower}</div>
                <div className="text-xs text-gray-500">Peak Power</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{racer.startStrength}</div>
                <div className="text-xs text-gray-500">Fast Start</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-600">{racer.endStrength}</div>
                <div className="text-xs text-gray-500">Clutch</div>
              </div>
            </div>

            {/* Completed Tickets */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🏁 Recently Checkered
              </h4>
              <div className="space-y-2">
                {racer.completedTickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{ticket.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                        {ticket.gridPoints} GP
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 italic">
                      "{ticket.completedQuip}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface RacerCardProps {
  result: RaceResult;
  onClick: () => void;
}

const RacerCard = ({ result, onClick }: RacerCardProps) => {
  const { racer, points, isPlayer, position = 0 } = result;
  const medal = getPositionMedal(position);
  const championshipPoints = getPositionPoints(position);

  const bgColor = isPlayer
    ? 'bg-gradient-to-r from-track-100 to-track-200 border-track-400'
    : position <= 3
    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-300'
    : 'bg-white border-gray-200';

  return (
    <div
      className={`border rounded-lg p-4 ${bgColor} cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]`}
      onClick={onClick}
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

          {/* Avatar/Image */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl overflow-hidden">
            {isPlayer ? (
              '🏎️'
            ) : racer?.image ? (
              <img
                src={racer.image}
                alt={racer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              racer?.emoji
            )}
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
    </div>
  );
};

export const RacingView = () => {
  const currentDay = getDayOfYear();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedRacer, setSelectedRacer] = useState<{ racer: Racer; result: RaceResult } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Fetch all work items to calculate player's daily GP
  const { data: allItems = [] } = useAllWorkItems();

  // Calculate player's points for the selected day
  const playerPoints = useMemo(() => {
    const date = getDateFromDayOfYear(selectedDay);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    // Sum GP of items completed (checkered) this day
    return allItems
      .filter((item) => {
        if (item.status !== 'checkered') return false;
        const updatedAt = item.updated_at;
        return updatedAt >= dayStart && updatedAt < dayEnd;
      })
      .reduce((sum, item) => sum + (item.grid_points || 0), 0);
  }, [allItems, selectedDay]);

  // Simulate race (use day number as seed)
  const raceResults = useMemo(
    () => simulateRace(selectedDay, playerPoints, difficulty),
    [selectedDay, playerPoints, difficulty]
  );

  const playerResult = raceResults.find((r) => r.isPlayer);
  const playerPosition = playerResult?.position || 9;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏁 Daily Race
          </h1>
          <p className="text-gray-500 text-lg">{formatRaceDate(selectedDay)}</p>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            ← Yesterday
          </button>
          <span className="font-medium">Day {selectedDay}</span>
          <button
            onClick={() => setSelectedDay((d) => Math.min(366, d + 1))}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Tomorrow →
          </button>
          {selectedDay !== currentDay && (
            <button
              onClick={() => setSelectedDay(currentDay)}
              className="px-3 py-1 rounded bg-track-100 hover:bg-track-200 text-track-700"
            >
              Today
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
              Complete tasks with Grid Points today to score in the race!
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
              onClick={() => {
                if (result.racer && !result.isPlayer) {
                  setSelectedRacer({ racer: result.racer, result });
                }
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Championship Points (F1 Style)</h3>
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
          <p className="text-xs text-gray-500 mt-2">
            Complete tasks with Grid Points to earn race points. Daily races determine your standings!
          </p>
        </div>
      </div>

      {/* Racer Modal (rendered at root level for proper z-index) */}
      {selectedRacer && (
        <RacerModal
          racer={selectedRacer.racer}
          result={selectedRacer.result}
          onClose={() => setSelectedRacer(null)}
        />
      )}
    </div>
  );
};

import { useMemo, useState } from 'react';
import {
  simulateRace,
  simulateGrandPrixStandings,
  getPositionMedal,
  getPositionPoints,
  getRandomCatchphrase,
  RACERS,
  type Racer,
  type RaceResult,
  type ChampionshipStanding,
} from '@paddock/shared';
import { useAllWorkItems } from '../../api/queries';
import '../../styles/racing.css';

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
  result?: RaceResult;
  standing?: ChampionshipStanding;
  onClose: () => void;
}

const RacerModal = ({ racer, result, standing, onClose }: RacerModalProps) => {
  const points = result?.points ?? 0;
  const position = result?.position ?? standing?.position ?? 0;
  const medal = getPositionMedal(position);
  const championshipPoints = result ? getPositionPoints(position) : standing?.totalPoints ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          {/* Header with checkered pattern accent */}
          <div className="relative p-6 checkered-border-animated">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              ×
            </button>

            <div className="flex flex-col items-center pt-4">
              {/* Large portrait with tier badge */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                  position === 1 ? 'border-yellow-400 glow-gold' :
                  position === 2 ? 'border-gray-300 glow-silver' :
                  position === 3 ? 'border-amber-600 glow-bronze' :
                  'border-gray-600'
                } shadow-xl`}>
                  {racer.image ? (
                    <img
                      src={racer.image}
                      alt={racer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">
                      {racer.emoji}
                    </div>
                  )}
                </div>
                {/* Tier badge */}
                <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-xs font-bold rounded uppercase ${
                  racer.tier === 'elite' ? 'bg-yellow-500 text-black' :
                  racer.tier === 'pro' ? 'bg-purple-500 text-white' :
                  racer.tier === 'amateur' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {racer.tier}
                </span>
              </div>

              {/* Name & Title */}
              <h2 className="text-2xl font-black text-white mt-4 speed-text">{racer.name}</h2>
              <p className="text-gray-400 italic">{racer.racingName}</p>

              {/* Stats row */}
              <div className="mt-4 flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">
                    {medal || <span className="text-gray-500">P{position}</span>}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Position</div>
                </div>
                {result && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{points}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Grid Pts</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {result ? `+${championshipPoints}` : championshipPoints}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {result ? 'Race Pts' : 'Season Pts'}
                  </div>
                </div>
                {standing && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{standing.wins}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{standing.podiums}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Podiums</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Vehicle */}
            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <span className="text-4xl">{racer.vehicleEmoji}</span>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Vehicle</div>
                <div className="font-medium text-white">{racer.vehicle}</div>
              </div>
            </div>

            {/* Profession & Quote */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                <span className="text-gray-500">Profession:</span> {racer.profession}
              </div>
              <div className="italic text-lg text-purple-300 border-l-4 border-purple-500 pl-4 py-2 bg-purple-500/10 rounded-r">
                "{getRandomCatchphrase(racer)}"
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Consistency', value: racer.consistency, color: 'blue' },
                { label: 'Peak Power', value: racer.peakPower, color: 'red' },
                { label: 'Fast Start', value: racer.startStrength, color: 'green' },
                { label: 'Clutch', value: racer.endStrength, color: 'amber' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Completed Tickets */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                🏁 <span className="speed-text">Recently Checkered</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {racer.completedTickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">{ticket.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded font-bold">
                        {ticket.gridPoints} GP
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 italic">
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

// Position badge component
const PositionBadge = ({ position, size = 'md' }: { position: number; size?: 'sm' | 'md' | 'lg' }) => {
  const medal = getPositionMedal(position);
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
  };

  if (medal) {
    return <span className={`${sizeClasses[size]} flex items-center justify-center text-2xl`}>{medal}</span>;
  }

  const bgClass = position <= 10
    ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'
    : 'bg-gray-800 text-gray-400';

  return (
    <span className={`${sizeClasses[size]} ${bgClass} rounded-full flex items-center justify-center font-bold`}>
      {position}
    </span>
  );
};

interface RacerCardProps {
  result: RaceResult;
  onClick: () => void;
}

const RacerCard = ({ result, onClick }: RacerCardProps) => {
  const { racer, points, isPlayer, position = 0 } = result;
  const championshipPoints = getPositionPoints(position);

  // Determine card styling based on position
  const cardClass = isPlayer
    ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-blue-500 pit-lane-blue'
    : position === 1
    ? 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-500/50 pit-lane-yellow'
    : position === 2
    ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-400/50 pit-lane-blue'
    : position === 3
    ? 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-600/50 pit-lane-yellow'
    : 'bg-gray-900/80 border-gray-700 hover:border-gray-500';

  return (
    <div
      className={`racing-card border rounded-lg p-3 ${cardClass} cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Position */}
          <PositionBadge position={position} />

          {/* Avatar/Image */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl overflow-hidden border-2 ${
            position <= 3 ? 'border-yellow-500/50' : 'border-gray-600'
          }`}>
            {isPlayer ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                🏎️
              </div>
            ) : racer?.image ? (
              <img
                src={racer.image}
                alt={racer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                {racer?.emoji}
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div>
            <div className={`font-bold ${isPlayer ? 'text-blue-300' : 'text-white'} speed-text`}>
              {isPlayer ? 'YOU' : racer?.name}
            </div>
            <div className="text-sm text-gray-400">
              {isPlayer ? 'The Competitor' : racer?.racingName}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="text-2xl font-black text-purple-400 speed-text">{points}</div>
          <div className="text-xs text-gray-500">+{championshipPoints} pts</div>
        </div>
      </div>
    </div>
  );
};

// Standing row for Grand Prix
const StandingRow = ({ standing, onClick }: { standing: ChampionshipStanding; onClick: () => void }) => {
  const { racer, isPlayer, position = 0, totalPoints, wins, podiums } = standing;

  return (
    <div
      className={`timing-row flex items-center gap-3 px-4 py-3 cursor-pointer ${
        isPlayer ? 'bg-blue-900/30' : ''
      }`}
      onClick={onClick}
    >
      <PositionBadge position={position} size="sm" />

      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600 flex-shrink-0">
        {isPlayer ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg">
            🏎️
          </div>
        ) : racer?.image ? (
          <img src={racer.image} alt={racer?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">
            {racer?.emoji}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-bold truncate ${isPlayer ? 'text-blue-300' : 'text-white'}`}>
          {isPlayer ? 'YOU' : racer?.name}
        </div>
        <div className="text-xs text-gray-500">
          {isPlayer ? 'The Competitor' : racer?.tier?.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="text-center w-12">
          <div className="text-green-400 font-bold">{wins}</div>
          <div className="text-[10px] text-gray-600">WINS</div>
        </div>
        <div className="text-center w-12">
          <div className="text-orange-400 font-bold">{podiums}</div>
          <div className="text-[10px] text-gray-600">PODIUM</div>
        </div>
        <div className="text-center w-16">
          <div className="text-xl font-black text-amber-400">{totalPoints}</div>
          <div className="text-[10px] text-gray-600">POINTS</div>
        </div>
      </div>
    </div>
  );
};

// Grand Prix Standings View
const GrandPrixView = ({ 
  onBack, 
  playerDailyPoints, 
  difficulty,
  currentDay 
}: { 
  onBack: () => void;
  playerDailyPoints: Map<number, number>;
  difficulty: 'easy' | 'medium' | 'hard';
  currentDay: number;
}) => {
  const [selectedRacer, setSelectedRacer] = useState<{ racer: Racer; standing: ChampionshipStanding } | null>(null);

  const standings = useMemo(
    () => simulateGrandPrixStandings(currentDay, playerDailyPoints, difficulty),
    [currentDay, playerDailyPoints, difficulty]
  );

  const playerStanding = standings.find(s => s.isPlayer);

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-gray-950 to-black">
      {/* Header with checkered pattern */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="checkered-pattern-dark h-2" />
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm"
          >
            ← Back to Daily Race
          </button>
          <h1 className="text-3xl font-black text-white speed-text racing-header">
            🏆 GRAND PRIX STANDINGS
          </h1>
          <p className="text-gray-400 text-sm">Season Championship • {RACERS.length + 1} Competitors</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Player summary card */}
        {playerStanding && (
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-white speed-text">
                  P{playerStanding.position}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">Your Championship Position</div>
                  <div className="text-gray-400">
                    {playerStanding.wins} wins • {playerStanding.podiums} podiums • {playerStanding.races} races
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-amber-400">{playerStanding.totalPoints}</div>
                <div className="text-sm text-gray-400">Championship Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Timing board */}
        <div className="timing-board rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-2">
            <span className="text-white font-bold uppercase tracking-wider text-sm">Championship Standings</span>
          </div>
          <div className="divide-y divide-gray-800">
            {standings.map((standing) => (
              <StandingRow
                key={standing.isPlayer ? 'player' : standing.racer?.id}
                standing={standing}
                onClick={() => {
                  if (standing.racer && !standing.isPlayer) {
                    setSelectedRacer({ racer: standing.racer, standing });
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-bold mb-2">Points Per Race (F1 Style)</h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-400">
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">🥇 P1: 25</span>
            <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded">🥈 P2: 18</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded">🥉 P3: 15</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P4: 12</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P5: 10</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P6: 8</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P7: 6</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P8: 4</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P9: 2</span>
            <span className="bg-gray-800 px-2 py-1 rounded">P10: 1</span>
          </div>
        </div>
      </div>

      {/* Racer Modal */}
      {selectedRacer && (
        <RacerModal
          racer={selectedRacer.racer}
          standing={selectedRacer.standing}
          onClose={() => setSelectedRacer(null)}
        />
      )}
    </div>
  );
};

export const RacingView = () => {
  const currentDay = getDayOfYear();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedRacer, setSelectedRacer] = useState<{ racer: Racer; result: RaceResult } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [view, setView] = useState<'daily' | 'grandprix'>('daily');

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

  // Calculate player points for all days (for Grand Prix)
  const playerDailyPoints = useMemo(() => {
    const pointsMap = new Map<number, number>();
    const year = new Date().getFullYear();

    allItems.forEach(item => {
      if (item.status !== 'checkered') return;
      const date = new Date(item.updated_at);
      const dayOfYear = getDayOfYear(date);
      if (date.getFullYear() === year) {
        pointsMap.set(dayOfYear, (pointsMap.get(dayOfYear) || 0) + (item.grid_points || 0));
      }
    });

    return pointsMap;
  }, [allItems]);

  // Simulate race (use day number as seed)
  const raceResults = useMemo(
    () => simulateRace(selectedDay, playerPoints, difficulty, 9),
    [selectedDay, playerPoints, difficulty]
  );

  const playerResult = raceResults.find((r) => r.isPlayer);
  const playerPosition = playerResult?.position || 9;

  // Grand Prix view
  if (view === 'grandprix') {
    return (
      <GrandPrixView
        onBack={() => setView('daily')}
        playerDailyPoints={playerDailyPoints}
        difficulty={difficulty}
        currentDay={currentDay}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-gray-950 to-black">
      {/* Header with checkered pattern */}
      <div className="checkered-pattern-dark h-3" />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-white mb-1 speed-text">
            🏁 DAILY RACE
          </h1>
          <p className="text-gray-400 text-lg">{formatRaceDate(selectedDay)}</p>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
          >
            ← Yesterday
          </button>
          <span className="px-4 py-2 bg-gray-900 rounded-lg font-mono text-white border border-gray-700">
            Day {selectedDay}
          </span>
          <button
            onClick={() => setSelectedDay((d) => Math.min(366, d + 1))}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
          >
            Tomorrow →
          </button>
          {selectedDay !== currentDay && (
            <button
              onClick={() => setSelectedDay(currentDay)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Difficulty & Grand Prix Link */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Difficulty:</span>
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  difficulty === d
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-700" />
          <button
            onClick={() => setView('grandprix')}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm transition-colors flex items-center gap-2"
          >
            🏆 Grand Prix Standings
          </button>
        </div>

        {/* Player Summary */}
        <div className={`rounded-xl p-6 mb-6 border ${
          playerPosition === 1 ? 'bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-yellow-500/50 glow-gold' :
          playerPosition === 2 ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-400/50 glow-silver' :
          playerPosition === 3 ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-600/50 glow-bronze' :
          'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Your Position</div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getPositionMedal(playerPosition)}</span>
                <span className="text-5xl font-black text-white speed-text">P{playerPosition}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Grid Points</div>
              <div className="text-4xl font-black text-purple-400 speed-text">{playerPoints}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Race Points</div>
              <div className="text-4xl font-black text-amber-400 speed-text">+{getPositionPoints(playerPosition)}</div>
            </div>
          </div>
          {playerPosition <= 3 && (
            <div className="mt-4 text-center py-2 bg-white/10 rounded-lg">
              <span className="text-lg text-white">
                🎉 {playerPosition === 1 ? "WINNER! You're the champion!" : 'PODIUM FINISH! Great race!'}
              </span>
            </div>
          )}
          {playerPoints === 0 && (
            <div className="mt-4 text-center text-sm text-gray-400 bg-gray-800/50 py-2 rounded-lg">
              Complete tasks with Grid Points today to climb the standings!
            </div>
          )}
        </div>

        {/* Race Standings */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="text-red-500">▶</span> RACE STANDINGS
          </h2>
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

        {/* Championship Points Legend */}
        <div className="mt-8 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            📊 Championship Points (F1 Style)
          </h3>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">🥇 25pts</span>
            <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded">🥈 18pts</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded">🥉 15pts</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P4: 12</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P5: 10</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P6: 8</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P7: 6</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P8: 4</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P9: 2</span>
          </div>
        </div>
      </div>

      {/* Checkered footer */}
      <div className="checkered-pattern-dark h-3 mt-8" />

      {/* Racer Modal */}
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

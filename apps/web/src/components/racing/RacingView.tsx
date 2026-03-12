import { useMemo, useState } from 'react';
import {
  simulateWeeklyRace,
  simulateMonthlyGrandPrix,
  simulateSeasonalChampionship,
  simulateAnnualChampionship,
  getPositionMedal,
  getPositionPoints,
  getWeekNumber,
  getMonthNumber,
  getSeasonNumber,
  getSeasonName,
  getMonthName,
  type Racer,
  type RaceResult,
  type ChampionshipStanding,
} from '@paddock/shared';
import { useAllWorkItems } from '../../api/queries';
import { RacerProfileCard } from './RacerProfileCard';
import '../../styles/racing.css';

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
  const championshipPoints = result ? getPositionPoints(position) : standing?.totalPoints ?? 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-2xl w-full my-4">
          <RacerProfileCard
            racer={racer}
            position={position || undefined}
            points={result ? points : undefined}
            seasonPoints={championshipPoints}
            wins={standing?.wins}
            podiums={standing?.podiums}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
};

// Racer card for race results
interface RacerCardProps {
  result: RaceResult;
  onClick: () => void;
}

const RacerCard = ({ result, onClick }: RacerCardProps) => {
  const { racer, points, isPlayer, position = 0 } = result;
  const championshipPoints = getPositionPoints(position);

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
    <div className={`racing-card border rounded-lg p-3 ${cardClass} cursor-pointer`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PositionBadge position={position} />
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl overflow-hidden border-2 ${
            position <= 3 ? 'border-yellow-500/50' : 'border-gray-600'
          }`}>
            {isPlayer ? (
              <img src="/avatars/player.jpg" alt="You" className="w-full h-full object-cover" />
            ) : racer?.image ? (
              <img src={racer.image} alt={racer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                {racer?.emoji || '🏎️'}
              </div>
            )}
          </div>
          <div>
            <div className={`font-bold ${isPlayer ? 'text-blue-300' : 'text-white'} speed-text`}>
              {isPlayer ? 'YOU' : racer?.name}
            </div>
            <div className="text-sm text-gray-400">
              {isPlayer ? 'The Competitor' : racer?.racingName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-purple-400 speed-text">{points}</div>
          <div className="text-xs text-gray-500">+{championshipPoints} pts</div>
        </div>
      </div>
    </div>
  );
};

// Standing row for championships
const StandingRow = ({ standing, onClick }: { standing: ChampionshipStanding; onClick: () => void }) => {
  const { racer, isPlayer, position = 0, totalPoints, wins, podiums } = standing;

  return (
    <div
      className={`timing-row flex items-center gap-3 px-4 py-3 cursor-pointer ${isPlayer ? 'bg-blue-900/30' : ''}`}
      onClick={onClick}
    >
      <PositionBadge position={position} size="sm" />
      <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0">
        {isPlayer ? (
          <img src="/avatars/player.jpg" alt="You" className="w-full h-full object-cover" />
        ) : racer?.image ? (
          <img src={racer.image} alt={racer.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">
            {racer?.emoji || '🏎️'}
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

// Tab type
type RacingTab = 'weekly' | 'monthly' | 'seasonal' | 'championship';

export const RacingView = () => {
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentMonth = getMonthNumber(currentDate);
  const currentSeason = getSeasonNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  const [activeTab, setActiveTab] = useState<RacingTab>('weekly');
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [selectedYear] = useState(currentYear);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedRacer, setSelectedRacer] = useState<{ racer: Racer; result?: RaceResult; standing?: ChampionshipStanding } | null>(null);

  // Fetch all work items to calculate player's GP
  const { data: allItems = [] } = useAllWorkItems();

  // Calculate player points per week
  const playerWeeklyPoints = useMemo(() => {
    const pointsMap = new Map<number, number>();
    
    allItems.forEach(item => {
      if (item.status !== 'checkered') return;
      const completedDate = new Date(item.updated_at);
      const week = getWeekNumber(completedDate);
      const year = completedDate.getFullYear();
      
      // Only count points from selected year
      if (year === selectedYear) {
        pointsMap.set(week, (pointsMap.get(week) || 0) + (item.grid_points || 0));
      }
    });

    return pointsMap;
  }, [allItems, selectedYear]);

  // Current week's points
  const currentWeekPoints = playerWeeklyPoints.get(selectedWeek) || 0;

  // Weekly race results
  const weeklyResults = useMemo(
    () => simulateWeeklyRace(selectedWeek, selectedYear, currentWeekPoints, difficulty, 8),
    [selectedWeek, selectedYear, currentWeekPoints, difficulty]
  );

  // Monthly GP standings
  const monthlyStandings = useMemo(
    () => simulateMonthlyGrandPrix(selectedMonth, selectedYear, playerWeeklyPoints, difficulty),
    [selectedMonth, selectedYear, playerWeeklyPoints, difficulty]
  );

  // Seasonal standings
  const seasonalStandings = useMemo(
    () => simulateSeasonalChampionship(selectedSeason, selectedYear, playerWeeklyPoints, difficulty),
    [selectedSeason, selectedYear, playerWeeklyPoints, difficulty]
  );

  // Annual championship standings
  const championshipStandings = useMemo(
    () => simulateAnnualChampionship(selectedYear, playerWeeklyPoints, difficulty),
    [selectedYear, playerWeeklyPoints, difficulty]
  );

  const playerWeeklyResult = weeklyResults.find(r => r.isPlayer);
  const playerPosition = playerWeeklyResult?.position || 8;

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-gray-950 to-black">
      <div className="checkered-pattern-dark h-3" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'weekly' as RacingTab, icon: '🏁', label: 'Weekly Race' },
            { id: 'monthly' as RacingTab, icon: '🏆', label: 'Monthly GP' },
            { id: 'seasonal' as RacingTab, icon: '🌟', label: 'Seasonal' },
            { id: 'championship' as RacingTab, icon: '👑', label: 'Championship' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-500">Difficulty:</span>
          {(['easy', 'medium', 'hard'] as const).map(d => (
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

        {/* Weekly Race Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white mb-1 speed-text">🏁 WEEKLY RACE</h1>
              <p className="text-gray-400 text-lg">Week {selectedWeek} of {selectedYear}</p>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
              >
                ← Last Week
              </button>
              <span className="px-4 py-2 bg-gray-900 rounded-lg font-mono text-white border border-gray-700">
                Week {selectedWeek}
              </span>
              <button
                onClick={() => setSelectedWeek(w => Math.min(52, w + 1))}
                disabled={selectedWeek >= currentWeek}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Week →
              </button>
              {selectedWeek !== currentWeek && (
                <button
                  onClick={() => setSelectedWeek(currentWeek)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  This Week
                </button>
              )}
            </div>

            {/* Player Summary */}
            <div className={`rounded-xl p-6 border ${
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
                  <div className="text-4xl font-black text-purple-400 speed-text">{currentWeekPoints}</div>
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
              {currentWeekPoints === 0 && (
                <div className="mt-4 text-center text-sm text-gray-400 bg-gray-800/50 py-2 rounded-lg">
                  Complete tasks with Grid Points this week to climb the standings!
                </div>
              )}
            </div>

            {/* Race Standings */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <span className="text-red-500">▶</span> RACE STANDINGS ({weeklyResults.length} Racers)
              </h2>
              {weeklyResults.map(result => (
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
          </div>
        )}

        {/* Monthly GP Tab */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white mb-1 speed-text">🏆 MONTHLY GRAND PRIX</h1>
              <p className="text-gray-400 text-lg">{getMonthName(selectedMonth)} {selectedYear}</p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedMonth(m => Math.max(1, m - 1))}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 bg-gray-900 rounded-lg font-mono text-white border border-gray-700">
                {getMonthName(selectedMonth)}
              </span>
              <button
                onClick={() => setSelectedMonth(m => Math.min(12, m + 1))}
                disabled={selectedMonth >= currentMonth}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Standings */}
            <div className="timing-board rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2">
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  {getMonthName(selectedMonth)} Grand Prix Standings
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {monthlyStandings.slice(0, 10).map(standing => (
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
                {monthlyStandings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No races completed yet this month
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seasonal Tab */}
        {activeTab === 'seasonal' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white mb-1 speed-text">🌟 SEASONAL CHAMPIONSHIP</h1>
              <p className="text-gray-400 text-lg">{getSeasonName(selectedSeason)} {selectedYear} (Q{selectedSeason})</p>
            </div>

            {/* Season Navigation */}
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  disabled={s > currentSeason}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSeason === s
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {getSeasonName(s)}
                </button>
              ))}
            </div>

            {/* Standings */}
            <div className="timing-board rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2">
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  {getSeasonName(selectedSeason)} Championship Standings
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {seasonalStandings.slice(0, 10).map(standing => (
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
                {seasonalStandings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No races completed yet this season
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Championship Tab */}
        {activeTab === 'championship' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white mb-1 speed-text">👑 ANNUAL CHAMPIONSHIP</h1>
              <p className="text-gray-400 text-lg">{selectedYear} Season</p>
            </div>

            {/* Standings */}
            <div className="timing-board rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-4 py-2">
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  {selectedYear} Championship Standings
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {championshipStandings.slice(0, 15).map(standing => (
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
                {championshipStandings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No races completed yet this year
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Points Legend */}
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
          standing={selectedRacer.standing}
          onClose={() => setSelectedRacer(null)}
        />
      )}
    </div>
  );
};

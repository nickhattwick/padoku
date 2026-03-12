import { useMemo, useState, useEffect } from 'react';
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
  getGrandPrixTheme,
  getDaysRemainingInMonth,
  getDaysRemainingInWeek,
  getWeekOfMonth,
  getPreviousWeek,
  getPreviousMonth,
  isNewRaceWeek,
  isNewMonth,
  type Racer,
  type RaceResult,
  type ChampionshipStanding,
} from '@paddock/shared';
import { useAllWorkItems } from '../../api/queries';
import '../../styles/racing.css';

// Square portrait avatars for race standings
const RACER_AVATARS: Record<string, string> = {
  'nitro-knight': '/avatars/nitro-knight.jpg',
  'apex-alice': '/avatars/apex-alice.jpg',
  'slick-steve': '/avatars/slick-steve.jpg',
  'diesel-drake': '/avatars/diesel-drake.jpg',
  'zen-zara': '/avatars/zen-zara.jpg',
  'captain-clutch': '/avatars/captain-clutch.jpg',
  'turbo-ted': '/avatars/turbo-ted.jpg',
  'rookie-roxy': '/avatars/rookie-roxy.jpg',
  'player': '/avatars/player.jpg',
};

const getRacerAvatar = (racer: Racer | null, isPlayer: boolean): string | null => {
  if (isPlayer) return RACER_AVATARS['player'];
  if (!racer) return null;
  return RACER_AVATARS[racer.id] || racer.image || null;
};

// Position badge component
const PositionBadge = ({ position, size = 'md' }: { position: number; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const medal = getPositionMedal(position);
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
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

// Race Results Modal - shows when new race week starts
interface RaceResultsModalProps {
  type: 'weekly' | 'monthly';
  results: RaceResult[];
  weekNumber?: number;
  monthNumber?: number;
  year: number;
  onClose: () => void;
}

const RaceResultsModal = ({ type, results, weekNumber, monthNumber, year, onClose }: RaceResultsModalProps) => {
  const playerResult = results.find(r => r.isPlayer);
  const top3 = results.slice(0, 3);
  const gpTheme = monthNumber ? getGrandPrixTheme(monthNumber) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-yellow-500/50 max-w-lg w-full overflow-hidden animate-pulse-once">
        {/* Header */}
        <div className={`p-6 text-center ${type === 'monthly' && gpTheme ? `bg-gradient-to-r ${gpTheme.color}` : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
          <div className="text-4xl mb-2">🏁</div>
          <h2 className="text-2xl font-black text-white">
            {type === 'weekly' ? `Week ${weekNumber} Complete!` : `${gpTheme?.cup || getMonthName(monthNumber || 1)} Complete!`}
          </h2>
          <p className="text-white/80 text-sm">{year}</p>
        </div>

        {/* Podium */}
        <div className="p-6">
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-400 mx-auto mb-2">
                {top3[1] && (
                  getRacerAvatar(top3[1].racer, top3[1].isPlayer) ? (
                    <img src={getRacerAvatar(top3[1].racer, top3[1].isPlayer)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl">
                      {top3[1].racer?.emoji || '🏎️'}
                    </div>
                  )
                )}
              </div>
              <div className="bg-gradient-to-t from-gray-500 to-gray-400 h-16 w-20 rounded-t-lg flex items-center justify-center">
                <span className="text-3xl">🥈</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 truncate w-20">
                {top3[1]?.isPlayer ? 'YOU' : top3[1]?.racer?.name || 'P2'}
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center -mt-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-500 mx-auto mb-2 shadow-lg shadow-yellow-500/50">
                {top3[0] && (
                  getRacerAvatar(top3[0].racer, top3[0].isPlayer) ? (
                    <img src={getRacerAvatar(top3[0].racer, top3[0].isPlayer)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-3xl">
                      {top3[0].racer?.emoji || '🏎️'}
                    </div>
                  )
                )}
              </div>
              <div className="bg-gradient-to-t from-yellow-600 to-yellow-400 h-24 w-24 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🥇</span>
              </div>
              <div className="text-sm text-white font-bold mt-1 truncate w-24">
                {top3[0]?.isPlayer ? 'YOU!' : top3[0]?.racer?.name || 'P1'}
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600 mx-auto mb-2">
                {top3[2] && (
                  getRacerAvatar(top3[2].racer, top3[2].isPlayer) ? (
                    <img src={getRacerAvatar(top3[2].racer, top3[2].isPlayer)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl">
                      {top3[2].racer?.emoji || '🏎️'}
                    </div>
                  )
                )}
              </div>
              <div className="bg-gradient-to-t from-amber-700 to-amber-500 h-12 w-20 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl">🥉</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 truncate w-20">
                {top3[2]?.isPlayer ? 'YOU' : top3[2]?.racer?.name || 'P3'}
              </div>
            </div>
          </div>

          {/* Your Result */}
          {playerResult && (
            <div className={`rounded-xl p-4 mb-4 ${
              playerResult.position === 1 ? 'bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border border-yellow-500/50' :
              playerResult.position === 2 ? 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 border border-gray-400/50' :
              playerResult.position === 3 ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-600/50' :
              'bg-gray-800/50 border border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PositionBadge position={playerResult.position || 8} size="lg" />
                  <div>
                    <div className="text-white font-bold">Your Finish</div>
                    <div className="text-gray-400 text-sm">{playerResult.points} Grid Points</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">+{getPositionPoints(playerResult.position || 8)}</div>
                  <div className="text-xs text-gray-500">Championship Points</div>
                </div>
              </div>
              {playerResult.position && playerResult.position <= 3 && (
                <div className="mt-3 text-center py-2 bg-white/10 rounded-lg">
                  <span className="text-white">
                    {playerResult.position === 1 ? '🎉 WINNER!' : '🏆 Podium finish!'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>🚩</span> Start New {type === 'weekly' ? 'Race' : 'Grand Prix'}
          </button>
        </div>
      </div>
    </div>
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
  const avatarSrc = getRacerAvatar(racer, isPlayer);

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
            {avatarSrc ? (
              <img src={avatarSrc} alt={isPlayer ? 'You' : racer?.name} className="w-full h-full object-cover" />
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
  const avatarSrc = getRacerAvatar(racer, isPlayer);

  return (
    <div
      className={`timing-row flex items-center gap-3 px-4 py-3 cursor-pointer ${isPlayer ? 'bg-blue-900/30' : ''}`}
      onClick={onClick}
    >
      <PositionBadge position={position} size="sm" />
      <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-600 flex-shrink-0">
        {avatarSrc ? (
          <img src={avatarSrc} alt={isPlayer ? 'You' : racer?.name} className="w-full h-full object-cover" />
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

// Modal for racer details (when clicking on a racer)
interface RacerModalProps {
  racer: Racer;
  result?: RaceResult;
  standing?: ChampionshipStanding;
  onClose: () => void;
}

const RacerModal = ({ racer, result, standing, onClose }: RacerModalProps) => {
  const points = result?.points ?? 0;
  const position = result?.position ?? standing?.position ?? 0;
  const avatarSrc = getRacerAvatar(racer, false);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border-2 border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={racer.name} className="h-24 w-24 rounded-full border-4 border-gray-700 object-cover" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl border-4 border-gray-600">
                  {racer.emoji}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Info */}
          <div className="p-6 text-center">
            <h2 className="text-2xl font-black text-white">{racer.name}</h2>
            <p className="text-gray-400 text-sm">{racer.racingName}</p>
            <p className="text-gray-500 text-xs mt-1">{racer.profession} • {racer.tier.toUpperCase()}</p>

            <div className="flex justify-center gap-6 mt-4">
              {position > 0 && (
                <div className="text-center">
                  <PositionBadge position={position} size="lg" />
                  <div className="text-xs text-gray-500 mt-1">Position</div>
                </div>
              )}
              {result && (
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-400">{points}</div>
                  <div className="text-xs text-gray-500">Grid Points</div>
                </div>
              )}
              {standing && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-400">{standing.wins}</div>
                    <div className="text-xs text-gray-500">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-400">{standing.totalPoints}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                </>
              )}
            </div>

            {racer.catchphrases && racer.catchphrases.length > 0 && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 italic text-sm">
                  "{racer.catchphrases[Math.floor(Math.random() * racer.catchphrases.length)]}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Storage key for tracking seen results
const SEEN_RESULTS_KEY = 'paddock_seen_race_results';

const getSeenResults = (): { weeks: string[]; months: string[] } => {
  try {
    const stored = localStorage.getItem(SEEN_RESULTS_KEY);
    return stored ? JSON.parse(stored) : { weeks: [], months: [] };
  } catch {
    return { weeks: [], months: [] };
  }
};

const markResultSeen = (type: 'week' | 'month', key: string) => {
  try {
    const seen = getSeenResults();
    if (type === 'week') {
      seen.weeks = [...new Set([...seen.weeks, key])].slice(-10); // Keep last 10
    } else {
      seen.months = [...new Set([...seen.months, key])].slice(-12); // Keep last 12
    }
    localStorage.setItem(SEEN_RESULTS_KEY, JSON.stringify(seen));
  } catch {
    // Ignore
  }
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
  const [selectedRacer, setSelectedRacer] = useState<{ racer: Racer; result?: RaceResult; standing?: ChampionshipStanding } | null>(null);
  
  // Results modal state
  const [showWeekResults, setShowWeekResults] = useState(false);
  const [showMonthResults, setShowMonthResults] = useState(false);

  // Fetch all work items
  const { data: allItems = [] } = useAllWorkItems();

  // Calculate player points per week
  const playerWeeklyPoints = useMemo(() => {
    const pointsMap = new Map<number, number>();
    
    allItems.forEach(item => {
      if (item.status !== 'checkered') return;
      const completedDate = new Date(item.updated_at);
      const week = getWeekNumber(completedDate);
      const year = completedDate.getFullYear();
      
      if (year === selectedYear) {
        pointsMap.set(week, (pointsMap.get(week) || 0) + (item.grid_points || 0));
      }
    });

    return pointsMap;
  }, [allItems, selectedYear]);

  // Current week's points
  const currentWeekPoints = playerWeeklyPoints.get(selectedWeek) || 0;

  // Weekly race results (fixed difficulty: medium)
  const weeklyResults = useMemo(
    () => simulateWeeklyRace(selectedWeek, selectedYear, currentWeekPoints, 'medium', 8),
    [selectedWeek, selectedYear, currentWeekPoints]
  );

  // Previous week's results (for results modal)
  const { week: prevWeek, year: prevWeekYear } = getPreviousWeek(currentWeek, currentYear);
  const prevWeekPoints = playerWeeklyPoints.get(prevWeek) || 0;
  const prevWeekResults = useMemo(
    () => simulateWeeklyRace(prevWeek, prevWeekYear, prevWeekPoints, 'medium', 8),
    [prevWeek, prevWeekYear, prevWeekPoints]
  );

  // Previous month's results
  const { month: prevMonth, year: prevMonthYear } = getPreviousMonth(currentMonth, currentYear);
  const prevMonthStandings = useMemo(
    () => simulateMonthlyGrandPrix(prevMonth, prevMonthYear, playerWeeklyPoints, 'medium'),
    [prevMonth, prevMonthYear, playerWeeklyPoints]
  );

  // Monthly GP standings
  const monthlyStandings = useMemo(
    () => simulateMonthlyGrandPrix(selectedMonth, selectedYear, playerWeeklyPoints, 'medium'),
    [selectedMonth, selectedYear, playerWeeklyPoints]
  );

  // Seasonal standings
  const seasonalStandings = useMemo(
    () => simulateSeasonalChampionship(selectedSeason, selectedYear, playerWeeklyPoints, 'medium'),
    [selectedSeason, selectedYear, playerWeeklyPoints]
  );

  // Annual championship standings
  const championshipStandings = useMemo(
    () => simulateAnnualChampionship(selectedYear, playerWeeklyPoints, 'medium'),
    [selectedYear, playerWeeklyPoints]
  );

  // Check if we should show results modal on mount
  useEffect(() => {
    const seen = getSeenResults();
    const weekKey = `${currentYear}-${currentWeek}`;
    const monthKey = `${currentYear}-${currentMonth}`;
    
    // Show previous week's results if it's a new week and we haven't seen them
    if (isNewRaceWeek() && !seen.weeks.includes(weekKey) && prevWeekResults.length > 0) {
      setShowWeekResults(true);
    }
    // Show previous month's results if it's a new month
    else if (isNewMonth() && !seen.months.includes(monthKey) && prevMonthStandings.length > 0) {
      setShowMonthResults(true);
    }
  }, [currentWeek, currentMonth, currentYear, prevWeekResults.length, prevMonthStandings.length]);

  const handleCloseWeekResults = () => {
    markResultSeen('week', `${currentYear}-${currentWeek}`);
    setShowWeekResults(false);
  };

  const handleCloseMonthResults = () => {
    markResultSeen('month', `${currentYear}-${currentMonth}`);
    setShowMonthResults(false);
  };

  const playerWeeklyResult = weeklyResults.find(r => r.isPlayer);
  const playerPosition = playerWeeklyResult?.position || 8;
  const daysRemaining = getDaysRemainingInWeek();

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

        {/* Weekly Race Tab */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-4xl">🏁</span>
                <h1 className="text-4xl font-black text-white speed-text">WEEKLY RACE</h1>
                {isNewRaceWeek() && (
                  <span className="px-2 py-1 text-xs font-bold bg-green-600 text-white rounded-full animate-pulse">
                    🚩 NEW
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-lg">Week {selectedWeek} of {selectedYear}</p>
              <p className="text-sm text-gray-500">
                {daysRemaining === 0 ? 'Race ends today!' : `${daysRemaining} days remaining`}
              </p>
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
                    🎉 {playerPosition === 1 ? "WINNER! You're leading!" : 'PODIUM POSITION! Keep it up!'}
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
        {activeTab === 'monthly' && (() => {
          const gpTheme = getGrandPrixTheme(selectedMonth);
          const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
          const daysRemainingMonth = isCurrentMonth ? getDaysRemainingInMonth() : 0;
          const weekOfMonth = isCurrentMonth ? getWeekOfMonth() : 4;
          
          return (
          <div className="space-y-6">
            {/* Themed GP Header */}
            <div className={`rounded-2xl p-6 bg-gradient-to-r ${gpTheme.color} border border-white/20 shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{gpTheme.emoji}</span>
                    <div>
                      <h1 className="text-3xl font-black text-white speed-text">{gpTheme.cup}</h1>
                      <p className="text-white/80 text-sm font-medium">{gpTheme.name} • {selectedYear}</p>
                    </div>
                    {isCurrentMonth && isNewMonth() && (
                      <span className="px-2 py-1 text-xs font-bold bg-white/20 text-white rounded-full animate-pulse">
                        🚩 NEW
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm max-w-md">{gpTheme.description}</p>
                </div>
                {isCurrentMonth && (
                  <div className="text-center bg-black/30 rounded-xl px-6 py-4">
                    <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Race Week</div>
                    <div className="text-4xl font-black text-white">{weekOfMonth}/4</div>
                    <div className="text-sm text-white/80 mt-1">
                      {daysRemainingMonth === 0 ? 'Final day!' : `${daysRemainingMonth} days left`}
                    </div>
                  </div>
                )}
                {!isCurrentMonth && selectedMonth < currentMonth && (
                  <div className="text-center bg-black/30 rounded-xl px-6 py-4">
                    <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Status</div>
                    <div className="text-2xl font-black text-white">COMPLETE</div>
                    <div className="text-sm text-white/80 mt-1">🏁 Championship decided</div>
                  </div>
                )}
              </div>
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
              <div className={`bg-gradient-to-r ${gpTheme.color} px-4 py-2`}>
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  {gpTheme.emoji} {gpTheme.cup} Standings
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {monthlyStandings.slice(0, 32).map(standing => (
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
        );})()}

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
                {seasonalStandings.slice(0, 32).map(standing => (
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
                {championshipStandings.slice(0, 32).map(standing => (
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

        {/* Grid Points Guide */}
        <div className="mt-8 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            ⚡ Grid Points Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold">1 GP</div>
              <div className="text-gray-500 text-xs">15-30 min</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold">2-3 GP</div>
              <div className="text-gray-500 text-xs">30 min - 2 hrs</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold">5-8 GP</div>
              <div className="text-gray-500 text-xs">Half day</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-purple-400 font-bold">13-21 GP</div>
              <div className="text-gray-500 text-xs">Full day+</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">🥇 P1: 25pts</span>
            <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded">🥈 P2: 18pts</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded">🥉 P3: 15pts</span>
            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">P4-8: 12-4pts</span>
          </div>
        </div>
      </div>

      {/* Checkered footer */}
      <div className="checkered-pattern-dark h-3 mt-8" />

      {/* Results Modals */}
      {showWeekResults && prevWeekResults.length > 0 && (
        <RaceResultsModal
          type="weekly"
          results={prevWeekResults}
          weekNumber={prevWeek}
          year={prevWeekYear}
          onClose={handleCloseWeekResults}
        />
      )}

      {showMonthResults && prevMonthStandings.length > 0 && (
        <RaceResultsModal
          type="monthly"
          results={prevMonthStandings.map(s => ({
            racer: s.racer,
            points: s.totalPoints,
            isPlayer: s.isPlayer,
            position: s.position,
          }))}
          monthNumber={prevMonth}
          year={prevMonthYear}
          onClose={handleCloseMonthResults}
        />
      )}

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

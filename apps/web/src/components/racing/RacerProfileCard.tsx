import { useState } from 'react';
import { getRandomCatchphrase, type Racer } from '@paddock/shared';
import '../../styles/racing.css';

// Racer images mapping for v2 Redline-style images
const RACER_V2_IMAGES: Record<string, { portrait: string; vehicle: string }> = {
  'nitro-knight': {
    portrait: '/racers-v2/nitro-knight.png',
    vehicle: '/racers-v2/nitro-knight-car.png',
  },
  'turbo-ted': {
    portrait: '/racers-v2/turbo-ted.png',
    vehicle: '/racers-v2/turbo-ted-car.png',
  },
  'apex-alice': {
    portrait: '/racers-v2/apex-alice.png',
    vehicle: '/racers-v2/apex-alice-car.png',
  },
  'rookie-roxy': {
    portrait: '/racers-v2/rookie-roxy.png',
    vehicle: '/racers-v2/rookie-roxy-car.png',
  },
  'diesel-drake': {
    portrait: '/racers-v2/diesel-drake.png',
    vehicle: '/racers-v2/diesel-drake-car.png',
  },
  'slick-steve': {
    portrait: '/racers-v2/slick-steve.png',
    vehicle: '/racers-v2/slick-steve-car.png',
  },
  'captain-clutch': {
    portrait: '/racers-v2/captain-clutch.png',
    vehicle: '/racers-v2/captain-clutch-car.png',
  },
  'dj-drift': {
    portrait: '/racers-v2/dj-drift.png',
    vehicle: '/racers-v2/dj-drift-car.png',
  },
  'lunar-larry': {
    portrait: '/racers-v2/lunar-larry.png',
    vehicle: '/racers-v2/lunar-larry-car.png',
  },
  'zen-zara': {
    portrait: '/racers-v2/zen-zara.png',
    vehicle: '/racers-v2/zen-zara-car.png',
  },
  'player': {
    portrait: '/racers-v2/player.png',
    vehicle: '/racers-v2/player-car.png',
  },
};

interface RacerProfileCardProps {
  racer: Racer;
  position?: number;
  points?: number;
  seasonPoints?: number;
  wins?: number;
  podiums?: number;
  onClose?: () => void;
  compact?: boolean;
}

// Tier colors and styles
const getTierStyle = (tier: Racer['tier']) => {
  switch (tier) {
    case 'elite':
      return {
        bg: 'from-yellow-900/60 to-amber-950/80',
        border: 'border-yellow-500/50',
        badge: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black',
        glow: 'shadow-yellow-500/30',
        accent: 'text-yellow-400',
      };
    case 'pro':
      return {
        bg: 'from-purple-900/60 to-violet-950/80',
        border: 'border-purple-500/50',
        badge: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
        glow: 'shadow-purple-500/30',
        accent: 'text-purple-400',
      };
    case 'amateur':
      return {
        bg: 'from-blue-900/60 to-indigo-950/80',
        border: 'border-blue-500/50',
        badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
        glow: 'shadow-blue-500/30',
        accent: 'text-blue-400',
      };
    default:
      return {
        bg: 'from-gray-800/60 to-gray-950/80',
        border: 'border-gray-600/50',
        badge: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
        glow: 'shadow-gray-500/30',
        accent: 'text-gray-400',
      };
  }
};

// Stat bar component
const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export const RacerProfileCard = ({
  racer,
  position,
  points,
  seasonPoints,
  wins,
  podiums,
  onClose,
  compact = false,
}: RacerProfileCardProps) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'records'>('stats');
  const tierStyle = getTierStyle(racer.tier);
  const v2Images = RACER_V2_IMAGES[racer.id];
  
  // Use v2 images if available, otherwise fall back to original
  const portraitImage = v2Images?.portrait || racer.image;
  const vehicleImage = v2Images?.vehicle;

  if (compact) {
    // Compact card view for lists
    return (
      <div className={`relative overflow-hidden rounded-xl border ${tierStyle.border} bg-gradient-to-br ${tierStyle.bg} p-4 cursor-pointer hover:scale-[1.02] transition-transform`}>
        <div className="flex items-center gap-4">
          {/* Portrait */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20 flex-shrink-0">
            {portraitImage ? (
              <img src={portraitImage} alt={racer.name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">
                {racer.emoji}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white truncate">{racer.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${tierStyle.badge}`}>
                {racer.tier}
              </span>
            </div>
            <p className="text-sm text-gray-400 italic truncate">{racer.racingName}</p>
            <p className="text-xs text-gray-500 mt-1">{racer.profession}</p>
          </div>

          {/* Position */}
          {position && (
            <div className="text-center">
              <div className="text-2xl font-black text-white">P{position}</div>
              {points !== undefined && (
                <div className="text-xs text-gray-400">{points} pts</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full profile card
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${tierStyle.border} bg-gradient-to-br ${tierStyle.bg} shadow-2xl ${tierStyle.glow}`}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-2xl transition-colors"
        >
          ×
        </button>
      )}

      {/* Hero section with racer and vehicle */}
      <div className="relative h-96 overflow-hidden">
        {/* Vehicle background - full opacity, contained */}
        {vehicleImage && (
          <div className="absolute inset-0">
            <img
              src={vehicleImage}
              alt={`${racer.name}'s vehicle`}
              className="w-full h-full object-contain object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>
        )}

        {/* Racer portrait */}
        <div className="absolute bottom-0 left-4 w-56 h-96">
          {portraitImage ? (
            <img
              src={portraitImage}
              alt={racer.name}
              className="w-full h-full object-contain object-bottom drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center text-8xl pb-4">
              {racer.emoji}
            </div>
          )}
        </div>

        {/* Name and title overlay - bottom right */}
        <div className="absolute bottom-4 right-4 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-gray-400 text-sm">{racer.profession}</span>
            <span className={`px-3 py-1 text-xs font-black rounded uppercase ${tierStyle.badge}`}>
              {racer.tier}
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight" style={{ textShadow: '2px 2px 0 #000' }}>
            {racer.name}
          </h2>
          <p className={`text-lg italic ${tierStyle.accent}`}>"{racer.racingName}"</p>
        </div>

        {/* Position badge */}
        {position && (
          <div className="absolute top-4 left-4 text-center">
            <div className={`text-4xl font-black ${
              position === 1 ? 'text-yellow-400' :
              position === 2 ? 'text-gray-300' :
              position === 3 ? 'text-amber-600' :
              'text-white'
            }`}>
              {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `P${position}`}
            </div>
          </div>
        )}
      </div>

      {/* Stats section */}
      <div className="p-6 space-y-4">
        {/* Quick stats row */}
        {(points !== undefined || seasonPoints !== undefined || wins !== undefined) && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {points !== undefined && (
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <div className="text-2xl font-black text-purple-400">{points}</div>
                <div className="text-xs text-gray-500 uppercase">Grid Pts</div>
              </div>
            )}
            {seasonPoints !== undefined && (
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <div className="text-2xl font-black text-amber-400">{seasonPoints}</div>
                <div className="text-xs text-gray-500 uppercase">Season</div>
              </div>
            )}
            {wins !== undefined && (
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <div className="text-2xl font-black text-green-400">{wins}</div>
                <div className="text-xs text-gray-500 uppercase">Wins</div>
              </div>
            )}
            {podiums !== undefined && (
              <div className="text-center p-3 bg-black/30 rounded-lg">
                <div className="text-2xl font-black text-orange-400">{podiums}</div>
                <div className="text-xs text-gray-500 uppercase">Podiums</div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'stats'
                ? `${tierStyle.accent} border-b-2 border-current`
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'records'
                ? `${tierStyle.accent} border-b-2 border-current`
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Records
          </button>
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Stat bars */}
              <div className="space-y-3">
                <StatBar label="Consistency" value={racer.consistency} color="text-blue-400" />
                <StatBar label="Peak Power" value={racer.peakPower} color="text-red-400" />
                <StatBar label="Fast Start" value={racer.startStrength} color="text-green-400" />
                <StatBar label="Clutch Factor" value={racer.endStrength} color="text-amber-400" />
              </div>

              {/* Catchphrase */}
              <div className={`mt-4 p-4 rounded-lg bg-black/30 border-l-4 ${tierStyle.border}`}>
                <p className="text-lg italic text-gray-300">
                  "{getRandomCatchphrase(racer)}"
                </p>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {racer.completedTickets.map((ticket, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {ticket.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded font-bold">
                      {ticket.gridPoints} GP
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 italic pl-5">
                    "{ticket.completedQuip}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkered flag footer */}
      <div className="h-3 bg-gradient-to-r from-transparent via-white/10 to-transparent" 
           style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 10px, #fff 10px, #fff 20px)' }} />
    </div>
  );
};

export default RacerProfileCard;

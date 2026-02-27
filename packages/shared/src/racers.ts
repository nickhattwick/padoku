/**
 * Racing Rivals - AI competitors for the Paddock racing league
 */

export interface Racer {
  id: string;
  name: string;
  profession: string;
  racingName: string;
  emoji: string;
  color: string; // Tailwind color name
  personality: string;
  catchphrases: string[];
  // Performance characteristics (0-100 scale)
  consistency: number; // How predictable their performance is
  peakPower: number; // Maximum potential output
  startStrength: number; // Early week performance
  endStrength: number; // End of week clutch factor
}

export const RACERS: Racer[] = [
  {
    id: 'turbo-ted',
    name: 'Turbo Ted',
    profession: 'Farmer',
    racingName: 'The Tractor Terror',
    emoji: '🚜',
    color: 'green',
    personality: 'Patient and hardworking. Believes in steady progress over flash.',
    catchphrases: [
      "You can't rush a good harvest!",
      "Slow and steady wins the race... eventually.",
      "I've been up since 4am. What's your excuse?",
      "These hands were made for working!",
    ],
    consistency: 85,
    peakPower: 60,
    startStrength: 40,
    endStrength: 90,
  },
  {
    id: 'apex-alice',
    name: 'Apex Alice',
    profession: 'Programmer',
    racingName: 'The Algorithm',
    emoji: '💻',
    color: 'blue',
    personality: 'Analytical and precise. Optimizes everything, including small talk.',
    catchphrases: [
      "I've calculated the perfect line.",
      "Your approach has O(n²) complexity. Mine is O(log n).",
      "Debugging my competition...",
      "It's not a bug, it's a feature of my dominance.",
    ],
    consistency: 95,
    peakPower: 75,
    startStrength: 70,
    endStrength: 70,
  },
  {
    id: 'nitro-knight',
    name: 'Nitro Knight',
    profession: 'Knight',
    racingName: 'Sir Shiftwell',
    emoji: '⚔️',
    color: 'gray',
    personality: 'Chivalrous and dramatic. Takes honor very seriously.',
    catchphrases: [
      "For honor and horsepower!",
      "A knight never yields... unless it's to pass safely.",
      "My steed may be mechanical, but my heart is pure!",
      "To the victor goes the glory!",
    ],
    consistency: 70,
    peakPower: 85,
    startStrength: 80,
    endStrength: 65,
  },
  {
    id: 'diesel-drake',
    name: 'Diesel Drake',
    profession: 'Dragon Slayer',
    racingName: 'The Flame Chaser',
    emoji: '🐉',
    color: 'red',
    personality: 'Aggressive and fearless. Goes for broke every time.',
    catchphrases: [
      "I've faced dragons. Your deadlines don't scare me!",
      "Playing it safe? Never heard of her.",
      "FULL SEND!",
      "The only good dragon is a defeated dragon. Same goes for tasks.",
    ],
    consistency: 50,
    peakPower: 100,
    startStrength: 90,
    endStrength: 40,
  },
  {
    id: 'slick-steve',
    name: 'Slick Steve',
    profession: 'Businessman',
    racingName: 'The Closer',
    emoji: '💼',
    color: 'slate',
    personality: 'Smooth talker. Always networking, even mid-race.',
    catchphrases: [
      "Time is money, and I'm cashing in!",
      "Let me give you my card... after I pass you.",
      "This isn't a race, it's an opportunity.",
      "I don't compete. I dominate markets.",
    ],
    consistency: 75,
    peakPower: 80,
    startStrength: 50,
    endStrength: 85,
  },
  {
    id: 'captain-clutch',
    name: 'Captain Clutch',
    profession: 'Pirate',
    racingName: 'The Corsair',
    emoji: '🏴‍☠️',
    color: 'amber',
    personality: 'Unpredictable and dramatic. Master of the comeback.',
    catchphrases: [
      "Arrrr, smooth sailing ahead!",
      "The treasure is first place, and X marks the spot!",
      "You thought I was out? The sea always provides!",
      "A pirate's life means never giving up the chase!",
    ],
    consistency: 40,
    peakPower: 95,
    startStrength: 30,
    endStrength: 100,
  },
  {
    id: 'zen-zara',
    name: 'Zen Zara',
    profession: 'Yoga Instructor',
    racingName: 'The Flow State',
    emoji: '🧘',
    color: 'purple',
    personality: 'Calm and centered. Never stressed, annoyingly serene.',
    catchphrases: [
      "Breathe in productivity, exhale procrastination.",
      "The race is not with others, but with yourself.",
      "I'm not behind. I'm exactly where I need to be.",
      "Namaste in first place.",
    ],
    consistency: 90,
    peakPower: 65,
    startStrength: 60,
    endStrength: 75,
  },
  {
    id: 'rookie-roxy',
    name: 'Rookie Roxy',
    profession: 'College Student',
    racingName: 'The All-Nighter',
    emoji: '📚',
    color: 'pink',
    personality: 'Chaotic energy. Procrastinates then panics productively.',
    catchphrases: [
      "Wait, that was due TODAY?!",
      "I work best under pressure... extreme pressure.",
      "Sleep is for people without deadlines!",
      "Red Bull gives you wings, but panic gives you SPEED!",
    ],
    consistency: 30,
    peakPower: 90,
    startStrength: 20,
    endStrength: 95,
  },
];

/**
 * Get a random catchphrase from a racer
 */
export const getRandomCatchphrase = (racer: Racer): string => {
  return racer.catchphrases[Math.floor(Math.random() * racer.catchphrases.length)];
};

/**
 * Calculate a racer's weekly points based on their characteristics
 * Returns a score influenced by their personality traits
 */
export const calculateRacerWeeklyPoints = (
  racer: Racer,
  weekSeed: number, // Use week number as seed for reproducibility
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number => {
  // Seeded random for reproducible results per week
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const rand1 = seededRandom(weekSeed + racer.id.charCodeAt(0));
  const rand2 = seededRandom(weekSeed * 2 + racer.id.charCodeAt(1));

  // Base points from peak power
  const basePower = racer.peakPower;

  // Consistency affects variance
  const variance = (100 - racer.consistency) / 100;
  const varianceMultiplier = 1 + (rand1 - 0.5) * variance;

  // Weekly pattern: blend start and end strength
  const weekProgress = rand2; // Simulates when in the week they peak
  const strengthMultiplier =
    (racer.startStrength * (1 - weekProgress) + racer.endStrength * weekProgress) / 100;

  // Difficulty scaling
  const difficultyMultiplier = {
    easy: 0.6,
    medium: 0.8,
    hard: 1.0,
  }[difficulty];

  // Calculate final points (scaled to typical weekly GP range of 15-50)
  const rawPoints = basePower * varianceMultiplier * strengthMultiplier * difficultyMultiplier;
  const scaledPoints = Math.round((rawPoints / 100) * 40 + 10); // 10-50 range

  return Math.max(5, Math.min(60, scaledPoints)); // Clamp to 5-60
};

/**
 * Simulate a full race/Grand Prix with 8 racers
 * Returns sorted standings
 */
export const simulateRace = (
  weekNumber: number,
  playerPoints: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): RaceResult[] => {
  const results: RaceResult[] = RACERS.map((racer) => ({
    racer,
    points: calculateRacerWeeklyPoints(racer, weekNumber, difficulty),
    isPlayer: false,
  }));

  // Add player
  results.push({
    racer: null,
    points: playerPoints,
    isPlayer: true,
  });

  // Sort by points descending
  results.sort((a, b) => b.points - a.points);

  // Assign positions
  return results.map((result, index) => ({
    ...result,
    position: index + 1,
  }));
};

export interface RaceResult {
  racer: Racer | null; // null for player
  points: number;
  isPlayer: boolean;
  position?: number;
}

/**
 * F1-style points for positions
 */
export const POSITION_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;

export const getPositionPoints = (position: number): number => {
  if (position < 1 || position > 10) return 0;
  return POSITION_POINTS[position - 1];
};

/**
 * Get medal for position
 */
export const getPositionMedal = (position: number): string => {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

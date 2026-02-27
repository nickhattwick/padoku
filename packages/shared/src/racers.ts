/**
 * Racing Rivals - AI competitors for the Paddock racing league
 */

export interface RacerTicket {
  title: string;
  gridPoints: number;
  status: 'checkered'; // All completed
  completedQuip: string; // Funny completion message
}

export interface Racer {
  id: string;
  name: string;
  profession: string;
  racingName: string;
  emoji: string;
  color: string; // Tailwind color name
  personality: string;
  catchphrases: string[];
  vehicle: string; // Description of their racing vehicle
  vehicleEmoji: string;
  // Performance characteristics (0-100 scale)
  consistency: number; // How predictable their performance is
  peakPower: number; // Maximum potential output
  startStrength: number; // Early week performance
  endStrength: number; // End of week clutch factor
  // Comedic completed tickets
  completedTickets: RacerTicket[];
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
    vehicle: 'Modified John Deere 9RX with nitrous injection and flame decals',
    vehicleEmoji: '🚜💨',
    consistency: 85,
    peakPower: 60,
    startStrength: 40,
    endStrength: 90,
    completedTickets: [
      { title: 'Plow the north field before frost', gridPoints: 8, status: 'checkered', completedQuip: 'Done before breakfast. The chickens were impressed.' },
      { title: 'Fix tractor transmission (again)', gridPoints: 5, status: 'checkered', completedQuip: 'Duct tape and prayers. Good as new!' },
      { title: 'Chase crows away from corn', gridPoints: 2, status: 'checkered', completedQuip: 'Scarecrow budget: $0. Personal intimidation: priceless.' },
      { title: 'Install racing stripes on combine harvester', gridPoints: 3, status: 'checkered', completedQuip: '+50 horsepower (psychological)' },
      { title: 'Milk cows while checking race standings', gridPoints: 5, status: 'checkered', completedQuip: 'Bessie thinks I talk about racing too much.' },
    ],
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
    vehicle: 'Tesla Roadster with custom AI autopilot and RGB lighting',
    vehicleEmoji: '🚗⚡',
    consistency: 95,
    peakPower: 75,
    startStrength: 70,
    endStrength: 70,
    completedTickets: [
      { title: 'Refactor legacy codebase from 2003', gridPoints: 13, status: 'checkered', completedQuip: 'Found 47 TODO comments. Fixed 46. One was philosophical.' },
      { title: 'Debug production issue at 3am', gridPoints: 8, status: 'checkered', completedQuip: 'It was a missing semicolon. It\'s always a missing semicolon.' },
      { title: 'Explain "the cloud" to manager', gridPoints: 3, status: 'checkered', completedQuip: 'Used car analogy. They now think AWS is a parking lot.' },
      { title: 'Optimize racing line with machine learning', gridPoints: 8, status: 'checkered', completedQuip: 'Model achieved 99.7% accuracy. The 0.3% is "vibes".' },
      { title: 'Update dependencies without breaking everything', gridPoints: 5, status: 'checkered', completedQuip: 'npm audit found 847 vulnerabilities. We don\'t talk about it.' },
    ],
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
    vehicle: 'Armored muscle car with jousting lance hood ornament and chainmail seat covers',
    vehicleEmoji: '🏎️⚔️',
    consistency: 70,
    peakPower: 85,
    startStrength: 80,
    endStrength: 65,
    completedTickets: [
      { title: 'Rescue maiden from tower (metaphorical)', gridPoints: 8, status: 'checkered', completedQuip: 'She was the CEO. The tower was a bad meeting.' },
      { title: 'Polish armor until it blinds enemies', gridPoints: 3, status: 'checkered', completedQuip: 'Caused 3 pit lane accidents. Worth it.' },
      { title: 'Write chivalry handbook for modern racing', gridPoints: 5, status: 'checkered', completedQuip: 'Chapter 1: Thou shalt not block.' },
      { title: 'Slay the dragon (quarterly budget review)', gridPoints: 13, status: 'checkered', completedQuip: 'The dragon was Dave from accounting. He survived.' },
      { title: 'Quest for the Holy Grail (spare tire)', gridPoints: 2, status: 'checkered', completedQuip: 'It was in the trunk the whole time.' },
    ],
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
    vehicle: 'Fire-breathing monster truck with dragon scale paint and actual flamethrowers',
    vehicleEmoji: '🔥🚛',
    consistency: 50,
    peakPower: 100,
    startStrength: 90,
    endStrength: 40,
    completedTickets: [
      { title: 'Slay actual dragon (Tuesday)', gridPoints: 21, status: 'checkered', completedQuip: 'Took 3 hours. Dragon took my eyebrows. Fair trade.' },
      { title: 'Intimidate traffic during commute', gridPoints: 2, status: 'checkered', completedQuip: 'The minivan yielded. They always yield.' },
      { title: 'Install bigger exhaust (third time)', gridPoints: 3, status: 'checkered', completedQuip: 'Neighbors filed noise complaint. I filed "don\'t care".' },
      { title: 'Practice battle cry in mirror', gridPoints: 1, status: 'checkered', completedQuip: 'Cat is no longer impressed. Cat never was.' },
      { title: 'Rescue village from beast', gridPoints: 13, status: 'checkered', completedQuip: 'Beast was a raccoon. Village was a Wendy\'s. Still counts.' },
    ],
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
    vehicle: 'Matte black Porsche with gold trim, Bluetooth always connected',
    vehicleEmoji: '🚗💰',
    consistency: 75,
    peakPower: 80,
    startStrength: 50,
    endStrength: 85,
    completedTickets: [
      { title: 'Close Q4 deal during qualifying lap', gridPoints: 13, status: 'checkered', completedQuip: 'Signed contract at 180mph. They couldn\'t say no.' },
      { title: 'Network at gas station', gridPoints: 2, status: 'checkered', completedQuip: 'Got 3 LinkedIn connections. Cashier wasn\'t interested.' },
      { title: 'Expense racing tires as "client entertainment"', gridPoints: 5, status: 'checkered', completedQuip: 'Accounting hasn\'t figured it out yet.' },
      { title: 'Synergize cross-functional racing strategy', gridPoints: 8, status: 'checkered', completedQuip: 'No one knows what this means but it sounds profitable.' },
      { title: 'Convert podium celebration into sales pitch', gridPoints: 3, status: 'checkered', completedQuip: 'Second place guy is now a client.' },
    ],
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
    vehicle: 'Ship-themed race car with sails, working cannons, and a crow\'s nest spoiler',
    vehicleEmoji: '⛵🏴‍☠️',
    consistency: 40,
    peakPower: 95,
    startStrength: 30,
    endStrength: 100,
    completedTickets: [
      { title: 'Plunder the competition (legally)', gridPoints: 8, status: 'checkered', completedQuip: 'Took their wind. And their sponsor.' },
      { title: 'Find buried treasure (gas station rewards)', gridPoints: 2, status: 'checkered', completedQuip: 'X marked the spot. Got free coffee.' },
      { title: 'Train parrot to trash talk opponents', gridPoints: 5, status: 'checkered', completedQuip: 'Polly now says "Your lap time is mid." Very proud.' },
      { title: 'Navigate through storm (heavy traffic)', gridPoints: 8, status: 'checkered', completedQuip: 'Lost 2 side mirrors but kept me dignity.' },
      { title: 'Recruit crew for pit stops', gridPoints: 3, status: 'checkered', completedQuip: 'They work for grog and glory. Mostly grog.' },
    ],
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
    vehicle: 'Peaceful hybrid covered in plants, crystals hanging from mirror, incense burning',
    vehicleEmoji: '🚗🌸',
    consistency: 90,
    peakPower: 65,
    startStrength: 60,
    endStrength: 75,
    completedTickets: [
      { title: 'Achieve inner peace during rush hour', gridPoints: 8, status: 'checkered', completedQuip: 'Om-ed through 3 red lights. Very centered.' },
      { title: 'Teach downward dog to pit crew', gridPoints: 3, status: 'checkered', completedQuip: 'They are more flexible. Tire changes: still same speed.' },
      { title: 'Meditate through engine failure', gridPoints: 5, status: 'checkered', completedQuip: 'Found peace. Did not find the problem. Tow truck did.' },
      { title: 'Convert road rage into road namaste', gridPoints: 5, status: 'checkered', completedQuip: 'Guy who cut me off is now my student. The universe provides.' },
      { title: 'Balance chakras and tire pressure', gridPoints: 2, status: 'checkered', completedQuip: 'Both are now at optimal levels. Coincidence?' },
    ],
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
    vehicle: 'Dented Honda Civic covered in bumper stickers, energy drinks in every cupholder',
    vehicleEmoji: '🚗📚',
    consistency: 30,
    peakPower: 90,
    startStrength: 20,
    endStrength: 95,
    completedTickets: [
      { title: 'Study for exam while racing', gridPoints: 8, status: 'checkered', completedQuip: 'Got B+ on exam. Got P7 in race. Multitasking legend.' },
      { title: 'Submit assignment 30 seconds before deadline', gridPoints: 5, status: 'checkered', completedQuip: 'Professor didn\'t specify WHICH 11:59pm timezone.' },
      { title: 'Find parking at campus (impossible)', gridPoints: 13, status: 'checkered', completedQuip: 'Created new parking spot. Security disagrees.' },
      { title: 'Survive on ramen and determination', gridPoints: 3, status: 'checkered', completedQuip: 'Day 47. The ramen sustains me. I am one with the noodle.' },
      { title: 'Pull all-nighter then win race', gridPoints: 8, status: 'checkered', completedQuip: 'Hallucinated a dragon at lap 12. Still finished P3.' },
    ],
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

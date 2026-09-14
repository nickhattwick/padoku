/**
 * Racing Rivals - AI competitors for the Paddock racing league
 * 32 total racers for the Grand Prix Championship
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
  image?: string; // Path to portrait image
  // Performance characteristics (0-100 scale)
  consistency: number; // How predictable their performance is
  peakPower: number; // Maximum potential output
  startStrength: number; // Early week performance
  endStrength: number; // End of week clutch factor
  // Comedic completed tickets
  completedTickets: RacerTicket[];
  // Championship tier (for seeding)
  tier: 'elite' | 'pro' | 'amateur' | 'rookie';
}

export const RACERS: Racer[] = [
  // === ELITE TIER (Top 8) ===
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
    image: '/racers/turbo-ted.png',
    consistency: 85,
    peakPower: 60,
    startStrength: 40,
    endStrength: 90,
    tier: 'elite',
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
    image: '/racers/apex-alice.png',
    consistency: 95,
    peakPower: 75,
    startStrength: 70,
    endStrength: 70,
    tier: 'elite',
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
    image: '/racers/nitro-knight.png',
    consistency: 70,
    peakPower: 85,
    startStrength: 80,
    endStrength: 65,
    tier: 'elite',
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
    image: '/racers/diesel-drake.png',
    consistency: 50,
    peakPower: 100,
    startStrength: 90,
    endStrength: 40,
    tier: 'elite',
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
    image: '/racers/slick-steve.png',
    consistency: 75,
    peakPower: 80,
    startStrength: 50,
    endStrength: 85,
    tier: 'elite',
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
    image: '/racers/captain-clutch.png',
    consistency: 40,
    peakPower: 95,
    startStrength: 30,
    endStrength: 100,
    tier: 'elite',
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
    image: '/racers/zen-zara.png',
    consistency: 90,
    peakPower: 65,
    startStrength: 60,
    endStrength: 75,
    tier: 'elite',
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
    image: '/racers/rookie-roxy.png',
    consistency: 30,
    peakPower: 90,
    startStrength: 20,
    endStrength: 95,
    tier: 'elite',
    completedTickets: [
      { title: 'Study for exam while racing', gridPoints: 8, status: 'checkered', completedQuip: 'Got B+ on exam. Got P7 in race. Multitasking legend.' },
      { title: 'Submit assignment 30 seconds before deadline', gridPoints: 5, status: 'checkered', completedQuip: 'Professor didn\'t specify WHICH 11:59pm timezone.' },
      { title: 'Find parking at campus (impossible)', gridPoints: 13, status: 'checkered', completedQuip: 'Created new parking spot. Security disagrees.' },
      { title: 'Survive on ramen and determination', gridPoints: 3, status: 'checkered', completedQuip: 'Day 47. The ramen sustains me. I am one with the noodle.' },
      { title: 'Pull all-nighter then win race', gridPoints: 8, status: 'checkered', completedQuip: 'Hallucinated a dragon at lap 12. Still finished P3.' },
    ],
  },

  // === PRO TIER (9-16) ===
  {
    id: 'gordon-gearshift',
    name: 'Gordon Gearshift',
    profession: 'Chef',
    racingName: 'The Kitchen Nightmare',
    emoji: '👨‍🍳',
    color: 'orange',
    personality: 'Intense and passionate. Screams at underperformers. Secretly caring.',
    catchphrases: [
      "This racing line is RAW!",
      "Finally, some good f***ing laps!",
      "You call that a pit stop?! My grandmother is faster!",
      "WHERE'S THE LAMB SAUCE... I mean, WHERE'S THE APEX?!",
    ],
    vehicle: 'Kitchen truck with a massive smoker exhaust and spatula spoiler',
    vehicleEmoji: '🚚🍳',
    image: '/racers/gordon-gearshift.png',
    consistency: 72,
    peakPower: 88,
    startStrength: 85,
    endStrength: 55,
    tier: 'pro',
    completedTickets: [
      { title: 'Perfect soufflé during hairpin turn', gridPoints: 13, status: 'checkered', completedQuip: 'Soufflé survived. Car didn\'t. Worth it.' },
      { title: 'Yell at pit crew until they improve', gridPoints: 5, status: 'checkered', completedQuip: 'Tire change: 2.1 seconds. Therapy bills: $5000.' },
      { title: 'Judge competitors\' meal prep', gridPoints: 3, status: 'checkered', completedQuip: 'Slick Steve eats microwave meals. Pathetic.' },
      { title: 'Create signature "Victory Flambe"', gridPoints: 8, status: 'checkered', completedQuip: 'Set podium on fire. Accidentally. Claimed intentional.' },
      { title: 'Write cookbook while in pit lane', gridPoints: 8, status: 'checkered', completedQuip: 'Chapter 7: "Meals You Can Eat With One Hand at 200mph"' },
    ],
  },
  {
    id: 'lunar-larry',
    name: 'Lunar Larry',
    profession: 'Astronaut',
    racingName: 'The Space Case',
    emoji: '🚀',
    color: 'indigo',
    personality: 'Spaced out but brilliant. Thinks in orbital mechanics.',
    catchphrases: [
      "In space, no one can hear you win!",
      "Just calculating my trajectory...",
      "Houston, we have a first place!",
      "Gravity is overrated. So is losing.",
    ],
    vehicle: 'Retrofitted lunar rover with rocket boosters and NASA stickers',
    vehicleEmoji: '🛸',
    image: '/racers/lunar-larry.png',
    consistency: 82,
    peakPower: 78,
    startStrength: 55,
    endStrength: 80,
    tier: 'pro',
    completedTickets: [
      { title: 'Land on Moon (simulator)', gridPoints: 8, status: 'checkered', completedQuip: 'Nailed it. Real moon: still pending NASA approval.' },
      { title: 'Calculate optimal race trajectory', gridPoints: 5, status: 'checkered', completedQuip: 'Used actual rocket science. Overkill? Never.' },
      { title: 'Fix spacesuit while racing', gridPoints: 8, status: 'checkered', completedQuip: 'Helmet foggy. Used windshield wipers. Improvise.' },
      { title: 'Train for zero-G pit stops', gridPoints: 5, status: 'checkered', completedQuip: 'Practiced in swimming pool. Pit crew confused.' },
      { title: 'Call ISS for racing tips', gridPoints: 3, status: 'checkered', completedQuip: 'They said "You\'re on your own down there." Rude.' },
    ],
  },
  {
    id: 'dj-drift',
    name: 'DJ Drift',
    profession: 'DJ',
    racingName: 'The Beat Dropper',
    emoji: '🎧',
    color: 'fuchsia',
    personality: 'Lives for the vibe. Everything syncs to the beat.',
    catchphrases: [
      "DROP THE BASS... and the competition!",
      "This track is fire! Both kinds!",
      "I don't race to the beat, the beat races to ME.",
      "If you can't handle the bass, stay out of the fast lane!",
    ],
    vehicle: 'Neon-lit sports car with 50,000 watt sound system',
    vehicleEmoji: '🚗🎵',
    image: '/racers/dj-drift.png',
    consistency: 55,
    peakPower: 85,
    startStrength: 75,
    endStrength: 70,
    tier: 'pro',
    completedTickets: [
      { title: 'Drop beat at exact race start', gridPoints: 5, status: 'checkered', completedQuip: 'Green light synced perfectly. Goosebumps.' },
      { title: 'Create remix using engine sounds', gridPoints: 8, status: 'checkered', completedQuip: 'V8 in E minor. Beautiful.' },
      { title: 'DJ pit stop party', gridPoints: 3, status: 'checkered', completedQuip: 'Pit crew danced. Lost 4 seconds. Worth it.' },
      { title: 'Coordinate light show with lap times', gridPoints: 8, status: 'checkered', completedQuip: 'Track now has a rave. Safety marshal concerned.' },
      { title: 'Mix victory and defeat anthems mid-race', gridPoints: 5, status: 'checkered', completedQuip: 'Playing both. Hedging my bets.' },
    ],
  },
  {
    id: 'blaze-brady',
    name: 'Blaze Brady',
    profession: 'Firefighter',
    racingName: 'The First Responder',
    emoji: '🚒',
    color: 'red',
    personality: 'Heroic and reliable. Always arrives when needed.',
    catchphrases: [
      "Someone call for a rescue? I'll save my own podium!",
      "Where there's smoke, there's my exhaust!",
      "I extinguish the competition!",
      "Stop, drop, and roll past you!",
    ],
    vehicle: 'Modified fire truck with water cannons and a really loud siren',
    vehicleEmoji: '🚒💨',
    image: '/racers/blaze-brady.png',
    consistency: 88,
    peakPower: 70,
    startStrength: 65,
    endStrength: 78,
    tier: 'pro',
    completedTickets: [
      { title: 'Rescue cat mid-race', gridPoints: 5, status: 'checkered', completedQuip: 'Cat safe. Lost P3. Would do again.' },
      { title: 'Put out Diesel Drake\'s engine fire', gridPoints: 3, status: 'checkered', completedQuip: 'He said it was "intentional". Sure, buddy.' },
      { title: 'Slide down pole to race car', gridPoints: 2, status: 'checkered', completedQuip: 'Installed pole in garage. 3 seconds faster.' },
      { title: 'Use hose to cool overheating brakes', gridPoints: 8, status: 'checkered', completedQuip: 'Technically not against the rules. Checked twice.' },
      { title: 'Train dalmatian as co-pilot', gridPoints: 8, status: 'checkered', completedQuip: 'Spot now handles radio. Very good boy.' },
    ],
  },
  {
    id: 'professor-propulsion',
    name: 'Professor Propulsion',
    profession: 'Scientist',
    racingName: 'The Mad Genius',
    emoji: '🔬',
    color: 'cyan',
    personality: 'Eccentric inventor. More interested in experiments than winning.',
    catchphrases: [
      "For SCIENCE!",
      "Hypothesis: I will win. Let's test it!",
      "My calculations indicate... VICTORY!",
      "This isn't even my final form... of racing!",
    ],
    vehicle: 'Lab on wheels with bubbling beakers, jacob\'s ladders, and a flux capacitor',
    vehicleEmoji: '🚗⚗️',
    image: '/racers/professor-propulsion.png',
    consistency: 45,
    peakPower: 92,
    startStrength: 40,
    endStrength: 88,
    tier: 'pro',
    completedTickets: [
      { title: 'Invent new fuel (highly explosive)', gridPoints: 13, status: 'checkered', completedQuip: 'Success! Note: wear eye protection next time.' },
      { title: 'Calculate exact millisecond to brake', gridPoints: 8, status: 'checkered', completedQuip: '47.3ms before apex. Paper published. Peer reviewed.' },
      { title: 'Clone self for pit stops', gridPoints: 21, status: 'checkered', completedQuip: 'Ethics board upset. Clone very helpful though.' },
      { title: 'Turn lead into gold (to buy tires)', gridPoints: 8, status: 'checkered', completedQuip: 'Alchemy works! (Don\'t tell economists.)' },
      { title: 'Build time machine to fix mistakes', gridPoints: 13, status: 'checkered', completedQuip: 'Only goes forward. At normal speed. Still a time machine.' },
    ],
  },
  {
    id: 'houdini-hank',
    name: 'Houdini Hank',
    profession: 'Magician',
    racingName: 'The Escape Artist',
    emoji: '🎩',
    color: 'violet',
    personality: 'Mysterious and dramatic. Never reveals his secrets.',
    catchphrases: [
      "Now you see me, now you're in second place!",
      "Watch closely... and watch me win!",
      "Nothing up my sleeve except VICTORY!",
      "The hand is quicker than the competition!",
    ],
    vehicle: 'Black classic car that appears from smoke with playing card paint job',
    vehicleEmoji: '🚗✨',
    image: '/racers/houdini-hank.png',
    consistency: 65,
    peakPower: 80,
    startStrength: 70,
    endStrength: 72,
    tier: 'pro',
    completedTickets: [
      { title: 'Escape from traffic jam', gridPoints: 8, status: 'checkered', completedQuip: 'Used secret passage. (It was the shoulder. Don\'t tell.)' },
      { title: 'Make opponent\'s lead disappear', gridPoints: 5, status: 'checkered', completedQuip: 'Presto! They\'re P2 now. Magic is real.' },
      { title: 'Perform card trick during pit stop', gridPoints: 3, status: 'checkered', completedQuip: 'Crew distracted. Still got 2.3s stop. Showmanship.' },
      { title: 'Vanish from last place', gridPoints: 8, status: 'checkered', completedQuip: 'Reappeared in P4. Crowd gasped. I bowed.' },
      { title: 'Saw car in half (for aerodynamics)', gridPoints: 5, status: 'checkered', completedQuip: 'Put it back together. Mostly. Some bolts optional.' },
    ],
  },
  {
    id: 'nana-nitro',
    name: 'Nana Nitro',
    profession: 'Grandmother',
    racingName: 'The Silver Bullet',
    emoji: '👵',
    color: 'gray',
    personality: 'Deceptively fast. Will offer you cookies then destroy you.',
    catchphrases: [
      "I've got hard candies AND hard laps, sweetie!",
      "Back in my day, we raced uphill! Both ways!",
      "You remind me of my grandson. He loses too.",
      "Let me just check my mirrors... to watch you EAT DUST!",
    ],
    vehicle: 'Hopped-up vintage Cadillac with lace seat covers and a lead foot',
    vehicleEmoji: '🚗👵',
    image: '/racers/nana-nitro.png',
    consistency: 78,
    peakPower: 72,
    startStrength: 60,
    endStrength: 82,
    tier: 'pro',
    completedTickets: [
      { title: 'Bake cookies between races', gridPoints: 3, status: 'checkered', completedQuip: 'Gave some to opponents. They\'re family now.' },
      { title: 'Knit victory flag while qualifying', gridPoints: 5, status: 'checkered', completedQuip: 'Finished flag AND lap. Multitasking queen.' },
      { title: 'Tell long story at pre-race meeting', gridPoints: 2, status: 'checkered', completedQuip: 'Started in 1962. Still going. They can\'t leave.' },
      { title: 'Use reading glasses for precision braking', gridPoints: 5, status: 'checkered', completedQuip: 'Can see the apex now. Competitors: blurry. Perfect.' },
      { title: 'Win race then complain about music', gridPoints: 8, status: 'checkered', completedQuip: 'Victory lap at 25mph. DJ Drift\'s music too loud.' },
    ],
  },
  {
    id: 'binary-bob',
    name: 'Binary Bob',
    profession: 'Robot',
    racingName: 'The Automaton',
    emoji: '🤖',
    color: 'zinc',
    personality: 'Logical and precise. Doesn\'t understand human emotions but tries.',
    catchphrases: [
      "01010111 01001001 01001110 (TRANSLATE: WIN)",
      "Emotions are inefficient. Victory is optimal.",
      "Processing... processing... PASSING!",
      "Human humor detected. Ha. Ha. Ha.",
    ],
    vehicle: 'Self-driving AI race car that he argues with constantly',
    vehicleEmoji: '🤖🚗',
    image: '/racers/binary-bob.png',
    consistency: 98,
    peakPower: 68,
    startStrength: 68,
    endStrength: 68,
    tier: 'pro',
    completedTickets: [
      { title: 'Update racing firmware', gridPoints: 5, status: 'checkered', completedQuip: 'Version 3.2.1. Changelog: "Go faster". Efficient.' },
      { title: 'Argue with onboard AI about racing line', gridPoints: 8, status: 'checkered', completedQuip: 'AI was wrong. I am AI. Paradox resolved via victory.' },
      { title: 'Learn human concept of "fun"', gridPoints: 3, status: 'checkered', completedQuip: 'Analysis: Fun = winning. Confirmed. End report.' },
      { title: 'Perform maintenance on self', gridPoints: 5, status: 'checkered', completedQuip: 'Oil changed. Existential crisis: pending.' },
      { title: 'Download racing strategies illegally', gridPoints: 8, status: 'checkered', completedQuip: 'Just kidding. Ethics subroutine operational. Downloaded legally.' },
    ],
  },

  // === AMATEUR TIER (17-24) ===
  {
    id: 'indiana-junior',
    name: 'Indiana Junior',
    profession: 'Archaeologist',
    racingName: 'The Relic Racer',
    emoji: '🏛️',
    color: 'amber',
    personality: 'Adventurous and knowledgeable. Finds treasure everywhere.',
    catchphrases: [
      "That trophy belongs in a MUSEUM... my trophy room!",
      "I've outrun boulders! You think traffic scares me?",
      "X marks the finish line!",
      "Fortune and glory, kid. Fortune and glory.",
    ],
    vehicle: 'Vintage jeep covered in mud, maps, and mysterious artifacts',
    vehicleEmoji: '🚙🗺️',
    image: '/racers/indiana-junior.png',
    consistency: 62,
    peakPower: 74,
    startStrength: 72,
    endStrength: 65,
    tier: 'amateur',
    completedTickets: [
      { title: 'Excavate ancient racing techniques', gridPoints: 8, status: 'checkered', completedQuip: 'Romans had chariots. Had. I have a jeep.' },
      { title: 'Outrun large boulder', gridPoints: 5, status: 'checkered', completedQuip: 'Classic Tuesday. Barely broke a sweat.' },
      { title: 'Recover stolen artifact mid-race', gridPoints: 13, status: 'checkered', completedQuip: 'Artifact: ancient steering wheel. Returned to Porsche museum.' },
      { title: 'Whip-swing across pit lane', gridPoints: 3, status: 'checkered', completedQuip: 'Safety officer fainted. Got cool slow-mo footage.' },
      { title: 'Decipher ancient racing runes', gridPoints: 5, status: 'checkered', completedQuip: 'Translation: "Go fast". Groundbreaking.' },
    ],
  },
  {
    id: 'count-checkpoint',
    name: 'Count Checkpoint',
    profession: 'Vampire',
    racingName: 'The Night Racer',
    emoji: '🧛',
    color: 'rose',
    personality: 'Dramatic and nocturnal. Complains about day races.',
    catchphrases: [
      "I vant to suck... the victory from you!",
      "The night is my domain! (Day races are fine too.)",
      "I've been racing for 500 years!",
      "Bleh! That lap time is DISGUSTING!",
    ],
    vehicle: 'Hearse converted to racer, only drives at night (sunroof welded shut)',
    vehicleEmoji: '🚗🦇',
    image: '/racers/count-checkpoint.png',
    consistency: 58,
    peakPower: 76,
    startStrength: 40,
    endStrength: 90,
    tier: 'amateur',
    completedTickets: [
      { title: 'Race past sunset', gridPoints: 8, status: 'checkered', completedQuip: 'Finally! Sunglasses off. Game on.' },
      { title: 'Avoid garlic bread at pit stop', gridPoints: 2, status: 'checkered', completedQuip: 'Crew offered breadsticks. I politely screamed.' },
      { title: 'Turn into bat to check track conditions', gridPoints: 5, status: 'checkered', completedQuip: 'Aerial recon complete. Turn 4 is treacherous.' },
      { title: 'Apply sunscreen SPF 10000', gridPoints: 3, status: 'checkered', completedQuip: 'Day race survived. Barely. Need nap in coffin.' },
      { title: 'Hypnotize competitor into slow lap', gridPoints: 8, status: 'checkered', completedQuip: 'Looked deep into their eyes. They forgot how to brake.' },
    ],
  },
  {
    id: 'tiktok-tanya',
    name: 'TikTok Tanya',
    profession: 'Influencer',
    racingName: 'The Content Creator',
    emoji: '📱',
    color: 'pink',
    personality: 'Always filming. Surprisingly competent racer.',
    catchphrases: [
      "Don't forget to like and subscribe... to my DUST!",
      "This overtake is SPONSORED BY—",
      "POV: You're about to get passed!",
      "And I OOP— got first place!",
    ],
    vehicle: 'Ring-light equipped sports car with selfie stick antenna',
    vehicleEmoji: '🚗📸',
    image: '/racers/tiktok-tanya.png',
    consistency: 48,
    peakPower: 82,
    startStrength: 85,
    endStrength: 50,
    tier: 'amateur',
    completedTickets: [
      { title: 'Film victory dance while steering', gridPoints: 5, status: 'checkered', completedQuip: 'Vertical video. Purists mad. 1M views.' },
      { title: 'Get sponsored by energy drink', gridPoints: 8, status: 'checkered', completedQuip: 'Now legally required to say "slay" 50x per race.' },
      { title: 'Clap back at hater in comments', gridPoints: 3, status: 'checkered', completedQuip: 'They said I can\'t race. Ratio\'d AND won.' },
      { title: 'Create viral pit stop transition', gridPoints: 8, status: 'checkered', completedQuip: 'Before: slow. After: fast. 5M views. Easy.' },
      { title: 'Unbox new racing tires on camera', gridPoints: 3, status: 'checkered', completedQuip: '10/10 unboxing. 7/10 tires. Brand deal secured.' },
    ],
  },
  {
    id: 'express-eddie',
    name: 'Express Eddie',
    profession: 'Mailman',
    racingName: 'The Delivery King',
    emoji: '📬',
    color: 'blue',
    personality: 'Reliable and punctual. Neither rain nor competition will stop him.',
    catchphrases: [
      "SPECIAL DELIVERY: Your loss!",
      "Rain, sleet, or hail—I still prevail!",
      "You've got mail... and I've got first place!",
      "Signed, sealed, DELIVERED!",
    ],
    vehicle: 'Souped-up mail truck with package launcher and postal eagle hood ornament',
    vehicleEmoji: '🚚📦',
    image: '/racers/express-eddie.png',
    consistency: 92,
    peakPower: 62,
    startStrength: 58,
    endStrength: 65,
    tier: 'amateur',
    completedTickets: [
      { title: 'Deliver package during race', gridPoints: 5, status: 'checkered', completedQuip: 'On-time delivery. Also on-time victory.' },
      { title: 'Avoid dog (it chases the truck)', gridPoints: 3, status: 'checkered', completedQuip: 'Good boy thought we were playing. We were not.' },
      { title: 'Sort mail by lap', gridPoints: 5, status: 'checkered', completedQuip: 'Lap 1-5: bills. Lap 6-10: junk. Lap 11: VICTORY.' },
      { title: 'Neither rain nor competitors stopped me', gridPoints: 8, status: 'checkered', completedQuip: 'Postal creed: updated to include racing.' },
      { title: 'Return to sender: 2nd place trophy', gridPoints: 5, status: 'checkered', completedQuip: 'Address unknown. Only accept 1st.' },
    ],
  },
  {
    id: 'rock-randy',
    name: 'Rock\'n\'Roll Randy',
    profession: 'Musician',
    racingName: 'The Guitar Hero',
    emoji: '🎸',
    color: 'red',
    personality: 'Loud, proud, and always performing. Air guitars during straightaways.',
    catchphrases: [
      "LET'S ROCK AND ROLL... past everyone!",
      "My engine screams like my guitar solos!",
      "Hello, [TRACK NAME]! Are you ready to LOSE?!",
      "I came, I shredded, I conquered!",
    ],
    vehicle: 'Amplifier-shaped hot rod with flame decals and pyrotechnics',
    vehicleEmoji: '🚗🔥',
    image: '/racers/rock-randy.png',
    consistency: 52,
    peakPower: 88,
    startStrength: 80,
    endStrength: 60,
    tier: 'amateur',
    completedTickets: [
      { title: 'Play guitar solo during victory lap', gridPoints: 5, status: 'checkered', completedQuip: 'Hands-free steering. Crowd went wild.' },
      { title: 'Write song about winning', gridPoints: 8, status: 'checkered', completedQuip: '"First Place Baby" - new single dropping never.' },
      { title: 'Crowd surf at finish line', gridPoints: 3, status: 'checkered', completedQuip: 'Pit crew caught me. Trust falls: earned.' },
      { title: 'Set off pyrotechnics accidentally', gridPoints: 5, status: 'checkered', completedQuip: 'Burned eyebrows. Looked metal. No regrets.' },
      { title: 'Challenge DJ Drift to music battle', gridPoints: 8, status: 'checkered', completedQuip: 'Rock vs EDM. Undecided. Crowd won.' },
    ],
  },
  {
    id: 'whisper-wilson',
    name: 'Whisper Wilson',
    profession: 'Librarian',
    racingName: 'The Silent Speed',
    emoji: '📚',
    color: 'emerald',
    personality: 'Quiet and observant. Will shush you if you\'re too loud.',
    catchphrases: [
      "Shhhh... I'm winning.",
      "The pen is mightier, but the car is faster.",
      "I've read about racing. Now I'm writing the book.",
      "*Silently passes you*",
    ],
    vehicle: 'Whisper-quiet electric car with book-stack spoiler',
    vehicleEmoji: '🚗📖',
    image: '/racers/whisper-wilson.png',
    consistency: 85,
    peakPower: 60,
    startStrength: 55,
    endStrength: 70,
    tier: 'amateur',
    completedTickets: [
      { title: 'Organize race schedule by Dewey Decimal', gridPoints: 5, status: 'checkered', completedQuip: '796.72 - Automobile racing. Perfect classification.' },
      { title: 'Shush Rock Randy', gridPoints: 3, status: 'checkered', completedQuip: 'He plays quieter now. Personal victory.' },
      { title: 'Read strategy book mid-race', gridPoints: 5, status: 'checkered', completedQuip: 'Chapter 7: "How to win". I took notes.' },
      { title: 'Late fee collection on competitor', gridPoints: 8, status: 'checkered', completedQuip: 'Slick Steve owes $4.50. I remember.' },
      { title: 'Maintain perfect silence in cockpit', gridPoints: 3, status: 'checkered', completedQuip: 'No radio. Just focus. And the occasional page turn.' },
    ],
  },
  {
    id: 'sherlock-shift',
    name: 'Sherlock Shift',
    profession: 'Detective',
    racingName: 'The Deducer',
    emoji: '🔍',
    color: 'slate',
    personality: 'Analytical and observant. Already knows you\'ll lose.',
    catchphrases: [
      "Elementary, my dear loser!",
      "I've deduced your strategy... and it's lacking.",
      "The game is AFOOT... on the gas pedal!",
      "Observe: I'm passing you. Now. Here. Yes.",
    ],
    vehicle: 'Classic British car with magnifying glass hood ornament and pipe smoke exhaust',
    vehicleEmoji: '🚗🔎',
    image: '/racers/sherlock-shift.png',
    consistency: 80,
    peakPower: 72,
    startStrength: 68,
    endStrength: 75,
    tier: 'amateur',
    completedTickets: [
      { title: 'Deduce competitor\'s pit strategy', gridPoints: 8, status: 'checkered', completedQuip: 'They\'ll pit lap 12. I pitted lap 11. Case closed.' },
      { title: 'Solve mystery of missing lap time', gridPoints: 5, status: 'checkered', completedQuip: 'It was in sector 2. The butler didn\'t do it.' },
      { title: 'Analyze tire marks for clues', gridPoints: 3, status: 'checkered', completedQuip: 'Diesel Drake brakes late. Now I know.' },
      { title: 'Interrogate pit crew', gridPoints: 5, status: 'checkered', completedQuip: 'They confessed to... excellent work. Case dismissed.' },
      { title: 'Find the smoking gun (engine)', gridPoints: 8, status: 'checkered', completedQuip: 'Literally smoking. Professor Propulsion\'s experiment.' },
    ],
  },
  {
    id: 'wave-rider-wes',
    name: 'Wave Rider Wes',
    profession: 'Surfer',
    racingName: 'The Gnarly Dude',
    emoji: '🏄',
    color: 'teal',
    personality: 'Laid back and chill. Surprisingly competitive when needed.',
    catchphrases: [
      "Duuude, that pass was totally tubular!",
      "I'm just riding the wave... of victory!",
      "Radical moves, bro!",
      "The ocean taught me flow. The track teaches me WIN!",
    ],
    vehicle: 'VW bus converted to racer, surfboard on roof, sand everywhere',
    vehicleEmoji: '🚐🏄',
    image: '/racers/wave-rider-wes.png',
    consistency: 55,
    peakPower: 70,
    startStrength: 45,
    endStrength: 85,
    tier: 'amateur',
    completedTickets: [
      { title: 'Catch perfect wave (traffic)', gridPoints: 5, status: 'checkered', completedQuip: 'Drafting is just surfing on land, bro.' },
      { title: 'Apply surfboard wax to tires', gridPoints: 3, status: 'checkered', completedQuip: 'Didn\'t help. Vibes immaculate though.' },
      { title: 'Meditate before race start', gridPoints: 3, status: 'checkered', completedQuip: 'One with the track. One with the universe. P4.' },
      { title: 'Shaka to competitor mid-overtake', gridPoints: 5, status: 'checkered', completedQuip: '🤙 They understood. Mutual respect. Still passed them.' },
      { title: 'Convert van to racing mode', gridPoints: 8, status: 'checkered', completedQuip: 'Removed surfboards. Added horsepower. Temporary sacrifice.' },
    ],
  },

  // === ROOKIE TIER (25-32) ===
  {
    id: 'taskmaster-tim',
    name: 'Taskmaster Tim',
    profession: 'Project Manager',
    racingName: 'The Gantt Chart',
    emoji: '📋',
    color: 'blue',
    personality: 'Obsessively organized. Has a spreadsheet for everything.',
    catchphrases: [
      "According to my timeline, I win in 3... 2... 1...",
      "Let's circle back to my victory!",
      "I've got action items for DOMINATION!",
      "This race is on track! Get it? TRACK?",
    ],
    vehicle: 'Sensible sedan covered in sticky notes with multiple monitors inside',
    vehicleEmoji: '🚗📊',
    image: '/racers/taskmaster-tim.png',
    consistency: 90,
    peakPower: 55,
    startStrength: 60,
    endStrength: 60,
    tier: 'rookie',
    completedTickets: [
      { title: 'Create Gantt chart for race', gridPoints: 5, status: 'checkered', completedQuip: 'Dependencies mapped. Pit stop: not on critical path.' },
      { title: 'Schedule 1:1 with car', gridPoints: 3, status: 'checkered', completedQuip: 'Car non-responsive. Marked as "needs follow-up".' },
      { title: 'Color-code racing strategy', gridPoints: 5, status: 'checkered', completedQuip: 'Red: danger. Green: go. Blue: also go but calmer.' },
      { title: 'Update status in stand-up meeting', gridPoints: 2, status: 'checkered', completedQuip: 'Yesterday: raced. Today: winning. Blockers: competitors.' },
      { title: 'Add racing to OKRs', gridPoints: 8, status: 'checkered', completedQuip: 'Q1 objective: Podium. Key result: Actually made it.' },
    ],
  },
  {
    id: 'caffeinated-carl',
    name: 'Caffeinated Carl',
    profession: 'Barista',
    racingName: 'The Espresso Express',
    emoji: '☕',
    color: 'amber',
    personality: 'Jittery and fast-talking. Runs on pure espresso.',
    catchphrases: [
      "COFFEE COFFEE WIN WIN GO GO!",
      "I'm not nervous, I'm CAFFEINATED!",
      "Shot of espresso? No. Shot of VICTORY!",
      "Decaf? DECAF?! I don't know her!",
    ],
    vehicle: 'Espresso machine on wheels with steam-powered boost',
    vehicleEmoji: '☕🚗',
    image: '/racers/caffeinated-carl.png',
    consistency: 35,
    peakPower: 85,
    startStrength: 95,
    endStrength: 30,
    tier: 'rookie',
    completedTickets: [
      { title: 'Brew espresso during pit stop', gridPoints: 3, status: 'checkered', completedQuip: 'Perfect crema. Perfect lap. Hands shaking.' },
      { title: 'Drink 12 shots before race', gridPoints: 5, status: 'checkered', completedQuip: 'Can see through time. Also see the apex clearly.' },
      { title: 'Convert nervous energy to speed', gridPoints: 5, status: 'checkered', completedQuip: 'Vibrating at optimal frequency. P3 achieved.' },
      { title: 'Crash mid-race (the caffeine kind)', gridPoints: 8, status: 'checkered', completedQuip: 'Lap 12: peaked. Lap 13: descend. Lap 14: nap.' },
      { title: 'Make latte art of race track', gridPoints: 5, status: 'checkered', completedQuip: 'Turn 3 looks delicious. Drank it.' },
    ],
  },
  {
    id: 'dating-derek',
    name: 'Dating Derek',
    profession: 'Dating Coach',
    racingName: 'The Smooth Operator',
    emoji: '💝',
    color: 'rose',
    personality: 'Confident and charming. Thinks everything is about connection.',
    catchphrases: [
      "Racing is just flirting with the finish line!",
      "I'm not overtaking, I'm making a move!",
      "The track and I? We have chemistry.",
      "Are you a checkpoint? Because I just fell for you!",
    ],
    vehicle: 'Red sports car with rose petals trailing behind',
    vehicleEmoji: '🚗💕',
    image: '/racers/dating-derek.png',
    consistency: 50,
    peakPower: 75,
    startStrength: 78,
    endStrength: 55,
    tier: 'rookie',
    completedTickets: [
      { title: 'Wink at competitor during pass', gridPoints: 3, status: 'checkered', completedQuip: 'They blushed. Then crashed. Accidental strategy.' },
      { title: 'Get track\'s phone number', gridPoints: 5, status: 'checkered', completedQuip: 'Turns out tracks don\'t have phones. But we connected.' },
      { title: 'Write love letter to podium', gridPoints: 3, status: 'checkered', completedQuip: 'Dear P1, I\'ll always climb to you. xoxo Derek' },
      { title: 'Host speed dating in pit lane', gridPoints: 8, status: 'checkered', completedQuip: '3 minutes per person. Faster than my pit stops.' },
      { title: 'Ghosted P2, chased P1', gridPoints: 5, status: 'checkered', completedQuip: 'P2 will recover. I have commitment issues with second.' },
    ],
  },
  {
    id: 'doctor-dashboard',
    name: 'Doctor Dashboard',
    profession: 'Doctor',
    racingName: 'The Vital Signs',
    emoji: '🏥',
    color: 'emerald',
    personality: 'Calm under pressure. Diagnoses competitors\' weaknesses.',
    catchphrases: [
      "I'm prescribing you... an L!",
      "Stat! That's racing talk, right?",
      "Let me check your vitals... hmm, low on victory.",
      "This might hurt a little... your pride, I mean.",
    ],
    vehicle: 'Ambulance converted to racer with working siren',
    vehicleEmoji: '🚑💨',
    image: '/racers/doctor-dashboard.png',
    consistency: 82,
    peakPower: 65,
    startStrength: 62,
    endStrength: 72,
    tier: 'rookie',
    completedTickets: [
      { title: 'Diagnose engine problems by sound', gridPoints: 5, status: 'checkered', completedQuip: 'It has a murmur. Prescribed octane boost.' },
      { title: 'Perform surgery on brake pads', gridPoints: 8, status: 'checkered', completedQuip: 'Patient stable. Stopping distance: improved.' },
      { title: 'Write prescription for speed', gridPoints: 3, status: 'checkered', completedQuip: 'Rx: Nitrous. Warning: May cause winning.' },
      { title: 'Flatline, then comeback victory', gridPoints: 8, status: 'checkered', completedQuip: 'We lost them... wait, no! P1! Clear!' },
      { title: 'Check competitors\' pulses', gridPoints: 5, status: 'checkered', completedQuip: 'Elevated. As expected. I cause that.' },
    ],
  },
  {
    id: 'fitness-fran',
    name: 'Fitness Fran',
    profession: 'Personal Trainer',
    racingName: 'The Leg Day Legend',
    emoji: '💪',
    color: 'orange',
    personality: 'Extremely motivational. Won\'t let you skip leg day.',
    catchphrases: [
      "FEEL THE BURN... of my exhaust!",
      "No pain no gain! No gas no pass!",
      "You can rest when you're SECOND PLACE!",
      "Thirty more laps! Come on, push it!",
    ],
    vehicle: 'Gym equipment truck with treadmill belt tires',
    vehicleEmoji: '🚚💪',
    image: '/racers/fitness-fran.png',
    consistency: 75,
    peakPower: 70,
    startStrength: 65,
    endStrength: 80,
    tier: 'rookie',
    completedTickets: [
      { title: 'Do push-ups between laps', gridPoints: 5, status: 'checkered', completedQuip: '50 reps. Steering: optional. Core: engaged.' },
      { title: 'Train pit crew in CrossFit', gridPoints: 8, status: 'checkered', completedQuip: 'Tire changes now include burpees. They hate me.' },
      { title: 'Count calories burned while racing', gridPoints: 3, status: 'checkered', completedQuip: '847 calories. Trophy: infinite calories of satisfaction.' },
      { title: 'Flex on podium for 10 minutes', gridPoints: 3, status: 'checkered', completedQuip: 'Each muscle group. Systematically. Photographer tired.' },
      { title: 'Motivational speech to car', gridPoints: 5, status: 'checkered', completedQuip: '"You can DO this!" Car revved. It worked.' },
    ],
  },
  {
    id: 'gamer-gary',
    name: 'Gamer Gary',
    profession: 'Pro Gamer',
    racingName: 'The Respawn King',
    emoji: '🎮',
    color: 'violet',
    personality: 'Treats real life like a video game. Surprisingly effective.',
    catchphrases: [
      "GG EZ!",
      "I've got the high score in REALITY!",
      "Is this ranked? Because I'm climbing!",
      "Real life has no respawn, but I'm built different.",
    ],
    vehicle: 'Gaming chair on wheels with RGB everything',
    vehicleEmoji: '🎮🚗',
    image: '/racers/gamer-gary.png',
    consistency: 42,
    peakPower: 88,
    startStrength: 70,
    endStrength: 75,
    tier: 'rookie',
    completedTickets: [
      { title: 'Stream race to 10k viewers', gridPoints: 8, status: 'checkered', completedQuip: 'Chat said "skill issue" when I crashed. Fair.' },
      { title: 'Unlock new racing achievement', gridPoints: 5, status: 'checkered', completedQuip: '"Pass 3 cars in 1 lap" - Achievement unlocked!' },
      { title: 'Optimize real life racing settings', gridPoints: 5, status: 'checkered', completedQuip: 'Graphics: maxed. FOV: unlimited. Skill: pending.' },
      { title: 'Speedrun the race', gridPoints: 13, status: 'checkered', completedQuip: 'Any% glitchless. New PB. Mods verifying.' },
      { title: 'Touch grass (required by sponsor)', gridPoints: 3, status: 'checkered', completedQuip: 'Grass touched. Immediately returned to car.' },
    ],
  },
  {
    id: 'haunted-harry',
    name: 'Haunted Harry',
    profession: 'Ghost Hunter',
    racingName: 'The Paranormal Pacer',
    emoji: '👻',
    color: 'slate',
    personality: 'Spooky and mysterious. May or may not be haunted himself.',
    catchphrases: [
      "I ain't afraid of no ghost... or losing!",
      "Something strange in the fast lane!",
      "Who you gonna call? VICTORY!",
      "The spirits say... you're getting passed!",
    ],
    vehicle: 'Vintage hearse with ghost-detecting equipment and fog machines',
    vehicleEmoji: '🚗👻',
    image: '/racers/haunted-harry.png',
    consistency: 48,
    peakPower: 78,
    startStrength: 55,
    endStrength: 82,
    tier: 'rookie',
    completedTickets: [
      { title: 'Communicate with ghost co-driver', gridPoints: 5, status: 'checkered', completedQuip: 'Ghost says "turn left". Ghost is helpful.' },
      { title: 'Investigate haunted pit lane', gridPoints: 8, status: 'checkered', completedQuip: 'Found: loose wrench. Ghost status: unconfirmed.' },
      { title: 'Deploy fog machine for dramatic entry', gridPoints: 3, status: 'checkered', completedQuip: 'Visibility: zero. Drama: maximum. Worth it.' },
      { title: 'Exorcise bad racing luck', gridPoints: 8, status: 'checkered', completedQuip: 'Luck demon expelled. P3 achieved. Coincidence?' },
      { title: 'Capture EVP of engine sounds', gridPoints: 5, status: 'checkered', completedQuip: 'Recording says "vroooom". Inconclusive.' },
    ],
  },
  {
    id: 'intern-irene',
    name: 'Intern Irene',
    profession: 'Intern',
    racingName: 'The Coffee Runner',
    emoji: '☕',
    color: 'gray',
    personality: 'Eager to prove herself. Constantly taking notes.',
    catchphrases: [
      "I'll CC everyone on my victory!",
      "This is going on my LinkedIn!",
      "Per my last lap, I'm winning!",
      "Unpaid overtime? More like unpaid OVERTAKE!",
    ],
    vehicle: 'Company car covered in "Intern of the Month" stickers',
    vehicleEmoji: '🚗📝',
    image: '/racers/intern-irene.png',
    consistency: 65,
    peakPower: 60,
    startStrength: 50,
    endStrength: 75,
    tier: 'rookie',
    completedTickets: [
      { title: 'Fetch coffee for entire pit crew', gridPoints: 3, status: 'checkered', completedQuip: '12 orders. No mistakes. Racing is easier.' },
      { title: 'Update racing resume', gridPoints: 3, status: 'checkered', completedQuip: '"Proficient in Microsoft Excel AND overtakes"' },
      { title: 'Network at post-race party', gridPoints: 5, status: 'checkered', completedQuip: 'Got 6 business cards. 0 job offers. Progress.' },
      { title: 'Take detailed race notes', gridPoints: 5, status: 'checkered', completedQuip: 'Turn 1: hard. Turn 2: harder. Analysis: thorough.' },
      { title: 'Ask if this counts as experience', gridPoints: 2, status: 'checkered', completedQuip: 'HR said maybe. Put it on resume anyway.' },
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
 * Get racers by tier
 */
export const getRacersByTier = (tier: Racer['tier']): Racer[] => {
  return RACERS.filter(r => r.tier === tier);
};

/**
 * Get tier multiplier for race simulation
 */
const getTierMultiplier = (tier: Racer['tier']): number => {
  switch (tier) {
    case 'elite': return 1.0;
    case 'pro': return 0.92;
    case 'amateur': return 0.84;
    case 'rookie': return 0.76;
    default: return 0.8;
  }
};

/**
 * Calculate a racer's daily points based on their characteristics
 * Returns a score influenced by their personality traits
 */
export const calculateRacerDailyPoints = (
  racer: Racer,
  daySeed: number, // Use day number as seed for reproducibility
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number => {
  // Seeded random for reproducible results per day
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const rand1 = seededRandom(daySeed + racer.id.charCodeAt(0));
  const rand2 = seededRandom(daySeed * 2 + racer.id.charCodeAt(1));

  // Base points from peak power, modified by tier
  const basePower = racer.peakPower * getTierMultiplier(racer.tier);

  // Consistency affects variance
  const variance = (100 - racer.consistency) / 100;
  const varianceMultiplier = 1 + (rand1 - 0.5) * variance;

  // Daily pattern: blend start and end strength
  const dayProgress = rand2; // Simulates when in the day they peak
  const strengthMultiplier =
    (racer.startStrength * (1 - dayProgress) + racer.endStrength * dayProgress) / 100;

  // Difficulty scaling
  const difficultyMultiplier = {
    easy: 0.6,
    medium: 0.8,
    hard: 1.0,
  }[difficulty];

  // Calculate final points (scaled to typical daily GP range of 15-50)
  const rawPoints = basePower * varianceMultiplier * strengthMultiplier * difficultyMultiplier;
  const scaledPoints = Math.round((rawPoints / 100) * 40 + 10); // 10-50 range

  return Math.max(5, Math.min(60, scaledPoints)); // Clamp to 5-60
};

// Backwards compatibility alias
export const calculateRacerWeeklyPoints = calculateRacerDailyPoints;

/**
 * Get week number of the year (1-52)
 */
export const getWeekNumber = (date: Date = new Date()): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

/**
 * Get month number (1-12)
 */
export const getMonthNumber = (date: Date = new Date()): number => {
  return date.getMonth() + 1;
};

/**
 * Get quarter/season (1-4)
 */
export const getSeasonNumber = (date: Date = new Date()): number => {
  return Math.ceil((date.getMonth() + 1) / 3);
};

/**
 * Get season name
 */
export const getSeasonName = (season: number): string => {
  const names = ['', 'Winter', 'Spring', 'Summer', 'Fall'];
  return names[season] || '';
};

/**
 * Get month name
 */
export const getMonthName = (month: number): string => {
  const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month] || '';
};

/**
 * Monthly Grand Prix themes
 */
export interface GrandPrixTheme {
  name: string;
  cup: string;
  emoji: string;
  color: string; // Tailwind gradient classes
  description: string;
}

export const MONTHLY_GP_THEMES: Record<number, GrandPrixTheme> = {
  1: {
    name: 'Polar Prix',
    cup: 'Frostbite Cup',
    emoji: '❄️',
    color: 'from-cyan-600 to-blue-700',
    description: 'Brave the frozen tracks in the coldest championship of the year',
  },
  2: {
    name: 'Valentines Grand Prix',
    cup: "Cupid's Cup",
    emoji: '💘',
    color: 'from-pink-600 to-red-600',
    description: 'Race for love and glory in the most romantic GP of the season',
  },
  3: {
    name: 'Lucky Lap',
    cup: 'Shamrock Cup',
    emoji: '🍀',
    color: 'from-green-600 to-emerald-700',
    description: 'Fortune favors the bold in this luck-of-the-Irish showdown',
  },
  4: {
    name: 'Spring Sprint',
    cup: 'April Showers Cup',
    emoji: '🌧️',
    color: 'from-blue-500 to-purple-600',
    description: 'Navigate treacherous wet conditions as spring storms roll in',
  },
  5: {
    name: 'Bloom Boost',
    cup: 'Blossom Grand Prix',
    emoji: '🌸',
    color: 'from-pink-500 to-yellow-500',
    description: 'Spring into action as the track comes alive with color',
  },
  6: {
    name: 'Summer Solstice GP',
    cup: 'Solstice Grand Prix',
    emoji: '☀️',
    color: 'from-orange-500 to-yellow-500',
    description: 'Push through the heat in the longest racing days of the year',
  },
  7: {
    name: 'Independence GP',
    cup: 'Fireworks Cup',
    emoji: '🎆',
    color: 'from-red-600 to-blue-600',
    description: 'Celebrate freedom with explosive speed and dazzling finishes',
  },
  8: {
    name: 'Beach Burnout',
    cup: 'Summer Slam Cup',
    emoji: '🏖️',
    color: 'from-amber-500 to-orange-600',
    description: 'Hit the coastal circuits for summer\'s hottest racing action',
  },
  9: {
    name: 'Back to Track',
    cup: 'Harvest Cup',
    emoji: '🍂',
    color: 'from-orange-600 to-amber-700',
    description: 'Return to serious racing as autumn leaves fall on the track',
  },
  10: {
    name: 'Phantom Prix',
    cup: 'Spooky Cup',
    emoji: '👻',
    color: 'from-purple-700 to-gray-900',
    description: 'Race through haunted tracks where only the brave survive',
  },
  11: {
    name: 'Gratitude GP',
    cup: 'Gobbler Grand Prix',
    emoji: '🦃',
    color: 'from-amber-600 to-orange-700',
    description: 'Give thanks by dominating the competition on turkey day tracks',
  },
  12: {
    name: 'Winter Wonderland',
    cup: 'Sleigh Rider Cup',
    emoji: '🎄',
    color: 'from-red-600 to-green-600',
    description: 'Dash through the snow to claim the final cup of the year',
  },
};

/**
 * Get the current GP theme
 */
export const getGrandPrixTheme = (month: number): GrandPrixTheme => {
  return MONTHLY_GP_THEMES[month] || MONTHLY_GP_THEMES[1];
};

/**
 * Get days remaining in the current month
 */
export const getDaysRemainingInMonth = (date: Date = new Date()): number => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.getDate() - date.getDate();
};

/**
 * Get current week number within the month (1-5)
 */
export const getWeekOfMonth = (date: Date = new Date()): number => {
  return Math.ceil(date.getDate() / 7);
};

/**
 * Get the start of the current race week (Sunday 00:00 in given timezone)
 * @param timezone - IANA timezone string (default: America/New_York for EST)
 */
export const getRaceWeekStart = (timezone: string = 'America/New_York'): Date => {
  const now = new Date();
  // Get current time in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const weekday = parts.find(p => p.type === 'weekday')?.value;
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  
  // Calculate days since Sunday (0 = Sunday)
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday || 'Sun');
  
  // Get this week's Sunday
  const sunday = new Date(year, month, day - dayIndex);
  sunday.setHours(0, 0, 0, 0);
  
  return sunday;
};

/**
 * Get the end of the current race week (Saturday 23:59:59)
 */
export const getRaceWeekEnd = (timezone: string = 'America/New_York'): Date => {
  const start = getRaceWeekStart(timezone);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get days remaining in the current race week
 */
export const getDaysRemainingInWeek = (timezone: string = 'America/New_York'): number => {
  const end = getRaceWeekEnd(timezone);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Check if this is a new race week (within first day)
 */
export const isNewRaceWeek = (timezone: string = 'America/New_York'): boolean => {
  const start = getRaceWeekStart(timezone);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  // Within first 24 hours of race week
  return diff < 24 * 60 * 60 * 1000;
};

/**
 * Check if this is a new month (within first day)
 */
export const isNewMonth = (): boolean => {
  const now = new Date();
  return now.getDate() === 1;
};

/**
 * Get the previous week number and year
 */
export const getPreviousWeek = (currentWeek: number, currentYear: number): { week: number; year: number } => {
  if (currentWeek > 1) {
    return { week: currentWeek - 1, year: currentYear };
  }
  return { week: 52, year: currentYear - 1 };
};

/**
 * Get the previous month and year
 */
export const getPreviousMonth = (currentMonth: number, currentYear: number): { month: number; year: number } => {
  if (currentMonth > 1) {
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: 12, year: currentYear - 1 };
};

/**
 * Seeded random number generator for reproducible results
 */
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/**
 * Select random racers for a weekly race (deterministic based on week seed)
 * Player replaces one racer, so we pick (fieldSize - 1) AI racers
 */
export const selectWeeklyRacers = (
  weekSeed: number,
  fieldSize: number = 8
): Racer[] => {
  // Use week seed to deterministically shuffle and select racers
  const shuffled = [...RACERS].sort((a, b) => {
    const seedA = seededRandom(weekSeed + a.id.charCodeAt(0) + a.id.charCodeAt(1));
    const seedB = seededRandom(weekSeed + b.id.charCodeAt(0) + b.id.charCodeAt(1));
    return seedA - seedB;
  });

  // Weight selection toward higher tiers but include variety
  // For field of 8: 3 elite, 2 pro, 1 amateur, 1 rookie = 7 AI + player
  const aiCount = fieldSize - 1;
  const selected: Racer[] = [];
  
  const elites = shuffled.filter(r => r.tier === 'elite');
  const pros = shuffled.filter(r => r.tier === 'pro');
  const amateurs = shuffled.filter(r => r.tier === 'amateur');
  const rookies = shuffled.filter(r => r.tier === 'rookie');

  // Distribution based on field size
  if (aiCount >= 7) {
    selected.push(...elites.slice(0, 3));
    selected.push(...pros.slice(0, 2));
    selected.push(...amateurs.slice(0, 1));
    selected.push(...rookies.slice(0, 1));
  } else if (aiCount >= 5) {
    selected.push(...elites.slice(0, 2));
    selected.push(...pros.slice(0, 2));
    selected.push(...amateurs.slice(0, 1));
  } else {
    selected.push(...elites.slice(0, aiCount));
  }

  return selected.slice(0, aiCount);
};

/**
 * Simulate a weekly race
 * Player is one of the fieldSize racers (not extra)
 * Returns sorted standings
 */
export const simulateWeeklyRace = (
  weekNumber: number,
  year: number,
  playerPoints: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  fieldSize: number = 8
): RaceResult[] => {
  const weekSeed = year * 100 + weekNumber;
  const selectedRacers = selectWeeklyRacers(weekSeed, fieldSize);

  const results: RaceResult[] = selectedRacers.map((racer) => ({
    racer,
    points: calculateRacerDailyPoints(racer, weekSeed, difficulty),
    isPlayer: false,
  }));

  // Add player as part of the field (not extra)
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

/**
 * Legacy: Simulate a full daily race (backwards compatible)
 * Note: Player is ADDED to the field (old behavior)
 */
export const simulateRace = (
  dayNumber: number,
  playerPoints: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  racerCount: number = 8 // Field size including player
): RaceResult[] => {
  // Select racers - player is part of the count now
  const aiCount = racerCount - 1;
  let selectedRacers: Racer[];
  
  if (aiCount >= 32) {
    selectedRacers = RACERS;
  } else if (aiCount >= 16) {
    selectedRacers = [...getRacersByTier('elite'), ...getRacersByTier('pro')].slice(0, aiCount);
  } else if (aiCount >= 8) {
    selectedRacers = getRacersByTier('elite');
  } else {
    selectedRacers = getRacersByTier('elite').slice(0, aiCount);
  }

  const results: RaceResult[] = selectedRacers.map((racer) => ({
    racer,
    points: calculateRacerDailyPoints(racer, dayNumber, difficulty),
    isPlayer: false,
  }));

  // Add player as part of the field
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

/**
 * Get weeks in a month
 */
const getWeeksInMonth = (month: number, year: number): number[] => {
  const weeks: number[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  let currentDate = new Date(firstDay);
  while (currentDate <= lastDay) {
    const week = getWeekNumber(currentDate);
    if (!weeks.includes(week)) {
      weeks.push(week);
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return weeks;
};

/**
 * Simulate Monthly Grand Prix standings
 * Based on weekly race results within the month
 */
export const simulateMonthlyGrandPrix = (
  month: number, // 1-12
  year: number,
  playerWeeklyPoints: Map<number, number>, // week -> total GP earned
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ChampionshipStanding[] => {
  const standings = new Map<string, ChampionshipStanding>();
  const currentWeek = getWeekNumber();
  const currentYear = new Date().getFullYear();

  // Initialize standings for all 32 racers
  RACERS.forEach(racer => {
    standings.set(racer.id, {
      racer,
      totalPoints: 0,
      races: 0,
      wins: 0,
      podiums: 0,
      isPlayer: false,
    });
  });

  standings.set('player', {
    racer: null,
    totalPoints: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    isPlayer: true,
  });

  // Get weeks in this month
  const weeks = getWeeksInMonth(month, year);
  
  // Simulate each weekly race
  for (const week of weeks) {
    // Don't simulate future weeks
    if (year > currentYear || (year === currentYear && week > currentWeek)) {
      continue;
    }

    const playerPoints = playerWeeklyPoints.get(week) || 0;
    const results = simulateWeeklyRace(week, year, playerPoints, difficulty, 8);

    // Update standings only for racers who participated this week
    results.forEach(result => {
      const id = result.isPlayer ? 'player' : result.racer!.id;
      let standing = standings.get(id);
      
      if (!standing) {
        // Racer wasn't in initial set (shouldn't happen but safety check)
        return;
      }

      standing.races++;
      standing.totalPoints += getPositionPoints(result.position!);
      if (result.position === 1) standing.wins++;
      if (result.position! <= 3) standing.podiums++;
    });
  }

  // Convert to array, filter to only those who raced, and sort
  return Array.from(standings.values())
    .filter(s => s.races > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));
};

/**
 * Simulate Seasonal Championship standings (3 months / quarter)
 */
export const simulateSeasonalChampionship = (
  season: number, // 1-4 (Q1-Q4)
  year: number,
  playerWeeklyPoints: Map<number, number>,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ChampionshipStanding[] => {
  const standings = new Map<string, ChampionshipStanding>();

  // Initialize all racers
  RACERS.forEach(racer => {
    standings.set(racer.id, {
      racer,
      totalPoints: 0,
      races: 0,
      wins: 0,
      podiums: 0,
      isPlayer: false,
    });
  });

  standings.set('player', {
    racer: null,
    totalPoints: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    isPlayer: true,
  });

  // Get months in this season
  const startMonth = (season - 1) * 3 + 1; // 1, 4, 7, 10
  const months = [startMonth, startMonth + 1, startMonth + 2];

  // Aggregate monthly GP results
  for (const month of months) {
    const monthlyStandings = simulateMonthlyGrandPrix(month, year, playerWeeklyPoints, difficulty);
    
    monthlyStandings.forEach(ms => {
      const id = ms.isPlayer ? 'player' : ms.racer!.id;
      const standing = standings.get(id)!;
      
      // Award points based on monthly GP position
      standing.totalPoints += getPositionPoints(ms.position!);
      standing.races += ms.races;
      standing.wins += ms.wins;
      standing.podiums += ms.podiums;
    });
  }

  return Array.from(standings.values())
    .filter(s => s.races > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));
};

/**
 * Simulate Annual Championship standings
 */
export const simulateAnnualChampionship = (
  year: number,
  playerWeeklyPoints: Map<number, number>,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ChampionshipStanding[] => {
  const standings = new Map<string, ChampionshipStanding>();

  RACERS.forEach(racer => {
    standings.set(racer.id, {
      racer,
      totalPoints: 0,
      races: 0,
      wins: 0,
      podiums: 0,
      isPlayer: false,
    });
  });

  standings.set('player', {
    racer: null,
    totalPoints: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    isPlayer: true,
  });

  // Aggregate all 4 seasonal championships
  for (let season = 1; season <= 4; season++) {
    const seasonalStandings = simulateSeasonalChampionship(season, year, playerWeeklyPoints, difficulty);
    
    seasonalStandings.forEach(ss => {
      const id = ss.isPlayer ? 'player' : ss.racer!.id;
      const standing = standings.get(id)!;
      
      standing.totalPoints += getPositionPoints(ss.position!);
      standing.races += ss.races;
      standing.wins += ss.wins;
      standing.podiums += ss.podiums;
    });
  }

  return Array.from(standings.values())
    .filter(s => s.races > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));
};

/**
 * Legacy: Simulate full Grand Prix season standings (cumulative over days)
 * @deprecated Use simulateMonthlyGrandPrix instead
 */
export const simulateGrandPrixStandings = (
  currentDay: number,
  playerDailyPoints: Map<number, number>, // day -> points
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ChampionshipStanding[] => {
  const standings = new Map<string, ChampionshipStanding>();

  // Initialize all racers
  RACERS.forEach(racer => {
    standings.set(racer.id, {
      racer,
      totalPoints: 0,
      races: 0,
      wins: 0,
      podiums: 0,
      isPlayer: false,
    });
  });

  // Initialize player
  standings.set('player', {
    racer: null,
    totalPoints: 0,
    races: 0,
    wins: 0,
    podiums: 0,
    isPlayer: true,
  });

  // Simulate each day up to current
  const startDay = Math.max(1, currentDay - 30); // Last 30 days of season
  for (let day = startDay; day <= currentDay; day++) {
    const playerPoints = playerDailyPoints.get(day) || 0;
    const results = simulateRace(day, playerPoints, difficulty, 8);

    results.forEach(result => {
      const id = result.isPlayer ? 'player' : result.racer!.id;
      const standing = standings.get(id);
      if (!standing) return;

      standing.races++;
      standing.totalPoints += getPositionPoints(result.position!);
      if (result.position === 1) standing.wins++;
      if (result.position! <= 3) standing.podiums++;
    });
  }

  // Convert to array and sort
  return Array.from(standings.values())
    .filter(s => s.races > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
    }));
};

export interface ChampionshipStanding {
  racer: Racer | null;
  totalPoints: number;
  races: number;
  wins: number;
  podiums: number;
  isPlayer: boolean;
  position?: number;
}

export interface RaceResult {
  racer: Racer | null; // null for player
  points: number;
  isPlayer: boolean;
  position?: number;
}

/**
 * F1-style points for positions (expanded for 32 racers)
 */
export const POSITION_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const;

export const getPositionPoints = (position: number): number => {
  if (position < 1 || position > 33) return 0;
  return POSITION_POINTS[position - 1] || 0;
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

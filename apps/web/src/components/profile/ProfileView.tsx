import { useState } from 'react';
import { User } from '../../api/auth';
import { useAllWorkItems } from '../../api/queries';
import '../../styles/racing.css';

// Badge definitions
const ALL_BADGES = {
  // Monthly badges
  monthly: [
    { id: 'jan-cold-start', name: 'Cold Start', description: 'Complete a task in January', image: '/badges/jan-cold-start/image_0.png' },
    { id: 'feb-heartbreaker', name: 'Heartbreaker', description: 'Complete a task in February', image: '/badges/feb-heartbreaker/image_0.png' },
    { id: 'mar-lucky-lap', name: 'Lucky Lap', description: 'Complete a task in March', image: '/badges/mar-lucky-lap/image_0.png' },
    { id: 'apr-rain-racer', name: 'Rain Racer', description: 'Complete a task in April', image: '/badges/apr-rain-racer/image_0.png' },
    { id: 'may-bloom-boost', name: 'Bloom Boost', description: 'Complete a task in May', image: '/badges/may-bloom-boost/image_0.png' },
    { id: 'jun-solar-flare', name: 'Solar Flare', description: 'Complete a task in June', image: '/badges/jun-solar-flare/image_0.png' },
    { id: 'jul-firework-finish', name: 'Firework Finish', description: 'Complete a task in July', image: '/badges/jul-firework-finish/image_0.png' },
    { id: 'aug-beach-burnout', name: 'Beach Burnout', description: 'Complete a task in August', image: '/badges/aug-beach-burnout/image_0.png' },
    { id: 'sep-back-to-track', name: 'Back to Track', description: 'Complete a task in September', image: '/badges/sep-back-to-track/image_0.png' },
    { id: 'oct-phantom-racer', name: 'Phantom Racer', description: 'Complete a task in October', image: '/badges/oct-phantom-racer/image_0.png' },
    { id: 'nov-turbo-turkey', name: 'Turbo Turkey', description: 'Complete a task in November', image: '/badges/nov-turbo-turkey/image_0.png' },
    { id: 'dec-sleigh-rider', name: 'Sleigh Rider', description: 'Complete a task in December', image: '/badges/dec-sleigh-rider/image_0.png' },
  ],
  // Task completion badges
  tasks: [
    { id: 'task-01-pit-stop', name: 'Pit Stop', description: 'Complete 1 task', requirement: 1, image: '/badges/task-01-pit-stop/image_0.png' },
    { id: 'task-10-tire-change', name: 'Tire Change', description: 'Complete 10 tasks', requirement: 10, image: '/badges/task-10-tire-change/image_0.png' },
    { id: 'task-25-fueled-up', name: 'Fueled Up', description: 'Complete 25 tasks', requirement: 25, image: '/badges/task-25-fueled-up/image_0.png' },
    { id: 'task-50-engine-running', name: 'Engine Running', description: 'Complete 50 tasks', requirement: 50, image: '/badges/task-50-engine-running/image_0.png' },
    { id: 'task-100-full-throttle', name: 'Full Throttle', description: 'Complete 100 tasks', requirement: 100, image: '/badges/task-100-full-throttle/image_0.png' },
    { id: 'task-250-nitro-boost', name: 'Nitro Boost', description: 'Complete 250 tasks', requirement: 250, image: '/badges/task-250-nitro-boost/image_0.png' },
    { id: 'task-500-lightning-lap', name: 'Lightning Lap', description: 'Complete 500 tasks', requirement: 500, image: '/badges/task-500-lightning-lap/image_0.png' },
    { id: 'task-1000-pit-chief', name: 'Pit Crew Chief', description: 'Complete 1,000 tasks', requirement: 1000, image: '/badges/task-1000-pit-chief/image_0.png' },
  ],
  // Task creation badges
  created: [
    { id: 'create-01-first-idea', name: 'First Idea', description: 'Create 1 task', requirement: 1, image: '/badges/create-01-first-idea/image_0.png' },
    { id: 'create-10-planner', name: 'Planner', description: 'Create 10 tasks', requirement: 10, image: '/badges/create-10-planner/image_0.png' },
    { id: 'create-25-strategist', name: 'Strategist', description: 'Create 25 tasks', requirement: 25, image: '/badges/create-25-strategist/image_0.png' },
    { id: 'create-50-architect', name: 'Architect', description: 'Create 50 tasks', requirement: 50, image: '/badges/create-50-architect/image_0.png' },
    { id: 'create-100-mastermind', name: 'Mastermind', description: 'Create 100 tasks', requirement: 100, image: '/badges/create-100-mastermind/image_0.png' },
    { id: 'create-250-visionary', name: 'Visionary', description: 'Create 250 tasks', requirement: 250, image: '/badges/create-250-visionary/image_0.png' },
    { id: 'create-500-empire-builder', name: 'Empire Builder', description: 'Create 500 tasks', requirement: 500, image: '/badges/create-500-empire-builder/image_0.png' },
    { id: 'create-1000-legendary', name: 'Legendary Architect', description: 'Create 1,000 tasks', requirement: 1000, image: '/badges/create-1000-legendary/image_0.png' },
  ],
  // Started (moved to in progress) badges
  started: [
    { id: 'start-01-ignition', name: 'Ignition', description: 'Start 1 task', requirement: 1, image: '/badges/start-01-ignition/image_0.png' },
    { id: 'start-10-revving', name: 'Revving Up', description: 'Start 10 tasks', requirement: 10, image: '/badges/start-10-revving/image_0.png' },
    { id: 'start-25-momentum', name: 'Momentum', description: 'Start 25 tasks', requirement: 25, image: '/badges/start-25-momentum/image_0.png' },
    { id: 'start-50-cruising', name: 'Cruising', description: 'Start 50 tasks', requirement: 50, image: '/badges/start-50-cruising/image_0.png' },
    { id: 'start-100-accelerator', name: 'Accelerator', description: 'Start 100 tasks', requirement: 100, image: '/badges/start-100-accelerator/image_0.png' },
    { id: 'start-250-velocity', name: 'Velocity', description: 'Start 250 tasks', requirement: 250, image: '/badges/start-250-velocity/image_0.png' },
    { id: 'start-500-hyperdrive', name: 'Hyperdrive', description: 'Start 500 tasks', requirement: 500, image: '/badges/start-500-hyperdrive/image_0.png' },
    { id: 'start-1000-lightspeed', name: 'Lightspeed', description: 'Start 1,000 tasks', requirement: 1000, image: '/badges/start-1000-lightspeed/image_0.png' },
  ],
  // Unblocked completions badges
  unblocked: [
    { id: 'unblock-01-breakthrough', name: 'Breakthrough', description: 'Complete 1 blocked task', requirement: 1, image: '/badges/unblock-01-breakthrough/image_0.png' },
    { id: 'unblock-05-obstacle-crusher', name: 'Obstacle Crusher', description: 'Complete 5 blocked tasks', requirement: 5, image: '/badges/unblock-05-obstacle-crusher/image_0.png' },
    { id: 'unblock-10-wall-breaker', name: 'Wall Breaker', description: 'Complete 10 blocked tasks', requirement: 10, image: '/badges/unblock-10-wall-breaker/image_0.png' },
    { id: 'unblock-25-unstoppable', name: 'Unstoppable', description: 'Complete 25 blocked tasks', requirement: 25, image: '/badges/unblock-25-unstoppable/image_0.png' },
    { id: 'unblock-50-juggernaut', name: 'Juggernaut', description: 'Complete 50 blocked tasks', requirement: 50, image: '/badges/unblock-50-juggernaut/image_0.png' },
    { id: 'unblock-100-demolisher', name: 'Demolisher', description: 'Complete 100 blocked tasks', requirement: 100, image: '/badges/unblock-100-demolisher/image_0.png' },
  ],
  // Weekly race wins badges
  races: [
    { id: 'race-01-podium', name: 'Podium Finish', description: 'Win 1 weekly race', requirement: 1, image: '/badges/race-01-podium/image_0.png' },
    { id: 'race-05-contender', name: 'Regular Contender', description: 'Win 5 weekly races', requirement: 5, image: '/badges/race-05-contender/image_0.png' },
    { id: 'race-10-champion', name: 'Circuit Champion', description: 'Win 10 weekly races', requirement: 10, image: '/badges/race-10-champion/image_0.png' },
    { id: 'race-25-victor', name: 'Grand Prix Victor', description: 'Win 25 weekly races', requirement: 25, image: '/badges/race-25-victor/image_0.png' },
    { id: 'race-50-legend', name: 'Racing Legend', description: 'Win 50 weekly races', requirement: 50, image: '/badges/race-50-legend/image_0.png' },
    { id: 'race-100-unbeatable', name: 'Unbeatable', description: 'Win 100 weekly races', requirement: 100, image: '/badges/race-100-unbeatable/image_0.png' },
  ],
  // Monthly Grand Prix badges
  monthlyGp: [
    { id: 'gp-jan-participant', name: 'January Racer', description: 'Compete in January GP', month: 1, image: '/badges/gp-jan-participant/image_0.png' },
    { id: 'gp-jan-bronze', name: 'January Bronze', description: 'Finish P3 in January GP', month: 1, position: 3, image: '/badges/gp-jan-bronze/image_0.png' },
    { id: 'gp-jan-silver', name: 'January Silver', description: 'Finish P2 in January GP', month: 1, position: 2, image: '/badges/gp-jan-silver/image_0.png' },
    { id: 'gp-jan-gold', name: 'January Champion', description: 'Win January GP', month: 1, position: 1, image: '/badges/gp-jan-gold/image_0.png' },
    { id: 'gp-feb-participant', name: 'February Racer', description: 'Compete in February GP', month: 2, image: '/badges/gp-feb-participant/image_0.png' },
    { id: 'gp-feb-bronze', name: 'February Bronze', description: 'Finish P3 in February GP', month: 2, position: 3, image: '/badges/gp-feb-bronze/image_0.png' },
    { id: 'gp-feb-silver', name: 'February Silver', description: 'Finish P2 in February GP', month: 2, position: 2, image: '/badges/gp-feb-silver/image_0.png' },
    { id: 'gp-feb-gold', name: 'February Champion', description: 'Win February GP', month: 2, position: 1, image: '/badges/gp-feb-gold/image_0.png' },
    { id: 'gp-mar-participant', name: 'March Racer', description: 'Compete in March GP', month: 3, image: '/badges/gp-mar-participant/image_0.png' },
    { id: 'gp-mar-bronze', name: 'March Bronze', description: 'Finish P3 in March GP', month: 3, position: 3, image: '/badges/gp-mar-bronze/image_0.png' },
    { id: 'gp-mar-silver', name: 'March Silver', description: 'Finish P2 in March GP', month: 3, position: 2, image: '/badges/gp-mar-silver/image_0.png' },
    { id: 'gp-mar-gold', name: 'March Champion', description: 'Win March GP', month: 3, position: 1, image: '/badges/gp-mar-gold/image_0.png' },
    { id: 'gp-apr-participant', name: 'April Racer', description: 'Compete in April GP', month: 4, image: '/badges/gp-apr-participant/image_0.png' },
    { id: 'gp-apr-bronze', name: 'April Bronze', description: 'Finish P3 in April GP', month: 4, position: 3, image: '/badges/gp-apr-bronze/image_0.png' },
    { id: 'gp-apr-silver', name: 'April Silver', description: 'Finish P2 in April GP', month: 4, position: 2, image: '/badges/gp-apr-silver/image_0.png' },
    { id: 'gp-apr-gold', name: 'April Champion', description: 'Win April GP', month: 4, position: 1, image: '/badges/gp-apr-gold/image_0.png' },
    { id: 'gp-may-participant', name: 'May Racer', description: 'Compete in May GP', month: 5, image: '/badges/gp-may-participant/image_0.png' },
    { id: 'gp-may-bronze', name: 'May Bronze', description: 'Finish P3 in May GP', month: 5, position: 3, image: '/badges/gp-may-bronze/image_0.png' },
    { id: 'gp-may-silver', name: 'May Silver', description: 'Finish P2 in May GP', month: 5, position: 2, image: '/badges/gp-may-silver/image_0.png' },
    { id: 'gp-may-gold', name: 'May Champion', description: 'Win May GP', month: 5, position: 1, image: '/badges/gp-may-gold/image_0.png' },
    { id: 'gp-jun-participant', name: 'June Racer', description: 'Compete in June GP', month: 6, image: '/badges/gp-jun-participant/image_0.png' },
    { id: 'gp-jun-bronze', name: 'June Bronze', description: 'Finish P3 in June GP', month: 6, position: 3, image: '/badges/gp-jun-bronze/image_0.png' },
    { id: 'gp-jun-silver', name: 'June Silver', description: 'Finish P2 in June GP', month: 6, position: 2, image: '/badges/gp-jun-silver/image_0.png' },
    { id: 'gp-jun-gold', name: 'June Champion', description: 'Win June GP', month: 6, position: 1, image: '/badges/gp-jun-gold/image_0.png' },
    { id: 'gp-jul-participant', name: 'July Racer', description: 'Compete in July GP', month: 7, image: '/badges/gp-jul-participant/image_0.png' },
    { id: 'gp-jul-bronze', name: 'July Bronze', description: 'Finish P3 in July GP', month: 7, position: 3, image: '/badges/gp-jul-bronze/image_0.png' },
    { id: 'gp-jul-silver', name: 'July Silver', description: 'Finish P2 in July GP', month: 7, position: 2, image: '/badges/gp-jul-silver/image_0.png' },
    { id: 'gp-jul-gold', name: 'July Champion', description: 'Win July GP', month: 7, position: 1, image: '/badges/gp-jul-gold/image_0.png' },
    { id: 'gp-aug-participant', name: 'August Racer', description: 'Compete in August GP', month: 8, image: '/badges/gp-aug-participant/image_0.png' },
    { id: 'gp-aug-bronze', name: 'August Bronze', description: 'Finish P3 in August GP', month: 8, position: 3, image: '/badges/gp-aug-bronze/image_0.png' },
    { id: 'gp-aug-silver', name: 'August Silver', description: 'Finish P2 in August GP', month: 8, position: 2, image: '/badges/gp-aug-silver/image_0.png' },
    { id: 'gp-aug-gold', name: 'August Champion', description: 'Win August GP', month: 8, position: 1, image: '/badges/gp-aug-gold/image_0.png' },
    { id: 'gp-sep-participant', name: 'September Racer', description: 'Compete in September GP', month: 9, image: '/badges/gp-sep-participant/image_0.png' },
    { id: 'gp-sep-bronze', name: 'September Bronze', description: 'Finish P3 in September GP', month: 9, position: 3, image: '/badges/gp-sep-bronze/image_0.png' },
    { id: 'gp-sep-silver', name: 'September Silver', description: 'Finish P2 in September GP', month: 9, position: 2, image: '/badges/gp-sep-silver/image_0.png' },
    { id: 'gp-sep-gold', name: 'September Champion', description: 'Win September GP', month: 9, position: 1, image: '/badges/gp-sep-gold/image_0.png' },
    { id: 'gp-oct-participant', name: 'October Racer', description: 'Compete in October GP', month: 10, image: '/badges/gp-oct-participant/image_0.png' },
    { id: 'gp-oct-bronze', name: 'October Bronze', description: 'Finish P3 in October GP', month: 10, position: 3, image: '/badges/gp-oct-bronze/image_0.png' },
    { id: 'gp-oct-silver', name: 'October Silver', description: 'Finish P2 in October GP', month: 10, position: 2, image: '/badges/gp-oct-silver/image_0.png' },
    { id: 'gp-oct-gold', name: 'October Champion', description: 'Win October GP', month: 10, position: 1, image: '/badges/gp-oct-gold/image_0.png' },
    { id: 'gp-nov-participant', name: 'November Racer', description: 'Compete in November GP', month: 11, image: '/badges/gp-nov-participant/image_0.png' },
    { id: 'gp-nov-bronze', name: 'November Bronze', description: 'Finish P3 in November GP', month: 11, position: 3, image: '/badges/gp-nov-bronze/image_0.png' },
    { id: 'gp-nov-silver', name: 'November Silver', description: 'Finish P2 in November GP', month: 11, position: 2, image: '/badges/gp-nov-silver/image_0.png' },
    { id: 'gp-nov-gold', name: 'November Champion', description: 'Win November GP', month: 11, position: 1, image: '/badges/gp-nov-gold/image_0.png' },
    { id: 'gp-dec-participant', name: 'December Racer', description: 'Compete in December GP', month: 12, image: '/badges/gp-dec-participant/image_0.png' },
    { id: 'gp-dec-bronze', name: 'December Bronze', description: 'Finish P3 in December GP', month: 12, position: 3, image: '/badges/gp-dec-bronze/image_0.png' },
    { id: 'gp-dec-silver', name: 'December Silver', description: 'Finish P2 in December GP', month: 12, position: 2, image: '/badges/gp-dec-silver/image_0.png' },
    { id: 'gp-dec-gold', name: 'December Champion', description: 'Win December GP', month: 12, position: 1, image: '/badges/gp-dec-gold/image_0.png' },
  ],
  // Seasonal Championship badges
  seasonal: [
    { id: 'season-winter-participant', name: 'Winter Racer', description: 'Compete in Winter Season', season: 1, image: '/badges/season-winter-participant/image_0.png' },
    { id: 'season-winter-bronze', name: 'Winter Bronze', description: 'Finish P3 in Winter Season', season: 1, position: 3, image: '/badges/season-winter-bronze/image_0.png' },
    { id: 'season-winter-silver', name: 'Winter Silver', description: 'Finish P2 in Winter Season', season: 1, position: 2, image: '/badges/season-winter-silver/image_0.png' },
    { id: 'season-winter-gold', name: 'Winter Champion', description: 'Win Winter Season', season: 1, position: 1, image: '/badges/season-winter-gold/image_0.png' },
    { id: 'season-spring-participant', name: 'Spring Racer', description: 'Compete in Spring Season', season: 2, image: '/badges/season-spring-participant/image_0.png' },
    { id: 'season-spring-bronze', name: 'Spring Bronze', description: 'Finish P3 in Spring Season', season: 2, position: 3, image: '/badges/season-spring-bronze/image_0.png' },
    { id: 'season-spring-silver', name: 'Spring Silver', description: 'Finish P2 in Spring Season', season: 2, position: 2, image: '/badges/season-spring-silver/image_0.png' },
    { id: 'season-spring-gold', name: 'Spring Champion', description: 'Win Spring Season', season: 2, position: 1, image: '/badges/season-spring-gold/image_0.png' },
    { id: 'season-summer-participant', name: 'Summer Racer', description: 'Compete in Summer Season', season: 3, image: '/badges/season-summer-participant/image_0.png' },
    { id: 'season-summer-bronze', name: 'Summer Bronze', description: 'Finish P3 in Summer Season', season: 3, position: 3, image: '/badges/season-summer-bronze/image_0.png' },
    { id: 'season-summer-silver', name: 'Summer Silver', description: 'Finish P2 in Summer Season', season: 3, position: 2, image: '/badges/season-summer-silver/image_0.png' },
    { id: 'season-summer-gold', name: 'Summer Champion', description: 'Win Summer Season', season: 3, position: 1, image: '/badges/season-summer-gold/image_0.png' },
    { id: 'season-fall-participant', name: 'Fall Racer', description: 'Compete in Fall Season', season: 4, image: '/badges/season-fall-participant/image_0.png' },
    { id: 'season-fall-bronze', name: 'Fall Bronze', description: 'Finish P3 in Fall Season', season: 4, position: 3, image: '/badges/season-fall-bronze/image_0.png' },
    { id: 'season-fall-silver', name: 'Fall Silver', description: 'Finish P2 in Fall Season', season: 4, position: 2, image: '/badges/season-fall-silver/image_0.png' },
    { id: 'season-fall-gold', name: 'Fall Champion', description: 'Win Fall Season', season: 4, position: 1, image: '/badges/season-fall-gold/image_0.png' },
  ],
  // Annual Championship badges
  championship: [
    { id: 'champ-participant', name: 'Championship Racer', description: 'Compete in Annual Championship', image: '/badges/champ-participant/image_0.png' },
    { id: 'champ-bronze', name: 'Championship Bronze', description: 'Finish P3 in Annual Championship', position: 3, image: '/badges/champ-bronze/image_0.png' },
    { id: 'champ-silver', name: 'Championship Silver', description: 'Finish P2 in Annual Championship', position: 2, image: '/badges/champ-silver/image_0.png' },
    { id: 'champ-gold', name: 'World Champion', description: 'Win Annual Championship', position: 1, image: '/badges/champ-gold/image_0.png' },
  ],
  // Streak badges
  streaks: [
    { id: 'streak-03-warming', name: 'Warming Up', description: '3-day streak', requirement: 3, image: '/badges/streak-03-warming/image_0.png' },
    { id: 'streak-07-on-fire', name: 'On Fire', description: '7-day streak', requirement: 7, image: '/badges/streak-07-on-fire/image_0.png' },
    { id: 'streak-14-volcanic', name: 'Volcanic', description: '14-day streak', requirement: 14, image: '/badges/streak-14-volcanic/image_0.png' },
    { id: 'streak-30-meteor', name: 'Meteor', description: '30-day streak', requirement: 30, image: '/badges/streak-30-meteor/image_0.png' },
    { id: 'streak-60-supernova', name: 'Supernova', description: '60-day streak', requirement: 60, image: '/badges/streak-60-supernova/image_0.png' },
    { id: 'streak-90-cosmic', name: 'Cosmic', description: '90-day streak', requirement: 90, image: '/badges/streak-90-cosmic/image_0.png' },
    { id: 'streak-180-galactic', name: 'Galactic', description: '180-day streak', requirement: 180, image: '/badges/streak-180-galactic/image_0.png' },
    { id: 'streak-365-eternal', name: 'Eternal Flame', description: '365-day streak', requirement: 365, image: '/badges/streak-365-eternal/image_0.png' },
  ],
  // Grid Points badges
  gridPoints: [
    { id: 'gp-100-first-lap', name: 'First Lap', description: 'Earn 100 GP', requirement: 100, image: '/badges/gp-100-first-lap/image_0.png' },
    { id: 'gp-500-qualifier', name: 'Qualifier', description: 'Earn 500 GP', requirement: 500, image: '/badges/gp-500-qualifier/image_0.png' },
    { id: 'gp-1000-competitor', name: 'Competitor', description: 'Earn 1,000 GP', requirement: 1000, image: '/badges/gp-1000-competitor/image_0.png' },
    { id: 'gp-2500-veteran', name: 'Veteran', description: 'Earn 2,500 GP', requirement: 2500, image: '/badges/gp-2500-veteran/image_0.png' },
    { id: 'gp-5000-elite', name: 'Elite', description: 'Earn 5,000 GP', requirement: 5000, image: '/badges/gp-5000-elite/image_0.png' },
    { id: 'gp-10000-diamond', name: 'Diamond Driver', description: 'Earn 10,000 GP', requirement: 10000, image: '/badges/gp-10000-diamond/image_0.png' },
    { id: 'gp-25000-master', name: 'Grid Master', description: 'Earn 25,000 GP', requirement: 25000, image: '/badges/gp-25000-master/image_0.png' },
    { id: 'gp-50000-king', name: 'Grid Point King', description: 'Earn 50,000 GP', requirement: 50000, image: '/badges/gp-50000-king/image_0.png' },
  ],
  // Special badges
  special: [
    { id: 'special-early-bird', name: 'Early Bird', description: 'Complete a task before 7 AM', image: '/badges/special-early-bird/image_0.png' },
    { id: 'special-night-owl', name: 'Night Owl', description: 'Complete a task after midnight', image: '/badges/special-night-owl/image_0.png' },
    { id: 'special-backlog-buster', name: 'Backlog Buster', description: 'Clear 10 overdue tasks in one day', image: '/badges/special-backlog-buster/image_0.png' },
    { id: 'special-speed-demon', name: 'Speed Demon', description: 'Complete 10 tasks in one day', image: '/badges/special-speed-demon/image_0.png' },
    { id: 'special-zen-master', name: 'Zen Master', description: 'Complete a week with no overdue tasks', image: '/badges/special-zen-master/image_0.png' },
    { id: 'special-clutch-player', name: 'Clutch Player', description: 'Win race from P10+ starting position', image: '/badges/special-clutch-player/image_0.png' },
  ],
};

// Badge card component
const BadgeCard = ({ badge, earned, showDetails = false }: { badge: typeof ALL_BADGES.monthly[0]; earned: boolean; showDetails?: boolean }) => (
  <div
    className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
      earned ? 'opacity-100' : 'opacity-40 grayscale'
    }`}
  >
    <div className={`aspect-square bg-gradient-to-br ${earned ? 'from-gray-800 to-gray-900' : 'from-gray-900 to-black'} p-2`}>
      <img
        src={badge.image}
        alt={badge.name}
        className="w-full h-full object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/badges/placeholder.png';
        }}
      />
    </div>
    {showDetails && (
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
        <div className="font-bold text-white text-sm">{badge.name}</div>
        <div className="text-gray-400 text-xs mt-1">{badge.description}</div>
        {earned && <div className="text-green-400 text-xs mt-2">✓ Earned</div>}
      </div>
    )}
  </div>
);

interface ProfileViewProps {
  user: User;
  onClose: () => void;
}

export const ProfileView = ({ user, onClose }: ProfileViewProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'badges'>('profile');
  const [badgeCategory, setBadgeCategory] = useState<keyof typeof ALL_BADGES>('monthly');
  const { data: workItems = [] } = useAllWorkItems();

  // Calculate stats
  const completedTasks = workItems.filter(item => item.status === 'checkered').length;
  const createdTasks = workItems.length; // Total tasks created
  const startedTasks = workItems.filter(item => 
    item.status === 'on_track' || item.status === 'pits' || item.status === 'checkered'
  ).length; // Tasks that have been started (in progress, pits, or completed)
  const totalGridPoints = workItems
    .filter(item => item.status === 'checkered')
    .reduce((sum, item) => sum + (item.grid_points || 0), 0);

  // Calculate streak (consecutive days with completed tasks)
  const calculateStreak = () => {
    const completedItems = workItems.filter(item => item.status === 'checkered');
    if (completedItems.length === 0) return { current: 0, best: 0 };

    // Get all unique dates with completions (normalize to start of day)
    const completionDates = new Set<string>();
    completedItems.forEach(item => {
      const date = new Date(item.updated_at);
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      completionDates.add(dateStr);
    });

    // Sort dates
    const sortedDates = Array.from(completionDates).sort();
    
    // Calculate current streak (from today/yesterday backwards)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

    let currentStreak = 0;
    let checkDate = completionDates.has(todayStr) ? today : 
                    completionDates.has(yesterdayStr) ? yesterday : null;
    
    if (checkDate) {
      while (true) {
        const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
        if (completionDates.has(checkStr)) {
          currentStreak++;
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate best streak ever
    let bestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const [prevY, prevM, prevD] = sortedDates[i - 1].split('-').map(Number);
      const [currY, currM, currD] = sortedDates[i].split('-').map(Number);
      const prevDate = new Date(prevY, prevM, prevD);
      const currDate = new Date(currY, currM, currD);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

    return { current: currentStreak, best: bestStreak };
  };

  const { current: _currentStreak, best: bestStreak } = calculateStreak();

  // Determine earned badges (simplified logic)
  const earnedBadges = new Set<string>();
  
  // Task completion badges
  ALL_BADGES.tasks.forEach(badge => {
    if (completedTasks >= (badge.requirement || 0)) {
      earnedBadges.add(badge.id);
    }
  });

  // Task creation badges
  ALL_BADGES.created.forEach(badge => {
    if (createdTasks >= (badge.requirement || 0)) {
      earnedBadges.add(badge.id);
    }
  });

  // Task started badges
  ALL_BADGES.started.forEach(badge => {
    if (startedTasks >= (badge.requirement || 0)) {
      earnedBadges.add(badge.id);
    }
  });

  // GP badges
  ALL_BADGES.gridPoints.forEach(badge => {
    if (totalGridPoints >= (badge.requirement || 0)) {
      earnedBadges.add(badge.id);
    }
  });

  // Streak badges (based on best streak ever)
  ALL_BADGES.streaks.forEach(badge => {
    if (bestStreak >= (badge.requirement || 0)) {
      earnedBadges.add(badge.id);
    }
  });

  // Monthly badges (check current month)
  const currentMonth = new Date().getMonth();
  const monthBadges = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if (completedTasks > 0) {
    earnedBadges.add(`${monthBadges[currentMonth]}-${ALL_BADGES.monthly[currentMonth].id.split('-').slice(1).join('-')}`);
  }

  const totalBadges = Object.values(ALL_BADGES).flat().length;
  const earnedCount = earnedBadges.size;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 border-b border-gray-800">
        <div className="checkered-pattern-dark h-2" />
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">🏎️ DRIVER PROFILE</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Badges ({earnedCount}/{totalBadges})
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border-2 border-purple-500/30 overflow-hidden">
              {/* Hero with player car */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src="/racers-v2/player-car.png"
                    alt="Driver and vehicle"
                    className="w-full h-full object-contain object-center"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                </div>
              </div>

              {/* Name bar */}
              <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 text-xs font-black rounded uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    PLAYER
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-white">{user.name || 'Racer'}</h2>
                    <p className="text-sm italic text-purple-400">"The Competitor"</p>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/50">
                  <img src="/avatars/player.jpg" alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <div className="text-3xl font-black text-green-400">{completedTasks}</div>
                  <div className="text-xs text-gray-500 uppercase">Tasks Done</div>
                </div>
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <div className="text-3xl font-black text-purple-400">{totalGridPoints}</div>
                  <div className="text-xs text-gray-500 uppercase">Grid Points</div>
                </div>
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <div className="text-3xl font-black text-amber-400">{earnedCount}</div>
                  <div className="text-xs text-gray-500 uppercase">Badges</div>
                </div>
                <div className="text-center p-4 bg-black/30 rounded-lg">
                  <div className="text-3xl font-black text-blue-400">P9</div>
                  <div className="text-xs text-gray-500 uppercase">Best Finish</div>
                </div>
              </div>
            </div>

            {/* Earned Badges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">🏆 Earned Badges ({earnedCount})</h3>
                <button
                  onClick={() => setActiveTab('badges')}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  See all badges →
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Object.values(ALL_BADGES)
                  .flat()
                  .filter(badge => earnedBadges.has(badge.id))
                  .map(badge => (
                    <BadgeCard key={badge.id} badge={badge} earned={true} showDetails />
                  ))}
                {earnedCount === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    Complete tasks to earn your first badge!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* All Badges View */
          <div className="space-y-6">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries({
                monthly: '🗓️ Monthly',
                tasks: '✅ Completed',
                created: '➕ Created',
                started: '🚀 Started',
                unblocked: '💪 Unblocked',
                races: '🏁 Weekly Races',
                monthlyGp: '🏆 Monthly GP',
                seasonal: '🌟 Seasonal',
                championship: '👑 Championship',
                streaks: '🔥 Streaks',
                gridPoints: '⚡ Grid Points',
                special: '🎯 Special',
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setBadgeCategory(key as keyof typeof ALL_BADGES)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    badgeCategory === key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Badge grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {ALL_BADGES[badgeCategory].map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={earnedBadges.has(badge.id)}
                  showDetails
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Checkered footer */}
      <div className="checkered-pattern-dark h-3 mt-8" />
    </div>
  );
};

export default ProfileView;

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAllWorkItems } from '../api/queries';

// Badge definition type
interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  requirement?: number;
}

// All badges - must match ProfileView.tsx
const ALL_BADGES: Record<string, Badge[]> = {
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
};

const STORAGE_KEY = 'paddock_shown_badges';

// Get badges that have already been shown (animation played)
const getShownBadges = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Mark a badge as shown
const markBadgeAsShown = (badgeId: string) => {
  try {
    const shown = getShownBadges();
    shown.add(badgeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]));
  } catch {
    // Ignore storage errors
  }
};

export const useBadgeUnlock = () => {
  const { data: workItems = [], isLoading } = useAllWorkItems();
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [pendingBadges, setPendingBadges] = useState<Badge[]>([]);
  const hasInitialized = useRef(false);

  // Calculate current stats
  const completedTasks = workItems.filter(item => item.status === 'checkered').length;
  const createdTasks = workItems.length;
  const startedTasks = workItems.filter(item => 
    item.status === 'on_track' || item.status === 'pits' || item.status === 'checkered'
  ).length;
  const totalGridPoints = workItems
    .filter(item => item.status === 'checkered')
    .reduce((sum, item) => sum + (item.grid_points || 0), 0);

  // Calculate currently earned badges
  const calculateEarnedBadges = useCallback(() => {
    const earned = new Set<string>();

    ALL_BADGES.tasks.forEach(badge => {
      if (completedTasks >= (badge.requirement || 0)) {
        earned.add(badge.id);
      }
    });

    ALL_BADGES.created.forEach(badge => {
      if (createdTasks >= (badge.requirement || 0)) {
        earned.add(badge.id);
      }
    });

    ALL_BADGES.started.forEach(badge => {
      if (startedTasks >= (badge.requirement || 0)) {
        earned.add(badge.id);
      }
    });

    ALL_BADGES.gridPoints.forEach(badge => {
      if (totalGridPoints >= (badge.requirement || 0)) {
        earned.add(badge.id);
      }
    });

    return earned;
  }, [completedTasks, createdTasks, startedTasks, totalGridPoints]);

  // Check for newly unlocked badges (only after data loads)
  useEffect(() => {
    // Don't run until data is loaded
    if (isLoading || workItems.length === 0) return;

    // Only run initialization once per session
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const currentBadges = calculateEarnedBadges();
    const shownBadges = getShownBadges();

    // Find badges that are earned but haven't been shown yet
    const newBadges: Badge[] = [];
    currentBadges.forEach(badgeId => {
      if (!shownBadges.has(badgeId)) {
        // Find the badge details
        for (const category of Object.values(ALL_BADGES)) {
          const badge = category.find(b => b.id === badgeId);
          if (badge) {
            newBadges.push(badge);
            break;
          }
        }
      }
    });

    if (newBadges.length > 0) {
      setPendingBadges(newBadges);
    }
  }, [isLoading, workItems.length, calculateEarnedBadges]);

  // Show pending badges one at a time
  useEffect(() => {
    if (pendingBadges.length > 0 && !unlockedBadge) {
      const nextBadge = pendingBadges[0];
      setUnlockedBadge(nextBadge);
      markBadgeAsShown(nextBadge.id);
      setPendingBadges(prev => prev.slice(1));
    }
  }, [pendingBadges, unlockedBadge]);

  // Also check for new badges when stats change (after initial load)
  const prevStatsRef = useRef({ completedTasks: 0, createdTasks: 0, startedTasks: 0, totalGridPoints: 0 });
  
  useEffect(() => {
    // Skip if not initialized yet
    if (!hasInitialized.current) return;
    
    const prevStats = prevStatsRef.current;
    const statsChanged = 
      completedTasks !== prevStats.completedTasks ||
      createdTasks !== prevStats.createdTasks ||
      startedTasks !== prevStats.startedTasks ||
      totalGridPoints !== prevStats.totalGridPoints;

    if (statsChanged) {
      prevStatsRef.current = { completedTasks, createdTasks, startedTasks, totalGridPoints };
      
      const currentBadges = calculateEarnedBadges();
      const shownBadges = getShownBadges();

      // Find newly earned badges
      const newBadges: Badge[] = [];
      currentBadges.forEach(badgeId => {
        if (!shownBadges.has(badgeId)) {
          for (const category of Object.values(ALL_BADGES)) {
            const badge = category.find(b => b.id === badgeId);
            if (badge) {
              newBadges.push(badge);
              break;
            }
          }
        }
      });

      if (newBadges.length > 0) {
        setPendingBadges(prev => [...prev, ...newBadges]);
      }
    }
  }, [completedTasks, createdTasks, startedTasks, totalGridPoints, calculateEarnedBadges]);

  const closeBadgeModal = useCallback(() => {
    setUnlockedBadge(null);
  }, []);

  return {
    unlockedBadge,
    closeBadgeModal,
  };
};

export default useBadgeUnlock;

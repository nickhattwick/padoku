import { create } from 'zustand';
import type { TimeLog } from '@paddock/shared';

interface TimerStore {
  // Active timer state
  activeTimer: TimeLog | null;
  setActiveTimer: (timer: TimeLog | null) => void;

  // Elapsed time (computed from start_time, updated every second)
  elapsedMs: number;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  activeTimer: null,
  setActiveTimer: (timer) => set({ activeTimer: timer }),

  elapsedMs: 0,
  tick: () => {
    const { activeTimer } = get();
    if (!activeTimer) {
      set({ elapsedMs: 0 });
      return;
    }

    const elapsed = Date.now() - activeTimer.start_time;
    set({ elapsedMs: elapsed });
  },
}));

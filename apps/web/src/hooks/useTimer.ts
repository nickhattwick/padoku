import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeLogsApi } from '../api/timeLogs';
import { useTimerStore } from '../stores/timerStore';

/**
 * Format milliseconds to HH:MM:SS
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const s = seconds % 60;
  const m = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Hook to manage timer state and actions
 */
export const useTimer = () => {
  const queryClient = useQueryClient();
  const { activeTimer, setActiveTimer, elapsedMs, tick } = useTimerStore();

  // Load active timer on mount
  const { data: activeTimerFromServer } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: timeLogsApi.getActive,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update local state when server data changes
  useEffect(() => {
    if (activeTimerFromServer) {
      setActiveTimer(activeTimerFromServer);
    } else if (activeTimerFromServer === null) {
      setActiveTimer(null);
    }
  }, [activeTimerFromServer, setActiveTimer]);

  // Tick every second to update elapsed time
  useEffect(() => {
    if (!activeTimer) return;

    // Initial tick
    tick();

    // Set up interval
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, tick]);

  // Start timer mutation
  const startMutation = useMutation({
    mutationFn: (workItemId: string) => timeLogsApi.start(workItemId),
    onSuccess: (timer) => {
      setActiveTimer(timer);
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
    },
  });

  // Stop timer mutation
  const stopMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      timeLogsApi.stop(id, notes),
    onSuccess: () => {
      setActiveTimer(null);
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
    },
  });

  return {
    activeTimer,
    elapsedMs,
    formattedTime: formatDuration(elapsedMs),
    isActive: !!activeTimer,
    startTimer: (workItemId: string) => startMutation.mutate(workItemId),
    stopTimer: (notes?: string) => {
      if (activeTimer) {
        stopMutation.mutate({ id: activeTimer.id, notes });
      }
    },
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
};

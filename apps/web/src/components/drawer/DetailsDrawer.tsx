import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkItemStore } from '../../stores/workItemStore';
import { useWorkItem, useUpdateWorkItem, useDeleteWorkItem, useWorkItems, useGenerateInstances } from '../../api/queries';
import { STATUS_NAMES, parseRecurrenceRule, stringifyRecurrenceRule, GRID_POINTS_SCALE } from '@paddock/shared';
import type { WorkItemStatus, RecurrenceRule } from '@paddock/shared';
import { RecurrenceRulePicker } from '../recurring/RecurrenceRulePicker';
import { GoalProgressBadge } from '../goals/GoalProgressBadge';
import { CommentsSection } from '../comments/CommentsSection';
import { ShareDialog } from '../teams/ShareDialog';
import { AssigneeDropdown } from '../teams/AssigneeDropdown';
import { useTeams } from '../../hooks/useTeams';
import { timeLogsApi } from '../../api/timeLogs';
import { formatDuration } from '../../hooks/useTimer';
import type { TimeLog } from '@paddock/shared';

/**
 * Inline "Add Time" form + time log list for the drawer
 */
const TimeLoggedSection = ({ timeLogs, workItemId }: { timeLogs: TimeLog[]; workItemId: string }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [logDate, setLogDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const createManualMutation = useMutation({
    mutationFn: timeLogsApi.createManual,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['timeLogs', workItemId] });
      setShowForm(false);
      setLogDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setNotes('');
    },
  });

  const handleSaveManual = () => {
    if (!logDate || !startTime || !endTime || !workItemId) return;
    const start = new Date(`${logDate}T${startTime}`).getTime();
    let end = new Date(`${logDate}T${endTime}`).getTime();
    if (end <= start) {
      const nextDay = new Date(logDate);
      nextDay.setDate(nextDay.getDate() + 1);
      end = new Date(`${nextDay.toISOString().split('T')[0]}T${endTime}`).getTime();
    }
    createManualMutation.mutate({
      work_item_id: workItemId,
      start_time: start,
      end_time: end,
      notes: notes.trim() || null,
    });
  };

  return (
    <div className="pt-4 border-t border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          ⏱️ Time Logged
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all bg-purple-600/30 text-purple-300 border border-purple-700/50 hover:bg-purple-600/50"
        >
          {showForm ? 'Cancel' : '+ Add Time'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-3 mb-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What were you working on?"
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-600"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveManual}
              disabled={createManualMutation.isPending || !logDate || !startTime || !endTime}
              className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {createManualMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
          {createManualMutation.isError && (
            <p className="text-xs text-red-400">Failed to save time entry. Please try again.</p>
          )}
        </div>
      )}

      {timeLogs.length > 0 && (() => {
        const totalMs = timeLogs.reduce((sum, log) => {
          if (log.end_time) return sum + (log.end_time - log.start_time);
          return sum + (Date.now() - log.start_time);
        }, 0);
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        return (
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-700/40 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Time</span>
              <span className="text-xl font-black text-purple-300 font-mono">
                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {timeLogs.length} session{timeLogs.length !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })()}

      {timeLogs.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {timeLogs
            .slice()
            .sort((a, b) => b.start_time - a.start_time)
            .map((log) => {
              const duration = log.end_time
                ? log.end_time - log.start_time
                : Date.now() - log.start_time;
              const isActive = !log.end_time;
              return (
                <div
                  key={log.id}
                  className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                    isActive
                      ? 'bg-green-900/30 border border-green-700/40'
                      : 'bg-gray-800/60 border border-gray-700/40'
                  }`}
                >
                  <div className="text-gray-400">
                    {new Date(log.start_time).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    {new Date(log.start_time).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isActive && (
                      <span className="ml-2 text-green-400 animate-pulse">● live</span>
                    )}
                  </div>
                  <span className={`font-mono font-bold ${isActive ? 'text-green-300' : 'text-gray-300'}`}>
                    {formatDuration(duration)}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {timeLogs.length === 0 && !showForm && (
        <p className="text-xs text-gray-500">No time logged yet. Click "+ Add Time" to backfill.</p>
      )}
    </div>
  );
};

export const DetailsDrawer = () => {
  const { isDrawerOpen, selectedItemId, closeDrawer, setCurrentParent } = useWorkItemStore();
  const { data: item, isLoading } = useWorkItem(selectedItemId || '');
  const { data: children = [] } = useWorkItems(selectedItemId || undefined);
  const updateMutation = useUpdateWorkItem();
  const deleteMutation = useDeleteWorkItem();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkItemStatus>('garage');
  const [dueDate, setDueDate] = useState('');
  const [gridPoints, setGridPoints] = useState<number | null>(null);
  const [isGoal, setIsGoal] = useState(false);
  const [goalEndCondition, setGoalEndCondition] = useState('');
  const [goalTarget, setGoalTarget] = useState<number | null>(null);
  const [isRecurringTemplate, setIsRecurringTemplate] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<'task' | 'event'>('task');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');

  const { assignWorkItem } = useTeams();
  const generateInstancesMutation = useGenerateInstances();

  // Fetch time logs for this work item
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timeLogs', selectedItemId],
    queryFn: () => timeLogsApi.getAll(selectedItemId || undefined),
    enabled: !!selectedItemId,
  });

  // Track whether initial load has completed (to avoid auto-saving on mount)
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Update local state when item loads
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setStatus(item.status);
      setDueDate(item.due_at ? new Date(item.due_at).toISOString().split('T')[0] : '');
      setGridPoints(item.grid_points);
      setIsGoal(item.is_goal);
      setGoalEndCondition(item.goal_end_condition || '');
      setGoalTarget(item.goal_target);
      setIsRecurringTemplate(item.is_recurring_template);
      setRecurrenceRule(parseRecurrenceRule(item.recurrence_rule));
      setAssigneeId(item.assignee_id || null);
      setItemType(((item as any).item_type as 'task' | 'event') || 'task');
      // Parse scheduled times
      const sStart = (item as any).scheduled_start;
      const sEnd = (item as any).scheduled_end;
      if (sStart) {
        const startDate = new Date(sStart);
        setScheduledDate(startDate.toISOString().split('T')[0]);
        setScheduledStartTime(startDate.toTimeString().slice(0, 5));
      } else {
        setScheduledDate('');
        setScheduledStartTime('');
      }
      if (sEnd) {
        setScheduledEndTime(new Date(sEnd).toTimeString().slice(0, 5));
      } else {
        setScheduledEndTime('');
      }
      // Mark initial load complete after a tick so the auto-save effect doesn't fire
      setTimeout(() => setInitialLoaded(true), 0);
    }
  }, [item]);

  // Reset initialLoaded when item changes
  useEffect(() => {
    setInitialLoaded(false);
  }, [selectedItemId]);

  const handleSaveRef = useRef<() => void>(() => {});

  // Auto-save when these fields change (fixes stale-state bug with synchronous handleSave)
  useEffect(() => {
    if (!initialLoaded || !selectedItemId || !title.trim()) return;
    const timeout = setTimeout(() => {
      handleSaveRef.current();
    }, 50);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurrenceRule, isRecurringTemplate, isGoal, status, gridPoints, itemType, initialLoaded]);

  const handleSave = async () => {
    if (!selectedItemId || !title.trim()) return;

    try {
      // Build scheduled timestamps from date + time inputs
      let scheduled_start: number | null = null;
      let scheduled_end: number | null = null;
      if (itemType === 'event' && scheduledDate && scheduledStartTime) {
        scheduled_start = new Date(`${scheduledDate}T${scheduledStartTime}`).getTime();
        if (scheduledEndTime) {
          scheduled_end = new Date(`${scheduledDate}T${scheduledEndTime}`).getTime();
          // Handle end time crossing midnight (next day)
          if (scheduled_end <= scheduled_start) {
            const nextDay = new Date(scheduledDate);
            nextDay.setDate(nextDay.getDate() + 1);
            scheduled_end = new Date(`${nextDay.toISOString().split('T')[0]}T${scheduledEndTime}`).getTime();
          }
        }
      }

      await updateMutation.mutateAsync({
        id: selectedItemId,
        data: {
          title: title.trim(),
          description: description.trim() || null,
          status,
          due_at: dueDate ? new Date(dueDate).getTime() : null,
          grid_points: gridPoints,
          is_goal: isGoal,
          goal_end_condition: isGoal && goalEndCondition.trim() ? goalEndCondition.trim() : null,
          goal_target: isGoal && goalTarget ? goalTarget : null,
          is_recurring_template: isRecurringTemplate,
          recurrence_rule: isRecurringTemplate && recurrenceRule
            ? stringifyRecurrenceRule(recurrenceRule)
            : null,
          item_type: itemType,
          scheduled_start,
          scheduled_end,
        } as any,
      });
    } catch (error) {
      console.error('Failed to update work item:', error);
    }
  };
  handleSaveRef.current = handleSave;

  const handleGenerateInstances = async () => {
    if (!selectedItemId || !recurrenceRule) return;

    const startDate = new Date();
    let endDateTs: number;
    if (recurrenceRule.endDate) {
      endDateTs = recurrenceRule.endDate;
    } else {
      // Default: 30 days ahead
      const d = new Date();
      d.setDate(d.getDate() + 30);
      endDateTs = d.getTime();
    }

    try {
      await generateInstancesMutation.mutateAsync({
        templateId: selectedItemId,
        startDate: startDate.getTime(),
        endDate: endDateTs,
      });
      const endLabel = new Date(endDateTs).toLocaleDateString();
      alert(`Successfully generated instances until ${endLabel}!`);
    } catch (error) {
      console.error('Failed to generate instances:', error);
      alert('Failed to generate instances. Check the console for details.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItemId) return;
    if (!confirm('Delete this work item? This cannot be undone.')) return;

    try {
      await deleteMutation.mutateAsync(selectedItemId);
      closeDrawer();
    } catch (error) {
      console.error('Failed to delete work item:', error);
    }
  };

  const handleClose = () => {
    closeDrawer();
  };

  const handleViewChildren = () => {
    if (!selectedItemId) return;
    setCurrentParent(selectedItemId);
    closeDrawer();
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">📋</span> Work Item Details
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-3xl mb-2 animate-pulse">🏎️</div>
              Loading...
            </div>
          ) : !item ? (
            <div className="text-center text-red-400 mt-8">Item not found</div>
          ) : (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="drawer-title" className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  id="drawer-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="drawer-description" className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  id="drawer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="drawer-status" className="block text-sm font-medium text-gray-400 mb-1">
                  Status
                </label>
                <select
                  id="drawer-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as WorkItemStatus);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="garage">🔧 {STATUS_NAMES.garage}</option>
                  <option value="on_track">🏎️ {STATUS_NAMES.on_track}</option>
                  <option value="pits">⏸️ {STATUS_NAMES.pits}</option>
                  <option value="checkered">🏁 {STATUS_NAMES.checkered}</option>
                </select>
              </div>

              {/* Item Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setItemType('task')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      itemType === 'task'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    📋 Task
                  </button>
                  <button
                    onClick={() => setItemType('event')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      itemType === 'event'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    📅 Event
                  </button>
                </div>
              </div>

              {/* Scheduled Time (Events only) */}
              {itemType === 'event' && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-medium text-emerald-400">
                    📅 Scheduled Time
                  </label>
                  <div>
                    <label htmlFor="drawer-sched-date" className="block text-xs text-gray-500 mb-1">Date</label>
                    <input
                      id="drawer-sched-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      onBlur={handleSave}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="drawer-sched-start" className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        id="drawer-sched-start"
                        type="time"
                        value={scheduledStartTime}
                        onChange={(e) => setScheduledStartTime(e.target.value)}
                        onBlur={handleSave}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label htmlFor="drawer-sched-end" className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        id="drawer-sched-end"
                        type="time"
                        value={scheduledEndTime}
                        onChange={(e) => setScheduledEndTime(e.target.value)}
                        onBlur={handleSave}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  {scheduledDate && scheduledStartTime && scheduledEndTime && (
                    <p className="text-xs text-emerald-400/70">
                      Grid points will auto-calculate from duration
                    </p>
                  )}
                </div>
              )}

              {/* Due Date */}
              <div>
                <label htmlFor="drawer-due-date" className="block text-sm font-medium text-gray-400 mb-1">
                  Due Date
                </label>
                <input
                  id="drawer-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                  }}
                  onBlur={handleSave}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
                />
                {dueDate && (
                  <button
                    onClick={() => {
                      setDueDate('');
                      handleSave();
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 mt-1"
                  >
                    ✕ Clear due date
                  </button>
                )}
              </div>

              {/* Grid Points */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  🏁 Grid Points
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setGridPoints(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      gridPoints === null
                        ? 'bg-gray-700 text-white border border-gray-500'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    None
                  </button>
                  {GRID_POINTS_SCALE.map((points) => (
                    <button
                      key={points}
                      onClick={() => {
                        setGridPoints(points);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        gridPoints === points
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-purple-900/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/50'
                      }`}
                    >
                      {points}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Fibonacci scale — higher points = more effort
                </p>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  👤 Assignee
                </label>
                <AssigneeDropdown
                  workItemId={selectedItemId || ''}
                  currentAssigneeId={assigneeId}
                  onAssign={async (userId) => {
                    setAssigneeId(userId);
                    if (selectedItemId) {
                      await assignWorkItem(selectedItemId, userId);
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Assign to a team member
                </p>
              </div>

              {/* Goal Settings */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="drawer-is-goal"
                    checked={isGoal}
                    onChange={(e) => {
                      setIsGoal(e.target.checked);
                    }}
                    className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="drawer-is-goal" className="text-sm font-medium text-gray-300">
                    🎯 This is a Goal (finite, completes once)
                  </label>
                </div>

                {isGoal && (
                  <div className="mt-4 space-y-4">
                    {/* Goal Progress Display */}
                    {item && children.length > 0 && (
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <GoalProgressBadge goal={item} children={children} size="large" />
                      </div>
                    )}

                    {/* Goal End Condition */}
                    <div>
                      <label htmlFor="drawer-goal-condition" className="block text-sm text-gray-400 mb-1">
                        What's the end condition?
                      </label>
                      <input
                        id="drawer-goal-condition"
                        type="text"
                        value={goalEndCondition}
                        onChange={(e) => setGoalEndCondition(e.target.value)}
                        onBlur={handleSave}
                        placeholder="e.g., Get degree, Launch v1.0, Pass exam"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Goal Target */}
                    <div>
                      <label htmlFor="drawer-goal-target" className="block text-sm text-gray-400 mb-1">
                        Expected number of items (optional)
                      </label>
                      <input
                        id="drawer-goal-target"
                        type="number"
                        min="1"
                        value={goalTarget || ''}
                        onChange={(e) => setGoalTarget(e.target.value ? parseInt(e.target.value) : null)}
                        onBlur={handleSave}
                        placeholder="e.g., 10 courses"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for open-ended goals with unknown items
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recurring Template Settings */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="drawer-is-recurring"
                    checked={isRecurringTemplate}
                    onChange={(e) => {
                      setIsRecurringTemplate(e.target.checked);
                    }}
                    className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="drawer-is-recurring" className="text-sm font-medium text-gray-300">
                    🔄 This is a Recurring Template
                  </label>
                </div>

                {isRecurringTemplate && (
                  <>
                    <RecurrenceRulePicker
                      value={recurrenceRule}
                      onChange={(rule) => {
                        setRecurrenceRule(rule);
                      }}
                    />
                    <button
                      onClick={handleGenerateInstances}
                      disabled={!recurrenceRule || generateInstancesMutation.isPending}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold"
                    >
                      {generateInstancesMutation.isPending ? 'Generating...' : '⚡ Generate Instances'}
                    </button>
                  </>
                )}
              </div>

              {/* Children */}
              {children.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-300">
                      Children ({children.length})
                    </h3>
                    <button
                      onClick={handleViewChildren}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {children.slice(0, 5).map((child) => (
                      <div
                        key={child.id}
                        className="text-sm px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="font-medium text-white">{child.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {STATUS_NAMES[child.status]}
                        </div>
                      </div>
                    ))}
                    {children.length > 5 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{children.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Time Logged */}
              <TimeLoggedSection
                timeLogs={timeLogs}
                workItemId={selectedItemId || ''}
              />

              {/* Comments */}
              <CommentsSection workItemId={item.id} />

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-700">
                <div className="space-y-2 text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-400">Created:</span>{' '}
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Updated:</span>{' '}
                    {new Date(item.updated_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">ID:</span>{' '}
                    <code className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">{item.id}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-900 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-red-800"
            >
              {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete'}
            </button>
            <button
              onClick={() => setShowShareDialog(true)}
              className="px-4 py-2 text-cyan-400 hover:bg-cyan-900/30 rounded-lg transition-colors border border-transparent hover:border-cyan-800"
              title="Share to team"
            >
              🏎️ Share
            </button>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* Share Dialog */}
      {item && (
        <ShareDialog
          workItemId={item.id}
          workItemTitle={item.title}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </>
  );
};

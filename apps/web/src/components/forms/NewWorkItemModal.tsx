import { useState, useEffect } from 'react';
import { useCreateWorkItem } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';
import type { WorkItemStatus } from '@paddock/shared';
import { STATUS_NAMES } from '@paddock/shared';

interface NewWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: WorkItemStatus;
}

const GRID_POINT_OPTIONS = [1, 2, 3, 5, 8, 13, 21] as const;

export const NewWorkItemModal = ({ isOpen, onClose, defaultStatus = 'garage' }: NewWorkItemModalProps) => {
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkItemStatus>(defaultStatus);
  const [gridPoints, setGridPoints] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [isGoal, setIsGoal] = useState(false);
  const [isRecurringTemplate, setIsRecurringTemplate] = useState(false);
  const [itemType, setItemType] = useState<'task' | 'event'>('task');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const createMutation = useCreateWorkItem();

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('new-item-title');
      setTimeout(() => input?.focus(), 100);
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('garage');
    setGridPoints('');
    setDueDate('');
    setIsGoal(false);
    setIsRecurringTemplate(false);
    setItemType('task');
    setScheduledDate('');
    setScheduledStartTime('');
    setScheduledEndTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      // Build scheduled timestamps
      let scheduled_start: number | null = null;
      let scheduled_end: number | null = null;
      if (itemType === 'event' && scheduledDate && scheduledStartTime) {
        scheduled_start = new Date(`${scheduledDate}T${scheduledStartTime}`).getTime();
        if (scheduledEndTime) {
          scheduled_end = new Date(`${scheduledDate}T${scheduledEndTime}`).getTime();
          if (scheduled_end <= scheduled_start) {
            const nextDay = new Date(scheduledDate);
            nextDay.setDate(nextDay.getDate() + 1);
            scheduled_end = new Date(`${nextDay.toISOString().split('T')[0]}T${scheduledEndTime}`).getTime();
          }
        }
      }

      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        status,
        parent_id: currentParentId,
        due_at: dueDate ? new Date(`${dueDate}T00:00:00`).getTime() : null,
        grid_points: gridPoints ? Number(gridPoints) : null,
        is_goal: isGoal,
        goal_end_condition: null,
        goal_target: null,
        is_recurring_template: isRecurringTemplate,
        recurrence_rule: null,
        user_id: null,
        assignee_id: null,
        item_type: itemType,
        scheduled_start,
        scheduled_end,
      } as any);

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create work item:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700 mx-4">
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">+</span> New Work Item
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="new-item-title" className="block text-sm font-medium text-gray-400 mb-1">
              Title *
            </label>
            <input
              id="new-item-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  handleSubmit(e);
                }
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkItemStatus)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="garage">🔧 {STATUS_NAMES.garage}</option>
              <option value="on_track">🏎️ {STATUS_NAMES.on_track}</option>
              <option value="pits">⏸️ {STATUS_NAMES.pits}</option>
              <option value="checkered">🏁 {STATUS_NAMES.checkered}</option>
            </select>
          </div>

          {/* Item Type Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setItemType('task')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  itemType === 'task'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                📋 Task
              </button>
              <button
                type="button"
                onClick={() => setItemType('event')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
            <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium text-emerald-400">
                📅 Scheduled Time
              </label>
              <div>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={scheduledStartTime}
                    onChange={(e) => setScheduledStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End</label>
                  <input
                    type="time"
                    value={scheduledEndTime}
                    onChange={(e) => setScheduledEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                  />
                </div>
              </div>
              <p className="text-xs text-emerald-400/70">
                Grid points auto-calculate from duration
              </p>
            </div>
          )}

          {/* Grid points and due date */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grid-points" className="block text-sm font-medium text-gray-400 mb-1">
                Grid Points (GP)
              </label>
              <select
                id="grid-points"
                value={gridPoints}
                onChange={(e) => setGridPoints(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select GP</option>
                {GRID_POINT_OPTIONS.map((points) => (
                  <option key={points} value={points}>
                    {points}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-gray-400 mb-1">
                📅 Race Day
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Optional flags */}
          <div className="mb-6 flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isGoal}
                onChange={(e) => setIsGoal(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span>🎯 Goal</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isRecurringTemplate}
                onChange={(e) => setIsRecurringTemplate(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
              />
              <span>🔄 Template</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createMutation.isPending}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-green-900/30"
            >
              {createMutation.isPending ? '🏎️ Creating...' : '🏁 Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

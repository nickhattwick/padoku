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

export const NewWorkItemModal = ({ isOpen, onClose, defaultStatus = 'garage' }: NewWorkItemModalProps) => {
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkItemStatus>(defaultStatus);
  const [isGoal, setIsGoal] = useState(false);
  const [isRecurringTemplate, setIsRecurringTemplate] = useState(false);
  const createMutation = useCreateWorkItem();

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('new-item-title');
      setTimeout(() => input?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        status,
        parent_id: currentParentId, // Create as child of current context
        due_at: null,
        is_goal: isGoal,
        goal_end_condition: null, // Will be set later in drawer
        is_recurring_template: isRecurringTemplate,
        recurrence_rule: null, // Will be set later in drawer
      });

      // Reset form and close
      setTitle('');
      setDescription('');
      setStatus('garage');
      setIsGoal(false);
      setIsRecurringTemplate(false);
      onClose();
    } catch (error) {
      console.error('Failed to create work item:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('garage');
    setIsGoal(false);
    setIsRecurringTemplate(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Work Item</h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="new-item-title" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-track-500"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-track-500"
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkItemStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-track-500"
            >
              <option value="garage">{STATUS_NAMES.garage}</option>
              <option value="on_track">{STATUS_NAMES.on_track}</option>
              <option value="pits">{STATUS_NAMES.pits}</option>
              <option value="checkered">{STATUS_NAMES.checkered}</option>
            </select>
          </div>

          {/* Optional flags */}
          <div className="mb-6 flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isGoal}
                onChange={(e) => setIsGoal(e.target.checked)}
                className="rounded border-gray-300 text-track-600 focus:ring-track-500"
              />
              <span>🎯 Goal</span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurringTemplate}
                onChange={(e) => setIsRecurringTemplate(e.target.checked)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span>🔄 Template</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createMutation.isPending}
              className="px-4 py-2 bg-track-600 text-white rounded-md hover:bg-track-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

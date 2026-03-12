import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workItemsApi } from '../../api/workItems';
import { getStoredToken } from '../../api/auth';
import type { WorkItemStatus } from '@paddock/shared';

interface NewTeamTaskModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const NewTeamTaskModal = ({ teamId, isOpen, onClose, onCreated }: NewTeamTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkItemStatus>('garage');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const token = getStoredToken();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;

    setCreating(true);
    setError(null);

    try {
      // Create the work item
      const newItem = await workItemsApi.create({
        title: title.trim(),
        description: description.trim() || null,
        status,
        parent_id: null,
        due_at: null,
        grid_points: null,
        is_goal: false,
        goal_end_condition: null,
        goal_target: null,
        is_recurring_template: false,
        recurrence_rule: null,
        assignee_id: null,
        user_id: null, // Server sets this from auth
      });

      // Share it to the team
      const shareRes = await fetch(`/api/teams/${teamId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ work_item_id: newItem.id }),
      });

      if (!shareRes.ok) {
        throw new Error('Failed to share to team');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setStatus('garage');
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['workItems'] });
      
      onCreated?.();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>➕</span> Add Team Task
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {([
                { value: 'garage', label: '🔧 Garage', color: 'gray' },
                { value: 'on_track', label: '🏎️ On Track', color: 'green' },
                { value: 'pits', label: '🛠️ Pits', color: 'yellow' },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    status === s.value
                      ? s.color === 'green' 
                        ? 'bg-green-600 text-white'
                        : s.color === 'yellow'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              {creating ? 'Creating...' : 'Create & Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

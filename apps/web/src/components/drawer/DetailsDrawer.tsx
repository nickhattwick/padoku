import { useEffect, useState } from 'react';
import { useWorkItemStore } from '../../stores/workItemStore';
import { useWorkItem, useUpdateWorkItem, useDeleteWorkItem, useWorkItems, useGenerateInstances } from '../../api/queries';
import { STATUS_NAMES, parseRecurrenceRule, stringifyRecurrenceRule, GRID_POINTS_SCALE } from '@paddock/shared';
import type { WorkItemStatus, RecurrenceRule } from '@paddock/shared';
import { RecurrenceRulePicker } from '../recurring/RecurrenceRulePicker';
import { GoalProgressBadge } from '../goals/GoalProgressBadge';
import { CommentsSection } from '../comments/CommentsSection';

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

  const generateInstancesMutation = useGenerateInstances();

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
    }
  }, [item]);

  const handleSave = async () => {
    if (!selectedItemId || !title.trim()) return;

    try {
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
        },
      });
    } catch (error) {
      console.error('Failed to update work item:', error);
    }
  };

  const handleGenerateInstances = async () => {
    if (!selectedItemId || !recurrenceRule) return;

    // Default: generate next 7 days of instances
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    try {
      await generateInstancesMutation.mutateAsync({
        templateId: selectedItemId,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      });
      alert('Successfully generated instances for the next 7 days!');
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
                    handleSave();
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="garage">🔧 {STATUS_NAMES.garage}</option>
                  <option value="on_track">🏎️ {STATUS_NAMES.on_track}</option>
                  <option value="pits">⏸️ {STATUS_NAMES.pits}</option>
                  <option value="checkered">🏁 {STATUS_NAMES.checkered}</option>
                </select>
              </div>

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
                      handleSave();
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
                        handleSave();
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

              {/* Goal Settings */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="drawer-is-goal"
                    checked={isGoal}
                    onChange={(e) => {
                      setIsGoal(e.target.checked);
                      handleSave();
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
                      handleSave();
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
                        handleSave();
                      }}
                    />
                    <button
                      onClick={handleGenerateInstances}
                      disabled={!recurrenceRule || generateInstancesMutation.isPending}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold"
                    >
                      {generateInstancesMutation.isPending ? 'Generating...' : '⚡ Generate Next 7 Days'}
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
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-red-800"
          >
            {deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete'}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

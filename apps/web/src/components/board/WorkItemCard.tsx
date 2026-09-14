import type { WorkItem } from '@paddock/shared';
import { useWorkItemStore } from '../../stores/workItemStore';
import { useContextMenuStore } from '../../stores/contextMenuStore';
import { formatDistanceToNow } from 'date-fns';
import { TimerButton } from '../timer/TimerButton';
import { GoalProgressBadge } from '../goals/GoalProgressBadge';
import { useWorkItems } from '../../api/queries';

interface WorkItemCardProps {
  item: WorkItem;
  isDragging?: boolean;
}

export const WorkItemCard = ({ item, isDragging = false }: WorkItemCardProps) => {
  const openDrawer = useWorkItemStore((s) => s.openDrawer);
  const openContextMenu = useContextMenuStore((s) => s.open);
  const { data: children = [] } = useWorkItems(item.is_goal ? item.id : undefined);

  const handleClick = () => {
    // Don't open drawer when dragging
    if (isDragging) return;
    openDrawer(item.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(item, { x: e.clientX, y: e.clientY });
  };

  const dueDateLabel = item.due_at
    ? formatDistanceToNow(new Date(item.due_at), { addSuffix: true })
    : null;

  // Check if due date is soon (within 24 hours) or overdue
  const isDueSoon = item.due_at && item.due_at <= Date.now() + 24 * 60 * 60 * 1000;
  const isOverdue = item.due_at && item.due_at < Date.now();

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`bg-gray-800 border rounded-xl p-4 transition-all group ${
        item.is_recurring_template 
          ? 'border-amber-500/50 bg-amber-900/20' 
          : 'border-gray-700 hover:border-gray-500'
      } ${
        isDragging 
          ? 'cursor-grabbing shadow-2xl ring-2 ring-purple-500/50 scale-105' 
          : 'cursor-grab hover:bg-gray-750 hover:shadow-lg'
      }`}
    >
      {/* Title */}
      <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Goal Progress */}
      {item.is_goal && (
        <div className="mb-3">
          <GoalProgressBadge goal={item} children={children} size="small" />
        </div>
      )}

      {/* Metadata & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {item.grid_points && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-bold border border-purple-500/30">
              🏁 {item.grid_points} GP
            </span>
          )}
          {item.due_at && (
            <span className={`px-2 py-1 rounded-lg border ${
              isOverdue 
                ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                : isDueSoon 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-gray-700 text-gray-300 border-gray-600'
            }`}>
              📅 {dueDateLabel}
            </span>
          )}
          {item.is_goal && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
              🎯 Goal
            </span>
          )}
          {item.is_recurring_template && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
              🔄 Template
            </span>
          )}
        </div>
        <TimerButton workItemId={item.id} />
      </div>
    </div>
  );
};

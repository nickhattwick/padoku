import type { WorkItem } from '@paddock/shared';
import { useWorkItemStore } from '../../stores/workItemStore';
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
  const { data: children = [] } = useWorkItems(item.is_goal ? item.id : undefined);

  const handleClick = () => {
    // Don't open drawer when dragging
    if (isDragging) return;
    openDrawer(item.id);
  };

  const dueDateLabel = item.due_at
    ? formatDistanceToNow(new Date(item.due_at), { addSuffix: true })
    : null;

  return (
    <div
      onClick={handleClick}
      className={`bg-white border rounded-lg p-4 transition-shadow ${
        item.is_recurring_template ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'
      } ${
        isDragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab hover:shadow-md'
      }`}
    >
      {/* Title */}
      <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {item.due_at && (
            <span className="px-2 py-1 bg-pits-50 text-pits-700 rounded">
              📅 {dueDateLabel}
            </span>
          )}
          {item.is_goal && (
            <span className="px-2 py-1 bg-track-50 text-track-700 rounded">
              🎯 Goal
            </span>
          )}
          {item.is_recurring_template && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
              🔄 Template
            </span>
          )}
        </div>
        <TimerButton workItemId={item.id} />
      </div>
    </div>
  );
};

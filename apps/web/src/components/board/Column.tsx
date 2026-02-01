import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { WorkItem, WorkItemStatus } from '@paddock/shared';
import { SortableWorkItemCard } from './SortableWorkItemCard';

interface ColumnProps {
  status: WorkItemStatus;
  title: string;
  items: WorkItem[];
}

export const Column = ({ status, title, items }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 min-w-[280px]">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">{title}</h2>
          <span className="text-sm text-gray-500">{items.length}</span>
        </div>
      </div>

      {/* Column content - droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 overflow-y-auto space-y-3 transition-colors ${
          isOver ? 'bg-track-50' : ''
        }`}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-8">No items</div>
          ) : (
            items.map((item) => <SortableWorkItemCard key={item.id} item={item} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
};

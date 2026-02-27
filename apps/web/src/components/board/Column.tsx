import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { WorkItem, WorkItemStatus } from '@paddock/shared';
import { SortableWorkItemCard } from './SortableWorkItemCard';

// Status-specific styling
const STATUS_STYLES: Record<WorkItemStatus, { headerBg: string; accent: string; hoverBg: string }> = {
  garage: {
    headerBg: 'bg-gradient-to-r from-gray-700 to-gray-800',
    accent: 'border-gray-600',
    hoverBg: 'bg-gray-800/50',
  },
  on_track: {
    headerBg: 'bg-gradient-to-r from-blue-700 to-blue-800',
    accent: 'border-blue-600',
    hoverBg: 'bg-blue-900/30',
  },
  pits: {
    headerBg: 'bg-gradient-to-r from-amber-700 to-orange-700',
    accent: 'border-amber-600',
    hoverBg: 'bg-amber-900/30',
  },
  checkered: {
    headerBg: 'bg-gradient-to-r from-green-700 to-emerald-700',
    accent: 'border-green-600',
    hoverBg: 'bg-green-900/30',
  },
};

// Status emojis
const STATUS_EMOJI: Record<WorkItemStatus, string> = {
  garage: '🔧',
  on_track: '🏎️',
  pits: '⏸️',
  checkered: '🏁',
};

interface ColumnProps {
  status: WorkItemStatus;
  title: string;
  items: WorkItem[];
}

export const Column = ({ status, title, items }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const styles = STATUS_STYLES[status];
  const emoji = STATUS_EMOJI[status];

  // Calculate total grid points for this column
  const totalGridPoints = useMemo(
    () => items.reduce((sum, item) => sum + (item.grid_points || 0), 0),
    [items]
  );

  return (
    <div className={`flex-1 flex flex-col bg-gray-900/80 rounded-xl border ${styles.accent} min-w-[280px] shadow-lg`}>
      {/* Column header */}
      <div className={`px-4 py-3 ${styles.headerBg} rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <span>{emoji}</span>
            <span>{title}</span>
          </h2>
          <div className="flex items-center gap-2">
            {totalGridPoints > 0 && (
              <span className="text-xs px-2 py-1 bg-purple-500/30 text-purple-300 rounded-lg font-bold border border-purple-500/50">
                {totalGridPoints} GP
              </span>
            )}
            <span className="text-sm text-white/70 bg-white/10 px-2 py-0.5 rounded-md font-medium">
              {items.length}
            </span>
          </div>
        </div>
      </div>

      {/* Column content - droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-2 transition-all ${
          isOver ? `${styles.hoverBg} ring-2 ring-inset ring-white/20` : ''
        }`}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="text-center text-gray-600 text-sm mt-8 py-4">
              <div className="text-2xl mb-2 opacity-50">{emoji}</div>
              No items
            </div>
          ) : (
            items.map((item) => <SortableWorkItemCard key={item.id} item={item} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
};

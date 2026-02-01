import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useWorkItems, useMoveWorkItem } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';
import { WORK_ITEM_STATUSES, STATUS_NAMES } from '@paddock/shared';
import type { WorkItem, WorkItemStatus } from '@paddock/shared';
import { WorkItemCard } from './WorkItemCard';
import { Column } from './Column';
import { calculatePosition } from '../../utils/positioning';
import { EmptyState } from '../EmptyState';

interface BoardProps {
  onCreateItem: () => void;
}

export const Board = ({ onCreateItem }: BoardProps) => {
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const { data: workItems = [], isLoading, error } = useWorkItems(currentParentId);
  const moveMutation = useMoveWorkItem();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    })
  );

  // Group work items by status
  const columns = useMemo(() => {
    const grouped: Record<WorkItemStatus, WorkItem[]> = {
      garage: [],
      on_track: [],
      pits: [],
      checkered: [],
    };

    workItems.forEach((item) => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    });

    // Sort by position
    Object.keys(grouped).forEach((status) => {
      grouped[status as WorkItemStatus].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [workItems]);

  // Get the active item being dragged
  const activeItem = activeId ? workItems.find((item) => item.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const overId = over.id as string;

    // Determine target status
    let targetStatus: WorkItemStatus;
    let targetIndex = 0;

    // Check if dropped directly on a column (droppable zone)
    if (WORK_ITEM_STATUSES.includes(overId as any)) {
      targetStatus = overId as WorkItemStatus;
      // Add to end of column
      targetIndex = columns[targetStatus].length;
    } else {
      // Dropped on another item
      const overItem = workItems.find((item) => item.id === overId);
      if (!overItem) return;

      targetStatus = overItem.status;
      targetIndex = columns[targetStatus].findIndex((item) => item.id === overId);
    }

    const sourceItem = workItems.find((item) => item.id === itemId);
    if (!sourceItem) return;

    // Calculate new position using fractional indexing
    const targetColumnItems = columns[targetStatus].filter((item) => item.id !== itemId);
    const newPosition = calculatePosition(targetColumnItems, targetIndex);

    // Only update if something changed
    if (sourceItem.status !== targetStatus || sourceItem.position !== newPosition) {
      moveMutation.mutate({
        id: itemId,
        status: targetStatus,
        position: newPosition,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading work items: {error.message}</div>
      </div>
    );
  }

  // Show empty state if no items at root level
  if (workItems.length === 0 && currentParentId === null) {
    return <EmptyState onCreateItem={onCreateItem} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full p-6 overflow-auto">
        <div className="flex gap-4 h-full">
          {WORK_ITEM_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              title={STATUS_NAMES[status]}
              items={columns[status]}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay shows the card being dragged */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 opacity-90">
            <WorkItemCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

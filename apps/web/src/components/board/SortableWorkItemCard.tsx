import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorkItem } from '@paddock/shared';
import { WorkItemCard } from './WorkItemCard';

interface SortableWorkItemCardProps {
  item: WorkItem;
}

export const SortableWorkItemCard = ({ item }: SortableWorkItemCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WorkItemCard item={item} isDragging={isDragging} />
    </div>
  );
};

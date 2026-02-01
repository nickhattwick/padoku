import type { WorkItem } from '@paddock/shared';

/**
 * Calculate position for inserting an item using fractional indexing
 * This allows reordering without updating all items
 *
 * @param items - Sorted array of items in the target column
 * @param targetIndex - Index where the item should be inserted
 * @returns The position value to use
 */
export const calculatePosition = (
  items: WorkItem[],
  targetIndex: number
): number => {
  if (items.length === 0) {
    return 0;
  }

  // Insert at beginning
  if (targetIndex === 0) {
    return items[0].position - 1;
  }

  // Insert at end
  if (targetIndex >= items.length) {
    return items[items.length - 1].position + 1;
  }

  // Insert between two items
  const before = items[targetIndex - 1].position;
  const after = items[targetIndex].position;

  return (before + after) / 2;
};

import { create } from 'zustand';

export type DueDateFilter = 'all' | '7days' | '2weeks' | '1month';

interface WorkItemStore {
  // Navigation context (which parent's children are we viewing?)
  currentParentId: string | null;
  setCurrentParent: (id: string | null) => void;

  // Due date filter
  dueDateFilter: DueDateFilter;
  setDueDateFilter: (filter: DueDateFilter) => void;

  // Events visibility on board
  showEvents: boolean;
  setShowEvents: (show: boolean) => void;

  // Selected item (for details drawer)
  selectedItemId: string | null;
  selectItem: (id: string | null) => void;

  // Drawer state
  isDrawerOpen: boolean;
  openDrawer: (itemId: string) => void;
  closeDrawer: () => void;
}

export const useWorkItemStore = create<WorkItemStore>((set) => ({
  // Default to viewing root items (no parent)
  currentParentId: null,
  setCurrentParent: (id) => set({ currentParentId: id }),

  // Default to showing all items
  dueDateFilter: 'all',
  setDueDateFilter: (filter) => set({ dueDateFilter: filter }),

  // Default to hiding events on board (they live on calendar)
  showEvents: false,
  setShowEvents: (show) => set({ showEvents: show }),

  selectedItemId: null,
  selectItem: (id) => set({ selectedItemId: id }),

  isDrawerOpen: false,
  openDrawer: (itemId) => set({ selectedItemId: itemId, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));

import { create } from 'zustand';

interface WorkItemStore {
  // Navigation context (which parent's children are we viewing?)
  currentParentId: string | null;
  setCurrentParent: (id: string | null) => void;

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

  selectedItemId: null,
  selectItem: (id) => set({ selectedItemId: id }),

  isDrawerOpen: false,
  openDrawer: (itemId) => set({ selectedItemId: itemId, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));

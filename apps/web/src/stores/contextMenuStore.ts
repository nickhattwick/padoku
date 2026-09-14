import { create } from 'zustand';
import type { WorkItem } from '@paddock/shared';

interface ContextMenuStore {
  isOpen: boolean;
  item: WorkItem | null;
  position: { x: number; y: number };
  open: (item: WorkItem, position: { x: number; y: number }) => void;
  close: () => void;
}

export const useContextMenuStore = create<ContextMenuStore>((set) => ({
  isOpen: false,
  item: null,
  position: { x: 0, y: 0 },
  open: (item, position) => set({ isOpen: true, item, position }),
  close: () => set({ isOpen: false, item: null }),
}));

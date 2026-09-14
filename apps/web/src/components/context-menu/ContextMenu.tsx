import { useState, useEffect, useRef } from 'react';
import { MoveToMenu } from './MoveToMenu';
import { useDeleteWorkItem } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';
import type { WorkItem } from '@paddock/shared';

interface ContextMenuProps {
  item: WorkItem;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu = ({ item, position, onClose }: ContextMenuProps) => {
  const [showMoveTo, setShowMoveTo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteItem = useDeleteWorkItem();
  const openDrawer = useWorkItemStore(s => s.openDrawer);
  const setCurrentParent = useWorkItemStore(s => s.setCurrentParent);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (showMoveTo) {
    return <MoveToMenu item={item} position={position} onClose={onClose} />;
  }

  // Adjust position to stay on screen
  const menuWidth = 200;
  const menuHeight = 200;
  const adjustedPosition = { ...position };
  if (position.x + menuWidth > window.innerWidth) {
    adjustedPosition.x = window.innerWidth - menuWidth - 8;
  }
  if (position.y + menuHeight > window.innerHeight) {
    adjustedPosition.y = window.innerHeight - menuHeight - 8;
  }

  const menuItems = [
    {
      label: 'Open',
      icon: '📋',
      onClick: () => { openDrawer(item.id); onClose(); },
    },
    {
      label: 'Drill into',
      icon: '📂',
      onClick: () => { setCurrentParent(item.id); onClose(); },
    },
    {
      label: 'Move to…',
      icon: '📦',
      onClick: () => setShowMoveTo(true),
    },
    { divider: true } as any,
    {
      label: 'Delete',
      icon: '🗑️',
      danger: true,
      onClick: () => {
        if (confirm(`Delete "${item.title}"? This will also delete all sub-items.`)) {
          deleteItem.mutate(item.id);
        }
        onClose();
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden py-1"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: menuWidth,
      }}
    >
      {menuItems.map((menuItem, i) =>
        menuItem.divider ? (
          <div key={i} className="border-t border-gray-700 my-1" />
        ) : (
          <button
            key={i}
            onClick={menuItem.onClick}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
              menuItem.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <span>{menuItem.icon}</span>
            <span>{menuItem.label}</span>
          </button>
        )
      )}
    </div>
  );
};

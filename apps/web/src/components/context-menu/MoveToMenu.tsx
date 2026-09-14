import { useState, useEffect, useRef } from 'react';
import { useWorkItems, useMoveWorkItem } from '../../api/queries';
import type { WorkItem } from '@paddock/shared';

interface MoveToMenuProps {
  item: WorkItem;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MoveToMenu = ({ item, position, onClose }: MoveToMenuProps) => {
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: allItems = [] } = useWorkItems();
  const moveItem = useMoveWorkItem();

  // Focus search input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  // Build list of potential parents (exclude self, descendants, and current parent)
  const getDescendantIds = (parentId: string): Set<string> => {
    const ids = new Set<string>();
    const recurse = (pid: string) => {
      allItems.filter(i => i.parent_id === pid).forEach(child => {
        ids.add(child.id);
        recurse(child.id);
      });
    };
    recurse(parentId);
    return ids;
  };

  const descendantIds = getDescendantIds(item.id);

  const candidates = allItems.filter(i => {
    if (i.id === item.id) return false;           // Can't move to self
    if (descendantIds.has(i.id)) return false;     // Can't move into own child
    if (i.parent_id === item.id) return false;     // Already a child of this item
    if (i.id === item.parent_id) return false;     // Already the current parent
    if (i.status === 'checkered') return false;    // Skip completed items
    return true;
  });

  const filtered = search.trim()
    ? candidates.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    : candidates;

  // Sort: root items first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    const aRoot = a.parent_id === null ? 0 : 1;
    const bRoot = b.parent_id === null ? 0 : 1;
    if (aRoot !== bRoot) return aRoot - bRoot;
    return a.title.localeCompare(b.title);
  });

  const handleMove = (targetParentId: string | null) => {
    moveItem.mutate({
      id: item.id,
      parentId: targetParentId,
    });
    onClose();
  };

  // Adjust position to stay on screen
  const adjustedPosition = { ...position };
  const menuWidth = 280;
  const menuHeight = 360;
  if (position.x + menuWidth > window.innerWidth) {
    adjustedPosition.x = window.innerWidth - menuWidth - 8;
  }
  if (position.y + menuHeight > window.innerHeight) {
    adjustedPosition.y = window.innerHeight - menuHeight - 8;
  }

  // Get breadcrumb path for an item
  const getPath = (i: WorkItem): string => {
    const parts: string[] = [];
    let current: WorkItem | undefined = i;
    while (current?.parent_id) {
      const parent = allItems.find(p => p.id === current!.parent_id);
      if (parent) {
        parts.unshift(parent.title);
        current = parent;
      } else {
        break;
      }
    }
    return parts.length > 0 ? parts.join(' › ') : '';
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: menuWidth,
        maxHeight: menuHeight,
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-900/50">
        <div className="text-xs text-gray-400 mb-1.5 font-medium">Move "{item.title}" to…</div>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Options */}
      <div className="overflow-y-auto" style={{ maxHeight: menuHeight - 80 }}>
        {/* Move to root option */}
        {item.parent_id !== null && (
          <button
            onClick={() => handleMove(null)}
            className="w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700/50"
          >
            <div className="text-sm text-amber-400 font-medium">🏠 Root (no parent)</div>
            <div className="text-xs text-gray-500">Make this a top-level item</div>
          </button>
        )}

        {sorted.map(target => {
          const path = getPath(target);
          return (
            <button
              key={target.id}
              onClick={() => handleMove(target.id)}
              className="w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-sm text-white truncate">{target.title}</div>
              {path && (
                <div className="text-xs text-gray-500 truncate">{path}</div>
              )}
            </button>
          );
        })}

        {sorted.length === 0 && !item.parent_id && (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            No matching items
          </div>
        )}
      </div>
    </div>
  );
};

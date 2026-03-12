import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkItems } from '../../api/queries';
import { workItemsApi } from '../../api/workItems';
import { useWorkItemStore } from '../../stores/workItemStore';
import { TeamsPanel } from '../teams/TeamsPanel';
import type { WorkItem } from '@paddock/shared';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const setCurrentParent = useWorkItemStore((s) => s.setCurrentParent);
  const openDrawer = useWorkItemStore((s) => s.openDrawer);
  const { data: rootItems = [] } = useWorkItems(null);

  const handleNavigate = (itemId: string | null) => {
    setCurrentParent(itemId);
  };

  const handleEdit = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent navigation when clicking edit
    openDrawer(itemId);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-28 z-30 p-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-64 bg-gray-900/80 border-r border-gray-800 flex flex-col">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-bold text-white flex items-center gap-2">
          <span className="text-amber-500">🏆</span> Projects
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Project tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Root level */}
        <button
          onClick={() => handleNavigate(null)}
          className={`w-full px-3 py-2 rounded-lg text-left transition-all mb-1 ${
            currentParentId === null
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          🏠 All Items
        </button>

        {/* Root work items (potential projects) */}
        <div className="space-y-1 mt-2">
          {rootItems.map((item) => (
            <ProjectTreeItem
              key={item.id}
              item={item}
              level={0}
              isActive={currentParentId === item.id}
              onNavigate={handleNavigate}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {rootItems.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-8">
            <div className="text-2xl mb-2">🏁</div>
            No projects yet
          </div>
        )}
      </div>

      {/* Teams section */}
      <TeamsPanel />
    </div>
  );
};

interface ProjectTreeItemProps {
  item: WorkItem;
  level: number;
  isActive: boolean;
  onNavigate: (id: string | null) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
}

const ProjectTreeItem = ({ item, level, isActive, onNavigate, onEdit }: ProjectTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: children = [] } = useQuery({
    queryKey: ['workItemChildren', item.id],
    queryFn: () => workItemsApi.getChildren(item.id),
    enabled: isExpanded, // Only fetch when expanded
  });

  const paddingLeft = `${level * 12 + 12}px`;

  return (
    <div className="group">
      <div
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
          isActive 
            ? 'bg-gray-800 text-white font-medium border border-gray-700' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        }`}
        style={{ paddingLeft }}
      >
        {/* Expand/collapse button - always show arrow since any item could have children */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-white"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Item title - clickable to navigate */}
        <button
          onClick={() => onNavigate(item.id)}
          className="flex-1 text-left text-sm truncate"
        >
          {item.title}
        </button>

        {/* Edit button */}
        <button
          onClick={(e) => onEdit(e, item.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-purple-400 transition-all p-1 rounded hover:bg-gray-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div className="space-y-1">
          {children.map((child) => (
            <ProjectTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={false}
              onNavigate={onNavigate}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

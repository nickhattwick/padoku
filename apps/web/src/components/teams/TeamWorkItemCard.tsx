import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workItemsApi } from '../../api/workItems';
import type { TeamBoardItem, WorkItem } from '@paddock/shared';

interface TeamWorkItemCardProps {
  item: TeamBoardItem;
  onOpenItem?: (itemId: string) => void;
  depth?: number;
}

export const TeamWorkItemCard = ({ item, onOpenItem, depth = 0 }: TeamWorkItemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch children when expanded
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['workItemChildren', item.id],
    queryFn: () => workItemsApi.getChildren(item.id),
    enabled: isExpanded,
  });

  const hasExpandIcon = true; // Always show expand icon since any item could have children

  return (
    <div className="space-y-1">
      <div
        className={`p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors group ${
          depth > 0 ? 'ml-4 border-l-2 border-l-purple-600/50' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          {/* Expand button */}
          {hasExpandIcon && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-0.5 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white rounded hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              {loadingChildren ? (
                <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0" onClick={() => onOpenItem?.(item.id)}>
            <div className="font-medium text-white text-sm mb-1 line-clamp-2">
              {item.title}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {item.grid_points && (
                <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">
                  {item.grid_points} GP
                </span>
              )}
              {item.due_at && (
                <span className="text-gray-600">
                  📅 {new Date(item.due_at).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {depth === 0 && item.shared_by_name && (
              <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-600">
                <span>Shared by {item.shared_by_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div className="space-y-1 pl-2">
          {children.map((child) => (
            <ChildWorkItemCard
              key={child.id}
              item={child}
              onOpenItem={onOpenItem}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      
      {isExpanded && !loadingChildren && children.length === 0 && (
        <div className="ml-6 text-xs text-gray-600 py-2">
          No sub-items
        </div>
      )}
    </div>
  );
};

// Child item card (regular work item, not team board item)
const ChildWorkItemCard = ({ 
  item, 
  onOpenItem, 
  depth 
}: { 
  item: WorkItem; 
  onOpenItem?: (id: string) => void;
  depth: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['workItemChildren', item.id],
    queryFn: () => workItemsApi.getChildren(item.id),
    enabled: isExpanded,
  });

  // Status colors
  const statusColors: Record<string, string> = {
    garage: 'border-l-gray-500',
    on_track: 'border-l-green-500',
    pits: 'border-l-yellow-500',
    checkered: 'border-l-blue-500',
  };

  return (
    <div className="space-y-1">
      <div
        className={`p-2 bg-gray-800/70 rounded border border-gray-700/50 hover:border-gray-600 cursor-pointer transition-colors border-l-2 ${statusColors[item.status] || 'border-l-gray-500'}`}
        style={{ marginLeft: `${Math.min(depth * 8, 32)}px` }}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-0.5 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-white rounded hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {loadingChildren ? (
              <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className={`w-2 h-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0" onClick={() => onOpenItem?.(item.id)}>
            <div className="text-sm text-gray-300 line-clamp-1">
              {item.title}
            </div>
            {item.grid_points && (
              <span className="text-xs px-1 py-0.5 bg-purple-900/30 text-purple-400 rounded">
                {item.grid_points}
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="space-y-1">
          {children.map((child) => (
            <ChildWorkItemCard
              key={child.id}
              item={child}
              onOpenItem={onOpenItem}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

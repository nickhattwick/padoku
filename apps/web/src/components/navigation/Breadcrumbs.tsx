import { useWorkItemAncestors } from '../../api/queries';
import { useWorkItemStore, DueDateFilter } from '../../stores/workItemStore';

const FILTER_OPTIONS: { value: DueDateFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '7days', label: '7 Days' },
  { value: '2weeks', label: '2 Weeks' },
  { value: '1month', label: '1 Month' },
];

export const Breadcrumbs = () => {
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const setCurrentParent = useWorkItemStore((s) => s.setCurrentParent);
  const dueDateFilter = useWorkItemStore((s) => s.dueDateFilter);
  const setDueDateFilter = useWorkItemStore((s) => s.setDueDateFilter);
  const { data: ancestors = [] } = useWorkItemAncestors(currentParentId || undefined);

  const handleNavigate = (itemId: string | null) => {
    setCurrentParent(itemId);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Root level */}
      <button
        onClick={() => handleNavigate(null)}
        className={`px-3 py-1 rounded-md transition-colors ${
          currentParentId === null
            ? 'bg-track-100 text-track-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        🏠 All Items
      </button>

      {/* Ancestors */}
      {ancestors.map((ancestor) => (
        <div key={ancestor.id} className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          <button
            onClick={() => handleNavigate(ancestor.id)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            {ancestor.title}
          </button>
        </div>
      ))}

      {/* Current item indicator */}
      {currentParentId && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          <span className="px-3 py-1 bg-track-100 text-track-700 font-medium rounded-md">
            Current
          </span>
        </div>
      )}

      {/* Due Date Filter */}
      <div className="flex items-center gap-1 ml-4 pl-4 border-l border-gray-200">
        <span className="text-gray-500 mr-1">📅 Due:</span>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDueDateFilter(option.value)}
            className={`px-2 py-1 rounded-md transition-colors text-xs ${
              dueDateFilter === option.value
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

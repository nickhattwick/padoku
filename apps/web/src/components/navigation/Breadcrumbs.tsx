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
        className={`px-3 py-1.5 rounded-lg transition-all ${
          currentParentId === null
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
        }`}
      >
        🏠 All Items
      </button>

      {/* Ancestors */}
      {ancestors.map((ancestor) => (
        <div key={ancestor.id} className="flex items-center gap-2">
          <span className="text-gray-600">/</span>
          <button
            onClick={() => handleNavigate(ancestor.id)}
            className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all border border-transparent hover:border-gray-700"
          >
            {ancestor.title}
          </button>
        </div>
      ))}

      {/* Current item indicator */}
      {currentParentId && (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">/</span>
          <span className="px-3 py-1.5 bg-gray-800 text-white font-medium rounded-lg border border-gray-700">
            Current
          </span>
        </div>
      )}

      {/* Due Date Filter */}
      <div className="flex items-center gap-1 ml-4 pl-4 border-l border-gray-700">
        <span className="text-gray-500 mr-1">🏁 Due:</span>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDueDateFilter(option.value)}
            className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium ${
              dueDateFilter === option.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-500 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

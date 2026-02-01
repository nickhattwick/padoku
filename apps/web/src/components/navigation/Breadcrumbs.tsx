import { useWorkItemAncestors } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';

export const Breadcrumbs = () => {
  const currentParentId = useWorkItemStore((s) => s.currentParentId);
  const setCurrentParent = useWorkItemStore((s) => s.setCurrentParent);
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
    </div>
  );
};

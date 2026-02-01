interface EmptyStateProps {
  onCreateItem: () => void;
}

export const EmptyState = ({ onCreateItem }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-4">🏁</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Paddock</h2>
        <p className="text-gray-600 mb-6">
          Your high-performance productivity system. Create your first work item to get started.
        </p>
        <button
          onClick={onCreateItem}
          className="px-6 py-3 bg-track-600 text-white rounded-md hover:bg-track-700 transition-colors font-medium"
        >
          Create Your First Item
        </button>
        <div className="mt-8 text-sm text-gray-500">
          <p className="font-medium mb-2">Quick Tips:</p>
          <ul className="space-y-1 text-left">
            <li>• Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">N</kbd> to create new items</li>
            <li>• Drag cards between columns to update status</li>
            <li>• Click cards to edit details</li>
            <li>• Create nested projects by adding children to items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

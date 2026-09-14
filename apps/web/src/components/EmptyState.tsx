interface EmptyStateProps {
  onCreateItem: () => void;
}

export const EmptyState = ({ onCreateItem }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md px-6">
        <div className="text-7xl mb-4">🏎️</div>
        <h2 className="text-3xl font-black text-white mb-2 speed-text">Welcome to Paddock</h2>
        <p className="text-gray-400 mb-6">
          Your high-performance productivity system. Create your first work item to get on the track.
        </p>
        <button
          onClick={onCreateItem}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all font-bold text-lg shadow-lg shadow-green-900/40"
        >
          🏁 Start Your Engine
        </button>
        <div className="mt-8 text-sm text-gray-500 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="font-bold text-white mb-3">Quick Tips:</p>
          <ul className="space-y-2 text-left text-gray-400">
            <li className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300">N</kbd>
              <span>Create new items</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">🏁</span>
              <span>Drag cards between columns to update status</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-400">✏️</span>
              <span>Click cards to edit details</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-400">📁</span>
              <span>Create nested projects by adding children</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import { useTimer } from '../../hooks/useTimer';
import { useWorkItem } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';

export const ActiveTimerBar = () => {
  const { activeTimer, formattedTime, stopTimer } = useTimer();
  const openDrawer = useWorkItemStore((s) => s.openDrawer);

  const { data: workItem } = useWorkItem(activeTimer?.work_item_id || '');

  if (!activeTimer || !workItem) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-2xl z-40 border-t border-red-500">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-sm">🏎️ Timer Active</span>
          </div>

          <button
            onClick={() => openDrawer(workItem.id)}
            className="text-left hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
          >
            <div className="font-bold">{workItem.title}</div>
            {workItem.description && (
              <div className="text-sm text-white/70 truncate max-w-md">
                {workItem.description}
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono font-black tabular-nums">{formattedTime}</div>
          <button
            onClick={() => stopTimer()}
            className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-bold shadow-lg"
          >
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  );
};

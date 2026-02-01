import { useTimer } from '../../hooks/useTimer';
import { useWorkItem } from '../../api/queries';
import { useWorkItemStore } from '../../stores/workItemStore';

export const ActiveTimerBar = () => {
  const { activeTimer, formattedTime, stopTimer } = useTimer();
  const openDrawer = useWorkItemStore((s) => s.openDrawer);

  const { data: workItem } = useWorkItem(activeTimer?.work_item_id || '');

  if (!activeTimer || !workItem) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-track-600 text-white shadow-lg z-40">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">Timer Running</span>
          </div>

          <button
            onClick={() => openDrawer(workItem.id)}
            className="text-left hover:underline"
          >
            <div className="font-medium">{workItem.title}</div>
            {workItem.description && (
              <div className="text-sm text-track-100 truncate max-w-md">
                {workItem.description}
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono font-bold">{formattedTime}</div>
          <button
            onClick={() => stopTimer()}
            className="px-4 py-2 bg-white text-track-700 rounded-md hover:bg-track-50 transition-colors font-medium"
          >
            ⏹ Stop Timer
          </button>
        </div>
      </div>
    </div>
  );
};

import { useTimer } from '../../hooks/useTimer';

interface TimerButtonProps {
  workItemId: string;
}

export const TimerButton = ({ workItemId }: TimerButtonProps) => {
  const { activeTimer, isActive, startTimer, stopTimer, isStarting, isStopping } = useTimer();

  const isThisItemActive = activeTimer?.work_item_id === workItemId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card click

    if (isThisItemActive) {
      stopTimer();
    } else {
      startTimer(workItemId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isStarting || isStopping || (isActive && !isThisItemActive)}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
        isThisItemActive
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : isActive
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-track-100 text-track-700 hover:bg-track-200'
      }`}
      title={
        isThisItemActive
          ? 'Stop timer'
          : isActive
          ? 'Another timer is running'
          : 'Start timer'
      }
    >
      {isStarting || isStopping ? (
        '...'
      ) : isThisItemActive ? (
        '⏹ Stop'
      ) : (
        '▶ Start'
      )}
    </button>
  );
};

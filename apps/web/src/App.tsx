import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Board } from './components/board/Board';
import { NewWorkItemModal } from './components/forms/NewWorkItemModal';
import { DetailsDrawer } from './components/drawer/DetailsDrawer';
import { Sidebar } from './components/navigation/Sidebar';
import { Breadcrumbs } from './components/navigation/Breadcrumbs';
import { ActiveTimerBar } from './components/timer/ActiveTimerBar';
import { CalendarView } from './components/calendar/CalendarView';
import { PodiumView } from './components/podium/PodiumView';
import { useKeyboardShortcuts } from './hooks/useKeyboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [view, setView] = useState<'board' | 'calendar' | 'podium'>('board');

  // Enable keyboard shortcuts
  useKeyboardShortcuts(() => setIsNewItemModalOpen(true));

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-full flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-track-600">🏁</span> Paddock
            </h1>
            <p className="text-sm text-gray-500">Run your laps. Beat your pace.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏁 Paddock
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Track
              </button>
              <button
                onClick={() => setView('podium')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === 'podium'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏆 Podium
              </button>
            </div>

            <button
              onClick={() => alert('Keyboard Shortcuts:\n\nN - New work item\nESC - Close drawer / Go to root\nH - Go home\n? - Show help')}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Keyboard shortcuts"
            >
              ?
            </button>
            <button
              onClick={() => setIsNewItemModalOpen(true)}
              className="px-4 py-2 bg-track-600 text-white rounded-md hover:bg-track-700 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>New Item</span>
              <span className="text-xs opacity-75">(N)</span>
            </button>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <Breadcrumbs />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex">
          {view === 'board' ? (
            <>
              <Sidebar />
              <div className="flex-1 overflow-hidden">
                <Board onCreateItem={() => setIsNewItemModalOpen(true)} />
              </div>
            </>
          ) : view === 'calendar' ? (
            <div className="flex-1 overflow-hidden">
              <CalendarView />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <PodiumView />
            </div>
          )}
        </main>

        {/* New Item Modal */}
        <NewWorkItemModal
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
        />

        {/* Details Drawer */}
        <DetailsDrawer />

        {/* Active Timer Bar */}
        <ActiveTimerBar />
      </div>
    </QueryClientProvider>
  );
}

export default App;

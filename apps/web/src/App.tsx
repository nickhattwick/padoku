import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Board } from './components/board/Board';
import { NewWorkItemModal } from './components/forms/NewWorkItemModal';
import { DetailsDrawer } from './components/drawer/DetailsDrawer';
import { Sidebar } from './components/navigation/Sidebar';
import { Breadcrumbs } from './components/navigation/Breadcrumbs';
import { ActiveTimerBar } from './components/timer/ActiveTimerBar';
import { CalendarView } from './components/calendar/CalendarView';
import { PodiumView } from './components/podium/PodiumView';
import { RacingView } from './components/racing/RacingView';
import { LandingPage } from './components/LandingPage';
import { useKeyboardShortcuts } from './hooks/useKeyboard';
import { getStoredUser, getStoredToken, clearAuth, authApi, User } from './api/auth';
import './styles/racing.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [view, setView] = useState<'board' | 'calendar' | 'podium' | 'racing'>('board');
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Enable keyboard shortcuts
  useKeyboardShortcuts(() => setIsNewItemModalOpen(true));

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Clear any legacy dev login state
      localStorage.removeItem('paddock_logged_in');
      
      // Check for real auth token
      const token = getStoredToken();
      const storedUser = getStoredUser();
      
      if (token && storedUser) {
        // Verify token is still valid
        const currentUser = await authApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          clearAuth();
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authApi.logout();
    localStorage.removeItem('paddock_logged_in');
    setUser(null);
    // Clear query cache
    queryClient.clear();
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-950">
        <div className="text-white text-lg animate-pulse">🏎️ Loading...</div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-950">
      {/* Checkered accent line */}
      <div className="checkered-pattern-dark h-1" />

      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white speed-text">
            <span className="text-red-500">🏁</span> Paddock
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">Run your laps. Beat your pace.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-800/80 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'board'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🏁 Paddock
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📅 Track
            </button>
            <button
              onClick={() => setView('podium')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'podium'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🏆 Podium
            </button>
            <button
              onClick={() => setView('racing')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'racing'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🏎️ Race
            </button>
          </div>

          <button
            onClick={() => alert('Keyboard Shortcuts:\n\nN - New work item\nESC - Close drawer / Go to root\nH - Go home\n? - Show help')}
            className="px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            title="Keyboard shortcuts"
          >
            ?
          </button>

          {/* User menu */}
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img src={user.picture} alt={user.name || ''} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
              title="Logout"
            >
              🚪
            </button>
          </div>

          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg shadow-green-900/30"
          >
            <span className="text-lg">+</span>
            <span>New Item</span>
            <span className="text-xs opacity-75 bg-white/20 px-1.5 py-0.5 rounded">N</span>
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="px-6 py-2 bg-gray-900/50 border-b border-gray-800">
        <Breadcrumbs />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex bg-gradient-to-b from-gray-900 to-gray-950">
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
        ) : view === 'podium' ? (
          <div className="flex-1 overflow-hidden">
            <PodiumView />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <RacingView />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

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
import { ProfileView } from './components/profile/ProfileView';
import { BadgeUnlockModal } from './components/badges/BadgeUnlockModal';
import { LandingPage } from './components/LandingPage';
import { ContextMenu } from './components/context-menu/ContextMenu';
import { useKeyboardShortcuts } from './hooks/useKeyboard';
import { useBadgeUnlock } from './hooks/useBadgeUnlock';
import { useContextMenuStore } from './stores/contextMenuStore';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts(() => setIsNewItemModalOpen(true));

  // Badge unlock tracking
  const { unlockedBadge, closeBadgeModal } = useBadgeUnlock();

  // Context menu
  const contextMenu = useContextMenuStore();

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
      <header className="bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800 px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <img src="/padoku-logo.png" alt="Padoku" className="h-7 w-7 md:h-8 md:w-8 rounded" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg md:text-2xl font-black text-white speed-text">Padoku</h1>
              <span className="text-xs text-red-500/60 tracking-[0.2em] hidden lg:inline">パドク</span>
            </div>
            <p className="text-sm text-gray-500 hidden lg:block ml-2">Run your laps. Beat your pace.</p>
          </div>

          {/* Desktop View Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex bg-gray-800/80 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'board'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🏁 Padoku
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
              <button
                onClick={() => setIsProfileOpen(true)}
                className="rounded-full hover:ring-2 hover:ring-purple-500 transition-all"
                title="View Profile"
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name || ''} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                )}
              </button>
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

          {/* Mobile: Quick actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="rounded-full hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name || ''} className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
            </button>
            <button
              onClick={() => setIsNewItemModalOpen(true)}
              className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-lg"
            >
              <span className="text-lg">+</span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pb-2 border-t border-gray-800 pt-3">
            {/* Mobile view toggle */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => { setView('board'); setIsMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-center ${
                  view === 'board'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xl">🏁</span>
                <div className="text-xs mt-1">Board</div>
              </button>
              <button
                onClick={() => { setView('calendar'); setIsMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-center ${
                  view === 'calendar'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xl">📅</span>
                <div className="text-xs mt-1">Track</div>
              </button>
              <button
                onClick={() => { setView('podium'); setIsMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-center ${
                  view === 'podium'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xl">🏆</span>
                <div className="text-xs mt-1">Podium</div>
              </button>
              <button
                onClick={() => { setView('racing'); setIsMobileMenuOpen(false); }}
                className={`p-3 rounded-lg text-center ${
                  view === 'racing'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <span className="text-xl">🏎️</span>
                <div className="text-xs mt-1">Race</div>
              </button>
            </div>
            
            {/* Mobile actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm"
              >
                📁 Projects
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumbs - hidden on mobile when not on board */}
      <div className={`px-3 md:px-6 py-2 bg-gray-900/50 border-b border-gray-800 ${view !== 'board' ? 'hidden md:block' : ''}`}>
        <Breadcrumbs />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
              <span className="text-white font-bold">Projects</span>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-400">✕</button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex bg-gradient-to-b from-gray-900 to-gray-950">
        {view === 'board' ? (
          <>
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0 h-full overflow-hidden">
              <Sidebar />
            </div>
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

      {/* Profile View */}
      {isProfileOpen && (
        <ProfileView user={user} onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Badge Unlock Modal */}
      <BadgeUnlockModal badge={unlockedBadge} onClose={closeBadgeModal} />

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.item && (
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={contextMenu.close}
        />
      )}
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

import { useEffect, useState } from 'react';
import { authApi, User } from '../api/auth';
import '../styles/racing.css';

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LandingPageProps {
  onLogin: (user: User) => void;
}

export const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) return;

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Get Google Client ID from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await authApi.getConfig();
        setGoogleClientId(config.googleClientId);
      } catch (err) {
        console.error('Failed to get auth config:', err);
        // Don't show error - will use dev mode
      }
    };

    fetchConfig();
  }, []);

  // Initialize Google Sign-In when client ID is available
  useEffect(() => {
    if (!googleClientId || !window.google) return;

    const handleCredentialResponse = async (response: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authApi.loginWithGoogle(response.credential);
        onLogin(result.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        setIsLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 280,
      });
    }
  }, [googleClientId, onLogin]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/hero-race.png)',
          filter: 'brightness(0.6)',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

      {/* Checkered pattern accent at top */}
      <div className="absolute top-0 left-0 right-0 checkered-pattern-dark h-2 opacity-50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏁</span>
            <h1 className="text-3xl font-black text-white speed-text">Paddock</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            {/* Main Tagline */}
            <h2 className="text-6xl md:text-8xl font-black text-white mb-6 speed-text leading-tight">
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                Life is a race!
              </span>
              <br />
              <span className="text-white">Win it.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Your high-performance productivity system. 
              Track tasks, crush goals, and leave the competition in the dust.
            </p>

            {/* Login Section */}
            <div className="flex flex-col items-center gap-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-white text-lg">
                  <span className="animate-pulse">🏎️ Starting engine...</span>
                </div>
              ) : googleClientId ? (
                <div id="google-signin-button" className="min-h-[44px]" />
              ) : (
                <div className="text-gray-400">
                  <span className="animate-pulse">Loading sign-in...</span>
                </div>
              )}
            </div>

            {/* Quick features */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔧</span>
                <span>Kanban Board</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span>Race Your Rivals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>Track Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span>Time Tracking</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-gray-500 text-sm">
            Run your laps. Beat your pace. 🏁
          </p>
        </footer>
      </div>

      {/* Animated speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: '-100%',
              right: '100%',
              animation: `speedLine ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* CSS for speed line animation */}
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

import { useState } from 'react';
import '../styles/racing.css';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [isHovering, setIsHovering] = useState(false);

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

            {/* CTA Button */}
            <button
              onClick={onEnter}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`
                relative px-12 py-5 text-2xl font-black text-white rounded-2xl
                bg-gradient-to-r from-red-600 via-red-500 to-orange-500
                hover:from-red-500 hover:via-orange-500 hover:to-yellow-500
                transition-all duration-300 transform
                ${isHovering ? 'scale-110 shadow-2xl shadow-red-500/50' : 'scale-100'}
                border-2 border-white/20
              `}
            >
              <span className="flex items-center gap-3">
                <span className={`transition-transform duration-300 ${isHovering ? 'translate-x-2' : ''}`}>
                  🏎️
                </span>
                <span>Start Your Engine</span>
                <span className={`transition-transform duration-300 ${isHovering ? 'translate-x-2' : ''}`}>
                  →
                </span>
              </span>

              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 
                blur-xl opacity-0 transition-opacity duration-300 -z-10
                ${isHovering ? 'opacity-50' : ''}
              `} />
            </button>

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

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeUnlockModal = ({ badge, onClose }: BadgeUnlockModalProps) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (badge) {
      // Trigger particles after badge appears
      const timer = setTimeout(() => setShowParticles(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowParticles(false);
    }
  }, [badge]);

  // Auto-close after 4 seconds
  useEffect(() => {
    if (badge) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Radial glow background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-96 h-96 bg-gradient-radial from-amber-500/30 via-amber-600/10 to-transparent rounded-full blur-3xl"
          />

          {/* Particle effects */}
          {showParticles && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: Math.random() * 2 + 1,
                    opacity: 0,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    ease: 'easeOut',
                    delay: Math.random() * 0.3,
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#fcd34d'][
                      Math.floor(Math.random() * 5)
                    ],
                    boxShadow: '0 0 10px currentColor',
                  }}
                />
              ))}
            </div>
          )}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative z-10 flex flex-col items-center"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Badge unlocked text */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4"
            >
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 uppercase tracking-widest">
                🏆 Badge Unlocked! 🏆
              </span>
            </motion.div>

            {/* Badge container with glow ring */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgba(251, 191, 36, 0.5)',
                  '0 0 60px rgba(251, 191, 36, 0.8)',
                  '0 0 30px rgba(251, 191, 36, 0.5)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 border-4 border-amber-500/50"
            >
              {/* Shine effect */}
              <motion.div
                initial={{ x: '-100%', opacity: 0.5 }}
                animate={{ x: '200%', opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.5,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />

              {/* Badge image */}
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2,
                }}
                src={badge.image}
                alt={badge.name}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Badge name */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 text-3xl font-black text-white text-center"
            >
              {badge.name}
            </motion.h2>

            {/* Badge description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-2 text-lg text-amber-400/80 text-center max-w-xs"
            >
              {badge.description}
            </motion.p>

            {/* Click to close hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-6 text-sm text-gray-500"
            >
              Click anywhere to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;

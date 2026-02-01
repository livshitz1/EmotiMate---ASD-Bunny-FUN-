import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface GoodbyeHugProps {
  language: 'he' | 'en';
  onClose: () => void;
  onComplete: () => void;
}

export const GoodbyeHug: React.FC<GoodbyeHugProps> = ({ 
  language, 
  onClose, 
  onComplete 
}) => {
  const [isHugging, setIsHugging] = useState(false);
  const isHebrew = language === 'he';

  const handleHug = async () => {
    if (isHugging) return;
    
    setIsHugging(true);
    
    // Trigger heavy haptic for physical sensation
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {}

    // Celebration after hug
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[500] bg-gradient-to-b from-pink-300 to-rose-500 flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-1000 ${isHugging ? 'hug-glow' : ''}`}
    >
      {/* Background Hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              scale: 0, 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.4, 0],
              y: [null, '-=100']
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute text-4xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white drop-shadow-lg mb-2">
            {isHebrew ? 'חיבוק פרידה!' : 'Goodbye Hug!'}
          </h2>
          <p className="text-white/90 font-bold text-xl">
            {isHebrew ? 'הגיע הזמן לחיבוק גדול' : 'Time for a big hug'}
          </p>
        </div>

        <div className="relative w-80 h-82 flex items-center justify-center">
          <motion.div
            animate={isHugging ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isHugging ? Infinity : 0 }}
          >
            <BunnyLottie 
              animation={isHugging ? 'excited' : 'idle'} 
              className="w-full h-full"
            />
          </motion.div>

          {/* Growing Heart Animation */}
          <AnimatePresence>
            {isHugging && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 15, opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center text-9xl pointer-events-none"
              >
                ❤️
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Huge Button */}
        {!isHugging ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHug}
            className="w-full py-8 bg-white text-rose-600 rounded-[3rem] text-3xl font-black shadow-2xl border-b-8 border-rose-200 flex items-center justify-center gap-4 animate-pulse"
          >
            <span>{isHebrew ? 'תביא חיבוק!' : 'Give a Hug!'}</span>
            <span className="text-4xl">🫂</span>
          </motion.button>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/20 backdrop-blur-md rounded-full px-8 py-4 border-2 border-white/30"
          >
            <p className="text-white text-2xl font-black animate-pulse">
              {isHebrew ? 'מרגישים את האהבה... ❤️' : 'Feeling the love... ❤️'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-10 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/30 transition-all backdrop-blur-sm z-50"
      >
        ✕
      </button>
    </motion.div>
  );
};

export default GoodbyeHug;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Emotion } from '../types';
import BunnyLottie from './BunnyLottie';
import { playCleanupSong } from './AudioPlayer';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface CleanupTimeProps {
  language: Language;
  onClose: () => void;
  onComplete: () => void;
  onStartAR?: () => void;
}

const CLEANUP_ITEMS = [
  { id: 'toys', icon: '🧸', label: 'צעצועים', labelEn: 'Toys' },
  { id: 'colors', icon: '🎨', label: 'צבעים', labelEn: 'Colors' },
  { id: 'puzzles', icon: '🧩', label: 'פאזל', labelEn: 'Puzzles' },
];

const CleanupTime: React.FC<CleanupTimeProps> = ({ language, onClose, onComplete, onStartAR }) => {
  const isHebrew = language === Language.HEBREW;
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [bunnyAnimation, setBunnyAnimation] = useState<string | undefined>(undefined);
  const audioRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Start cleanup song
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioRef.current = playCleanupSong(ctx);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audioRef.current) audioRef.current.stop();
    };
  }, []);

  const handleItemTap = useCallback((id: string) => {
    if (completedItems.includes(id)) return;

    setCompletedItems(prev => [...prev, id]);
    setBunnyAnimation('excited'); // Happy dance
    Haptics.impact({ style: ImpactStyle.Medium });

    // Reset animation after 3 seconds
    setTimeout(() => {
      setBunnyAnimation(undefined);
    }, 3000);

    if (completedItems.length + 1 === CLEANUP_ITEMS.length) {
      setTimeout(() => {
        onComplete();
      }, 3500);
    }
  }, [completedItems, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-blue-900/95 backdrop-blur-xl flex flex-col items-center p-6 safe-area-inset-top safe-area-inset-bottom"
    >
      {/* Timer Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 shadow-lg">
          <span className="text-3xl font-black text-white font-mono">{formatTime(timeLeft)}</span>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-white border border-white/20"
        >
          ✕
        </button>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-2">
          {isHebrew ? 'זמן לסדר!' : 'Cleanup Time!'}
        </h2>
        <p className="text-blue-200 font-bold italic">
          {isHebrew ? 'בוא נחזיר הכל למקום ביחד' : 'Let\'s put everything away together'}
        </p>
      </div>

      {/* Bunny Section */}
      <div className="relative mb-12">
        <div className="relative">
          <BunnyLottie 
            mood={Emotion.HAPPY}
            animation={bunnyAnimation}
          />
          
          {/* Broom/Basket Overlay */}
          <motion.div 
            animate={{ 
              rotate: [0, -10, 0, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-4 -right-10 text-7xl drop-shadow-xl"
          >
            🧹
          </motion.div>
        </div>
      </div>

      {/* Item Icons */}
      <div className="w-full max-w-md grid grid-cols-3 gap-6">
        {CLEANUP_ITEMS.map((item) => {
          const isDone = completedItems.includes(item.id);
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleItemTap(item.id)}
              className={`relative aspect-square rounded-3xl border-4 flex flex-col items-center justify-center transition-all ${
                isDone 
                  ? 'bg-green-500/20 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <span className={`text-5xl mb-2 transition-transform duration-500 ${isDone ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {isHebrew ? item.label : item.labelEn}
              </span>

              <AnimatePresence>
                {isDone && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-5xl"
                  >
                    ✅
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Progress Message */}
      <div className="mt-12 text-white font-black text-xl animate-pulse">
        {completedItems.length === CLEANUP_ITEMS.length 
          ? (isHebrew ? 'הכל נקי! איזה יופי ✨' : 'Everything is clean! Amazing ✨')
          : (isHebrew ? 'מה עוד נשאר לסדר?' : 'What else is left to clean?')}
      </div>

      {onStartAR && (
        <button 
          onClick={onStartAR}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl shadow-xl flex items-center gap-3 active:scale-95 transition-transform"
        >
          <span className="text-2xl">🐰✨</span>
          {isHebrew ? 'סדר ב-AR!' : 'Cleanup in AR!'}
        </button>
      )}
    </motion.div>
  );
};

export default CleanupTime;

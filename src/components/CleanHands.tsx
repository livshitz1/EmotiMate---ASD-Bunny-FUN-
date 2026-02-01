import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Emotion } from '../types';
import BunnyLottie from './BunnyLottie';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { playWaterSplashSound } from './AudioPlayer';

interface CleanHandsProps {
  language: Language;
  onClose: () => void;
  onComplete: () => void;
  onAction: (text: string) => void;
}

export const CleanHands: React.FC<CleanHandsProps> = ({ language, onClose, onComplete, onAction }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const isHebrew = language === 'he';

  const startWashing = useCallback(() => {
    setIsActive(true);
    onAction(isHebrew ? 'התחלתי לשטוף ידיים!' : 'I started washing my hands!');
  }, [isHebrew, onAction]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // Play splash sound every few seconds
        if (timeLeft % 4 === 0) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            playWaterSplashSound(ctx, 0.2);
          } catch (e) {}
        }
      }, 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isFinished]);

  const handleComplete = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      playWaterSplashSound(ctx, 0.5);
    } catch (e) {}
    
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const addBubbles = () => {
    const colors = ['#bfdbfe', '#bae6fd', '#a5f3fc', '#99f6e4', '#ffffff'];
    const newBubbles = Array.from({ length: 15 }).map(() => ({
      id: Math.random() + Date.now(),
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setBubbles(prev => [...prev, ...newBubbles]);
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    
    // Clean up bubbles after animation
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)));
    }, 4000);
  };

  const progress = ((20 - timeLeft) / 20) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[140] flex items-center justify-center bg-sky-900/80 backdrop-blur-xl p-4 overflow-hidden"
    >
      <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl relative flex flex-col items-center text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-300 hover:text-gray-500 text-2xl z-10"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-sky-600 mb-2">
          {isHebrew ? 'ידיים נקיות!' : 'Clean Hands!'}
        </h2>
        <p className="text-gray-500 mb-8 font-bold">
          {isHebrew ? 'בוא נשטוף ידיים יחד עם הארנב' : "Let's wash hands with the bunny"}
        </p>

        {/* Virtual Sink & Bunny */}
        <div className="relative w-full aspect-square max-w-[300px] mb-8 bg-sky-50 rounded-full border-8 border-white shadow-inner flex flex-col items-center justify-center overflow-hidden">
          {/* Water Drop Timer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <motion.div 
              style={{ width: '80%', height: '80%', borderRadius: '50% 50% 20% 80% / 80% 20% 50% 50%' }}
              className="bg-sky-400"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          <div className="relative z-10 w-48 h-48">
            <BunnyLottie 
              mood={Emotion.HAPPY} 
              animation={isActive ? 'eating' : 'idle'} 
            />
            
            {/* Hands/Water Effect Overlay */}
            {isActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl"
              >
                💧✨🧼
              </motion.div>
            )}
          </div>

          {/* Progress Water Drop */}
          <div className="absolute bottom-0 left-0 right-0 bg-sky-200/50 transition-all duration-1000" style={{ height: `${progress}%` }}>
            <div className="w-full h-2 bg-sky-300 opacity-50 blur-sm" />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-sky-600/20">
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        {!isActive && !isFinished ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startWashing}
            className="w-full py-6 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-3xl font-black text-2xl shadow-xl shadow-sky-200 flex items-center justify-center gap-4"
          >
            <span>🧼</span>
            {isHebrew ? 'התחל לשטוף!' : 'Start Washing!'}
          </motion.button>
        ) : isFinished ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4 text-green-500">✨🏆✨</div>
            <h3 className="text-2xl font-black text-green-600">
              {isHebrew ? 'איזה יופי! הידיים נקיות' : 'Great job! Hands are clean'}
            </h3>
          </motion.div>
        ) : (
          <div className="w-full space-y-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={addBubbles}
              className="w-full py-4 bg-white border-4 border-sky-200 text-sky-500 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-3 active:bg-sky-50"
            >
              <span>🫧</span>
              {isHebrew ? 'עוד סבון!' : 'More Soap!'}
            </motion.button>
            <p className="text-sky-400 font-bold animate-pulse">
              {isHebrew ? 'לשפשף היטב...' : 'Scrub scrub scrub...'}
            </p>
          </div>
        )}
      </div>

      {/* Bubbles Animation Overlay */}
      <AnimatePresence>
        {bubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            initial={{ y: window.innerHeight + 100, x: bubble.x, scale: 0, opacity: 0 }}
            animate={{ 
              y: -200, 
              x: bubble.x + (Math.random() - 0.5) * 200,
              scale: [0.5, 1.5, 1],
              opacity: [0, 0.8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 + Math.random(), ease: "easeOut" }}
            style={{ 
              position: 'absolute',
              width: 40 + Math.random() * 40,
              height: 40 + Math.random() * 40,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 0 10px rgba(255,255,255,0.2)',
              pointerEvents: 'none',
              zIndex: 150
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default CleanHands;

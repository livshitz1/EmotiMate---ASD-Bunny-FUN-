import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';
import SoundReinforcement from './SoundReinforcement';
import { playBathMusic } from './AudioPlayer';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface BathTimeModeProps {
  language: Language;
  onComplete: () => void;
  onClose: () => void;
}

const BathTimeMode: React.FC<BathTimeModeProps> = ({ language, onComplete, onClose }) => {
  const isHebrew = language === Language.HEBREW;
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [progress, setProgress] = useState(0);
  const [soundTrigger, setSoundTrigger] = useState<'pop' | 'task_complete' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const bathMusicRef = useRef<{ stop: () => void } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Bath Music Management
  useEffect(() => {
    const startMusic = async () => {
      try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
          bathMusicRef.current = playBathMusic(ctx, 0.2); // Start at safe volume
        }
      } catch (e) {
        console.error("Bath music failed to start:", e);
      }
    };

    startMusic();

    return () => {
      if (bathMusicRef.current) {
        bathMusicRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate bubbles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFinished) return;
      const newBubble: Bubble = {
        id: Date.now(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: 110, // Start below screen
        size: Math.random() * 40 + 20,
        speed: Math.random() * 3 + 2,
      };
      setBubbles((prev) => [...prev, newBubble]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  // Clean up bubbles that go off screen
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => prev.filter((b) => b.y > -20));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePop = useCallback((id: number) => {
    setSoundTrigger(null);
    setTimeout(() => setSoundTrigger('pop'), 0);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleWash = useCallback(() => {
    if (isFinished) return;
    setProgress((prev) => {
      const next = Math.min(100, prev + 5);
      if (next === 100 && !isFinished) {
        setIsFinished(true);
        setSoundTrigger('task_complete');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
      return next;
    });
  }, [isFinished, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-gradient-to-b from-blue-200 to-blue-400 overflow-hidden flex flex-col items-center justify-center p-6"
      onClick={handleWash}
    >
      <SoundReinforcement trigger={soundTrigger as any} onComplete={() => setSoundTrigger(null)} />

      {/* Floating Bubbles */}
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ y: '110vh', x: `${bubble.x}vw`, opacity: 0 }}
            animate={{ 
              y: '-10vh', 
              opacity: 1,
              x: `${bubble.x + Math.sin(Date.now() / 1000) * 5}vw` 
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: bubble.speed, ease: "linear" }}
            className="absolute rounded-full border-2 border-white/40 bg-white/20 backdrop-blur-[1px] cursor-pointer"
            style={{ width: bubble.size, height: bubble.size }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handlePop(bubble.id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handlePop(bubble.id);
            }}
          >
            <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/40 rounded-full blur-[1px]" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Title */}
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-black text-white mb-8 text-center drop-shadow-lg"
        >
          {isHebrew ? 'זמן אמבטיה! 🛁' : 'Bath Time! 🛁'}
        </motion.h2>

        {/* Bunny with Shower Cap Overlay */}
        <div className="relative mb-8 pointer-events-none">
          <BunnyLottie 
            mood={Emotion.HAPPY} 
            animation={isFinished ? 'happy' : 'excited'} 
          />
          
          {/* Shower Cap SVG Overlay */}
          <motion.div 
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-24 z-20"
          >
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
              <path d="M10 50C10 50 15 20 50 20C85 20 90 50 90 50" stroke="#FFB6C1" strokeWidth="8" strokeLinecap="round" />
              <circle cx="50" cy="25" r="22" fill="#FFB6C1" fillOpacity="0.6" />
              <circle cx="30" cy="35" r="10" fill="#FFB6C1" fillOpacity="0.4" />
              <circle cx="70" cy="35" r="10" fill="#FFB6C1" fillOpacity="0.4" />
              <circle cx="50" cy="40" r="12" fill="#FFB6C1" fillOpacity="0.4" />
              <path d="M20 50C20 50 25 45 50 45C75 45 80 50 80 50" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </motion.div>

          {/* Bubbles on Bunny */}
          <AnimatePresence>
            {!isFinished && progress > 20 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 pointer-events-none"
              >
                {[...Array(Math.floor(progress / 20))].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-8 h-8 rounded-full bg-white/60 border border-white shadow-sm"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Soap Progress Bar */}
        <div className="w-full bg-white/20 backdrop-blur-md rounded-full h-10 border-4 border-white/40 shadow-xl relative overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full flex items-center justify-end px-4"
          >
            <span className="text-white text-2xl font-black drop-shadow-sm">🧼</span>
          </motion.div>
        </div>

        <p className="text-white font-bold text-lg mb-8 text-center drop-shadow-md">
          {isHebrew ? 'לטף את הארנב כדי לסבן אותו!' : 'Tap the bunny to wash them!'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xl rounded-2xl border-2 border-white/30 transition-all"
          >
            {isHebrew ? 'סגור' : 'Close'}
          </button>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>
    </motion.div>
  );
};

export default BathTimeMode;

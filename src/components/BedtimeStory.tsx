import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';
import { playSleepSound } from './AudioPlayer';

interface BedtimeStoryProps {
  language: Language;
  onClose: () => void;
  onStartStory?: () => void;
}

const STARS_COUNT = 40;

export const BedtimeStory: React.FC<BedtimeStoryProps> = ({ language, onClose, onStartStory }) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null); // minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [isTalking, setIsTalking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sleepSoundRef = useRef<{ stop: () => void } | null>(null);

  // Generate random stars once
  const [stars] = useState(() => 
    Array.from({ length: STARS_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      // Start audio if not playing
      if (!sleepSoundRef.current) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        sleepSoundRef.current = playSleepSound(audioContextRef.current, 0.3);
      }

      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Stop audio with fade out
            if (sleepSoundRef.current) {
              sleepSoundRef.current.stop();
              sleepSoundRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      // Pause audio if timer paused
      if (!isTimerActive && sleepSoundRef.current) {
        sleepSoundRef.current.stop();
        sleepSoundRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sleepSoundRef.current) {
        sleepSoundRef.current.stop();
        sleepSoundRef.current = null;
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Handle brightness dimming
  useEffect(() => {
    if (selectedTime && isTimerActive) {
      const totalSeconds = selectedTime * 60;
      const progress = timeRemaining / totalSeconds;
      // Dim from 1.0 to 0.2
      const newBrightness = 0.2 + (progress * 0.8);
      setBrightness(newBrightness);
    } else if (!isTimerActive && timeRemaining === 0 && selectedTime !== null) {
      setBrightness(0.1);
    } else {
      setBrightness(1);
    }
  }, [timeRemaining, selectedTime, isTimerActive]);

  const startTimer = (minutes: number) => {
    setSelectedTime(minutes);
    setTimeRemaining(minutes * 60);
    setIsTimerActive(true);
    if (onStartStory) onStartStory();
  };

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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ 
        background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)',
        filter: `brightness(${brightness})`,
        transition: 'filter 1s ease-in-out'
      }}
    >
      {/* Twinkling Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map(star => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 5px white'
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl z-50 p-2"
      >
        ✕
      </button>

      {/* Title */}
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-white text-3xl font-bold mb-8 text-center px-4"
        style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}
      >
        {language === 'he' ? 'סיפור לפני השינה' : 'Bedtime Story'}
      </motion.h2>

      {/* Bunny Container */}
      <div className="relative w-72 h-72 mb-12 flex items-center justify-center">
        {/* Sleeping Bunny with potential mouth movement overlay */}
        <BunnyLottie 
          mood={Emotion.TIRED} 
          animation={isTalking ? 'idle' : 'sleeping'} 
        />
        
        {/* Simulated mouth movement if we want to stay in sleeping state but show talking */}
        {/* For now, we toggle between sleeping and idle (which has mouth movement) */}
        
        <AnimatePresence>
          {isTimerActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-4 -right-4 bg-indigo-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-mono text-xl shadow-lg border border-indigo-300/30"
            >
              {formatTime(timeRemaining)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Selection or Status */}
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-8 z-10">
        {!isTimerActive && timeRemaining === 0 ? (
          <>
            <p className="text-white/70 text-lg mb-2 text-center">
              {language === 'he' ? 'כמה זמן נרצה להקשיב לסיפור?' : 'How long should we listen to the story?'}
            </p>
            <div className="flex gap-4 justify-center w-full">
              {[10, 20, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => startTimer(mins)}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-bold text-xl transition-all active:scale-95 shadow-lg backdrop-blur-sm"
                >
                  {mins} {language === 'he' ? 'דק\'' : 'min'}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isTimerActive ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isTimerActive 
                ? (language === 'he' ? 'השהה' : 'Pause') 
                : (language === 'he' ? 'המשך' : 'Resume')}
            </button>
            
            <button
              onClick={() => {
                setIsTimerActive(false);
                setTimeRemaining(0);
                setSelectedTime(null);
              }}
              className="text-white/40 hover:text-white/60 text-sm"
            >
              {language === 'he' ? 'איפוס טיימר' : 'Reset Timer'}
            </button>
          </div>
        )}
      </div>

      {/* Talking Simulation Button (For testing or demo) */}
      <button
        onMouseDown={() => setIsTalking(true)}
        onMouseUp={() => setIsTalking(false)}
        onTouchStart={() => setIsTalking(true)}
        onTouchEnd={() => setIsTalking(false)}
        className="mt-12 p-4 bg-white/5 rounded-full text-white/20 hover:text-white/40 border border-white/10 transition-colors"
        title="Hold to talk"
      >
        <span className="text-2xl">🎙️</span>
      </button>
    </motion.div>
  );
};

export default BedtimeStory;

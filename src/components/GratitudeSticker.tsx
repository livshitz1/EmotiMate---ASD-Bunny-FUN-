import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';
import { playChimeSound } from './AudioPlayer';

interface GratitudeStickerProps {
  language: Language;
  onClose: () => void;
  onComplete?: (gratitudeId: string) => void;
}

const GRATITUDE_ITEMS = [
  { id: 'food', emoji: '🍕', label: { he: 'אוכל טעים', en: 'Yummy food' } },
  { id: 'sun', emoji: '☀️', label: { he: 'שמש נעימה', en: 'Warm sun' } },
  { id: 'hug', emoji: '🫂', label: { he: 'חיבוק', en: 'A hug' } },
  { id: 'toy', emoji: '🧸', label: { he: 'צעצוע', en: 'A toy' } },
  { id: 'trip', emoji: '🌳', label: { he: 'טיול', en: 'A walk' } },
];

const STARS_COUNT = 30;

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const GratitudeSticker: React.FC<GratitudeStickerProps> = ({ language, onClose, onComplete }) => {
  const isHebrew = language === 'he';
  const [inJar, setInJar] = useState<string[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const jarRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate background stars
  const [stars] = useState(() => 
    Array.from({ length: STARS_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }))
  );

  const createSparkles = (x: number, y: number) => {
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
      color: ['#FFD700', '#FFFACD', '#FFFFFF', '#E6E6FA'][Math.floor(Math.random() * 4)]
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  };

  const handleSelectItem = (id: string, event: React.MouseEvent | React.TouchEvent) => {
    if (inJar.includes(id)) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    playChimeSound(audioContextRef.current, 0.4);

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

    setInJar(prev => [...prev, id]);
    if (onComplete) onComplete(id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] overflow-hidden flex flex-col items-center justify-between p-6"
      style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)' }}
    >
      {/* Starry Night Sky */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map(star => (
          <motion.div
            key={star.id}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
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

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl z-50 p-2"
      >
        ✕
      </button>

      <div className="relative z-10 text-center mt-10">
        <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
          {isHebrew ? 'צנצנת התודה שלי' : 'My Gratitude Jar'}
        </h2>
        <p className="text-indigo-200 font-bold">
          {isHebrew ? 'מה גרם לך לחייך היום?' : 'What made you smile today?'}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center gap-8">
        
        {/* Bunny and Jar */}
        <div className="relative w-full flex items-end justify-center gap-4">
          <div className="w-40 h-40">
            <BunnyLottie animation="idle" />
          </div>

          {/* Gratitude Jar */}
          <div ref={jarRef} className="relative w-48 h-60 gratitude-jar">
            {/* Jar Back */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Jar Reflections */}
              <div className="absolute top-4 left-4 w-4 h-20 bg-white/20 rounded-full blur-sm rotate-6" />
              
              {/* Items already in jar */}
              <div className="absolute bottom-4 left-0 right-0 flex flex-wrap-reverse justify-center gap-2 p-4">
                <AnimatePresence>
                  {inJar.map((id) => {
                    const item = GRATITUDE_ITEMS.find(i => i.id === id);
                    return (
                      <motion.span
                        key={id}
                        initial={{ y: -200, opacity: 0, scale: 2, rotate: 0 }}
                        animate={{ y: 0, opacity: 1, scale: 1, rotate: Math.random() * 40 - 20 }}
                        className="text-4xl drop-shadow-md"
                      >
                        {item?.emoji}
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Jar Lid */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-indigo-300/40 rounded-full border-2 border-white/30" />
            
            {/* Jar Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-3 py-1 rounded border border-indigo-200 rotate-[-5deg] shadow-sm">
              <span className="text-indigo-900 font-black text-xs uppercase tracking-wider">
                {isHebrew ? 'תודה' : 'THANKS'}
              </span>
            </div>
          </div>
        </div>

        {/* Icons Selection */}
        <div className="grid grid-cols-5 gap-4 w-full max-w-sm px-4">
          {GRATITUDE_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              whileHover={!inJar.includes(item.id) ? { scale: 1.1 } : {}}
              whileTap={!inJar.includes(item.id) ? { scale: 0.9 } : {}}
              onClick={(e) => handleSelectItem(item.id, e)}
              className={`relative flex flex-col items-center p-2 rounded-2xl transition-all ${
                inJar.includes(item.id) 
                  ? 'opacity-30 grayscale cursor-not-allowed' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-4xl mb-1">{item.emoji}</span>
              <span className="text-[8px] text-white font-bold whitespace-nowrap">
                {isHebrew ? item.label.he : item.label.en}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sparkles Layer */}
      <AnimatePresence>
        {sparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], rotate: 45 }}
            exit={{ opacity: 0 }}
            className="sparkle-effect"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: 10,
              height: 10,
              background: sparkle.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        ))}
      </AnimatePresence>

      {/* Footer Text */}
      <div className="relative z-10 pb-8 text-center">
        <p className="text-white/40 text-sm">
          {inJar.length >= GRATITUDE_ITEMS.length 
            ? (isHebrew ? 'איזה יום נפלא היה לנו! ✨' : 'What a wonderful day we had! ✨')
            : (isHebrew ? 'בואו נוסיף עוד דברים טובים...' : 'Let\'s add more good things...')
          }
        </p>
      </div>
    </motion.div>
  );
};

export default GratitudeSticker;

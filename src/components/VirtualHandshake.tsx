import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Language } from '../types';
import SoundReinforcement from './SoundReinforcement';

interface VirtualHandshakeProps {
  language: Language;
  onComplete: () => void;
}

const VirtualHandshake: React.FC<VirtualHandshakeProps> = ({ language, onComplete }) => {
  const isHebrew = language === 'he';
  const [childTouched, setChildTouched] = useState(false);
  const [parentTouched, setParentTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [soundTrigger, setSoundTrigger] = useState<'achievement' | 'points' | null>(null);

  useEffect(() => {
    if (childTouched && parentTouched && !isSuccess) {
      handleSuccess();
    }
  }, [childTouched, parentTouched]);

  const handleSuccess = async () => {
    setIsSuccess(true);
    setSoundTrigger('achievement');
    
    // Pleasant success notification vibration
    await Haptics.notification({ type: NotificationType.Success });

    // Auto-complete after celebration
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  const handleTouchStart = (point: 'child' | 'parent') => {
    if (point === 'child') setChildTouched(true);
    if (point === 'parent') setParentTouched(true);
  };

  const handleTouchEnd = (point: 'child' | 'parent') => {
    if (point === 'child') setChildTouched(false);
    if (point === 'parent') setParentTouched(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-gradient-to-tr from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-between py-20 px-6 overflow-hidden"
    >
      <SoundReinforcement trigger={soundTrigger as any} onComplete={() => setSoundTrigger(null)} />

      {/* Celebration Hearts (Framer Motion replacement for Lottie) */}
      <AnimatePresence>
        {isSuccess && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`, 
                  scale: [0, 2, 0],
                  rotate: Math.random() * 360,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  ease: "easeOut",
                  delay: Math.random() * 0.8 
                }}
                className="absolute text-6xl"
              >
                ❤️
              </motion.div>
            ))}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`, 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeOut",
                  delay: Math.random() * 0.5 
                }}
                className="absolute text-4xl"
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.h2 
        animate={isSuccess ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
        className="text-3xl font-black text-white text-center drop-shadow-lg"
      >
        {isSuccess 
          ? (isHebrew ? 'איזה קסם! ✨' : 'Pure Magic! ✨')
          : (isHebrew ? 'רגע הקסם: לחיצת יד' : 'Magic Moment: Handshake')}
      </motion.h2>

      <div className="flex flex-col items-center gap-16 w-full">
        {/* Parent Point (Top) */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-white font-black uppercase tracking-widest text-lg drop-shadow-md">
            {isHebrew ? 'ההורה' : 'Parent'}
          </span>
          <motion.button
            onMouseDown={() => handleTouchStart('parent')}
            onMouseUp={() => handleTouchEnd('parent')}
            onMouseLeave={() => handleTouchEnd('parent')}
            onTouchStart={() => handleTouchStart('parent')}
            onTouchEnd={() => handleTouchEnd('parent')}
            animate={{ 
              scale: parentTouched ? 1.3 : 1,
              backgroundColor: parentTouched ? '#f59e0b' : 'rgba(255,255,255,0.05)'
            }}
            className="w-40 h-40 rounded-full border-8 border-white/40 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(255,255,255,0.2)] relative overflow-visible"
          >
            <span className="drop-shadow-lg">🖐️</span>
            {parentTouched && (
              <motion.div 
                layoutId="glow-parent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.5 }}
                className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl"
              />
            )}
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-[-10px] rounded-full border-2 border-white/20"
            />
          </motion.button>
        </div>

        {/* Center Visual */}
        <div className="relative h-10 w-full flex items-center justify-center">
          <AnimatePresence>
            {!isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-1 h-10 bg-gradient-to-b from-yellow-400 via-transparent to-blue-400 opacity-30 rounded-full" />
                <p className="absolute text-white/60 text-sm font-black animate-pulse whitespace-nowrap">
                  {isHebrew ? 'געו יחד בידיים' : 'Touch hands together'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Child Point (Bottom) */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            onMouseDown={() => handleTouchStart('child')}
            onMouseUp={() => handleTouchEnd('child')}
            onMouseLeave={() => handleTouchEnd('child')}
            onTouchStart={() => handleTouchStart('child')}
            onTouchEnd={() => handleTouchEnd('child')}
            animate={{ 
              scale: childTouched ? 1.3 : 1,
              backgroundColor: childTouched ? '#3b82f6' : 'rgba(255,255,255,0.05)'
            }}
            className="w-40 h-40 rounded-full border-8 border-white/40 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(255,255,255,0.2)] relative overflow-visible"
          >
            <span className="drop-shadow-lg">🖐️</span>
            {childTouched && (
              <motion.div 
                layoutId="glow-child"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.5 }}
                className="absolute inset-0 rounded-full bg-blue-400 blur-2xl"
              />
            )}
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute inset-[-10px] rounded-full border-2 border-white/20"
            />
          </motion.button>
          <span className="text-white font-black uppercase tracking-widest text-lg drop-shadow-md">
            {isHebrew ? 'הילד' : 'Child'}
          </span>
        </div>
      </div>

      <p className="text-white/60 text-base font-bold italic max-w-xs text-center mt-8 px-4">
        {isHebrew 
          ? 'כשתגעו שניכם יחד, הקסם יתחיל!' 
          : 'When you both touch, the magic begins!'}
      </p>
    </motion.div>
  );
};

export default VirtualHandshake;

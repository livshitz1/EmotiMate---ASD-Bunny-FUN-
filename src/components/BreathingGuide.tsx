import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

interface BreathingGuideProps {
  language: Language;
  isNightMode?: boolean;
}

const BreathingGuide: React.FC<BreathingGuideProps> = ({ language, isNightMode = false }) => {
  const isHebrew = language === Language.HEBREW;
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000); // Toggle every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[300px] rounded-[3rem] p-8 overflow-hidden">
      {/* Glowing Breathing Circle */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Background Glow */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.5 : 0.8,
            opacity: phase === 'inhale' ? 0.8 : 0.3,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
          className="absolute w-full h-full breathing-circle-glow"
        />

        {/* Main Circle */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.2 : 0.7,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
          className={`z-10 w-40 h-40 rounded-full border-4 shadow-[0_0_40px_rgba(139,92,246,0.6)] ${isNightMode ? 'border-orange-200/30' : 'border-purple-200/30'}`}
          style={{
            background: isNightMode 
              ? 'radial-gradient(circle, #fef3c7 0%, #f59e0b 100%)' 
              : 'radial-gradient(circle, #ddd6fe 0%, #8b5cf6 100%)',
          }}
        />
      </div>

      {/* Breathing Text Labels */}
      <div className="mt-12 h-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'inhale' ? (
            <motion.p
              key="inhale"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-2xl font-black text-teal-100 drop-shadow-md"
            >
              {isHebrew ? 'נשימה עמוקה...' : 'Deep inhale...'}
            </motion.p>
          ) : (
            <motion.p
              key="exhale"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-2xl font-black text-teal-200 drop-shadow-md"
            >
              {isHebrew ? 'נשיפה איטית...' : 'Slow exhale...'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Pulse effect for sensory feedback */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none bg-teal-500/5 rounded-[3rem]"
      />
    </div>
  );
};

export default BreathingGuide;

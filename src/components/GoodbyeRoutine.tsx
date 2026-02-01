import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Language } from '../types';
import SoundReinforcement from './SoundReinforcement';

interface GoodbyeRoutineProps {
  language: Language;
  onComplete: () => void;
}

const GoodbyeRoutine: React.FC<GoodbyeRoutineProps> = ({ language, onComplete }) => {
  const isHebrew = language === Language.HEBREW;
  const [isHighFived, setIsHighFived] = useState(false);
  const [soundTrigger, setSoundTrigger] = useState<'task_complete' | 'achievement' | 'points' | null>(null);
  const grandPrize = localStorage.getItem('emotimate_grand_prize');

  const handleHighFive = async () => {
    if (isHighFived) return;
    
    setIsHighFived(true);
    setSoundTrigger('task_complete');
    
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      console.warn("Haptics not supported", e);
    }

    // Wait a bit then close
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-indigo-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <SoundReinforcement trigger={soundTrigger} onComplete={() => setSoundTrigger(null)} />
      
      <AnimatePresence mode="wait">
        {!isHighFived ? (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-8">
              <div className="text-[120px] filter drop-shadow-2xl">🐰</div>
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-12 cursor-pointer select-none active:scale-90 transition-transform high-five-button"
                onClick={handleHighFive}
              >
                ✋
              </motion.div>
              {/* Tap prompt */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-10 -right-16 bg-yellow-400 text-indigo-900 font-black px-4 py-2 rounded-full text-sm shadow-xl pointer-events-none"
              >
                {isHebrew ? 'תן לי כיף!' : 'High Five!'}
              </motion.div>
            </div>

            <h2 className="text-3xl font-black text-white mb-4 leading-tight">
              {isHebrew ? 'להתראות חמוד! 👋' : 'See you later! 👋'}
            </h2>
            <p className="text-xl text-indigo-200 mb-8 leading-relaxed max-w-xs">
              {isHebrew 
                ? 'אני מחכה לך כאן. תן לי כיף גבוה ונצא לדרך!' 
                : 'I\'ll be waiting for you. Give me a high five and let\'s go!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex flex-col items-center"
          >
            <div className="text-[180px] mb-8">✨</div>
            <h2 className="text-5xl font-black text-white mb-4 animate-bounce">
              {isHebrew ? 'יש!!!' : 'YES!!!'}
            </h2>
            <p className="text-2xl text-indigo-100 font-bold">
              {isHebrew ? 'יום מדהים שיהיה לך!' : 'Have an amazing day!'}
            </p>

            {grandPrize && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-3xl flex flex-col items-center gap-2 max-w-xs"
              >
                <span className="text-4xl animate-bounce">🎁</span>
                <p className="text-xs uppercase tracking-widest text-yellow-300 font-black">
                  {isHebrew ? 'הפרס שמחכה לך היום' : 'The prize waiting for you today'}
                </p>
                <p className="text-xl font-bold text-white text-center">
                  {grandPrize}
                </p>
              </motion.div>
            )}
            
            {/* Celebration particles could be added here */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 400, 
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 text-2xl"
                >
                  {['⭐', '🌟', '✨', '🎈'][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={onComplete}
        className="mt-12 text-white/40 font-bold hover:text-white transition-colors"
      >
        {isHebrew ? 'דלג' : 'Skip'}
      </button>
    </div>
  );
};

export default GoodbyeRoutine;

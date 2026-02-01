import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';

interface PickUpModeProps {
  language: Language;
  onReady: () => void;
}

const PickUpMode: React.FC<PickUpModeProps> = ({ language, onReady }) => {
  const isHebrew = language === 'he';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-gradient-to-b from-blue-400 to-indigo-600 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="absolute top-10 flex gap-4 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2 + i, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="text-4xl"
          >
            🎈
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-8"
      >
        <BunnyLottie 
          mood={Emotion.EXCITED} 
          size={300} 
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/20 backdrop-blur-md rounded-[3rem] p-8 border-2 border-white/30 shadow-2xl max-w-sm w-full"
      >
        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
          {isHebrew ? 'אמא/אבא כמעט כאן!' : 'Mom/Dad are almost here!'}
        </h2>
        <p className="text-xl text-blue-50 mb-8 font-bold leading-relaxed">
          {isHebrew ? 'בוא נתארגן לפגישה. האם התיק והנעליים עליך?' : 'Let\'s get ready to meet them. Do you have your bag and shoes on?'}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReady}
          className="w-full py-5 bg-yellow-400 text-indigo-900 font-black text-2xl rounded-2xl shadow-[0_10px_0_rgb(202,138,4)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <span>✅</span>
          {isHebrew ? 'אני מוכן!' : 'I\'m Ready!'}
        </motion.button>
      </motion.div>

      <div className="mt-8 text-white/60 font-medium">
        {isHebrew ? 'כל הכבוד על ההתארגנות המהירה! ✨' : 'Great job getting ready quickly! ✨'}
      </div>
    </motion.div>
  );
};

export default PickUpMode;

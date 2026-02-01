import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

interface DailyWrapUpProps {
  language: Language;
  onSelect: (mood: 'happy' | 'okay' | 'hard') => void;
}

const DailyWrapUp: React.FC<DailyWrapUpProps> = ({ language, onSelect }) => {
  const isHebrew = language === 'he';

  const moods = [
    { id: 'happy', emoji: '😊', label: isHebrew ? 'שמח' : 'Happy', color: 'bg-green-400' },
    { id: 'okay', emoji: '😐', label: isHebrew ? 'סביר' : 'Okay', color: 'bg-yellow-400' },
    { id: 'hard', emoji: '☹️', label: isHebrew ? 'קשה' : 'Hard', color: 'bg-red-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-indigo-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-black text-white mb-12 leading-tight"
      >
        {isHebrew ? 'איך היה היום שלך בגן?' : 'How was your day at school?'}
      </motion.h2>

      <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(mood.id as any)}
            className="flex flex-col items-center gap-4"
          >
            <div className={`w-24 h-24 rounded-full ${mood.color} flex items-center justify-center text-5xl shadow-2xl border-4 border-white/30`}>
              {mood.emoji}
            </div>
            <span className="text-white font-bold text-lg">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-16 text-white/50 text-sm font-medium">
        {isHebrew ? 'שתף אותי ברגשות שלך, אני תמיד כאן להקשיב' : 'Share your feelings with me, I\'m always here to listen'}
      </div>
    </motion.div>
  );
};

export default DailyWrapUp;

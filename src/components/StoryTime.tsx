import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface StoryTimeProps {
  language: Language;
  onSelect: (activity: string, label: string) => void;
  onClose: () => void;
}

const StoryTime: React.FC<StoryTimeProps> = ({ language, onSelect, onClose }) => {
  const isHebrew = language === 'he';

  const activities = [
    { id: 'art', emoji: '🎨', label: isHebrew ? 'יצירה' : 'Art', color: 'bg-pink-400' },
    { id: 'play', emoji: '🧩', label: isHebrew ? 'משחק' : 'Play', color: 'bg-blue-400' },
    { id: 'friends', emoji: '🤝', label: isHebrew ? 'חברים' : 'Friends', color: 'bg-indigo-400' },
    { id: 'food', emoji: '🍎', label: isHebrew ? 'אוכל' : 'Food', color: 'bg-orange-400' },
    { id: 'yard', emoji: '🌳', label: isHebrew ? 'חצר' : 'Yard', color: 'bg-green-400' },
    { id: 'helper', emoji: '✨', label: isHebrew ? 'עוזר קטן' : 'Little Helper', color: 'bg-teal-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[650] bg-indigo-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 text-4xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-black text-white mb-4 leading-tight"
      >
        {isHebrew ? 'מה הכי נהנית לעשות היום?' : 'What did you enjoy most today?'}
      </motion.h2>
      
      <p className="text-white/60 mb-8 font-bold">
        {isHebrew ? 'בוא נספר לארנב על היום שלך' : "Let's tell the bunny about your day"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
        {activities.map((activity) => (
          <motion.button
            key={activity.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(activity.id, activity.label)}
            className="flex flex-col items-center gap-4 bg-white/10 p-6 rounded-[2.5rem] border-2 border-white/20 shadow-xl"
          >
            <div className={`w-20 h-20 rounded-full ${activity.color} flex items-center justify-center text-4xl shadow-2xl border-4 border-white/30`}>
              {activity.emoji}
            </div>
            <span className="text-white font-black text-xl">{activity.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 text-white/40 text-sm font-medium">
        {isHebrew ? 'הבחירה שלך תופיע ביומן של אמא ואבא ✨' : "Your choice will appear in Mom and Dad's log ✨"}
      </div>
    </motion.div>
  );
};

export default StoryTime;

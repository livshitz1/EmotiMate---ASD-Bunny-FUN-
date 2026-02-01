import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import BunnyLottie from './BunnyLottie';

interface LittleHelperProps {
  language: Language;
  onClose: () => void;
  onComplete: (taskId: string, points: number) => void;
}

const HELPER_TASKS = [
  { id: 'table', icon: '🍽️', label: 'עריכת שולחן', labelEn: 'Setting the table', points: 10 },
  { id: 'laundry', icon: '🧺', label: 'איסוף כביסה', labelEn: 'Collecting laundry', points: 10 },
  { id: 'plant', icon: '🪴', label: 'השקיית עציץ', labelEn: 'Watering plants', points: 10 },
  { id: 'toys', icon: '🧹', label: 'סידור צעצועים', labelEn: 'Tidying toys', points: 10 },
];

export const LittleHelper: React.FC<LittleHelperProps> = ({ language, onClose, onComplete }) => {
  const isHebrew = language === Language.HEBREW;
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showHighFive, setShowHighFive] = useState(false);

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    setShowHighFive(true);
    
    // Save to localStorage
    const contributions = JSON.parse(localStorage.getItem('household_contributions') || '[]');
    contributions.push({
      taskId,
      timestamp: new Date().toISOString(),
      label: HELPER_TASKS.find(t => t.id === taskId)?.label
    });
    localStorage.setItem('household_contributions', JSON.stringify(contributions));

    // Complete after animation
    setTimeout(() => {
      const task = HELPER_TASKS.find(t => t.id === taskId);
      if (task) onComplete(taskId, task.points);
      setShowHighFive(false);
      onClose();
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-teal-500/90 backdrop-blur-md"
    >
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden border-4 border-teal-200">
        {/* Background Sparkles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 180, 360],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.2 }}
                    className="absolute text-xl"
                    style={{ 
                        top: `${Math.random() * 100}%`, 
                        left: `${Math.random() * 100}%` 
                    }}
                >
                    ✨
                </motion.div>
            ))}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-teal-300 hover:text-teal-500 text-2xl p-2 z-10"
        >
          ✕
        </button>

        <div className="text-center mb-6 relative">
          <div className="relative inline-block">
            <BunnyLottie animation="excited" />
            
            {/* Tiny Apron */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-10"
            >
              <div className="w-16 h-12 bg-teal-100 rounded-b-2xl border-2 border-teal-300 relative shadow-sm">
                <div className="absolute -top-1 left-2 w-12 h-0.5 bg-teal-300 rotate-2" />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-teal-500">
                  CHEF
                </div>
              </div>
            </motion.div>

            {/* Sparkling Star */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 text-5xl drop-shadow-lg z-20 helper-sparkle"
            >
              ⭐
            </motion.div>
          </div>
          
          <h2 className="text-3xl font-black text-teal-600 mt-4 leading-tight">
            {isHebrew ? 'העוזר הקטן שלי' : 'My Little Helper'}
          </h2>
          <p className="text-teal-400 font-bold px-4">
            {isHebrew ? 'בוא נעזור בבית ונקבל כוכבי אחריות!' : 'Help at home and earn Responsibility Stars!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {HELPER_TASKS.map((task) => (
            <motion.button
              key={task.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={showHighFive}
              onClick={() => handleTaskClick(task.id)}
              className={`p-4 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${
                selectedTask === task.id
                  ? 'border-teal-500 bg-teal-50 shadow-inner'
                  : 'border-teal-50 bg-teal-50/50 hover:border-teal-200 shadow-lg'
              }`}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-1">
                {task.icon}
              </div>
              <span className="text-sm font-black text-teal-800 text-center leading-tight">
                {isHebrew ? task.label : task.labelEn}
              </span>
              <div className="bg-teal-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black">
                +{task.points} ⭐
              </div>
            </motion.button>
          ))}
        </div>

        {/* High-Five Animation Overlay */}
        <AnimatePresence>
          {showHighFive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-teal-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center"
            >
              <div className="relative mb-12">
                <motion.div
                  initial={{ x: -150, rotate: -45, opacity: 0 }}
                  animate={{ x: -40, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-9xl filter drop-shadow-2xl"
                >
                  🐰🐾
                </motion.div>
                <motion.div
                  initial={{ x: 150, rotate: 45, opacity: 0 }}
                  animate={{ x: 40, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="text-9xl filter drop-shadow-2xl absolute top-0 left-0"
                >
                  ✋✨
                </motion.div>
                
                {/* Clash Effect */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
                >
                    💥
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-5xl font-black mb-2 drop-shadow-md">
                  {isHebrew ? 'היי-פייב!' : 'High-Five!'}
                </h2>
                <p className="text-2xl font-bold opacity-90">
                  {isHebrew ? 'כל הכבוד על העזרה בבית!' : 'Great job helping around the house!'}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-6xl"
              >
                🎊⭐🎊
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LittleHelper;

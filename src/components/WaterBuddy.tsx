import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Emotion } from '../types';
import BunnyLottie from './BunnyLottie';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface WaterBuddyProps {
  language: Language;
  onClose: () => void;
  onDrink: (cups: number) => void;
  onAction: (text: string) => void;
}

export const WaterBuddy: React.FC<WaterBuddyProps> = ({ language, onClose, onDrink, onAction }) => {
  const [cupsDrank, setCupsDrank] = useState<number>(() => {
    const saved = localStorage.getItem('emotimate_water_intake');
    const today = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('emotimate_water_reset_date');
    
    if (lastReset !== today) {
      return 0;
    }
    return saved ? parseInt(saved) : 0;
  });

  const [isDrinking, setIsDrinking] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const goal = 5;
  const isHebrew = language === 'he';

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('emotimate_water_intake', cupsDrank.toString());
    localStorage.setItem('emotimate_water_reset_date', today);
  }, [cupsDrank]);

  const handleDrink = async () => {
    if (isDrinking) return;

    setIsDrinking(true);
    setShowBubble(true);
    
    // Haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}

    // Update state
    const newCups = Math.min(goal, cupsDrank + 1);
    setCupsDrank(newCups);
    onDrink(1);
    
    const actionText = isHebrew 
      ? `שתיתי כוס מים! עכשיו שתיתי ${newCups} מתוך ${goal}.`
      : `I drank a cup of water! Now I've had ${newCups} out of ${goal}.`;
    onAction(actionText);

    // Animation timeout
    setTimeout(() => {
      setIsDrinking(false);
    }, 3000);

    setTimeout(() => {
      setShowBubble(false);
    }, 4000);
  };

  const progressHeight = (cupsDrank / goal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4"
    >
      <div className="bg-gradient-to-b from-blue-50 to-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border-4 border-white relative overflow-hidden flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-6 text-blue-300 hover:text-blue-500 text-2xl z-10"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-blue-600 mb-2">
          {isHebrew ? 'המים של הארנב' : 'Water Buddy'}
        </h2>
        <p className="text-blue-400 mb-8 font-bold">
          {isHebrew ? 'בוא נשתה מים כדי להיות רעננים!' : "Let's drink water to stay fresh!"}
        </p>

        <div className="flex items-center justify-center gap-12 mb-10 w-full">
          {/* Visual Water Bottle */}
          <div className="relative w-24 h-48 bg-blue-100/30 rounded-3xl border-4 border-blue-200 overflow-hidden shadow-inner">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${progressHeight}%` }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-300 transition-all duration-1000"
            >
              {/* Waves effect */}
              <motion.div 
                animate={{ x: [-20, 0, -20] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 left-0 w-[200%] h-8 opacity-40 bg-white rounded-full filter blur-sm"
              />
            </motion.div>
            
            {/* Bottle Markers */}
            <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 pointer-events-none">
              {[...Array(goal)].map((_, i) => (
                <div key={i} className="h-0.5 w-3 bg-blue-300/50 rounded-full" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-900/40 font-black text-xl z-10">
                {cupsDrank}/{goal}
              </span>
            </div>
          </div>

          {/* Bunny with Drinking Animation */}
          <div className="relative w-48 h-48">
            <BunnyLottie 
              mood={isDrinking ? Emotion.HAPPY : Emotion.NEUTRAL} 
              animation={isDrinking ? 'satisfied' : 'idle'} 
            />
            
            {/* Straw/Cup Overlay */}
            <motion.div
              animate={isDrinking ? { 
                y: [20, 0, 0, 20],
                rotate: [0, -10, -10, 0]
              } : { y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-5xl"
            >
              🥤
            </motion.div>

            {/* Freshness Bubbles */}
            <AnimatePresence>
              {showBubble && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.5, 1],
                        y: -150 - Math.random() * 100,
                        x: (Math.random() - 0.5) * 150
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, delay: i * 0.2 }}
                      className="absolute top-1/2 left-1/2 text-3xl pointer-events-none"
                    >
                      🫧
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-2xl font-bold shadow-xl whitespace-nowrap z-20"
                  >
                    {isHebrew ? 'רעננות של גיבורים! ✨' : 'Hero Freshness! ✨'}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Drink Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDrink}
          className={`
            w-full py-6 rounded-3xl font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-4
            ${cupsDrank >= goal 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200'}
          `}
        >
          <span>{cupsDrank >= goal ? '✨' : '💧'}</span>
          {isHebrew ? 'שתיתי כוס מים!' : 'I drank a cup of water!'}
          {cupsDrank >= goal && <span>🏆</span>}
        </motion.button>

        {cupsDrank >= goal && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-green-600 font-bold"
          >
            {isHebrew ? 'כל הכבוד! הגעת ליעד היומי שלך! 🎉' : "Amazing! You've reached your daily goal! 🎉"}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default WaterBuddy;

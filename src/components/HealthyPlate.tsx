import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';

interface HealthyPlateProps {
  language: Language;
  onClose: () => void;
  onReward: (points: number) => void;
  onAction: (text: string) => void;
  onStartAR?: () => void;
}

const FOOD_ITEMS = [
  { id: 'broccoli', icon: '🥦', label: 'ברוקולי', labelEn: 'Broccoli', category: 'veg' },
  { id: 'apple', icon: '🍎', label: 'תפוח', labelEn: 'Apple', category: 'fruit' },
  { id: 'carrot', icon: '🥕', label: 'גזר', labelEn: 'Carrot', category: 'veg' },
  { id: 'banana', icon: '🍌', label: 'בננה', labelEn: 'Banana', category: 'fruit' },
];

export const HealthyPlate: React.FC<HealthyPlateProps> = ({ language, onClose, onReward, onAction, onStartAR }) => {
  const [isEating, setIsEating] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [onPlate, setOnPlate] = useState<{ id: string, icon: string, x: number, y: number }[]>([]);

  const handleFoodClick = (food: typeof FOOD_ITEMS[0]) => {
    if (isEating) return;

    // Add to plate at a random position within the plate sections
    const newFood = {
      id: `${food.id}-${Date.now()}`,
      icon: food.icon,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    };
    setOnPlate(prev => [...prev, newFood]);

    // Bunny eats
    setIsEating(true);
    setSpeechBubble(language === 'he' ? 'יאמי! זה נותן לי כוח של גיבורים! 💪' : 'Yummy! This gives me hero strength! 💪');
    onAction(language === 'he' ? `האכלתי את הארנב ב${food.label} בריא!` : `I fed the bunny a healthy ${food.labelEn}!`);

    setTimeout(() => {
      setIsEating(false);
      setSpeechBubble(null);
      // Remove eaten food from plate
      setOnPlate(prev => prev.filter(f => f.id !== newFood.id));
    }, 3000);
  };

  const handleHeroBite = () => {
    onReward(5);
    onAction(language === 'he' ? 'גם אני לקחתי ביס של גיבורים! 🥦🍎' : 'I also took a hero bite! 🥦🍎');
    // Maybe show a small feedback
    setSpeechBubble(language === 'he' ? 'איזה אלוף! עכשיו שנינו חזקים!' : 'What a champion! Now we are both strong!');
    setTimeout(() => setSpeechBubble(null), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div className="bg-gradient-to-b from-sky-100 to-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl border-4 border-white relative overflow-hidden text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-indigo-600 mb-2">
          {language === 'he' ? 'צלחת הגיבורים שלי' : 'My Hero Plate'}
        </h2>
        <p className="text-gray-500 mb-6 font-bold">
          {language === 'he' ? 'בוא נאכל בריא ביחד!' : "Let's eat healthy together!"}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          {/* The Plate */}
          <div className="relative w-64 h-64 rounded-full bg-white shadow-inner border-8 border-gray-100 flex items-center justify-center overflow-hidden">
            {/* Plate Sections */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="bg-green-100/50 border-r border-b border-gray-100 flex items-center justify-center text-[10px] font-black text-green-600/40 uppercase tracking-tighter">
                {language === 'he' ? 'ירקות' : 'Veg'}
              </div>
              <div className="bg-red-100/50 border-b border-gray-100 flex items-center justify-center text-[10px] font-black text-red-600/40 uppercase tracking-tighter">
                {language === 'he' ? 'פירות' : 'Fruit'}
              </div>
              <div className="bg-orange-100/50 border-r border-gray-100 flex items-center justify-center text-[10px] font-black text-orange-600/40 uppercase tracking-tighter">
                {language === 'he' ? 'חלבון' : 'Protein'}
              </div>
              <div className="bg-yellow-100/50 flex items-center justify-center text-[10px] font-black text-yellow-600/40 uppercase tracking-tighter">
                {language === 'he' ? 'דגנים' : 'Grains'}
              </div>
            </div>

            {/* Food on Plate */}
            <AnimatePresence>
              {onPlate.map((food) => (
                <motion.div
                  key={food.id}
                  initial={{ scale: 0, opacity: 0, y: -20 }}
                  animate={{ scale: 1, opacity: 1, x: food.x, y: food.y }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute text-4xl pointer-events-none"
                >
                  {food.icon}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bunny */}
          <div className="relative">
            <div className="w-48 h-48">
              <BunnyLottie 
                mood={isEating ? Emotion.HAPPY : Emotion.NEUTRAL} 
                animation={isEating ? 'eating' : 'idle'} 
              />
            </div>
            
            {/* Speech Bubble */}
            <AnimatePresence>
              {speechBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-indigo-100 text-indigo-600 font-bold text-sm whitespace-nowrap z-20"
                >
                  {speechBubble}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-100 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Food Stickers Palette */}
        <div className="flex justify-center gap-4 mb-8">
          {FOOD_ITEMS.map((food) => (
            <motion.button
              key={food.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFoodClick(food)}
              className="w-16 h-16 bg-white rounded-2xl shadow-md border-2 border-gray-50 flex items-center justify-center text-3xl hover:border-indigo-200 transition-colors"
            >
              {food.icon}
            </motion.button>
          ))}
        </div>

        {/* AR Meal Time Action */}
        {onStartAR && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartAR}
            className="w-full py-4 mb-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-3 transition-all"
          >
            <span>🎥</span>
            {language === 'he' ? 'בוא נאכל בחדר שלי! (AR)' : 'Eat in my room! (AR)'}
          </motion.button>
        )}

        {/* Hero Bite Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleHeroBite}
          className="w-full py-5 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-xl rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-3 transition-all"
        >
          <span>⭐</span>
          {language === 'he' ? 'גם אני לקחתי ביס של גיבורים!' : 'I also took a hero bite!'}
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">+5 כוכבים</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HealthyPlate;

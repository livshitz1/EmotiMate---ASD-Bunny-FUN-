import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface GettingDressedProps {
  language: 'he' | 'en';
  onClose: () => void;
  onComplete: () => void;
  onAction?: (text: string) => void;
}

const CLOTHING_STEPS = [
  { id: 'underwear', icon: '🩲', label: { he: 'תחתונים', en: 'Underwear' } },
  { id: 'socks', icon: '🧦', label: { he: 'גרביים', en: 'Socks' } },
  { id: 'pants', icon: '👖', label: { he: 'מכנסיים', en: 'Pants' } },
  { id: 'shirt', icon: '👕', label: { he: 'חולצה', en: 'Shirt' } },
];

export const GettingDressed: React.FC<GettingDressedProps> = ({ 
  language, 
  onClose, 
  onComplete,
  onAction 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dressedItems, setDressedItems] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const isHebrew = language === 'he';
  const currentStep = CLOTHING_STEPS[currentStepIndex];
  const progress = (dressedItems.length / CLOTHING_STEPS.length) * 100;

  useEffect(() => {
    if (onAction && currentStep) {
      onAction(isHebrew 
        ? `בוא נלבש את ה${currentStep.label.he}!` 
        : `Let's put on the ${currentStep.label.en}!`);
    }
  }, [currentStepIndex]);

  const handleDressItem = async () => {
    if (isAnimating || showCelebration) return;

    setIsAnimating(true);
    Haptics.impact({ style: ImpactStyle.Medium });

    // Wait for fly-in animation
    setTimeout(() => {
      setDressedItems(prev => [...prev, currentStep.id]);
      setIsAnimating(false);
      
      if (currentStepIndex < CLOTHING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setShowCelebration(true);
        Haptics.notification({ type: ImpactStyle.Heavy as any });
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-blue-400 to-indigo-600 flex flex-col items-center p-6 overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="w-full max-w-md bg-white/20 h-4 rounded-full mt-8 overflow-hidden relative border-2 border-white/30">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
        />
        <div className="absolute inset-0 flex justify-center items-center text-[10px] font-bold text-white uppercase tracking-wider">
          {dressedItems.length} / {CLOTHING_STEPS.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        {/* Bunny Container */}
        <div className="relative w-64 h-64 mb-8">
          <BunnyLottie 
            mood={showCelebration ? 'excited' : 'happy'} 
            className="w-full h-full"
          />
          
          {/* Animated Clothing Flying In */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ scale: 2, x: -300, y: -200, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, x: 0, y: 0, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="absolute inset-0 flex items-center justify-center text-8xl pointer-events-none z-10"
              >
                {currentStep.icon}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dressed Items Visual Feedback (Optional/Simple) */}
          <div className="absolute -bottom-4 flex gap-2">
            {dressedItems.map(itemId => (
              <motion.span 
                key={itemId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl bg-white/20 p-1 rounded-full backdrop-blur-sm"
              >
                {CLOTHING_STEPS.find(s => s.id === itemId)?.icon}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Current Item Instruction */}
        {!showCelebration && (
          <div className="text-center mb-8">
            <motion.div 
              key={currentStep.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 relative"
            >
              <div className="text-7xl mb-4">{currentStep.icon}</div>
              <h2 className="text-3xl font-bold text-indigo-900 mb-2">
                {isHebrew ? `לובשים ${currentStep.label.he}` : `Putting on ${currentStep.label.en}`}
              </h2>
              <p className="text-indigo-600 font-medium">
                {isHebrew ? 'כל הכבוד! בוא נמשיך' : 'Great job! Let\'s keep going'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Action Button */}
        {!showCelebration && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDressItem}
            disabled={isAnimating}
            className={`
              px-12 py-6 rounded-full text-2xl font-black shadow-2xl border-b-8 
              ${isAnimating 
                ? 'bg-gray-400 border-gray-600 cursor-not-allowed' 
                : 'bg-green-500 border-green-700 text-white hover:bg-green-400'
              }
              transition-all flex items-center gap-4
            `}
          >
            <span>{isHebrew ? 'סיימתי ללבוש!' : 'I\'m dressed!'}</span>
            <span className="text-3xl">✨</span>
          </motion.button>
        )}

        {/* Celebration */}
        {showCelebration && (
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-center bg-yellow-400 p-8 rounded-[3rem] shadow-2xl border-8 border-white"
          >
            <div className="text-8xl mb-4">🌟</div>
            <h1 className="text-4xl font-black text-indigo-900 mb-2">
              {isHebrew ? 'איזה אלוף!' : 'What a Hero!'}
            </h1>
            <p className="text-indigo-700 text-xl font-bold">
              {isHebrew ? 'התלבשת כל כך יפה!' : 'You dressed so beautifully!'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/30 transition-all backdrop-blur-sm"
      >
        ✕
      </button>

      {/* Background Particles/Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0.2 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0.2, 0.5, 0.2],
              x: `${(Math.random() * 100) + (Math.sin(i) * 10)}vw` 
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2
            }}
            className="absolute w-4 h-4 bg-white/30 rounded-full blur-sm"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GettingDressed;

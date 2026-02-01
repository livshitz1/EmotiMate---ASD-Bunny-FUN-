import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { playWhooshSound } from './AudioPlayer';

interface BackpackHeroProps {
  language: 'he' | 'en';
  onClose: () => void;
  onComplete: () => void;
  onAction?: (text: string) => void;
}

const BACKPACK_ITEMS = [
  { id: 'lunch', icon: '🍱', label: { he: 'קופסת אוכל', en: 'Lunch Box' } },
  { id: 'water', icon: '💧', label: { he: 'בקבוק מים', en: 'Water Bottle' } },
  { id: 'toy', icon: '🧸', label: { he: 'חפץ מעבר/בובה', en: 'Comfort Toy' } },
  { id: 'hat', icon: '🧢', label: { he: 'כובע/סוודר', en: 'Hat/Sweater' } },
];

export const BackpackHero: React.FC<BackpackHeroProps> = ({ 
  language, 
  onClose, 
  onComplete,
  onAction 
}) => {
  const [packedItems, setPackedItems] = useState<string[]>([]);
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const isHebrew = language === 'he';

  useEffect(() => {
    if (onAction && packedItems.length === 0) {
      onAction(isHebrew 
        ? "בוא נכין את התיק שלנו! מה אנחנו צריכים לקחת היום?" 
        : "Let's pack our bag! What do we need to take today?");
    }
  }, []);

  const handlePackItem = async (itemId: string) => {
    if (packedItems.includes(itemId) || animatingItem || isReady) return;

    setAnimatingItem(itemId);
    
    // Play sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      playWhooshSound(ctx);
    } catch (e) {}
    
    Haptics.impact({ style: ImpactStyle.Medium });

    // Wait for fly-in animation
    setTimeout(() => {
      setPackedItems(prev => [...prev, itemId]);
      setAnimatingItem(null);
      
      if (packedItems.length + 1 === BACKPACK_ITEMS.length) {
        setIsReady(true);
        Haptics.notification({ type: ImpactStyle.Heavy as any });
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-orange-300 to-yellow-500 flex flex-col items-center p-6 overflow-hidden"
    >
      {/* Title */}
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-black text-white drop-shadow-lg">
          {isHebrew ? 'גיבור התיק!' : 'Backpack Hero!'}
        </h2>
        <p className="text-white/80 font-bold">
          {isHebrew ? 'אורזים הכל ויוצאים לדרך' : 'Pack everything and let\'s go'}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        
        {/* Bunny with Backpack */}
        <div className="relative w-72 h-72 mb-8">
          <BunnyLottie 
            mood={isReady ? 'excited' : 'happy'} 
            className="w-full h-full"
          />
          
          {/* Virtual Backpack Overlay (Simple representation) */}
          <motion.div 
            animate={isReady ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: isReady ? Infinity : 0 }}
            className="absolute bottom-10 right-10 w-24 h-24 bg-blue-600 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center"
          >
            <span className="text-4xl">🎒</span>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
              {packedItems.length}
            </div>
          </motion.div>

          {/* Animating Item Flying In */}
          <AnimatePresence>
            {animatingItem && (
              <motion.div
                initial={{ scale: 1.5, x: 200, y: -100, opacity: 0 }}
                animate={{ scale: 0.5, x: 60, y: 60, opacity: 1 }}
                exit={{ scale: 0.1, opacity: 0 }}
                transition={{ duration: 0.6, ease: "backIn" }}
                className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none z-20"
              >
                {BACKPACK_ITEMS.find(i => i.id === animatingItem)?.icon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
          {BACKPACK_ITEMS.map((item) => {
            const isPacked = packedItems.includes(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePackItem(item.id)}
                disabled={isPacked || !!animatingItem || isReady}
                className={`
                  relative p-4 rounded-3xl border-4 transition-all flex flex-col items-center gap-2
                  ${isPacked 
                    ? 'bg-green-100/30 border-green-400 opacity-60' 
                    : 'bg-white/90 border-white shadow-xl'
                  }
                `}
              >
                <span className="text-5xl">{item.icon}</span>
                <span className={`text-xs font-bold ${isPacked ? 'text-green-700' : 'text-slate-700'}`}>
                  {isHebrew ? item.label.he : item.label.en}
                </span>

                <AnimatePresence>
                  {isPacked && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Ready Celebration */}
        <AnimatePresence>
          {isReady && (
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              className="absolute inset-x-0 bottom-10 flex flex-col items-center pointer-events-none"
            >
              <div className="bg-white rounded-full px-8 py-4 shadow-2xl border-4 border-orange-500 text-2xl font-black text-orange-600 animate-bounce">
                {isHebrew ? 'מוכנים לצאת! 🚀' : 'Ready to Go! 🚀'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/30 transition-all backdrop-blur-sm"
      >
        ✕
      </button>

      {/* Decorative Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0], 
              opacity: [0, 0.3, 0],
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 200]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.5
            }}
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full blur-md"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BackpackHero;

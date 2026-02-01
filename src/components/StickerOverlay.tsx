import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const STICKERS = ['😊', '💪', '🥳', '❤️', '🌟', '🧘', '🙌', '🐰', '🥕', '✨'];

interface StickerOverlayProps {
  imageUri: string;
  onSave: (finalImage: string, stickers: string[]) => void;
  onCancel: () => void;
  language?: 'he' | 'en';
}

export const StickerOverlay: React.FC<StickerOverlayProps> = ({ imageUri, onSave, onCancel, language = 'he' }) => {
  const [placedStickers, setPlacedStickers] = useState<{id: number, icon: string, x: number, y: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHebrew = language === 'he';

  const addSticker = (icon: string) => {
    setPlacedStickers([...placedStickers, { 
      id: Date.now(), 
      icon,
      x: 0,
      y: 0
    }]);
    Haptics.impact({ style: ImpactStyle.Light });
  };

  const removeSticker = (id: number) => {
    setPlacedStickers(placedStickers.filter(s => s.id !== id));
    Haptics.impact({ style: ImpactStyle.Medium });
  };

  const handleExport = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const finalImage = canvas.toDataURL('image/jpeg', 0.8);
      onSave(finalImage, placedStickers.map(s => s.icon));
    } catch (err) {
      console.error("Failed to export stickered image", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom"
    >
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button 
          onClick={onCancel}
          className="text-white bg-white/10 px-4 py-2 rounded-full font-bold"
        >
          {isHebrew ? 'ביטול' : 'Cancel'}
        </button>
        <h3 className="text-xl font-black text-white">
          {isHebrew ? 'הוסף מדבקות!' : 'Add Stickers!'}
        </h3>
        <button 
          onClick={handleExport}
          className="text-white bg-indigo-600 px-6 py-2 rounded-full font-black shadow-lg shadow-indigo-500/30"
        >
          {isHebrew ? 'שמור ✨' : 'Save ✨'}
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[3/4] max-w-md bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20"
      >
        {/* תמונת המקור */}
        <img src={imageUri} alt="Selfie" className="w-full h-full object-cover" />

        {/* שכבת המדבקות שנגררו */}
        <AnimatePresence>
          {placedStickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              drag
              dragMomentum={false}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute text-6xl cursor-grab active:cursor-grabbing touch-none select-none"
              style={{
                top: '40%',
                left: '40%',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}
              onDoubleClick={() => removeSticker(sticker.id)}
            >
              {sticker.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md mt-6">
        <p className="text-white/60 text-center text-xs mb-3 font-bold">
          {isHebrew ? 'לחץ על מדבקה כדי להוסיף, וגרור אותה לתמונה' : 'Tap a sticker to add, drag to position'}
          <br/>
          {isHebrew ? '(לחיצה כפולה למחיקה)' : '(Double tap to remove)'}
        </p>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar items-end pt-10">
          {STICKERS.map((icon) => {
            const isSpecial = icon === '💪';
            return (
              <div key={icon} className="relative flex flex-col items-center">
                {isSpecial && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shadow-lg z-20 mb-2"
                  >
                    {isHebrew ? 'משימת היום: מצא רגע שבו הרגשת גיבור!' : 'Daily Task: Find a moment you felt like a hero!'}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rotate-45" />
                  </motion.div>
                )}
                
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  animate={isSpecial ? {
                    boxShadow: [
                      "0 0 0px rgba(250, 204, 21, 0)",
                      "0 0 20px rgba(250, 204, 21, 0.6)",
                      "0 0 0px rgba(250, 204, 21, 0)"
                    ],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={isSpecial ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                  onClick={() => addSticker(icon)}
                  className={`flex-shrink-0 w-16 h-16 bg-white/10 backdrop-blur-md border-2 rounded-2xl flex items-center justify-center text-4xl shadow-lg ${
                    isSpecial ? 'border-yellow-400' : 'border-white/20'
                  }`}
                >
                  {icon}
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

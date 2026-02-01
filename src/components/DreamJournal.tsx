import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

interface DreamIcon {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
}

const DREAM_ICONS: DreamIcon[] = [
  { id: 'pleasant', emoji: '☁️', label: 'חלום נעים', labelEn: 'Pleasant Dream' },
  { id: 'adventure', emoji: '🐉', label: 'דרקון/הרפתקה', labelEn: 'Dragon/Adventure' },
  { id: 'space', emoji: '🚀', label: 'חלל', labelEn: 'Space' },
  { id: 'magic', emoji: '🦄', label: 'קסם', labelEn: 'Magic' },
  { id: 'water', emoji: '🌊', label: 'מים', labelEn: 'Water' },
  { id: 'scary', emoji: '👻', label: 'קצת מפחיד', labelEn: 'A bit scary' },
];

interface DreamJournalProps {
  language: Language;
  onClose: () => void;
  onSelectDream: (dream: DreamIcon) => void;
  onTalkToBunny: (dream: DreamIcon) => void;
}

export const DreamJournal: React.FC<DreamJournalProps> = ({ 
  language, 
  onClose, 
  onSelectDream,
  onTalkToBunny
}) => {
  const [selectedDream, setSelectedDream] = useState<DreamIcon | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleSelect = (dream: DreamIcon) => {
    setSelectedDream(dream);
    setShowSparkles(true);
    
    // Save to localStorage
    try {
      const saved = localStorage.getItem('dream_history') || '[]';
      const history = JSON.parse(saved);
      history.push({
        id: dream.id,
        emoji: dream.emoji,
        label: dream.label,
        date: new Date().toISOString()
      });
      localStorage.setItem('dream_history', JSON.stringify(history.slice(-30)));
    } catch (e) {
      console.error("Failed to save dream history", e);
    }

    onSelectDream(dream);
    
    // Reset sparkles after animation
    setTimeout(() => setShowSparkles(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div className="bg-white/90 rounded-[40px] p-8 max-w-md w-full shadow-2xl border-4 border-purple-200 relative overflow-hidden text-center">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl">🌙</div>
          <div className="absolute bottom-10 right-10 text-6xl">⭐</div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-purple-600 mb-2">
          {language === 'he' ? 'יומן החלומות שלי' : 'My Dream Journal'}
        </h2>
        <p className="text-gray-500 mb-8">
          {language === 'he' ? 'מה חלמת הלילה?' : 'What did you dream tonight?'}
        </p>

        {/* Dream Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {DREAM_ICONS.map((dream) => (
            <motion.button
              key={dream.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(dream)}
              className={`relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                selectedDream?.id === dream.id 
                  ? 'border-purple-500 bg-purple-50 shadow-inner' 
                  : 'border-gray-100 bg-white hover:border-purple-200'
              }`}
            >
              <span className="text-4xl mb-2">{dream.emoji}</span>
              <span className="text-[10px] font-bold text-gray-600 leading-tight">
                {language === 'he' ? dream.label : dream.labelEn}
              </span>

              {/* Sparkles Animation */}
              <AnimatePresence>
                {selectedDream?.id === dream.id && showSparkles && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          x: (Math.random() - 0.5) * 100,
                          y: (Math.random() - 0.5) * 100
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute text-yellow-400 pointer-events-none"
                      >
                        ✨
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Action Button */}
        <AnimatePresence>
          {selectedDream && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => onTalkToBunny(selectedDream)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transform transition-transform active:scale-95"
              >
                <span>💬</span>
                {language === 'he' ? 'ספר לארנב על החלום' : 'Tell Bunny about the dream'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DreamJournal;

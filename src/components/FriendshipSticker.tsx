import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';
import { playChimeSound } from './AudioPlayer';

interface FriendshipStickerProps {
  language: Language;
  onClose: () => void;
  onComplete?: (actionId: string) => void;
}

const SOCIAL_ACTIONS = [
  { id: 'share', emoji: '🤝', label: { he: 'חלקנו בצעצוע', en: 'Shared a toy' } },
  { id: 'run', emoji: '🏃', label: { he: 'רצנו יחד', en: 'Ran together' } },
  { id: 'blocks', emoji: '🧱', label: { he: 'בנינו בקוביות', en: 'Built with blocks' } },
  { id: 'hello', emoji: '👋', label: { he: 'אמרתי שלום', en: 'Said hello' } },
  { id: 'talk', emoji: '🗣️', label: { he: 'דיברנו', en: 'Talked' } },
];

export const FriendshipSticker: React.FC<FriendshipStickerProps> = ({ language, onClose, onComplete }) => {
  const isHebrew = language === 'he';
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSelectAction = (id: string) => {
    if (selectedAction) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    playChimeSound(audioContextRef.current, 0.5);

    setSelectedAction(id);
    setShowAnimation(true);

    // Save to localStorage
    const milestone = {
      id,
      date: new Date().toISOString(),
      label: SOCIAL_ACTIONS.find(a => a.id === id)?.label[language === 'he' ? 'he' : 'en']
    };
    const saved = JSON.parse(localStorage.getItem('social_milestones') || '[]');
    localStorage.setItem('social_milestones', JSON.stringify([...saved, milestone]));

    setTimeout(() => {
      if (onComplete) onComplete(id);
      // We don't close immediately to let the animation finish if desired, 
      // but usually these components close after selection in this app.
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-300 to-blue-500"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-50 p-2"
      >
        ✕
      </button>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-4xl font-black text-white drop-shadow-md mb-2">
          {isHebrew ? 'זמן חברים!' : 'Friend Time!'}
        </h2>
        <p className="text-white/90 font-bold text-lg">
          {isHebrew ? 'מה עשינו יחד היום?' : 'What did we do together today?'}
        </p>
      </div>

      {/* Bunny Friends Visual */}
      <div className="relative w-full max-w-md h-64 flex items-end justify-center gap-2 mb-12">
        <div className="w-48 h-48 relative z-10">
          <BunnyLottie animation="idle" />
        </div>
        <div className="w-32 h-32 relative z-10 mb-2 transform scale-x-[-1]">
          <BunnyLottie animation="idle" />
        </div>
        
        {/* Grass platform */}
        <div className="absolute bottom-0 w-64 h-8 bg-green-500/30 blur-xl rounded-full" />
      </div>

      {/* Double Heart Animation Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <div className="fixed inset-0 pointer-events-none z-[610] flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              <motion.span
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: -10, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-8xl"
              >
                ❤️
              </motion.span>
              <motion.span
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 10, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-8xl"
              >
                ❤️
              </motion.span>
              
              {/* Merged Heart */}
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1.2], 
                  opacity: [0, 1, 1],
                  filter: ["blur(10px)", "blur(0px)", "blur(0px)"]
                }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute text-9xl drop-shadow-[0_0_30px_rgba(255,20,147,0.8)] friendship-glow"
              >
                💖
              </motion.span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Selection Grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md px-4 relative z-10">
        {SOCIAL_ACTIONS.map((action) => (
          <motion.button
            key={action.id}
            whileHover={!selectedAction ? { scale: 1.1 } : {}}
            whileTap={!selectedAction ? { scale: 0.9 } : {}}
            onClick={() => handleSelectAction(action.id)}
            disabled={!!selectedAction}
            className={`flex flex-col items-center p-4 rounded-3xl transition-all shadow-lg ${
              selectedAction === action.id
                ? 'bg-white scale-110 ring-4 ring-yellow-300'
                : selectedAction
                ? 'bg-white/20 opacity-50'
                : 'bg-white/90 hover:bg-white'
            }`}
          >
            <span className="text-5xl mb-2">{action.emoji}</span>
            <span className="text-xs font-black text-gray-800 text-center leading-tight">
              {isHebrew ? action.label.he : action.label.en}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 text-white/60 font-medium text-sm">
        {isHebrew ? 'כל שיתוף פעולה הוא הצלחה גדולה! ✨' : 'Every collaboration is a big success! ✨'}
      </div>
    </motion.div>
  );
};

export default FriendshipSticker;

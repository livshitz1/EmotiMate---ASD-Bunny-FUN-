import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share } from '@capacitor/share';
import { Language, Photo } from '../types';

interface Highlight {
  id: string;
  emoji: string;
  label: string;
  date: string;
}

interface GrandparentsShareProps {
  language: Language;
  photos: Photo[];
  onClose: () => void;
}

const GRATITUDE_ITEMS: Record<string, { emoji: string; he: string; en: string }> = {
  food: { emoji: '🍕', he: 'אוכל טעים', en: 'Yummy food' },
  sun: { emoji: '☀️', he: 'שמש נעימה', en: 'Warm sun' },
  hug: { emoji: '🫂', he: 'חיבוק', en: 'A hug' },
  toy: { emoji: '🧸', he: 'צעצוע', en: 'A toy' },
  trip: { emoji: '🌳', he: 'טיול', en: 'A walk' },
};

export const GrandparentsShare: React.FC<GrandparentsShareProps> = ({ language, photos, onClose }) => {
  const isHebrew = language === Language.HEBREW;
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const gratitudeHistory = JSON.parse(localStorage.getItem('emotimate_gratitude_history') || '[]');
    const pastWeek = gratitudeHistory.slice(-7).map((h: any) => ({
      id: h.id,
      emoji: GRATITUDE_ITEMS[h.id]?.emoji || '✨',
      label: isHebrew ? GRATITUDE_ITEMS[h.id]?.he : GRATITUDE_ITEMS[h.id]?.en,
      date: h.date
    }));
    setHighlights(pastWeek);
  }, [isHebrew]);

  const handleShare = async () => {
    if (!selectedHighlight) return;

    const message = isHebrew 
      ? `סבא וסבתא היקרים! תראו מה הצלחתי לעשות היום יחד עם הארנב שלי: ${selectedHighlight.label} ${selectedHighlight.emoji}. אני כל כך גאה בעצמי ורציתי שתדעו!`
      : `Dear Grandma and Grandpa! Look what I achieved today with my bunny: ${selectedHighlight.label} ${selectedHighlight.emoji}. I'm so proud of myself and wanted you to know!`;

    try {
      setIsSharing(true);
      const shareData: any = {
        title: isHebrew ? 'ההצלחה שלי' : 'My Success',
        text: message,
      };

      if (selectedPhoto) {
        shareData.files = [selectedPhoto.url];
      }

      await Share.share(shareData);
      onClose();
    } catch (e) {
      console.error('Error sharing:', e);
      setIsSharing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-pink-50/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden my-auto">
        {/* Floating Hearts Animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{ 
              y: -100 - Math.random() * 200, 
              x: (Math.random() - 0.5) * 100,
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: i * 0.5
            }}
            className="absolute bottom-0 left-1/2 text-2xl pointer-events-none"
          >
            💖
          </motion.div>
        ))}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-pink-300 hover:text-pink-500 text-2xl p-2 z-10"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🏡</div>
          <h2 className="text-3xl font-black text-pink-600">
            {isHebrew ? 'לסבא וסבתא' : 'To Grandparents'}
          </h2>
          <p className="text-pink-400 font-bold">
            {isHebrew ? 'שתפו רגע של נחת' : 'Share a moment of joy'}
          </p>
        </div>

        {/* Success Selection */}
        <div className="mb-6">
          <p className="text-gray-500 font-bold mb-3 text-sm px-1">
            {isHebrew ? 'איזו הצלחה נשתף?' : 'Which success to share?'}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {highlights.map((h, idx) => (
              <motion.button
                key={`${h.id}-${idx}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedHighlight(h)}
                className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedHighlight?.date === h.date
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className="text-3xl">{h.emoji}</span>
                <span className="text-[10px] font-black text-gray-700">{h.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Photo Selection */}
        <div className="mb-8">
          <p className="text-gray-500 font-bold mb-3 text-sm px-1 flex justify-between">
            <span>{isHebrew ? 'להוסיף סלפי?' : 'Add a selfie?'}</span>
            {selectedPhoto && (
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="text-pink-500 text-xs underline"
              >
                {isHebrew ? 'ביטול צילום' : 'Remove photo'}
              </button>
            )}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {photos.length > 0 ? (
              photos.map((p) => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPhoto(p)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-4 transition-all ${
                    selectedPhoto?.id === p.id
                      ? 'border-pink-500 scale-105'
                      : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={p.url} className="w-full h-full object-cover" alt="Selfie" />
                </motion.button>
              ))
            ) : (
              <div className="w-full py-4 text-center text-gray-300 text-xs italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                {isHebrew ? 'אין עדיין סלפי באלבום' : 'No selfies in album yet'}
              </div>
            )}
          </div>
        </div>

        <motion.button
          disabled={!selectedHighlight}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className={`w-full py-5 rounded-[24px] text-xl font-black shadow-xl flex items-center justify-center gap-3 transition-all ${
            selectedHighlight 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <motion.span 
            animate={selectedHighlight ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-3xl"
          >
            💖
          </motion.span>
          <span>{isHebrew ? 'שלח לסבא וסבתא' : 'Send to Grandparents'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GrandparentsShare;

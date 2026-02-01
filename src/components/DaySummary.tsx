import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';

interface DaySummaryProps {
  language: Language;
  onClose: () => void;
  onSave?: (summary: any) => void;
}

const EXPERIENCES = [
  { id: 'art', emoji: '🎨', label: { he: 'יצרתי משהו', en: 'I created something' } },
  { id: 'yard', emoji: '⚽', label: { he: 'שיחקתי בחצר', en: 'I played outside' } },
  { id: 'food', emoji: '🍎', label: { he: 'אכלתי משהו טעים', en: 'I ate something tasty' } },
  { id: 'puzzle', emoji: '🧩', label: { he: 'פתרתי פאזל', en: 'I solved a puzzle' } },
  { id: 'friend', emoji: '👫', label: { he: 'שיחקתי עם חבר', en: 'I played with a friend' } },
];

export const DaySummary: React.FC<DaySummaryProps> = ({ language, onClose, onSave }) => {
  const isHebrew = language === 'he';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const toggleExperience = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      if (image.dataUrl) {
        setPhoto(image.dataUrl);
      }
    } catch (e) {
      console.error("Camera error", e);
    }
  };

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const summary = {
      date: today,
      experiences: selectedIds,
      photo: photo,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage
    const savedSummaries = JSON.parse(localStorage.getItem('daily_summaries') || '{}');
    savedSummaries[today] = summary;
    localStorage.setItem('daily_summaries', JSON.stringify(savedSummaries));

    setIsSaved(true);
    if (onSave) onSave(summary);

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-slate-900 flex flex-col items-center justify-start p-6 overflow-y-auto"
    >
      {/* Background/Environment */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 pt-10 summary-card">
        <header className="text-center">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {isHebrew ? 'איך עבר היום?' : 'How was your day?'}
          </h2>
          <p className="text-gray-600 font-bold">
            {isHebrew ? 'ספר לי על הדברים הכיפיים שעשית!' : 'Tell me about the fun things you did!'}
          </p>
        </header>

        {/* Bunny sitting on rug/sofa area */}
        <div className="relative w-full aspect-video flex items-center justify-center">
          {/* Virtual "Rug" */}
          <div className="absolute bottom-4 w-4/5 h-12 bg-amber-800/20 rounded-[100%] blur-xl" />
          <div className="absolute bottom-6 w-3/4 h-16 bg-gradient-to-r from-orange-200/50 to-amber-200/50 rounded-3xl border-b-4 border-amber-600/20" />
          
          <div className="relative z-10 w-48 h-48">
            <BunnyLottie animation="idle" />
          </div>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {EXPERIENCES.map((exp) => (
            <motion.button
              key={exp.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleExperience(exp.id)}
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all experience-icon ${
                selectedIds.includes(exp.id)
                  ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/10'
                  : 'bg-white/40 border-white/20 hover:bg-white/60'
              }`}
            >
              <span className="text-4xl mb-2">{exp.emoji}</span>
              <span className="text-[10px] text-gray-700 font-bold leading-tight text-center">
                {isHebrew ? exp.label.he : exp.label.en}
              </span>
              {selectedIds.includes(exp.id) && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs border-2 border-white shadow-md"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}

          {/* Photo Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTakePhoto}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all experience-icon ${
              photo 
                ? 'bg-blue-500/20 border-blue-400 border-solid' 
                : 'bg-white/40 border-white/20 hover:bg-white/60'
            }`}
          >
            {photo ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <img src={photo} alt="Daily" className="w-12 h-12 object-cover rounded-lg mb-1" />
                <span className="text-[10px] text-gray-700 font-bold">{isHebrew ? 'צולם!' : 'Photo Taken!'}</span>
              </div>
            ) : (
              <>
                <span className="text-4xl mb-2">📸</span>
                <span className="text-[10px] text-gray-700 font-bold leading-tight">
                  {isHebrew ? 'הוסף תמונה' : 'Add Photo'}
                </span>
              </>
            )}
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={selectedIds.length === 0 && !photo}
            className={`w-full py-4 rounded-2xl text-xl font-black shadow-xl flex items-center justify-center gap-3 transition-all ${
              isSaved 
                ? 'bg-green-500 text-white' 
                : (selectedIds.length > 0 || photo)
                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-200'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaved ? (
              <>
                <span>{isHebrew ? 'נשמר בהצלחה!' : 'Saved!'}</span>
                <span>✨</span>
              </>
            ) : (
              <>
                <span>{isHebrew ? 'סיום ושמירה' : 'Finish & Save'}</span>
                <span>⭐</span>
              </>
            )}
          </motion.button>

          <button 
            onClick={onClose}
            className="w-full py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
          >
            {isHebrew ? 'ביטול' : 'Cancel'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 z-[700] pointer-events-none flex items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 600, 
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute text-3xl"
              >
                {['⭐', '🌟', '✨', '💖'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DaySummary;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share } from '@capacitor/share';
import { Language } from '../types';
import { getTeacherGuideText, TeacherGuide } from './TeacherGuide';

interface Highlight {
  id: string;
  emoji: string;
  label: string;
  date: string;
}

interface TeacherShareProps {
  language: Language;
  onClose: () => void;
  onShareSuccess?: () => void;
}

const GRATITUDE_ITEMS: Record<string, { emoji: string; he: string; en: string }> = {
  food: { emoji: '🍕', he: 'אוכל טעים', en: 'Yummy food' },
  sun: { emoji: '☀️', he: 'שמש נעימה', en: 'Warm sun' },
  hug: { emoji: '🫂', he: 'חיבוק', en: 'A hug' },
  toy: { emoji: '🧸', he: 'צעצוע', en: 'A toy' },
  trip: { emoji: '🌳', he: 'טיול', en: 'A walk' },
};

export const TeacherShare: React.FC<TeacherShareProps> = ({ language, onClose, onShareSuccess }) => {
  const isHebrew = language === 'he';
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [gateQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  });

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

  const handleCopyGuide = async () => {
    const text = getTeacherGuideText(language);
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (!selectedHighlight) return;

    const message = isHebrew 
      ? `היי! רציתי לשתף אותך בהצלחה שלי השבוע יחד עם הארנב: ${selectedHighlight.label} ${selectedHighlight.emoji}!`
      : `Hi! I wanted to share my success this week with the bunny: ${selectedHighlight.label} ${selectedHighlight.emoji}!`;

    try {
      setIsSharing(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Animation time
      await Share.share({
        title: isHebrew ? 'ההצלחה שלי השבוע' : 'My Success This Week',
        text: message,
        dialogTitle: isHebrew ? 'שתף עם המורה' : 'Share with Teacher',
      });
      if (onShareSuccess) onShareSuccess();
      onClose();
    } catch (e) {
      console.error('Error sharing:', e);
      setIsSharing(false);
    }
  };

  const checkGate = () => {
    if (parseInt(gateAnswer) === gateQuestion.answer) {
      handleShare();
    } else {
      alert(isHebrew ? 'תשובה לא נכונה, נסה שוב' : 'Wrong answer, try again');
      setGateAnswer('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl p-2"
        >
          ✕
        </button>

        <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">
          {isHebrew ? 'שתף עם המורה' : 'Share with Teacher'}
        </h2>
        <p className="text-gray-500 font-bold mb-8 text-center text-sm">
          {isHebrew ? 'בחר הצלחה אחת מהשבוע שתרצה להראות' : 'Pick one success from the week to show'}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {highlights.length > 0 ? (
            highlights.map((h, idx) => (
              <motion.button
                key={`${h.id}-${idx}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedHighlight(h)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedHighlight?.date === h.date
                    ? `border-blue-500 bg-blue-50 ${isSharing ? 'share-success-animation' : ''}`
                    : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                }`}
              >
                <span className="text-4xl">{h.emoji}</span>
                <span className="text-[10px] font-black text-gray-700 text-center uppercase tracking-wider">{h.label}</span>
                <span className="text-[8px] text-gray-400">{h.date}</span>
              </motion.button>
            ))
          ) : (
            <div className="col-span-2 py-10 text-center text-gray-300 italic">
              {isHebrew ? 'עוד לא נאספו הצלחות השבוע...' : 'No successes captured yet this week...'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            disabled={!selectedHighlight}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowParentGate(true)}
            className={`w-full py-4 rounded-2xl text-lg font-black shadow-xl flex items-center justify-center gap-3 transition-all ${
              selectedHighlight 
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-200' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>✈️</span>
            <span>{isHebrew ? 'שלח למורה' : 'Send to Teacher'}</span>
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyGuide}
              className="flex-1 py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <span>📋</span>
              <span>{showCopySuccess 
                ? (isHebrew ? 'הועתק!' : 'Copied!') 
                : (isHebrew ? 'העתק הסבר' : 'Copy Guide')}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGuide(!showGuide)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <span>ℹ️</span>
              <span>{isHebrew ? 'צפה בהסבר' : 'View Guide'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Teacher Guide Modal Overlay */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-6 bottom-6 z-[900] max-w-md mx-auto"
          >
            <div className="bg-white rounded-3xl p-2 shadow-2xl border-4 border-blue-500">
              <div className="relative">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1 text-gray-500"
                >
                  ✕
                </button>
                <TeacherGuide language={language} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parent Gate Modal */}
      <AnimatePresence>
        {showParentGate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[800] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl text-center">
              <h3 className="text-xl font-black text-gray-800 mb-4">
                {isHebrew ? 'אישור הורים' : 'Parent Approval'}
              </h3>
              <p className="text-gray-500 font-bold mb-6 text-sm">
                {isHebrew ? `כמה זה ${gateQuestion.a} ועוד ${gateQuestion.b}?` : `What is ${gateQuestion.a} + ${gateQuestion.b}?`}
              </p>
              <input 
                type="number"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                autoFocus
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 text-center text-2xl font-black mb-6 outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowParentGate(false)}
                  className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600"
                >
                  {isHebrew ? 'ביטול' : 'Cancel'}
                </button>
                <button 
                  onClick={checkGate}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg"
                >
                  {isHebrew ? 'אישור' : 'OK'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherShare;

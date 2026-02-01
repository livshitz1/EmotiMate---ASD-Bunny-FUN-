import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';
import { translate } from '../i18n/translations';
import { playCheeringSound } from './AudioPlayer';

interface DayData {
  date: string;
  dayName: string;
  gratitudeEmoji?: string;
  gratitudeLabel?: string;
  stars: number;
  photos: string[];
}

interface WeeklySuccessAlbumProps {
  language: Language;
  onClose: () => void;
  onShareWithTeacher?: () => void;
  onShareWithGrandparents?: () => void;
}

const GRATITUDE_ITEMS: Record<string, { emoji: string; he: string; en: string }> = {
  food: { emoji: '🍕', he: 'אוכל טעים', en: 'Yummy food' },
  sun: { emoji: '☀️', he: 'שמש נעימה', en: 'Warm sun' },
  hug: { emoji: '🫂', he: 'חיבוק', en: 'A hug' },
  toy: { emoji: '🧸', he: 'צעצוע', en: 'A toy' },
  trip: { emoji: '🌳', he: 'טיול', en: 'A walk' },
};

export const WeeklySuccessAlbum: React.FC<WeeklySuccessAlbumProps> = ({ 
  language, 
  onClose, 
  onShareWithTeacher,
  onShareWithGrandparents 
}) => {
  const isHebrew = language === 'he';
  const [currentPage, setCurrentPage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Fetch data for the last 7 days
    const data: DayData[] = [];
    const today = new Date();
    
    // Load existing data from localStorage
    const summaries = JSON.parse(localStorage.getItem('daily_summaries') || '{}');
    const gratitudeHistory = JSON.parse(localStorage.getItem('emotimate_gratitude_history') || '[]');
    const photos = JSON.parse(localStorage.getItem('photo_album') || '[]');
    const starHistory = JSON.parse(localStorage.getItem('emotimate_star_history') || '{}');

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayName = d.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { weekday: 'long' });
      
      // Find gratitude for this day
      const dailyGrat = gratitudeHistory.find((h: any) => h.date === dateStr);
      const gratitude = dailyGrat ? GRATITUDE_ITEMS[dailyGrat.id] : undefined;
      
      // Find photos for this day
      const dayPhotos = photos
        .filter((p: any) => p.timestamp?.startsWith(dateStr))
        .map((p: any) => p.uri);

      // Stars for this day (we'll need to track this better, but let's use what we have)
      const stars = starHistory[dateStr] || (summaries[dateStr] ? 10 : 0);

      data.push({
        date: dateStr,
        dayName,
        gratitudeEmoji: gratitude?.emoji,
        gratitudeLabel: gratitude ? (isHebrew ? gratitude.he : gratitude.en) : undefined,
        stars,
        photos: dayPhotos
      });
    }
    setWeeklyData(data);
  }, [isHebrew]);

  const handleNext = () => {
    if (currentPage < weeklyData.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleCelebrate = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    playCheeringSound(audioContextRef.current);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);
  };

  const pageVariants = {
    initial: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      transition: { duration: 0.6, ease: "easeIn" }
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl z-[700] p-2"
      >
        ✕
      </button>

      <div className="relative w-full max-w-2xl aspect-[4/3] perspective-1000">
        <AnimatePresence mode="wait" custom={currentPage}>
          {currentPage === 0 ? (
            // Cover Page
            <motion.div
              key="cover"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 bg-[#5d4037] rounded-r-3xl shadow-2xl border-l-[12px] border-[#3e2723] flex flex-col items-center justify-center text-center p-8 origin-left"
            >
              <div className="w-48 h-48 mb-6">
                <BunnyLottie animation="excited" />
              </div>
              <h1 className="text-4xl font-black text-amber-100 mb-4 drop-shadow-md">
                {isHebrew ? 'אלבום ההצלחות שלי' : 'My Success Album'}
              </h1>
              <p className="text-amber-200/60 font-bold uppercase tracking-widest text-sm">
                {isHebrew ? 'השבוע שהיה' : 'The Past Week'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-12 px-8 py-3 bg-amber-500 text-white rounded-full font-black text-xl shadow-lg"
              >
                {isHebrew ? 'פתח את האלבום' : 'Open Album'}
              </motion.button>
            </motion.div>
          ) : currentPage <= weeklyData.length ? (
            // Day Page
            <motion.div
              key={`day-${currentPage}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 success-page flex flex-col p-8 origin-left overflow-hidden"
            >
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-amber-900 capitalize">
                    {weeklyData[currentPage - 1].dayName}
                  </h2>
                  <p className="text-amber-700 font-bold text-sm">
                    {weeklyData[currentPage - 1].date}
                  </p>
                </div>
                <div className="bg-amber-500 text-white px-3 py-1 rounded-full font-black shadow-sm">
                  ⭐ {weeklyData[currentPage - 1].stars}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-6">
                {/* Left Column: Gratitude */}
                <div className="bg-white/50 rounded-2xl p-4 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-black text-amber-800 mb-2">
                    {isHebrew ? 'הודיתי על:' : 'I was thankful for:'}
                  </h3>
                  {weeklyData[currentPage - 1].gratitudeEmoji ? (
                    <>
                      <span className="text-6xl mb-2">{weeklyData[currentPage - 1].gratitudeEmoji}</span>
                      <span className="text-xs font-bold text-amber-900">{weeklyData[currentPage - 1].gratitudeLabel}</span>
                    </>
                  ) : (
                    <span className="text-amber-300 italic text-xs">{isHebrew ? 'יום שקט...' : 'A quiet day...'}</span>
                  )}
                </div>

                {/* Right Column: Photos */}
                <div className="bg-white/50 rounded-2xl p-2 border-2 border-amber-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <h3 className="absolute top-2 left-0 right-0 text-center text-[10px] font-black text-amber-800 z-10">
                    {isHebrew ? 'רגעים שתיעדתי:' : 'Captured moments:'}
                  </h3>
                  {weeklyData[currentPage - 1].photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 w-full mt-4">
                      {weeklyData[currentPage - 1].photos.slice(0, 4).map((uri, idx) => (
                        <div key={idx} className="aspect-square bg-slate-200 rounded shadow-sm overflow-hidden border-2 border-white rotate-[2deg]">
                          <img src={uri} alt="Moment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <span className="text-5xl mb-2">📸</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between items-center">
                <button onClick={handlePrev} className="text-amber-800 font-black flex items-center gap-1">
                  {isHebrew ? '← הקודם' : '← Back'}
                </button>
                
                {currentPage === weeklyData.length ? (
                  <div className="flex gap-2">
                    {onShareWithGrandparents && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onShareWithGrandparents}
                        className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full font-black shadow-sm flex items-center gap-2"
                        title={isHebrew ? 'שלח לסבא וסבתא' : 'Send to Grandparents'}
                      >
                        <span className="text-lg">💖</span>
                      </motion.button>
                    )}
                    {onShareWithTeacher && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onShareWithTeacher}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-black shadow-sm flex items-center gap-2"
                      >
                        <span>✈️</span>
                        <span className="text-xs">{isHebrew ? 'שתף' : 'Share'}</span>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCelebrate}
                      className="px-6 py-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full font-black shadow-lg"
                    >
                      🎉 {isHebrew ? 'חגיגה!' : 'Celebrate!'}
                    </motion.button>
                  </div>
                ) : (
                  <button onClick={handleNext} className="text-amber-800 font-black flex items-center gap-1">
                    {isHebrew ? 'הבא →' : 'Next →'}
                  </button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Confetti Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <div className="confetti-canvas">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -20,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  ease: "linear",
                  repeat: 0
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#ff4081', '#3f51b5', '#4caf50', '#ffeb3b', '#ff5722'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <h2 className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                {isHebrew ? 'אלוף!' : 'Champion!'}
              </h2>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .success-page {
          background-color: #fffdf0;
          background-image: radial-gradient(#f7f1d5 1px, transparent 1px);
          background-size: 20px 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border-radius: 0 30px 30px 0;
        }
        .confetti-canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1000;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
};

export default WeeklySuccessAlbum;

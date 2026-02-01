import React from 'react';
import { Language } from '../types';

interface DailyProgressProps {
  completedTasks: number;
  totalTasks: number;
  bunnyMood: string;
  language: Language;
}

export default function DailyProgress({ 
  completedTasks = 0, 
  totalTasks = 4, 
  bunnyMood = 'רגוע',
  language = Language.HEBREW 
}: DailyProgressProps) {
  const safeCompleted = completedTasks || 0;
  const safeTotal = totalTasks || 0;
  const progress = safeTotal > 0 ? (safeCompleted / safeTotal) * 100 : 0;
  const isHebrew = language === Language.HEBREW;

  return (
    <div className="bg-[#2b2b2b] p-5 rounded-2xl mt-5 shadow-xl border border-white/10" dir={isHebrew ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
        <span>📅</span>
        {isHebrew ? 'התקדמות יומית' : 'Daily Progress'}
      </h3>
      
      <p className="text-gray-300 text-sm mb-2 font-medium">
        {isHebrew 
          ? `משימות שבוצעו: ${safeCompleted} מתוך ${safeTotal}`
          : `Tasks completed: ${safeCompleted} out of ${safeTotal}`}
      </p>

      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-4 shadow-inner border border-white/5">
        <div 
          className="h-full bg-[#6aa84f] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(106,168,79,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="space-y-2">
        <p className="text-gray-300 text-sm">
          {isHebrew ? `מצב הארנב היום: ${bunnyMood}` : `Bunny mood today: ${bunnyMood}`}
        </p>
        <p className="text-[#6aa84f] font-bold text-sm animate-pulse">
          {completedTasks === totalTasks 
            ? (isHebrew ? "כל הכבוד! הארנב מאושר 🐰💚" : "Great job! The bunny is happy 🐰💚")
            : (isHebrew ? "המשך ככה! כל צעד קטן חשוב 🌱" : "Keep it up! Every small step counts 🌱")}
        </p>
      </div>
    </div>
  );
}

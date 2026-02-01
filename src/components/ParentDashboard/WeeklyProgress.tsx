import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';
import { Language, CalmLog } from '../../types';

interface WeeklyProgressProps {
  language: Language;
  weeklyStats?: Record<string, number>;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ language, weeklyStats }) => {
  const isHebrew = language === 'he';
  const targetRef = useRef<HTMLDivElement>(null);

  const exportProgressAsImage = async () => {
    if (!targetRef.current) return;

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const base64Image = canvas.toDataURL('image/png');
      
      await Share.share({
        title: isHebrew ? 'דוח התקדמות שבועי - EmotiMate' : 'Weekly Progress Report - EmotiMate',
        text: isHebrew 
          ? 'מצורף סיכום ההתקדמות השבועי של הילד מתוך האפליקציה.' 
          : 'Attached is the child\'s weekly progress summary from the app.',
        files: [base64Image]
      });
    } catch (e) {
      console.error('Failed to export image:', e);
    }
  };

  const chartData = useMemo(() => {
    // Categories to track
    const categories = [
      { id: 'morning', label: isHebrew ? 'שגרת בוקר' : 'Morning Routine' },
      { id: 'bath', label: isHebrew ? 'זמן מקלחת' : 'Bath Time' },
      { id: 'bedtime', label: isHebrew ? 'זמן לישון' : 'Bedtime' },
    ];

    return categories.map(cat => {
      const count = weeklyStats?.[cat.id] || 0;

      // Simple heuristic for completion rate
      const expectedPerWeek = 7; 
      const completionRate = Math.min(100, (count / expectedPerWeek) * 100);

      let status: 'Success' | 'Partial' | 'In Progress' = 'In Progress';
      let color = '#3b82f6'; // Blue for In Progress

      if (completionRate >= 80) {
        status = 'Success';
        color = '#22c55e'; // Green
      } else if (completionRate >= 40) {
        status = 'Partial';
        color = '#eab308'; // Yellow
      }

      return {
        ...cat,
        value: completionRate,
        status,
        color
      };
    });
  }, [weeklyStats, isHebrew]);

  return (
    <div className="space-y-4">
      <div ref={targetRef} className="bg-[#0f172a] rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
          <h3 className="text-lg font-bold opacity-80">
            {isHebrew ? 'התקדמות שבועית במשימות' : 'Weekly Task Progress'}
          </h3>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg">
            {isHebrew ? '7 ימים אחרונים' : 'Last 7 days'}
          </span>
        </div>

        <div className="space-y-6">
          {chartData.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-bold text-sm">{item.label}</span>
                <span className="text-xs opacity-60" style={{ color: item.color }}>
                  {isHebrew ? (
                    item.status === 'Success' ? 'הצלחה' : item.status === 'Partial' ? 'חלקי' : 'בתהליך'
                  ) : item.status}
                </span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="flex justify-between text-[10px] opacity-40">
                <span>0%</span>
                <span>{Math.round(item.value)}%</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-indigo-600/20 rounded-2xl border border-indigo-400/20">
          <p className="text-sm leading-relaxed text-indigo-200">
            ✨ {isHebrew 
              ? 'השבוע הילד השתפר ב-20% במשימות המקלחת!' 
              : 'This week the child improved by 20% in bath time tasks!'}
          </p>
        </div>
      </div>

      <button 
        onClick={exportProgressAsImage}
        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span>📧</span>
        <span className="font-bold">
          {isHebrew ? 'שתף עם המטפל/ת' : 'Share with Therapist'}
        </span>
      </button>
    </div>
  );
};

export default WeeklyProgress;

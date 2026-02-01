import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface DailyActivityTrackerProps {
  completedTasksCount: number;
  lastActivityTime?: Date;
  language: Language;
}

const DailyActivityTracker: React.FC<DailyActivityTrackerProps> = ({ completedTasksCount, lastActivityTime, language }) => {
  const [timeSinceLastActivity, setTimeSinceLastActivity] = useState<string>('');

  useEffect(() => {
    const updateTimeSince = () => {
      if (!lastActivityTime) {
        setTimeSinceLastActivity(translate('lastActivity', language) + ': -');
        return;
      }

      const now = new Date();
      const diffMs = now.getTime() - lastActivityTime.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);

      let timeText = '';
      if (diffMinutes < 1) {
        timeText = language === Language.HEBREW ? 'עכשיו' : language === Language.ENGLISH ? 'Just now' : 'Только что';
      } else if (diffMinutes < 60) {
        timeText = language === Language.HEBREW 
          ? `לפני ${diffMinutes} דקות`
          : language === Language.ENGLISH
          ? `${diffMinutes} minutes ago`
          : `${diffMinutes} минут назад`;
      } else if (diffHours < 24) {
        const remainingMinutes = diffMinutes % 60;
        timeText = language === Language.HEBREW
          ? remainingMinutes > 0 ? `לפני ${diffHours} שעות ו-${remainingMinutes} דקות` : `לפני ${diffHours} שעות`
          : language === Language.ENGLISH
          ? remainingMinutes > 0 ? `${diffHours} hours and ${remainingMinutes} minutes ago` : `${diffHours} hours ago`
          : remainingMinutes > 0 ? `${diffHours} часов и ${remainingMinutes} минут назад` : `${diffHours} часов назад`;
      } else {
        const days = Math.floor(diffHours / 24);
        timeText = language === Language.HEBREW
          ? `לפני ${days} ימים`
          : language === Language.ENGLISH
          ? `${days} days ago`
          : `${days} дней назад`;
      }
      setTimeSinceLastActivity(timeText);
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastActivityTime, language]);

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <div className="text-sm font-semibold text-gray-700">{translate('dailyActivity', language)}</div>
            <div className="text-xs text-gray-500">{completedTasksCount} {translate('tasksCompleted', language)}</div>
          </div>
        </div>
        {lastActivityTime && (
          <div className="text-right">
            <div className="text-xs text-gray-500">{translate('lastActivity', language)}:</div>
            <div className="text-xs font-semibold text-gray-700">{timeSinceLastActivity}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyActivityTracker;

import React, { useState, useEffect } from 'react';
import { TimeOfDay, Language } from '../types';
import { AppSettings } from './Settings';

interface TimeVisualizerProps {
  currentTimeOfDay: TimeOfDay;
  onTimeUpdate?: (timeOfDay: TimeOfDay) => void;
  settings?: AppSettings;
  language?: Language;
  currentTime: Date;
}

const TimeVisualizer: React.FC<TimeVisualizerProps> = ({ currentTimeOfDay, onTimeUpdate, settings, language = Language.HEBREW, currentTime }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = currentTime || new Date();
      
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setTimeString(timeStr);
      
      // Determine time of day
      let newTimeOfDay: TimeOfDay;
      if (hours >= 6 && hours < 12) {
        newTimeOfDay = TimeOfDay.MORNING;
      } else if (hours >= 12 && hours < 17) {
        newTimeOfDay = TimeOfDay.AFTERNOON;
      } else if (hours >= 17 && hours < 22) {
        newTimeOfDay = TimeOfDay.EVENING;
      } else {
        newTimeOfDay = TimeOfDay.NIGHT;
      }
      
      if (onTimeUpdate && newTimeOfDay !== currentTimeOfDay) {
        onTimeUpdate(newTimeOfDay);
      }
    };

    updateTime();
  }, [currentTime, currentTimeOfDay, onTimeUpdate]);

  const getTimeOfDayEmoji = (): string => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 22) return '🌆';
    return '🌙';
  };

  const getTimeOfDayColor = (): string => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return 'from-yellow-100 to-orange-200';
    if (hour >= 12 && hour < 17) return 'from-blue-100 to-cyan-200';
    if (hour >= 17 && hour < 22) return 'from-orange-200 to-pink-200';
    return 'from-indigo-900 to-purple-900';
  };

  const getTimeOfDayLabel = (): string => {
    switch (currentTimeOfDay) {
      case TimeOfDay.MORNING:
        return 'בוקר';
      case TimeOfDay.AFTERNOON:
        return 'צהריים';
      case TimeOfDay.EVENING:
        return 'ערב';
      case TimeOfDay.NIGHT:
        return 'לילה';
      default:
        return '';
    }
  };

  // Calculate progress through the day (0-100%)
  const getDayProgress = (): number => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const totalMinutes = hour * 60 + minute;
    // Day starts at 6 AM (360 minutes) and ends at 10 PM (1320 minutes)
    const dayStart = 6 * 60;
    const dayEnd = 22 * 60;
    const dayLength = dayEnd - dayStart;
    const progress = ((totalMinutes - dayStart) / dayLength) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  // Get recommendation markers for timeline
  const getRecommendations = () => {
    if (!settings || !settings.showRecommendations) return [];
    
    const recommendations: Array<{ time: number; label: string; emoji: string; color: string }> = [];
    const dayStart = 6 * 60; // 6:00 AM in minutes
    const dayEnd = 22 * 60; // 10:00 PM in minutes
    
    // Bedtime recommendation
    if (settings.bedtimeHour) {
      const bedtimeMinutes = settings.bedtimeHour * 60;
      if (bedtimeMinutes >= dayStart && bedtimeMinutes <= dayEnd) {
        const progress = ((bedtimeMinutes - dayStart) / (dayEnd - dayStart)) * 100;
        recommendations.push({
          time: progress,
          label: language === Language.HEBREW ? 'שעת שינה' : language === Language.ENGLISH ? 'Bedtime' : 'Время сна',
          emoji: '🌙',
          color: 'bg-blue-500'
        });
      }
    }
    
    // Pet bedtime recommendation
    if (settings.petBedtimeHour && settings.petBedtimeHour !== settings.bedtimeHour) {
      const petBedtimeMinutes = settings.petBedtimeHour * 60;
      if (petBedtimeMinutes >= dayStart && petBedtimeMinutes <= dayEnd) {
        const progress = ((petBedtimeMinutes - dayStart) / (dayEnd - dayStart)) * 100;
        recommendations.push({
          time: progress,
          label: language === Language.HEBREW ? 'שינה לחיה' : language === Language.ENGLISH ? 'Pet bedtime' : 'Сон питомца',
          emoji: '🐰',
          color: 'bg-green-500'
        });
      }
    }
    
    return recommendations;
  };

  return (
    <div className={`bg-gradient-to-br ${getTimeOfDayColor()} rounded-2xl p-4 shadow-lg border-2 border-white/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{getTimeOfDayEmoji()}</span>
          <div>
            <div className="text-sm font-semibold text-gray-700">{getTimeOfDayLabel()}</div>
            <div className="text-xs text-gray-600">
              {language === Language.HEBREW
                ? new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
                : language === Language.ENGLISH
                ? new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
                : new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800 font-mono">{timeString}</div>
          <div className="text-xs text-gray-600">
            {language === Language.HEBREW ? 'שעון' : language === Language.ENGLISH ? 'Clock' : 'Часы'}
          </div>
        </div>
      </div>
      
      {/* Day Progress Bar with Moving Icon and Recommendations */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-700 mb-1">
          <span>6:00</span>
          <span className="font-semibold">
            {language === Language.HEBREW ? 'התקדמות היום' : language === Language.ENGLISH ? 'Day Progress' : 'Прогресс дня'}
          </span>
          <span>22:00</span>
        </div>
        <div className="relative w-full h-6 bg-white/50 rounded-full overflow-visible">
          {/* Progress Fill */}
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${getDayProgress()}%` }}
          />
          
          {/* Recommendation Markers */}
          {getRecommendations().map((rec, index) => (
            <div
              key={`rec-${index}`}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${rec.time}%` }}
              title={rec.label}
            >
              <div className={`${rec.color} rounded-full p-1 shadow-lg animate-pulse`} style={{ animationDuration: '2s' }}>
                <span className="text-xs">{rec.emoji}</span>
              </div>
              {/* Label below marker */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm border border-gray-200">
                  {rec.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeVisualizer;

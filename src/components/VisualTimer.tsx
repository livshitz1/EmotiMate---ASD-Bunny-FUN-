import React, { useState, useEffect } from 'react';
import { ScheduleItem, Language } from '../types';

interface VisualTimerProps {
  task: ScheduleItem;
  currentTime: Date;
  language: Language;
  isActive?: boolean;
}

const VisualTimer: React.FC<VisualTimerProps> = ({ task, currentTime, language, isActive = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in minutes
  const [totalTime, setTotalTime] = useState<number>(0); // total time until task in minutes
  const [timeString, setTimeString] = useState<string>('');
  const [progress, setProgress] = useState<number>(100); // percentage
  const [colorClass, setColorClass] = useState<string>('bg-green-500'); // Default green

  useEffect(() => {
    const updateTimer = () => {
      // Use currentTime prop which is updated every second from parent
      const now = currentTime || new Date();
      const [taskHour, taskMinute] = task.timeLabel.split(':').map(Number);
      
      // Calculate task time for today
      const taskTimeToday = new Date(now);
      taskTimeToday.setHours(taskHour, taskMinute, 0, 0);
      
      // Calculate task time for tomorrow
      const taskTimeTomorrow = new Date(taskTimeToday);
      taskTimeTomorrow.setDate(taskTimeTomorrow.getDate() + 1);
      
      // Decide which task time to use
      let taskTime = taskTimeToday;
      
      // If task is completed, we should look forward to tomorrow's instance
      if (task.completed) {
        taskTime = taskTimeTomorrow;
      } else {
        // If not completed, check if it's already passed today
        // We only jump to tomorrow if it's "very" late (e.g. more than 12 hours ago)
        // This allows tasks to show as "overdue" during the day
        const diffFromTodayMs = now.getTime() - taskTimeToday.getTime();
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        
        if (diffFromTodayMs > twelveHoursMs) {
          taskTime = taskTimeTomorrow;
        } else {
          taskTime = taskTimeToday;
        }
      }
      
      const diffMs = taskTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      // Calculate total time window (from now until task time + buffer)
      // Use a reference point: if task is more than 2 hours away, use 2 hours as max
      const maxWindow = 120; // 2 hours in minutes
      const actualWindow = Math.min(maxWindow, Math.max(30, diffMinutes + 30)); // At least 30 min window
      
      setTimeRemaining(diffMinutes);
      setTotalTime(actualWindow);
      
      // Calculate progress (100% when far away, 0% when task time arrives)
      // Progress decreases as we get closer to task time
      const progressPercent = diffMinutes < 0 
        ? 0 
        : Math.max(0, Math.min(100, (diffMinutes / actualWindow) * 100));
      setProgress(progressPercent);
      
      // Set color based on time remaining
      if (diffMinutes < 0) {
        // Overdue - red
        setColorClass('bg-red-500');
        const overdueMinutes = Math.abs(diffMinutes);
        if (language === Language.HEBREW) {
          setTimeString(overdueMinutes < 60 ? `איחור ${overdueMinutes} דק'` : `איחור ${Math.floor(overdueMinutes / 60)} שעות`);
        } else if (language === Language.ENGLISH) {
          setTimeString(overdueMinutes < 60 ? `${overdueMinutes}m late` : `${Math.floor(overdueMinutes / 60)}h late`);
        } else {
          setTimeString(overdueMinutes < 60 ? `Опоздание ${overdueMinutes}м` : `Опоздание ${Math.floor(overdueMinutes / 60)}ч`);
        }
      } else if (diffMinutes <= 5) {
        // Less than 5 minutes - red (urgent)
        setColorClass('bg-red-500');
        if (language === Language.HEBREW) {
          setTimeString(diffMinutes === 0 ? 'עכשיו!' : `בעוד ${diffMinutes} דק'`);
        } else if (language === Language.ENGLISH) {
          setTimeString(diffMinutes === 0 ? 'Now!' : `In ${diffMinutes}m`);
        } else {
          setTimeString(diffMinutes === 0 ? 'Сейчас!' : `Через ${diffMinutes}м`);
        }
      } else if (diffMinutes <= 15) {
        // 5-15 minutes - yellow/orange (warning)
        setColorClass('bg-yellow-500');
        if (language === Language.HEBREW) {
          setTimeString(`בעוד ${diffMinutes} דק'`);
        } else if (language === Language.ENGLISH) {
          setTimeString(`In ${diffMinutes}m`);
        } else {
          setTimeString(`Через ${diffMinutes}м`);
        }
      } else {
        // More than 15 minutes - green (plenty of time)
        setColorClass('bg-green-500');
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        if (language === Language.HEBREW) {
          if (hours > 0) {
            setTimeString(mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours} שעות`);
          } else {
            setTimeString(`${diffMinutes} דק'`);
          }
        } else if (language === Language.ENGLISH) {
          if (hours > 0) {
            setTimeString(mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}h`);
          } else {
            setTimeString(`${diffMinutes}m`);
          }
        } else {
          if (hours > 0) {
            setTimeString(mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}ч`);
          } else {
            setTimeString(`${diffMinutes}м`);
          }
        }
      }
    };

    // Initial update
    updateTimer();
  }, [task.id, task.timeLabel, currentTime, language, task.completed]); // Use stable dependencies

  if (task.completed) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
          ✓
        </div>
        <div className="text-sm font-bold text-green-600">
          {language === Language.HEBREW ? 'הושלם' : language === Language.ENGLISH ? 'Completed' : 'Завершено'}
        </div>
      </div>
    );
  }

  // Only show visual timer for active tasks
  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {/* Large Visual Timer */}
      <div className="relative">
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 mx-auto">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              className={`${colorClass} transition-all duration-1000 ease-linear`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${colorClass.replace('bg-', 'text-')}`}>
                {timeString}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-1000 ease-linear rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 text-center mt-1">
          {language === Language.HEBREW 
            ? 'זמן נותר'
            : language === Language.ENGLISH
            ? 'Time remaining'
            : 'Осталось времени'}
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className={`text-lg font-bold ${colorClass.replace('bg-', 'text-')}`}>
          {timeString}
        </div>
        {timeRemaining >= 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {language === Language.HEBREW
              ? `מתחילים ב-${task.timeLabel}`
              : language === Language.ENGLISH
              ? `Starts at ${task.timeLabel}`
              : `Начало в ${task.timeLabel}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTimer;

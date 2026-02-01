import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../types';

interface TaskTimerProps {
  task: ScheduleItem;
  currentTime: Date;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ task, currentTime }) => {
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [isUpcoming, setIsUpcoming] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      // Use current time from prop, but get fresh time for calculation
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
      const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
      const remainingMinutes = Math.abs(diffMinutes) % 60;
      
      if (diffMinutes < 0) {
        setIsOverdue(true);
        setIsUpcoming(false);
        const overdueMinutes = Math.abs(diffMinutes);
        if (overdueMinutes < 60) {
          setTimeUntil(`איחור של ${overdueMinutes} דקות`);
        } else {
          const overdueHours = Math.floor(overdueMinutes / 60);
          setTimeUntil(`איחור של ${overdueHours} שעות`);
        }
      } else if (diffMinutes <= 30) {
        setIsUpcoming(true);
        setIsOverdue(false);
        if (diffMinutes === 0) {
          setTimeUntil('עכשיו!');
        } else {
          setTimeUntil(`בעוד ${diffMinutes} דקות`);
        }
      } else {
        setIsUpcoming(false);
        setIsOverdue(false);
        if (diffHours > 0) {
          setTimeUntil(`בעוד ${diffHours} שעות ו-${remainingMinutes} דקות`);
        } else {
          setTimeUntil(`בעוד ${diffMinutes} דקות`);
        }
      }
    };

    updateTimer();
  }, [task.id, task.timeLabel, currentTime, task.completed]); // Use stable dependencies

  if (task.completed) {
    return (
      <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
        <span>✅</span>
        <span>הושלם</span>
      </div>
    );
  }

  return (
    <div className={`text-xs font-semibold flex items-center gap-1 ${
      isOverdue 
        ? 'text-red-600 animate-pulse' 
        : isUpcoming 
        ? 'text-orange-600 animate-pulse' 
        : 'text-gray-600'
    }`}>
      <span className="text-sm">⏰</span>
      <span>{timeUntil}</span>
    </div>
  );
};

export default TaskTimer;

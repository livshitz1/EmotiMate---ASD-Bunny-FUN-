import { ScheduleItem } from '../types';
import { INITIAL_SCHEDULE } from '../constants';

/**
 * Reset schedule to start from morning tasks
 */
export const resetScheduleToMorning = (): ScheduleItem[] => {
  return INITIAL_SCHEDULE.map(task => ({
    ...task,
    completed: false,
    subTasks: task.subTasks?.map(subTask => ({
      ...subTask,
      completed: false
    }))
  }));
};

/**
 * Find the closest task to current time
 */
export const findClosestTask = (schedule: ScheduleItem[]): ScheduleItem | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  let closestTask: ScheduleItem | null = null;
  let minDiff = Infinity;

  schedule.forEach(task => {
    const [taskHour, taskMinute] = task.timeLabel.split(':').map(Number);
    const taskTimeMinutes = taskHour * 60 + taskMinute;
    
    // Calculate difference (considering next day if task time has passed)
    let diff = taskTimeMinutes - currentTimeMinutes;
    if (diff < 0) {
      diff += 24 * 60; // Add 24 hours if task already passed today
    }
    
    if (diff < minDiff && !task.completed) {
      minDiff = diff;
      closestTask = task;
    }
  });

  return closestTask;
};

/**
 * Get time until task in human-readable format
 */
export const getTimeUntilTask = (task: ScheduleItem, language: string): string => {
  const now = new Date();
  const [taskHour, taskMinute] = task.timeLabel.split(':').map(Number);
  const taskTime = new Date();
  taskTime.setHours(taskHour, taskMinute, 0, 0);
  
  if (taskTime < now) {
    taskTime.setDate(taskTime.getDate() + 1);
  }
  
  const diffMs = taskTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  
  if (language === 'he') {
    if (diffMinutes < 1) return 'עכשיו';
    if (diffMinutes < 60) return `בעוד ${diffMinutes} דקות`;
    if (remainingMinutes > 0) return `בעוד ${diffHours} שעות ו-${remainingMinutes} דקות`;
    return `בעוד ${diffHours} שעות`;
  } else if (language === 'en') {
    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `In ${diffMinutes} minutes`;
    if (remainingMinutes > 0) return `In ${diffHours} hours and ${remainingMinutes} minutes`;
    return `In ${diffHours} hours`;
  } else {
    if (diffMinutes < 1) return 'Сейчас';
    if (diffMinutes < 60) return `Через ${diffMinutes} минут`;
    if (remainingMinutes > 0) return `Через ${diffHours} часов и ${remainingMinutes} минут`;
    return `Через ${diffHours} часов`;
  }
};

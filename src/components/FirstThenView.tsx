import React from 'react';
import { ScheduleItem, Language } from '../types';
import VisualTimer from './VisualTimer';

interface FirstThenViewProps {
  currentTask: ScheduleItem | null;
  nextTask: ScheduleItem | null;
  currentTime: Date;
  language: Language;
}

const FirstThenView: React.FC<FirstThenViewProps> = ({ currentTask, nextTask, currentTime, language }) => {
  if (!currentTask) {
    return null;
  }

  const getTaskReward = (task: ScheduleItem): string => {
    if (task.points) {
      return language === Language.HEBREW 
        ? `${task.points} נקודות`
        : language === Language.ENGLISH
        ? `${task.points} points`
        : `${task.points} очков`;
    }
    return language === Language.HEBREW 
      ? 'השלמת המשימה'
      : language === Language.ENGLISH
      ? 'Task completion'
      : 'Завершение задачи';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {language === Language.HEBREW ? 'קודם - אחר כך' : language === Language.ENGLISH ? 'First - Then' : 'Сначала - Потом'}
      </h3>
      
      <div className="space-y-4">
        {/* First (Current Task) */}
        <div className="bg-white rounded-xl p-4 border-2 border-purple-400 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-purple-600">
              {language === Language.HEBREW ? 'קודם' : language === Language.ENGLISH ? 'First' : 'Сначала'}
            </span>
            <span className="text-3xl">{currentTask.icon}</span>
          </div>
          <h4 className="font-bold text-lg text-gray-800 mb-2">{currentTask.task}</h4>
          
          {/* Visual Timer for current task */}
          {!currentTask.completed && (
            <div className="mb-3">
              <VisualTimer task={currentTask} currentTime={currentTime} language={language} isActive={true} />
            </div>
          )}
          
          {currentTask.completed && (
            <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
              <span className="text-2xl">✓</span>
              <span>{language === Language.HEBREW ? 'הושלם!' : language === Language.ENGLISH ? 'Completed!' : 'Завершено!'}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            {language === Language.HEBREW 
              ? `זמן: ${currentTask.timeLabel}`
              : language === Language.ENGLISH
              ? `Time: ${currentTask.timeLabel}`
              : `Время: ${currentTask.timeLabel}`}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-4xl text-purple-500 animate-bounce">↓</div>
        </div>

        {/* Then (Next Task or Reward) */}
        <div className="bg-white rounded-xl p-4 border-2 border-yellow-400 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-yellow-600">
              {language === Language.HEBREW ? 'אחר כך' : language === Language.ENGLISH ? 'Then' : 'Потом'}
            </span>
            {nextTask ? (
              <span className="text-3xl">{nextTask.icon}</span>
            ) : (
              <span className="text-3xl">🎁</span>
            )}
          </div>
          
          {nextTask ? (
            <>
              <h4 className="font-bold text-lg text-gray-800 mb-2">{nextTask.task}</h4>
              <div className="text-sm text-gray-600">
                {language === Language.HEBREW 
                  ? `זמן: ${nextTask.timeLabel}`
                  : language === Language.ENGLISH
                  ? `Time: ${nextTask.timeLabel}`
                  : `Время: ${nextTask.timeLabel}`}
              </div>
            </>
          ) : (
            <>
              <h4 className="font-bold text-lg text-gray-800 mb-2">
                {language === Language.HEBREW 
                  ? `פרס: ${getTaskReward(currentTask)}`
                  : language === Language.ENGLISH
                  ? `Reward: ${getTaskReward(currentTask)}`
                  : `Награда: ${getTaskReward(currentTask)}`}
              </h4>
              <p className="text-sm text-gray-600">
                {language === Language.HEBREW 
                  ? 'אחרי שתסיים את המשימה הנוכחית, תקבל את הפרס!'
                  : language === Language.ENGLISH
                  ? 'After completing the current task, you\'ll get the reward!'
                  : 'После завершения текущей задачи вы получите награду!'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstThenView;
